from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from together import Together
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
    user_id = request.args.get("userId", default="default") #To be changed on production level
    history_doc = collection.find_one({"userId": user_id})
    chat_history = history_doc["history"][1:] if history_doc else []
    return jsonify({"history": chat_history})


@chat_bp.route('/chat/message', methods=['POST'])
def send_message():
    data = request.get_json()
    user_message = data.get('message')
    user_id = data.get('userId')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Load or init chat history
    history_doc = collection.find_one({"userId": user_id})
    chat_history = history_doc["history"] if history_doc else [
        {"role": "system", "content": "You are a medical assistant. Answer clearly and concisely. If its nothing related to health then humbly inform that to user"}
    ]

    # Append user message
    chat_history.append({"role": "user", "content": user_message})

    # Get response from LLM
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=chat_history
    )
    reply = response.choices[0].message.content.strip()

    # Append assistant message
    chat_history.append({"role": "assistant", "content": reply})

    # Update DB
    collection.update_one(
        {"userId": user_id},
        {"$set": {"history": chat_history}},
        upsert=True
    )

    return jsonify({
        "reply": reply,
        "history": chat_history[1:]  # exclude system message
    })

