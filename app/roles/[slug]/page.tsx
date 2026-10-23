import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import RoleContent from '@/components/RoleContent';
import { getRole, roleSlugs } from '@/content/roles';

export const dynamicParams = false;
export const generateStaticParams = () => roleSlugs.map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const role = getRole((await params).slug);
  if (!role) return {};
  return { title: role.title, description: role.summary, openGraph: { title: `${role.title} · House of Menzura`, description: role.summary } };
}

export default async function RolePage({ params }: { params: Promise<{ slug: string }> }) {
  const role = getRole((await params).slug);
  if (!role) notFound();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header home={false} />
      <main id="main" className="role-page on-ink">
        <div className="wrap">
          <RoleContent
            role={role}
            top={<a className="back-link" href="/#work-in">All founding roles</a>}
            apply={
              <a className="btn btn-solid" href={`/?form=work-in&role=${role.slug}#leave-your-name`}>
                Apply for this role
              </a>
            }
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
