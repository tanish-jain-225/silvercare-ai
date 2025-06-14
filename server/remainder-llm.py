# Use flask to create a simple LLM server that uses Together's API to generate responses.
from flask import Flask, request, jsonify
from together import Together


client = Together(api_key="tgp_v1_WSJUCyB6cAaCZff7oVSK30nK1rxEgSlqAWBHzYdipfM") 

response = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V3",
    messages=[
      {
        "role": "user",
        "content": "What are some fun things to do in New York?"
      }
    ]
)
print(response.choices[0].message.content)
