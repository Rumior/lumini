/**
 * LUMINI Insights - page-level types.
 *
 * These describe ONLY what InsightsPage needs. The host app owns real business,
 * finance, action and navigation state and must MAP it into these shapes.
 */

/* ---------- Page-level contracts ---------- */

export type EvidenceKind =
  | "reported"
  | "calculated"
  | "external"
  | "estimate"
  | "assumption"
  | "unknown"
  | "sample";

export type InsightPriority = "high" | "medium" | "informational";

export type EvidenceItem = {
  label: string;
  kind: EvidenceKind;
  sourceTitle?: string;
  sourceUrl?: string;
  dateLabel?: string;
  explanation?: string;
  /** "direct" = supports the claim; "context" = background only. */
  support?: "direct" | "context";
};

export type Recommendation = {
  action: string;
  rationale?: string;
  expectedBenefit?: string;
  costEffort?: string;
  risks?: string[];
  unknowns?: string[];
  firstStep?: string;
  successMeasure?: string;
  reviewTiming?: string;
};

export type Insight = {
  id: string;
  title: string;
  summary: string;
  category: string;
  priority: InsightPriority;
  evidenceKind: EvidenceKind;
  periodLabel?: string;
  updatedAt?: string;
  whyItMatters?: string;
  evidence?: EvidenceItem[];
  /** Calculations/assumptions shown in the expandable section. */
  calculations?: string[];
  recommendation?: Recommendation;
  /** IDs of LibraryResource items related to this insight. */
  relatedResourceIds?: string[];
};

export type ResourceType =
  | "guide"
  | "checklist"
  | "template"
  | "calculator"
  | "playbook"
  | "external";

export type ResourceStatus = "draft" | "reviewed" | "published" | "sample";

export type LibraryResource = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: ResourceType;
  status: ResourceStatus;
  /** Only when measured or reasonably defined. */
  timeLabel?: string;
  source?: string;
  reviewedLabel?: string;
  tags?: string[];
  /** In-page readable content. When present, the library offers "Read guide" with no host handler needed. */
  body?: { intro?: string; steps: Array<{ title: string; text: string }>; tip?: string };
  /** If present, "Open resource" is enabled and calls onOpenResource. */
  href?: string;
};

export type ReportSummary = {
  id: string;
  title: string;
  periodLabel: string;
  sourceCoverage?: string;
  whatChanged?: string[];
  whatItMeans?: string[];
  nextActions?: string[];
  unresolvedQuestions?: string[];
};

export type BusinessSummary = {
  sector?: string;
  stageLabel?: string;
  /** Only a few contextual signals - values must be pre-formatted by host formatters. */
  signals?: Array<{ label: string; value: string; note?: string }>;
};

export type DataStatus = {
  hasEnoughData: boolean;
  missingInputs?: string[];
  lastUpdatedLabel?: string;
};

export type InsightsLoadState = "ready" | "loading" | "error";

/* ---------- Host mapping targets ---------- */

export type NavigationDestination = "business" | "finances" | "plans" | "mentor";

/** Map to your real Action schema inside onCreateAction. */
export type CreateActionInput = {
  title: string;
  area: string;
  insightId: string;
  note?: string;
  successMeasure?: string;
  reviewTiming?: string;
 expectedBenefit?: string; };

export type AskLuminiContext = { insightId: string; question: string };

export type InsightsPageProps = {
  businessName?: string;
  businessSummary?: BusinessSummary;
  insights: Insight[];
  resources: LibraryResource[];
  reportSummary?: ReportSummary;
  dataStatus?: DataStatus;
  loadState?: InsightsLoadState;
  onRetry?: () => void;
  onNavigate: (destination: NavigationDestination) => void;
  /** Must call the real action-creation flow. Page shows "added" only after this returns without throwing. */
  onCreateAction?: (input: CreateActionInput) => void;
  onExportReport?: () => void;
  onAskLumini?: (context: AskLuminiContext) => void;
  onOpenResource?: (resource: LibraryResource) => void;
  /** Pass true only if the host has real, live market research connected. */
  marketResearchConnected?: boolean;
};
