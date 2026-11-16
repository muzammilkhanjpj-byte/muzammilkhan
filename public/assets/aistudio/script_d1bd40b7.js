// Interactive Matrix Silhouette Animation & Glassmorphism Drawer Controller
(function () {
  // -------------------------------------------------------------
  // 1. DRAWER & HAMBURGER CONTROLLER
  // -------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const glassDrawer = document.getElementById('glass-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    glassDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    glassDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    glassDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    glassDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (glassDrawer.classList.contains('active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeDrawer);
  }

  const heroCtaBtn = document.getElementById('hero-cta');

  if (heroCtaBtn) {
    heroCtaBtn.addEventListener('click', (e) => {
      const target = document.querySelector('#portfolio');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // ESC key to close drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && glassDrawer && glassDrawer.classList.contains('active')) {
      closeDrawer();
    }
  });

  // -------------------------------------------------------------
  // CONTACT FORM SUBMISSION CONTROLLER
  // -------------------------------------------------------------
  const contactForm = document.getElementById('freelance-contact-form');
  const successMessage = document.getElementById('form-success-message');
  const submitBtn = document.getElementById('submit-inquiry-btn');

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span>Sending Proposal...</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin-icon">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
      `;

      setTimeout(() => {
        if (successMessage) {
          successMessage.classList.add('active');
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        submitBtn.innerHTML = `<span>Proposal Sent Successfully ✨</span>`;
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        submitBtn.style.color = '#ffffff';

        contactForm.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.color = '';
        }, 5000);
      }, 900);
    });
  }

  // -------------------------------------------------------------
  // 2. CANVAS MATRIX CODE AURA & SILHOUETTE ANIMATION
  // -------------------------------------------------------------
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = document.querySelector('.hero-container');
  const personImg = document.querySelector('.hero-foreground');

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

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
    radius: 140
  };

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
    mouse.isHovered = true;

    spawnMouseSparks(mouse.targetX, mouse.targetY, 2);
  });

  hero.addEventListener('mouseleave', () => {
    mouse.isHovered = false;
    mouse.targetX = -9999;
    mouse.targetY = -9999;
  });

  function resize() {
    if (!hero) return;
    width = hero.clientWidth;
    height = hero.clientHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    rebuildParticleGrid();
  }

  let particles = [];
  let rainColumns = [];
  let mouseSparks = [];

  function rebuildParticleGrid() {
    particles = [];
    rainColumns = [];

    const streamCount = Math.floor(width / 32);
    for (let i = 0; i < streamCount; i++) {
      rainColumns.push({
        x: (i + Math.random() * 0.5) * 32,
        y: Math.random() * height,
        speed: 1.2 + Math.random() * 2.2,
        length: Math.floor(6 + Math.random() * 14),
        chars: [],
        stepTimer: 0,
        opacity: 0.15 + Math.random() * 0.55
      });
    }

    createSilhouetteParticles();
  }

  function createSilhouetteParticles() {
    const pLeft = width * 0.20;
    const pRight = width * 0.64;
    const pTop = height * 0.32;
    const pBottom = height * 0.88;

    const spacing = Math.max(14, Math.floor(width / 80));

    for (let y = pTop; y < pBottom; y += spacing) {
      for (let x = pLeft; x < pRight; x += spacing) {
        const nx = (x - pLeft) / (pRight - pLeft);
        const ny = (y - pTop) / (pBottom - pTop);

        const headCenter = 0.44;
        const widthAtY = 0.15 + 0.82 * Math.pow(ny, 1.2);
        const inSilhouette = Math.abs(nx - headCenter) < widthAtY * 0.5;

        if (inSilhouette && Math.random() < 0.68) {
          particles.push({
            baseX: x + (Math.random() - 0.5) * 4,
            baseY: y + (Math.random() - 0.5) * 4,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            char: getRandomChar(),
            baseAlpha: 0.25 + Math.random() * 0.55,
            alpha: 0.4,
            mutateTimer: Math.floor(Math.random() * 40),
            size: Math.floor(10 + Math.random() * 4),
            isPerson: true
          });
        }
      }
    }

    const ambientCount = Math.floor(width * 0.08);
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
        isPerson: false
      });
    }
  }

  function spawnMouseSparks(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.2;
      mouseSparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        char: getRandomChar(),
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        size: 11 + Math.random() * 3
      });
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    mouse.x += (mouse.targetX - mouse.x) * 0.2;
    mouse.y += (mouse.targetY - mouse.y) * 0.2;

    ctx.clearRect(0, 0, width, height);

    ctx.font = "600 12px 'Consolas', 'Montserrat', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Draw and update Matrix Rain columns
    for (let col of rainColumns) {
      col.y += col.speed;
      if (col.y > height + col.length * 18) {
        col.y = -col.length * 18;
        col.x = Math.random() * width;
        col.speed = 1.2 + Math.random() * 2.2;
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
        if (isHead) {
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(215, 242, 255, ${finalAlpha})`;
          ctx.shadowColor = 'rgba(180, 230, 255, 0.4)';
          ctx.shadowBlur = 3;
        }

        ctx.fillText(col.chars[j], col.x, charY);
      }
    }

    ctx.shadowBlur = 0;

    // 2. Draw and update Silhouette particles
    for (let p of particles) {
      p.mutateTimer++;
      if (p.mutateTimer > 45) {
        p.char = getRandomChar();
        p.mutateTimer = Math.floor(Math.random() * 15);
      }

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius && mouse.isHovered) {
        const force = (1 - dist / mouse.radius);
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

      if (p.alpha > 0.6) {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = `rgba(220, 240, 255, ${p.alpha})`;
        ctx.shadowBlur = 0;
      }

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
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillText(s.char, s.x, s.y);
    }
  }

  window.addEventListener('resize', resize);
  if (personImg && !personImg.complete) {
    personImg.addEventListener('load', resize);
  }
  resize();
  requestAnimationFrame(animate);
})();
