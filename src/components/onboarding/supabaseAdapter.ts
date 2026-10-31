import { supabase } from '../../lib/supabase';
import type { Draft, OnboardingAdapter, Step } from './types';

async function currentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Unable to verify your session: ${error.message}`);
  }

  return data.user?.id ?? null;
}

export const supabaseAdapter: OnboardingAdapter = {
  async loadDraft() {
    const userId = await currentUserId();

    if (!userId) return null;

    const { data, error } = await supabase
      .from('onboarding_drafts')
      .select('current_step, draft')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to load your saved setup: ${error.message}`);
    }

    if (!data) return null;

    return {
      step: data.current_step as Step,
      draft: data.draft as Draft,
    };
  },

  async saveDraft(step, draft) {
    const userId = await currentUserId();

    if (!userId) {
      throw new Error('Please sign in to save your onboarding progress.');
    }

    const { error } = await supabase
      .from('onboarding_drafts')
      .upsert(
        {
          user_id: userId,
          current_step: step,
          draft,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (error) {
      throw new Error(`Unable to save your setup: ${error.message}`);
    }
  },

  async clearDraft() {
    const userId = await currentUserId();

    if (!userId) return;

    const { error } = await supabase
      .from('onboarding_drafts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Unable to clear your saved setup: ${error.message}`);
    }
  },

  async verifyInvitation(_code: string) {
    void _code;
    return {
      ok: false,
      message: 'Invitation acceptance is not available yet. Please ask the workspace owner to add you when team invitations are enabled.',
    };
  },

  async createWorkspace(draft) {
    const userId = await currentUserId();

    if (!userId) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    const { data, error } = await supabase.rpc(
      'create_lumini_workspace',
      { p_draft: draft },
    );

    if (error) {
      throw new Error(`Unable to create your workspace: ${error.message}`);
    }

    if (typeof data !== 'string' || !data) {
      throw new Error('The server did not return a valid workspace ID.');
    }

    return { workspaceId: data };
  },
};