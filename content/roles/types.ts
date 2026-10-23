export type RoleSlug = 'operator' | 'stylist' | 'photographer';

/** One published version of a role description. Published versions are never edited; add a new dated file instead. */
export type RoleVersion = {
  slug: RoleSlug;
  publishedOn: string;
  title: string;
  /** Short line on the role card. */
  summary: string;
  /** Opening paragraph on the dialog and role page. */
  lead: string;
  whatYouWillDo: string[];
  whatYouBring: string[];
  howItIsMeasured: string;
};
