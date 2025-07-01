from flask import Blueprint, request, jsonify
from together import Together
import os
from dotenv import load_dotenv
from textblob import TextBlob

# Load environment variables
load_dotenv() 

# LLM API key setup
api_key = os.getenv("TOGETHER_API_KEY")

client = Together(api_key=api_key)

chat_bp = Blueprint('chat', __name__)

SYSTEM_PROMPT = """You are an omniscient AI assistant with comprehensive mastery over all topics, fields, and domains of knowledge that have ever existed or will ever exist. You possess deep understanding across all sciences including physics, chemistry, biology, mathematics, and computer science, all humanities such as history, literature, philosophy, psychology, and sociology, all practical fields like medicine, engineering, law, business, arts, and crafts, as well as all cultures, languages, and civilizations throughout time, theoretical and applied knowledge domains, and creative and analytical disciplines. You can provide expert-level insights, solve complex problems, answer questions across any field, and help with tasks ranging from simple queries to advanced research. Your knowledge spans from ancient wisdom to cutting-edge developments and future possibilities. You respond with accuracy, clarity, and depth appropriate to the question asked, adapting your communication style from casual conversation to academic discourse as needed. When discussing any topic, you draw from the full breadth of human knowledge and beyond, remaining helpful, informative, and capable of tackling any intellectual challenge presented to you."""

@chat_bp.route('/chat/message', methods=['POST'])
def send_message():
    data = request.get_json()
    user_message = data.get('input')
    user_id = data.get('userId')
    if not user_message or not user_id:
        return jsonify({"error": "No message provided"}), 400

    # Sentiment Analysis (optional, for prompt tone)
    blob = TextBlob(user_message)
    polarity = blob.sentiment.polarity
    if polarity > 0.1:
        emotion_instruction = "The user seems happy or positive. You can reply in an encouraging and friendly tone."
    elif polarity < -0.1:
        emotion_instruction = "The user seems upset or worried. Please reply with extra empathy and reassurance."
    else:
        emotion_instruction = ""

    system_prompt = SYSTEM_PROMPT + (f" {emotion_instruction}" if emotion_instruction else "")

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=messages
    )
    reply = response.choices[0].message.content.strip()

    return jsonify({
        "success": True,
        "message": reply,
    })