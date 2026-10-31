export type Opt = readonly [value: string, label: string];
export type Offer = '' | 'products' | 'services' | 'both';
export type Stage = '' | 'idea' | 'early' | 'established';
export type Role = 'owner' | 'admin' | 'member' | 'manager' | 'viewer';
export type StepId = 'workspace' | 'businesses' | 'finance' | 'priorities' | 'project' | 'team' | 'review';
export type Step = 'welcome' | StepId | 'done';
export type Errors = Record<string, string>;

/** Numeric inputs are kept as strings while editing. Convert before saving. */
export interface Business {
  id: string; // temporary client id; map to the real id when you create the business
  name: string; country: string; cur: string; industry: string;
  offer: Offer; stage: Stage;
  legal: string; web: string; desc: string;
  fy: string; tz: string; team: string; pay: string[];
  tax: string; cash: string; rev: string; price: string; cost: string;
}

export interface Invite {
  email: string; role: Role; title: string;
  /** 'all' (whole workspace) or a Business.id. Owners must name a business. */
  scope: string;
}

export interface Project { mode: 'none' | 'single' | 'cross'; name: string; biz: string[] }

export interface Draft {
  me: { name: string; role: string };
  ws: { name: string; desc: string; logo: string }; // logo is a data URL until you upload it
  biz: Business[];
  pri: string[];
  goal: { text: string; when: string; day: string; notify: string[] };
  proj: Project;
  inv: Invite[];
  msg: string;
}

/** Backend contract for persistent onboarding and workspace creation. */
export interface OnboardingAdapter {
  loadDraft(): Promise<{ step: Step; draft: Draft } | null>;
  saveDraft(step: Step, draft: Draft): Promise<void>;
  clearDraft(): Promise<void>;
  verifyInvitation(code: string): Promise<{ ok: boolean; message?: string }>;
  createWorkspace(draft: Draft): Promise<{ workspaceId: string }>;
}
