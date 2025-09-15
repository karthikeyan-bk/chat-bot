import React from 'react';

const Message = ({ sender, text }) => {
	return (
		<div className={`message ${sender}`}>{text}</div>
	);
};

export default Message;
