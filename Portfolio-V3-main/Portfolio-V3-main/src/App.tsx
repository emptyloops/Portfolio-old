import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ICONS, ICON_SIZE, ICON_STROKE, type IconKey } from './icons'
import { initMotion, prefersReducedMotion, scrollToSection } from './lib/motion'
import {
  contact,
  education,
  footer,
  hero,
  interests,
  profile,
  projects,
  skills,
  socials,
} from './data/content'

// ─── ICON ──────────────────────────────────────────────────────────────────

function Icon({ name, size = ICON_SIZE, className }: { name: string; size?: number; className?: string }) {
  const Cmp = ICONS[name as IconKey]
  if (!Cmp) return null
  return <Cmp size={size} strokeWidth={ICON_STROKE} className={className} aria-hidden="true" />
}

// ─── ROTATING WORD ─────────────────────────────────────────────────────────

function RotatingWord({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0)
  const [key, setKey] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = setInterval(() => {
      setIdx(i => (i + 1) % words.length)
      setKey(k => k + 1)
    }, 2200)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span key={key} className="rotating-word">
      {words[idx]}
    </span>
  )
}

// ─── ASCII BACKGROUND ──────────────────────────────────────────────────────

const ASCII_CHARS = '     .....::::----====+++***###@@@'
const BUCKETS = ASCII_CHARS.length

// Alpha is a pure function of the character bucket, so it can be precomputed
// once instead of building an rgba() string for every cell on every frame.
const BUCKET_STYLES = Array.from(
  { length: BUCKETS },
  (_, i) => `rgba(240,240,240,${(0.05 + (i / (BUCKETS - 1)) * 0.42).toFixed(3)})`
)

const TARGET_FPS = 30
const FRAME_MS = 1000 / TARGET_FPS

let mouseOverAscii = false

function AsciiBackground({ fade }: { fade?: 'bottom' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })!
    const CW = 8
    const CH = 13
    const RADIUS = 150
    const reduced = prefersReducedMotion()

    let raf = 0
    let t = 0
    let lastFrame = 0
    let onScreen = true
    let running = false

    // Reused across frames so the render loop allocates nothing.
    let bucketX: Int16Array[] = []
    let bucketY: Int16Array[] = []
    const bucketN = new Int32Array(BUCKETS)
    let capacity = 0

    const allocate = (cells: number) => {
      if (cells <= capacity) return
      capacity = cells
      bucketX = Array.from({ length: BUCKETS }, () => new Int16Array(cells))
      bucketY = Array.from({ length: BUCKETS }, () => new Int16Array(cells))
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const cols = Math.ceil(canvas.width / CW) + 1
      const rows = Math.ceil(canvas.height / CH) + 1
      allocate(cols * rows)
      ctx.font = `${CH}px "JetBrains Mono", monospace`
      ctx.textBaseline = 'top'
      draw()
    }

    const draw = () => {
      const cols = Math.ceil(canvas.width / CW) + 1
      const rows = Math.ceil(canvas.height / CH) + 1
      const { x: mx, y: my } = mouseRef.current

      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      bucketN.fill(0)

      for (let r = 0; r < rows; r++) {
        const cy = r * CH
        for (let c = 0; c < cols; c++) {
          const cx = c * CW
          const n =
            Math.sin(c * 0.16 + t * 0.85) * Math.cos(r * 0.12 + t * 0.65) +
            Math.sin((c + r) * 0.07 + t * 1.1) * 0.7 +
            Math.cos(c * 0.05 - r * 0.09 + t * 0.9) * 0.3
          let norm = n < -2 ? 0 : n > 2 ? 1 : (n + 2) / 4

          const dx = cx - mx
          const dy = cy - my
          const distSq = dx * dx + dy * dy
          if (distSq < RADIUS * RADIUS) {
            const dist = Math.sqrt(distSq)
            const p = 1 - dist / RADIUS
            const smooth = p * p * (3 - 2 * p)
            norm += Math.sin(dist * 0.07 - t * 6) * smooth * 0.3
            norm = norm < 0 ? 0 : norm > 1 ? 1 : norm
          }

          const ci = (norm * (BUCKETS - 1)) | 0
          if (ASCII_CHARS[ci] === ' ') continue
          const k = bucketN[ci]++
          bucketX[ci][k] = cx
          bucketY[ci][k] = cy
        }
      }

      // One fillStyle change per bucket instead of one per cell.
      for (let b = 0; b < BUCKETS; b++) {
        const count = bucketN[b]
        if (!count) continue
        ctx.fillStyle = BUCKET_STYLES[b]
        const ch = ASCII_CHARS[b]
        const xs = bucketX[b]
        const ys = bucketY[b]
        for (let i = 0; i < count; i++) ctx.fillText(ch, xs[i], ys[i])
      }
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (now - lastFrame < FRAME_MS) return
      lastFrame = now
      t += 0.028 * (60 / TARGET_FPS)
      draw()
    }

    const start = () => {
      if (running || reduced) return
      running = true
      lastFrame = 0
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const sync = () => {
      if (onScreen && !document.hidden) start()
      else stop()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Stop burning frames the moment the hero leaves the viewport.
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting
        sync()
      },
      { threshold: 0 }
    )
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onEnter = () => { mouseOverAscii = true }
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
      mouseOverAscii = false
    }
    canvas.addEventListener('mousemove', onMove, { passive: true })
    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)

    sync()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="ascii-canvas" aria-hidden="true" />
      {fade === 'bottom' && <div className="ascii-fade" aria-hidden="true" />}
    </>
  )
}

// ─── CUSTOM CURSOR ─────────────────────────────────────────────────────────

function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(hover: none)').matches) return

    let x = 0
    let y = 0
    let queued = false

    // Writes are batched into a rAF and use transform only, so moving the
    // cursor composites instead of triggering layout.
    const flush = () => {
      queued = false
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      el.style.mixBlendMode = mouseOverAscii ? 'normal' : 'difference'
      el.style.background = mouseOverAscii ? 'rgba(255,255,255,0.92)' : '#ffffff'
    }

    const move = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      el.style.opacity = '1'
      if (!queued) {
        queued = true
        requestAnimationFrame(flush)
      }
    }
    const leave = () => { el.style.opacity = '0' }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
    }
  }, [])

  return <div ref={ref} className="custom-cursor" aria-hidden="true" />
}

// ─── HELPERS ───────────────────────────────────────────────────────────────

function SectionHeader({ text, icon }: { text: string; icon: string }) {
  return (
    <h3 className="section-header">
      <span className="section-header-icon">
        <Icon name={icon} size={18} />
      </span>
      <span data-split>{text}</span>
    </h3>
  )
}

function Divider() {
  return <div className="divider" />
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="pill-row" data-animate="stagger">
      {items.map(i => (
        <span className="pill" key={i}>{i}</span>
      ))}
    </div>
  )
}

function GroupHeading({ text, icon, small }: { text: string; icon: string; small?: boolean }) {
  return (
    <p className={small ? 'group-heading group-heading-sm' : 'group-heading'}>
      <Icon name={icon} size={small ? 12 : 14} />
      {text}
    </p>
  )
}

// ─── NAV ───────────────────────────────────────────────────────────────────

function IslandNav() {
  return (
    <nav className="island-nav">
      <button className="island-btn" onClick={() => scrollToSection('about')}>About</button>
      <div className="island-dot" aria-hidden="true" />
      <button className="island-btn" onClick={() => scrollToSection('works')}>Works</button>
      <div className="island-dot" aria-hidden="true" />
      <button className="island-btn" onClick={() => scrollToSection('contact')}>Contact</button>
    </nav>
  )
}

// ─── APP ───────────────────────────────────────────────────────────────────

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`
const photoW = profile.photo.width

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!rootRef.current) return
    return initMotion(rootRef.current)
  }, [])

  return (
    <>
      <CustomCursor />
      <IslandNav />

      <div className="page" ref={rootRef}>

        {/* ══ HERO ═══════════════════════════════════════════════════════ */}
        <section className="hero">
          <AsciiBackground fade="bottom" />
          <div className="hero-vignette" aria-hidden="true" />

          <div className="hero-copy">
            <h1 className="hero-name">{profile.name.toUpperCase()}</h1>

            <p className="hero-role">
              <span className="hero-rule" aria-hidden="true" />
              {profile.title.toUpperCase()}
              <span className="hero-rule" aria-hidden="true" />
            </p>

            <div className="hero-catchphrase">
              <span className="hero-catchphrase-prefix">{hero.prefix}</span>
              <span className="hero-catchphrase-slot">
                <RotatingWord words={hero.words} />
              </span>
            </div>
          </div>

          <div className="scroll-indicator" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M2.5 8.5L7 13l4.5-4.5" stroke="#f0f0f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </section>

        {/* ══ SPLIT: About + Works ═══════════════════════════════════════ */}
        <div className="split">

          {/* ── LEFT: About ───────────────────────────────────────────── */}
          <div id="about" className="left-panel">
            <div className="profile-row" data-animate="fade-up">
              <picture>
                <source
                  type="image/avif"
                  srcSet={`${asset('images/profile-96.avif')} 1x, ${asset('images/profile-192.avif')} 2x, ${asset('images/profile-288.avif')} 3x`}
                />
                <source
                  type="image/webp"
                  srcSet={`${asset('images/profile-96.webp')} 1x, ${asset('images/profile-192.webp')} 2x, ${asset('images/profile-288.webp')} 3x`}
                />
                <img
                  className="profile-photo"
                  src={asset('images/profile-192.jpg')}
                  alt={profile.photo.alt}
                  width={photoW}
                  height={photoW}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <div>
                <p className="profile-name">{profile.name}</p>
                <p className="profile-title">{profile.title}</p>
                <p className="profile-location">
                  <Icon name="location" size={13} />
                  {profile.location}
                </p>
              </div>
            </div>

            <p className="about-text" data-animate="fade-up">{profile.about}</p>

            <div className="about-actions" data-animate="fade-up">
              <span className="availability">
                <span className="availability-dot" aria-hidden="true" />
                {profile.availability}
              </span>
              <a className="btn-cta" href={`mailto:${profile.email}`}>
                <Icon name="mail" size={14} />
                Get in touch
              </a>
            </div>

            {/* 1. Education */}
            <Divider />
            <SectionHeader text="Education." icon="education" />
            <div data-animate="stagger">
              {education.map((e, i) => (
                <div className="edu-row" key={e.degree + e.school} style={{ borderTop: i === 0 ? '1px solid rgba(240,240,240,0.07)' : undefined }}>
                  <span className="edu-icon"><Icon name={e.icon} size={15} /></span>
                  <div className="edu-body">
                    <div className="edu-line">
                      <p className="edu-degree">{e.degree}</p>
                      <span className="edu-dates">{e.dates}</span>
                    </div>
                    <p className="edu-school">{e.school}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Skills */}
            <Divider />
            <SectionHeader text="Skills." icon="skills" />
            {skills.map((g, gi) => (
              <div className="skill-group" key={g.title} style={{ borderTop: gi === 0 ? 'none' : undefined }}>
                <GroupHeading text={g.title.toUpperCase()} icon={g.icon} />
                {g.items && <Pills items={g.items} />}
                {g.subgroups?.map(sub => (
                  <div className="skill-subgroup" key={sub.title}>
                    <GroupHeading text={sub.title.toUpperCase()} icon={sub.icon} small />
                    <Pills items={sub.items} />
                  </div>
                ))}
              </div>
            ))}

            {/* 3. Interests */}
            <Divider />
            <SectionHeader text="Interests." icon="interests" />
            <div data-animate="stagger">
              {interests.map((it, i) => (
                <div className="edu-row" key={it.label + i} style={{ borderTop: i === 0 ? '1px solid rgba(240,240,240,0.07)' : undefined }}>
                  <span className="edu-icon"><Icon name={it.icon} size={15} /></span>
                  <div className="edu-body">
                    <p className="edu-degree">{it.label}</p>
                    <p className="edu-school">{it.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Divider />
            <div className="social-row" data-animate="stagger">
              {socials.map(s => (
                <a
                  key={s.label}
                  className="social-link"
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <Icon name={s.icon} size={14} />
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Works ──────────────────────────────────────────── */}
          <div id="works" className="works-panel">
            <h2 className="works-heading">
              <span className="section-header-icon"><Icon name="works" size={18} /></span>
              <span data-split>Selected work.</span>
            </h2>
            <div className="works-bento" data-animate="stagger">
              {projects.map(p => (
                <div key={p.id} className={`work-card ${p.areaClass}`}>
                  {p.image ? (
                    <img
                      className="work-image"
                      src={asset(p.image)}
                      alt={p.title}
                      width={640}
                      height={420}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="work-placeholder">
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                        <rect x="2" y="7" width="32" height="22" rx="3" stroke="#f0f0f0" strokeWidth="1.5" opacity="0.2"/>
                        <circle cx="11" cy="15" r="3" stroke="#f0f0f0" strokeWidth="1.5" opacity="0.2"/>
                        <path d="M2 25l9-8 6 6 4-4 8 7" stroke="#f0f0f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>
                      </svg>
                      <span className="work-placeholder-label">IMAGE PLACEHOLDER</span>
                    </div>
                  )}
                  <div className="work-hover-overlay">
                    <p className="work-title">{p.title}</p>
                    <p className="work-desc">{p.desc}</p>
                    <span className="work-category">{p.category.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ══ CONTACT ════════════════════════════════════════════════════ */}
        <section id="contact" className="contact-section">
          <div className="contact-inner">
            <p className="contact-eyebrow">
              <Icon name="contact" size={13} />
              {contact.eyebrow}
            </p>

            <h2 className="contact-heading" data-split>{contact.heading}</h2>

            <p className="contact-email-wrap" data-animate="fade-up">
              <a className="contact-email-link" href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
            <p className="contact-sub" data-animate="fade-up">
              {profile.name} / {profile.title} — {profile.location}
            </p>

            <div data-animate="fade-up">
              <a className="btn-pill-outline" href={contact.cta.href} target="_blank" rel="noopener noreferrer">
                <Icon name="linkedin" size={15} />
                {contact.cta.label}
                <Icon name="arrow" size={15} />
              </a>
            </div>
          </div>

          <div className="footer-bar">
            <span className="footer-copy">{footer.copyright}</span>
            <div className="footer-links">
              {socials.map(s => (
                <a
                  key={s.label}
                  className="footer-link"
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <Icon name={s.icon} size={13} />
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
