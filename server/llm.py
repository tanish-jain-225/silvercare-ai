from flask import Flask, request, jsonify
from together import Together
from twilio.rest import Client
import requests
import re
import json as pyjson
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
client = Together(api_key="tgp_v1_WSJUCyB6cAaCZff7oVSK30nK1rxEgSlqAWBHzYdipfM")

# Twilio credentials from environment
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

@app.route('/format-reminder', methods=['POST'])
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
                from datetime import datetime
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


@app.route('/send-emergency', methods=['POST'])
def send_emergency():
    data = request.get_json()
    contacts = data.get('contacts')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not contacts or not latitude or not longitude:
        return jsonify({"error": "Missing contacts or location data"}), 400

    location_url = f"https://maps.google.com/?q={latitude},{longitude}"
    message_body = f"🚨 Emergency Alert!\nThe user is at: {location_url}"

    results = []

    for number in contacts:
        try:
            msg = twilio_client.messages.create(
                body=message_body,
                from_='whatsapp:+14155238886',  # Twilio Sandbox Number
                to=f'whatsapp:{number}'
            )
            results.append({'to': number, 'sid': msg.sid})
        except Exception as e:
            results.append({'to': number, 'error': str(e)})

    return jsonify({"message": "WhatsApp emergency messages processed", "results": results})


if __name__ == '__main__':
    app.run(port=8000, debug=True)
