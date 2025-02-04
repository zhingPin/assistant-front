"use client";
import styles from "./index.module.css";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  createdAt?: string;
}

const THREAD_ID = "thread_n40Z4t6ykSohqooQZSwbeM7l"; // Replace with actual threadId
const ASSISTANT_ID = "asst_H1xesyGl1n7Cr4PQuMyCvAhN"; // Replace with actual assistantId

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch previous messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROJECT_NEO_BASE_URL}/api/v1/thread/${THREAD_ID}`
        );
        const data = await res.json();

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

  // Send a message to the assistant
  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      content: inputMessage,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
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
  };

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
              {msg.content}
            </div>
          ))
        )}
      </div>

      <div className={styles.textAreaContainer}>
        <textarea
          className={styles.textArea}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
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
