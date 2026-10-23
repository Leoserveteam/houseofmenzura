import Art from './Art';
import type { RoleVersion } from '@/content/roles/types';

export const VACANCY_NOTE =
  'This is a current vacancy. We use software to organise applications and prepare a short summary of each. A person reads every application and makes every decision.';

/** The role description, shared by the dialog, the mobile sheet and the role page. */
export default function RoleContent({ role, top, apply, headingId }: { role: RoleVersion; top: React.ReactNode; apply: React.ReactNode; headingId?: string }) {
  return (
    <article className="role-panel">
      <div className="role-top">
        <span className="t-label">Founding role</span>
        {top}
      </div>
      <Art name={role.slug} sizes="(max-width: 760px) calc(100vw - 48px), 648px" />
      <div className="role-heading">
        <h2 className="t-section" id={headingId}>{role.title}</h2>
        <p className="t-lead">{role.lead}</p>
      </div>
      <section className="role-block" aria-label="What you will do">
        <h3 className="t-label">What you will do</h3>
        <ul>
          {role.whatYouWillDo.map((b) => (
            <li className="bullet" key={b}>{b}</li>
          ))}
        </ul>
      </section>
      <section className="role-block" aria-label="What you bring">
        <h3 className="t-label">What you bring</h3>
        <ul>
          {role.whatYouBring.map((b) => (
            <li className="bullet" key={b}>{b}</li>
          ))}
        </ul>
      </section>
      <section className="role-block" aria-label="How it is measured">
        <h3 className="t-label">How it is measured</h3>
        <p className="t-body-l">{role.howItIsMeasured}</p>
      </section>
      <div className="role-apply">
        {apply}
        <p className="t-meta">{VACANCY_NOTE}</p>
      </div>
    </article>
  );
}
