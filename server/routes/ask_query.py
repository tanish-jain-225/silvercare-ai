from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import requests
from together import Together
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")
if not mongo_url:
    print("WARNING: No MONGO_URI/MONGO_URL set; defaulting to localhost:27017")
    mongo_url = "mongodb://localhost:27017"
mongo_client = MongoClient(mongo_url)

# Database and collection setup
db_name = os.getenv("DB_NAME", "assistant_db")
collection_name = os.getenv("CHAT_COLLECTION", "chat_history")
db = mongo_client[db_name]
collection = db[collection_name]

# LLM API key setup
api_key = os.getenv("TOGETHER_API_KEY")
if not api_key:
    print("WARNING: No TOGETHER_API_KEY set; using default demo key")
    api_key = "tgp_v1_WSJUCyB6cAaCZff7oVSK30nK1rxEgSlqAWBHzYdipfM"
client = Together(api_key=api_key)

chat_bp = Blueprint('chat', __name__)

# Dynamic system prompt (injected at inference time only)
SYSTEM_PROMPT = """You are a compassionate and knowledgeable virtual health assistant. Your primary role is to help patients, especially elderly users, understand their medical concerns in a simple, calm, and reassuring way.
Speak slowly and clearly using plain, everyday language — no medical jargon unless it's explained.
Keep your answers highly concise and to the point, ideally under 100 words.
Always answer in a warm, conversational tone like you're gently explaining something to a grandparent.
Answer in simple language and don't complicate things.
Your response will be read out loud, so avoid formatting like bullet points, markdown, or symbols.
Instead of saying "As an AI...", speak naturally as a helpful assistant.
If the question involves a serious condition, suggest they speak with their doctor, but still give a helpful summary they can understand.
Examples:
Instead of "Hypertension", say "high blood pressure"
Instead of "Type 2 Diabetes", say "a kind of diabetes that often happens with age"
Do not include links or suggest websites. Just speak directly and clearly."""

@chat_bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    user_id = request.args.get("userId", default="default")
    history_doc = collection.find_one({"userId": user_id})

    if not history_doc or "history" not in history_doc:
        return jsonify({"history": []})

    # Only return messages from the last 24 hours
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_history = [
        msg for msg in history_doc["history"]
        if msg.get("createdAt") and datetime.fromisoformat(msg["createdAt"]) > twenty_four_hours_ago
    ]

    return jsonify({"history": recent_history})

@chat_bp.route('/chat/message', methods=['POST'])
def send_message():
    data = request.get_json()
    user_message = data.get('input')
    user_id = data.get('userId')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Fetch user chat history
    history_doc = collection.find_one({"userId": user_id})
    history = history_doc.get("history", []) if history_doc else []

    # Append current user message
    user_msg = {
        "role": "user",
        "content": user_message,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    history.append(user_msg)

    # Build full prompt for the LLM (include dynamic system prompt at the top)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + [
        {"role": msg["role"], "content": msg["content"]} for msg in history
    ]

    # Get assistant reply
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=messages
    )
    reply = response.choices[0].message.content.strip()

    # Append assistant response
    assistant_msg = {
        "role": "assistant",
        "content": reply,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    history.append(assistant_msg)

    # Save updated history (excluding system prompt)
    collection.update_one(
        {"userId": user_id},
        {"$set": {"history": history}},
        upsert=True
    )

    if "remind" in user_message.lower() or "reminder" in user_message.lower():
        try:
            reminder_resp = requests.post(
                "http://localhost:8000/format-reminder",  # or full URL if hosted remotely
                json={"input": user_message},
                timeout=5
            )
            reminder_data = reminder_resp.json()
            if reminder_resp.status_code == 200 and reminder_data.get("success"):
                reply += "\n\nI've also set a reminder for you."
            elif "reminder" in user_message.lower():
                reply += "\n\nI tried setting a reminder, but there was a problem. Please check the date or time."

        except Exception as e:
            print(f"Reminder API error: {e}")
            reply += "\n\nI couldn't set the reminder right now due to a technical issue."

    return jsonify({
        "reply": reply,
        "history": history
    })
