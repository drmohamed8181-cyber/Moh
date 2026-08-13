"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

const defaultSlides: Slide[] = [
  {
    id: "1",
    title: "Digital Blood Pressure Monitor",
    description: "Clinically validated accuracy. Easy-to-use arm cuff monitor for home and professional use with irregular heartbeat detection.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    buttonText: "Shop Now",
    buttonLink: "/products?category=patient-monitoring",
  },
  {
    id: "2",
    title: "Pulse Oximeter",
    description: "Fast, accurate SpO₂ and pulse rate measurement. Lightweight fingertip design ideal for clinical and home monitoring.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    buttonText: "View Product",
    buttonLink: "/products?category=diagnostic-equipment",
  },
  {
    id: "3",
    title: "Infrared Thermometer",
    description: "Non-contact forehead thermometer with instant 1-second reading. Perfect for adults, children and infants.",
    image: "https://images.unsplash.com/photo-1585435421671-0c16764628e3?w=800&q=80",
    buttonText: "Explore",
    buttonLink: "/products?category=diagnostic-equipment",
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
  const [paused, setPaused] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const touchStartX = useRef(0);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;
  const slide = activeSlides[current];

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

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6500);
    return () => clearInterval(id);
  }, [next, paused]);

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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
                <p className="inline-flex items-center gap-2 text-gold-400 text-xs font-semibold tracking-[0.2em] uppercase mb-5">
                  <Sparkles size={13} />
                  {eyebrowFor(slide.title)}
                </p>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-white leading-[1.08] tracking-tight mb-6 text-balance">
                  {slide.title}
                </h1>

                <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-10 max-w-lg font-light">
                  {slide.description}
                </p>
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
            <div className="relative w-full max-w-md aspect-[4/5]">
              {/* Gold frame offset */}
              <div className="absolute -inset-3 border border-gold-500/25" aria-hidden />
              <div className="absolute -top-4 -left-4 w-16 h-16 border-t border-l border-gold-400/50" aria-hidden />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b border-r border-gold-400/50" aria-hidden />

              <div className="relative w-full h-full bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={firstRender}
                      sizes="(min-width: 1024px) 420px, 90vw"
                      className="object-contain p-8 drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
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
