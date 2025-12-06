"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  JobTemplate,
  CreateTemplateRequest,
  TemplateCategory,
} from "@/types/template";
import { DEFAULT_TEMPLATES } from "@/types/template";

const STORAGE_KEY = "comqute-job-templates";
const SEEDED_KEY = "comqute-templates-seeded";

// Generate a unique ID
function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Initialize templates from localStorage or seed with defaults
function initializeTemplates(): JobTemplate[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  const isSeeded = localStorage.getItem(SEEDED_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.error("Failed to parse stored templates");
    }
  }

  // Seed with default templates on first load
  if (!isSeeded) {
    const now = Date.now();
    const seededTemplates: JobTemplate[] = DEFAULT_TEMPLATES.map((t, i) => ({
      ...t,
      id: generateId() + i,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      isPublic: false,
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(seededTemplates));
    localStorage.setItem(SEEDED_KEY, "true");
    return seededTemplates;
  }

  return [];
}

export function useTemplates() {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates on mount
  useEffect(() => {
    const loaded = initializeTemplates();
    setTemplates(loaded);
    setIsLoading(false);
  }, []);

  // Persist templates to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  }, [templates, isLoading]);

  // Create a new template
  const createTemplate = useCallback((request: CreateTemplateRequest): JobTemplate => {
    const now = Date.now();
    const newTemplate: JobTemplate = {
      id: generateId(),
      name: request.name,
      description: request.description,
      category: request.category,
      prompt: request.prompt,
      systemPrompt: request.systemPrompt,
      modelId: request.modelId,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      tags: request.tags || [],
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      isPublic: false,
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    return newTemplate;
  }, []);

  // Update an existing template
  const updateTemplate = useCallback((id: string, updates: Partial<CreateTemplateRequest>): JobTemplate | null => {
    let updated: JobTemplate | null = null;

    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updated = {
            ...t,
            ...updates,
            updatedAt: Date.now(),
          };
          return updated;
        }
        return t;
      })
    );

    return updated;
  }, []);

  // Delete a template
  const deleteTemplate = useCallback((id: string): void => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Increment usage count when template is used
  const useTemplate = useCallback((id: string): JobTemplate | null => {
    let used: JobTemplate | null = null;

    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          used = {
            ...t,
            usageCount: t.usageCount + 1,
            updatedAt: Date.now(),
          };
          return used;
        }
        return t;
      })
    );

    return used;
  }, []);

  // Duplicate a template
  const duplicateTemplate = useCallback((id: string): JobTemplate | null => {
    const original = templates.find((t) => t.id === id);
    if (!original) return null;

    const now = Date.now();
    const duplicate: JobTemplate = {
      ...original,
      id: generateId(),
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    };

    setTemplates((prev) => [duplicate, ...prev]);
    return duplicate;
  }, [templates]);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category: TemplateCategory): JobTemplate[] => {
    return templates.filter((t) => t.category === category);
  }, [templates]);

  // Search templates
  const searchTemplates = useCallback((query: string): JobTemplate[] => {
    const lowerQuery = query.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }, [templates]);

  // Get most used templates
  const getMostUsed = useCallback((limit: number = 5): JobTemplate[] => {
    return [...templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }, [templates]);

  // Get recently updated templates
  const getRecent = useCallback((limit: number = 5): JobTemplate[] => {
    return [...templates]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }, [templates]);

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    duplicateTemplate,
    getTemplatesByCategory,
    searchTemplates,
    getMostUsed,
    getRecent,
  };
}
