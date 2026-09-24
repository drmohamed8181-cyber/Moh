"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  // Set for slides built from a product (Admin → Products → Homepage).
  images?: string[];
  features?: string[];
}

// Shown only when no slides are set up in Admin → Homepage. Built from the
// store's own product lines and photos so nothing outside the catalogue can
// appear on the homepage.
const defaultSlides: Slide[] = [
  {
    id: "default-dental-chairs",
    title: "Dental Treatment Chairs",
    description: "Complete dental chair units for general and specialist practice, including delivery consoles and paediatric models.",
    image: "/devices/Dental-Chair-Unit-R3.webp",
    buttonText: "View Dental Chairs",
    buttonLink: "/categories/dental-chairs",
  },
  {
    id: "default-phaco",
    title: "Phaco & Vitrectomy Systems",
    description: "Cataract and retinal surgery platforms, new or certified refurbished, with documented service history and warranty coverage.",
    image: "/devices/Alcon-Centurion-full.png",
    buttonText: "View Systems",
    buttonLink: "/categories/phaco-vitrectomy",
  },
  {
    id: "default-excimer",
    title: "Excimer Lasers",
    description: "Refractive excimer lasers, new or certified refurbished, with documented service history and warranty coverage.",
    image: "/devices/Alcon-Wavelight-EX500-Official-HD.png",
    buttonText: "View Lasers",
    buttonLink: "/categories/excimer-lasers",
  },
  {
    id: "default-diagnostic",
    title: "OCT & Diagnostic Imaging",
    description: "Ophthalmic diagnostic and imaging equipment, new or certified refurbished, with documented service history and warranty coverage.",
    image: "/devices/Zeiss-Cirrus-OCT-5000-Official-HD.jpg",
    buttonText: "View Equipment",
    buttonLink: "/categories/diagnostic-equipment",
  },
];

interface HeroSliderProps {
  slides?: Slide[];
}

function eyebrowFor(title: string) {
  const known = ["Alcon", "Ellex", "Zeiss", "LightMed", "Bausch", "Lomb", "AMO", "Visx", "Topcon", "Nidek", "Haag-Streit"];
  const match = known.find((brand) => title.toLowerCase().includes(brand.toLowerCase()));
  return match || "Featured Instrument";
}

export default function HeroSlider({ slides = defaultSlides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  // Which of the current product's photos is shown; back to the first on every slide change.
  const [photo, setPhoto] = useState({ slide: 0, index: 0 });
  const [firstRender, setFirstRender] = useState(true);
  const touchStartX = useRef(0);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;
  const slide = activeSlides[current];
  const photos = slide.images && slide.images.length > 0 ? slide.images : [slide.image];
  const photoIndex = photo.slide === current && photo.index < photos.length ? photo.index : 0;
  const shownImage = photos[photoIndex];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag to drop image priority after first paint.
    setFirstRender(false);
  }, []);

  const goTo = useCallback(
    (index: number) => setCurrent((index + activeSlides.length) % activeSlides.length),
    [activeSlides.length]
  );
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Always advance. It used to pause on hover, but the hero fills the first
  // screen, so the cursor almost always rests on it and it never moved; on
  // phones a tap counts as a hover that never ends. Any manual change (arrow,
  // dot, swipe) changes `next`, which restarts the full interval.
  useEffect(() => {
    if (activeSlides.length < 2) return;
    const id = setInterval(next, 6500);
    return () => clearInterval(id);
  }, [next, activeSlides.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-[#0a0f14] min-h-[600px] sm:min-h-[660px] lg:min-h-[720px] flex items-center py-16 lg:py-0"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Fine hairline grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #C6A664 1px, transparent 1px), linear-gradient(to bottom, #C6A664 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />

      {/* Ambient gold glow */}
      <motion.div
        className="absolute top-1/2 -left-40 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gold-500/10 blur-[140px]"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0f14]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0f14] to-transparent" aria-hidden />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-12 items-center">
          {/* Left — editorial copy */}
          <div className="max-w-xl order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-gold-400 text-xs tracking-[0.25em] uppercase">
                {String(current + 1).padStart(2, "0")}
              </span>
              <span className="w-10 h-px bg-gold-500/40" />
              <span className="text-white/30 text-xs tracking-[0.25em] uppercase">
                {String(activeSlides.length).padStart(2, "0")}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* The whole copy block opens the device page on click or tap.
                    Out of the tab order: the button below is the keyboard route
                    to the same page, so keyboard users don't tab through it twice. */}
                <Link href={slide.buttonLink} tabIndex={-1} className="group/copy block">
                <p className="inline-flex items-center gap-2 text-gold-400 text-xs font-semibold tracking-[0.2em] uppercase mb-5">
                  <Sparkles size={13} />
                  {eyebrowFor(slide.title)}
                </p>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-white leading-[1.08] tracking-tight mb-6 text-balance transition-colors group-hover/copy:text-gold-300">
                  {slide.title}
                </h1>

                <p className={cn("text-white/55 text-base sm:text-lg leading-relaxed max-w-lg font-light", slide.features?.length ? "mb-6" : "mb-10")}>
                  {slide.description}
                </p>

                {slide.features && slide.features.length > 0 && (
                  <ul className="space-y-2 mb-10 max-w-lg">
                    {slide.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                        <Check size={15} className="text-gold-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                </Link>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-5">
              <Link
                href={slide.buttonLink}
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-[#0a0f14] font-semibold text-sm tracking-wide rounded-none transition-all duration-300"
              >
                {slide.buttonText}
                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/products"
                className="text-white/60 hover:text-white text-sm font-medium tracking-wide transition-colors border-b border-white/20 hover:border-gold-400 pb-1"
              >
                View Full Collection
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-14 pt-8 border-t border-white/10">
              {["Factory Certified", "Precision Engineered", "White-Glove Delivery"].map((item) => (
                <span key={item} className="text-[11px] font-medium text-white/35 uppercase tracking-[0.15em]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — framed product photograph */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Gold frame offset */}
              <div className="absolute -inset-3 border border-gold-500/25" aria-hidden />
              <div className="absolute -top-4 -left-4 w-16 h-16 border-t border-l border-gold-400/50" aria-hidden />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b border-r border-gold-400/50" aria-hidden />

              {/* The photo opens the device page too; its alt text names the link. */}
              <Link
                href={slide.buttonLink}
                tabIndex={-1}
                className="group/photo relative block w-full h-full bg-gradient-to-b from-[#fbfaf7] to-[#e9e7e1] overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${slide.id}-${photoIndex}`}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    // Same backdrop as the frame: the photo below blends into it,
                    // and a blend only sees what is inside this layer.
                    className="absolute inset-0 bg-gradient-to-b from-[#fbfaf7] to-[#e9e7e1]"
                  >
                    <Image
                      src={shownImage}
                      alt={slide.title}
                      fill
                      priority={firstRender}
                      sizes="(min-width: 1024px) 512px, 90vw"
                      className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover/photo:scale-[1.03]"
                    />
                  </motion.div>
                </AnimatePresence>
              </Link>

              {photos.length > 1 && (
                <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-2 z-10">
                  {photos.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setPhoto({ slide: current, index: i })}
                      aria-label={`Show photo ${i + 1}`}
                      aria-current={i === photoIndex}
                      className={cn(
                        "relative w-12 h-12 bg-white/[0.06] border transition-colors",
                        i === photoIndex ? "border-gold-400" : "border-white/10 hover:border-white/40"
                      )}
                    >
                      <Image src={img} alt="" fill sizes="48px" className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}

              <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-[#0a0f14]/80 backdrop-blur-md text-gold-300 text-[10px] font-semibold tracking-[0.15em] uppercase px-3 py-2 border border-gold-500/20">
                  In Inventory
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/10 hover:border-gold-400/50 text-white/50 hover:text-gold-300 items-center justify-center transition-all duration-300"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/10 hover:border-gold-400/50 text-white/50 hover:text-gold-300 items-center justify-center transition-all duration-300"
      >
        <ChevronRight size={18} />
      </button>

      {/* Progress rail */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {activeSlides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current}
            className={cn(
              "h-[3px] transition-all duration-500",
              i === current ? "w-9 bg-gold-400" : "w-4 bg-white/15 hover:bg-white/30"
            )}
          />
        ))}
      </div>
    </section>
  );
}
