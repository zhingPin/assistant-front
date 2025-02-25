const BASE_URL = process.env.NEXT_PUBLIC_PROJECT_NEO_BASE_URL;

export const fetchMessages = async (threadId: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/thread/${threadId}/messages`);
    const data = await res.json();
    return data.status === "success" ? data.data.messages : [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessageToAPI = async (
  message: string,
  threadId: string,
  assistantId: string
) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, threadId, assistantId }),
    });
    const data = await res.json();
    return data.response || null;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};
