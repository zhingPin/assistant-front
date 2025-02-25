"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { fetchMessages, sendMessageToAPI } from "./lib/api/chat";
import styles from "./index.module.css";

interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  createdAt?: string;
}

const THREAD_ID = "thread_n40Z4t6ykSohqooQZSwbeM7l";
const ASSISTANT_ID = "asst_H1xesyGl1n7Cr4PQuMyCvAhN";

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      const data = await fetchMessages(THREAD_ID);
      setMessages(data);
      setLoading(false);
    }

    loadMessages();
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputRef.current || sending) return;
    const inputMessage = inputRef.current.value.trim();
    if (!inputMessage) return;

    console.log("Sending message:", inputMessage);

    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      content: inputMessage,
    };

    setMessages((prev) => [...prev, newMessage]);
    inputRef.current.value = "";
    setSending(true);

    const response = await sendMessageToAPI(
      inputMessage,
      THREAD_ID,
      ASSISTANT_ID
    );
    if (response) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "assistant", content: response },
      ]);
    }

    setSending(false);
  }, [sending]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <div className={styles.chatContainer}>
        <h2>Chat</h2>
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          messages.map((msg, index) => (
            <div
              className={`${styles.message} ${
                msg.sender === "assistant" ? styles.ai : styles.user
              }`}
              key={msg.id || index}
              ref={index === messages.length - 1 ? messagesEndRef : null}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(
                      className?.toString() || ""
                    );
                    return match ? (
                      <SyntaxHighlighter language={match[1]} style={dracula}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className || ""} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))
        )}
      </div>

      <div className={styles.textAreaContainer}>
        <textarea
          ref={inputRef}
          className={styles.textArea}
          placeholder="Type your message..."
        />
        <button
          className={styles.sendButton}
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
