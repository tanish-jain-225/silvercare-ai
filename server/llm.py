# Use flask to create a simple LLM server that uses Together's API to generate responses.
from flask import Flask, request, jsonify
from together import Together

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    user_message = data.get('message', '')

    client = Together(api_key="tgp_v1_WSJUCyB6cAaCZff7oVSK30nK1rxEgSlqAWBHzYdipfM") 

    response = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3",
        messages=[
            {
                "role": "user",
                "content": user_message
            }
        ]
    )

    return jsonify({
        'response': response.choices[0].message.content
    })