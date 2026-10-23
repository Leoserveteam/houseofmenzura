import Wordmark from './Wordmark';
import { TabLink } from './FormNav';

export default function Header({ home = true }: { home?: boolean }) {
  return (
    <header className="header">
      <div className="wrap">
        <a className="brand" href={home ? '#top' : '/'} aria-label="House of Menzura, back to top">
          <span className="t-label">House of</span>
          <Wordmark />
        </a>
        <nav className="nav" aria-label="Sections">
          <TabLink tab="work-in" className="nav-link">Work in the house</TabLink>
          <TabLink tab="work-with" className="nav-link">Work with the house</TabLink>
          <TabLink tab="back" className="nav-link">Back the house</TabLink>
          <a className="btn btn-line" href={home ? '#leave-your-name' : '/#leave-your-name'}>Leave your name</a>
        </nav>
      </div>
    </header>
  );
}
