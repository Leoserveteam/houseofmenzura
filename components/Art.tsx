import Image from 'next/image';
import { illustrations, type IllustrationKey } from '@/lib/illustrations';

/** A fixed-size illustration frame: cover crop and multiply blend, as in Figma. */
export default function Art({ name, className = '', priority = false, sizes = '(max-width: 900px) 100vw, 400px' }: { name: IllustrationKey; className?: string; priority?: boolean; sizes?: string }) {
  const a = illustrations[name];
  return (
    <div className={`art ${className}`.trim()}>
      <Image src={a.src} alt={a.alt} width={a.width} height={a.height} sizes={sizes} priority={priority} quality={80} />
    </div>
  );
}
