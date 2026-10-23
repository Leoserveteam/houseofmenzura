'use client';

import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi; __homTurnstile?: Promise<void> }
}

function loadScript() {
  window.__homTurnstile ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('turnstile'));
    document.head.appendChild(s);
  });
  return window.__homTurnstile;
}

/** Cloudflare Turnstile. Renders nothing in local test mode, where the server accepts a fixed token. */
export default function Turnstile({ siteKey, onToken, resetKey }: { siteKey: string | null; onToken: (t: string) => void; resetKey: number }) {
  const el = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!siteKey) {
      cb.current('test-pass');
      return;
    }
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !el.current || !window.turnstile) return;
        widget.current = window.turnstile.render(el.current, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (t: string) => cb.current(t),
          'expired-callback': () => cb.current(''),
          'error-callback': () => cb.current(''),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetKey && widget.current && window.turnstile) {
      cb.current('');
      window.turnstile.reset(widget.current);
    }
  }, [resetKey]);

  return siteKey ? <div ref={el} style={{ minHeight: 65 }} /> : null;
}
