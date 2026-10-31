import { emptyDraft } from './config';
import type { Draft, OnboardingAdapter, Step } from './types';

const STORAGE_KEY = 'lumini-onboarding-preview-v1';

export const previewAdapter: OnboardingAdapter = {
  async loadDraft() {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as {
      step?: Step;
      draft?: Draft;
    };

    if (
      !parsed.step ||
      !parsed.draft ||
      typeof parsed.draft !== 'object'
    ) {
      throw new Error('The saved preview could not be restored. Clear the preview data and try again.');
    }

    return {
      step: parsed.step,
      draft: {
        ...emptyDraft(),
        ...parsed.draft,
        biz: Array.isArray(parsed.draft.biz) ? parsed.draft.biz : [],
      },
    };
  },

  async saveDraft(step, draft) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step, draft }),
    );
  },

  async clearDraft() {
    window.localStorage.removeItem(STORAGE_KEY);
  },

  async verifyInvitation() {
    return {
      ok: false,
      message: 'Invitation verification is not part of the local preview.',
    };
  },

  async createWorkspace() {
    // Deliberately does not call Supabase or create a real workspace.
    return { workspaceId: 'local-preview-only' };
  },
};