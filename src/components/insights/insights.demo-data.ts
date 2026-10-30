/**
 * DEMO / PREVIEW DATA ONLY. Illustrative content - not real business results.
 * Delete this file before production. Never mix with real business data.
 */
import type { Insight, LibraryResource, ReportSummary, DataStatus } from "./insights.types";

export const demoInsights: Insight[] = [
  {
    id: "demo-cash-timing",
    title: "Cash timing needs review",
    summary:
      "Operating profit looks positive, but nothing explains when customer payments arrive or when supplier bills fall due.",
    category: "Cash flow",
    priority: "high",
    evidenceKind: "sample",
    whyItMatters:
      "A profitable business can still run short of cash if money arrives after obligations are due.",
    evidence: [
      { label: "Saved financial inputs", kind: "sample", explanation: "Demo item - collection period not provided.", support: "direct" },
    ],
    calculations: ["No calculation shown: required inputs are missing."],
    recommendation: {
      action: "Record expected customer receipts and supplier payment dates for the next 13 weeks.",
      rationale: "A dated list shows whether any week is likely to fall short.",
      costEffort: "About an hour to set up; a few minutes weekly.",
      risks: ["Early figures may be rough guesses."],
      unknowns: ["Average collection time", "Upcoming supplier payments"],
      firstStep: "List the five largest unpaid invoices with expected payment dates.",
      successMeasure: "Every week in the next quarter has a known cash position.",
      reviewTiming: "Review in four weeks.",
    },
    relatedResourceIds: ["starter-cash-13wk"],
  },
  {
    id: "demo-margin",
    title: "Pricing may be leaving margin unused",
    summary: "Gross margin looks high relative to typical retail ranges, which can mean room to adjust price or invest in growth.",
    category: "Performance",
    priority: "medium",
    evidenceKind: "sample",
    whyItMatters: "Small price changes compound across every unit sold.",
    evidence: [{ label: "Scenario gross margin", kind: "sample", explanation: "Demo figure, not a real result.", support: "context" }],
    recommendation: {
      action: "Test a modest price change on your best-selling product and watch volume for a month.",
      rationale: "A contained test limits downside while giving real data.",
      risks: ["Customers may react to price changes."],
      unknowns: ["Price sensitivity of your customers"],
      firstStep: "Choose one product and record its current weekly sales.",
      successMeasure: "Gross profit per week stays flat or improves.",
      reviewTiming: "Review after four weeks.",
    },
  },
  {
    id: "demo-data-gap",
    title: "Customer information is incomplete",
    summary: "Add your main customer groups so Lumini can compare where revenue comes from.",
    category: "Data gap",
    priority: "informational",
    evidenceKind: "unknown",
  },
];

export const demoResources: LibraryResource[] = [
  { id: "starter-cash-13wk", title: "Weekly cash check", description: "A short checklist for reviewing money in and out each week.", category: "Finance and money management", type: "checklist", status: "sample", tags: ["cash", "weekly"] },
  { id: "demo-pricing", title: "Pricing worksheet", description: "Work out a price that covers costs and leaves a margin.", category: "Finance and money management", type: "template", status: "sample", tags: ["price", "margin"] },
  { id: "demo-stock", title: "Stock count routine", description: "A simple routine to keep inventory records accurate.", category: "Operations and inventory", type: "guide", status: "sample", tags: ["inventory"] },
];

export const demoReport: ReportSummary = {
  id: "demo-report",
  title: "Sample review",
  periodLabel: "Sample period",
  sourceCoverage: "Demo content only",
  whatChanged: ["Sample change."],
  whatItMeans: ["Sample interpretation."],
  nextActions: ["Sample action."],
  unresolvedQuestions: ["Sample open question."],
};

export const demoDataStatus: DataStatus = {
  hasEnoughData: false,
  missingInputs: ["Average collection time", "Supplier payment dates", "Main customer groups"],
};
