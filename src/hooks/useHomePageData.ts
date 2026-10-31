import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  HomeBusiness,
  HomeBusinessStatus,
  HomePageData,
  HomePriority,
  HomeProject,
  HomeProjectStatus,
  HomeTask,
} from '../types/home';

type HomeSource = Partial<Omit<HomePageData, 'loading' | 'isDemo'>>;

export interface Derived {
  liveProjects: number;
  overdue: HomeTask[];
  today: HomeTask[];
  upcoming: { id: string; date: string; label: string }[];
  upcomingCount: number;
  attention: number;
  t0: string;
}

const emptyData: HomePageData = {
  businesses: [],
  projects: [],
  tasks: [],
  activity: [],
  insights: [],
  actions: {},
  loading: true,
  isDemo: false,
};

export function deriveHome(data: HomePageData): Derived {
  const now = new Date();

  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const liveProjects = data.projects.filter(
    (project) =>
      project.status !== 'completed' &&
      project.status !== 'cancelled',
  ).length;

  const overdue = data.tasks.filter(
    (task) =>
      !task.done &&
      Boolean(task.dueDate) &&
      task.dueDate!.slice(0, 10) < todayKey,
  );

  const today = data.tasks.filter(
    (task) =>
      !task.done &&
      task.dueDate?.slice(0, 10) === todayKey,
  );

  const upcoming = data.projects
    .filter(
      (project) =>
        project.dueDate &&
        project.dueDate.slice(0, 10) >= todayKey &&
        project.status !== 'completed' &&
        project.status !== 'cancelled',
    )
    .map((project) => ({
      id: project.id,
      date: project.dueDate!.slice(0, 10),
      label: project.name,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const attention = data.businesses.filter(
    (business) => business.status === 'attention',
  ).length;

  return {
    liveProjects,
    overdue,
    today,
    upcoming,
    upcomingCount: upcoming.length,
    attention,
    t0: todayKey,
  };
}

export function useHomePageData(source?: HomeSource) {
  const [data, setData] = useState<HomePageData>(() => ({
    ...emptyData,
    ...(source ?? {}),
    loading: !source,
    isDemo: false,
  }));

  useEffect(() => {
    if (source) {
      setData({
        ...emptyData,
        ...source,
        loading: false,
        isDemo: false,
      });
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setData((previous) => ({
          ...previous,
          loading: true,
          error: undefined,
        }));

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error('Please sign in to view your workspace.');

        const { data: memberships, error: membershipError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id);

        if (membershipError) throw membershipError;

        const workspaceIds = [
          ...new Set((memberships ?? []).map((row) => row.workspace_id)),
        ];

        if (workspaceIds.length === 0) {
          if (!cancelled) {
            setData({
              ...emptyData,
              userName: user.user_metadata?.full_name ?? user.email?.split('@')[0],
              loading: false,
              teamCount: 0,
            });
          }
          return;
        }

        const [
          businessesResult,
          businessMembersResult,
          projectsResult,
          projectBusinessesResult,
          projectMembersResult,
          workspaceMembersResult,
          tasksResult,
        ] = await Promise.all([
          supabase
            .from('businesses')
            .select('id, workspace_id, name, industry, status')
            .in('workspace_id', workspaceIds),

          supabase
            .from('business_members')
            .select('workspace_id, business_id, user_id')
            .in('workspace_id', workspaceIds),

          supabase
            .from('projects')
            .select('id, workspace_id, name, status, target_end_date, progress')
            .in('workspace_id', workspaceIds),

          supabase
            .from('project_businesses')
            .select('workspace_id, project_id, business_id')
            .in('workspace_id', workspaceIds),

          supabase
            .from('project_members')
            .select('workspace_id, project_id, user_id')
            .in('workspace_id', workspaceIds),

          supabase
            .from('workspace_members')
            .select('user_id')
            .in('workspace_id', workspaceIds),

          supabase
            .from('tasks')
            .select(
              'id, workspace_id, project_id, title, status, priority, due_date',
            )
            .in('workspace_id', workspaceIds),
        ]);

        const results = [
          businessesResult,
          businessMembersResult,
          projectsResult,
          projectBusinessesResult,
          projectMembersResult,
          workspaceMembersResult,
          tasksResult,
        ];

        for (const result of results) {
          if (result.error) throw result.error;
        }

        const businessRows = businessesResult.data ?? [];
        const businessMemberRows = businessMembersResult.data ?? [];
        const projectRows = projectsResult.data ?? [];
        const projectBusinessRows = projectBusinessesResult.data ?? [];
        const projectMemberRows = projectMembersResult.data ?? [];
        const workspaceMemberRows = workspaceMembersResult.data ?? [];
        const taskRows = tasksResult.data ?? [];

        const businessNames = new Map(
          businessRows.map((business) => [business.id, business.name]),
        );

        const projectNames = new Map(
          projectRows.map((project) => [project.id, project.name]),
        );

        const businesses: HomeBusiness[] = businessRows.map((business) => ({
          id: business.id,
          name: business.name,
          type: business.industry ?? undefined,
          status: business.status as HomeBusinessStatus,
          projectCount: projectBusinessRows.filter(
            (link) => link.business_id === business.id,
          ).length,
          memberCount: businessMemberRows.filter(
            (member) => member.business_id === business.id,
          ).length,
        }));

        const projects: HomeProject[] = projectRows
          .map((project) => ({
            id: project.id,
            name: project.name,
            status: project.status as HomeProjectStatus,
            dueDate: project.target_end_date ?? undefined,
            progress: Number(project.progress ?? 0),
            memberCount: projectMemberRows.filter(
              (member) => member.project_id === project.id,
            ).length,
            businessNames: projectBusinessRows
              .filter((link) => link.project_id === project.id)
              .map((link) => businessNames.get(link.business_id))
              .filter((name): name is string => Boolean(name)),
          }))
          .sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
          });

        const taskWorkspaceById = new Map<string, string>();

        const tasks: HomeTask[] = taskRows
          .map((task) => {
            taskWorkspaceById.set(task.id, task.workspace_id);

            const priority: HomePriority =
              task.priority === 'urgent' ? 'high' :
              task.priority === 'high' ? 'high' :
              task.priority === 'low' ? 'low' : 'medium';

            return {
              id: task.id,
              title: task.title,
              dueDate: task.due_date ?? undefined,
              priority,
              context: projectNames.get(task.project_id) ?? 'Project task',
              done: task.status === 'done',
            };
          })
          .sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
          });

        const teamCount = new Set(
          workspaceMemberRows.map((member) => member.user_id),
        ).size;

        const onToggleTask = async (taskId: string, done: boolean) => {
          const workspaceId = taskWorkspaceById.get(taskId);

          if (!workspaceId) {
            setData((previous) => ({
              ...previous,
              error: 'Unable to identify the workspace for this task.',
            }));
            return;
          }

          try {
            const { data: updatedTask, error: updateError } = await supabase
              .from('tasks')
              .update({
                status: done ? 'done' : 'todo',
                completed_at: done ? new Date().toISOString() : null,
              })
              .eq('id', taskId)
              .eq('workspace_id', workspaceId)
              .select('id')
              .maybeSingle();

            if (updateError) throw updateError;

            if (!updatedTask) {
              throw new Error(
                'Task was not updated. You may not have permission to change it.',
              );
            }

            if (!cancelled) {
              setData((previous) => ({
                ...previous,
                tasks: previous.tasks.map((task) =>
                  task.id === taskId ? { ...task, done } : task,
                ),
                error: undefined,
              }));
            }
          } catch (error) {
            if (!cancelled) {
              setData((previous) => ({
                ...previous,
                error:
                  error instanceof Error
                    ? error.message
                    : 'Unable to update this task.',
              }));
            }
          }
        };

        if (!cancelled) {
          setData((previous) => ({
            ...previous,
            userName: user.user_metadata?.full_name ?? user.email?.split('@')[0],
            businesses,
            projects,
            tasks,
            teamCount,
            activity: previous.activity.length ? previous.activity : [],
            insights: previous.insights.length ? previous.insights : [],
            actions: {
              ...previous.actions,
              onToggleTask,
            },
            loading: false,
            isDemo: false,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setData({
            ...emptyData,
            loading: false,
            isDemo: false,
            error:
              error instanceof Error
                ? error.message
                : 'Unable to load workspace information.',
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [source]);

  return {
    ...data,
    derived: deriveHome(data),
  };
}
