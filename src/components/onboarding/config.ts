import type { Business, Draft, Invite, Opt, Role, StepId } from './types';

export const FLOW: StepId[] = ['workspace', 'businesses', 'finance', 'priorities', 'project', 'team', 'review'];
export const OPTIONAL: StepId[] = ['finance', 'priorities', 'project', 'team'];
export const LABEL: Record<StepId, string> = {
  workspace: 'Workspace', businesses: 'Businesses', finance: 'Starting point',
  priorities: 'Goals', project: 'Project', team: 'Team', review: 'Review',
};

export const COUNTRY: Record<string, [string, string]> = {
  KE: ['Kenya', 'KES'], UG: ['Uganda', 'UGX'], TZ: ['Tanzania', 'TZS'], RW: ['Rwanda', 'RWF'],
  NG: ['Nigeria', 'NGN'], ZA: ['South Africa', 'ZAR'], GB: ['United Kingdom', 'GBP'], US: ['United States', 'USD'],
};
export const COUNTRY_OPTS: Opt[] = Object.entries(COUNTRY).map(([k, v]) => [k, v[0]] as Opt);
export const CUR_OPTS: Opt[] = ['KES', 'UGX', 'TZS', 'RWF', 'NGN', 'ZAR', 'GBP', 'USD', 'EUR'].map((c) => [c, c] as Opt);
export const MONTH_OPTS: Opt[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => [String(i + 1), m] as Opt);

const detectTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; } };
export const TZ = detectTz();
export const TZ_OPTS: Opt[] = [...new Set([TZ, 'Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg', 'Africa/Kampala', 'Europe/London', 'America/New_York', 'Asia/Dubai', 'UTC'])].map((z) => [z, z.replace(/_/g, ' ')] as Opt);

export const OFFER_OPTS: Opt[] = [['products', 'Products'], ['services', 'Services'], ['both', 'Both']];
export const STAGE_OPTS: Opt[] = [['idea', 'Idea'], ['early', 'Early'], ['established', 'Established']];
export const TEAM_OPTS: Opt[] = [['', 'Select'], ['1', 'Just me'], ['2-5', '2–5 people'], ['6-20', '6–20 people'], ['21-50', '21–50 people'], ['50+', 'More than 50']];
export const PAY_OPTS: Opt[] = [['cash', 'Cash'], ['mobile', 'Mobile money'], ['card', 'Card'], ['bank', 'Bank transfer']];
export const PRIORITY_OPTS: Opt[] = [['operations', 'Operations'], ['finance', 'Finance'], ['sales', 'Sales'], ['people', 'People'], ['projects', 'Projects'], ['insights', 'Insights']];
export const NOTIFY_OPTS: Opt[] = [['review', 'Monthly review reminder'], ['weekly', 'Weekly summary'], ['cash', 'Low-cash alerts']];
export const REVIEW_DAY_OPTS: Opt[] = [['last', 'Last working day'], ['1', '1st of the month'], ['5', '5th'], ['15', '15th'], ['25', '25th']];
export const MY_ROLE_OPTS: Opt[] = [['owner', 'Owner or founder'], ['finance', 'Finance'], ['ops', 'Operations'], ['other', 'Other']];

export const ROLES: Record<Role, [string, string]> = {
  owner: ['Business co-owner', 'Shares full ownership of one business: its settings, finances and who can access it.'],
  admin: ['Workspace administrator', 'Manages people, businesses and settings across the workspace.'],
  member: ['Workspace member', 'Works only in the businesses and projects they’re added to.'],
  manager: ['Business manager', 'Full access to one business, chosen after they accept.'],
  viewer: ['Viewer', 'Read-only access to what they’re added to.'],
};
export const ROLE_OPTS: Opt[] = Object.entries(ROLES).map(([k, v]) => [k, v[0]] as Opt);

export const CONCEPT: Record<string, [string, string]> = {
  workspace: ['Workspace', 'The shared space for your team. One workspace can hold many businesses.'],
  businesses: ['Businesses', 'Each business keeps its own profile and currency. Add as many as you manage.'],
  finance: ['Starting point', 'Optional figures you enter yourself. They seed break-even and forecasts, and are never estimated.'],
  priorities: ['Priorities', 'Preferences only. They shape your first suggestions, never your data.'],
  project: ['Projects', 'A project belongs to one business or links several. Linking never shares records.'],
  team: ['People & access', 'Access is granted per workspace, business or project, and enforced by the database.'],
  review: ['Review', 'Nothing is created until you confirm.'],
  done: ['Ready', 'Your workspace is set up.'],
};

export const META: Record<string, { title: string; lede: string }> = {
  welcome: { title: 'Your businesses, in one calm place.', lede: '' },
  join: { title: 'Enter your invitation', lede: 'Paste the link or code you were sent. We verify it securely before showing anything about the workspace.' },
  workspace: { title: 'Name your workspace', lede: 'The shared environment for your team. It can hold several businesses, and you’ll be its owner.' },
  businesses: { title: 'Add your businesses', lede: 'Start with one, or add several. Each keeps its own profile, currency and financial year. Open “More about this business” to add detail now or later.' },
  finance: { title: 'Your starting point', lede: 'Optional numbers that you enter yourself. They seed break-even and forecasts, and Lumini never estimates them for you.' },
  priorities: { title: 'Goals and rhythm', lede: 'Choose what matters, set a target if you have one, and decide how Lumini keeps you on track. These are preferences, not connected data.' },
  project: { title: 'Start a first project?', lede: 'Projects hold the work. A project can belong to one business, or link several that share an initiative.' },
  team: { title: 'Invite your team', lede: 'Invitations are sent once your workspace exists. Choose each person’s access, and limit it to one business where it applies.' },
  review: { title: 'Review and launch', lede: 'Check the details below. Nothing is created until you confirm.' },
};

const uid = () => 'b' + Math.random().toString(36).slice(2, 9);
export const newBusiness = (): Business => ({
  id: uid(), name: '', country: 'KE', cur: 'KES', industry: '', offer: '', stage: '',
  legal: '', web: '', desc: '', fy: '1', tz: TZ, team: '', pay: [],
  tax: '', cash: '', rev: '', price: '', cost: '',
});
export const newInvite = (): Invite => ({ email: '', role: 'member', title: '', scope: 'all' });
export const emptyDraft = (): Draft => ({
  me: { name: '', role: 'owner' },
  ws: { name: '', desc: '', logo: '' },
  biz: [newBusiness()],
  pri: [],
  goal: { text: '', when: '', day: 'last', notify: ['review'] },
  proj: { mode: 'none', name: '', biz: [] },
  inv: [newInvite()],
  msg: '',
});

export const bizName = (b: Business) => b.name.trim() || 'Untitled business';
export const ownerCount = (d: Draft, b: Business) =>
  1 + d.inv.filter((r) => r.role === 'owner' && r.scope === b.id && r.email.trim()).length;
