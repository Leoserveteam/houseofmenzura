export type Kind = 'work_in' | 'work_with' | 'back';
export type TabKey = 'work-in' | 'work-with' | 'back';

export const tabs: { key: TabKey; kind: Kind; label: string }[] = [
  { key: 'work-in', kind: 'work_in', label: 'Work in the house' },
  { key: 'work-with', kind: 'work_with', label: 'Work with the house' },
  { key: 'back', kind: 'back', label: 'Back the house' },
];

export const kindLabel: Record<Kind, string> = {
  work_in: 'Work in the house',
  work_with: 'Work with the house',
  back: 'Back the house',
};

export const tabToKind = (t: string | null | undefined): Kind | undefined => tabs.find((x) => x.key === t)?.kind;
export const kindToTab = (k: Kind): TabKey => tabs.find((x) => x.kind === k)!.key;

type Option<T extends string = string> = { value: T; label: string };

export const roleOptions = [
  { value: 'operator', label: 'Operator' },
  { value: 'stylist', label: 'Stylist' },
  { value: 'photographer', label: 'Photographer' },
] as const satisfies readonly Option[];

export const yearsInFieldOptions = [
  { value: 'under_2', label: 'Under 2 years' },
  { value: '2_5', label: '2 to 5 years' },
  { value: '5_10', label: '5 to 10 years' },
  { value: 'over_10', label: 'More than 10 years' },
] as const satisfies readonly Option[];

export const arrangementOptions = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'contract', label: 'Contract' },
] as const satisfies readonly Option[];

export const categoryOptions = [
  { value: 'tailor', label: 'Tailor' },
  { value: 'cloth', label: 'Cloth' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'courier', label: 'Courier' },
] as const satisfies readonly Option[];

export const yearsOperatingOptions = [
  { value: 'under_2', label: 'Under 2 years' },
  { value: '2_5', label: '2 to 5 years' },
  { value: '5_10', label: '5 to 10 years' },
  { value: '10_25', label: '10 to 25 years' },
  { value: 'over_25', label: 'More than 25 years' },
] as const satisfies readonly Option[];

export const investorTypeOptions = [
  { value: 'angel', label: 'Angel' },
  { value: 'family_office', label: 'Family office' },
  { value: 'strategic', label: 'Strategic' },
] as const satisfies readonly Option[];

export const chequeOptions = [
  { value: 'under_25k', label: 'Under $25,000 USD' },
  { value: '25k_100k', label: '$25,000 to $100,000 USD' },
  { value: '100k_250k', label: '$100,000 to $250,000 USD' },
  { value: '250k_1m', label: '$250,000 to $1,000,000 USD' },
  { value: 'over_1m', label: 'More than $1,000,000 USD' },
] as const satisfies readonly Option[];

export const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const satisfies readonly Option[];

export const values = <T extends readonly Option[]>(opts: T) =>
  opts.map((o) => o.value) as unknown as [T[number]['value'], ...T[number]['value'][]];

export const labelFor = (opts: readonly Option[], v: string | null | undefined) => opts.find((o) => o.value === v)?.label ?? '';
