import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export const metadata: Metadata = { title: 'Privacy notice', robots: { index: false } };

export default function Privacy() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header home={false} />
      <main id="main" className="legal">
        <div className="wrap">
          <div className="prose">
            <p className="t-label">Privacy</p>
            <h1 className="t-section">Privacy notice</h1>
            <p className="pending" role="note">Awaiting legal review. This is placeholder text and will be replaced with the final notice.</p>
            <h2>What we collect</h2>
            <p>The details you give in the form on this site: your name, email, phone, city and country, a link, who introduced you, and your answers. If you apply for a role, also the resume you attach.</p>
            <h2>What we never ask for</h2>
            <ul>
              <li>Date of birth</li>
              <li>ID or passport numbers</li>
              <li>Bank details</li>
              <li>Salary history</li>
              <li>Health information</li>
              <li>Canadian work experience</li>
            </ul>
            <h2>Why we keep it</h2>
            <p>Only to consider your application, proposal or request for an introduction, and to reply to you.</p>
            <h2>Who reads it</h2>
            <p>We use software to organise applications and prepare a short summary of each. A person reads every application and makes every decision. Your details are never shared outside the house.</p>
            <h2>How long we keep it</h2>
            <p>If we decline an application, we delete the resume and your written answers twelve months later.</p>
            <h2>Where it is kept</h2>
            <p>In a private database and private file storage in Canada. Files are never public and can only be opened by the house through links that expire after ten minutes.</p>
            <h2>Analytics</h2>
            <p>We count page visits without cookies and without identifying you.</p>
            <h2>Your choices</h2>
            <p>You can ask to see, correct or delete your details at any time.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
