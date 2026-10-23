/**
 * Illustrations exported from the Figma image fills at 2x as WebP, in public/illustrations.
 * Keys follow the Figma layer names. `ready` turns true once the file has been exported.
 */
export type Illustration = { src: string; alt: string; width: number; height: number; ready: boolean };

const art = (file: string, alt: string, width: number, height: number, ready = false): Illustration => ({
  src: `/illustrations/${file}.webp`,
  alt,
  width,
  height,
  ready,
});

export const illustrations = {
  hero: art('hero-door', 'A tall wooden door standing ajar', 800, 1000),
  doorWorkIn: art('tape-and-shears', 'A tape measure and tailoring shears', 746, 400),
  doorWorkWith: art('thread-and-cloth', 'A spool of thread on folded cloth', 746, 400),
  doorBack: art('key-and-envelope', 'A key resting on an envelope', 746, 400),
  feelingI: art('mirror', 'A standing mirror in a wooden frame', 1116, 720),
  feelingII: art('umbrella', 'An umbrella in a stand by the door', 1116, 720),
  operator: art('ledger', 'An open ledger with a pocket watch', 1296, 520),
  stylist: art('swatch', 'A fanned stack of cloth swatches', 1296, 520),
  photographer: art('camera', 'A folding camera on a tripod', 1296, 520),
  tailors: art('iron', 'A pressing iron on folded cloth', 684, 400),
  cloth: art('shuttle', 'A weaving shuttle resting on cloth', 684, 400),
  groomers: art('brush', 'A shaving brush and a comb', 684, 400),
  couriers: art('bag', 'A garment bag on a hanger', 684, 400),
  back: art('table', 'A round table with three chairs', 840, 840),
  leave: art('knocker', 'A door knocker', 840, 630),
  received: art('letter-and-pen', 'A letter beside a fountain pen', 960, 640),
} satisfies Record<string, Illustration>;

export type IllustrationKey = keyof typeof illustrations;
