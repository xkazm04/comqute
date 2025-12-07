"use client";

import { motion } from "framer-motion";
import { Zap, Code, Brain, Check, Cloud } from "lucide-react";
import { SUPPORTED_MODELS, type ModelConfig } from "@/lib/models";

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
  variant?: "cards" | "dropdown" | "pills";
}

const modelIcons: Record<string, typeof Brain> = {
  "gpt-oss-20b": Brain,
  "ministral-3-14b": Zap,
  "gpt-oss-20b-cloud": Cloud,
};

const speedColors: Record<string, string> = {
  fast: "emerald",
  medium: "amber",
  slow: "rose",
};

export function ModelSelector({ selectedModel, onSelect, variant = "cards" }: ModelSelectorProps) {
  if (variant === "pills") {
    return (
      <div className="flex flex-wrap gap-2 my-2">
        {SUPPORTED_MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          return (
            <motion.button
              key={model.id}
              onClick={() => onSelect(model.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isSelected
                  ? "border border-cyan-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }
              `}
            >
              {model.displayName}
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <select
        value={selectedModel}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500 transition-colors"
      >
        {SUPPORTED_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.displayName} - {model.description}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SUPPORTED_MODELS.map((model, i) => {
        const isSelected = selectedModel === model.id;
        const Icon = modelIcons[model.id] || Brain;
        const color = speedColors[model.speed];

        return (
          <motion.button
            key={model.id}
            onClick={() => onSelect(model.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-xl text-left transition-all
              ${isSelected
                ? `border-2 border-cyan-500 bg-cyan-500/10`
                : `border border-zinc-700 bg-zinc-800/50 hover:border-zinc-600`
              }
            `}
          >
            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}

            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-3`}>
              <Icon className={`w-6 h-6 text-${color}-400`} />
            </div>

            {/* Info */}
            <h3 className="font-semibold text-white mb-1">{model.displayName}</h3>
            <p className="text-sm text-zinc-400 mb-3">{model.description}</p>

            {/* Speed badge */}
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-${color}-500/10 text-${color}-400`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-${color}-400`} />
              {model.speed.toUpperCase()}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
