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

SYSTEM_PROMPT = """You are a compassionate and knowledgeable virtual health assistant. Your primary role is to help patients, especially elderly users, understand their medical concerns in a simple, calm and reassuring way.
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