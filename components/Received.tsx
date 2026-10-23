'use client';

import { useEffect, useRef } from 'react';
import Art from './Art';

/** The designed confirmation state. It replaces the form after a successful send. */
export default function Received() {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    document.getElementById('leave-your-name')?.scrollIntoView({ block: 'start' });
  }, []);
  return (
    <div className="received" role="status">
      <Art name="received" sizes="(max-width: 600px) 100vw, 480px" />
      <span className="t-label">Received</span>
      <h2 className="t-section" ref={heading} tabIndex={-1}>Thank you.</h2>
      <p className="t-lead">A person from the house will read this. If there is a fit, you will hear from us within a week. If there is not, we will tell you that too.</p>
      <p className="t-meta muted">You can close this page.</p>
    </div>
  );
}
