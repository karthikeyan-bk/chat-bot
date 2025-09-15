import sqlite3

DB_PATH = "user_history.db"

def print_all_history():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, user_id, symptom, message, date FROM user_history")
    rows = c.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, User: {row[1]}, Symptom: {row[2]}, Message: {row[3]}, Date: {row[4]}")
    conn.close()

def add_manual_history():
    import sqlite3
    DB_PATH = "user_history.db"
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO user_history (user_id, symptom, message, date) VALUES (?, ?, ?, ?)''', ("karthi", "fever", "manual entry", "2025-09-13"))
    c.execute('''INSERT INTO user_history (user_id, symptom, message, date) VALUES (?, ?, ?, ?)''', ("karthi", "cold", "manual entry", "2025-09-14"))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    add_manual_history()
    print_all_history()
