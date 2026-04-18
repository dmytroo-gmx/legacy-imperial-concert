/* ============================================================
   LEGACY IMPERIAL CONCERTS — Interactive 3D Landing
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. LOADER
     ========================================================== */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 800);
  });
  // Fallback: hide after 4s no matter what
  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 4000);

  /* ==========================================================
     2. LANGUAGE SWITCHER (i18n)
     ========================================================== */
  const T = window.TRANSLATIONS || {};
  const DEFAULT_LANG = 'pl';

  function getStoredLang() {
    try { return localStorage.getItem('lang') || DEFAULT_LANG; } catch (_) { return DEFAULT_LANG; }
  }
  function setStoredLang(lang) {
    try { localStorage.setItem('lang', lang); } catch (_) {}
  }

  function applyLanguage(lang) {
    if (!T[lang]) lang = DEFAULT_LANG;
    const dict = T[lang];
    document.documentElement.lang = lang === 'ua' ? 'uk' : (lang === 'by' ? 'be' : lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    setStoredLang(lang);
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.lang);
    });
  });

  applyLanguage(getStoredLang());

  /* ==========================================================
     3. MOBILE MENU
     ========================================================== */
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ==========================================================
     4. SCROLL PROGRESS BAR
     ========================================================== */
  const progressBar = document.getElementById('scrollProgressBar');
  function updateScrollProgress() {
    const sh = document.documentElement.scrollHeight - window.innerHeight;
    const p = sh > 0 ? (window.scrollY / sh) * 100 : 0;
    if (progressBar) progressBar.style.width = p + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ==========================================================
     5. REVEAL ON SCROLL
     ========================================================== */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').forEach(el => observer.observe(el));

  /* ==========================================================
     6. CUSTOM CURSOR + MAGNETIC EFFECT
     ========================================================== */
  const isPointerFine = window.matchMedia('(pointer: fine)').matches;
  if (isPointerFine) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    function animateRing() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverables = document.querySelectorAll('a, button, .hoverable, input, textarea, .lang-btn');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Magnetic buttons
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });

    // Card 3D tilt + shine
    document.querySelectorAll('.card-3d').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const rotX = ((y - r.height / 2) / r.height) * -10;
        const rotY = ((x - r.width / 2) / r.width) * 10;
        card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
        card.style.setProperty('--mx', (x / r.width * 100) + '%');
        card.style.setProperty('--my', (y / r.height * 100) + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }

  /* ==========================================================
     7. THREE.JS — GOLDEN PARTICLES + LIGHT TRAILS
     ========================================================== */
  (function initThree() {
    if (!window.THREE) return;
    const container = document.getElementById('threeCanvasWrap');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ---- Golden particles (embers) ----
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.03 + 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      sizes[i] = Math.random() * 0.25 + 0.08;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Soft glowing circle texture
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 220, 130, 1)');
    grad.addColorStop(0.4, 'rgba(201, 168, 76, 0.6)');
    grad.addColorStop(1, 'rgba(201, 168, 76, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTex = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.6,
      map: particleTex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      color: 0xc9a84c
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ---- Floating geometric shapes (diamonds) ----
    const shapeGroup = new THREE.Group();
    const diamondGeo = new THREE.OctahedronGeometry(0.5, 0);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const diamonds = [];
    for (let i = 0; i < 18; i++) {
      const d = new THREE.Mesh(diamondGeo, diamondMat);
      d.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30 - 10
      );
      d.scale.setScalar(Math.random() * 1.5 + 0.5);
      d.userData.rotSpeed = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      };
      d.userData.floatPhase = Math.random() * Math.PI * 2;
      d.userData.baseY = d.position.y;
      diamonds.push(d);
      shapeGroup.add(d);
    }
    scene.add(shapeGroup);

    // ---- Light ribbon (torus) ----
    const torusGeo = new THREE.TorusGeometry(15, 0.05, 8, 120);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 2.5;
    torus.position.z = -15;
    scene.add(torus);

    const torus2 = new THREE.Mesh(torusGeo, torusMat.clone());
    torus2.rotation.x = -Math.PI / 2.5;
    torus2.rotation.z = Math.PI / 4;
    torus2.position.z = -20;
    torus2.scale.setScalar(1.3);
    scene.add(torus2);

    // ---- Mouse parallax ----
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    document.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ---- Scroll parallax ----
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Particles drift upward
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += velocities[i * 3];
        pos[i * 3 + 1] += velocities[i * 3 + 1];
        pos[i * 3 + 2] += velocities[i * 3 + 2];
        if (pos[i * 3 + 1] > 40) pos[i * 3 + 1] = -40;
        if (pos[i * 3] > 40) pos[i * 3] = -40;
        if (pos[i * 3] < -40) pos[i * 3] = 40;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      particles.rotation.y = t * 0.02;
      particles.position.x = mouseX * 2;
      particles.position.y = mouseY * 1.5;

      // Diamonds rotate + float
      diamonds.forEach((d, i) => {
        d.rotation.x += d.userData.rotSpeed.x;
        d.rotation.y += d.userData.rotSpeed.y;
        d.rotation.z += d.userData.rotSpeed.z;
        d.position.y = d.userData.baseY + Math.sin(t + d.userData.floatPhase) * 1.5;
      });
      shapeGroup.rotation.y = t * 0.05 + mouseX * 0.1;
      shapeGroup.rotation.x = mouseY * 0.1;

      // Torus slow rotation
      torus.rotation.z += 0.002;
      torus2.rotation.z -= 0.0015;

      // Camera parallax on scroll (gentle)
      const scrollFactor = Math.min(scrollY / 2000, 1);
      camera.position.z = 30 - scrollFactor * 10;
      camera.position.x = mouseX * 1.5;
      camera.position.y = mouseY * 1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  })();

  /* ==========================================================
     8. VIDEO BG PARALLAX (subtle)
     ========================================================== */
  const videoBg = document.getElementById('videoBg');
  if (videoBg) {
    videoBg.playbackRate = 0.8;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      videoBg.style.transform = `translate(-50%, calc(-50% + ${y * 0.25}px)) scale(1.1)`;
    }, { passive: true });
  }

  /* ==========================================================
     9. FORM HANDLING (mock submission)
     ========================================================== */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      const formType = form.dataset.form;
      const data = {};
      new FormData(form).forEach((v, k) => { data[k] = v; });

      // In production, send to backend / Telegram bot. For now, log & show success.
      console.log('[Legacy Imperial] Form submitted:', formType, data);

      // Optional: mailto fallback (opens user's email client)
      const subject = encodeURIComponent(
        formType === 'musicians'
          ? `Zgłoszenie muzyka: ${data.name || ''}`
          : `Propozycja współpracy: ${data.company || ''}`
      );
      const body = encodeURIComponent(
        Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')
      );
      // Uncomment to auto-open email:
      // window.location.href = `mailto:legacyimperialconcerts@gmail.com?subject=${subject}&body=${body}`;

      const lang = getStoredLang();
      const msg = (T[lang] && T[lang]['form.sent']) || 'Thank you! We will contact you soon.';
      if (status) {
        status.textContent = msg;
        status.classList.add('visible');
        setTimeout(() => {
          status.classList.remove('visible');
          form.reset();
        }, 4000);
      }
    });
  });

  /* ==========================================================
     10. SMOOTH ANCHOR SCROLL OFFSET (account for nav)
     ========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
