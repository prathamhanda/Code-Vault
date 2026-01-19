import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

const SortableItem = ({ id, code, onRemove, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id, disabled: disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative flex items-center gap-2 px-3 py-2 rounded shadow-sm border font-mono text-sm select-none
        /* ➤ FIX: Allow text wrapping so it doesn't scroll sideways */
        whitespace-pre-wrap break-words
        ${
          disabled
            ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-dark-800 border-neon-cyan/50 text-neon-cyan cursor-grab active:cursor-grabbing hover:bg-dark-700 hover:shadow-[0_0_10px_rgba(0,255,255,0.1)]"
        }
      `}
    >
      <span className="flex-1">{code}</span>

      {/* Remove Button */}
      {!disabled && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-400 text-gray-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default SortableItem;
