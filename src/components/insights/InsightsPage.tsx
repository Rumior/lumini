import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  EvidenceKind,
  Insight,
  InsightPriority,
  InsightsPageProps,
  LibraryResource,
} from "./insights.types";

const EVIDENCE_LABEL: Record<EvidenceKind, string> = {
  reported: "Reported",
  calculated: "Calculated",
  external: "External source",
  estimate: "Estimate",
  assumption: "Assumption",
  unknown: "Unknown / missing",
  sample: "Sample data",
};
const PRIORITY_LABEL: Record<InsightPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  informational: "Informational",
};
const PRIORITY_ORDER: Record<InsightPriority, number> = { high: 0, medium: 1, informational: 2 };
const INSIGHT_PAGE_SIZE = 100;
const RESOURCE_PAGE_SIZE = 100;

type MainView = "insights" | "library" | "reports" | "market";
type DetailTab = "recommendation" | "evidence" | "risks" | "measure";
type PriorityFilter = "all" | InsightPriority;

const MAIN_VIEWS: Array<{ id: MainView; label: string }> = [
  { id: "insights", label: "Insights" },
  { id: "library", label: "Library" },
  { id: "reports", label: "Reports" },
  { id: "market", label: "Market" },
];
const DETAIL_TABS: Array<{ id: DetailTab; label: string }> = [
  { id: "recommendation", label: "Recommendation" },
  { id: "evidence", label: "Evidence" },
  { id: "risks", label: "Risks and unknowns" },
  { id: "measure", label: "Measuring success" },
];

function Block({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`li-block${wide ? " li-block--wide" : ""}`}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function Pager({
  page,
  pages,
  from,
  to,
  total,
  onChange,
  label,
}: {
  page: number;
  pages: number;
  from: number;
  to: number;
  total: number;
  onChange: (p: number) => void;
  label: string;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="li-pager" aria-label={label}>
      <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onChange(page - 1)}>
        ‹
      </button>
      <span>
        {from}–{to} of {total}
      </span>
      <button type="button" aria-label="Next page" disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>
        ›
      </button>
    </nav>
  );
}

function DetailPanel({ insight, tab, resources }: { insight: Insight; tab: DetailTab; resources: LibraryResource[] }) {
  const rec = insight.recommendation;
  const related = resources.filter((r) => insight.relatedResourceIds?.includes(r.id));
  const blocks: ReactNode[] = [];

  if (tab === "recommendation") {
    if (rec?.action) blocks.push(<Block key="a" title="What Lumini recommends" wide><p>{rec.action}</p></Block>);
    if (rec?.rationale) blocks.push(<Block key="r" title="Why it fits this business"><p>{rec.rationale}</p></Block>);
    if (rec?.expectedBenefit) blocks.push(<Block key="b" title="Expected benefit"><p>{rec.expectedBenefit}</p></Block>);
    if (rec?.firstStep) blocks.push(<Block key="f" title="First action"><p>{rec.firstStep}</p></Block>);
    if (related.length > 0)
      blocks.push(
        <Block key="rel" title="Related resources">
          <ul>{related.map((r) => <li key={r.id}>{r.title}</li>)}</ul>
        </Block>
      );
  }
  if (tab === "evidence") {
    blocks.push(
      <Block key="e" title="Evidence used" wide>
        {insight.evidence && insight.evidence.length > 0 ? (
          <ul className="li-ev">
            {insight.evidence.map((e, i) => (
              <li key={`${insight.id}-e-${i}`}>
                <span className="li-kind">{EVIDENCE_LABEL[e.kind]}</span>
                <b>{e.label}</b>
                {e.support && (
                  <span className="li-muted"> · {e.support === "direct" ? "directly supports" : "background only"}</span>
                )}
                {(e.sourceTitle || e.dateLabel || e.explanation) && (
                  <small>
                    {e.sourceUrl && e.sourceTitle ? (
                      <a href={e.sourceUrl} target="_blank" rel="noreferrer noopener">{e.sourceTitle}</a>
                    ) : (
                      e.sourceTitle
                    )}
                    {e.sourceTitle && (e.dateLabel || e.explanation) ? " · " : ""}
                    {e.dateLabel}
                    {e.dateLabel && e.explanation ? " · " : ""}
                    {e.explanation}
                  </small>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="li-muted">No source details were provided for this insight.</p>
        )}
      </Block>
    );
    if (insight.calculations && insight.calculations.length > 0)
      blocks.push(
        <Block key="c" title="Calculations and assumptions" wide>
          <ul>{insight.calculations.map((c, i) => <li key={`${insight.id}-c-${i}`}>{c}</li>)}</ul>
        </Block>
      );
  }
  if (tab === "risks") {
    if (rec?.risks?.length)
      blocks.push(<Block key="k" title="Risks and trade-offs"><ul>{rec.risks.map((r, i) => <li key={i}>{r}</li>)}</ul></Block>);
    if (rec?.unknowns?.length)
      blocks.push(<Block key="u" title="What is still unknown"><ul>{rec.unknowns.map((r, i) => <li key={i}>{r}</li>)}</ul></Block>);
    if (rec?.costEffort) blocks.push(<Block key="ce" title="Cost and effort" wide><p>{rec.costEffort}</p></Block>);
  }
  if (tab === "measure") {
    if (rec?.successMeasure) blocks.push(<Block key="s" title="How success will be measured"><p>{rec.successMeasure}</p></Block>);
    if (rec?.reviewTiming) blocks.push(<Block key="t" title="When to review the result"><p>{rec.reviewTiming}</p></Block>);
  }

  return (
    <div className="li-panel" role="tabpanel" id="li-detail-panel" aria-labelledby={`li-tab-${tab}`}>
      {blocks.length > 0 ? <div className="li-cols">{blocks}</div> : <p className="li-muted">Nothing has been provided for this section yet.</p>}
    </div>
  );
}

export function InsightsPage(props: InsightsPageProps) {
  const {
    businessName,
    insights,
    resources,
    reportSummary,
    dataStatus,
    loadState = "ready",
    onRetry,
    onNavigate,
    onCreateAction,
    onExportReport,
    onAskLumini,
    onOpenResource,
    marketResearchConnected = false,
  } = props;

  const [view, setView] = useState<MainView>("insights");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [listPage, setListPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>("recommendation");
  const [addedIds, setAddedIds] = useState<ReadonlySet<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [libPage, setLibPage] = useState(0);
  const [readingId, setReadingId] = useState<string | null>(null);
  const reading = resources.find((r) => r.id === readingId && r.body) ?? null;

  const sorted = useMemo(
    () => [...insights].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [insights]
  );
  const filtered = priorityFilter === "all" ? sorted : sorted.filter((i) => i.priority === priorityFilter);
  const listPages = Math.max(1, Math.ceil(filtered.length / INSIGHT_PAGE_SIZE));
  const safeListPage = Math.min(listPage, listPages - 1);
  const pageRows = filtered.slice(safeListPage * INSIGHT_PAGE_SIZE, (safeListPage + 1) * INSIGHT_PAGE_SIZE);
  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  const categories = useMemo(() => Array.from(new Set(resources.map((r) => r.category))).sort(), [resources]);
  const filteredResources = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (category && r.category !== category) return false;
      if (!q) return true;
      return [r.title, r.description, r.category, ...(r.tags ?? [])].join(" ").toLowerCase().includes(q);
    });
  }, [resources, query, category]);
  const libPages = Math.max(1, Math.ceil(filteredResources.length / RESOURCE_PAGE_SIZE));
  const safeLibPage = Math.min(libPage, libPages - 1);
  const libRows = filteredResources.slice(safeLibPage * RESOURCE_PAGE_SIZE, (safeLibPage + 1) * RESOURCE_PAGE_SIZE);

  const handleAdd = (insight: Insight) => {
    const rec = insight.recommendation;
    if (!onCreateAction || !rec) return;
    try {
      onCreateAction({
        title: rec.firstStep ?? rec.action,
        area: insight.category,
        insightId: insight.id,
        note: insight.title,
        successMeasure: rec.successMeasure,
        reviewTiming: rec.reviewTiming,
      });
      setAddedIds((prev) => new Set(prev).add(insight.id));
      setActionError(null);
    } catch {
      setActionError("Could not add this to Plans. Please try again.");
    }
  };

  const resetLibrary = () => {
    setQuery("");
    setCategory(null);
    setLibPage(0);
  };

  const missing = dataStatus?.missingInputs ?? [];
  const hasSample = insights.some((i) => i.evidenceKind === "sample");
  const dataNote = !dataStatus
    ? "Data completeness not assessed."
    : dataStatus.hasEnoughData && missing.length === 0
      ? "Core inputs are in place."
      : missing.length > 0
        ? `${missing.length} input${missing.length === 1 ? "" : "s"} missing: ${missing.join(", ")}`
        : "More business information is needed.";

  return (
    <div className="lumini-insights">
      <header className="li-head">
        <div>
          <p className="li-eyebrow">Business intelligence</p>
          <h1 className="li-title">Understand what matters.</h1>
          <p className="li-sub">
            Evidence-led insights{businessName ? ` for ${businessName}` : ""}.
            {hasSample ? " Sample content is marked." : ""}
          </p>
        </div>
        <div className="li-head-right">
          <div className="li-nav" role="tablist" aria-label="Insights sections">
            {MAIN_VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                className="li-navbtn"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
          {onExportReport && reportSummary && (
            <button type="button" className="li-btn li-btn--ghost" onClick={onExportReport}>
              Export report
            </button>
          )}
        </div>
      </header>

      <main className="li-body">
        {view === "insights" && (
          <>
            {loadState === "loading" && (
              <div aria-busy="true" aria-live="polite">
                <span className="li-sr">Loading insights</span>
                <div className="li-skel" /><div className="li-skel" /><div className="li-skel" />
              </div>
            )}
            {loadState === "error" && (
              <div className="li-empty" role="alert">
                <h3>Insights could not be loaded.</h3>
                <p>The rest of the page still works. Try again in a moment.</p>
                {onRetry && <button type="button" className="li-btn" onClick={onRetry}>Try again</button>}
              </div>
            )}
            {loadState === "ready" && insights.length === 0 && (
              <div className="li-empty">
                <h3>Your next insight starts with the right information.</h3>
                <p>Add or confirm a few business details so Lumini can identify useful changes and opportunities.</p>
                <button type="button" className="li-btn" onClick={() => onNavigate("business")}>
                  Review business information
                </button>
              </div>
            )}
            {loadState === "ready" && insights.length > 0 && (
              <div className="li-split">
                <section className="li-list-col" aria-label="Priority insights">
                  <h2 className="li-label">Priority insights</h2>
                  <div className="li-seg" role="group" aria-label="Filter by priority">
                    {(["all", "high", "medium", "informational"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="li-segbtn"
                        aria-pressed={priorityFilter === p}
                        onClick={() => {
                          setPriorityFilter(p);
                          setListPage(0);
                        }}
                      >
                        {p === "all" ? "All" : p === "informational" ? "Info" : p[0].toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                  {filtered.length === 0 ? (
                    <div className="li-empty">
                      <p>No insights at this priority.</p>
                      <button type="button" className="li-link" onClick={() => setPriorityFilter("all")}>Show all</button>
                    </div>
                  ) : (
                    <ul className="li-rows">
                      {pageRows.map((i) => (
                        <li key={i.id}>
                          <button
                            type="button"
                            className="li-row"
                            aria-current={selected?.id === i.id}
                            onClick={() => {
                              setSelectedId(i.id);
                              setTab("recommendation");
                            }}
                          >
                            <span className="li-row-meta">
                              <span className="li-dot" data-p={i.priority} aria-hidden="true" />
                              {PRIORITY_LABEL[i.priority]} · {i.category}
                            </span>
                            <span className="li-row-title">{i.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Pager
                    page={safeListPage}
                    pages={listPages}
                    from={safeListPage * INSIGHT_PAGE_SIZE + 1}
                    to={Math.min(filtered.length, (safeListPage + 1) * INSIGHT_PAGE_SIZE)}
                    total={filtered.length}
                    onChange={setListPage}
                    label="Insight pages"
                  />
                </section>

                {selected && (
                  <article className="li-detail" aria-label={selected.title}>
                    <div className="li-detail-meta">
                      <span>{PRIORITY_LABEL[selected.priority]}</span>
                      <span>{selected.category}</span>
                      <span>{EVIDENCE_LABEL[selected.evidenceKind]}</span>
                      {selected.periodLabel && <span>{selected.periodLabel}</span>}
                      {selected.updatedAt && <span>Updated {selected.updatedAt}</span>}
                    </div>
                    <h2 className="li-detail-title">{selected.title}</h2>
                    <p className="li-lede">{selected.summary}</p>
                    {selected.whyItMatters && (
                      <p className="li-why"><b>Why it matters. </b>{selected.whyItMatters}</p>
                    )}
                    <div className="li-tabs" role="tablist" aria-label="Insight detail">
                      {DETAIL_TABS.map((t) => (
                        <button
                          key={t.id}
                          id={`li-tab-${t.id}`}
                          type="button"
                          role="tab"
                          className="li-tab"
                          aria-selected={tab === t.id}
                          aria-controls="li-detail-panel"
                          onClick={() => setTab(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <DetailPanel insight={selected} tab={tab} resources={resources} />
                    <div className="li-detail-actions">
                      {onCreateAction && selected.recommendation && (
                        <button
                          type="button"
                          className="li-btn"
                          disabled={addedIds.has(selected.id)}
                          onClick={() => handleAdd(selected)}
                        >
                          {addedIds.has(selected.id) ? "Added to Plans" : "Add to Plans"}
                        </button>
                      )}
                      {onAskLumini && (
                        <button
                          type="button"
                          className="li-btn li-btn--ghost"
                          onClick={() =>
                            onAskLumini({
                              insightId: selected.id,
                              question: `Help me understand and act on: ${selected.title}`,
                            })
                          }
                        >
                          Ask Lumini
                        </button>
                      )}
                      {addedIds.has(selected.id) && <span className="li-ok" role="status">Sent to Plans.</span>}
                      {actionError && <span className="li-err" role="alert">{actionError}</span>}
                    </div>
                  </article>
                )}
              </div>
            )}
          </>
        )}

        {view === "library" && (
          <section className="li-lib" aria-label="Business library">
            {reading && reading.body ? (
              <article className="li-reader">
                <button type="button" className="li-link" onClick={() => setReadingId(null)}>Back to library</button>
                <p className="li-label" style={{ marginTop: 18 }}>{reading.category} · {reading.source ?? "Lumini"}{reading.timeLabel ? ` · ${reading.timeLabel}` : ""}</p>
                <h2 className="li-detail-title">{reading.title}</h2>
                {reading.body.intro && <p className="li-lede">{reading.body.intro}</p>}
                <ol className="li-steps">
                  {reading.body.steps.map((st, i) => (
                    <li key={i}><b>{st.title}</b> {st.text}</li>
                  ))}
                </ol>
                {reading.body.tip && <p className="li-why"><b>Tip. </b>{reading.body.tip}</p>}
                {reading.status === "draft" && <p className="li-muted" style={{ fontSize: 12 }}>Starter content, not yet reviewed by a specialist. Use it as a general guide.</p>}
              </article>
            ) : resources.length === 0 ? (
              <div className="li-empty">
                <h3>The library is empty.</h3>
                <p>Resources will appear here once they are added to your workspace.</p>
              </div>
            ) : (
              <>
                <div className="li-lib-bar">
                  <label className="li-sr" htmlFor="li-lib-search">Search resources</label>
                  <input
                    id="li-lib-search"
                    className="li-search"
                    type="search"
                    placeholder="Search guides, templates and tools"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setLibPage(0);
                    }}
                  />
                  <div className="li-seg" style={{ margin: 0 }} role="group" aria-label="Filter by category">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="li-segbtn"
                        aria-pressed={category === c}
                        onClick={() => {
                          setCategory((cur) => (cur === c ? null : c));
                          setLibPage(0);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {(category || query) && (
                    <button type="button" className="li-link" onClick={resetLibrary}>Reset</button>
                  )}
                </div>
                <p className="li-sr" role="status">{filteredResources.length} resources shown</p>
                {filteredResources.length === 0 ? (
                  <div className="li-empty">
                    <h3>No resources match.</h3>
                    <p>Try a different word or clear the filters.</p>
                    <button type="button" className="li-btn li-btn--ghost" onClick={resetLibrary}>Reset filters</button>
                  </div>
                ) : (
                  <ul className="li-resources">
                    {libRows.map((r) => (
                      <li className="li-res" key={r.id}>
                        <span className="li-label">
                          {r.category}{r.status === "sample" ? " · Sample" : r.status === "draft" ? " · Starter" : ""}
                        </span>
                        <h3>{r.title}</h3>
                        <p>{r.description}</p>
                        <div className="li-res-foot">
                          <span>
                            {[r.type, r.source, r.reviewedLabel && `Reviewed ${r.reviewedLabel}`, r.timeLabel]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                          {r.body ? (
                            <button type="button" className="li-link" onClick={() => setReadingId(r.id)}>Read guide</button>
                          ) : onOpenResource && r.href ? (
                            <button type="button" className="li-link" onClick={() => onOpenResource(r)}>
                              {r.type === "template" ? "Use template" : "Open"}
                            </button>
                          ) : (
                            <span>Not available yet</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Pager
                  page={safeLibPage}
                  pages={libPages}
                  from={safeLibPage * RESOURCE_PAGE_SIZE + 1}
                  to={Math.min(filteredResources.length, (safeLibPage + 1) * RESOURCE_PAGE_SIZE)}
                  total={filteredResources.length}
                  onChange={setLibPage}
                  label="Library pages"
                />
              </>
            )}
          </section>
        )}

        {view === "reports" && (
          <section aria-label="Reports and reviews">
            {reportSummary ? (
              <>
                <div className="li-report-head">
                  <p className="li-label">{reportSummary.periodLabel}{reportSummary.sourceCoverage ? ` · ${reportSummary.sourceCoverage}` : ""}</p>
                  <h2>{reportSummary.title}</h2>
                </div>
                <div className="li-report">
                  {([
                    ["What changed", reportSummary.whatChanged],
                    ["What it means", reportSummary.whatItMeans],
                    ["Next actions", reportSummary.nextActions],
                    ["Unresolved questions", reportSummary.unresolvedQuestions],
                  ] as const).map(([title, items]) =>
                    items && items.length > 0 ? (
                      <Block key={title} title={title}>
                        <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
                      </Block>
                    ) : null
                  )}
                </div>
              </>
            ) : (
              <div className="li-empty">
                <h3>No report yet.</h3>
                <p>Reports appear once your records cover a full review period.</p>
                <button type="button" className="li-btn li-btn--ghost" onClick={() => onNavigate("finances")}>
                  Review financial records
                </button>
              </div>
            )}
          </section>
        )}

        {view === "market" && (
          <section aria-label="Market intelligence">
            {marketResearchConnected ? (
              <div className="li-empty">
                <h3>Market research is connected.</h3>
                <p>Render the host's verified results here, with source links and retrieval dates.</p>
              </div>
            ) : (
              <div className="li-empty">
                <h3>Market research is not connected yet.</h3>
                <p>No external research is shown because none has been run for your business.</p>
                {onAskLumini && (
                  <button
                    type="button"
                    className="li-btn li-btn--ghost"
                    onClick={() => onAskLumini({ insightId: "market", question: "What should I know about my market?" })}
                  >
                    Ask Lumini about your market
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="li-foot">
        <div className="li-foot-left">
          <span title={dataNote}>
            {dataNote}
            {dataStatus?.lastUpdatedLabel ? ` · Updated ${dataStatus.lastUpdatedLabel}` : ""}
          </span>
        </div>
        <div className="li-foot-right">
          <button type="button" className="li-link" onClick={() => onNavigate("business")}>Review business data</button>
          <button type="button" className="li-link" onClick={() => onNavigate("finances")}>Finances</button>
          <button type="button" className="li-link" onClick={() => onNavigate("plans")}>Plans</button>
        </div>
      </footer>
    </div>
  );
}

export default InsightsPage;
