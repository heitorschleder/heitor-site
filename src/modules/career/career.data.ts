export type Role = {
  id: string
  role: string
  company: string
  note?: string
  period: string
  duration: string
  stack: { name: string; core?: boolean }[]
  summary: string
  /** Key results. `**text**` marks emphasis (e.g. a figure) — never raw HTML. */
  results: string[]
  open?: boolean
}

export const CAREER_HEADLINE = 'Intern to Tech Lead in 13 months · 4 roles · 2 companies'

export const ROLES: Role[] = [
  {
    id: 'prologapp-dev',
    role: 'Software Developer',
    company: 'PrologApp',
    note: 'Full stack',
    period: 'Jun 2025 —',
    duration: '1 yr 3 mo',
    open: true,
    stack: [
      { name: 'React', core: true },
      { name: 'Flutter', core: true },
      { name: 'Java', core: true },
      { name: 'Python' },
    ],
    summary:
      'Full stack on a fleet management product used by more than 1,000 logistics companies, built across three stacks at once — React on the web, Flutter on mobile, Java on the backend — so the same feature lands consistently on every platform.',
    results: [
      'An image-recognition step in Python that checks whether a reported defect is really in the photo, telling a broken headlight from a flat tire. **99% accuracy** across **30+ defect types**, **60,000 images a day**, for under **US$25 a month** on a deliberately small model.',
      'Found and closed a Java backend bug in my first week that let users wipe a business-critical table. Replaced hard deletes with a soft-delete flag and put a validation guard in front of destructive actions.',
      'Rebuilt a heavy data table with list virtualization in React, removing the freezes that had made the screen unusable for a large client — and keeping an account that was already heading toward a refund.',
      'Cut a manual validation step from **10 minutes to 3** and removed transcription errors by reading values such as odometer readings straight from the image.',
      'Shipped real-time licence plate recognition with OCR in the Flutter app, taking manual plate entry out of the daily routine of drivers in the field.',
    ],
  },
  {
    id: 'kebook-lead',
    role: 'Tech Lead',
    company: 'Kebook',
    note: 'Promoted from Frontend Jr',
    period: 'Dec 2023 – Jun 2025',
    duration: '1 yr 7 mo',
    stack: [
      { name: 'Next.js', core: true },
      { name: 'Nuxt', core: true },
      { name: 'NGINX' },
      { name: 'CI/CD' },
    ],
    summary:
      'Led a four-developer team while staying hands-on across the whole cycle — front end, e-commerce integrations, and the hosting infrastructure underneath them.',
    results: [
      'Led a team of **4 developers**: defined the reference architectures, enforced coding standards through code review, and put CI/CD pipelines in place.',
      "Rebuilt the company's hosting infrastructure, cutting the annual bill from **R$45,000 to R$15,000** — two thirds off, every year, permanently.",
      'Mentored the team on SOLID and Clean Code, and drove the adoption of Scrum and Kanban.',
    ],
  },
  {
    id: 'kebook-jr',
    role: 'Frontend Developer Jr',
    company: 'Kebook',
    note: 'Promoted from Intern',
    period: 'Dec 2022 – Dec 2023',
    duration: '1 yr',
    stack: [
      { name: 'Vue', core: true },
      { name: 'Nuxt', core: true },
      { name: 'React' },
      { name: 'Node.js' },
    ],
    summary:
      'A year owning front-end delivery — and the internal tooling that changed how fast the whole team could ship.',
    results: [
      'Built, with the team, an internal tool that automated landing page production. A page that took **4 to 5 days** to assemble by hand started going out in **about 3 hours** — roughly **90% off the build time** — by standardising the steps that were being redone from scratch every time.',
      'Built responsive interfaces in React and Vue with SSR (Next.js and Nuxt), reaching **under 1s in Lighthouse** on two SPAs of more than **1,000 pages** each.',
      'Implemented webhooks that kept transactions, inventory and sales metrics in sync in real time — **3,000 dispatches a day** across every state of a sale, load-tested with headroom for **10,000**.',
      'Integrated REST and GraphQL APIs to make content dynamic, and instrumented tracking with Google Analytics and Meta Pixel.',
      'Promoted to Tech Lead after **exactly one year** in the role.',
    ],
  },
  {
    id: 'kebook-intern',
    role: 'Intern',
    company: 'Kebook',
    note: 'First role',
    period: 'Nov 2022 – Dec 2022',
    duration: '1 mo',
    stack: [{ name: 'HTML Email' }, { name: 'PHP' }, { name: 'Vue' }, { name: 'Nuxt' }],
    summary:
      'One month, and it covered both ends of the codebase at once: keeping the legacy system running while helping move the company off it.',
    results: [
      'Built and shipped a range of email marketing templates, the kind that have to render the same in every client including Outlook.',
      'Maintained the legacy PHP system while it was still carrying production traffic.',
      "Took part in the migration from PHP to Vue with Nuxt — the rewrite that set the company's front-end stack for the next two years.",
      'Promoted to Frontend Developer Jr after **one month**.',
    ],
  },
]
