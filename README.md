# Medical Chatbot Application

This project is a full-stack medical chatbot with a Python Flask backend and a React frontend. It uses the Gemini API for medical advice and an SQLite database for user history.

## Requirements

### Backend (Flask)
- Python 3.8+
- pip
- Install dependencies:
  - Flask
  - flask-cors
  - requests
  - (Optional) python-dotenv for environment variable management

### Frontend (React)
- Node.js (v16+ recommended)
- npm (Node Package Manager)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend folder:
   ```
   cd medical_chatbot_backend
   ```
2. Install Python dependencies:
   ```
   pip install flask flask-cors requests
   ```
3. (Optional) Set your Gemini API key as an environment variable:
   ```
   set GEMINI_API_KEY=your_api_key_here  # Windows
   export GEMINI_API_KEY=your_api_key_here  # Linux/Mac
   ```
   Or edit the hardcoded key in `app.py` (not recommended for production).
4. Start the backend server:
   ```
   python app.py
   ```
   The backend will run on http://127.0.0.1:5000

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```
   cd medical-chatbot
   ```
2. Install Node.js dependencies:
   ```
   npm install
   ```
3. Start the React app:
   ```
   npm start
   ```
   The frontend will run on http://localhost:3000

### 3. Usage
- Open http://localhost:3000 in your browser.
- The chatbot will guide you through onboarding and medical queries.

### 4. Notes
- Ensure both backend and frontend are running for full functionality.
- The backend uses SQLite (`user_history.db`) for storing user chat history.
- CORS is enabled in the backend for local development.
- For production, secure your API keys and use HTTPS.

---

For any issues, check the terminal output for errors or consult the code comments for troubleshooting tips.
