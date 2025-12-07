"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Cpu,
  Code,
  FileText,
  Hash,
  GitBranch,
  Shuffle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Sparkles,
} from "lucide-react";
import { BLOCK_PALETTE, PIPELINE_MODELS } from "../../lib/pipeline/constants";
import type { ModelCategory, PipelineModelOption } from "../../lib/pipeline/types";

// ============================================================================
// TYPES
// ============================================================================

interface BlockPaletteProps {
  onDragStart: (
    modelId: string,
    category: ModelCategory,
    displayName: string,
    e: React.DragEvent
  ) => void;
  onAddCondition: () => void;
  isCollapsed?: boolean;
}

// ============================================================================
// ICONS
// ============================================================================

const CATEGORY_ICONS: Record<string, typeof Cpu> = {
  vision: Eye,
  llm: Cpu,
  code: Code,
  summarizer: FileText,
  embedding: Hash,
};

// ============================================================================
// DRAGGABLE MODEL BLOCK
// ============================================================================

interface DraggableBlockProps {
  model: PipelineModelOption;
  onDragStart: (e: React.DragEvent) => void;
}

function DraggableBlock({ model, onDragStart }: DraggableBlockProps) {
  const Icon = CATEGORY_ICONS[model.category] || Cpu;

  const colorMap: Record<string, string> = {
    purple: "border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50",
    indigo: "border-indigo-500/30 bg-indigo-500/10 hover:border-indigo-500/50",
    cyan: "border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-500/50",
    emerald: "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50",
    amber: "border-amber-500/30 bg-amber-500/10 hover:border-amber-500/50",
    blue: "border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50",
    sky: "border-sky-500/30 bg-sky-500/10 hover:border-sky-500/50",
    rose: "border-rose-500/30 bg-rose-500/10 hover:border-rose-500/50",
    pink: "border-pink-500/30 bg-pink-500/10 hover:border-pink-500/50",
    slate: "border-slate-500/30 bg-slate-500/10 hover:border-slate-500/50",
  };

  const iconColorMap: Record<string, string> = {
    purple: "text-purple-400",
    indigo: "text-indigo-400",
    cyan: "text-cyan-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
    sky: "text-sky-400",
    rose: "text-rose-400",
    pink: "text-pink-400",
    slate: "text-slate-400",
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`
        flex items-center gap-3 p-3 rounded-lg border cursor-grab
        transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
        ${colorMap[model.color] || colorMap.cyan}
      `}
      data-testid={`palette-block-${model.modelId}`}
    >
      <GripVertical className="w-4 h-4 text-zinc-600" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{model.icon}</span>
          <span className="text-sm font-medium text-zinc-200 truncate">
            {model.displayName}
          </span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
          {model.description}
        </p>
      </div>
      <Icon className={`w-4 h-4 ${iconColorMap[model.color] || "text-cyan-400"}`} />
    </div>
  );
}

// ============================================================================
// CATEGORY SECTION
// ============================================================================

interface CategorySectionProps {
  category: (typeof BLOCK_PALETTE)[0];
  onDragStart: (
    modelId: string,
    category: ModelCategory,
    displayName: string,
    e: React.DragEvent
  ) => void;
}

function CategorySection({ category, onDragStart }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-2" data-testid={`palette-category-${category.id}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
        data-testid={`palette-category-toggle-${category.id}`}
      >
        <span className="text-lg">{category.icon}</span>
        <span className="flex-1 text-sm font-medium text-zinc-300">
          {category.label}
        </span>
        <span className="text-[10px] text-zinc-600">{category.blocks.length}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {category.blocks.map((model) => (
              <DraggableBlock
                key={model.modelId}
                model={model}
                onDragStart={(e) =>
                  onDragStart(model.modelId, model.category, model.displayName, e)
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BlockPalette({
  onDragStart,
  onAddCondition,
  isCollapsed,
}: BlockPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter models based on search
  const filteredPalette = BLOCK_PALETTE.map((category) => ({
    ...category,
    blocks: category.blocks.filter(
      (model) =>
        model.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.capabilities.some((cap) =>
          cap.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ),
  })).filter((category) => category.blocks.length > 0);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-zinc-900/50 border-r border-zinc-800 flex flex-col items-center py-4 gap-4">
        {BLOCK_PALETTE.map((category) => (
          <div
            key={category.id}
            className="text-xl cursor-pointer hover:scale-110 transition-transform"
            title={category.label}
          >
            {category.icon}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="w-72 bg-zinc-900/80 border-r border-zinc-800 flex flex-col backdrop-blur-xl"
      data-testid="block-palette"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Model Blocks
        </h3>
        <p className="text-[10px] text-zinc-500 mt-1">
          Drag blocks to add to pipeline
        </p>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-zinc-800/50">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search models..."
          className="w-full px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
          data-testid="palette-search-input"
        />
      </div>

      {/* Model Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredPalette.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onDragStart={onDragStart}
          />
        ))}

        {/* Logic Blocks Section */}
        <div className="pt-4 border-t border-zinc-800">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 px-2">
            Logic Blocks
          </h4>

          {/* Condition Block */}
          <motion.button
            onClick={onAddCondition}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 w-full p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:border-amber-500/50 transition-all"
            data-testid="add-condition-block-btn"
          >
            <GitBranch className="w-4 h-4 text-amber-400" />
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-zinc-200">Condition</span>
              <p className="text-[10px] text-zinc-500">Branch based on output</p>
            </div>
          </motion.button>

          {/* Transform Block (Coming Soon) */}
          <div className="flex items-center gap-3 w-full p-3 rounded-lg border border-zinc-700/30 bg-zinc-800/30 mt-2 opacity-50">
            <Shuffle className="w-4 h-4 text-zinc-500" />
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-zinc-400">Transform</span>
              <p className="text-[10px] text-zinc-600">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
        <p className="text-[10px] text-zinc-600 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Delete</kbd> to remove selected
        </p>
      </div>
    </div>
  );
}
