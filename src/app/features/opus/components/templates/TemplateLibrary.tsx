"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  Sparkles,
  BookOpen,
  TrendingUp,
  Clock,
  X,
} from "lucide-react";
import { GlassCard, EmptyStateIllustration } from "../../shared";
import { TemplateCard } from "./TemplateCard";
import { useTemplates } from "@/hooks";
import type { JobTemplate, TemplateCategory } from "@/types/template";
import { TEMPLATE_CATEGORIES } from "@/types/template";

interface TemplateLibraryProps {
  onUseTemplate: (template: JobTemplate) => void;
  onCreateNew: () => void;
  onEditTemplate: (template: JobTemplate) => void;
}

type ViewMode = "all" | "popular" | "recent" | TemplateCategory;

export function TemplateLibrary({
  onUseTemplate,
  onCreateNew,
  onEditTemplate,
}: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [showFilters, setShowFilters] = useState(false);

  const {
    templates,
    isLoading,
    useTemplate,
    duplicateTemplate,
    deleteTemplate,
    getMostUsed,
    getRecent,
    getTemplatesByCategory,
    searchTemplates,
  } = useTemplates();

  // Filtered templates based on view mode and search
  const filteredTemplates = useMemo(() => {
    let result: JobTemplate[] = [];

    // Apply view mode filter
    switch (viewMode) {
      case "popular":
        result = getMostUsed(20);
        break;
      case "recent":
        result = getRecent(20);
        break;
      case "all":
        result = templates;
        break;
      default:
        // Category filter
        result = getTemplatesByCategory(viewMode as TemplateCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searchResults = searchTemplates(searchQuery);
      result = result.filter((t) => searchResults.some((s) => s.id === t.id));
    }

    return result;
  }, [
    viewMode,
    searchQuery,
    templates,
    getMostUsed,
    getRecent,
    getTemplatesByCategory,
    searchTemplates,
  ]);

  const handleUseTemplate = (template: JobTemplate) => {
    useTemplate(template.id);
    onUseTemplate(template);
  };

  const handleDuplicate = (template: JobTemplate) => {
    duplicateTemplate(template.id);
  };

  const handleDelete = (template: JobTemplate) => {
    if (window.confirm(`Delete template "${template.name}"?`)) {
      deleteTemplate(template.id);
    }
  };

  const viewModeOptions: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "popular", label: "Popular", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "recent", label: "Recent", icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  if (isLoading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4" data-testid="template-library">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Prompt Templates
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {templates.length} templates available
          </p>
        </div>
        <motion.button
          onClick={onCreateNew}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500 text-white text-xs font-medium hover:bg-cyan-400 transition-colors"
          data-testid="create-template-btn"
        >
          <Plus className="w-4 h-4" />
          New Template
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
            data-testid="template-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              data-testid="clear-search-btn"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/50 border border-zinc-800">
          {viewModeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setViewMode(option.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === option.id
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
              data-testid={`view-mode-${option.id}`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              showFilters || !["all", "popular", "recent"].includes(viewMode as string)
                ? "bg-purple-500/20 text-purple-400"
                : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
            data-testid="show-filters-btn"
          >
            <Filter className="w-3.5 h-3.5" />
            Category
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-2">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const count = getTemplatesByCategory(cat.id).length;
                const isActive = viewMode === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setViewMode(isActive ? "all" : cat.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all border ${
                      isActive
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                    data-testid={`category-filter-${cat.id}`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className="text-[10px] text-zinc-500">({count})</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          data-testid="templates-grid"
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
              onEdit={onEditTemplate}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <GlassCard>
          <EmptyStateIllustration
            variant="templates"
            title={searchQuery ? "No templates found" : "No templates yet"}
            description={
              searchQuery
                ? `No templates match "${searchQuery}". Try a different search term.`
                : "Create your first template to save time on repeated prompts."
            }
            ctaLabel="Create Template"
            ctaIcon={Plus}
            onCtaClick={onCreateNew}
            data-testid="empty-templates-state"
          />
        </GlassCard>
      )}
    </div>
  );
}
