from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from together import Together
import os
from dotenv import load_dotenv

load_dotenv()
# MongoDB connection
mongo_url = os.getenv("MONGO_URI")
if not mongo_url:
    raise RuntimeError("MONGO_URI (or MONGO_URL) environment variable is required")
mongo_client = MongoClient(mongo_url)
# Optional collection override via env
db_name = os.getenv("DB_NAME", "assistant_db")
collection_name = os.getenv("CHAT_COLLECTION", "chat_history")
db = mongo_client[db_name]
collection = db[collection_name]

# LLM client
api_key = os.getenv("TOGETHER_API_KEY")
if not api_key:
    raise RuntimeError("TOGETHER_API_KEY environment variable is required")
client = Together(api_key=api_key)

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
    system_prompt="""You are a compassionate and knowledgeable virtual health assistant. Your primary role is to help patients, especially elderly users, understand their medical concerns in a simple, calm, and reassuring way.
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

    chat_history = history_doc["history"] if history_doc else [
        {"role": "system", "content": system_prompt}
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

