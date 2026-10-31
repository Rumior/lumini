import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, LoaderCircle,
  Plus, Trash2, Building2, Sparkles,
} from 'lucide-react';
import {
  CONCEPT, COUNTRY_OPTS, CUR_OPTS, FLOW, LABEL, META,
  MONTH_OPTS, NOTIFY_OPTS, OFFER_OPTS, PAY_OPTS,
  PRIORITY_OPTS, REVIEW_DAY_OPTS, ROLE_OPTS, ROLES, STAGE_OPTS,
  TEAM_OPTS, TZ_OPTS, bizName,
} from './config';
import { useOnboarding } from './useOnboarding';
import { supabaseAdapter } from './supabaseAdapter';
import type { OnboardingAdapter, Opt, StepId } from './types';
import './onboarding.css';

type Props = {
  onComplete: (workspaceId: string) => void;
  adapter?: OnboardingAdapter;
  preview?: boolean;
};

function SelectField({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: readonly Opt[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="f">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>{text}</option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label, value, onChange, placeholder, type = 'text',
  error, optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  optional?: boolean;
}) {
  return (
    <div className="f">
      <label>
        {label} {optional && <span className="opt">(optional)</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? 'any' : undefined}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="err">{error}</p>}
    </div>
  );
}

export default function Onboarding({
  onComplete,
  adapter = supabaseAdapter,
  preview = false,
}: Props) {
  const c = useOnboarding(adapter, {
    onComplete: ({ workspaceId }) => onComplete(workspaceId),
  });

  if (!c.ready) {
    return (
      <div className="lumini-onboarding">
        <div className="lumini-auth-loading">
          <LoaderCircle className="lumini-auth-spinner" size={28} />
          <span>Restoring your setup...</span>
        </div>
      </div>
    );
  }

  if (c.loadError) {
    return (
      <div className="lumini-onboarding">
        <div className="lumini-auth-loading">
          <div>
            <p className="err" role="alert">{c.loadError}</p>
            <button className="btn" type="button" onClick={c.retryLoad}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const step = c.step;
  const idx = FLOW.indexOf(step as StepId);
  const meta = META[step] ?? META.welcome;
  const concept = CONCEPT[step] ?? CONCEPT.welcome;
  const isWelcome = step === 'welcome';
  const isDone = step === 'done';
  const progress = idx < 0 ? 0 : ((idx + 1) / FLOW.length) * 100;

  const update = (path: string, value: unknown) => c.set(path, value);
  const error = (path: string) => c.err[path];

  const options = (items: readonly Opt[]) => items;

  const inviteScopeOptions: Opt[] = [
    ['all', 'Entire workspace'],
    ...c.d.biz.map((b) => [b.id, bizName(b)] as Opt),
  ];

  const choice = (
    value: string,
    selected: boolean,
    label: string,
    description: string,
    onClick: () => void,
  ) => (
    <button
      type="button"
      className="choice"
      data-value={value}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="ico">{selected ? <Check size={17} /> : 'L'}</span>
      <span>
        <b>{label}</b>
        <span>{description}</span>
      </span>
      <span className="tick">âœ“</span>
    </button>
  );

  const chipGroup = (
    items: readonly Opt[],
    selected: string[],
    path: string,
  ) => (
    <div className="chips">
      {items.map(([value, label]) => (
        <button
          type="button"
          className="chip"
          key={value}
          aria-pressed={selected.includes(value)}
          onClick={() => c.toggle(path, value)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="lumini-onboarding" data-theme="light">
      {preview && (
        <div style={{
          padding: "12px 20px",
          background: "#172b4d",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
        }}>
          <strong>DEVELOPER PREVIEW — No live workspace will be created</strong>
          <a href="/" style={{ color: "#ffffff", textDecoration: "underline" }}>
            Exit preview
          </a>
        </div>
      )}
      <div className="app">
        <header className="rail">
          <div className="brand">
            <span className="av">L</span>
            <div>
              <b>Lumini</b>
              <small>BUSINESS MENTOR</small>
            </div>
          </div>

          <ol className="steps">
            {FLOW.map((id, i) => (
              <li
                key={id}
                className={idx === i ? 'on' : idx > i ? 'ok' : ''}
              >
                <i>{idx > i ? 'âœ“' : i + 1}</i>
                <span>{LABEL[id]}</span>
              </li>
            ))}
          </ol>

          <div className="ex">
            <span>PRIVATE WORKSPACE SETUP</span>
          </div>

          {!isWelcome && !isDone && (
            <div className="bar">
              <span>STEP {idx + 1} OF {FLOW.length}</span>
              <div><i style={{ width: `${progress}%` }} /></div>
            </div>
          )}
        </header>

        <main>
          <div id="stage">
            <section className="hero pane">
              <p className="eyebrow">LUMINI / {isDone ? 'COMPLETE' : isWelcome ? 'GETTING STARTED' : 'SETUP'}</p>
              <h1>{isDone ? (preview ? 'Your preview is complete.' : 'Your workspace is ready.') : meta.title}</h1>
              <p className="lede">{isDone ? (preview ? 'You have reached the end of the onboarding preview. No real workspace was created.' : 'Your workspace has been created. You can now continue to Lumini.') : meta.lede}</p>

              <div className="concept">
                <b>{concept[0]}</b>
                <span>{concept[1]}</span>
              </div>

              <div className="priv">
                Your information belongs to your workspace. Lumini will not invent financial figures.
              </div>
            </section>

            <section className="pane">
              {isWelcome && (
                <>
                  <div className="card">
                    <div className="hd">
                      <div className="av"><Sparkles size={17} /></div>
                      <div>
                        <b>Build your business workspace</b>
                        <p className="help">Set up the structure Lumini will use to understand your business.</p>
                      </div>
                    </div>
                    <div className="tree">
                      <span className="mono">YOUR STRUCTURE</span>
                      <b>Workspace</b>
                      <div>Businesses <small>Profiles and finances</small></div>
                      <div>Projects <small>Work and initiatives</small></div>
                      <div>People <small>Access and collaboration</small></div>
                    </div>
                  </div>

                  <div className="card" style={{ marginTop: 18 }}>
                    <div className="hd">
                      <div className="av"><Building2 size={17} /></div>
                      <div>
                        <b>Joining as a team member?</b>
                        <p className="help">
                          If someone has already invited you to a Lumini
                          workspace, you can enter your invitation code here.
                        </p>
                      </div>
                    </div>

                    <button
                      className="link"
                      type="button"
                      onClick={() => c.setJoin(!c.join)}
                      style={{ marginTop: 14 }}
                    >
                      {c.join ? 'Close invitation form' : 'I have an invitation code'}
                    </button>

                    {c.join && (
                      <div style={{ marginTop: 18 }}>
                        <TextField
                          label="Invitation code or link"
                          value={c.code}
                          onChange={c.setCode}
                          placeholder="Paste your invitation code"
                          error={error('join')}
                        />
                        <button
                          className="btn"
                          type="button"
                          onClick={c.verify}
                          disabled={c.busy || !c.code.trim()}
                        >
                          {c.busy ? 'Checking...' : 'Verify invitation'}
                        </button>
                        <p className="help">
                          Invitation verification is not connected to the
                          live database yet. This form will become active
                          when invitation creation and acceptance are built.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="actions">
                    <span className="sp" />
                    <button className="btn" onClick={() => c.go('workspace')}>
                      Begin setup <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}

              {step === 'workspace' && (
                <>
                  <div className="card">
                    <TextField
                      label="Your name"
                      value={c.d.me.name}
                      onChange={(v) => update('me.name', v)}
                      placeholder="Your full name"
                      error={error('me.name')}
                    />
                    <SelectField
                      label="Your role"
                      value={c.d.me.role}
                      options={options(ROLE_OPTS)}
                      onChange={(v) => update('me.role', v)}
                    />
                    <div className="divider" />
                    <TextField
                      label="Workspace name"
                      value={c.d.ws.name}
                      onChange={(v) => update('ws.name', v)}
                      placeholder="e.g. Moruri Group"
                      error={error('ws.name')}
                    />
                    <div className="f">
                      <label>Workspace description <span className="opt">(optional)</span></label>
                      <textarea
                        value={c.d.ws.desc}
                        placeholder="What brings your businesses together?"
                        onChange={(e) => update('ws.desc', e.target.value)}
                      />
                    </div>
                    <button className="link" type="button" onClick={c.nameFromMe}>
                      Use my name as workspace name
                    </button>
                  </div>
                </>
              )}

              {step === 'businesses' && (
                <>
                  {c.d.biz.map((b, i) => (
                    <div className="card" key={b.id}>
                      <div className="row">
                        <strong>Business {i + 1}</strong>
                        {c.d.biz.length > 1 && (
                          <button className="link" type="button" onClick={() => c.removeBusiness(i)}>
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                      <TextField
                        label="Business name"
                        value={b.name}
                        onChange={(v) => update(`biz.${i}.name`, v)}
                        placeholder="e.g. Amani Home & Living"
                        error={error(`biz.${i}.name`)}
                      />
                      <div className="grid">
                        <SelectField label="Country" value={b.country} options={options(COUNTRY_OPTS)} onChange={(v) => {
                          update(`biz.${i}.country`, v);
                          const currency = ({ KE: 'KES', UG: 'UGX', TZ: 'TZS', RW: 'RWF', NG: 'NGN', ZA: 'ZAR', GB: 'GBP', US: 'USD' } as Record<string, string>)[v];
                          if (currency) update(`biz.${i}.cur`, currency);
                        }} />
                        <SelectField label="Currency" value={b.cur} options={options(CUR_OPTS)} onChange={(v) => update(`biz.${i}.cur`, v)} />
                      </div>
                      <TextField label="Industry" value={b.industry} onChange={(v) => update(`biz.${i}.industry`, v)} placeholder="e.g. Construction, retail, technology" optional />
                      <label>What do you offer?</label>
                      {OFFER_OPTS.map(([v, label]) => choice(v, b.offer === v, label, '', () => update(`biz.${i}.offer`, v)))}
                      {error(`biz.${i}.offer`) && <p className="err">{error(`biz.${i}.offer`)}</p>}
                      <label>Business stage</label>
                      <div className="chips">
                        {STAGE_OPTS.map(([v, label]) => (
                          <button key={v} type="button" className="chip" aria-pressed={b.stage === v} onClick={() => update(`biz.${i}.stage`, v)}>{label}</button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="more-btn"
                        aria-expanded={Boolean(c.open[b.id])}
                        onClick={() => c.toggleOpen(b.id)}
                      >
                        <span className="mb-t"><b>More about this business</b><small>Legal details, operations and background</small></span>
                        <span className="mb-r"><em>{c.open[b.id] ? 'Close' : 'Optional'}</em><i>{c.open[b.id] ? 'âˆ’' : '+'}</i></span>
                      </button>

                      {c.open[b.id] && (
                        <div className="more">
                          <TextField label="Registered / legal name" value={b.legal} onChange={(v) => update(`biz.${i}.legal`, v)} optional />
                          <TextField label="Website" value={b.web} onChange={(v) => update(`biz.${i}.web`, v)} placeholder="https://" optional />
                          <div className="f">
                            <label>Business description</label>
                            <textarea value={b.desc} onChange={(e) => update(`biz.${i}.desc`, e.target.value)} />
                          </div>
                          <div className="grid">
                            <SelectField label="Financial year starts" value={b.fy} options={options(MONTH_OPTS)} onChange={(v) => update(`biz.${i}.fy`, v)} />
                            <SelectField label="Timezone" value={b.tz} options={options(TZ_OPTS)} onChange={(v) => update(`biz.${i}.tz`, v)} />
                          </div>
                          <SelectField label="Team size" value={b.team} options={options(TEAM_OPTS)} onChange={(v) => update(`biz.${i}.team`, v)} />
                          <TextField label="Tax registration details" value={b.tax} onChange={(v) => update(`biz.${i}.tax`, v)} optional />
                          <label>Payment methods</label>
                          {chipGroup(PAY_OPTS, b.pay, `biz.${i}.pay`)}
                        </div>
                      )}
                    </div>
                  ))}
                  <button className="add" type="button" onClick={c.addBusiness}>
                    <Plus size={16} /> Add another business
                  </button>
                </>
              )}

              {step === 'finance' && (
                <div className="card">
                  <p className="help">Enter figures only if you know them. Leave unknown values blank; Lumini will not estimate them.</p>
                  {c.d.biz.map((b, i) => (
                    <div key={b.id}>
                      <h3>{bizName(b)}</h3>
                      <TextField label={`Current cash balance (${b.cur})`} value={b.cash} type="number" onChange={(v) => update(`biz.${i}.cash`, v)} error={error(`biz.${i}.cash`)} optional />
                      <TextField label={`Monthly revenue (${b.cur})`} value={b.rev} type="number" onChange={(v) => update(`biz.${i}.rev`, v)} error={error(`biz.${i}.rev`)} optional />
                      <TextField label={`Average selling price (${b.cur})`} value={b.price} type="number" onChange={(v) => update(`biz.${i}.price`, v)} error={error(`biz.${i}.price`)} optional />
                      <TextField label={`Unit cost (${b.cur})`} value={b.cost} type="number" onChange={(v) => update(`biz.${i}.cost`, v)} error={error(`biz.${i}.cost`)} optional />
                    </div>
                  ))}
                </div>
              )}

              {step === 'priorities' && (
                <div className="card">
                  <label>What would you most like Lumini to help with?</label>
                  <p className="help">Choose one or more priorities.</p>
                  {chipGroup(PRIORITY_OPTS, c.d.pri, 'pri')}
                  <div className="f" style={{ marginTop: 24 }}>
                    <label>What is your most important goal?</label>
                    <textarea value={c.d.goal.text} onChange={(e) => update('goal.text', e.target.value)} placeholder="Describe the result you want to achieve..." />
                  </div>
                  <TextField label="Target amount or outcome" value={c.d.goal.when} onChange={(v) => update('goal.when', v)} placeholder="Optional target" optional />
                  <SelectField label="Monthly review day" value={c.d.goal.day} options={options(REVIEW_DAY_OPTS)} onChange={(v) => update('goal.day', v)} />
                  <label>Reminders</label>
                  {NOTIFY_OPTS.map(([v, label]) => (
                    <label className="check" key={v}>
                      <input type="checkbox" checked={c.d.goal.notify.includes(v)} onChange={() => c.toggle('goal.notify', v)} />
                      {label}
                    </label>
                  ))}
                </div>
              )}

              {step === 'project' && (
                <div className="card">
                  {choice('none', c.d.proj.mode === 'none', 'Not now', 'I will create projects later.', () => update('proj', { mode: 'none', name: '', biz: [] }))}
                  {choice('single', c.d.proj.mode === 'single', 'One business', 'A project that belongs to one business.', () => update('proj', { ...c.d.proj, mode: 'single', biz: [] }))}
                  {choice('cross', c.d.proj.mode === 'cross', 'Across businesses', 'An initiative involving more than one business.', () => update('proj', { ...c.d.proj, mode: 'cross', biz: [] }))}
                  {c.d.proj.mode !== 'none' && (
                    <>
                      <TextField label="Project name" value={c.d.proj.name} onChange={(v) => update('proj.name', v)} placeholder="e.g. New branch launch" error={error('proj.name')} />
                      <label>Which businesses are involved?</label>
                      {c.d.biz.map((b) => (
                        <label className="check" key={b.id}>
                          <input type="checkbox" checked={c.d.proj.biz.includes(b.id)} onChange={() => c.toggle('proj.biz', b.id)} />
                          {bizName(b)}
                        </label>
                      ))}
                      {error('proj.biz') && <p className="err">{error('proj.biz')}</p>}
                    </>
                  )}
                </div>
              )}

              {step === 'team' && (
                <div>
                  <div className="card">
                    <div className="hd">
                      <div className="av"><Building2 size={17} /></div>
                      <div>
                        <b>Invite your team</b>
                        <p className="help">
                          Add the people who will work with you in this workspace.
                          You can assign each person a role and define their access.
                        </p>
                      </div>
                    </div>

                    {c.d.inv.map((invite, i) => (
                      <div className="card" key={`invite-${i}`} style={{ marginTop: 18 }}>
                        <div className="row">
                          <b>Team member {i + 1}</b>
                          <button
                            className="link"
                            type="button"
                            onClick={() => c.removeInvite(i)}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>

                        <div className="grid">
                          <TextField
                            label="Email address"
                            type="email"
                            value={invite.email}
                            onChange={(v) => update(`inv.${i}.email`, v)}
                            placeholder="name@company.com"
                            error={error(`inv.${i}.email`)}
                          />
                          <TextField
                            label="Job title"
                            value={invite.title}
                            onChange={(v) => update(`inv.${i}.title`, v)}
                            placeholder="e.g. Finance Manager"
                            optional
                          />
                          <SelectField
                            label="Workspace role"
                            value={invite.role}
                            options={options(ROLE_OPTS)}
                            onChange={(v) => {
                              update(`inv.${i}.role`, v);
                              if (v === 'owner' && invite.scope === 'all') {
                                update(`inv.${i}.scope`, '');
                              } else if (v !== 'owner' && !invite.scope) {
                                update(`inv.${i}.scope`, 'all');
                              }
                            }}
                          />
                          <SelectField
                            label="Business access"
                            value={invite.scope}
                            options={options(inviteScopeOptions)}
                            onChange={(v) => update(`inv.${i}.scope`, v)}
                          />
                        </div>

                        <p className="help">
                          {ROLES[invite.role].join(' — ')}
                        </p>

                        {error(`inv.${i}.scope`) && (
                          <p className="err">{error(`inv.${i}.scope`)}</p>
                        )}
                      </div>
                    ))}

                    <button
                      className="add"
                      type="button"
                      onClick={c.addInvite}
                    >
                      <Plus size={16} /> Add another team member
                    </button>

                    <p className="help">
                      You can leave invitation details blank and continue.
                      These details are collected in the onboarding draft only;
                      invitation emails will not be sent and access will not be
                      granted until the invitation backend is implemented.
                    </p>
                  </div>

                </div>
              )}

              {step === 'review' && (
                <div className="card">
                  <div className="sum">
                    <div><b>Workspace</b><span>{c.d.ws.name}</span></div>
                    <div><b>Your name</b><span>{c.d.me.name || 'Not provided'}</span></div>
                    <div><b>Businesses</b><span>{c.d.biz.map(bizName).join(', ')}</span></div>
                    <div><b>Priorities</b><span>{c.d.pri.length ? c.d.pri.join(', ') : 'Not selected'}</span></div>
                    <div><b>Project</b><span>{c.d.proj.mode === 'none' ? 'Not creating one now' : c.d.proj.name}</span></div>
                    <div><b>Team</b><span>{c.d.inv.filter((invite) => invite.email.trim()).length} invitation(s) entered. They have not been sent.</span></div>
                  </div>
                  <p className="help">When you launch, Lumini will create your workspace, owner membership and business records in your account.</p>
                </div>
              )}

              {isDone && (
                <div className="card done">
                  <div className="av"><CheckCircle2 size={20} /></div>
                  <h2>{preview ? 'Onboarding preview complete.' : 'Welcome to Lumini.'}</h2>
                  <p>{preview ? 'This was a simulation. No workspace or database records were created.' : 'Your workspace has been created successfully.'}</p>
                  <ul>
                    {preview ? (
                      <>
                        <li>Workspace creation simulated</li>
                        <li>Owner setup previewed</li>
                        <li>{c.d.biz.length} business profile(s) previewed</li>
                      </>
                    ) : (
                      <>
                        <li>Workspace created</li>
                        <li>Owner access assigned</li>
                        <li>{c.d.biz.length} business record(s) created</li>
                      </>
                    )}
                  </ul>
                  <button className="btn" type="button" onClick={c.finish} disabled={preview}>
                    {preview ? "Preview complete" : "Open my workspace"}
                    {!preview && <ArrowRight size={16} />}
                  </button>
                </div>
              )}

              {c.err.form && <p className="err" role="alert">{c.err.form}</p>}
              {c.saveError && <p className="err" role="alert">{c.saveError}</p>}
              {c.note && <p className="help" role="status">{c.note}</p>}

              {!isWelcome && !isDone && (
                <div className="actions">
                  <button className="btn ghost" type="button" onClick={c.back} disabled={c.busy}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <span className="sp" />
                  {(['finance', 'priorities', 'project', 'team'] as string[]).includes(step) && (
                    <button className="link" type="button" onClick={c.skip} disabled={c.busy}>Skip</button>
                  )}
                  <button className="btn" type="button" onClick={c.next} disabled={c.busy}>
                    {c.busy ? <><LoaderCircle size={16} /> Creating...</> : step === 'review' ? 'Create workspace' : <>Continue <ArrowRight size={16} /></>}
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}