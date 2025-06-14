from flask import Blueprint, request, jsonify
from together import Together
import re
import json as pyjson
from datetime import datetime
import os

client = Together(api_key=os.getenv("TOGETHER_API_KEY", "tgp_v1_WSJUCyB6cAaCZff7oVSK30nK1rxEgSlqAWBHzYdipfM"))

format_reminder_bp = Blueprint('format_reminder', __name__)

@format_reminder_bp.route('/format-reminder', methods=['POST'])
def format_reminder():
    user_input = request.json.get('input', '')
    if not user_input:
        return jsonify({"error": "No input provided. Please send JSON with 'input' field."}), 400

    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=[
            {
                "role": "system",
                "content": "Format user input as a reminder. Extract title, date, and time. Always return valid JSON with id, title, date, and time fields. If date is not mentioned, make it null. If title is not mentioned, make it null. Time should be in HH:MM format."
            },
            {
                "role": "user",
                "content": f'Parse this into a reminder: {user_input}'
            }
        ]
    )
    content = response.choices[0].message.content
    match = re.search(r'\{[\s\S]*\}', content)
    if match:
        try:
            reminder_json = pyjson.loads(match.group())
            id = reminder_json.get('id') or str(hash(user_input))
            title = reminder_json.get('title') or 'New Reminder'
            date = reminder_json.get('date')
            time = reminder_json.get('time')

            # If date is missing, use today's date
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            if not title:
                title = 'New Reminder'

            if not time:
                return jsonify({"error": "Missing time in parsed reminder"}), 400

            post_data = {"id": id, "title": title, "date": date, "time": time}
            return jsonify({"reminder": post_data})
        except Exception as e:
            return jsonify({"error": "Failed to parse or post JSON", "details": str(e), "raw": content}), 400
    return jsonify({"error": "No JSON found in LLM response", "raw": content}), 400
