from flask import Blueprint, request, jsonify
from twilio.rest import Client
import os

send_emergency_bp = Blueprint('send_emergency', __name__)

twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

@send_emergency_bp.route('/send-emergency', methods=['POST'])
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
