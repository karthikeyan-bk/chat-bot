
import React, { useState, createContext, useContext } from 'react';
// import { sendMessageToAPI } from '../services/api';

export const ChatContext = createContext();


const InputBox = () => {
	const [input, setInput] = useState("");
	const { loading, handleSend, conversationEnded } = useContext(ChatContext);


	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSend(input);
			setInput("");
		}
	};

	return (
		<div className="input-area">
			<input
				type="text"
				placeholder={conversationEnded ? "Conversation ended." : "Type your message..."}
				value={input}
				onChange={e => setInput(e.target.value)}
				onKeyPress={handleKeyPress}
				disabled={loading || conversationEnded}
			/>
			<button onClick={() => { handleSend(input); setInput(""); }} disabled={loading || conversationEnded}>➤</button>
		</div>
	);
};

export default InputBox;
