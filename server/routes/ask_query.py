from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import requests
from together import Together
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from bson import ObjectId

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")
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

@chat_bp.route('/chat/list', methods=['GET'])
def get_chat_list():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        chats = list(collection.find(
            {"userId": user_id},
            {"_id": 1, "createdAt": 1, "updatedAt": 1}
        ))
        # Convert ObjectId to string for JSON serialization
        chat_list = [
            {
                "chatId": str(chat["_id"]),
                "createdAt": chat.get("createdAt"),
                "updatedAt": chat.get("updatedAt"),
            }
            for chat in chats
        ]
        return jsonify({"chats": chat_list}), 200
    except Exception as e:
        print(f"Error fetching chat list: {str(e)}")
        return jsonify({"error": "Failed to fetch chat list", "details": str(e)}), 500
    
@chat_bp.route('/chat/new', methods=['POST'])
def create_new_chat():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        now = datetime.now(timezone.utc).isoformat()

        chat_doc = {
            "userId": user_id,
            "history": [],
            "createdAt": now,
            "updatedAt": now
        }
        result = collection.insert_one(chat_doc)
        chat_id = str(result.inserted_id)  # Use MongoDB ObjectId as chatId
        return jsonify({"chatId": chat_id})
    except Exception as e:
        print(f"Error creating new chat: {str(e)}")
        return jsonify({"error": "Failed to create new chat", "details": str(e)}), 500

@chat_bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    user_id = request.args.get("userId")
    chat_id = request.args.get("chatId")
    history_doc = collection.find_one({"userId": user_id, "_id": ObjectId(chat_id)})

    if not history_doc or "history" not in history_doc:
        return jsonify({"history": []})

    # Only return messages from the last 24 hours
    twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_history = []
    for msg in history_doc["history"]:
        created_at = msg.get("createdAt")
        if created_at:
            try:
                dt = datetime.fromisoformat(created_at)
                # If dt is naive, make it UTC
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                if dt > twenty_four_hours_ago:
                    recent_history.append(msg)
            except Exception as e:
                # If parsing fails, skip this message
                continue
    return jsonify({"history": recent_history})

@chat_bp.route('/chat/message', methods=['POST'])
def send_message():
    data = request.get_json()
    user_message = data.get('input')
    user_id = data.get('userId')
    chat_id = data.get('chatId')
    language = data.get('language')

    if not user_message or not chat_id:
        return jsonify({"error": "No message provided"}), 400

    # Fetch user chat history
    history_doc = collection.find_one({"userId": user_id, "_id": ObjectId(chat_id)})
    history = history_doc.get("history", []) if history_doc else []

    # Append current user message
    user_msg = {
        "role": "user",
        "content": user_message,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    history.append(user_msg)

    # Build full prompt for the LLM (include dynamic system prompt at the top)
    messages = [{"role": "system", "content": SYSTEM_PROMPT + f"Answer in {language} language"}] + [
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
    if history_doc:
        collection.update_one(
            {"userId": user_id},
            {"$set": {"history": history}},
            upsert=True
        )
    else:
        collection.insert_one({"userId": user_id, "history": history})

    return jsonify({
        "success": True,
        "message": reply,
    })

@chat_bp.route('/chat/clear', methods=['DELETE'])
def clear_chat_history():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        chat_id = data.get('chatId')
        
        if not user_id or not chat_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Delete the user's chat history from MongoDB
        result = collection.delete_one({"userId": user_id, "_id": ObjectId(chat_id)})
        
        if result.deleted_count > 0:
            return jsonify({
                "success": True,
                "message": "Chat history cleared successfully"
            }), 200
        else:
            return jsonify({
                "success": True,
                "message": "No chat history found to clear"
            }), 200
            
    except Exception as e:
        print(f"Error clearing chat history: {str(e)}")
        return jsonify({
            "error": "Failed to clear chat history",
            "details": str(e)
        }), 500
