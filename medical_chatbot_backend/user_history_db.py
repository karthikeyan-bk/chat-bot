import sqlite3
from datetime import datetime

DB_PATH = "user_history.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            symptom TEXT NOT NULL,
            message TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def add_user_message(user_id, symptom, message):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO user_history (user_id, symptom, message, date)
        VALUES (?, ?, ?, ?)
    ''', (user_id, symptom, message, datetime.now().strftime('%Y-%m-%d')))
    conn.commit()
    conn.close()

def get_symptom_days(user_id, symptom):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        SELECT DISTINCT date FROM user_history WHERE user_id=? AND symptom=?
    ''', (user_id, symptom))
    days = c.fetchall()
    conn.close()
    return len(days)
