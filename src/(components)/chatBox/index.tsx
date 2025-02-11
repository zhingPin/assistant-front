"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
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

  // ✅ Use `useRef` for better performance (Avoids unnecessary re-renders)
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROJECT_NEO_BASE_URL}/api/v1/thread/${THREAD_ID}/messages`
        );
        const text = await res.text();
        const data = JSON.parse(text);
        if (data.status === "success") {
          setMessages(data.data.messages);
        } else {
          console.error("Failed to fetch messages:", data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputRef.current || sending) return;
    const inputMessage = inputRef.current.value.trim();
    if (!inputMessage) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      content: inputMessage,
    };

    setMessages((prev) => [...prev, newMessage]);
    inputRef.current.value = ""; // ✅ Clear input without triggering re-renders
    setSending(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PROJECT_NEO_BASE_URL}/api/v1/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: inputMessage,
            threadId: THREAD_ID,
            assistantId: ASSISTANT_ID,
          }),
        }
      );

      const data = await response.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "assistant",
            content: data.response,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }, [sending]);

  return (
    <div>
      <div className={styles.chatContainer}>
        <h2>Chat</h2>
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.sender === "assistant" ? styles.ai : styles.user
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
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
        {/* ✅ Use ref instead of state for instant input */}
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
