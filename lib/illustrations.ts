/**
 * Light illustrations from the Figma source frame 169:1107, exported uncropped at native size and served as WebP.
 * Every slot crops them with object-fit: cover, as Figma's FILL scale mode does, and blends them with multiply.
 */
export type Illustration = { src: string; alt: string; width: number; height: number };

const art = (file: string, alt: string, width = 1600, height = 1066): Illustration => ({ src: `/illustrations/${file}.webp`, alt, width, height });

export const illustrations = {
  hero: art('hero', 'A tall wooden door standing ajar', 928, 1152),
  doorWorkIn: art('door1', 'A tape measure, tailor’s chalk and shears'),
  doorWorkWith: art('door2', 'A spool of thread and a needle on folded cloth'),
  doorBack: art('door3', 'A key resting on an envelope'),
  feelingI: art('mirror', 'A standing mirror in a wooden frame'),
  feelingII: art('umbrella', 'An umbrella in a stand by the door'),
  operator: art('ledger', 'An open ledger with a pocket watch'),
  stylist: art('swatch', 'A fanned stack of cloth swatches'),
  photographer: art('camera', 'A folding camera on a tripod'),
  tailors: art('iron', 'A pressing iron on folded cloth'),
  cloth: art('shuttle', 'A weaving shuttle beside a length of cloth'),
  groomers: art('brush', 'A shaving brush and a comb'),
  couriers: art('bag', 'A garment bag on a hanger'),
  back: art('table', 'A round table with three chairs', 1536, 1536),
  leave: art('knocker', 'A door knocker', 1600, 1207),
  received: art('received', 'An envelope beside a fountain pen'),
} satisfies Record<string, Illustration>;

export type IllustrationKey = keyof typeof illustrations;
