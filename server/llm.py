from flask import Flask, request, jsonify
from together import Together
import requests
import re
import json as pyjson

app = Flask(__name__)

client = Together(api_key="tgp_v1_WSJUCyB6cAaCZff7oVSK30nK1rxEgSlqAWBHzYdipfM")


@app.route('/format-reminder', methods=['POST'])
def format_reminder():
    user_input = request.json.get('input', '')
    # Ensure we have input to process
    if not user_input:
        return jsonify({"error": "No input provided. Please send JSON with 'input' field."}), 400
        
    # Instruct the LLM to format the input as a reminder with title, date, time
    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=[
            {
                "role": "system",
                "content": "Format user input as a reminder. Extract title, date, and time. Always return valid JSON with id, title, date, and time fields. Date should be in YYYY-MM-DD format. Time should be in HH:MM format."
            },
            {
                "role": "user",
                "content": f'Parse this into a reminder: {user_input}'
            }
        ]
    )
    content = response.choices[0].message.content
    # Extract JSON from the LLM response
    match = re.search(r'\{[\s\S]*\}', content)
    if match:
        try:
            reminder_json = pyjson.loads(match.group())
            # Ensure the JSON matches the backend format with all required fields
            id = reminder_json.get('id') or str(hash(user_input))
            title = reminder_json.get('title')
            date = reminder_json.get('date')
            time = reminder_json.get('time')
            
            # Validate required fields
            if not title:
                return jsonify({"error": "Missing title in parsed reminder"}), 400
            if not date:
                return jsonify({"error": "Missing date in parsed reminder"}), 400
            if not time:
                return jsonify({"error": "Missing time in parsed reminder"}), 400
                
            post_data = {"id": id, "title": title, "date": date, "time": time}
            print(f"Posting to reminder endpoint: {post_data}")
            # r = requests.post("http://localhost:5000/reminder", json=post_data) # To frontend
            return jsonify({"reminder": post_data})
        except Exception as e:
            return jsonify({"error": "Failed to parse or post JSON", "details": str(e), "raw": content}), 400
    return jsonify({"error": "No JSON found in LLM response", "raw": content}), 400


if __name__ == '__main__':
    app.run(port=8000, debug=True)
