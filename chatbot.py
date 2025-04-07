import io
import random
import string
import warnings
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings
warnings.filterwarnings('ignore')

import nltk 
from nltk.stem import WordNetLemmatizer

with open('chatbot.txt','r', encoding='utf8', errors ='ignore') as fin:
    raw = fin.read().lower()

sent_tokens = nltk.sent_tokenize(raw)
word_tokens = nltk.word_tokenize(raw)

lemmer = WordNetLemmatizer()

def LemTokens(tokens):
    return [lemmer.lemmatize(token) for token in tokens]
remove_punct_dict = dict((ord(punct), None) for punct in string.punctuation)

def LemNormalize(text):
    return LemTokens(nltk.word_tokenize(text.lower().translate(remove_punct_dict)))

GREETING_INPUTS = ("hello", "hi", "greetings", "sup", "what's up", "hey")
GREETING_RESPONSES = ["hi", "hey", "*nods*", "hi there", "hello", "I am glad! You are talking to me"]

def greeting(sentence):
    for word in sentence.split():
        if word.lower() in GREETING_INPUTS:
            return random.choice(GREETING_RESPONSES)

def response(user_response):
    if "who are you" in user_response:
        return "I'm an AI chatbot and here to help you"
    if "how are you" in user_response:
        return "I'm fine, what about you?"

    robo_response=''
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

flag = True
print("ROBO: My name is Robo. I will answer your queries about Chatbots. If you want to exit, type Bye!")

while flag:
    user_response = input().lower()
    if user_response != 'bye':
        if user_response in ['thanks','Thanks','Thank you','Thank You' 'thank you']:
            flag = False
            print("ROBO: You are welcome..")
        else:
            if greeting(user_response) is not None:
                print("ROBO: " + greeting(user_response))
            else:
                print("ROBO: " + response(user_response))
    else:
        flag = False
        print("ROBO: Bye! Take care..")
