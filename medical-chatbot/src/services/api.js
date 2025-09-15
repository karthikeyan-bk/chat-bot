
export const sendMessageToAPI = async (userMessage, name, age, symptom) => {
	try {
		const user_id = name || "anonymous";
		const response = await fetch("http://127.0.0.1:5000/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message: userMessage, user_id, symptom }),
		});
		const data = await response.json();
		return data.reply;
	} catch (error) {
		return "⚠️ Sorry, I couldn't connect to the server.";
	}
};
