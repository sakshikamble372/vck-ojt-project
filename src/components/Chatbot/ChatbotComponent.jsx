// / src/components/Chatbot/ChatbotComponent.jsx
import React, { useState, useEffect, useRef } from "react";
import { getEmbeddings, cosineSimilarity } from "../../utils/aiService"; // Path adjusted
import { SIMILARITY_THRESHOLD } from "../../utils/constants"; // Path adjusted
import "./Chatbot.css";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import KNOWLEDGE_BASE_DATA from "../../data/knowledgeBase.json";
const ChatbotComponent = () => {
  const [messages, setMessages] = useState([
    { text: KNOWLEDGE_BASE_DATA.greeting.response, sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatMessagesRef = useRef(null);
  const [preparedKnowledgeBase, setPreparedKnowledgeBase] =
    useState(KNOWLEDGE_BASE_DATA);
  const [isKnowledgeBaseLoading, setIsKnowledgeBaseLoading] = useState(true);
  const isOnline = useOnlineStatus();
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Preparing the knowledge base data
  useEffect(() => {
    const prepareKB = async () => {
      const newKB = JSON.parse(JSON.stringify(KNOWLEDGE_BASE_DATA)); // Create a deep copy of KNOWLEDGE_BASE_DATA
      for (const intent in newKB) {
        if (newKB[intent].examples && newKB[intent].examples.length > 0) {
          const embeddings = await Promise.all(
            newKB[intent].examples.map((example) => getEmbeddings(example)) // embeddings are vectors that help machines understand meanings
          );
          newKB[intent].exampleEmbeddings = embeddings;
        }
      }
      setPreparedKnowledgeBase(newKB);
      setIsKnowledgeBaseLoading(false);
    };
    prepareKB();
  }, []);
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        // Scrools the chat container to a specific position
        top: chatMessagesRef.current.scrollHeight, // Scrolls to very bottom of the chat box , so the latest message is visible
        behavior: "smooth",
      });
    }
  }, [messages]);
  const getAIResponse = async (userMessageText) => {
    setLoading(true);
    if (!isOnline) {
      setLoading(false);
      return "It seems you're offline. Please check your internet connection.";
    }
    if (isKnowledgeBaseLoading) {
      setLoading(false);
      return "Please wait, I'm still getting ready...";
    }
    try {
      const userEmbedding = await getEmbeddings(userMessageText); // we recieve vectors
      let bestMatch = { intent: "default", score: 0 };
      for (const intent in preparedKnowledgeBase) {
        if (intent === "default") continue;
        const intentEmbeddings =
          preparedKnowledgeBase[intent].exampleEmbeddings;
        if (intentEmbeddings.length === 0) continue;
        for (const exampleEmbedding of intentEmbeddings) {
          const score = cosineSimilarity(userEmbedding, exampleEmbedding);
          if (score > bestMatch.score) {
            bestMatch = { intent: intent, score: score };
          }
        }
      }
      console.log(
        `Best matching intent: ${bestMatch.intent} with score: ${bestMatch.score}`
      );
      if (bestMatch.score >= SIMILARITY_THRESHOLD) {
        return preparedKnowledgeBase[bestMatch.intent].response;
      } else {
        return preparedKnowledgeBase.default.response;
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      if (error.message.includes("429")) {
        return "I'm experiencing high traffic right now. Please try again in a moment.";
      }
      if (error.message.includes("403") || error.message.includes("401")) {
        return "There's an issue with my internal setup (API key). Please inform the administrator.";
      }
      return preparedKnowledgeBase.default.response;
    } finally {
      setLoading(false);
    }
  };
  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;
    const userMessageText = inputValue;
    const newUserMessage = { text: userMessageText, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue("");
    if (!isOnline) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "You appear to be offline. Please check your internet connection.",
          sender: "bot",
        },
      ]);
      return;
    }
    if (isKnowledgeBaseLoading) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Please wait a moment, I'm initializing my knowledge...",
          sender: "bot",
        },
      ]);
      return;
    }
    const aiResponseText = await getAIResponse(userMessageText);
    const botResponse = { text: aiResponseText, sender: "bot" };
    setMessages((prevMessages) => [...prevMessages, botResponse]);
  };
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !loading) {
      handleSendMessage();
    }
  };
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };
  return (
    <div className="chatbot-container">
      {" "}
      {/* This was the main app-container, now specific to Chatbot */}
      {!isChatOpen && (
        <button className="chatbot-open-button" onClick={toggleChat}>
          <img
            src="/images/operator.png"
            alt="Chat Icon"
            style={{ width: "100px", height: "auto" }}
          />
        </button>
      )}
      <div className={`chatbot-window ${isChatOpen ? "open" : "closed"}`}>
        {isChatOpen && (
          <>
            <div className="chatbot-header">
              <span role="img" aria-label="Chatbot icon">
                :robot_face:
              </span>
              <h2>Educational Chatbot</h2>
              <button className="chatbot-close-button" onClick={toggleChat}>
                :x:
              </button>
            </div>
            {isKnowledgeBaseLoading && (
              <div className="initial-loading-container">
                <div className="spinner"></div>
                <p className="initial-loading-message">
                  Initializing knowledge base... Please wait.
                </p>
              </div>
            )}
            {!isOnline && (
              <p className="chatbot-message offline-message">
                :no_entry_sign:: You are currently offline. Please check your internet
                connection.
              </p>
            )}
            <div className="chatbot-messages" ref={chatMessagesRef}>
              {messages.map((message, index) => (
                <div key={index} className={`message-row ${message.sender}`}>
                  {message.sender === "bot" && (
                    <div className="avatar bot-avatar">:robot_face:</div>
                  )}
                  <p className={`${message.sender}-message`}>{message.text}</p>
                  {message.sender === "user" && (
                    <div className="avatar user-avatar">:bust_in_silhouette:</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="message-row bot">
                  <div className="avatar bot-avatar">:robot_face:</div>
                  <p className="bot-message loading-indicator">Typing...</p>
                </div>
              )}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                placeholder={
                  loading || isKnowledgeBaseLoading || !isOnline
                    ? "Waiting..."
                    : "Type your message..."
                }
                className="message-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={loading || isKnowledgeBaseLoading || !isOnline}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={loading || isKnowledgeBaseLoading || !isOnline}
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ChatbotComponent;