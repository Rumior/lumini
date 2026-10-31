export type HomeBusinessStatus = 'active' | 'paused' | 'attention' | 'completed';
export type HomeProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type HomeStatus = HomeBusinessStatus | HomeProjectStatus;

export type HomePriority = 'high' | 'medium' | 'low' | 'urgent';

export interface HomeBusiness {
  id: string;
  name: string;
  type?: string;
  status?: HomeBusinessStatus;
  projectCount?: number;
  memberCount?: number;
  href?: string;
  signal?: string;
}

export interface HomeProject {
  id: string;
  name: string;
  businessNames: string[];
  dueDate?: string;
  status?: HomeProjectStatus;
  memberCount?: number;
  progress?: number;
  href?: string;
}

export interface HomeTask {
  id: string;
  title: string;
  dueDate?: string;
  priority?: HomePriority;
  time?: string;
  context?: string;
  done: boolean;
}

export interface HomeActivity {
  id: string;
  text: string;
  at: string;
}

export interface HomeInsight {
  id: string;
  title: string;
  priority?: 'high' | 'medium' | 'info';
  category?: string;
  why?: string;
  firstAction?: string;
  href?: string;
}

export interface HomeActions {
  onNewBusiness?: () => void;
  onNewProject?: () => void;
  onAddTask?: () => void;
  onInviteMember?: () => void;
  onAddToPlans?: (insightId: string) => void;
  onAskLumini?: (insightId: string) => void;
  onToggleTask?: (id: string, done: boolean) => void;
}

export interface HomePageData {
  userName?: string;
  businesses: HomeBusiness[];
  projects: HomeProject[];
  tasks: HomeTask[];
  teamCount?: number;
  activity: HomeActivity[];
  insights: HomeInsight[];
  actions: HomeActions;
  loading: boolean;
  error?: string;
  isDemo: boolean;
}
