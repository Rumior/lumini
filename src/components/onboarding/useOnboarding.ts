import { useCallback, useEffect, useState } from 'react';
import { FLOW, emptyDraft, newBusiness, newInvite } from './config';
import type { Draft, Errors, OnboardingAdapter, Step, StepId } from './types';

export const getIn = (o: unknown, path: string): any =>
  path.split('.').reduce<any>((a, k) => a?.[k], o);

const setIn = (o: any, p: string[], v: unknown): any => {
  if (!p.length) return v;
  const [k, ...r] = p;
  if (Array.isArray(o)) {
    const c = [...o];
    c[+k] = setIn(o[+k], r, v);
    return c;
  }
  return { ...o, [k]: setIn(o?.[k], r, v) };
};

export function validate(step: Step, d: Draft): Errors {
  const e: Errors = {};

  if (step === 'workspace' && d.ws.name.trim().length < 2) {
    e['ws.name'] = 'Give your workspace a name of at least 2 characters.';
  }

  if (step === 'businesses') {
    d.biz.forEach((b, i) => {
      if (!b.name.trim()) e[`biz.${i}.name`] = 'Enter the business name.';
      if (!b.offer) {
        e[`biz.${i}.offer`] = 'Choose whether this business sells products, services or both.';
      }
    });
  }

  if (step === 'finance') {
    d.biz.forEach((b, i) => {
      (['cash', 'rev', 'price', 'cost'] as const).forEach((k) => {
        if (b[k] !== '' && !(Number.isFinite(Number(b[k])) && Number(b[k]) >= 0)) {
          e[`biz.${i}.${k}`] = 'Enter 0 or a positive number.';
        }
      });
    });
  }

  if (step === 'project' && d.proj.mode !== 'none') {
    const p = d.proj;
    if (!p.name.trim()) e['proj.name'] = 'Name the project.';
    if (p.mode === 'single' && p.biz.length !== 1) {
      e['proj.biz'] = 'Choose the business this project belongs to.';
    }
    if (p.mode === 'cross' && p.biz.length < 2) {
      e['proj.biz'] = 'Choose at least two businesses.';
    }
  }

  if (step === 'team') {
    d.inv.forEach((r, i) => {
      const em = r.email.trim();
      if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
        e[`inv.${i}.email`] = 'Enter a valid email address, like name@company.com.';
      }
      if (em && r.role === 'owner' && (!r.scope || r.scope === 'all')) {
        e[`inv.${i}.scope`] = 'Choose the business they will co-own.';
      }
    });
  }

  return e;
}

interface Options {
  onComplete?: (r: { workspaceId: string }) => void;
  onJoined?: () => void;
  onExit?: () => void;
}

export function useOnboarding(adapter: OnboardingAdapter, opts: Options = {}) {
  const [step, setStep] = useState<Step>('welcome');
  const [d, setD] = useState<Draft>(emptyDraft);
  const [err, setErr] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [loadRetry, setLoadRetry] = useState(0);
  const [saveError, setSaveError] = useState('');
  const [join, setJoin] = useState(false);
  const [code, setCode] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<{ workspaceId: string } | null>(null);

  const idx = FLOW.indexOf(step as StepId);

  useEffect(() => {
    let live = true;
    setReady(false);
    setLoadError('');

    adapter.loadDraft()
      .then((s) => {
        if (!live || !s) return;

        if (!FLOW.includes(s.step as StepId)) {
          throw new Error('Your saved setup has an invalid step. Please contact support.');
        }

        if (!s.draft || typeof s.draft !== 'object') {
          throw new Error('Your saved setup could not be read. Please try again.');
        }

        setD({
          ...emptyDraft(),
          ...s.draft,
          biz: (s.draft.biz || []).map((b) => ({ ...newBusiness(), ...b })),
        });
        setStep(s.step);
      })
      .catch((error: unknown) => {
        if (!live) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : 'We could not restore your saved setup. Please try again.',
        );
      })
      .finally(() => {
        if (live) setReady(true);
      });

    return () => {
      live = false;
    };
  }, [adapter, loadRetry]);

  useEffect(() => {
    if (!ready || loadError || step === 'welcome' || step === 'review' || step === 'done') return;

    const t = setTimeout(() => {
      void adapter.saveDraft(step, d)
        .then(() => setSaveError(''))
        .catch((error: unknown) => {
          setSaveError(
            error instanceof Error
              ? error.message
              : 'Your progress could not be saved. Please try again.',
          );
        });
    }, 400);

    return () => clearTimeout(t);
  }, [adapter, d, step, ready, loadError]);

  const fail = (e: Errors) => {
    setErr(e);
    setTick((t) => t + 1);
  };

  const go = useCallback((s: Step) => {
    setStep(s);
    setErr({});
  }, []);

  const set = useCallback((path: string, v: unknown) => {
    setD((p) => setIn(p, path.split('.'), v));
    setErr((e) => {
      if (!(path in e)) return e;
      const n = { ...e };
      delete n[path];
      return n;
    });
  }, []);

  const toggle = (path: string, k: string) => {
    const a: string[] = getIn(d, path) || [];
    set(path, a.includes(k) ? a.filter((x) => x !== k) : [...a, k]);
  };

  const launch = async () => {
    setBusy(true);
    setErr({});
    try {
      // The RPC creates the workspace and deletes the draft atomically.
      const r = await adapter.createWorkspace(d);
      setResult(r);
      setSaveError('');
      setStep('done');
    } catch (error: unknown) {
      setErr({
        form: error instanceof Error
          ? error.message
          : 'We could not create your workspace. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    const e = validate(step, d);
    if (Object.keys(e).length) return fail(e);
    if (step === 'review') {
      void launch();
    } else {
      go(FLOW[idx + 1]);
    }
  };

  const back = () => go(idx > 0 ? FLOW[idx - 1] : 'welcome');

  const skip = () => {
    if (step === 'project') set('proj', { mode: 'none', name: '', biz: [] });
    if (step === 'team') set('inv', [newInvite()]);
    go(FLOW[idx + 1]);
  };

  const exit = async () => {
    setBusy(true);
    setNote('');
    try {
      await adapter.saveDraft(step, d);
      setSaveError('');
      setNote('Progress saved. You can resume from here.');
      opts.onExit?.();
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Your progress could not be saved. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    try {
      const r = await adapter.verifyInvitation(code);
      if (r.ok) {
        opts.onJoined?.();
      } else {
        fail({ join: r.message || 'We could not verify this invitation.' });
      }
    } catch {
      fail({ join: 'Something went wrong. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const nameFromMe = () => {
    const n = d.me.name.trim();
    if (!n) {
      fail({ 'me.name': 'Enter your name first, then use it as the workspace name.' });
    } else {
      set('ws.name', n);
    }
  };

  const addBusiness = () =>
    setD((p) => ({ ...p, biz: [...p.biz, newBusiness()] }));

  const removeBusiness = (i: number) => setD((p) => {
    const gone = p.biz[i];
    const biz = p.biz.filter((_, k) => k !== i);
    let proj = { ...p.proj, biz: p.proj.biz.filter((x) => x !== gone.id) };

    if (biz.length < 2 && proj.mode === 'cross') {
      proj = { mode: 'none', name: '', biz: [] };
    }

    const inv = p.inv.map((r) =>
      r.scope === gone.id
        ? { ...r, scope: r.role === 'owner' ? '' : 'all' }
        : r,
    );

    return { ...p, biz, proj, inv };
  });

  const addInvite = () =>
    setD((p) => ({ ...p, inv: [...p.inv, newInvite()] }));

  const removeInvite = (i: number) => setD((p) => {
    const inv = p.inv.filter((_, k) => k !== i);
    return { ...p, inv: inv.length ? inv : [newInvite()] };
  });

  const toggleOpen = (id: string) =>
    setOpen((o) => ({ ...o, [id]: !o[id] }));

  const retryLoad = () => {
    setLoadError('');
    setLoadRetry((n) => n + 1);
  };

  const finish = () => {
    if (result) opts.onComplete?.(result);
  };

  return {
    step, d, err, busy, ready, loadError, saveError,
    join, code, open, note, tick, result,
    set, setErr, toggle, go, next, back, skip, exit, verify, finish,
    setJoin, setCode, nameFromMe, addBusiness, removeBusiness,
    addInvite, removeInvite, toggleOpen, retryLoad,
  };
}

export type Ctx = ReturnType<typeof useOnboarding>;
