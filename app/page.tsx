import Art from '@/components/Art';
import { CardBody } from '@/components/Card';
import Footer from '@/components/Footer';
import { FormNavProvider, TabLink } from '@/components/FormNav';
import Header from '@/components/Header';
import LeaveSection, { SECURITIES_NOTE } from '@/components/ApplyForm';
import RoleCards from '@/components/RoleCards';
import { roles } from '@/content/roles';
import { turnstileSiteKey } from '@/lib/server/env';
import type { IllustrationKey } from '@/lib/illustrations';

const partners: { art: IllustrationKey; title: string; text: string }[] = [
  { art: 'tailors', title: 'Tailors', text: 'For alterations, pressing and the morning of the occasion.' },
  { art: 'cloth', title: 'Cloth mills and merchants', text: 'For the finest wools, aso-oke, damask and lace.' },
  { art: 'groomers', title: 'Groomers', text: 'For the moments members are photographed.' },
  { art: 'couriers', title: 'Couriers', text: 'For pieces delivered by hand, on time and without a word.' },
];

const steps = ['Choose who you are below.', 'Leave your details and a few lines.', 'A person reads it and replies within a week.'];

export default function Home() {
  return (
    <FormNavProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <section className="hero" id="top">
          <div className="fields" aria-hidden="true">
            <span className="field-blob blob-indigo fb-hero-indigo" />
            <span className="field-blob blob-brass fb-hero-brass" />
          </div>
          <div className="wrap">
            <div className="hero-top">
              <div className="hero-text">
                <p className="t-label">Founding roles&nbsp;&nbsp;·&nbsp;&nbsp;Partners&nbsp;&nbsp;·&nbsp;&nbsp;A first round</p>
                <h1 className="t-display">A house is only as good as the people who keep it.</h1>
                <p className="t-lead">
                  Menzura is a private house of up to 500 founders and executives, each dressed to his own measure every month. We are now choosing the first people who will look after them, work beside us and back the house.
                </p>
                <a className="hero-link" href="https://menzura.co" target="_blank" rel="noopener">
                  <span>
                    See the house members join at <u>menzura.co</u> ↗<span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              </div>
              <Art name="hero" className="hero-art" priority sizes="(max-width: 900px) calc(100vw - 48px), 400px" />
            </div>
            <nav className="doors" aria-label="Three ways in">
              <TabLink tab="work-in" className="card">
                <CardBody art="doorWorkIn" eyebrow="01" title="Work in the house" text="Founding roles for people who look after others for a living." titleLevel={2} />
              </TabLink>
              <TabLink tab="work-with" className="card">
                <CardBody art="doorWorkWith" eyebrow="02" title="Work with the house" text="A small number of tailors, mills, groomers and couriers in each city." titleLevel={2} />
              </TabLink>
              <TabLink tab="back" className="card">
                <CardBody art="doorBack" eyebrow="03" title="Back the house" text="A first round, raised privately from a small circle." titleLevel={2} />
              </TabLink>
            </nav>
          </div>
        </section>

        <section className="section" aria-labelledby="gives-title">
          <div className="wrap gives">
            <p className="t-label">What the house gives</p>
            <h2 className="t-sub" id="gives-title">Every member should feel two things.</h2>
            <div className="feelings">
              <div className="feeling">
                <Art name="feelingI" sizes="(max-width: 900px) calc(100vw - 48px), 560px" />
                <p className="t-promise" aria-hidden="true">I</p>
                <p className="t-statement">That he is known, chosen and seen at his best.</p>
              </div>
              <div className="feeling">
                <Art name="feelingII" sizes="(max-width: 900px) calc(100vw - 48px), 560px" />
                <p className="t-promise" aria-hidden="true">II</p>
                <p className="t-statement">And that nothing is left to chance.</p>
              </div>
            </div>
            <p className="t-body-l gives-close">
              Everything the house does serves one of those two feelings. If giving people that is the work you are proudest of, you will find your place here. If it is not, this house is not for you.
            </p>
          </div>
        </section>

        <section className="section" id="work-in" aria-labelledby="work-in-title">
          <div className="fields" aria-hidden="true">
            <span className="field-blob blob-brass fb-roles-brass" />
            <span className="field-blob blob-indigo fb-roles-indigo" />
          </div>
          <div className="wrap section-body">
            <div className="section-head">
              <p className="t-label">Work in the house</p>
              <h2 className="t-section" id="work-in-title">Founding roles, held once.</h2>
              <p className="t-lead">These are founding roles. Each will be held once, by the person who shapes how it is done for everyone who follows.</p>
            </div>
            <RoleCards roles={roles} />
            <TabLink tab="work-in" target="form" className="btn btn-solid">Apply for a founding role</TabLink>
          </div>
        </section>

        <section className="section" id="work-with" aria-labelledby="work-with-title">
          <div className="wrap section-body">
            <div className="section-head">
              <p className="t-label">Work with the house</p>
              <h2 className="t-section" id="work-with-title">A small number in each city.</h2>
              <p className="t-lead">
                The house works with a small number of partners in each city, chosen for their standards and their discretion. Every partner signs a confidentiality agreement, and no partner is ever named.
              </p>
            </div>
            <ul className="partners">
              {partners.map((p) => (
                <li className="partner" key={p.title}>
                  <Art name={p.art} sizes="(max-width: 760px) calc(100vw - 48px), 160px" />
                  <h3 className="t-card">{p.title}</h3>
                  <p className="t-body-l">{p.text}</p>
                </li>
              ))}
            </ul>
            <TabLink tab="work-with" target="form" className="btn btn-solid">Propose a partnership</TabLink>
          </div>
        </section>

        <section className="section" id="back" aria-labelledby="back-title">
          <div className="wrap back">
            <div className="back-text">
              <div className="section-head">
                <p className="t-label">Back the house</p>
                <h2 className="t-section" id="back-title">A first round, raised from a small circle.</h2>
                <p className="t-lead">
                  The house is raising its first round from a small circle of people who understand what it is building. If you would like an introduction, leave your name. Every conversation happens in private.
                </p>
              </div>
              <TabLink tab="back" target="form" className="btn btn-line">Request an introduction</TabLink>
              <p className="t-meta back-note">{SECURITIES_NOTE}</p>
            </div>
            <Art name="back" className="back-art" sizes="(max-width: 900px) calc(100vw - 48px), 420px" />
          </div>
        </section>

        <section className="section" id="leave-your-name" aria-labelledby="leave-title">
          <div className="fields" aria-hidden="true">
            <span className="field-blob blob-brass fb-leave-brass" />
            <span className="field-blob blob-indigo fb-leave-indigo" />
          </div>
          <div className="wrap">
            <LeaveSection
              siteKey={turnstileSiteKey()}
              how={
                <div className="how">
                  <p className="t-label">Leave your name</p>
                  <h2 className="t-section" id="leave-title">How it works.</h2>
                  <p className="t-body-l">
                    Leave your name and a few lines. Every note is read by a person. If there is a fit, the house will be in touch within a week. If there is not, we will tell you that too.
                  </p>
                  <ol className="steps">
                    {steps.map((s, i) => (
                      <li className="step" key={s}>
                        <span className="t-promise" aria-hidden="true">{i + 1}</span>
                        <span className="t-body-l">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <Art name="leave" sizes="(max-width: 1100px) calc(100vw - 48px), 420px" />
                </div>
              }
            />
          </div>
        </section>
      </main>
      <Footer />
    </FormNavProvider>
  );
}
