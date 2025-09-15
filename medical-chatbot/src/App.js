
import React, { useRef, useEffect, useState } from 'react';
import ChatBox from './components/ChatBox';
import InputBox, { ChatContext } from './components/InputBox';
import './styles/chatbot.css';


function App() {
  const chatBoxRef = useRef(null);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I’m your health assistant. Say hi" }
  ]);
  const [loading, setLoading] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  // 0: wait hi, 1: wait name, 2: wait age, 3: ask concern, 4: ask severity, 5: normal
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userConcern, setUserConcern] = useState("");
  const [userSeverity, setUserSeverity] = useState("");

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Custom send handler for onboarding
  const handleSend = async (input) => {
    if (!input.trim() || conversationEnded) return;
    setMessages(prev => [...prev, { sender: "user", text: input }]);

    if (onboardingStep === 0) {
      setMessages(prev => [...prev, { sender: "bot", text: "Hi what is your name?" }]);
      setOnboardingStep(1);
      return;
    }
    if (onboardingStep === 1) {
      setUserName(input.trim());
      setMessages(prev => [...prev, { sender: "bot", text: `Nice to meet you, ${input.trim()}. How old are you?` }]);
      setOnboardingStep(2);
      return;
    }
    if (onboardingStep === 2) {
      setUserAge(input.trim());
      setMessages(prev => [...prev, { sender: "bot", text: `Thank you, ${userName}. You can now tell me your medical concern.` }]);
      setOnboardingStep(3);
      return;
    }
    if (onboardingStep === 3) {
      setUserConcern(input.trim());
      setMessages(prev => [...prev, { sender: "bot", text: `On a scale of 1 to 10, how severe is your problem? (1 = mild, 10 = severe)` }]);
      setOnboardingStep(4);
      return;
    }
    if (onboardingStep === 4) {
      setUserSeverity(input.trim());
      setLoading(true);
      try {
        const reply = await import('./services/api').then(api => api.sendMessageToAPI(
          `Concern: ${userConcern}\nSeverity: ${input.trim()}`,
          userName,
          userAge
        ));
        setMessages(prev => {
          // If reply contains 'thank you' or 'thanks', end conversation
          const lowerReply = reply.toLowerCase();
          if (lowerReply.includes('thank you') || lowerReply.includes('thanks')) {
            setConversationEnded(true);
          }
          return [...prev, { sender: "bot", text: reply }];
        });
      } catch {
        setMessages(prev => [...prev, { sender: "bot", text: "⚠️ Server error!" }]);
      }
      setLoading(false);
      setOnboardingStep(5);
      return;
    }
    // Normal chat
    setLoading(true);
    try {
      const reply = await import('./services/api').then(api => api.sendMessageToAPI(input, userName, userAge));
      setMessages(prev => {
        const lowerReply = reply.toLowerCase();
        if (lowerReply.includes('thank you') || lowerReply.includes('thanks')) {
          setConversationEnded(true);
        }
        return [...prev, { sender: "bot", text: reply }];
      });
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "⚠️ Server error!" }]);
    }
    setLoading(false);
  };

  // Restart chat and onboarding
  const handleRestart = () => {
    setMessages([{ sender: "bot", text: "👋 Hi! I’m your health assistant. Say hi" }]);
    setLoading(false);
    setConversationEnded(false);
    setOnboardingStep(0);
    setUserName("");
    setUserAge("");
    setUserConcern("");
    setUserSeverity("");
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, loading, setLoading, handleSend, conversationEnded }}>
      <div className="chat-container">
        <div className="chat-header">🤖 Health Chatbot</div>
        <ChatBox chatBoxRef={chatBoxRef} />
        <InputBox />
        {conversationEnded && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={handleRestart} style={{ padding: '8px 20px', fontSize: 16, borderRadius: 6, background: '#1976d2', color: 'white', border: 'none', cursor: 'pointer' }}>
              Restart
            </button>
          </div>
        )}
      </div>
    </ChatContext.Provider>
  );
}

export default App;
