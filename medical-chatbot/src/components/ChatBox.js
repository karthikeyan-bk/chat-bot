import React, { useContext } from 'react';
import Message from './Message';
import { ChatContext } from './InputBox';

const ChatBox = ({ chatBoxRef }) => {
	const { messages } = useContext(ChatContext);
	return (
		<div className="chat-box" ref={chatBoxRef}>
			{messages.map((msg, i) => (
				<Message key={i} sender={msg.sender} text={msg.text} />
			))}
		</div>
	);
};

export default ChatBox;
