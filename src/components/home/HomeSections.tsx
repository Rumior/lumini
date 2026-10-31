import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { HomeBusiness, HomePageData, HomeStatus } from '../../types/home';
import type { Derived } from '../../hooks/useHomePageData';

const ICONS = {
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm9 3-4.5-4.5',
  bell: 'M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9ZM10 20a2 2 0 0 0 4 0',
  building: 'M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3',
  folder: 'M3 6h6l2 2h10v11H3Z',
  check: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM8 12l3 3 5-6',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c2 .6 3.5 2.3 3.5 5.2',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
} as const;

export function Icon({ name, size = 18 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const STATUS_LABEL: Record<HomeStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  attention: 'Needs attention',
  completed: 'Completed',
  planned: 'Planned',
  on_hold: 'On hold',
  cancelled: 'Cancelled',
};
const PRIORITY_LABEL = { high: 'High priority', medium: 'Medium priority', info: 'Info' } as const;
const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const more = (total: number, shown: number) => (total > shown ? <p className="lh-more">+{total - shown} more</p> : null);
const summary = (list: { status?: HomeStatus }[]) => {
  const c: Partial<Record<HomeStatus, number>> = {};
  list.forEach((x) => { if (x.status) c[x.status] = (c[x.status] ?? 0) + 1; });
  return (Object.entries(c) as [HomeStatus, number][]).map(([k, v]) => `${v} ${STATUS_LABEL[k].toLowerCase()}`).join(', ');
};
const ago = (iso: string) => {
  const s = (new Date(iso).getTime() - Date.now()) / 1000, a = Math.abs(s);
  const f = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  return a < 3600 ? f.format(Math.round(s / 60), 'minute') : a < 86400 ? f.format(Math.round(s / 3600), 'hour') : f.format(Math.round(s / 86400), 'day');
};

export function StatusMark({ status }: { status?: HomeStatus }) {
  return status ? <span className={`lh-status lh-status--${status}`}>{STATUS_LABEL[status]}</span> : null;
}

function Panel({ id, title, sub, children, loading }: { id: string; title: string; sub?: string; children: ReactNode; loading?: boolean }) {
  return (
    <section className="lh-section" aria-labelledby={id} aria-busy={loading}>
      <header className="lh-section__head"><h2 id={id}>{title}</h2>{sub && <p>{sub}</p>}</header>
      {loading ? <div className="lh-skel" aria-hidden="true"><span /><span /><span /></div> : children}
    </section>
  );
}
function Empty({ title, hint }: { title: string; hint: string }) {
  return <div className="lh-empty"><p className="lh-empty__title">{title}</p><p>{hint}</p></div>;
}

/* Search: local only. Ctrl/Cmd+K focuses it. */
export function HomeSearch({ data }: { data: HomePageData }) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ref.current?.focus(); } };
    document.addEventListener('keydown', on);
    return () => document.removeEventListener('keydown', on);
  }, []);
  const term = q.trim().toLowerCase();
  const hits = useMemo(() => {
    if (!term) return [];
    const m = (s: string) => s.toLowerCase().includes(term);
    return [
      ...data.businesses.filter((b) => m(b.name)).map((b) => ({ id: `b${b.id}`, kind: 'Business', label: b.name, href: b.href })),
      ...data.projects.filter((p) => m(p.name)).map((p) => ({ id: `p${p.id}`, kind: 'Project', label: p.name, href: p.href })),
      ...data.tasks.filter((t) => m(t.title)).map((t) => ({ id: `t${t.id}`, kind: 'Task', label: t.title, href: undefined as string | undefined })),
    ].slice(0, 8);
  }, [term, data]);
  const searchable = data.businesses.length + data.projects.length + data.tasks.length > 0;
  return (
    <div className="lh-search" role="search">
      <label htmlFor="lh-search-input" className="lh-sr">Search businesses, projects and tasks</label>
      <span className="lh-search__icon"><Icon name="search" size={16} /></span>
      <input ref={ref} id="lh-search-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
        placeholder={searchable ? 'Search businesses, projects, tasks' : 'Nothing to search yet'} disabled={!searchable} />
      <kbd className="lh-kbd" aria-hidden="true">Ctrl K</kbd>
      {term && (
        <ul className="lh-search__results" aria-live="polite">
          {hits.length === 0 && <li className="lh-search__none">No matches for "{q}"</li>}
          {hits.map((h) => <li key={h.id}>{h.href ? <a href={h.href}><small>{h.kind}</small>{h.label}</a> : <span><small>{h.kind}</small>{h.label}</span>}</li>)}
        </ul>
      )}
    </div>
  );
}

export function KpiStrip({ data, d }: { data: HomePageData; d: Derived }) {
  const open = data.tasks.filter((t) => !t.done).length;
  const live = data.projects.filter((p) => p.status !== 'completed');
  const items: [string, keyof typeof ICONS, number | undefined, string][] = [
    ['Businesses', 'building', data.businesses.length, summary(data.businesses)],
    ['Active projects', 'folder', d.liveProjects, summary(live)],
    ['Tasks to complete', 'check', open, [d.overdue.length && `${d.overdue.length} overdue`, d.today.length && `${d.today.length} due today`].filter(Boolean).join(', ')],
    ['Team members', 'users', data.teamCount, ''],
  ];
  return (
    <dl className="lh-kpis">
      {items.map(([label, icon, v, sub], i) => (
        <div key={label} className="lh-kpi">
          <span className={`lh-kpi__icon lh-tint-${i}`}><Icon name={icon} /></span>
          <dt>{label}</dt>
          <dd><span className="lh-kpi__n">{data.loading ? '\u2014' : v ?? '\u2014'}</span><span className="lh-kpi__sub">{sub}</span></dd>
        </div>
      ))}
    </dl>
  );
}

/** Lives in the hero. Reads only from data.insights. */
export function MentorCard({ data }: { data: HomePageData }) {
  const top = data.insights[0];
  const a = data.actions;
  return (
    <section className="lh-mentor" aria-labelledby="lh-men" aria-busy={data.loading}>
      <h2 id="lh-men">Lumini recommends</h2>
      {data.loading ? <div className="lh-skel" aria-hidden="true"><span /><span /></div> : !top ? (
        <p className="lh-mentor__empty">Recommendations appear here once your Insights are available.</p>
      ) : (
        <>
          <p className="lh-mentor__meta">{[top.priority && PRIORITY_LABEL[top.priority], top.category].filter(Boolean).join(', ')}</p>
          <h3>{top.title}</h3>
          {top.firstAction && <p className="lh-mentor__act">{top.firstAction}</p>}
          <div className="lh-mentor__btns">
            <button type="button" className="lh-btn lh-btn--primary" disabled={!a.onAddToPlans} onClick={() => a.onAddToPlans?.(top.id)}>Add to Plans</button>
            <button type="button" className="lh-btn" disabled={!a.onAskLumini} onClick={() => a.onAskLumini?.(top.id)}>Ask Lumini</button>
            {(!a.onAddToPlans || !a.onAskLumini) && <small>Not connected yet</small>}
          </div>
        </>
      )}
    </section>
  );
}

function BusinessCard({ b, i }: { b: HomeBusiness; i: number }) {
  const ini = b.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const body = (
    <>
      <span className={`lh-bcard__banner lh-banner-${i % 3}`} aria-hidden="true" />
      <span className="lh-bcard__badge" aria-hidden="true">{ini}</span>
      <span className="lh-bcard__body">
        <span className="lh-bcard__top"><span className="lh-bcard__name">{b.name}</span>{b.href && <Icon name="arrow" size={16} />}</span>
        {b.type && <span className="lh-bcard__type">{b.type}</span>}
        {b.signal && <span className="lh-bcard__signal">{b.signal}</span>}
        <span className="lh-bcard__foot">
          <StatusMark status={b.status} />
          {b.projectCount !== undefined && <span><Icon name="folder" size={14} />{b.projectCount} {b.projectCount === 1 ? 'project' : 'projects'}</span>}
          {b.memberCount !== undefined && <span><Icon name="users" size={14} />{b.memberCount} {b.memberCount === 1 ? 'member' : 'members'}</span>}
        </span>
      </span>
    </>
  );
  return <li>{b.href ? <a className="lh-bcard" href={b.href}>{body}</a> : <div className="lh-bcard">{body}</div>}</li>;
}

export function Businesses({ data }: { data: HomePageData }) {
  const a = data.actions;
  const steps: [string, boolean, (() => void) | undefined][] = [
    ['Add your first business', data.businesses.length > 0, a.onNewBusiness],
    ['Create a project', data.projects.length > 0, a.onNewProject],
    ['Invite a team member', (data.teamCount ?? 0) > 1, a.onInviteMember],
  ];
  return (
    <Panel id="lh-biz" title={data.businesses.length ? 'Your businesses' : 'Get started'}
      sub={data.businesses.length ? 'Open a business or manage them all from the portfolio.' : 'Three steps to set up your workspace.'} loading={data.loading}>
      {data.businesses.length === 0 ? (
        <ol className="lh-steps">
          {steps.map(([label, done, fn]) => (
            <li key={label} className={done ? 'is-done' : ''}>
              <span className="lh-step__mark" aria-hidden="true">{done ? '\u2713' : ''}</span><span>{label}</span>
              {done ? <small>Done</small> : <button type="button" className="lh-btn" disabled={!fn} onClick={fn}>{fn ? 'Start' : 'Not available yet'}</button>}
            </li>
          ))}
        </ol>
      ) : (
        <>
          <ul className="lh-bcards">{data.businesses.slice(0, 3).map((b, i) => <BusinessCard key={b.id} b={b} i={i} />)}</ul>
          {more(data.businesses.length, 3)}
        </>
      )}
    </Panel>
  );
}

export function RecentProjects({ data }: { data: HomePageData }) {
  const items = data.projects.slice(0, 3);
  return (
    <Panel id="lh-proj" title="Recent projects" sub="Soonest due date first." loading={data.loading}>
      {items.length === 0 ? <Empty title="No projects yet" hint="Projects you create will appear here." /> : (
        <>
          <ul className="lh-rows">
            {items.map((p) => {
              const inner = (
                <>
                  <span className="lh-tile" aria-hidden="true"><Icon name="folder" /></span>
                  <span className="lh-row__main">
                    <span className="lh-row__title">{p.name}</span>
                    <span className="lh-row__sub">{p.businessNames.length > 1 ? `Across ${p.businessNames.length} businesses: ` : ''}{p.businessNames.join(', ')}</span>
                    {p.progress !== undefined && <progress className="lh-progress" max={100} value={p.progress} aria-label={`${p.name} progress`} />}
                  </span>
                  <span className="lh-row__meta"><StatusMark status={p.status} />{p.dueDate && <span>Due {fmtDate(p.dueDate)}</span>}{p.memberCount !== undefined && <span>{p.memberCount} on team</span>}</span>
                </>
              );
              return <li key={p.id}>{p.href ? <a className="lh-row" href={p.href}>{inner}</a> : <div className="lh-row">{inner}</div>}</li>;
            })}
          </ul>
          {more(data.projects.length, 3)}
        </>
      )}
    </Panel>
  );
}

export function TodayFocus({ data, d }: { data: HomePageData; d: Derived }) {
  const due = data.tasks.filter((t) => !t.done && (!t.dueDate || t.dueDate.slice(0, 10) <= d.t0));
  const toggle = data.actions.onToggleTask;
  return (
    <Panel id="lh-focus" title="Today's focus" sub="Tasks due today or overdue." loading={data.loading}>
      {due.length === 0 ? <p className="lh-focus__empty">Nothing is due today.</p> : (
        <ul className="lh-rows">
          {due.slice(0, 3).map((t) => (
            <li key={t.id} className="lh-frow">
              {toggle ? <input type="checkbox" className="lh-ring" checked={t.done} onChange={(e) => toggle(t.id, e.target.checked)} aria-label={`Mark done: ${t.title}`} /> : <span className="lh-ring" aria-hidden="true" />}
              <span className="lh-row__main"><span className="lh-row__title">{t.title}</span>{t.context && <span className="lh-row__sub">{t.context}</span>}</span>
              <span className="lh-row__meta">
                {t.priority && <span className={`lh-pill lh-pill--${t.priority}`}>{t.priority[0].toUpperCase() + t.priority.slice(1)}</span>}
                {t.dueDate && t.dueDate.slice(0, 10) < d.t0 ? <span>Overdue</span> : t.time && <span>{t.time}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {more(due.length, 3)}
    </Panel>
  );
}

export function QuickActions({ data }: { data: HomePageData }) {
  const a = data.actions;
  const list: [string, string, keyof typeof ICONS, (() => void) | undefined][] = [
    ['New business', 'Create a business entity', 'building', a.onNewBusiness],
    ['New project', 'Start a new project', 'folder', a.onNewProject],
    ['Add task', 'Create a task or reminder', 'check', a.onAddTask],
    ['Invite member', 'Bring someone to your team', 'users', a.onInviteMember],
  ];
  return (
    <Panel id="lh-qa" title="Quick actions" sub="Get things done, faster.">
      <div className="lh-qa">
        {list.map(([label, desc, icon, fn], i) => (
          <button key={label} type="button" className="lh-qa__btn" onClick={fn} disabled={!fn}>
            <span className={`lh-kpi__icon lh-tint-${i}`}><Icon name={icon} /></span>
            <span className="lh-qa__t">{label}</span><small>{fn ? desc : 'Not available yet'}</small>
          </button>
        ))}
      </div>
    </Panel>
  );
}

export function MiniCalendar({ data, d }: { data: HomePageData; d: Derived }) {
  const [cursor, setCursor] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const dueDays = useMemo(() => new Set([
    ...data.tasks.filter((t) => !t.done && t.dueDate).map((t) => t.dueDate!.slice(0, 10)),
    ...data.projects.filter((p) => p.status !== 'completed' && p.dueDate).map((p) => p.dueDate!.slice(0, 10)),
  ]), [data]);
  const todayKey = dayKey(new Date());
  const y = cursor.getFullYear(), m = cursor.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7; // weeks start Monday
  const cells = Array.from({ length: 42 }, (_, i) => new Date(y, m, 1 - lead + i));
  const shift = (n: number) => setCursor(new Date(y, m + n, 1));
  return (
    <Panel id="lh-cal" title="Calendar" loading={data.loading}>
      <div className="lh-cal">
        <div className="lh-cal__bar">
          <span aria-live="polite">{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
          <span><button type="button" onClick={() => shift(-1)} aria-label="Previous month"><Icon name="left" size={16} /></button>
            <button type="button" onClick={() => shift(1)} aria-label="Next month"><Icon name="right" size={16} /></button></span>
        </div>
        <div className="lh-cal__grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((x) => <span key={x} className="lh-cal__dow" aria-hidden="true">{x}</span>)}
          {cells.map((c) => {
            const k = dayKey(c);
            return <span key={k} className={`lh-cal__day${c.getMonth() !== m ? ' is-out' : ''}${k === todayKey ? ' is-today' : ''}${dueDays.has(k) ? ' has-due' : ''}`}
              aria-label={`${c.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}${k === todayKey ? ', today' : ''}${dueDays.has(k) ? ', due' : ''}`}
              aria-current={k === todayKey ? 'date' : undefined}>{c.getDate()}</span>;
          })}
        </div>
        {d.upcoming.length > 0 && (
          <ul className="lh-next">{d.upcoming.slice(0, 2).map((u) => <li key={u.id}><time dateTime={u.date}>{fmtDate(u.date)}</time><span>{u.label}</span></li>)}</ul>
        )}
      </div>
    </Panel>
  );
}

/** Omitted entirely when there is no real activity source. */
export function RecentActivity({ data }: { data: HomePageData }) {
  if (data.activity.length === 0) return null;
  return (
    <Panel id="lh-act" title="Recent activity">
      <ul className="lh-rows">
        {data.activity.slice(0, 3).map((a) => (
          <li key={a.id} className="lh-row">
            <span className="lh-row__main"><span className="lh-row__title">{a.text}</span></span>
            <time className="lh-row__sub" dateTime={a.at}>{ago(a.at)}</time>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
