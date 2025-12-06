"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Sliders, ChevronDown, Zap, Clock } from "lucide-react";
import type { JobTemplate } from "@/types/template";
import { TEMPLATE_CATEGORIES } from "@/types/template";
import { getModelById } from "@/lib/models";
import { ModelSelector } from "../../shared";

interface UseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: JobTemplate | null;
  onSubmit: (data: {
    prompt: string;
    systemPrompt?: string;
    modelId: string;
    maxTokens: number;
    temperature: number;
  }) => void;
}

export function UseTemplateModal({
  isOpen,
  onClose,
  template,
  onSubmit,
}: UseTemplateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelId, setModelId] = useState("");
  const [maxTokens, setMaxTokens] = useState(500);
  const [temperature, setTemperature] = useState(0.7);
  const [showParams, setShowParams] = useState(false);

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setPrompt(template.prompt);
      setSystemPrompt(template.systemPrompt || "");
      setModelId(template.modelId);
      setMaxTokens(template.maxTokens);
      setTemperature(template.temperature);
    }
  }, [template]);

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    onSubmit({
      prompt: prompt.trim(),
      systemPrompt: systemPrompt.trim() || undefined,
      modelId,
      maxTokens,
      temperature,
    });
    onClose();
  };

  if (!isOpen || !template) return null;

  const category = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);
  const model = getModelById(modelId);

  const colorClasses: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    zinc: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        data-testid="use-template-modal-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
          data-testid="use-template-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {template.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      colorClasses[category?.color || "zinc"]
                    }`}
                  >
                    <span>{category?.icon}</span>
                    <span>{category?.label}</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {template.usageCount} uses
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              data-testid="close-use-template-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Description */}
            {template.description && (
              <p className="text-sm text-zinc-400">{template.description}</p>
            )}

            {/* Model Selector */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">Model</label>
              <ModelSelector
                selectedModel={modelId}
                onSelect={setModelId}
                variant="pills"
              />
            </div>

            {/* Prompt Editor */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
                data-testid="use-template-prompt-input"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Modify the prompt as needed before submitting
              </p>
            </div>

            {/* System Prompt (collapsible) */}
            {systemPrompt && (
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-zinc-400"
                  data-testid="use-template-system-prompt-input"
                />
              </div>
            )}

            {/* Parameters (collapsible) */}
            <div>
              <button
                onClick={() => setShowParams(!showParams)}
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                data-testid="toggle-params-btn"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Parameters</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showParams ? "rotate-180" : ""
                  }`}
                />
                <span className="text-zinc-600">
                  ({maxTokens} tokens, {temperature.toFixed(1)} temp)
                </span>
              </button>

              <AnimatePresence>
                {showParams && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-6 pt-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-zinc-500">
                            Max Tokens
                          </label>
                          <span className="text-xs text-zinc-300 font-mono">
                            {maxTokens}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={100}
                          max={2000}
                          step={100}
                          value={maxTokens}
                          onChange={(e) => setMaxTokens(Number(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          data-testid="use-template-max-tokens"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-zinc-500">
                            Temperature
                          </label>
                          <span className="text-xs text-zinc-300 font-mono">
                            {temperature.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={temperature}
                          onChange={(e) =>
                            setTemperature(Number(e.target.value))
                          }
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          data-testid="use-template-temperature"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tags */}
            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Using: {model?.displayName || modelId}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
                data-testid="cancel-use-template-btn"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSubmit}
                disabled={!prompt.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                data-testid="submit-from-template-btn"
              >
                <Play className="w-4 h-4" />
                Queue Job
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
