'use client';

import { useEffect, useRef, useState } from 'react';
import { CardBody } from './Card';
import RoleContent from './RoleContent';
import { useFormNav } from './FormNav';
import { CloseIcon } from './icons';
import type { RoleSlug, RoleVersion } from '@/content/roles/types';

/** Role cards, and the role description in a modal dialog (desktop) or full-screen sheet (mobile). */
export default function RoleCards({ roles }: { roles: RoleVersion[] }) {
  const nav = useFormNav();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const applying = useRef(false);
  const [open, setOpen] = useState<RoleSlug | null>(null);
  const role = roles.find((r) => r.slug === open);

  useEffect(() => {
    const d = dialog.current;
    if (open && d && !d.open) d.showModal();
  }, [open]);

  const close = () => dialog.current?.close();

  const onClose = () => {
    setOpen(null);
    if (!applying.current) opener.current?.focus();
    applying.current = false;
  };

  const apply = (slug: RoleSlug) => {
    applying.current = true;
    close();
    nav?.go('work-in', { target: 'form', role: slug, focusRole: true });
  };

  return (
    <>
      <div className="roles">
        {roles.map((r) => (
          <button
            key={r.slug}
            type="button"
            className="card"
            aria-haspopup="dialog"
            data-role={r.slug}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setOpen(r.slug);
            }}
          >
            <CardBody art={r.slug} eyebrow="Founding role" title={r.title} text={r.summary} />
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="role-dialog"
        aria-labelledby="role-dialog-title"
        onClose={onClose}
        onKeyDown={(e) => {
          // Keep Tab and Shift+Tab inside the dialog rather than letting focus reach the browser chrome.
          if (e.key !== 'Tab') return;
          const items = [...e.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
          if (!items.length) return;
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (t === e.currentTarget || t.classList.contains('role-dialog-inner')) close();
        }}
      >
        {role ? (
          <div className="role-dialog-inner">
            <RoleContent
              role={role}
              headingId="role-dialog-title"
              top={
                <button type="button" className="icon-button" onClick={close} aria-label="Close">
                  <CloseIcon />
                </button>
              }
              apply={
                <button type="button" className="btn btn-solid" onClick={() => apply(role.slug)}>
                  Apply for this role
                </button>
              }
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
