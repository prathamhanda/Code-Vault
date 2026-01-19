import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { Code2 } from "lucide-react";

const SnippetBank = ({ items }) => {
  const { setNodeRef } = useDroppable({
    id: "bank-area",
    data: { type: "bank" },
  });

  return (
    <div className="flex flex-col h-full bg-dark-800/50 backdrop-blur-md rounded-xl border border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-dark-700 bg-dark-900/80 flex items-center gap-2">
        <Code2 className="w-4 h-4 text-neon-pink" />
        <span className="font-mono text-xs font-bold tracking-widest text-gray-300">
          SNIPPET_VAULT
        </span>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2"
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              code={item.code}
              disabled={false} // Bank items are always draggable unless level is locked
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="text-gray-600 text-xs text-center mt-10 font-mono">
            [VAULT EMPTY]
            <br />
            All snippets deployed
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetBank;
