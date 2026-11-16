/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from './lib/supabase';

gsap.registerPlugin(ScrollTrigger);

type PageType = 'home' | 'portfolio' | 'about' | 'contact';

const ASSETS = {
  logo: '/assets/aistudio/logo_28f0ceaa.png',
  heroBg: '/assets/aistudio/image_983053aa.png',
  person: '/assets/aistudio/person_2ceb573c.png',
  projectsBg: '/assets/aistudio/projects-bg_a71f4c33.jpg',
  portfolioBg: '/assets/aistudio/portfolio-bg_281495dd.png',
};

interface PortfolioReel {
  seq: string;
  title: string;
  category: string;
  description: string;
  videoUrl: string;
  previewAt: number;
  width: number;
  height: number;
}

const PORTFOLIO_REELS: PortfolioReel[] = [
  {
    seq: '01',
    title: 'ForgeLine',
    category: '3D Industrial Web',
    description:
      'Custom conveyor & robotic claw hero experience engineered to move industrial logistics brands forward.',
    videoUrl: '/assets/aistudio/Screen_Recording_2026-10-01_164214_afa3eabd.mp4',
    previewAt: 3.5,
    width: 1698,
    height: 940,
  },
  {
    seq: '02',
    title: 'MARKER',
    category: 'Interactive Storefront',
    description:
      'Editorial e-commerce showcase featuring dynamic nib color switching and smooth typographic staging.',
    videoUrl: '/assets/aistudio/Screen_Recording_2026-10-10_225907_47aedb72.mp4',
    previewAt: 3.2,
    width: 1644,
    height: 946,
  },
  {
    seq: '03',
    title: 'RAW HOUND',
    category: 'Illustrated Brand Web',
    description:
      'Playful hand-illustrated dog nutrition landing page with multi-section scroll choreography & pricing tiers.',
    videoUrl: '/assets/aistudio/Screen_Recording_2026-10-28_213102_1fd04f60.mp4',
    previewAt: 3.0,
    width: 1394,
    height: 900,
  },
  {
    seq: '04',
    title: 'ECLIPSE MOTORS',
    category: 'Automotive 3D Showcase',
    description:
      'Electric hypercar reveal built with cinematic depth, continuous dual scroll paths & full-bleed motion.',
    videoUrl: '/assets/aistudio/Screen_Recording_2026-11-13_203848_e731104f.mp4',
    previewAt: 0.5,
    width: 1492,
    height: 918,
  },
  {
    seq: '05',
    title: 'Cofia Roastery',
    category: 'Coffee Brand Experience',
    description:
      'Artisanal roastery website featuring character animation, interactive flavor cards & scroll roast timeline.',
    videoUrl: '/assets/aistudio/Screen_Recording_2026-11-05_155833_6c0bb493.mp4',
    previewAt: 1.0,
    width: 1402,
    height: 878,
  },
  {
    seq: '06',
    title: 'Tara®',
    category: '3D WebGL Construction',
    description:
      'Industrial architecture showcase anchored by an interactive 3D safety helmet & minimalist dark grid.',
    videoUrl: '/assets/aistudio/Screen_Recording_2026-10-03_163332_b61a4f7d.mp4',
    previewAt: 4.5,
    width: 1198,
    height: 950,
  },
  {
    seq: '07',
    title: 'VOX Agency',
    category: 'Interactive Flagship Web',
    description:
      'High-impact agency platform with 3D monument reveal, turning case-study book & interactive physics spheres.',
    videoUrl: '/assets/aistudio/Screen_Recording_2026-11-04_152331_225c4010.mp4',
    previewAt: 1.2,
    width: 1408,
    height: 948,
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [playingReelIndex, setPlayingReelIndex] = useState<number | null>(null);
  const reelVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const personImgRef = useRef<HTMLImageElement | null>(null);
  const hasAnimatedNavbarRef = useRef(false);
  const howWorkSectionRef = useRef<HTMLElement | null>(null);
  const howWorkTrimPathRef = useRef<SVGPathElement | null>(null);
  const [howWorkStage, setHowWorkStage] = useState(0);
  const [howWorkViewport, setHowWorkViewport] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth <= 600) return 'mobile';
    if (window.innerWidth <= 1024) return 'tablet';
    return 'desktop';
  });
  const footerRef = useRef<HTMLElement | null>(null);
  const [footerScrollY, setFooterScrollY] = useState(0);
  const [footerMouse, setFooterMouse] = useState({ x: 0, y: 0 });
  const [inboxEmail, setInboxEmail] = useState('');
  const [inboxSubmitted, setInboxSubmitted] = useState(false);

  // Interactive Contact Page Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    service: 'Website Designing & Development',
    message: '',
  });
  const [contactError, setContactError] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmittedData, setContactSubmittedData] = useState<{
    name: string;
    email: string;
    whatsapp: string;
    service: string;
    message: string;
  } | null>(null);

  // Sync body class and overflow with page & drawer state
  useEffect(() => {
    document.body.classList.remove('about-page-body', 'contact-page-body', 'portfolio-page-body');
    if (currentPage === 'portfolio') {
      document.body.classList.add('portfolio-page-body');
      document.title = 'Portfolio - Muzammil Khan';
    } else if (currentPage === 'about') {
      document.body.classList.add('about-page-body');
      document.title = 'About Muzammil - UI/UX Designer & Full-Stack Developer';
    } else if (currentPage === 'contact') {
      document.body.classList.add('contact-page-body');
      document.title = 'Contact Muzammil - Pro UI/UX Designer & Full-Stack Developer';
    } else {
      document.title = 'Muzammil - UI/UX & Web Designer';
    }
  }, [currentPage]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Ensure strictly one portfolio video plays at a time inline
  const handlePlaySingleReel = (index: number) => {
    const targetVideo = reelVideoRefs.current[index];
    if (!targetVideo) return;

    reelVideoRefs.current.forEach((vid, i) => {
      if (i !== index && vid && !vid.paused) {
        vid.pause();
      }
    });

    if (targetVideo.paused) {
      if (targetVideo.dataset.started !== 'true') {
        targetVideo.currentTime = 0;
        targetVideo.dataset.started = 'true';
      }
      targetVideo.play().catch(() => {});
      setPlayingReelIndex(index);
    } else {
      targetVideo.pause();
      setPlayingReelIndex(null);
    }
  };

  // Navigation handler supporting Home (#hero / #portfolio), About, and Contact
  const navigateTo = (page: PageType, sectionId?: string) => {
    setDrawerOpen(false);
    setPlayingReelIndex(null);
    reelVideoRefs.current.forEach((vid) => {
      if (vid && !vid.paused) vid.pause();
    });
    if (currentPage !== page) {
      // Reset scroll immediately so GSAP ScrollTrigger offsets compute cleanly from y = 0
      window.scrollTo(0, 0);
      setCurrentPage(page);
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 80);
      }
    } else {
      if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll-driven sequenced Trim Path animation for "HOW I WORK" (desktop + tablet + mobile)
  useEffect(() => {
    const syncViewportMode = () => {
      const w = window.innerWidth;
      const mode: 'mobile' | 'tablet' | 'desktop' =
        w <= 600 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop';
      setHowWorkViewport((prev) => (prev !== mode ? mode : prev));
    };

    syncViewportMode();
    window.addEventListener('resize', syncViewportMode);
    return () => window.removeEventListener('resize', syncViewportMode);
  }, []);

  useEffect(() => {
    if (currentPage !== 'home') return;

    const section = howWorkSectionRef.current;
    const trimPath = howWorkTrimPathRef.current;
    if (!section || !trimPath) return;

    let lastStage = -1;

    const applyTrimProgress = (rawProgress: number) => {
      const progress = Math.max(0, Math.min(1, rawProgress));
      const totalLength = trimPath.getTotalLength();

      if (totalLength > 0) {
        if (progress <= 0.002) {
          trimPath.style.opacity = '0';
          trimPath.style.strokeDasharray = `${totalLength + 4} ${totalLength + 60}`;
          trimPath.style.strokeDashoffset = `${totalLength + 4}`;
        } else if (progress >= 0.992) {
          trimPath.style.opacity = '1';
          trimPath.style.strokeDasharray = 'none';
          trimPath.style.strokeDashoffset = '0';
        } else {
          const dashLen = totalLength + 4;
          trimPath.style.opacity = '1';
          trimPath.style.strokeDasharray = `${dashLen} ${dashLen + 60}`;
          trimPath.style.strokeDashoffset = `${dashLen * (1 - progress)}`;
        }
      }

      const stage =
        progress >= 0.86
          ? 4
          : progress >= 0.64
            ? 3
            : progress >= 0.38
              ? 2
              : progress >= 0.14
                ? 1
                : 0;

      if (stage !== lastStage) {
        lastStage = stage;
        setHowWorkStage(stage);
      }
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 76%',
      end: 'bottom 94%',
      invalidateOnRefresh: true,
      onUpdate: (self) => applyTrimProgress(self.progress),
      onRefresh: (self) => applyTrimProgress(self.progress),
    });

    applyTrimProgress(st.progress);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            ScrollTrigger.refresh();
          })
        : null;
    resizeObserver?.observe(section);

    return () => {
      resizeObserver?.disconnect();
      st.kill();
    };
  }, [currentPage, howWorkViewport]);

  // Footer scroll parallax tracker across all pages
  useEffect(() => {
    let rafId = 0;
    const handleFooterScroll = () => {
      const footerEl = footerRef.current;
      if (!footerEl) return;
      const rect = footerEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const rawOffset = (vh - rect.top) / Math.max(1, vh + rect.height);
      const clamped = Math.max(0, Math.min(1, rawOffset));
      setFooterScrollY(clamped);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleFooterScroll);
    };

    handleFooterScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [currentPage]);

  // Interactive Matrix Silhouette Animation on Home Page
  useEffect(() => {
    if (currentPage !== 'home') return;
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const personImg = personImgRef.current;
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let animationFrameId = 0;
    let isHeroVisible = true;
    let isTabVisible = typeof document !== 'undefined' ? !document.hidden : true;

    const CHARS = 'MUZAMMILPROUIXWEB0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const CODE_CHARS = '0123456789ABCDEF!<>-_\\/[]{}—=+*^?#_'.split('');

    function getRandomChar() {
      return Math.random() > 0.4
        ? CHARS[Math.floor(Math.random() * CHARS.length)]
        : CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      isHovered: false,
      radius: 140,
    };

    interface Particle {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      char: string;
      baseAlpha: number;
      alpha: number;
      mutateTimer: number;
      size: number;
      isPerson: boolean;
    }

    interface RainCol {
      x: number;
      y: number;
      speed: number;
      length: number;
      chars: string[];
      stepTimer: number;
      opacity: number;
    }

    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      char: string;
      alpha: number;
      decay: number;
      size: number;
    }

    let particles: Particle[] = [];
    let rainColumns: RainCol[] = [];
    const mouseSparks: Spark[] = [];

    function spawnMouseSparks(x: number, y: number, count = 2) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 2.2;
        mouseSparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          char: getRandomChar(),
          alpha: 1.0,
          decay: 0.02 + Math.random() * 0.03,
          size: 11 + Math.random() * 3,
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
      spawnMouseSparks(mouse.targetX, mouse.targetY, 2);
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    hero.addEventListener('mousemove', handleMouseMove, { passive: true });
    hero.addEventListener('mouseleave', handleMouseLeave);

    function createSilhouetteParticles() {
      const pLeft = width * 0.2;
      const pRight = width * 0.64;
      const pTop = height * 0.32;
      const pBottom = height * 0.88;

      const spacing = Math.max(16, Math.floor(width / 72));

      for (let y = pTop; y < pBottom; y += spacing) {
        for (let x = pLeft; x < pRight; x += spacing) {
          const nx = (x - pLeft) / (pRight - pLeft);
          const ny = (y - pTop) / (pBottom - pTop);

          const headCenter = 0.44;
          const widthAtY = 0.15 + 0.82 * Math.pow(ny, 1.2);
          const inSilhouette = Math.abs(nx - headCenter) < widthAtY * 0.5;

          if (inSilhouette && Math.random() < 0.65) {
            particles.push({
              baseX: x + (Math.random() - 0.5) * 4,
              baseY: y + (Math.random() - 0.5) * 4,
              x,
              y,
              vx: 0,
              vy: 0,
              char: getRandomChar(),
              baseAlpha: 0.25 + Math.random() * 0.55,
              alpha: 0.4,
              mutateTimer: Math.floor(Math.random() * 40),
              size: Math.floor(10 + Math.random() * 4),
              isPerson: true,
            });
          }
        }
      }

      const ambientCount = Math.min(90, Math.floor(width * 0.065));
      for (let i = 0; i < ambientCount; i++) {
        const ax = Math.random() * width;
        const ay = height * 0.15 + Math.random() * (height * 0.75);
        particles.push({
          baseX: ax,
          baseY: ay,
          x: ax,
          y: ay,
          vx: 0,
          vy: 0,
          char: getRandomChar(),
          baseAlpha: 0.08 + Math.random() * 0.25,
          alpha: 0.2,
          mutateTimer: Math.floor(Math.random() * 60),
          size: Math.floor(9 + Math.random() * 4),
          isPerson: false,
        });
      }
    }

    function rebuildParticleGrid() {
      particles = [];
      rainColumns = [];

      const streamCount = Math.floor(width / 36);
      for (let i = 0; i < streamCount; i++) {
        rainColumns.push({
          x: (i + Math.random() * 0.5) * 36,
          y: Math.random() * height,
          speed: 1.15 + Math.random() * 2.0,
          length: Math.floor(6 + Math.random() * 12),
          chars: [],
          stepTimer: 0,
          opacity: 0.15 + Math.random() * 0.55,
        });
      }

      createSilhouetteParticles();
    }

    function resize() {
      if (!hero || !canvas || !ctx) return;
      width = hero.clientWidth;
      height = hero.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      rebuildParticleGrid();
    }

    function animate() {
      if (!isHeroVisible || !isTabVisible) {
        animationFrameId = 0;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);
      if (!ctx) return;

      mouse.x += (mouse.targetX - mouse.x) * 0.2;
      mouse.y += (mouse.targetY - mouse.y) * 0.2;

      ctx.clearRect(0, 0, width, height);
      ctx.font = "600 12px 'Consolas', 'Montserrat', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 1. Draw and update Matrix Rain columns (zero-blur fast path for 60fps across mobile & desktop)
      for (const col of rainColumns) {
        col.y += col.speed;
        if (col.y > height + col.length * 18) {
          col.y = -col.length * 18;
          col.x = Math.random() * width;
          col.speed = 1.15 + Math.random() * 2.0;
        }

        col.stepTimer++;
        if (col.stepTimer % 6 === 0) {
          if (col.chars.length < col.length) {
            col.chars.push(getRandomChar());
          } else {
            col.chars.shift();
            col.chars.push(getRandomChar());
          }
        }

        for (let j = 0; j < col.chars.length; j++) {
          const charY = col.y - j * 16;
          if (charY < -20 || charY > height + 20) continue;

          const isHead = j === col.chars.length - 1;
          const trailAlpha = isHead ? 0.95 : (j / col.length) * col.opacity;

          const dx = mouse.x - col.x;
          const dy = mouse.y - charY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let boost = 0;
          if (dist < mouse.radius) {
            boost = (1 - dist / mouse.radius) * 0.6;
          }

          const finalAlpha = Math.min(1.0, trailAlpha + boost);
          ctx.fillStyle = isHead
            ? `rgba(255, 255, 255, ${finalAlpha})`
            : `rgba(215, 242, 255, ${finalAlpha})`;

          ctx.fillText(col.chars[j], col.x, charY);
        }
      }

      // 2. Draw and update Silhouette particles
      for (const p of particles) {
        p.mutateTimer++;
        if (p.mutateTimer > 45) {
          p.char = getRandomChar();
          p.mutateTimer = Math.floor(Math.random() * 15);
        }

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && mouse.isHovered) {
          const force = 1 - dist / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 1.8;
          p.vy += Math.sin(angle) * force * 1.8;
          p.alpha = Math.min(1.0, p.baseAlpha + force * 0.7);
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        p.vx += (p.baseX - p.x) * 0.08;
        p.vy += (p.baseY - p.y) * 0.08;
        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle =
          p.alpha > 0.6
            ? `rgba(255, 255, 255, ${p.alpha})`
            : `rgba(220, 240, 255, ${p.alpha})`;

        ctx.fillText(p.char, p.x, p.y);
      }

      // 3. Draw and update mouse sparks
      for (let i = mouseSparks.length - 1; i >= 0; i--) {
        const s = mouseSparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy -= 0.02;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          mouseSparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fillText(s.char, s.x, s.y);
      }
    }

    const startCanvasLoop = () => {
      if (!animationFrameId && isHeroVisible && isTabVisible) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const heroObserver = new IntersectionObserver(
      (entries) => {
        isHeroVisible = entries[0]?.isIntersecting ?? true;
        if (isHeroVisible) startCanvasLoop();
      },
      { threshold: 0.02 }
    );
    heroObserver.observe(hero);

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) startCanvasLoop();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    window.addEventListener('resize', resize);
    if (personImg && !personImg.complete) {
      personImg.addEventListener('load', resize);
    }
    resize();
    startCanvasLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      heroObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', resize);
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
      if (personImg) {
        personImg.removeEventListener('load', resize);
      }
    };
  }, [currentPage]);

  // Lazy-upgrade Portfolio video preloading (index 2+) ahead of scroll for faster mobile/desktop load
  useEffect(() => {
    if (currentPage !== 'portfolio') return;

    const videos = reelVideoRefs.current.filter((v): v is HTMLVideoElement => Boolean(v));
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = entry.target as HTMLVideoElement;
            if (video.preload === 'none') {
              video.preload = 'metadata';
            }
            observer.unobserve(video);
          }
        });
      },
      { rootMargin: '500px 0px' }
    );

    videos.forEach((video, idx) => {
      if (idx >= 2) {
        observer.observe(video);
      }
    });

    return () => observer.disconnect();
  }, [currentPage]);

  // Purposeful Award-Winning GSAP Motion Choreography Across All Pages
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const animateSvgRibbonDraw = (
        selector: string,
        duration = 1.85,
        scrollTriggerEl?: string
      ) => {
        const paths = gsap.utils.toArray<SVGGeometryElement>(selector);
        if (!paths.length) return;

        paths.forEach((el) => {
          if (typeof el.getTotalLength === 'function') {
            const length = el.getTotalLength();
            gsap.set(el, {
              strokeDasharray: `${length + 2} ${length + 40}`,
              strokeDashoffset: length + 2,
            });
          }
        });

        gsap.to(paths, {
          strokeDashoffset: 0,
          duration,
          stagger: 0.18,
          ease: 'power2.inOut',
          clearProps: 'strokeDasharray,strokeDashoffset',
          scrollTrigger: scrollTriggerEl
            ? {
                trigger: scrollTriggerEl,
                start: 'top 88%',
                once: true,
              }
            : undefined,
        });
      };

      const disableCssTransition = (targets: gsap.TweenTarget) => {
        gsap.utils.toArray<HTMLElement>(targets).forEach((el) => {
          el.style.transition = 'none';
        });
      };

      // Navbar subtle glide only on initial app mount
      if (!hasAnimatedNavbarRef.current) {
        hasAnimatedNavbarRef.current = true;
        gsap.from('.glass-navbar', {
          y: -24,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          onStart() {
            disableCssTransition('.glass-navbar');
          },
          clearProps: 'transform,opacity,transition',
        });
      }

      if (currentPage === 'home') {
        // 1. Slow-motion layered Hero entrance
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        heroTl
          .from('.hero-bg', {
            scale: 1.07,
            duration: 1.9,
            ease: 'power2.out',
            clearProps: 'transform',
          })
          .from(
            '.hero-foreground',
            {
              y: 34,
              opacity: 0.85,
              duration: 1.4,
              clearProps: 'transform,opacity',
            },
            0
          )
          .from(
            '.hero-typography-container .title-muzammil .gsap-word',
            {
              yPercent: 118,
              rotateZ: 2,
              duration: 1.1,
              stagger: 0.12,
              ease: 'power4.out',
              clearProps: 'transform',
            },
            0.12
          )
          .from(
            '.subtitle-lockup .square-bullet',
            {
              scaleX: 0,
              duration: 0.45,
              ease: 'power2.out',
              clearProps: 'transform',
            },
            0.55
          )
          .from(
            '.subtitle-lockup .role-text span',
            {
              y: 22,
              opacity: 0,
              duration: 0.9,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
            0.62
          )
          .from(
            '.hero-cta-btn',
            {
              y: 24,
              opacity: 0,
              duration: 0.85,
              ease: 'power3.out',
              onStart() {
                disableCssTransition('.hero-cta-btn');
              },
              clearProps: 'transform,opacity,transition',
            },
            0.78
          );

        // Subtle Hero layered depth scrub on scroll (targets .hero-text-layer to preserve centered translateX(-50%))
        gsap.to('.hero-text-layer', {
          yPercent: -11,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-container',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });

        // 2. Section 2 (WHY CHOOSE ME) heading + stepped cards choreography
        gsap.from('#why .section-title .gsap-word', {
          yPercent: 115,
          duration: 1.0,
          stagger: 0.09,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '#why .section-header',
            start: 'top 86%',
            once: true,
          },
        });

        gsap.from('#why .section-why-subtitle', {
          y: 20,
          opacity: 0,
          duration: 0.9,
          delay: 0.2,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '#why .section-header',
            start: 'top 86%',
            once: true,
          },
        });

        gsap.from('#why .why-card', {
          y: 52,
          opacity: 0,
          scale: 0.96,
          duration: 0.95,
          stagger: 0.16,
          ease: 'power3.out',
          onStart() {
            disableCssTransition('#why .why-card');
          },
          clearProps: 'transform,opacity,transition',
          scrollTrigger: {
            trigger: '#why .why-cards-grid',
            start: 'top 84%',
            once: true,
          },
        });

        gsap.from(
          '#why .why-card-top-label, #why .why-cutout-eyebrow, #why .why-cutout-heading, #why .why-cutout-copy, #why .why-card-corner-note, #why .why-card-btn',
          {
            y: 16,
            opacity: 0,
            duration: 0.72,
            stagger: 0.04,
            delay: 0.18,
            ease: 'power3.out',
            onStart() {
              disableCssTransition('#why .why-card-btn');
            },
            clearProps: 'transform,opacity,transition',
            scrollTrigger: {
              trigger: '#why .why-cards-grid',
              start: 'top 84%',
              once: true,
            },
          }
        );

        // 3. Section 3 (HOW I WORK) header & milestone tags
        gsap.from('#how-i-work .how-work-title .gsap-word', {
          yPercent: 115,
          duration: 1.0,
          stagger: 0.09,
          ease: 'power4.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: '#how-i-work',
            start: 'top 82%',
            once: true,
          },
        });

        gsap.from('#how-i-work .how-work-badge', {
          y: 18,
          scale: 0.9,
          opacity: 0,
          duration: 0.85,
          delay: 0.18,
          ease: 'back.out(1.4)',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '#how-i-work',
            start: 'top 82%',
            once: true,
          },
        });

        gsap.utils.toArray<HTMLElement>('#how-i-work .how-work-step').forEach((step) => {
          gsap.from(step, {
            y: 24,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
            onStart() {
              disableCssTransition(step);
            },
            clearProps: 'transform,opacity,transition',
            scrollTrigger: {
              trigger: step,
              start: 'top 88%',
              once: true,
            },
          });
        });
      } else if (currentPage === 'portfolio') {
        // Portfolio Hero slow-motion SVG draw + masked headline + discipline tags
        animateSvgRibbonDraw('.ds-portfolio-hero-art path', 2.0);

        gsap.from('.ds-portfolio-hero-art g', {
          scale: 0.35,
          opacity: 0,
          transformOrigin: 'center center',
          duration: 1.05,
          stagger: 0.18,
          delay: 0.25,
          ease: 'back.out(1.6)',
          clearProps: 'transform,opacity',
        });

        const portTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        portTl
          .from('.ds-portfolio-hero .ds-process-stamp', {
            y: 20,
            opacity: 0,
            duration: 0.8,
            clearProps: 'transform,opacity',
          })
          .from(
            '.ds-portfolio-hero-title .gsap-word',
            {
              yPercent: 118,
              rotateZ: 2,
              duration: 1.15,
              ease: 'power4.out',
              clearProps: 'transform',
            },
            0.12
          )
          .from(
            '.ds-portfolio-hero-meta span',
            {
              y: 16,
              opacity: 0,
              duration: 0.78,
              stagger: 0.07,
              clearProps: 'transform,opacity',
            },
            0.42
          );

        // Sequential Video Embeds smooth scroll entrance
        gsap.utils.toArray<HTMLElement>('.ds-pure-video-wrap').forEach((wrap, idx) => {
          gsap.from(wrap, {
            y: 44,
            scale: 0.975,
            opacity: 0,
            duration: 0.95,
            delay: idx === 0 ? 0.1 : 0,
            ease: 'power3.out',
            onStart() {
              disableCssTransition(wrap);
            },
            clearProps: 'transform,opacity,transition',
            scrollTrigger: {
              trigger: wrap,
              start: 'top 88%',
              once: true,
            },
          });
        });
      } else if (currentPage === 'about') {
        // About Hero SVG path draw + masked text rise
        animateSvgRibbonDraw('.ds-hero-motif path', 1.9);

        const aboutTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        aboutTl
          .from('.ds-hero-band .ds-process-stamp', {
            y: 18,
            opacity: 0,
            duration: 0.8,
            clearProps: 'transform,opacity',
          })
          .from(
            '.ds-hero-band .ds-page-title .gsap-word',
            {
              yPercent: 115,
              duration: 1.0,
              stagger: 0.055,
              ease: 'power4.out',
              clearProps: 'transform',
            },
            0.1
          )
          .from(
            '.ds-hero-band .ds-page-subtitle',
            {
              y: 22,
              opacity: 0,
              duration: 0.9,
              clearProps: 'transform,opacity',
            },
            0.42
          );

        // Philosophy Obsidian Frame + Paragraphs + Metric Tiles
        gsap.from('.ds-philosophy-frame', {
          y: 44,
          opacity: 0,
          duration: 0.95,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.ds-philosophy-frame',
            start: 'top 86%',
            once: true,
          },
        });

        gsap.from(
          '.ds-philosophy-copy .ds-kicker-orange, .ds-philosophy-copy .ds-frame-heading .gsap-word, .ds-philosophy-copy .ds-frame-paragraph',
          {
            y: 20,
            opacity: 0,
            duration: 0.85,
            stagger: 0.06,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: '.ds-philosophy-copy',
              start: 'top 86%',
              once: true,
            },
          }
        );

        gsap.from('.ds-metrics-grid .ds-metric-tile', {
          y: 28,
          scale: 0.94,
          opacity: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          onStart() {
            disableCssTransition('.ds-metrics-grid .ds-metric-tile');
          },
          clearProps: 'transform,opacity,transition',
          scrollTrigger: {
            trigger: '.ds-metrics-grid',
            start: 'top 86%',
            once: true,
          },
        });

        // Services Header + 4 Cards + Texts
        gsap.from('.ds-yellow-band .ds-process-stamp, .ds-yellow-band .ds-section-heading .gsap-word', {
          y: 24,
          opacity: 0,
          duration: 0.9,
          stagger: 0.07,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.ds-yellow-band .ds-section-header',
            start: 'top 86%',
            once: true,
          },
        });

        gsap.utils.toArray<HTMLElement>('.ds-services-grid .ds-service-card').forEach((card, i) => {
          gsap.from(card, {
            y: 44,
            opacity: 0,
            duration: 0.9,
            delay: (i % 2) * 0.12,
            ease: 'power3.out',
            onStart() {
              disableCssTransition(card);
            },
            clearProps: 'transform,opacity,transition',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true,
            },
          });

          gsap.from(
            card.querySelectorAll('.ds-service-num, .ds-service-title, .ds-service-desc, .ds-service-features li'),
            {
              y: 14,
              opacity: 0,
              duration: 0.7,
              stagger: 0.055,
              delay: 0.14,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                once: true,
              },
            }
          );
        });

        // Bottom Collaboration CTA Banner
        gsap.from('.ds-cta-gradient-card', {
          y: 38,
          scale: 0.97,
          opacity: 0,
          duration: 0.95,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.ds-cta-gradient-card',
            start: 'top 88%',
            once: true,
          },
        });

        gsap.from(
          '.ds-cta-inner .ds-process-stamp, .ds-cta-inner .ds-cta-heading .gsap-word, .ds-cta-inner .ds-cta-copy, .ds-cta-buttons a',
          {
            y: 18,
            opacity: 0,
            duration: 0.8,
            stagger: 0.06,
            delay: 0.12,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: '.ds-cta-inner',
              start: 'top 88%',
              once: true,
            },
          }
        );
      } else if (currentPage === 'contact') {
        // Contact Hero SVG path draw + masked text rise
        animateSvgRibbonDraw('.ds-hero-motif path', 1.9);

        const contactTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        contactTl
          .from('.ds-hero-band .ds-process-stamp', {
            y: 18,
            opacity: 0,
            duration: 0.8,
            clearProps: 'transform,opacity',
          })
          .from(
            '.ds-hero-band .ds-page-title .gsap-word',
            {
              yPercent: 115,
              duration: 1.0,
              stagger: 0.065,
              ease: 'power4.out',
              clearProps: 'transform',
            },
            0.1
          )
          .from(
            '.ds-hero-band .ds-page-subtitle',
            {
              y: 22,
              opacity: 0,
              duration: 0.9,
              clearProps: 'transform,opacity',
            },
            0.4
          );

        // Contact Form & Obsidian Direct Panel staggered reveal
        gsap.from('.ds-form-card', {
          y: 42,
          opacity: 0,
          duration: 0.95,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.ds-contact-split-grid',
            start: 'top 88%',
            once: true,
          },
        });

        gsap.from(
          '.ds-form-kicker, .ds-form-heading .gsap-word, .ds-contact-form .ds-field-group, .ds-contact-form .ds-btn-gradient-full',
          {
            y: 18,
            opacity: 0,
            duration: 0.78,
            stagger: 0.075,
            delay: 0.15,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: '.ds-form-card',
              start: 'top 88%',
              once: true,
            },
          }
        );

        gsap.from('.ds-direct-contact-card', {
          y: 42,
          opacity: 0,
          duration: 0.95,
          delay: 0.12,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '.ds-direct-contact-card',
            start: 'top 88%',
            once: true,
          },
        });

        gsap.from(
          '.ds-direct-header .ds-kicker-orange, .ds-direct-header .ds-frame-heading .gsap-word, .ds-direct-header .ds-frame-paragraph, .ds-availability-banner, .ds-detail-row, .ds-perks-list li, .ds-direct-contact-card .ds-btn-gradient-full',
          {
            y: 16,
            opacity: 0,
            duration: 0.72,
            stagger: 0.06,
            delay: 0.2,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: '.ds-direct-contact-card',
              start: 'top 88%',
              once: true,
            },
          }
        );
      }

      // Shared White Parallax Footer Choreography (Active Across All Pages)
      gsap.from('.muz-stamp-badge', {
        opacity: 0,
        duration: 0.75,
        stagger: 0.09,
        ease: 'power2.out',
        clearProps: 'opacity',
        scrollTrigger: {
          trigger: '.muz-white-footer',
          start: 'top 88%',
          once: true,
        },
      });

      gsap.from('.muz-inbox-block, .muz-col-heading, .muz-col-link', {
        y: 18,
        opacity: 0,
        duration: 0.8,
        stagger: 0.055,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.muz-white-footer',
          start: 'top 88%',
          once: true,
        },
      });

      animateSvgRibbonDraw(
        '.muz-footer-art-svg .muz-parallax-layer-slow path, .muz-footer-art-svg .muz-parallax-layer-slow rect, .muz-footer-art-svg .muz-parallax-layer-slow circle',
        1.7,
        '.muz-footer-art-stage'
      );

      gsap.from('.muz-bullseye-node', {
        scale: 0.4,
        opacity: 0,
        transformOrigin: 'center center',
        duration: 0.85,
        stagger: 0.1,
        ease: 'back.out(1.6)',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.muz-footer-art-stage',
          start: 'top 90%',
          once: true,
        },
      });
    });

    const refreshId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 60);

    return () => {
      clearTimeout(refreshId);
      ctx.revert();
    };
  }, [currentPage]);

  const renderSplitWords = (text: string) => {
    const words = text.trim().split(/\s+/);
    return words.map((word, idx) => (
      <React.Fragment key={`${word}-${idx}`}>
        <span className="gsap-clip">
          <span className="gsap-word">{word}</span>
        </span>
        {idx < words.length - 1 ? ' ' : null}
      </React.Fragment>
    ));
  };

  const renderFooter = () => {
    const stampSpin = footerScrollY * 180;
    const slowShiftX = footerMouse.x * 14;
    const slowShiftY = (0.5 - footerScrollY) * 28 + footerMouse.y * 10;
    const fastShiftX = footerMouse.x * -24;
    const fastShiftY = (0.5 - footerScrollY) * -36 + footerMouse.y * -16;

    const stamps = [
      { bg: '#FFC627', dot: '#FF4800', text: '#0B0D12', id: 'stampPath1' },
      { bg: '#FF6B00', dot: '#FFE53B', text: '#0B0D12', id: 'stampPath2' },
      { bg: '#FFE53B', dot: '#0B0D12', text: '#0B0D12', id: 'stampPath3' },
      { bg: '#0B0D12', dot: '#FFC627', text: '#FFFFFF', id: 'stampPath4' },
    ];

    return (
      <footer
        ref={footerRef}
        className="muz-white-footer"
        id="portfolio"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          setFooterMouse({ x: nx, y: ny });
        }}
        onMouseLeave={() => setFooterMouse({ x: 0, y: 0 })}
      >
        <div className="muz-footer-inner">
          {/* Top Section: Left Stamp Badges + Inbox Input & Right Link Columns */}
          <div className="muz-footer-top">
            {/* Left Block */}
            <div className="muz-footer-left">
              {/* 4 Decorative Circular Stamp Badges (Non-Interactive) */}
              <div className="muz-stamp-row" aria-hidden="true">
                {stamps.map((s, idx) => (
                  <div
                    key={s.id}
                    className="muz-stamp-badge"
                    style={{
                      transform: `rotate(${stampSpin + idx * 22}deg)`,
                    }}
                  >
                    <svg width="54" height="54" viewBox="0 0 60 60">
                      <defs>
                        <path
                          id={s.id}
                          d="M 30,30 m -19,0 a 19,19 0 1,1 38,0 a 19,19 0 1,1 -38,0"
                        />
                      </defs>
                      <circle
                        cx="30"
                        cy="30"
                        r="28"
                        fill={s.bg}
                        stroke="#0B0D12"
                        strokeWidth="2"
                      />
                      <circle cx="30" cy="30" r="6.5" fill={s.dot} />
                      <text
                        fill={s.text}
                        fontFamily="'Fredoka', 'Barlow Condensed', sans-serif"
                        fontSize="7.4"
                        fontWeight="700"
                        letterSpacing="2.3"
                      >
                        <textPath href={`#${s.id}`} startOffset="4%">
                          MUZAMMIL · UI/UX ·
                        </textPath>
                      </text>
                    </svg>
                  </div>
                ))}
              </div>

              {/* Minimalist Inbox Input */}
              <div className="muz-inbox-block">
                <span className="muz-inbox-title">Let&apos;s build in your inbox</span>
                <form
                  className="muz-inbox-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!inboxEmail.trim()) return;
                    setInboxSubmitted(true);
                    setInboxEmail('');
                    setTimeout(() => setInboxSubmitted(false), 4000);
                  }}
                >
                  <input
                    type="email"
                    className="muz-inbox-input"
                    placeholder="Enter your email"
                    value={inboxEmail}
                    onChange={(e) => setInboxEmail(e.target.value)}
                    aria-label="Enter your email"
                  />
                  <button
                    type="submit"
                    className="muz-inbox-submit"
                    aria-label="Submit email"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <polyline points="14 6 20 12 14 18" />
                    </svg>
                  </button>
                </form>
                {inboxSubmitted && (
                  <span className="muz-inbox-feedback">
                    Thanks! Reaching out to you shortly.
                  </span>
                )}
              </div>
            </div>

            {/* Right Multi-Column Links (Only Portfolio, About Us, Contact Us + 4 Socials) */}
            <div className="muz-footer-columns">
              {/* Column 1: Explore (Portfolio, About Us, Contact Us — No Home or Showcase) */}
              <div className="muz-footer-col">
                <span className="muz-col-heading">EXPLORE</span>
                <ul className="muz-col-links">
                  <li>
                    <a
                      href="#portfolio-page"
                      className="muz-col-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('portfolio');
                      }}
                    >
                      Portfolio
                    </a>
                  </li>
                  <li>
                    <a
                      href="#about"
                      className="muz-col-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('about');
                      }}
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact-page"
                      className="muz-col-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('contact');
                      }}
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: Socials (Facebook, Instagram, X, GitHub) */}
              <div className="muz-footer-col">
                <span className="muz-col-heading">SOCIALS</span>
                <ul className="muz-col-links">
                  <li>
                    <a
                      href="https://www.facebook.com/profile.php?id=61589801331535"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="muz-col-link"
                    >
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/muzammilkhanjpj/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="muz-col-link"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com/othero73i"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="muz-col-link"
                    >
                      X
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/muzammilkhanjpj-byte"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="muz-col-link"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Direct Contact */}
              <div className="muz-footer-col">
                <span className="muz-col-heading">CONTACT</span>
                <ul className="muz-col-links">
                  <li>
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=muzammilkhanjpj@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="muz-col-link"
                    >
                      muzammilkhanjpj@gmail.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact-page"
                      className="muz-col-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('contact');
                      }}
                    >
                      Start a Project
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section: Giant Tubular Outline Artwork + Purely Decorative Parallax Bullseye Circles */}
          <div className="muz-footer-art-stage" aria-hidden="true">
            <svg
              className="muz-footer-art-svg"
              viewBox="0 0 1440 470"
              fill="none"
            >
              {/* Layer 1: Tubular Continuous Black Outline Loops (Slow Parallax) */}
              <g
                className="muz-parallax-layer-slow"
                style={{
                  transform: `translate3d(${slowShiftX}px, ${slowShiftY}px, 0)`,
                }}
                stroke="#0B0D12"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Left Upper & Lower Connected Tubular Loops */}
                <path d="M 155 20 C 90 20, 32 95, 32 185 C 32 232, 118 232, 118 185 C 118 150, 155 135, 195 135" />
                <path d="M 118 185 C 118 228, 205 220, 205 278 C 205 335, 118 320, 118 375 L 118 415" />
                <circle cx="75" cy="415" r="43" fill="#FFFFFF" />

                {/* Second Arch & Diagonal Pill Loop */}
                <path d="M 205 278 C 205 215, 292 215, 292 278 C 292 318, 378 318, 378 265 C 378 215, 464 215, 464 275 C 464 345, 392 432, 335 432" />

                {/* Vertical Pill Column 1 */}
                <rect x="464" y="220" width="86" height="238" rx="43" fill="#FFFFFF" />

                {/* Wide Arch 1 (Over First Column to Bullseye 3) */}
                <path d="M 464 325 C 464 195, 725 195, 725 340 L 725 415" />

                {/* Vertical Pill Column 2 */}
                <rect x="725" y="220" width="86" height="238" rx="43" fill="#FFFFFF" />

                {/* Wide Arch 2 (Over Second Column to Bullseye 4) */}
                <path d="M 725 325 C 725 195, 986 195, 986 340 L 986 415" />

                {/* Right S-Curve & Nested Double Circle Column */}
                <path d="M 986 340 C 986 195, 1160 195, 1160 265 C 1160 302, 1112 312, 1112 346" />
                <circle cx="1112" cy="415" r="43" fill="#FFFFFF" />

                {/* Far-Right Tall Pill Column & Sweeping Tail */}
                <path d="M 1112 458 C 1195 458, 1246 405, 1246 325 L 1246 263 C 1246 215, 1332 215, 1332 263 L 1332 415" />
                <circle cx="1289" cy="415" r="43" fill="#FFFFFF" />

                {/* Subtle Embedded Display Wordmark inside the Tubular Stage */}
                <text
                  x="735"
                  y="148"
                  textAnchor="middle"
                  fontFamily="'Fredoka', 'Nunito', sans-serif"
                  fontSize="92"
                  fontWeight="700"
                  letterSpacing="8"
                  fill="none"
                  stroke="#0B0D12"
                  strokeWidth="3"
                  opacity="0.9"
                >
                  MUZAMMIL
                </text>
              </g>

              {/* Layer 2: Non-Interactive Decorative Bullseye Circles in Yellow-Orange-Black Design System (Fast Parallax) */}
              <g
                className="muz-parallax-layer-fast"
                style={{
                  transform: `translate3d(${fastShiftX}px, ${fastShiftY}px, 0)`,
                }}
              >
                {/* Bullseye 1 (Top-Left Loop): Golden Yellow + Vibrant Orange Dot */}
                <g className="muz-bullseye-node">
                  <circle
                    cx="162"
                    cy="76"
                    r="44"
                    fill="#FFC627"
                    stroke="#0B0D12"
                    strokeWidth="3.5"
                  />
                  <circle cx="162" cy="76" r="12" fill="#FF4800" />
                </g>

                {/* Bullseye 2 (Lower-Left Loop): Deep Obsidian + Bright Yellow Dot */}
                <g className="muz-bullseye-node">
                  <circle
                    cx="335"
                    cy="372"
                    r="44"
                    fill="#0B0D12"
                    stroke="#0B0D12"
                    strokeWidth="3.5"
                  />
                  <circle cx="335" cy="372" r="12" fill="#FFE53B" />
                </g>

                {/* Bullseye 3 (Center-Left Bottom): Vibrant Orange + Sun Yellow Dot */}
                <g className="muz-bullseye-node">
                  <circle
                    cx="681"
                    cy="415"
                    r="44"
                    fill="#FF5500"
                    stroke="#0B0D12"
                    strokeWidth="3.5"
                  />
                  <circle cx="681" cy="415" r="12" fill="#FFE53B" />
                </g>

                {/* Bullseye 4 (Center-Right Bottom): Bright Sun Yellow + Obsidian Dot */}
                <g className="muz-bullseye-node">
                  <circle
                    cx="942"
                    cy="415"
                    r="44"
                    fill="#FFE53B"
                    stroke="#0B0D12"
                    strokeWidth="3.5"
                  />
                  <circle cx="942" cy="415" r="12" fill="#0B0D12" />
                </g>

                {/* Bullseye 5 (Right Middle Stack): Warm Amber Gold + Deep Orange Dot */}
                <g className="muz-bullseye-node">
                  <circle
                    cx="1112"
                    cy="327"
                    r="44"
                    fill="#FFC627"
                    stroke="#0B0D12"
                    strokeWidth="3.5"
                  />
                  <circle cx="1112" cy="327" r="12" fill="#FF4800" />
                </g>

                {/* Bullseye 6 (Far-Right Top): Vibrant Orange + Obsidian Dot */}
                <g className="muz-bullseye-node">
                  <circle
                    cx="1376"
                    cy="265"
                    r="44"
                    fill="#FF7A00"
                    stroke="#0B0D12"
                    strokeWidth="3.5"
                  />
                  <circle cx="1376" cy="265" r="12" fill="#0B0D12" />
                </g>
              </g>
            </svg>
          </div>

          {/* Subtle Bottom Meta Row */}
          <div className="muz-footer-bottom-meta">
            <span>&copy; {new Date().getFullYear()} MUZAMMIL KHAN — PRO UI/UX &amp; FULL-STACK DEVELOPER</span>
            <span>DESIGNED FOR SPEED, 3D DEPTH &amp; GOOGLE RANKING</span>
          </div>
        </div>
      </footer>
    );
  };

  const renderStripedArrow = () => (
    <svg
      className="striped-arrow-icon"
      width="24"
      height="15"
      viewBox="0 0 26 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="0" y="5" width="1.6" height="6" rx="0.4" />
      <rect x="3" y="5" width="2.2" height="6" rx="0.4" />
      <rect x="6.5" y="5" width="3" height="6" rx="0.4" />
      <path d="M11 5H17V1.5L25.5 8L17 14.5V11H11V5Z" />
    </svg>
  );

  return (
    <>
      {/* Black Pill Navbar */}
      <header className="navbar-wrapper">
        <nav className="glass-navbar">
          {/* Left side: Universal Hamburger Button */}
          <button
            className={`hamburger-btn ${drawerOpen ? 'active' : ''}`}
            id="hamburger-btn"
            aria-label="Toggle navigation menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            <span className="hamburger-bar bar-1"></span>
            <span className="hamburger-bar bar-2"></span>
            <span className="hamburger-bar bar-3"></span>
          </button>

          {/* Center: Distressed Brand Name */}
          <a
            href="#hero"
            className="nav-brand"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home', 'hero');
            }}
          >
            <span className="brand-text">MUZAMMIL</span>
          </a>

          {/* Right side: PORTFOLIO Button */}
          <a
            href="#portfolio-page"
            className="nav-portfolio-btn"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('portfolio');
            }}
          >
            {renderStripedArrow()}
            <span>PORTFOLIO</span>
          </a>
        </nav>
      </header>

      {/* Slide-in Design-System Navigation Drawer */}
      <div
        className={`drawer-overlay ${drawerOpen ? 'active' : ''}`}
        id="drawer-overlay"
        onClick={() => setDrawerOpen(false)}
      ></div>
      <aside
        className={`glass-drawer ${drawerOpen ? 'active' : ''}`}
        id="glass-drawer"
        aria-hidden={!drawerOpen}
      >
        <div className="drawer-header">
          <span className="drawer-title">NAVIGATION</span>
          <button
            className="close-drawer-btn"
            id="close-drawer-btn"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            &times;
          </button>
        </div>

        <ul className="drawer-links">
          <li className="drawer-item">
            <a
              href="#hero"
              className={`drawer-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('home', 'hero');
              }}
            >
              <span className="link-number">01</span>
              <span className="link-text">Home</span>
            </a>
          </li>
          <li className="drawer-item">
            <a
              href="#portfolio-page"
              className={`drawer-link ${currentPage === 'portfolio' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('portfolio');
              }}
            >
              <span className="link-number">02</span>
              <span className="link-text">Portfolio</span>
            </a>
          </li>
          <li className="drawer-item">
            <a
              href="#about"
              className={`drawer-link ${currentPage === 'about' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('about');
              }}
            >
              <span className="link-number">03</span>
              <span className="link-text">About Us</span>
            </a>
          </li>
          <li className="drawer-item">
            <a
              href="#contact-page"
              className={`drawer-link ${currentPage === 'contact' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('contact');
              }}
            >
              <span className="link-number">04</span>
              <span className="link-text">Contact Us</span>
            </a>
          </li>
        </ul>

        <div className="drawer-footer">
          <p className="footer-role">UI/UX &amp; Full-Stack Web Designer</p>
          <div className="drawer-socials">
            <span>Available for Freelance &amp; Projects</span>
          </div>
        </div>
      </aside>

      {/* =========================================
          HOME PAGE (index.html)
          ========================================= */}
      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <main className="hero-container" id="hero" ref={heroRef}>
            {/* Layer 1: Background Image (Sky & Mountains) */}
            <img
              src={ASSETS.heroBg}
              alt="Background"
              className="hero-layer hero-bg"
              fetchPriority="high"
              decoding="async"
            />

            {/* Layer 2: Typography (Behind the Person's Head & Body) */}
            <div className="hero-layer hero-text-layer">
              <div className="hero-typography-container">
                <h1 className="title-muzammil">{renderSplitWords('MUZAMMIL KHAN')}</h1>

                <div className="subtitle-group">
                  <div className="subtitle-lockup">
                    <span className="square-bullet"></span>
                    <div className="role-text">
                      <span>PRO UI /UX DEISGNER</span>
                    </div>
                  </div>

                  <a
                    href="#about"
                    className="hero-cta-btn"
                    id="hero-cta"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('about');
                    }}
                  >
                    {renderStripedArrow()}
                    <span className="cta-text">ABOUT ME</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Layer 3: Foreground Person Cutout */}
            <img
              ref={personImgRef}
              src={ASSETS.person}
              alt="Person Foreground"
              className="hero-layer hero-foreground"
              fetchPriority="high"
              decoding="async"
            />

            {/* Layer 4: Interactive Matrix Code Aura Canvas */}
            <canvas ref={canvasRef} id="matrix-canvas" className="hero-layer hero-canvas"></canvas>
          </main>

          {/* SECTION 2 (Why Choose Me) */}
          <section className="brand-section section-why" id="why">
            {/* Shared ClipPath for Stepped Card Cutout */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
              <defs>
                <clipPath id="whySteppedClip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.50,0 L 0.91,0 Q 1,0 1,0.09 L 1,0.70 Q 1,0.78 0.91,0.78 L 0.64,0.78 Q 0.56,0.78 0.56,0.86 L 0.56,0.92 Q 0.56,1 0.48,1 L 0.26,1 Q 0.18,1 0.18,0.92 L 0.18,0.90 Q 0.18,0.83 0.10,0.83 L 0.08,0.83 Q 0,0.83 0,0.75 L 0,0.47 Q 0,0.39 0.09,0.39 L 0.12,0.39 Q 0.19,0.39 0.19,0.31 L 0.19,0.23 Q 0.19,0.15 0.27,0.15 L 0.36,0.15 Q 0.43,0.15 0.43,0.08 L 0.43,0.06 Q 0.43,0 0.50,0 Z" />
                </clipPath>
              </defs>
            </svg>

            <div className="section-container">
              <div className="section-header">
                <h2 className="section-title">{renderSplitWords('WHY CHOOSE ME')}</h2>
                <p className="section-why-subtitle">CRAFTED FOR SPEED, DESIGN &amp; CONVERSION</p>
              </div>

              {/* Compact Stepped-Cutout Cards Grid */}
              <div className="why-cards-grid">
                {/* Card 1 */}
                <article className="why-card">
                  <div className="why-card-stage">
                    <span className="why-card-top-label">Responsive</span>

                    <div className="why-card-cutout">
                      <span className="why-cutout-eyebrow">01 · EVERY SCREEN</span>
                      <h3 className="why-cutout-heading">Fluid &amp; Sharp</h3>
                      <p className="why-cutout-copy">
                        Clean interfaces built to work effortlessly on every device.
                      </p>
                    </div>

                    <div className="why-card-corner-note">
                      Mobile, Tablet
                      <br />
                      &amp; Desktop
                    </div>
                  </div>

                  <button
                    className="why-card-btn"
                    aria-label="Launch responsive design project"
                    onClick={() => navigateTo('contact')}
                  >
                    Launch Project
                  </button>
                </article>

                {/* Card 2 */}
                <article className="why-card">
                  <div className="why-card-stage">
                    <span className="why-card-top-label">Google SEO</span>

                    <div className="why-card-cutout">
                      <span className="why-cutout-eyebrow">02 · DISCOVERABILITY</span>
                      <h3 className="why-cutout-heading">Built to Rank</h3>
                      <p className="why-cutout-copy">
                        Fast structure &amp; schema engineered to get found on Google.
                      </p>
                    </div>

                    <div className="why-card-corner-note">
                      95+ PageSpeed
                      <br />
                      &amp; Indexing
                    </div>
                  </div>

                  <button
                    className="why-card-btn"
                    aria-label="Boost search engine ranking"
                    onClick={() => navigateTo('contact')}
                  >
                    Boost Ranking
                  </button>
                </article>

                {/* Card 3 */}
                <article className="why-card">
                  <div className="why-card-stage">
                    <span className="why-card-top-label">Full-Stack</span>

                    <div className="why-card-cutout">
                      <span className="why-cutout-eyebrow">03 · BEYOND UI</span>
                      <h3 className="why-cutout-heading">Real Backend</h3>
                      <p className="why-cutout-copy">
                        Secure auth, REST APIs &amp; SQL logic powering your site.
                      </p>
                    </div>

                    <div className="why-card-corner-note">
                      Node.js, APIs
                      <br />
                      &amp; SQL Data
                    </div>
                  </div>

                  <button
                    className="why-card-btn"
                    aria-label="Build full-stack backend architecture"
                    onClick={() => navigateTo('contact')}
                  >
                    Build Full-Stack
                  </button>
                </article>
              </div>
            </div>
          </section>

          {/* SECTION 3 (HOW I WORK — 200vh Sequenced Scroll Trim-Path) */}
          <section
            className="brand-section section-how-work"
            id="how-i-work"
            ref={howWorkSectionRef}
          >
            {/* Top-Left Heading & Badge */}
            <div className="how-work-header">
              <h2 className="how-work-title">{renderSplitWords('HOW I WORK')}</h2>
              <span className="how-work-badge">MY PROCESS</span>
            </div>

            {/* Sequenced Continuous Looping Path SVG */}
            <div className="how-work-svg-stage">
              {howWorkViewport !== 'desktop' ? (
                <svg
                  className="how-work-svg how-work-svg-mobile"
                  viewBox="0 0 400 760"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="howWorkTrimGradMobile"
                      gradientUnits="userSpaceOnUse"
                      x1="0"
                      y1="0"
                      x2="400"
                      y2="760"
                    >
                      <stop offset="0%" stopColor="#FF4800" />
                      <stop offset="50%" stopColor="#FF6D00" />
                      <stop offset="100%" stopColor="#FF8800" />
                    </linearGradient>
                  </defs>

                  {/* Base Track Path (Solid Black in SVG user-space so dasharray matches getTotalLength 1:1 on all mobile/tablet/WebKit browsers) */}
                  <path
                    d="M -12 158 C 48 175, 112 205, 116 254 C 118 292, 72 302, 42 292 C 12 282, 12 232, 46 212 C 80 192, 118 220, 126 276 C 134 332, 175 376, 212 366 C 242 358, 245 310, 214 292 C 180 272, 146 310, 132 368 C 116 408, 108 446, 128 538 C 140 562, 174 550, 174 508 C 174 466, 128 450, 92 478 C 56 506, 52 572, 92 604 C 142 636, 205 636, 250 626 C 278 620, 286 668, 245 674 C 208 678, 202 636, 232 622 C 272 604, 345 668, 412 768"
                    stroke="#000000"
                    strokeWidth={howWorkViewport === 'tablet' ? 14 : 16}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Sequenced Scroll Trim-Path Fill (Design System Vibrant Orange) */}
                  <path
                    ref={howWorkTrimPathRef}
                    d="M -12 158 C 48 175, 112 205, 116 254 C 118 292, 72 302, 42 292 C 12 282, 12 232, 46 212 C 80 192, 118 220, 126 276 C 134 332, 175 376, 212 366 C 242 358, 245 310, 214 292 C 180 272, 146 310, 132 368 C 116 408, 108 446, 128 538 C 140 562, 174 550, 174 508 C 174 466, 128 450, 92 478 C 56 506, 52 572, 92 604 C 142 636, 205 636, 250 626 C 278 620, 286 668, 245 674 C 208 678, 202 636, 232 622 C 272 604, 345 668, 412 768"
                    stroke="url(#howWorkTrimGradMobile)"
                    strokeWidth={howWorkViewport === 'tablet' ? 14.5 : 16.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0 }}
                  />
                </svg>
              ) : (
                <svg
                  className="how-work-svg"
                  viewBox="0 0 1000 1400"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="howWorkTrimGrad"
                      gradientUnits="userSpaceOnUse"
                      x1="0"
                      y1="0"
                      x2="1000"
                      y2="1400"
                    >
                      <stop offset="0%" stopColor="#FF4800" />
                      <stop offset="50%" stopColor="#FF6D00" />
                      <stop offset="100%" stopColor="#FF8800" />
                    </linearGradient>
                  </defs>

                  {/* Base Track Path (Solid Black) */}
                  <path
                    d="M -15 245 C 95 262, 235 325, 250 432 C 260 505, 198 536, 146 524 C 96 512, 102 432, 165 398 C 218 370, 282 392, 300 470 C 314 532, 298 615, 368 655 C 430 690, 502 668, 502 600 C 502 532, 422 508, 368 562 C 320 610, 275 705, 282 795 C 288 868, 386 862, 386 942 C 386 1018, 326 1022, 300 965 C 272 902, 292 820, 245 832 C 188 846, 178 992, 232 1058 C 282 1118, 395 1105, 488 1138 C 556 1162, 562 1245, 505 1248 C 448 1250, 442 1152, 508 1140 C 585 1126, 688 1245, 765 1410"
                    stroke="#000000"
                    strokeWidth="44"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Sequenced Scroll Trim-Path Fill (Design System Vibrant Orange) */}
                  <path
                    ref={howWorkTrimPathRef}
                    d="M -15 245 C 95 262, 235 325, 250 432 C 260 505, 198 536, 146 524 C 96 512, 102 432, 165 398 C 218 370, 282 392, 300 470 C 314 532, 298 615, 368 655 C 430 690, 502 668, 502 600 C 502 532, 422 508, 368 562 C 320 610, 275 705, 282 795 C 288 868, 386 862, 386 942 C 386 1018, 326 1022, 300 965 C 272 902, 292 820, 245 832 C 188 846, 178 992, 232 1058 C 282 1118, 395 1105, 488 1138 C 556 1162, 562 1245, 505 1248 C 448 1250, 442 1152, 508 1140 C 585 1126, 688 1245, 765 1410"
                    stroke="url(#howWorkTrimGrad)"
                    strokeWidth="45"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0 }}
                  />
                </svg>
              )}
            </div>

            {/* 4 Process Milestone Labels */}
            <div className={`how-work-step how-step-1 ${howWorkStage >= 1 ? 'active' : ''}`}>
              01. DISCOVERY
              <span className="how-work-step-dot"></span>
            </div>

            <div className={`how-work-step how-step-2 ${howWorkStage >= 2 ? 'active' : ''}`}>
              02. DESIGN
              <span className="how-work-step-dot"></span>
            </div>

            <div className={`how-work-step how-step-3 ${howWorkStage >= 3 ? 'active' : ''}`}>
              03. DEVELOPMENT
              <span className="how-work-step-dot"></span>
            </div>

            <div className={`how-work-step how-step-4 ${howWorkStage >= 4 ? 'active' : ''}`}>
              04. LAUNCH
              <span className="how-work-step-dot"></span>
            </div>
          </section>

          {/* WHITE DESIGN-SYSTEM PARALLAX FOOTER */}
          {renderFooter()}
        </>
      )}

      {/* =========================================
          PORTFOLIO PAGE — DEDICATED HERO SECTION
          ========================================= */}
      {currentPage === 'portfolio' && (
        <>
          <main className="ds-page-main">
            <section className="ds-portfolio-hero">
              {/* Non-Interactive Design-System Geometric Loops & Discs */}
              <svg
                className="ds-portfolio-hero-art"
                viewBox="0 0 1440 700"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                {/* Flowing Obsidian Tubular Ribbon Loop */}
                <path
                  d="M -60 460 C 90 460, 145 230, 265 245 C 365 258, 330 430, 225 430 C 135 430, 140 285, 290 250 C 440 215, 510 105, 680 120"
                  stroke="#0B0D12"
                  strokeWidth="16"
                  strokeLinecap="round"
                  opacity="0.16"
                />
                <path
                  d="M 860 580 C 1020 580, 1085 415, 1215 435 C 1320 450, 1295 575, 1205 565 C 1110 555, 1140 360, 1300 320 C 1390 298, 1455 245, 1500 220"
                  stroke="#0B0D12"
                  strokeWidth="16"
                  strokeLinecap="round"
                  opacity="0.16"
                />
                {/* Vibrant Orange Highlight Ribbon */}
                <path
                  d="M 1010 125 C 1145 85, 1250 185, 1365 130 C 1425 102, 1465 75, 1500 65"
                  stroke="#FF5500"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.55"
                />
                <path
                  d="M -40 180 C 75 145, 165 205, 240 165"
                  stroke="#FF5500"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.55"
                />

                {/* Non-Interactive Decorative Concentric Discs */}
                <g opacity="0.95">
                  <circle cx="150" cy="545" r="34" fill="#0B0D12" />
                  <circle cx="150" cy="545" r="10" fill="#FFE53B" />
                </g>
                <g opacity="0.95">
                  <circle cx="1285" cy="185" r="32" fill="#FF5500" stroke="#0B0D12" strokeWidth="3.5" />
                  <circle cx="1285" cy="185" r="9" fill="#FFE53B" />
                </g>
                <g opacity="0.95">
                  <circle cx="1325" cy="535" r="24" fill="#FFFFFF" stroke="#0B0D12" strokeWidth="3.5" />
                  <circle cx="1325" cy="535" r="7" fill="#FF5500" />
                </g>
              </svg>

              <div className="ds-page-container ds-portfolio-hero-content">
                <span className="ds-process-stamp">SELECTED WORKS</span>
                <h1 className="ds-portfolio-hero-title">{renderSplitWords('PORTFOLIO')}</h1>
                <div className="ds-portfolio-hero-meta">
                  <span>3D WEB DESIGN</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>UI/UX SYSTEMS</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>FULL-STACK NODE.JS</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>GOOGLE SEO</span>
                </div>
              </div>
            </section>

            {/* Sequential Pure Inline Click-to-Play Videos */}
            <section className="ds-white-band ds-portfolio-videos-band">
              <div className="ds-portfolio-videos-container">
                <div className="ds-video-sequence-list">
                  {PORTFOLIO_REELS.map((reel, index) => {
                    const isPlaying = playingReelIndex === index;
                    return (
                      <div
                        key={reel.seq}
                        className={`ds-pure-video-wrap ${isPlaying ? 'is-playing' : ''}`}
                      >
                        <video
                          ref={(el) => {
                            reelVideoRefs.current[index] = el;
                          }}
                          className="ds-pure-video-el"
                          src={`${reel.videoUrl}#t=${reel.previewAt}`}
                          width={reel.width}
                          height={reel.height}
                          controls={isPlaying}
                          playsInline
                          preload={index < 2 ? 'metadata' : 'none'}
                          onPlay={() => {
                            reelVideoRefs.current.forEach((vid, i) => {
                              if (i !== index && vid && !vid.paused) {
                                vid.pause();
                              }
                            });
                            setPlayingReelIndex(index);
                          }}
                          onPause={() => {
                            setPlayingReelIndex((prev) => (prev === index ? null : prev));
                          }}
                          onEnded={() => {
                            setPlayingReelIndex((prev) => (prev === index ? null : prev));
                          }}
                        />

                        {!isPlaying && (
                          <button
                            type="button"
                            className="ds-pure-video-play-overlay"
                            aria-label={`Play ${reel.title} website video`}
                            onClick={() => handlePlaySingleReel(index)}
                          >
                            <span className="ds-pure-play-circle">
                              <svg
                                width="26"
                                height="26"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <polygon points="7 4 20 12 7 20 7 4" />
                              </svg>
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </main>

          {renderFooter()}
        </>
      )}

      {/* =========================================
          ABOUT PAGE — DESIGN SYSTEM REDESIGN
          ========================================= */}
      {currentPage === 'about' && (
        <>
          <main className="ds-page-main">
            {/* Band 1: Golden Yellow Hero Header */}
            <section className="ds-hero-band">
              {/* Decorative Continuous Black/Orange Flow Motif (Non-Interactive) */}
              <svg
                className="ds-hero-motif"
                viewBox="0 0 1440 360"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M -40 270 C 140 270, 210 110, 340 120 C 440 128, 415 265, 515 275 C 655 290, 740 70, 920 95 C 1060 115, 1020 285, 1175 275 C 1295 268, 1345 135, 1480 145"
                  stroke="#0B0D12"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.12"
                />
                <path
                  d="M 960 65 C 1070 40, 1185 115, 1265 85 C 1340 56, 1390 25, 1460 35"
                  stroke="#FF5500"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </svg>

              <div className="ds-page-container ds-hero-content">
                <span className="ds-process-stamp">ABOUT MUZAMMIL KHAN</span>
                <h1 className="ds-page-title">
                  {renderSplitWords(
                    'CREATING HIGH-PERFORMANCE 3D & FULL-STACK DIGITAL EXPERIENCES'
                  )}
                </h1>
                <p className="ds-page-subtitle">
                  I craft custom-built websites for local businesses and modern brands, combining captivating 3D visual design, rock-solid Node.js backend logic, and Google-ranking SEO that converts visitors into customers.
                </p>
              </div>
            </section>

            {/* Band 2: Pure White Philosophy & Metrics Frame */}
            <section className="ds-white-band">
              <div className="ds-page-container">
                <article className="ds-obsidian-frame ds-philosophy-frame">
                  <div className="ds-philosophy-grid">
                    {/* Left: Philosophy Copy */}
                    <div className="ds-philosophy-copy">
                      <span className="ds-kicker-orange">MY PHILOSOPHY</span>
                      <h2 className="ds-frame-heading">
                        {renderSplitWords('Design that inspires. Code that performs.')}
                      </h2>
                      <p className="ds-frame-paragraph">
                        I believe a website shouldn&apos;t just be an online brochure — it should be your highest-performing digital engine. Many websites suffer from slow load speeds, generic cookie-cutter templates, and zero search visibility.
                      </p>
                      <p className="ds-frame-paragraph">
                        My approach unites creative UI/UX craftsmanship with engineering discipline. Every website is built from the ground up to load blisteringly fast, look breathtaking on any device, and rank at the top of Google for local businesses.
                      </p>
                    </div>

                    {/* Right: 2x2 Gradient Metric Blocks */}
                    <div className="ds-metrics-grid">
                      <div className="ds-metric-tile">
                        <span className="ds-metric-value">95+</span>
                        <span className="ds-metric-label">Google PageSpeed score standard</span>
                      </div>
                      <div className="ds-metric-tile">
                        <span className="ds-metric-value">3D</span>
                        <span className="ds-metric-label">Immersive visual &amp; interactive depth</span>
                      </div>
                      <div className="ds-metric-tile">
                        <span className="ds-metric-value">Node.js</span>
                        <span className="ds-metric-label">Full-stack backend &amp; API architecture</span>
                      </div>
                      <div className="ds-metric-tile">
                        <span className="ds-metric-value">Local SEO</span>
                        <span className="ds-metric-label">Optimized for Google local business ranking</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            {/* Band 3: Golden Yellow Core Service Pillars */}
            <section className="ds-yellow-band">
              <div className="ds-page-container">
                <div className="ds-section-header">
                  <span className="ds-process-stamp">WHAT I OFFER</span>
                  <h2 className="ds-section-heading">
                    {renderSplitWords('COMPREHENSIVE WEB CREATION SERVICES')}
                  </h2>
                </div>

                <div className="ds-services-grid">
                  {/* Service Card 1: 3D Web Design */}
                  <article className="ds-service-card">
                    <div className="ds-service-gradient-head">
                      <span className="ds-service-num">01 — 3D &amp; Responsive Web Design</span>
                      <h3 className="ds-service-title">Immersive interfaces on every screen.</h3>
                      <p className="ds-service-desc">
                        I design captivating 3D web experiences and fluid interfaces that stand out from competitors and engage visitors across mobile, tablet, and desktop.
                      </p>
                    </div>

                    <ul className="ds-service-features">
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                          <polyline points="2 17 12 22 22 17"></polyline>
                          <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                        <span>Interactive 3D visuals &amp; micro-animations</span>
                      </li>
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                          <line x1="12" y1="18" x2="12.01" y2="18"></line>
                        </svg>
                        <span>Fluid mobile, tablet &amp; desktop scaling</span>
                      </li>
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        <span>Pixel-perfect custom UI/UX typography</span>
                      </li>
                    </ul>
                  </article>

                  {/* Service Card 2: Backend & Node.js */}
                  <article className="ds-service-card">
                    <div className="ds-service-gradient-head">
                      <span className="ds-service-num">02 — Node.js &amp; Full-Stack Backend</span>
                      <h3 className="ds-service-title">Powerful functionality behind the scenes.</h3>
                      <p className="ds-service-desc">
                        Beyond stunning visuals, I build custom backend logic, secure authentication, scalable databases, and custom REST APIs with JavaScript and Node.js.
                      </p>
                    </div>

                    <ul className="ds-service-features">
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                        <span>Node.js server-side logic &amp; custom APIs</span>
                      </li>
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Secure user authentication &amp; permissions</span>
                      </li>
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                        </svg>
                        <span>SQL databases &amp; structured querying</span>
                      </li>
                    </ul>
                  </article>

                  {/* Service Card 3: 95+ Speed & Local SEO */}
                  <article className="ds-service-card">
                    <div className="ds-service-gradient-head">
                      <span className="ds-service-num">03 — 95+ PageSpeed &amp; Google SEO</span>
                      <h3 className="ds-service-title">Rank on Google &amp; convert local visitors.</h3>
                      <p className="ds-service-desc">
                        I engineer SEO-optimized web foundations with 95+ Google PageSpeed load times to help local businesses rank on Google searches and attract real customers.
                      </p>
                    </div>

                    <ul className="ds-service-features">
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        <span>95+ PageSpeed lightning load times</span>
                      </li>
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <span>Local Google search schema &amp; ranking</span>
                      </li>
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>Clean semantic HTML5 structure</span>
                      </li>
                    </ul>
                  </article>

                  {/* Service Card 4: AI Agents for Local Businesses */}
                  <article className="ds-service-card">
                    <div className="ds-service-gradient-head">
                      <span className="ds-service-num">04 — Website AI Agents</span>
                      <h3 className="ds-service-title">Smart automation built for local businesses.</h3>
                      <p className="ds-service-desc">
                        I build intelligent website agents tailored for local businesses, automating client inquiries, qualifying leads, and providing 24/7 instant interactive support.
                      </p>
                    </div>

                    <ul className="ds-service-features">
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                        <span>Automated 24/7 client communication</span>
                      </li>
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Instant customer lead qualification</span>
                      </li>
                      <li>
                        <svg
                          className="ds-service-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        <span>Custom business knowledge integration</span>
                      </li>
                    </ul>
                  </article>
                </div>
              </div>
            </section>

            {/* Band 4: Pure White Collaboration CTA Banner */}
            <section className="ds-white-band ds-cta-band">
              <div className="ds-page-container">
                <article className="ds-cta-gradient-card">
                  <div className="ds-cta-inner">
                    <span className="ds-process-stamp">LET&apos;S COLLABORATE</span>
                    <h2 className="ds-cta-heading">
                      {renderSplitWords('READY TO ELEVATE YOUR LOCAL BUSINESS ONLINE?')}
                    </h2>
                    <p className="ds-cta-copy">
                      Whether you need a high-impact 3D website, a robust Node.js backend engine, or dominant Google search ranking, let&apos;s create something extraordinary together.
                    </p>
                    <div className="ds-cta-buttons">
                      <a
                        href="#portfolio-page"
                        className="ds-btn-obsidian"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('portfolio');
                        }}
                      >
                        {renderStripedArrow()}
                        <span>View My Showcase</span>
                      </a>
                      <a
                        href="#contact-page"
                        className="ds-btn-white-outline"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('contact');
                        }}
                      >
                        <span>Start a Conversation</span>
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </main>

          {renderFooter()}
        </>
      )}

      {/* =========================================
          CONTACT PAGE — DESIGN SYSTEM REDESIGN + USER FORM
          ========================================= */}
      {currentPage === 'contact' && (
        <>
          <main className="ds-page-main">
            {/* Band 1: Golden Yellow Hero Header */}
            <section className="ds-hero-band">
              {/* Decorative Continuous Black/Orange Flow Motif (Non-Interactive) */}
              <svg
                className="ds-hero-motif"
                viewBox="0 0 1440 360"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M -30 140 C 120 120, 175 265, 310 250 C 445 235, 450 95, 595 105 C 740 115, 780 280, 955 255 C 1105 232, 1140 75, 1300 95 C 1385 105, 1430 185, 1480 180"
                  stroke="#0B0D12"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0.12"
                />
                <path
                  d="M 40 280 C 180 295, 290 210, 415 225 C 510 236, 560 300, 660 285"
                  stroke="#FF5500"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </svg>

              <div className="ds-page-container ds-hero-content">
                <span className="ds-process-stamp">START A COLLABORATION</span>
                <h1 className="ds-page-title">
                  {renderSplitWords("LET'S BUILD SOMETHING EXTRAORDINARY")}
                </h1>
                <p className="ds-page-subtitle">
                  Have an ambitious project in mind, need an immersive 3D interface, or want a high-converting website engineered with Node.js backend logic and top Google rankings? Reach out directly via email to start a conversation.
                </p>
              </div>
            </section>

            {/* Band 2: Pure White 2-Column Project Form + Direct Contact Card */}
            <section className="ds-white-band">
              <div className="ds-page-container">
                <div className="ds-contact-split-grid">
                  {/* Left Column: Interactive Project Inquiry Form */}
                  <article className="ds-form-card" id="contact-form">
                    <div className="ds-form-gradient-banner">
                      <span className="ds-form-kicker">PROJECT INQUIRY FORM</span>
                      <h2 className="ds-form-heading">
                        {renderSplitWords('Tell Me About Your Project')}
                      </h2>
                    </div>

                    {contactSubmittedData ? (
                      <div className="ds-form-success-panel">
                        <div className="ds-success-icon-wrap" aria-hidden="true">
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <h3 className="ds-success-title">Inquiry Ready to Send!</h3>
                        <p className="ds-success-copy">
                          Thank you, <strong>{contactSubmittedData.name}</strong>. Your inquiry for <strong>{contactSubmittedData.service}</strong> (WhatsApp: <strong>{contactSubmittedData.whatsapp}</strong>) has been recorded. Click below to dispatch directly via your email app or expect a reply at <strong>{contactSubmittedData.email}</strong> within 24 hours.
                        </p>
                        <div className="ds-success-actions">
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=muzammilkhanjpj@gmail.com&su=${encodeURIComponent(
                              `New Project Inquiry: ${contactSubmittedData.service} (${contactSubmittedData.name})`
                            )}&body=${encodeURIComponent(
                              `Full Name: ${contactSubmittedData.name}\nEmail Address: ${contactSubmittedData.email}\nWhatsApp Number: ${contactSubmittedData.whatsapp}\nService Needed: ${contactSubmittedData.service}\n\nProject Details:\n${contactSubmittedData.message}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ds-btn-gradient-full"
                          >
                            {renderStripedArrow()}
                            <span>Open &amp; Send in Gmail</span>
                          </a>
                          <button
                            type="button"
                            className="ds-btn-reset-form"
                            onClick={() => {
                              setContactSubmittedData(null);
                              setContactForm({
                                name: '',
                                email: '',
                                whatsapp: '',
                                service: 'Website Designing & Development',
                                message: '',
                              });
                            }}
                          >
                            Fill Out Another Inquiry
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form
                        className="ds-contact-form"
                        noValidate
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (contactSubmitting) return;

                          const trimmedName = contactForm.name.trim();
                          const trimmedEmail = contactForm.email.trim();
                          const trimmedWhatsapp = contactForm.whatsapp.trim();
                          const trimmedMessage = contactForm.message.trim();
                          const whatsappDigits = trimmedWhatsapp.replace(/\D/g, '');

                          if (!trimmedName) {
                            setContactError('Please enter your full name.');
                            return;
                          }
                          if (!trimmedEmail || !trimmedEmail.includes('@')) {
                            setContactError('Please enter a valid email address.');
                            return;
                          }
                          if (!trimmedWhatsapp || whatsappDigits.length < 7) {
                            setContactError('Please enter a valid WhatsApp number (compulsory).');
                            return;
                          }
                          if (!trimmedMessage) {
                            setContactError('Please enter your project details.');
                            return;
                          }

                          if (!supabase) {
                            setContactError(
                              'Supabase is not configured. Please check your environment variables.'
                            );
                            return;
                          }

                          setContactError('');
                          setContactSubmitting(true);

                          try {
                            const { error } = await supabase
                              .from('contact_inquiries')
                              .insert([
                                {
                                  full_name: trimmedName,
                                  email: trimmedEmail,
                                  whatsapp_number: trimmedWhatsapp,
                                  service: contactForm.service,
                                  project_details: trimmedMessage,
                                },
                              ]);

                            if (error) {
                              setContactError(
                                error.message ||
                                  'Unable to save your inquiry right now. Please try again.'
                              );
                              return;
                            }

                            setContactSubmittedData({
                              name: trimmedName,
                              email: trimmedEmail,
                              whatsapp: trimmedWhatsapp,
                              service: contactForm.service,
                              message: trimmedMessage,
                            });
                          } catch {
                            setContactError(
                              'Network error while submitting your inquiry. Please try again.'
                            );
                          } finally {
                            setContactSubmitting(false);
                          }
                        }}
                      >
                        <div className="ds-form-row-2col">
                          <div className="ds-field-group">
                            <label htmlFor="contact-name" className="ds-field-label">
                              Full Name <span className="ds-required-mark">*</span>
                            </label>
                            <input
                              id="contact-name"
                              type="text"
                              className="ds-field-input"
                              placeholder="e.g. Alex Morgan"
                              value={contactForm.name}
                              onChange={(e) =>
                                setContactForm((prev) => ({ ...prev, name: e.target.value }))
                              }
                              required
                            />
                          </div>

                          <div className="ds-field-group">
                            <label htmlFor="contact-email" className="ds-field-label">
                              Email Address <span className="ds-required-mark">*</span>
                            </label>
                            <input
                              id="contact-email"
                              type="email"
                              className="ds-field-input"
                              placeholder="you@company.com"
                              value={contactForm.email}
                              onChange={(e) =>
                                setContactForm((prev) => ({ ...prev, email: e.target.value }))
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="ds-field-group">
                          <label htmlFor="contact-whatsapp" className="ds-field-label">
                            WhatsApp Number <span className="ds-required-mark">* (Compulsory)</span>
                          </label>
                          <input
                            id="contact-whatsapp"
                            type="tel"
                            className="ds-field-input"
                            placeholder="e.g. +92 300 1234567"
                            value={contactForm.whatsapp}
                            onChange={(e) =>
                              setContactForm((prev) => ({ ...prev, whatsapp: e.target.value }))
                            }
                            required
                          />
                        </div>

                        <div className="ds-field-group">
                          <span className="ds-field-label">Service</span>
                          <div className="ds-option-grid">
                            {[
                              'SEO',
                              'Website Designing & Development',
                              'Both',
                            ].map((serviceOption) => (
                              <button
                                key={serviceOption}
                                type="button"
                                className={`ds-option-btn ${
                                  contactForm.service === serviceOption ? 'active' : ''
                                }`}
                                onClick={() =>
                                  setContactForm((prev) => ({
                                    ...prev,
                                    service: serviceOption,
                                  }))
                                }
                              >
                                {serviceOption}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="ds-field-group">
                          <label htmlFor="contact-message" className="ds-field-label">
                            Project Details <span className="ds-required-mark">*</span>
                          </label>
                          <textarea
                            id="contact-message"
                            className="ds-field-textarea"
                            rows={4}
                            placeholder="Share your business type, design goals, or key features needed..."
                            value={contactForm.message}
                            onChange={(e) =>
                              setContactForm((prev) => ({ ...prev, message: e.target.value }))
                            }
                            required
                          ></textarea>
                        </div>

                        {contactError && (
                          <p className="ds-form-error" role="alert">
                            {contactError}
                          </p>
                        )}

                        <button
                          type="submit"
                          className="ds-btn-gradient-full"
                          disabled={contactSubmitting}
                        >
                          {renderStripedArrow()}
                          <span>
                            {contactSubmitting ? 'Sending Inquiry...' : 'Send Project Inquiry'}
                          </span>
                        </button>
                      </form>
                    )}
                  </article>

                  {/* Right Column: Obsidian Direct Contact Panel (Exact Existing Text) */}
                  <article className="ds-obsidian-frame ds-direct-contact-card">
                    <div className="ds-direct-header">
                      <span className="ds-kicker-orange">AVAILABILITY</span>
                      <h3 className="ds-frame-heading">{renderSplitWords('Direct Contact')}</h3>
                      <p className="ds-frame-paragraph">
                        I collaborate with startups, local businesses, and modern brands worldwide. Feel free to reach out directly to discuss your project.
                      </p>
                    </div>

                    {/* Availability Banner */}
                    <div className="ds-availability-banner">
                      <div className="ds-availability-badge-icon" aria-hidden="true">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                      </div>
                      <div className="ds-availability-text">
                        <strong>Accepting New Projects</strong>
                        <span>Fast turnaround &amp; dedicated support</span>
                      </div>
                    </div>

                    {/* Contact Details Rows */}
                    <div className="ds-contact-details">
                      <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=muzammilkhanjpj@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ds-detail-row ds-detail-link"
                      >
                        <div className="ds-detail-icon">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <div className="ds-detail-text">
                          <span>Email Address</span>
                          <strong>muzammilkhanjpj@gmail.com</strong>
                        </div>
                      </a>

                      <div className="ds-detail-row">
                        <div className="ds-detail-icon">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div className="ds-detail-text">
                          <span>Response Time</span>
                          <strong>Within 24 Hours Guaranteed</strong>
                        </div>
                      </div>

                      <div className="ds-detail-row">
                        <div className="ds-detail-icon">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <div className="ds-detail-text">
                          <span>Location</span>
                          <strong>Available Worldwide (Remote)</strong>
                        </div>
                      </div>
                    </div>

                    {/* Freelance Value Propositions */}
                    <ul className="ds-perks-list">
                      <li>
                        <svg
                          className="ds-perk-check"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>95+ Google PageSpeed Guarantee</span>
                      </li>
                      <li>
                        <svg
                          className="ds-perk-check"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Custom Responsive 3D &amp; UI/UX</span>
                      </li>
                      <li>
                        <svg
                          className="ds-perk-check"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Node.js Backend &amp; SQL Database Architecture</span>
                      </li>
                      <li>
                        <svg
                          className="ds-perk-check"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>End-to-End Delivery &amp; Post-Launch Support</span>
                      </li>
                    </ul>

                    {/* Direct Email Action CTA Button */}
                    <a href="mailto:muzammilkhanjpj@gmail.com" className="ds-btn-gradient-full">
                      <span>Send Email Directly</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </a>
                  </article>
                </div>
              </div>
            </section>
          </main>

          {renderFooter()}
        </>
      )}
    </>
  );
}
