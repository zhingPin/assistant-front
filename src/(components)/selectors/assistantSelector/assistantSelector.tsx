"use client";
import { useState } from "react";

interface Assistant {
  id: string;
  name: string;
}

interface AssistantSelectorProps {
  assistants: Assistant[];
  defaultAssistant: string;
}

export default function AssistantSelector({
  assistants,
  defaultAssistant,
}: AssistantSelectorProps) {
  const [selectedAssistant, setSelectedAssistant] =
    useState<string>(defaultAssistant);

  return (
    <div>
      <label htmlFor="assistant">Select an Assistant:</label>
      <select
        id="assistant"
        onChange={(e) => setSelectedAssistant(e.target.value)}
        value={selectedAssistant}
      >
        {assistants.map((assistant) => (
          <option key={assistant.id} value={assistant.id}>
            {assistant.name}
          </option>
        ))}
      </select>
    </div>
  );
}
