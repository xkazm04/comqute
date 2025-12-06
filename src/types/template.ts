// Template categories for organization
export type TemplateCategory = "coding" | "writing" | "analysis" | "creative" | "custom";

// Template interface matching job structure but with metadata
export interface JobTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  // Template content
  prompt: string;
  systemPrompt?: string;
  // Parameter presets
  modelId: string;
  maxTokens: number;
  temperature: number;
  // Metadata
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  // Sharing - for future marketplace
  isPublic: boolean;
  author?: string;
  tags: string[];
}

// Request to create a new template
export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: TemplateCategory;
  prompt: string;
  systemPrompt?: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
  tags?: string[];
}

// Category display config
export interface CategoryConfig {
  id: TemplateCategory;
  label: string;
  icon: string;
  color: string;
}

// Category configurations
export const TEMPLATE_CATEGORIES: CategoryConfig[] = [
  { id: "coding", label: "Coding", icon: "💻", color: "cyan" },
  { id: "writing", label: "Writing", icon: "✍️", color: "purple" },
  { id: "analysis", label: "Analysis", icon: "📊", color: "emerald" },
  { id: "creative", label: "Creative", icon: "🎨", color: "amber" },
  { id: "custom", label: "Custom", icon: "⚡", color: "zinc" },
];

// Default templates to seed the library
export const DEFAULT_TEMPLATES: Omit<JobTemplate, "id" | "createdAt" | "updatedAt" | "usageCount" | "isPublic" | "author">[] = [
  {
    name: "Code Review",
    description: "Review code for bugs, performance issues, and best practices",
    category: "coding",
    prompt: "Please review the following code and provide feedback on:\n1. Potential bugs or errors\n2. Performance improvements\n3. Code style and best practices\n4. Security considerations\n\n```\n[Paste your code here]\n```",
    systemPrompt: "You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.",
    modelId: "gpt-oss-20b",
    maxTokens: 1000,
    temperature: 0.3,
    tags: ["code", "review", "debugging"],
  },
  {
    name: "Write Unit Tests",
    description: "Generate comprehensive unit tests for your code",
    category: "coding",
    prompt: "Write comprehensive unit tests for the following code. Include edge cases, error handling, and mock dependencies where needed.\n\n```\n[Paste your code here]\n```",
    systemPrompt: "You are a testing expert who writes thorough, maintainable unit tests following best practices like AAA (Arrange-Act-Assert) pattern.",
    modelId: "gpt-oss-20b",
    maxTokens: 1500,
    temperature: 0.2,
    tags: ["testing", "unit-tests", "code"],
  },
  {
    name: "Blog Post Writer",
    description: "Generate engaging blog posts on any topic",
    category: "writing",
    prompt: "Write a compelling blog post about [topic]. Include:\n- An attention-grabbing introduction\n- Clear sections with subheadings\n- Practical examples or insights\n- A strong conclusion with call-to-action\n\nTopic: ",
    systemPrompt: "You are a skilled content writer who creates engaging, well-structured blog posts that inform and captivate readers.",
    modelId: "gpt-oss-20b",
    maxTokens: 1500,
    temperature: 0.7,
    tags: ["blog", "content", "writing"],
  },
  {
    name: "Email Drafter",
    description: "Compose professional emails for any occasion",
    category: "writing",
    prompt: "Draft a professional email for the following situation:\n\nContext: [Describe the situation]\nTone: [formal/friendly/apologetic/persuasive]\nKey points to include: [List key points]\n\nRecipient: ",
    systemPrompt: "You are an expert at writing clear, professional emails that achieve their intended purpose while maintaining appropriate tone and etiquette.",
    modelId: "gpt-oss-20b",
    maxTokens: 500,
    temperature: 0.5,
    tags: ["email", "professional", "communication"],
  },
  {
    name: "Data Analysis",
    description: "Analyze datasets and extract meaningful insights",
    category: "analysis",
    prompt: "Analyze the following data and provide:\n1. Key patterns and trends\n2. Statistical insights\n3. Anomalies or outliers\n4. Actionable recommendations\n\nData:\n[Paste your data here]",
    systemPrompt: "You are a data analyst expert who excels at finding patterns, drawing insights, and making data-driven recommendations.",
    modelId: "gpt-oss-20b",
    maxTokens: 1200,
    temperature: 0.3,
    tags: ["data", "analysis", "insights"],
  },
  {
    name: "SWOT Analysis",
    description: "Perform a comprehensive SWOT analysis",
    category: "analysis",
    prompt: "Perform a detailed SWOT analysis for:\n\nSubject: [Company/Project/Product]\nContext: [Industry/Market/Situation]\n\nProvide specific, actionable insights for each quadrant.",
    systemPrompt: "You are a strategic business analyst who provides thorough, actionable SWOT analyses with specific recommendations.",
    modelId: "gpt-oss-20b",
    maxTokens: 1000,
    temperature: 0.4,
    tags: ["swot", "strategy", "business"],
  },
  {
    name: "Story Generator",
    description: "Create engaging short stories with rich narratives",
    category: "creative",
    prompt: "Write a short story with the following elements:\n\nGenre: [fantasy/sci-fi/mystery/romance/thriller]\nSetting: [Describe the setting]\nMain character: [Brief description]\nConflict: [What challenge do they face?]\n\nMake it engaging with vivid descriptions and meaningful dialogue.",
    systemPrompt: "You are a creative fiction writer who crafts compelling narratives with rich characters, vivid settings, and engaging plots.",
    modelId: "gpt-oss-20b",
    maxTokens: 2000,
    temperature: 0.9,
    tags: ["story", "fiction", "creative"],
  },
  {
    name: "Brainstorm Ideas",
    description: "Generate creative ideas and solutions",
    category: "creative",
    prompt: "Brainstorm creative ideas for:\n\nChallenge/Goal: [Describe what you need ideas for]\nConstraints: [Any limitations or requirements]\nTarget audience: [Who is this for?]\n\nGenerate 10 diverse, innovative ideas with brief explanations for each.",
    systemPrompt: "You are a creative strategist who generates innovative, practical ideas by thinking outside the box while considering real-world constraints.",
    modelId: "gpt-oss-20b",
    maxTokens: 1000,
    temperature: 0.8,
    tags: ["brainstorm", "ideas", "innovation"],
  },
];
