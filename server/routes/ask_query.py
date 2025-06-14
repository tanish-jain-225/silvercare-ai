from flask import Blueprint, request, jsonify
from together import Together
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = Together(api_key=os.getenv("TOGETHER_API_KEY", "tgp_v1_WSJUCyB6cAaCZff7oVSK30nK1rxEgSlqAWBHzYdipfM"))

chat_bp = Blueprint('chat', __name__)

# Shared in-memory chat history
chat_history = [
    {"role": "system", "content": "You are a helpful assistant. Answer clearly and concisely."}
]

@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Add user message to chat history
    chat_history.append({"role": "user", "content": user_message})

    # Send full conversation to LLM
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=chat_history
    )

    reply = response.choices[0].message.content.strip()

    # Add assistant reply to chat history
    chat_history.append({"role": "assistant", "content": reply})

    return jsonify({
        "reply": reply,
        "history": chat_history[-4:]  # return last 4 exchanges (optional)
    })
