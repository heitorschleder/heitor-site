export type TechGroup = { label: string; items: { name: string; core?: boolean }[] }

export const TECH_GROUPS: TechGroup[] = [
  {
    label: 'Languages',
    items: [
      { name: 'TypeScript', core: true },
      { name: 'JavaScript', core: true },
      { name: 'Dart', core: true },
      { name: 'Java', core: true },
      { name: 'Python' },
      { name: 'PHP' },
      { name: 'SQL' },
    ],
  },
  {
    label: 'Frontend',
    items: [
      { name: 'React', core: true },
      { name: 'Next.js', core: true },
      { name: 'Flutter', core: true },
      { name: 'Vue' },
      { name: 'Nuxt 3' },
      { name: 'React Native' },
      { name: 'Tailwind' },
      { name: 'Sass' },
    ],
  },
  {
    label: 'Backend & APIs',
    items: [
      { name: 'Java', core: true },
      { name: 'Node.js', core: true },
      { name: 'Laravel' },
      { name: 'Directus' },
      { name: 'WordPress' },
      { name: 'REST' },
      { name: 'GraphQL' },
    ],
  },
  {
    label: 'Data & AI',
    items: [
      { name: 'Image recognition', core: true },
      { name: 'OCR', core: true },
      { name: 'Python' },
      { name: 'MySQL' },
      { name: 'SQLite' },
    ],
  },
  {
    label: 'Cloud & DevOps',
    items: [
      { name: 'AWS' },
      { name: 'Google Cloud' },
      { name: 'Cloudflare' },
      { name: 'Docker' },
      { name: 'NGINX' },
      { name: 'Linux' },
      { name: 'CI/CD' },
    ],
  },
  {
    label: 'Commerce',
    items: [{ name: 'VTEX' }, { name: 'Shopify' }, { name: 'Hotmart' }, { name: 'Eduzz' }],
  },
  { label: 'Testing', items: [{ name: 'Cypress' }, { name: 'Jest' }, { name: 'n8n' }] },
]

export type Education = { year: string; title: string; issuer: string; degree?: boolean }

export const EDUCATION: Education[] = [
  {
    year: '2024',
    title: 'Technologist Degree in Data Science',
    issuer: 'Universidade Estácio de Sá — Brazil',
    degree: true,
  },
  { year: '2024', title: 'ReactJS and Next.js — Intermediate and Advanced', issuer: 'Udemy' },
  { year: '2023', title: 'Vue: The Complete Guide', issuer: 'Udemy' },
  { year: '2022', title: 'Complete JavaScript, from Beginner to Master', issuer: 'Udemy' },
]
