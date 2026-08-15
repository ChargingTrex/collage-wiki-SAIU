export interface Member {
  name: string;
  role: string;
  batch: number;
  slug: string;
  github?: string;
  fossunited?: string;
  linkedin?: string;
  /** Lower order = displayed first */
  order: number;
  isCore: boolean;
}

/**
 * Canonical member list.
 *
 * - `order` controls display position everywhere (asc).
 * - `isCore` = true → appears on the Team page.
 * - Append-only: new members go at the end with the next `order` value.
 * - Members without `github` simply won't render a GitHub icon.
 */
export const members: Member[] = [
  {
    name: 'Aditya KB',
    role: 'Core Member',
    batch: 2028,
    slug: 'aditya-kb',
    github: '1AdityaX',
    fossunited: 'aditya_kb',
    linkedin: 'aditya-kb-19052005-in',
    order: 1,
    isCore: true,
  },
  {
    name: 'Vidhyakshaya Kannan',
    role: 'Core Member',
    batch: 2028,
    slug: 'vidhyakshaya-kannan',
    github: 'vidhyakshayakannan',
    fossunited: 'vidhyakshaya_kannan',
    linkedin: 'vidhyakshayakannan',
    order: 2,
    isCore: true,
  },
  {
    name: 'Pranav R',
    role: 'Core Member',
    batch: 2028,
    slug: 'pranav-r',
    github: 'pranavr2003',
    fossunited: 'pranav_r',
    linkedin: 'pranavr2003',
    order: 3,
    isCore: true,
  },
  {
    name: 'Arunbalaji Sathyanarayann',
    role: 'Core Member',
    batch: 2028,
    slug: 'arunbalaji-sathyanarayann',
    github: 'ChargingTrex',
    fossunited: 'arunbalaji_sathyanarayann',
    linkedin: 'arunbalaji-sathyanarayann-833a3b326',
    order: 4,
    isCore: true,
  },
  {
    name: 'B. Vaibhav',
    role: 'Core Member',
    batch: 2028,
    slug: 'vaibhav-b',
    github: 'y-bow',
    fossunited: 'ybo',
    linkedin: 'vaibhavbalaji',
    order: 5,
    isCore: true,
  },
];

/** Members sorted by order — use this everywhere instead of the raw array. */
export const sortedMembers = [...members].sort((a, b) => a.order - b.order);

/** Core-only members, sorted by order. */
export const coreMembers = sortedMembers.filter((m) => m.isCore);
