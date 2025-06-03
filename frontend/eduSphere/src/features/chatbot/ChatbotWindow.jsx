/* eslint-disable react/prop-types */
"use client";

import { useState, useRef, useEffect } from "react";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { ask } from "../../services/apiSplitter";
import { HiX, HiCode, HiSparkles } from "react-icons/hi";
import { FaRobot, FaUser, FaCopy, FaCheck } from "react-icons/fa";

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
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const windowRef = useRef(null);

  // Close chatbot on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (windowRef.current && !windowRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

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

    const botMessageId = "bot_" + Date.now();

    const botMessage = {
      id: botMessageId,
      content: "",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await ask(text, (token) => {
        console.log("messages", messages);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content: msg.content + token,
                  isLoading: false,
                }
              : msg
          )
        );
      });
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: "Une erreur est survenue. Veuillez réessayer.",
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) handleSendMessage();
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const parseMessageContent = (content) => {
    const parts = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      const codeContent = match[0].replace(/^```(\w+)?\s*\n?|```$/g, "").trim();
      const language = match[0].match(/^```(\w+)/)?.[1] || "";

      parts.push({
        type: "code",
        content: codeContent,
        language,
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content }];
  };

  const renderMessageContent = (message) => {
    const { content, id, isLoading } = message;

    if (isLoading || !content) {
      return (
        <p className="text-sm leading-relaxed whitespace-pre-line">{content}</p>
      );
    }

    const parts = parseMessageContent(content);

    return (
      <div className="space-y-3">
        {parts.map((part, index) => {
          if (part.type === "code") {
            return (
              <div key={index} className="relative group">
                <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-3 py-2 rounded-t-lg text-xs">
                  <div className="flex items-center space-x-2">
                    <HiCode className="w-4 h-4" />
                    <span>{part.language || "Code"}</span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(part.content, `${id}-${index}`)
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-white"
                  >
                    {copiedId === `${id}-${index}` ? (
                      <FaCheck className="w-3 h-3" />
                    ) : (
                      <FaCopy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm font-mono leading-relaxed">
                  <code>{part.content}</code>
                </pre>
              </div>
            );
          } else {
            return part.content.trim() ? (
              <p
                key={index}
                className="text-sm leading-relaxed whitespace-pre-line"
              >
                {part.content}
              </p>
            ) : null;
          }
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className="fixed bottom-24 right-6 w-80 md:w-96 h-[32rem] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col z-50 overflow-hidden backdrop-blur-sm"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FaRobot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Assistant EduSphere</h3>
              <div className="flex items-center space-x-1 text-blue-100">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">En ligne</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-blue-100 mt-2">
          Posez vos questions sur les cours et le support technique.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.sender === "user"
                ? "flex-row-reverse space-x-reverse"
                : ""
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gradient-to-br from-purple-500 to-blue-600 text-white"
              }`}
            >
              {message.sender === "user" ? (
                <FaUser className="w-4 h-4" />
              ) : (
                <FaRobot className="w-4 h-4" />
              )}
            </div>

            <div
              className={`flex-1 max-w-[85%] ${
                message.sender === "user" ? "flex justify-end" : ""
              }`}
            >
              <div
                className={`relative p-4 rounded-2xl shadow-sm ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600"
                } ${message.isLoading ? "animate-pulse" : ""}`}
              >
                {message.isLoading && (
                  <div className="flex items-center space-x-2 mb-2">
                    <HiSparkles className="w-4 h-4 animate-spin" />
                    <span className="text-xs opacity-70">
                      Assistant écrit...
                    </span>
                  </div>
                )}

                {renderMessageContent(message)}

                <div
                  className={`flex items-center justify-between mt-2 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`text-xs opacity-70 ${
                      message.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Tapez votre message..."
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              disabled={isLoading}
            />
          </div>
          <Button
            variant="simple"
            label={isLoading ? "..." : "Envoyer"}
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ""}
            className={`px-6 py-2 rounded-xl transition-all duration-200 ${
              isLoading || input.trim() === ""
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-lg transform hover:scale-105"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
