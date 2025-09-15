

import React, { useState } from 'react';
import ChatBox from '../components/ChatBox';
import InputBox from '../components/InputBox';
import { sendMessageToAPI } from '../services/api';

const SYMPTOMS = [
	"fever", "cold", "cough", "headache", "sore throat", "body pain", "flu", "chills", "runny nose", "fatigue", "sneezing", "vomiting", "diarrhea", "pain", "infection"
];

const ChatPage = () => {
	const [messages, setMessages] = useState([
		{ sender: "bot", text: "Hello 👋 I am your medical assistant. What is your name and age?" }
	]);
	const [name, setName] = useState("");
	const [age, setAge] = useState("");
	const [collectingInfo, setCollectingInfo] = useState(true);
	const [selectedSymptom, setSelectedSymptom] = useState(SYMPTOMS[0]);

	const handleInfoSubmit = (e) => {
		e.preventDefault();
		if (name.trim() && age.trim()) {
			setMessages(prev => [
				...prev,
				{ sender: "user", text: `My name is ${name} and my age is ${age}` },
				{ sender: "bot", text: `Hi ${name}! What is your problem or symptoms?` }
			]);
			setCollectingInfo(false);
		}
	};

	const handleSend = async (text) => {
		const newMessage = { sender: "user", text };
		setMessages(prev => [...prev, newMessage]);

		const botResponse = await sendMessageToAPI(text, name, age, selectedSymptom);
		setMessages(prev => [...prev, { sender: "bot", text: botResponse }]);
	};

	return (
		<div className="chat-container">
			<ChatBox messages={messages} />
			{collectingInfo ? (
				<form className="user-info-form" onSubmit={handleInfoSubmit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
					<input
						type="text"
						placeholder="Enter your name"
						value={name}
						onChange={e => setName(e.target.value)}
						required
					/>
					<input
						type="number"
						placeholder="Enter your age"
						value={age}
						onChange={e => setAge(e.target.value)}
						required
						min="1"
					/>
					<button type="submit">Start Chat</button>
				</form>
			) : (
				<>
					<div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
						<label htmlFor="symptom-select">Symptom:</label>
						<select
							id="symptom-select"
							value={selectedSymptom}
							onChange={e => setSelectedSymptom(e.target.value)}
						>
							{SYMPTOMS.map(sym => (
								<option key={sym} value={sym}>{sym}</option>
							))}
						</select>
					</div>
					<InputBox onSend={handleSend} />
				</>
			)}
		</div>
	);
};

export default ChatPage;
