/* eslint-disable react/prop-types */
"use client";

import { useState, useRef, useEffect } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { ask } from "../../services/apiSplitter";

export default function ChatbotWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      content:
        "Bonjour ! Je suis votre assistant EduSphere. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await ask(text);

      const botMessage = {
        id: Date.now().toString() + "_bot",
        content: res.response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now().toString() + "_error",
        content: "Une erreur est survenue. Veuillez réessayer.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) handleSendMessage();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 md:w-96 h-96 bg-white shadow-xl border rounded-lg flex flex-col">
      <div className="bg-blue-600 text-white p-4">
        <h3 className="font-medium">Assistant EduSphere</h3>
        <p className="text-sm opacity-90">
          Posez vos questions sur les cours et le support technique.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {message.sender === "bot" && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">Assistant</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1 text-right">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Tapez votre message..."
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          label={isLoading ? "..." : "Send"}
          onClick={handleSendMessage}
          disabled={isLoading || input.trim() === ""}
        />
      </div>
    </div>
  );
}
