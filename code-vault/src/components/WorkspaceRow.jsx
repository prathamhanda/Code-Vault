import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

const WorkspaceRow = ({ id, items, onRemoveItem, disabled }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "row",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[50px] rounded border-2 border-dashed transition-colors duration-200 flex items-center px-2 gap-2 overflow-x-auto custom-scrollbar
        ${isOver && !disabled ? "border-neon-cyan bg-neon-cyan/10" : "border-gray-700 bg-black/20"}
        ${disabled ? "opacity-50 cursor-not-allowed border-gray-800" : ""}
      `}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={horizontalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem
            key={item.id}
            id={item.id}
            code={item.code}
            onRemove={!disabled ? () => onRemoveItem(item.id) : undefined}
            disabled={disabled}
          />
        ))}
      </SortableContext>

      {/* Placeholder Text if Empty */}
      {items.length === 0 && !disabled && (
        <span className="text-gray-600 text-xs font-mono select-none pointer-events-none">
          // Drop code snippet here
        </span>
      )}
    </div>
  );
};

export default WorkspaceRow;
