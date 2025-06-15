from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from together import Together
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

load_dotenv()

# Setup MongoDB client and collection
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["assistant_db"]
collection = db["chat_history"]

# LLM client
client = Together(api_key=os.getenv("TOGETHER_API_KEY"))

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    user_id = request.args.get("userId", default="default")
    history_doc = collection.find_one({"userId": user_id})

    if not history_doc or "history" not in history_doc:
        return jsonify({"history": []})

    # Get only chats from the last 24 hours
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)

    recent_history = [
        msg for msg in history_doc["history"][1:]  # Skip system prompt
        if msg.get("createdAt") and datetime.fromisoformat(msg["createdAt"]) > twenty_four_hours_ago
    ]

    return jsonify({"history": recent_history})


@chat_bp.route('/chat/message', methods=['POST'])
def send_message():
    data = request.get_json()
    user_message = data.get('message')
    user_id = data.get('userId')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Define the assistant's tone and behavior
    system_prompt = """You are a compassionate and knowledgeable virtual health assistant. Your primary role is to help patients, especially elderly users, understand their medical concerns in a simple, calm, and reassuring way.
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

    # Load or initialize chat history
    history_doc = collection.find_one({"userId": user_id})
    chat_history = history_doc["history"] if history_doc else [
        {
            "role": "system",
            "content": system_prompt,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]

    # Append user's message
    user_msg = {
        "role": "user",
        "content": user_message,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    chat_history.append(user_msg)

    # Generate assistant's reply from LLM
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=chat_history
    )
    reply = response.choices[0].message.content.strip()


    assistant_msg = {
        "role": "assistant",
        "content": reply,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    chat_history.append(assistant_msg)


    collection.update_one(
        {"userId": user_id},
        {"$set": {"history": chat_history}},
        upsert=True
    )

    return jsonify({
        "reply": reply,
        "history": chat_history[1:]  # Exclude the system prompt
    })
