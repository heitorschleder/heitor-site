import type { Metadata } from 'next'
import { TechnologyMatrix, EducationPanel } from '@/modules/profile'
import { PageHeader } from '@/ui/molecules/PageHeader'

export const metadata: Metadata = {
  title: 'About',
  description: 'Intern-turned-tech-lead with a Data Science degree. Full stack developer across React, Flutter, Java, cloud infrastructure, and AI.',
}

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About">
        <div className="flex max-w-[62ch] flex-col gap-4 text-[15.5px] leading-[1.7] text-[var(--color-mute)]">
          <p>
            I&apos;m a full stack developer based in Palhoça, SC, Brazil, and my days move between
            web, mobile and backend. I got into programming out of curiosity and a wish to solve the
            annoying parts of my own routine with code, and that is still why I&apos;m here: I like
            taking something that freezes, something that is slow, or something a person has to do by
            hand, and making the problem go away.
          </p>
          <p>
            Right now I work on a fleet management product, which means the person using what I write
            is usually out in the yard, phone in hand, with no patience for a screen that takes its
            time. That changed the way I think about code: I would rather ship the simple thing that
            works on a bad 4G connection than the elegant one that only works on my machine.
          </p>
          <p>
            I have also coordinated a team of 4 developers, and that was the part that taught me the
            most. I learned that a code review is a conversation and not a correction, and that
            writing things down saves more time than any shortcut.
          </p>
          <p>
            Away from the keyboard, I have been making time to read (right now it&apos;s{' '}
            <cite>The Hard Thing About Hard Things</cite>, by Ben Horowitz) and I game a lot, which
            keeps me close to what is happening in hardware and software, especially in AI. Not a
            coincidence that the work project I am proudest of is a computer vision one.
          </p>
        </div>
      </PageHeader>
      <TechnologyMatrix />
      <EducationPanel />
    </>
  )
}
