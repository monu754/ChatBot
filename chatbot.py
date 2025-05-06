from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re  # Add for text cleaning

app = Flask(__name__)
CORS(app)

# Load the knowledge base into memory
knowledge_base = {}

def load_knowledge_base():
    global knowledge_base
    try:
        with open('knowledge_base.txt', 'r') as file:
            for line in file:
                if '|' in line:
                    question, answer = line.strip().split('|', 1)
                    knowledge_base[question.lower()] = answer
    except FileNotFoundError:
        print("knowledge_base.txt not found. Make sure the file exists.")

def clean_response(text):
    """
    Completely removes all AI thinking patterns and only returns the final response
    """
    # Remove ALL <think> patterns and their content (including nested ones)
    while '<think>' in text.lower() and '</think>' in text.lower():
        start = text.lower().find('<think>')
        end = text.lower().find('</think>') + len('</think>')
        text = text[:start] + text[end:]
    
    # Remove any remaining "Okay, I should..." intro patterns
    text = re.sub(r'(okay,?|alright,?)?\s*(i\s+(should|need|will|can)|let me|perhaps).*?[.,;]', '', text, flags=re.IGNORECASE)
    
    # Remove empty parentheses or brackets that might remain
    text = re.sub(r'[\[\(]\s*[\]\)]', '', text)
    
    # Clean up any resulting double spaces or odd punctuation
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'^[.,;]\s*', '', text)
    
    return text or "I'm here to help!"

def call_together_ai_api(user_message):
    try:
        api_url = "https://api.together.xyz/v1/chat/completions"
        api_key = os.getenv("TOGETHER_API_KEY")

        if not api_key:
            raise ValueError("TOGETHER_API_KEY environment variable is not set.")

        # Add system prompt to guide the response style
        messages = [
            {"role": "system", "content": "You are a helpful assistant. Provide concise answers under 3 sentences unless more detail is explicitly requested."},
            {"role": "user", "content": user_message}
        ]

        payload = {
    "model": "Qwen/Qwen3-235B-A22B-fp8-tput",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant. NEVER show your thinking process or reasoning. "
                      "ALWAYS respond with just the direct answer to the query. "
                      "For greetings, use exactly 1-3 words. "
                      "Never repeat the user's question back to them."
        },
        {"role": "user", "content": user_message}
    ],
    "max_tokens": 150
}

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        raw_response = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return clean_response(raw_response)
    except requests.exceptions.RequestException as e:
        print(f"Error calling Together.ai API: {e}")
        return "I'm having trouble connecting to the service."
    except ValueError as e:
        print(e)
        return "API configuration is missing."

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '').strip().lower()
    if not user_message:
        return jsonify({"response": "Please provide a valid message."})

    # Check knowledge base first
    if user_message in knowledge_base:
        return jsonify({"response": knowledge_base[user_message]})

    # Call API for unknown questions
    api_response = call_together_ai_api(user_message)
    return jsonify({"response": api_response})

if __name__ == '__main__':
    load_knowledge_base()
    app.run(port=5000, debug=True)