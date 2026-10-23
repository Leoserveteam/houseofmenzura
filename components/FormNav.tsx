'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { TabKey } from '@/lib/options';
import type { RoleSlug } from '@/content/roles/types';

type Target = 'section' | 'form';
type Request = { role: RoleSlug | null; focusRole: boolean; nonce: number };

type Ctx = {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  request: Request;
  /** Selects a tab, optionally a role, and scrolls to the tab's section or to the form. */
  go: (tab: TabKey, opts?: { target?: Target; role?: RoleSlug; focusRole?: boolean }) => void;
};

const FormNavContext = createContext<Ctx | null>(null);
export const useFormNav = () => useContext(FormNavContext);

const TAB_KEYS: TabKey[] = ['work-in', 'work-with', 'back'];
const ROLE_KEYS: RoleSlug[] = ['operator', 'stylist', 'photographer'];
const isTab = (v: string | null): v is TabKey => !!v && (TAB_KEYS as string[]).includes(v);
const isRole = (v: string | null): v is RoleSlug => !!v && (ROLE_KEYS as string[]).includes(v);

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function FormNavProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<TabKey>('work-in');
  const [request, setRequest] = useState<Request>({ role: null, focusRole: false, nonce: 0 });

  const go = useCallback<Ctx['go']>((t, opts = {}) => {
    setTab(t);
    if (opts.role) setRequest((r) => ({ role: opts.role!, focusRole: !!opts.focusRole, nonce: r.nonce + 1 }));
    const id = opts.target === 'form' ? 'leave-your-name' : t;
    // Where the form sits below "How it works" (narrow screens), go straight to the form.
    const stacked = opts.target === 'form' && window.matchMedia('(max-width: 1100px)').matches;
    const el = document.getElementById(stacked ? 'apply-form' : id);
    if (el) {
      el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
    }
  }, []);

  // ?form=work-in|work-with|back, or a matching hash, preselects the tab. ?role= preselects the role.
  useEffect(() => {
    const read = () => {
      const q = new URLSearchParams(location.search);
      const hash = location.hash.slice(1);
      const t = q.get('form');
      if (isTab(t)) setTab(t);
      else if (isTab(hash)) setTab(hash);
      const role = q.get('role');
      if (isRole(role)) {
        setTab('work-in');
        setRequest((r) => ({ role, focusRole: false, nonce: r.nonce + 1 }));
      }
    };
    read();
    const onHash = () => {
      const hash = location.hash.slice(1);
      if (isTab(hash)) setTab(hash);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const value = useMemo(() => ({ tab, setTab, request, go }), [tab, request, go]);
  return <FormNavContext.Provider value={value}>{children}</FormNavContext.Provider>;
}

/** An anchor that works without JavaScript, and with it also preselects the form tab. */
export function TabLink({
  tab,
  target = 'section',
  className,
  children,
  ...rest
}: { tab: TabKey; target?: Target; className?: string; children: React.ReactNode } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const nav = useFormNav();
  const hash = target === 'form' ? 'leave-your-name' : tab;
  const href = nav ? `#${hash}` : `/?form=${tab}#${hash}`;
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (!nav || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        nav.go(tab, { target });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
