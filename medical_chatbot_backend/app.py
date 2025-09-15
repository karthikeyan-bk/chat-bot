from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from user_history_db import init_db, add_user_message, get_symptom_days


app = Flask(__name__)
CORS(app)
init_db()


# Load your Gemini API key from environment, fallback to hardcoded key (not recommended for production)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyClwS-VYDIphejhLigGHRtVx44EnUUXmeA"

# Gemini API endpoint (Gemini Pro)
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# Function to call Gemini API (Gemini Pro)
def get_gemini_response(user_message, user_id, symptom, day_count, history=None):
    headers = {"Content-Type": "application/json"}
    # Compose a more context-aware prompt
    instruction = (
        "You are a helpful medical assistant. Only answer about symptoms, health, and medicines. "
        "If the user has a history of the same symptom, use the number of days (day_count) to give progressive advice: "
        "- Day 1: Suggest home remedies and monitoring. "
        "- Day 2: Advise continued monitoring and possible over-the-counter options. "
        "- Day 3 or more: Recommend seeing a doctor or pediatrician, especially for children. "
        "Always consider the user's age and the severity (if provided) when giving advice. "
        "If the user is a child, be extra cautious and recommend a pediatrician if symptoms persist. "
        "If severity is 8 or above, recommend urgent medical attention. "
        "Reply in 2-3 sentences. Be brief and to the point."
    )
    history_text = ""
    if history:
        history_text = "\nRecent user history:\n" + "\n".join(f"- {msg}" for msg in history)
    full_message = f"{instruction}{history_text}\nUser message: {user_message}"
    payload = {
        "contents": [
            {"parts": [{"text": full_message}]}
        ]
    }
    try:
        resp = requests.post(GEMINI_API_URL, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print("Error calling Gemini API:", e)
        return "⚠️ Sorry, I couldn't get a response right now."
@app.route("/chat", methods=["POST"])
def chat():
    user_data = request.json
    user_message = user_data.get("message", "")
    user_id = user_data.get("user_id", "anonymous")
    symptom = user_data.get("symptom", "general")
    age = user_data.get("age", None)
    # If the message is clearly not medical (greeting, thanks, etc.), handle or ignore

    greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    # No special response for greetings; proceed to name/age extraction and normal flow

    # Check if user provided name and age in the message (more flexible)
    import re
    name = None
    age = None
    # Try to extract name and age from common patterns (case-insensitive)
    name = None
    age = None
    # Pattern: "I am John, 25" or "My name is John, 25 years old"
    combo_patterns = [
        r"my name is ([a-zA-Z ]+)[, ]+(\d{1,3})",
        r"i am ([a-zA-Z ]+)[, ]+(\d{1,3})",
        r"this is ([a-zA-Z ]+)[, ]+(\d{1,3})",
        r"([a-zA-Z ]+)[, ]+(\d{1,3})$"
    ]
    for pat in combo_patterns:
        m = re.search(pat, user_message, re.IGNORECASE)
        if m:
            name = m.group(1).strip().title()
            try:
                age = int(m.group(2))
            except:
                age = None
            break
    # If not found, try to extract name only
    if not name:
        name_patterns = [
            r"my name is ([a-zA-Z ]+)",
            r"i am ([a-zA-Z ]+)",
            r"this is ([a-zA-Z ]+)",
            r"name[:=]? ([a-zA-Z ]+)"
        ]
        for pat in name_patterns:
            m = re.search(pat, user_message, re.IGNORECASE)
            if m:
                name = m.group(1).strip().title()
                break
    # Try to extract age only
    if not age:
        age_patterns = [
            r"i am (\d{1,3}) ?(years? old|yrs? old|yrs?|years?)?",
            r"age[:=]? ?(\d{1,3})",
            r"(\d{1,3}) ?(years? old|yrs? old|yrs?|years?)"
        ]
        for pat in age_patterns:
            m = re.search(pat, user_message, re.IGNORECASE)
            if m:
                try:
                    age = int(m.group(1))
                except:
                    continue
                break
    # Removed onboarding response for name and age; continue to normal flow

    non_medical_keywords = ["weather", "news", "joke", "music", "movie", "sports", "game", "politics", "stock", "finance", "love", "relationship", "friend", "family", "school", "college", "work", "job", "career", "travel", "holiday", "vacation"]
    if any(word in user_message.lower() for word in non_medical_keywords):
        return jsonify({"reply": "Sorry, I can only answer questions about medical symptoms, health, or medicines."})

    # If user message is generic (like 'symptoms'), prompt for specific symptom
    generic_symptom_words = ["symptom", "symptoms", "problem", "issue", "sick", "ill"]
    if any(word in user_message.lower() for word in generic_symptom_words):
        return jsonify({"reply": "Please specify your symptom or medical concern (e.g., fever, cold, cough, stomach pain, etc.)."})

    # Otherwise, treat any message as a medical concern
    # Use the first 3 words of the message as the 'symptom' for tracking
    words = user_message.lower().split()
    if len(words) >= 3:
        symptom = ' '.join(words[:3])
    elif len(words) > 0:
        symptom = words[0]
    else:
        symptom = 'general'
    # Store user message in DB
    add_user_message(user_id, symptom, user_message)
    # Get how many days this symptom has been reported
    day_count = get_symptom_days(user_id, symptom)
    # Get recent user history (last 3 messages for this user)
    import sqlite3
    conn = sqlite3.connect("user_history.db")
    c = conn.cursor()
    c.execute("SELECT message FROM user_history WHERE user_id=? ORDER BY id DESC LIMIT 3", (user_id,))
    history = [row[0] for row in c.fetchall() if row[0] != user_message]
    conn.close()
    # Pass age to Gemini prompt by appending to user_message if available
    if age:
        user_message_with_age = f"(User age: {age}) {user_message}"
    else:
        user_message_with_age = user_message
    reply = get_gemini_response(user_message_with_age, user_id, symptom, day_count, history)
    return jsonify({"reply": reply})


# Run server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
