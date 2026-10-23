import Wordmark from './Wordmark';

export default function Footer() {
  return (
    <footer className="footer on-indigo">
      <div className="wrap">
        <div className="footer-brand">
          <Wordmark />
          <p className="t-caption">A house of five hundred men.</p>
        </div>
        <div className="footer-links">
          <a className="menzura" href="https://menzura.co" target="_blank" rel="noopener">
            menzura.co<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="privacy" href="/privacy">Privacy</a>
          <span>© 2026 Menzura</span>
        </div>
      </div>
    </footer>
  );
}
