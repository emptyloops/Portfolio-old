import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null

/** Scroll to an in-page target through Lenis so nav links never hard-jump. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  // Offset clears the fixed island nav so the heading isn't hidden behind it.
  if (lenis) lenis.scrollTo(target, { offset: -76 })
  else target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Wrap each word in a span so headings can stagger per word. */
function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'done') {
    return Array.from(el.querySelectorAll<HTMLElement>('.word-inner'))
  }
  const source = el.textContent ?? ''
  el.textContent = ''
  const inners: HTMLElement[] = []
  for (const chunk of source.split(/(\s+)/)) {
    if (chunk === '') continue
    if (/^\s+$/.test(chunk)) {
      el.appendChild(document.createTextNode(chunk))
      continue
    }
    const outer = document.createElement('span')
    outer.className = 'word'
    const inner = document.createElement('span')
    inner.className = 'word-inner'
    inner.textContent = chunk
    outer.appendChild(inner)
    el.appendChild(outer)
    inners.push(inner)
  }
  el.dataset.split = 'done'
  return inners
}

/**
 * Clear any transform left over from a previous init before setting a new
 * start state. Without this, a re-init (React StrictMode mounts effects twice)
 * makes GSAP treat the previous percentage offset as the element's natural
 * position and bake it in as pixels, so the tween never returns to zero.
 */
function setFrom(targets: gsap.TweenTarget, vars: gsap.TweenVars) {
  gsap.set(targets, { clearProps: 'transform' })
  gsap.set(targets, { ...vars, willChange: 'transform, opacity' })
}

const settle = (targets: gsap.TweenTarget) => () =>
  gsap.set(targets, { clearProps: 'willChange,transform' })

/**
 * Boots smooth scrolling and every scroll-driven animation.
 * Returns a cleanup function — safe to call under React StrictMode double-invoke.
 */
export function initMotion(root: HTMLElement): () => void {
  const reduced = prefersReducedMotion()

  // ── Smooth scroll ─────────────────────────────────────────────────────
  // Skipped entirely for reduced-motion users: native scrolling stays intact.
  let tickerFn: ((time: number) => void) | null = null
  if (!reduced) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    tickerFn = (time: number) => lenis?.raf(time * 1000)
    // gsap.ticker is the single rAF loop for both Lenis and every tween.
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)
  }

  const ctx = gsap.context(() => {
    // ── Page load fade ──────────────────────────────────────────────────
    gsap.fromTo(
      root,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: reduced ? 0.2 : 0.6, ease: 'power1.out' }
    )

    if (reduced) {
      // Everything visible, nothing scroll-driven.
      gsap.set('[data-animate], [data-animate] > *, [data-split]', { clearProps: 'all' })
      return
    }

    // ── Split headings, stagger by word ─────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-split]').forEach(el => {
      const words = splitWords(el)
      if (!words.length) return
      setFrom(words, { yPercent: 110, y: 0, opacity: 0 })
      gsap.to(words, {
        yPercent: 0,
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.045,
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        onComplete: settle(words),
      })
    })

    // ── Text blocks: fade in and slide up ───────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-animate="fade-up"]').forEach(el => {
      setFrom(el, { y: 24, yPercent: 0, opacity: 0 })
      gsap.to(el, {
        y: 0,
        yPercent: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
        onComplete: settle(el),
      })
    })

    // ── Icons, pills, cards: stagger children as the group enters ───────
    gsap.utils.toArray<HTMLElement>('[data-animate="stagger"]').forEach(el => {
      const kids = gsap.utils.toArray<HTMLElement>(':scope > *', el)
      if (!kids.length) return
      setFrom(kids, { y: 12, yPercent: 0, opacity: 0 })
      gsap.to(kids, {
        y: 0,
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
        onComplete: settle(kids),
      })
    })

    ScrollTrigger.refresh()
  }, root)

  return () => {
    ctx.revert()
    if (tickerFn) gsap.ticker.remove(tickerFn)
    lenis?.destroy()
    lenis = null
  }
}
