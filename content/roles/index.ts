import type { RoleSlug, RoleVersion } from './types';
import operator20261023 from './operator/2026-10-23';
import stylist20261023 from './stylist/2026-10-23';
import photographer20261023 from './photographer/2026-10-23';

export type { RoleSlug, RoleVersion };

/**
 * Every published version of every role, kept for a three-year record.
 * To change a role, add a new dated file and append it here. Never edit or remove a published file.
 */
export const roleHistory: Record<RoleSlug, RoleVersion[]> = {
  operator: [operator20261023],
  stylist: [stylist20261023],
  photographer: [photographer20261023],
};

export const roleSlugs: RoleSlug[] = ['operator', 'stylist', 'photographer'];

const latest = (slug: RoleSlug) =>
  [...roleHistory[slug]].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))[0];

export const roles: RoleVersion[] = roleSlugs.map(latest);

export const getRole = (slug: string) => roles.find((r) => r.slug === slug);
