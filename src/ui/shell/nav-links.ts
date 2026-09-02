import type { LucideIcon } from '@/ui/icons'
import { BrandGithub, BrandLinkedin, Download, Mail } from '@/ui/icons'
import { site } from '@/shared/site.config'

export type NavLink = {
  /** Also the accessible name in the nav, where there is no visible text. */
  key: string
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>
  href: string
  /** Spelled out in the footer; the nav shows the icon alone. */
  label: string
  /** Saves the file instead of navigating. True for the CV only. */
  download?: boolean
}

/**
 * One list, two renderings. The nav shows these as bare icons for someone who
 * knows what they are looking for; the footer spells the destination out for
 * someone who arrived from a post. They used to be two arrays with the same
 * contents, which is one edit away from disagreeing.
 */
export const NAV_LINKS: NavLink[] = [
  { key: 'GitHub', icon: BrandGithub, ...site.social.github },
  { key: 'LinkedIn', icon: BrandLinkedin, ...site.social.linkedin },
  { key: 'Email', icon: Mail, ...site.social.email },
  { key: 'Download CV (PDF)', icon: Download, download: true, ...site.social.cv },
]
