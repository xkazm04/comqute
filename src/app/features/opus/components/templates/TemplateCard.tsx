"use client";

import { motion } from "framer-motion";
import {
  Play,
  Copy,
  Trash2,
  Edit2,
  MoreVertical,
  Clock,
  Zap,
} from "lucide-react";
import { useState } from "react";
import type { JobTemplate } from "@/types/template";
import { TEMPLATE_CATEGORIES } from "@/types/template";
import { getModelById } from "@/lib/models";
import { formatRelativeTime } from "@/lib/mock-utils";

interface TemplateCardProps {
  template: JobTemplate;
  onUse: (template: JobTemplate) => void;
  onEdit: (template: JobTemplate) => void;
  onDuplicate: (template: JobTemplate) => void;
  onDelete: (template: JobTemplate) => void;
}

export function TemplateCard({
  template,
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const category = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);
  const model = getModelById(template.modelId);

  const colorClasses: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    zinc: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
      data-testid={`template-card-${template.id}`}
    >
      {/* Category Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            colorClasses[category?.color || "zinc"]
          }`}
        >
          <span>{category?.icon}</span>
          <span>{category?.label}</span>
        </span>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
            data-testid={`template-menu-btn-${template.id}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 z-20 w-36 py-1 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl"
              >
                <button
                  onClick={() => {
                    onEdit(template);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                  data-testid={`template-edit-btn-${template.id}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDuplicate(template);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
                  data-testid={`template-duplicate-btn-${template.id}`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete(template);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-zinc-700 transition-colors"
                  data-testid={`template-delete-btn-${template.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Template Name & Description */}
      <h3 className="text-sm font-medium text-white mb-1">{template.name}</h3>
      <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
        {template.description}
      </p>

      {/* Template Preview */}
      <div className="mb-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
        <p className="text-[10px] text-zinc-400 line-clamp-2 font-mono">
          {template.prompt.slice(0, 100)}
          {template.prompt.length > 100 ? "..." : ""}
        </p>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {template.usageCount} uses
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(template.updatedAt)}
          </span>
        </div>
        <span className="text-zinc-600">{model?.displayName}</span>
      </div>

      {/* Use Template Button */}
      <motion.button
        onClick={() => onUse(template)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
        data-testid={`template-use-btn-${template.id}`}
      >
        <Play className="w-3.5 h-3.5" />
        Use Template
      </motion.button>
    </motion.div>
  );
}
