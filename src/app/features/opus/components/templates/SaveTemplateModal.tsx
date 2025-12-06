"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Sparkles, Tag, Info } from "lucide-react";
import type { JobTemplate, TemplateCategory, CreateTemplateRequest } from "@/types/template";
import { TEMPLATE_CATEGORIES } from "@/types/template";
import { getModelById } from "@/lib/models";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: CreateTemplateRequest) => void;
  // Pre-fill from current job form
  initialData?: {
    prompt: string;
    systemPrompt?: string;
    modelId: string;
    maxTokens: number;
    temperature: number;
  };
  // For editing existing template
  existingTemplate?: JobTemplate;
}

export function SaveTemplateModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingTemplate,
}: SaveTemplateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("custom");
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelId, setModelId] = useState("");
  const [maxTokens, setMaxTokens] = useState(500);
  const [temperature, setTemperature] = useState(0.7);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const isEditing = !!existingTemplate;

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingTemplate) {
        setName(existingTemplate.name);
        setDescription(existingTemplate.description);
        setCategory(existingTemplate.category);
        setPrompt(existingTemplate.prompt);
        setSystemPrompt(existingTemplate.systemPrompt || "");
        setModelId(existingTemplate.modelId);
        setMaxTokens(existingTemplate.maxTokens);
        setTemperature(existingTemplate.temperature);
        setTags(existingTemplate.tags);
      } else if (initialData) {
        setPrompt(initialData.prompt);
        setSystemPrompt(initialData.systemPrompt || "");
        setModelId(initialData.modelId);
        setMaxTokens(initialData.maxTokens);
        setTemperature(initialData.temperature);
        // Reset other fields
        setName("");
        setDescription("");
        setCategory("custom");
        setTags([]);
      }
    }
  }, [isOpen, existingTemplate, initialData]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!name.trim() || !prompt.trim()) return;

    const request: CreateTemplateRequest = {
      name: name.trim(),
      description: description.trim(),
      category,
      prompt: prompt.trim(),
      systemPrompt: systemPrompt.trim() || undefined,
      modelId,
      maxTokens,
      temperature,
      tags,
    };

    onSave(request);
    onClose();
  };

  const model = getModelById(modelId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        data-testid="save-template-modal-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
          data-testid="save-template-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {isEditing ? "Edit Template" : "Save as Template"}
                </h2>
                <p className="text-xs text-zinc-500">
                  {isEditing
                    ? "Update your template settings"
                    : "Save this prompt for quick reuse"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              data-testid="close-save-template-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Code Review Request"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                data-testid="template-name-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this template does"
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                data-testid="template-description-input"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border ${
                      category === cat.id
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600"
                    }`}
                    data-testid={`category-select-${cat.id}`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Preview */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt template..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
                data-testid="template-prompt-input"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Use [placeholder] syntax for variable parts
              </p>
            </div>

            {/* System Prompt */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">
                System Prompt (optional)
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Optional system instructions..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
                data-testid="template-system-prompt-input"
              />
            </div>

            {/* Parameters Info */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
              <Info className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              <div className="flex-1 text-xs text-zinc-400">
                <span className="text-zinc-300">{model?.displayName || modelId}</span>
                {" • "}
                Max {maxTokens} tokens • Temp {temperature.toFixed(1)}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-500 hover:text-zinc-300"
                      data-testid={`remove-tag-${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  data-testid="tag-input"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs hover:text-white hover:border-zinc-600 transition-colors"
                  data-testid="add-tag-btn"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
              data-testid="cancel-save-template-btn"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSave}
              disabled={!name.trim() || !prompt.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="confirm-save-template-btn"
            >
              <Save className="w-4 h-4" />
              {isEditing ? "Update Template" : "Save Template"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
