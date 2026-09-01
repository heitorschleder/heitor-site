import { site } from '@/shared/site.config'
import { BrandGithub, BrandLinkedin, Mail, MapPin } from '@/ui/icons'

const LINKS = [
  { key: 'GitHub', icon: BrandGithub, ...site.social.github },
  { key: 'LinkedIn', icon: BrandLinkedin, ...site.social.linkedin },
  { key: 'Email', icon: Mail, ...site.social.email },
]

/**
 * The nav carries the same links as bare icons, which serves a visitor who
 * already knows what they are looking for. Here the destination is spelled out,
 * which serves the one who arrived from a post.
 */
export function SiteFooter() {
  return (
    <footer className="mt-4 border-t border-[var(--color-rule)] bg-[var(--color-panel)] px-3 py-5 @min-[560px]/shell:px-4">
      <ul className="flex flex-col gap-3 @min-[560px]/shell:flex-row @min-[560px]/shell:flex-wrap @min-[560px]/shell:gap-x-6">
        {LINKS.map(({ key, icon: Icon, href, label }) => (
          <li key={key}>
            <a
              href={href}
              className="flex min-h-11 items-center gap-[10px] text-[14px] text-[var(--color-mute)] transition-colors hover:text-[var(--color-acc)] @min-[560px]/shell:min-h-0"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-[6px] font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--color-mute)]">
        <MapPin className="size-3 text-[var(--color-acc)]" aria-hidden="true" />
        {site.location}
      </p>
    </footer>
  )
}
