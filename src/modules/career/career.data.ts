export type Role = {
  id: string
  role: string
  company: string
  note?: string
  period: string
  duration: string
  stack: { name: string; core?: boolean }[]
  summary: string
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
      'An image-recognition step in Python that checks whether a reported defect is really in the photo, telling a broken headlight from a flat tire. <b>99% accuracy</b> across <b>30+ defect types</b>, <b>60,000 images a day</b>, for under <b>US$25 a month</b> on a deliberately small model.',
      'Found and closed a Java backend bug in my first week that let users wipe a business-critical table. Replaced hard deletes with a soft-delete flag and put a validation guard in front of destructive actions.',
      'Rebuilt a heavy data table with list virtualization in React, removing the freezes that had made the screen unusable for a large client — and keeping an account that was already heading toward a refund.',
      'Cut a manual validation step from <b>10 minutes to 3</b> and removed transcription errors by reading values such as odometer readings straight from the image.',
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
      'Led a team of <b>4 developers</b>: defined the reference architectures, enforced coding standards through code review, and put CI/CD pipelines in place.',
      "Rebuilt the company's hosting infrastructure, cutting the annual bill from <b>R$45,000 to R$15,000</b> — two thirds off, every year, permanently.",
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
      'Built, with the team, an internal tool that automated landing page production. A page that took <b>4 to 5 days</b> to assemble by hand started going out in <b>about 3 hours</b> — roughly <b>90% off the build time</b> — by standardising the steps that were being redone from scratch every time.',
      'Built responsive interfaces in React and Vue with SSR (Next.js and Nuxt), reaching <b>under 1s in Lighthouse</b> on two SPAs of more than <b>1,000 pages</b> each.',
      'Implemented webhooks that kept transactions, inventory and sales metrics in sync in real time — <b>3,000 dispatches a day</b> across every state of a sale, load-tested with headroom for <b>10,000</b>.',
      'Integrated REST and GraphQL APIs to make content dynamic, and instrumented tracking with Google Analytics and Meta Pixel.',
      'Promoted to Tech Lead after <b>exactly one year</b> in the role.',
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
      'Promoted to Frontend Developer Jr after <b>one month</b>.',
    ],
  },
]
