from flask import Flask, request, jsonify
from flask_cors import CORS

import random
import string
import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import warnings
warnings.filterwarnings('ignore')

# Initialize chatbot data
with open('chatbot.txt', 'r', encoding='utf8', errors='ignore') as fin:
    raw = fin.read().lower()

sent_tokens = nltk.sent_tokenize(raw)
word_tokens = nltk.word_tokenize(raw)

lemmer = WordNetLemmatizer()
remove_punct_dict = dict((ord(punct), None) for punct in string.punctuation)

def LemTokens(tokens):
    return [lemmer.lemmatize(token) for token in tokens]

def LemNormalize(text):
    return LemTokens(nltk.word_tokenize(text.lower().translate(remove_punct_dict)))

GREETING_INPUTS = ("hello", "hi", "greetings", "sup", "what's up", "hey")
GREETING_RESPONSES = ["hi", "hey", "*nods*", "hi there", "hello", "I'm glad you're talking to me!"]

def greeting(sentence):
    for word in sentence.split():
        if word.lower() in GREETING_INPUTS:
            return random.choice(GREETING_RESPONSES)

def get_response(user_response):
    if "who are you" in user_response:
        return "I'm an AI chatbot and here to help you"
    if "What are you" in user_response:
        return "I'm an AI chatbot and here to help you"
    if "how are you" in user_response:
        return "I'm fine, what about you?"
    if "what is ai" in user_response:
        return "AI stands for Artificial Intelligence, where machines are made to simulate human intelligence."


    robo_response = ''
    sent_tokens.append(user_response)
    TfidfVec = TfidfVectorizer(tokenizer=LemNormalize, stop_words='english')
    tfidf = TfidfVec.fit_transform(sent_tokens)
    vals = cosine_similarity(tfidf[-1], tfidf)
    idx = vals.argsort()[0][-2]
    flat = vals.flatten()
    flat.sort()
    req_tfidf = flat[-2]

    if req_tfidf == 0:
        robo_response = "I am sorry! I don't understand you"
    else:
        robo_response = sent_tokens[idx]
    sent_tokens.remove(user_response)
    return robo_response

# Flask Setup
app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "").lower()

    if user_input in ['bye', 'exit']:
        return jsonify({"reply": "Bye! Take care."})
    if user_input in ['thanks', 'thank you']:
        return jsonify({"reply": "You're welcome!"})

    if greeting(user_input):
        reply = greeting(user_input)
    else:
        reply = get_response(user_input)

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)
