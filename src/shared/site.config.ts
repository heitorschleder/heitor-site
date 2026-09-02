export const site = {
  name: 'Heitor Schleder',
  title: 'Heitor Schleder — Full Stack Developer',
  description:
    'Full stack developer building fleet software across three stacks — React on the web, Flutter in the field, Java behind both.',
  url: 'https://heitor-site.vercel.app',
  location: 'Palhoça, SC — Brazil',
  social: {
    github: { label: 'github.com/heitorschleder', href: 'https://github.com/heitorschleder' },
    linkedin: {
      label: 'linkedin.com/in/heitor-schleder',
      href: 'https://www.linkedin.com/in/heitor-schleder-10345a1ab/',
    },
    email: { label: 'heitorschleder33@gmail.com', href: 'mailto:heitorschleder33@gmail.com' },
    /**
     * The CV, served straight from `public/`. `download` is on the anchor so a
     * click saves the file instead of opening the browser's PDF viewer, and the
     * filename it saves under is this one, not the repo's internal name.
     *
     * The feed at /rss.xml still exists and still works for anyone subscribing
     * in a reader — it is only out of the nav, where a click returned raw XML
     * and read as a broken link.
     */
    cv: { label: 'Download CV (PDF)', href: '/heitor-schleder-cv.pdf' },
  },
} as const

export const GITHUB_LOGIN = 'heitorschleder'
