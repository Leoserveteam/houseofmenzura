import Art from './Art';
import type { IllustrationKey } from '@/lib/illustrations';

/** HoM / Card: the door card in the hero and the role card in Work in the house. */
export function CardBody({ art, eyebrow, title, text, titleLevel = 3 }: { art: IllustrationKey; eyebrow: string; title: string; text: string; titleLevel?: 2 | 3 }) {
  const Title = titleLevel === 2 ? 'h2' : 'h3';
  return (
    <>
      <Art name={art} sizes="(max-width: 600px) calc(100vw - 98px), (max-width: 900px) 100vw, 312px" />
      <span className="t-label">{eyebrow}</span>
      <Title className="t-card">{title}</Title>
      <span className="t-small">{text}</span>
      <span className="arrow" aria-hidden="true">→</span>
    </>
  );
}
