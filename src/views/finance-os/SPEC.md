# Lumini Finance OS — Home Dashboard UI Specification

## 1. Purpose and product vision

Design the **Finance OS home screen** for Lumini, a business financial command centre for small businesses, growing companies, service businesses, retailers, and contractors managing construction or other projects.

The home screen is the face of the Finance OS. It must help an owner or authorized finance user quickly understand:

1. How the business is performing financially.
2. How much usable cash it has now and how cash may change in the future.
3. What money is owed to the business and what the business must pay.
4. How existing loans and repayments are affecting the business.
5. Whether a proposed loan may be financially sensible.
6. Which financial issues need attention and what to do next.
7. Where to go to use each dedicated Finance OS module.

**Core product promise:** “Know where your business stands, understand where it is heading, and make better financial decisions before problems arise.”

This specification is for the **home dashboard UI**, not the full implementation of every module. Build a polished, believable, responsive interface with clear navigation to dedicated modules. Do not imply that data integrations or functionality exist unless they are implemented. Use clearly marked sample data in the design prototype and make it straightforward to replace it with live API data later.

## 2. Design principles

- **Premium, professional financial SaaS:** clean, confident, modern, calm, and trustworthy.
- **Action-oriented:** explain what needs attention, why it matters, and the next step.
- **Readable at a glance:** prioritize a few important metrics and avoid overcrowding.
- **Data integrity first:** distinguish actuals, estimates, forecasts, and manually reported figures.
- **Transparent intelligence:** AI insights must show supporting evidence, assumptions, and links to relevant details.
- **Consistent navigation:** dashboard cards and quick actions lead to dedicated modules.
- **Progressive disclosure:** show summaries first; reveal detailed breakdowns when a user drills down.
- **Responsive:** excellent on desktop, tablet, and mobile.
- **Accessible:** semantic headings, keyboard support, visible focus states, adequate contrast, meaningful icons, and non-color indicators for statuses.
- **Organization-aware:** the selected business or organization must be clear. Do not mix data across organizations.
- **Currency-aware:** display the organization's configured currency; use KES / KSh in the default demo data, but do not hard-code KES throughout the product.
- **Avoid false precision:** do not show made-up financial values as real data. Prototype figures must be labeled as sample/demo data. Real UI must support loading, empty, error, stale-data, and partial-data states.

## 3. Overall page layout

Create a desktop-first dashboard that also works smoothly on smaller screens. Recommended page hierarchy:

1. Main application navigation / Finance OS context.
2. Page title and reporting controls.
3. Primary KPI cards.
4. Financial intelligence / prioritized actions.
5. Cash-flow forecast and upcoming obligations.
6. Loan health summary.
7. Financial performance and budget comparison.
8. Receivables and payables snapshot.
9. Quick actions.
10. Finance module navigation grid.
11. Optional recent activity and data-quality status.

Keep the most decision-useful information near the top. Do not force every detailed report onto the home screen.

## 4. Header and reporting controls

At the top of the content area, show:

- Page title: **Finance OS**
- Subtitle: **Business financial command centre**
- Selected organization/business name and a clear organization switcher if supported.
- Reporting period selector with options such as This month, Last month, This quarter, This year, Custom range.
- Currency display based on organization settings.
- Last-updated / data freshness indicator.
- A refresh control if supported.
- A visible “data status” indicator such as “Synced”, “Needs review”, “Partial data”, or “Demo data”.
- Optional export/report action if supported.

Reporting period should affect period-based metrics and charts. Cash balance and debt balance should be labeled as point-in-time values, not treated as period totals. The UI must not imply a successful sync when no live connection exists.

## 5. Primary financial overview cards

Use a clear, responsive KPI grid. Four core cards should be visually prominent:

### 5.1 Revenue
- Show recognized revenue for the selected period.
- Show comparison to the prior equivalent period where data exists.
- Optionally show a trend indicator.
- Label as “Revenue” or “Recognized revenue” to distinguish it from cash collected.
- Link to Sales & Receivables or financial reports.

### 5.2 Operating profit
- Show operating profit for the selected period.
- Clearly define whether this is before financing costs and tax.
- Show margin and period comparison if available.
- Link to Reports & Analytics.

### 5.3 Available cash
- Show available/unrestricted cash based on verified cash and bank records.
- If balances are not reconciled, show a “Needs reconciliation” state.
- Distinguish cash on hand from forecast cash.
- Link to Cash & Banking.

### 5.4 Outstanding debt
- Show remaining principal across recorded loans as of the current date.
- Do not include the original loan amount as though it were still outstanding.
- Optionally show next repayment date and total scheduled repayments due in the next 30 days.
- Link to Loans & Financing.

Additional optional KPIs, depending on screen size and data availability:
- Gross profit / gross margin.
- Net profit after financing costs and applicable taxes.
- Accounts receivable.
- Accounts payable.
- Budget variance.
- Projected minimum cash balance or cash runway.
- Debt-service coverage ratio (DSCR), only if the required figures are available and clearly defined.

Every KPI card should:
- Have a clear title, formatted value, period/as-of label, and short contextual comparison if available.
- Use a consistent visual hierarchy and restrained icons.
- Be clickable when a relevant destination exists.
- Have loading skeleton, no-data, and error states.
- Never display a fabricated value as a live metric.

## 6. Financial Intelligence panel — a defining feature

Give this panel strong prominence near the top of the dashboard. It is the area where Lumini turns financial data into practical decisions.

Panel heading: **Lumini Financial Intelligence**
Supporting copy: **Your next best financial actions**

Display a short list of prioritized findings. Each insight should include:

- Severity/priority: Information, Attention, High risk, or Urgent.
- A concise title that describes the finding.
- The evidence: the actual value, time period, and relevant comparison or forecast.
- Why it matters to the business.
- A concrete recommended next action.
- A link/button to inspect the supporting records or open the relevant module.
- Optional confidence indicator and missing-data note.
- Timestamp or period to show how current the finding is.

Examples to use in a clearly labeled demo/prototype:
- **Cash-flow risk:** forecast cash may fall below the business's minimum reserve in a future month.
- **Overdue receivables:** certain invoices are overdue and are delaying expected cash collections.
- **Loan pressure:** upcoming debt payments may leave insufficient cash for normal operating obligations.
- **Budget variance:** spending in a category is above its budget.
- **Investment decision:** a proposed equipment purchase needs downside testing before the business commits.

Do not use generic statements like “Your finances need attention” without evidence. Do not make AI insights sound certain if data is incomplete. Include an empty state such as “No high-priority issues identified from the available data” plus a note that this is not a guarantee of financial health.

### Loan-related intelligence in this panel

Examples:
- “Your forecast shows a cash shortfall in Month X after scheduled debt payments.”
- “The proposed loan may breach your minimum cash reserve under the downside scenario.”
- “The investment's expected incremental cash flow does not yet cover its projected loan repayment.”
- “Your existing loan repayment schedule has a payment due soon; review the funding source.”

Each loan insight must explain what data supports it, show assumptions, and link to Loans & Financing. The UI should never give a definitive borrowing recommendation from revenue alone.

## 7. Cash-flow command centre

Include a compact but useful cash-flow section showing current position and projected movement.

Recommended elements:
- Current available cash.
- Forecast closing cash at the end of the selected horizon.
- Projected minimum cash balance.
- Cash inflows and outflows over time, preferably a clear line/area chart.
- Forecast horizon control such as 30 days, 90 days, 6 months, 12 months.
- Breakdown of major expected inflows and outflows:
  - Customer collections.
  - Supplier payments.
  - Payroll and people costs.
  - Rent and operating expenses.
  - Tax obligations.
  - Loan principal, interest, and fees.
  - Capital expenditure / planned investments.
- Visible minimum-reserve threshold on the chart when configured.
- Clear legend distinguishing actual historical values from forecast values.
- Link to Cash & Banking or Budgets & Forecasts.

The chart should not imply certainty. Visually distinguish actual data from projections and label forecast assumptions. If a reliable forecast cannot be generated, show an explanatory empty state and prompt the user to complete the missing inputs.

## 8. Loans & Financing summary

Loans must be a first-class feature of Finance OS, not just an expense category.

The home dashboard should contain a compact loan health card or panel with:
- Total outstanding loan principal.
- Total scheduled repayments due in the next 30 days.
- Next repayment date and status, where available.
- Number of active loans.
- An affordability / repayment pressure status based on defined rules and available data.
- A small visual indicator of scheduled repayments versus forecast cash, if meaningful.
- Primary CTA: **Review loans**
- Secondary CTA: **Assess a new loan**

Use status labels such as “On track”, “Needs review”, or “At risk” only when supported by explicit calculations and rules. If loan data is incomplete, say so rather than assigning an unjustified status.

### 8.1 Assess a new loan flow

The dashboard's “Assess a new loan” action should open a dedicated Loans & Financing flow or simulator, not pretend the assessment happens entirely on the home page. The flow should eventually assess:
- Proposed amount and net proceeds after fees.
- Interest rate and whether fixed or variable.
- Repayment frequency, term, fees, insurance, legal costs, penalties, collateral costs, and balloon payments.
- Existing loan balances and schedules.
- Verified cash reserves and restricted funds.
- Payroll, supplier bills, taxes, operating expenses, and other near-term commitments.
- Business forecasts, customer collection timing, seasonality, and project cash flows.
- Purpose and use of the borrowed funds.
- Expected incremental revenue, operating costs, savings, cash generation, payback period, and return on investment.
- Expected, downside, and severe-stress scenarios.

The loan engine should provide a reasoned recommendation such as consider borrowing, borrow less, defer, refinance, or avoid borrowing. It should show a defensible amount/range only when the evidence supports it, the sustainable repayment level, total borrowing cost, monthly cash impacts, reserve breaches, investment return, key risks, and conditions required before proceeding.

It must not equate mathematical repayment capacity with loan approval or commercial wisdom. It must explain missing data and assumptions. The home screen should summarize this analysis and link to the detailed assessment.

## 9. Receivables and payables snapshot

Include two compact panels or a combined section:

### Receivables
- Total outstanding customer invoices.
- Overdue amount.
- Amount expected to be collected in the near term.
- Oldest overdue invoice or key customer risks, where permissions allow.
- CTA: **View receivables** or **Create invoice**.

### Payables
- Total outstanding supplier bills.
- Amount due in the next 7 / 30 days.
- Overdue payables.
- Upcoming high-priority obligations.
- CTA: **View payables** or **Record expense**.

These summaries must be based on invoice/bill records and payment status. Do not infer receivables from every incoming transaction or payables from every outgoing transaction.

## 10. Budget and performance snapshot

Include a compact chart or category list showing actual versus budget for the selected period. Useful categories may include:
- Revenue.
- Direct costs / cost of sales.
- Payroll.
- Rent and utilities.
- Marketing.
- Transport and logistics.
- Financing costs.
- Other operating expenses.

Show variance as an amount and percentage where meaningful, with clear favorable/unfavorable semantics. Do not color a positive expense variance as favorable if it means overspending. Link to Budgets & Forecasts and Reports & Analytics.

If no budget exists, show an actionable empty state: “Create a budget to compare actual performance against plan.”

## 11. Quick actions

Provide prominent shortcuts for common tasks. Suggested actions:
- Record transaction.
- Create invoice.
- Record expense / supplier bill.
- Reconcile bank account.
- Assess a new loan.
- Create budget or forecast.
- Generate financial report.
- Ask Lumini.

Only show actions that are supported or explicitly presented as prototype navigation. Clicking each action must lead somewhere meaningful—open the appropriate modal, route, or workflow. Do not use decorative, nonfunctional buttons.

## 12. Finance OS module navigation grid

The home screen should have a clearly titled **Finance workspace** or **Explore Finance OS** section containing cards that navigate to dedicated modules. Each card needs an icon, name, short description, and visible interaction affordance. Cards should be consistent, responsive, and keyboard accessible.

Required module cards:

1. **Accounting & Ledger** — transactions, chart of accounts, journals, general ledger, account balances, period closing, classifications, and audit history.
2. **Sales & Receivables** — sales, invoices, credit notes, collections, customer balances, and revenue.
3. **Purchases & Expenses** — supplier bills, operating costs, payments, approvals, and expense categories.
4. **Cash & Banking** — cash accounts, bank feeds/imports, reconciliations, cash forecasts, and transfers.
5. **Loans & Financing** — loan portfolio, repayment schedules, affordability, comparisons, refinancing, investment analysis, and risk scenarios.
6. **Budgets & Forecasts** — budgets, cash-flow forecasts, scenario planning, targets, and actual-versus-plan analysis.
7. **Reports & Analytics** — profit and loss, balance sheet, cash-flow statement, margin analysis, KPIs, and exportable reports.
8. **AI Finance Mentor** — financial questions, evidence-based recommendations, explanations, alerts, and action tracking.
9. **Payroll & People Costs** — payroll obligations, staff costs, and labor forecasts. Respect local law and permissions.
10. **Inventory & Costing** — inventory, stock valuation, cost of goods sold, product costing, margins, and working capital.
11. **Tax & Compliance** — tax estimates, obligations, filing calendar, supporting records, and compliance settings. Do not imply official filing capability unless implemented.
12. **Assets & Financing** — fixed assets, depreciation, equipment investments, leasing, and capital expenditure.
13. **Project Finance** — project budgets, committed costs, project cash flow, progress claims, retention, variations, and profitability for construction or other project types. Integrate with Lumini's universal project-management core where available.
14. **Finance Settings** — financial year, base currency, account mappings, reporting preferences, access permissions, reserve thresholds, and accounting policies.

The grid can use grouped sections or responsive cards to avoid overwhelming smaller screens. Show unavailable modules as “Coming soon” only if that status is truthful. Do not present unfinished functionality as fully operational.

## 13. Recent activity and data quality

A small recent-activity section can show:
- Recently posted transactions.
- Recent invoice payments.
- Loan repayments recorded.
- Reconciliations completed.
- Changes to financial forecasts.
- Important finance settings changes.

Every activity item should show a date/time, meaningful description, amount where appropriate, and a link to the record. Respect role-based permissions and do not expose sensitive financial details to unauthorized users.

Include data-quality indicators for:
- Last successful sync.
- Unreconciled bank transactions.
- Missing loan terms or repayment schedules.
- Missing forecast inputs.
- Unclassified transactions.
- Differences between ledger-derived and manually reported financial figures.

A data warning should be actionable and should explain how to resolve the issue.

## 14. Visual design and design system

Use a polished, restrained enterprise SaaS style:
- Clean light interface by default, with compatibility for the app's existing theme.
- Deep navy/charcoal text, neutral surfaces, subtle borders, and generous whitespace.
- Use the existing Lumini brand colors if they are already established in the codebase. If not, choose one restrained primary color and a consistent neutral palette.
- Use semantic status colors sparingly: green for supported positive states, amber for caution, red for high risk, and neutral for information. Never rely on color alone.
- Rounded cards with subtle borders/shadows, not excessive gradients or heavy glass effects.
- Consistent spacing, typography, number formatting, and icon style.
- Use tabular numerals for financial values.
- Align currency values consistently and abbreviate large values only when exact values are accessible.
- Charts should have readable axes, legends, tooltips, clear units, and labels that distinguish actual from forecast.
- Avoid oversized decorative charts, excessive badges, too many competing colors, and excessive card nesting.
- Use concise labels and avoid unexplained accounting jargon. Provide tooltips or helper text for DSCR, gross margin, operating profit, and other specialized terms.

The interface should feel suitable for a business owner making real financial decisions, not a generic crypto-trading dashboard.

## 15. Responsive behavior

### Desktop
- Use a balanced grid with the KPI cards across the top.
- Place financial intelligence and cash-flow forecasting prominently.
- Place loans, receivables/payables, and budget snapshots in well-organized sections.
- Show the module navigation grid below the most important decision information.

### Tablet
- Reflow the KPI cards into two columns.
- Stack panels where needed.
- Keep loan alerts and primary actions easy to find.

### Mobile
- Use a single-column layout with compact KPI cards.
- Put high-priority financial alerts and upcoming obligations near the top.
- Use horizontally scrollable charts only if accessible and clearly signaled; prefer charts that reflow.
- Make buttons/cards comfortably tappable.
- Avoid wide tables; use stacked rows or dedicated detail screens.
- Keep organization, period, currency, and data-status controls accessible without consuming excessive space.

## 16. Interaction requirements

The prototype should demonstrate real navigation and UI behavior where possible:
- Reporting period selector updates visible labels and sample chart ranges.
- Forecast horizon selector updates the displayed horizon.
- KPI cards navigate to relevant module/detail views.
- Quick actions open the corresponding form, modal, or route.
- Module cards navigate to their destinations.
- Insight actions open the evidence/detail view.
- Loan assessment CTA opens a simulator or clearly marked prototype flow.
- Tooltips explain metric definitions.
- Loading, empty, error, stale, and partial-data states are designed, not left to chance.

If building only the home screen, routes to modules not yet implemented can lead to a clearly labeled placeholder screen, but the interaction should still be deliberate. Do not build dead buttons.

## 17. Accounting and financial correctness requirements

These are non-negotiable even for the visual design:
- Revenue is not the same as cash received.
- Loan proceeds are liabilities, not revenue.
- Principal repayment reduces loan principal; interest and fees are accounted for separately.
- Transfers between company accounts are not revenue or expenses.
- Outstanding debt means remaining principal, not total future installments unless explicitly labeled.
- Available cash must distinguish restricted funds and unreconciled balances where known.
- Operating profit, net profit, and cash flow must not be conflated.
- Forecast figures must be visibly identified as estimates.
- Reported figures and ledger-derived values must have a visible source/status when they differ.
- Financial calculations should be performed by tested logic, not guessed by an AI text response.
- Recommendations must use authorized, organization-scoped data and show assumptions.
- Missing or unreliable data should reduce the confidence of the recommendation, not be silently filled with invented numbers.

## 18. Security, privacy, and permissions

Design for a multi-organization application:
- Only show records for the currently selected organization and the user's authorized scope.
- Show financial actions based on the user's role and permissions.
- Hide sensitive fields and actions from unauthorized roles.
- Confirm high-impact actions such as posting, deleting, or changing loan terms.
- Do not expose credentials, account identifiers, or unnecessary sensitive data in activity feeds.
- Treat financial recommendations and loan scenarios as private business information.
- Provide clear confirmation/error feedback for mutations.

The UI does not replace backend authorization. Every API endpoint must enforce access server-side.

## 19. Suggested component structure

Use the existing frontend framework and project conventions. A possible conceptual breakdown:

- `FinanceDashboardPage`
- `FinancePageHeader`
- `FinancePeriodControls`
- `FinanceKpiGrid`
- `FinanceKpiCard`
- `FinancialIntelligencePanel`
- `FinancialInsightCard`
- `CashFlowForecastPanel`
- `CashFlowChart`
- `LoanHealthPanel`
- `ReceivablesPayablesPanel`
- `BudgetPerformancePanel`
- `FinanceQuickActions`
- `FinanceModuleGrid`
- `FinanceModuleCard`
- `RecentFinanceActivity`
- `FinanceDataQualityStatus`

These are suggested names, not mandatory filenames. Reuse existing components and styling conventions where possible. Avoid duplicating shared logic or building a second data-access layer if the application already has one.

## 20. Data contract expectations

The UI should be designed to consume structured API data rather than embedding business logic in components. Conceptually, the dashboard needs data such as:

- Organization identity and configured currency.
- Selected reporting period and data freshness.
- Revenue, gross profit, operating profit, net profit, and margins.
- Cash and bank balances with reconciliation status.
- Receivables and payables totals, overdue amounts, and due-date buckets.
- Loan balances, upcoming repayments, repayment status, and risk indicators.
- Actual-versus-budget values.
- Time series for cash flow and financial performance.
- Prioritized insights with evidence, assumptions, confidence, and destination links.
- Recent activity.
- Data-quality warnings.

The actual API response shape must be agreed with and implemented by the backend developer. Do not invent endpoints and assume they already exist. Inspect existing routes and schemas before wiring the UI to live data. Use explicit TypeScript types, robust loading/error states, and clear separation between API models and display formatting.

## 21. Demo data and empty states

If the AI UI tool needs sample data:
- Use plausible values but label the entire screen “Demo data” or “Sample business”.
- Do not use demo data in a way that could be mistaken for a connected user's live finances.
- Include examples of healthy, cautionary, and high-risk states.
- Include a no-data onboarding state that prompts the user to connect/import accounts, enter opening balances, add loans, or record transactions.
- Include partial-data states where some metrics are unavailable.
- Include a clear distinction between “not available”, zero, and not yet configured.

## 22. Accessibility and quality checklist

Before considering the UI finished, verify:
- Keyboard navigation and visible focus.
- Semantic page title and heading hierarchy.
- Accessible labels for controls and chart summaries.
- Contrast and non-color status indicators.
- Responsive layouts at common desktop, tablet, and mobile widths.
- Financial values are readable and consistently formatted.
- All visible buttons, links, selectors, and cards have meaningful behavior.
- Loading, empty, error, stale, and partial-data states are designed.
- No false live-data claims.
- The most important warnings and actions are visible without excessive scrolling.
- Navigation labels and module descriptions are understandable to non-accountants.

## 23. Definition of done

The Finance OS home screen is ready when:
1. It feels like the central command centre for the entire business's finances.
2. The financial overview clearly distinguishes revenue, profit, cash, receivables, payables, and debt.
3. Financial intelligence prioritizes evidence-backed actions and explains why they matter.
4. Cash forecasts distinguish actuals from projections.
5. Loan health and new-loan assessment are prominent, connected to cash flow, and linked to a dedicated financing workflow.
6. The module grid makes all Finance OS areas discoverable.
7. All visible interactions work or lead to intentionally labeled prototype destinations.
8. The layout works on desktop, tablet, and mobile.
9. Demo values are clearly labeled and can be replaced with live organization-scoped data.
10. The UI preserves financial correctness, security expectations, and trust.

## 24. Final instruction to the UI-building AI

Build a complete, polished **Lumini Finance OS home dashboard UI** from this specification. Prioritize visual clarity, real-world usability, credible financial decision-making, and responsive behavior. Keep the screen modular so dedicated Finance OS sections can be developed independently and integrated later.

Do not reduce the product to a generic bookkeeping dashboard. The home screen must communicate that Lumini combines accounting visibility, cash-flow planning, debt and loan intelligence, financial forecasting, business performance analysis, and an AI financial mentor in one unified workspace.

Do not claim the UI is connected to a real database unless the integration is actually implemented and verified. Do not invent financial facts, API endpoints, or completed capabilities. If the tool only creates a frontend prototype, use clearly labeled demo data and deliver a coherent, navigable prototype with clean component structure.
