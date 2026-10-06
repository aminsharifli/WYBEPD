import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { listSlides } from '../lib/sliderApi'

const fallbackSlide = { id: 'welcome', photo: '' }

export default function HomeScreen({ onNavigate }) {
  const [slides, setSlides] = useState([fallbackSlide])
  const [active, setActive] = useState(0)

  useEffect(() => {
    let live = true
    listSlides().then((data) => {
      if (!live) return
      const images = Array.isArray(data) ? data.filter((item) => item.photo) : []
      setSlides(images.length ? images : [fallbackSlide])
      setActive(0)
    }).catch(() => {})
    return () => { live = false }
  }, [])

  useEffect(() => {
    if (slides.length < 2) return undefined
    const timer = setInterval(() => setActive((index) => (index + 1) % slides.length), 6500)
    return () => clearInterval(timer)
  }, [slides.length])

  const change = (step) => setActive((index) => (index + step + slides.length) % slides.length)
  const photo = slides[active]?.photo

  return <main className="home-page">
    <section className="home-hero" style={photo ? { backgroundImage: `linear-gradient(90deg,color-mix(in srgb,var(--theme-page,#06101f) 94%,transparent) 0%,color-mix(in srgb,var(--theme-page,#06101f) 72%,transparent) 43%,color-mix(in srgb,var(--theme-page,#06101f) 16%,transparent) 100%),linear-gradient(0deg,color-mix(in srgb,var(--theme-page,#06101f) 76%,transparent),transparent 45%),url("${photo}")` } : undefined}>
      <div className="home-hero-glow" />
      <div className="hero-content" key={active}>
        <p className="hero-eyebrow">LOS SANTOS POLICE DEPARTMENT</p>
        <h1>WYBE - <span className="text-blue-500">LSPD</span></h1>
        <p className="hero-copy">Los Santos'un güvenliği için.<br />Her zaman hizmetinizdeyiz.</p>
        <button className="hero-action" onClick={() => onNavigate('schema')}>Hakkımızda<ArrowRight /></button>
      </div>
      {slides.length > 1 && <>
        <button className="hero-arrow hero-arrow-left" onClick={() => change(-1)} aria-label="Önceki slayt"><ArrowLeft /></button>
        <button className="hero-arrow hero-arrow-right" onClick={() => change(1)} aria-label="Sonraki slayt"><ArrowRight /></button>
        <div className="hero-dots" aria-label="Slayt seçimi">{slides.map((slide, index) => <button key={slide.id ?? index} onClick={() => setActive(index)} aria-label={`${index + 1}. slayt`} aria-current={active === index ? 'true' : undefined} className={active === index ? 'active' : ''} />)}</div>
      </>}
    </section>
  </main>
}
