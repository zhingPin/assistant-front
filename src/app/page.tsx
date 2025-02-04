import AssistantSelector from "@/(components)/selectors/assistantSelector/assistantSelector";
import styles from "./page.module.css";
import ChatComponent from "@/(components)/chatBox";

interface Assistant {
  id: string;
  name: string;
}

async function getAssistants(): Promise<Assistant[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PROJECT_NEO_BASE_URL}/api/v1/assistant`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.status === "success"
    ? data.data.assistants.map((a: { _id: string; name: string }) => ({
        id: a._id,
        name: a.name,
      }))
    : [];
}

export default async function Home() {
  const assistants = await getAssistants();
  return (
    <main className={styles.main}>
      <AssistantSelector
        assistants={assistants}
        defaultAssistant={assistants[0]?.id || ""}
      />
      <ChatComponent />
    </main>
  );
}
