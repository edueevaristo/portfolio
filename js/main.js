import Lenis from 'lenis';
import { initKnowledgeTree } from './knowledge-tree/index.js';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { SplitText } from 'gsap/SplitText';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, Flip, Observer, SplitText, MorphSVGPlugin, DrawSVGPlugin, CustomEase);
CustomEase.create('premium', 'M0,0 C0.16,1 0.3,1 1,1');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const lowPowerDevice = Boolean(
  connection?.saveData ||
  connection?.effectiveType === 'slow-2g' ||
  connection?.effectiveType === '2g' ||
  (navigator.deviceMemory && navigator.deviceMemory < 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4),
);
const shell = document.querySelector('.section-shell');
let lenis = null;
let menuIsOpen = false;

function initSmoothScroll() {
  // Native scrolling is lighter and more reliable on constrained devices.
  if (reduceMotion || lowPowerDevice) return;

  lenis = new Lenis({
    lerp: 0.085,
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1.15,
    wheelMultiplier: 0.92,
    anchors: { offset: 0 },
    stopInertiaOnNavigate: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function playLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return Promise.resolve();

  if (reduceMotion) {
    loader.remove();
    return Promise.resolve();
  }

  const counter = { value: 0 };
  return new Promise((resolve) => {
    gsap.timeline({
      defaults: { ease: 'premium' },
      onComplete: () => {
        loader.remove();
        resolve();
      },
    })
      .fromTo('.loader-mark path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.52 })
      .to(counter, {
        value: 100,
        duration: 0.52,
        ease: 'power2.out',
        onUpdate: () => {
          const node = document.querySelector('.loader-count');
          if (node) node.textContent = String(Math.round(counter.value)).padStart(3, '0');
        },
      }, '<')
      .to(loader, { yPercent: -102, duration: 0.58 }, '+=0.04');
  });
}

function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.menu-panel');
  const links = [...panel.querySelectorAll('nav a')];

  const background = [document.querySelector('main'), document.querySelector('.site-footer')];
  const destinations = links.map(link => document.querySelector(link.getAttribute('href')));
  let activeFrame = 0;
  function updateActive() {
    activeFrame = 0;
    const marker = Math.max(120, innerHeight * .28);
    let current = destinations[0];
    destinations.forEach(section => { if (section.getBoundingClientRect().top <= marker) current = section; });
    links.forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => { if (!activeFrame) activeFrame = requestAnimationFrame(updateActive); }, { passive: true });
  updateActive();

  function navigate(target) {
    const heading = target.querySelector('h1, h2') || target;
    const focus = () => { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); };
    history.pushState(null, '', `#${target.id}`);
    if (lenis) {
      focus(); lenis.scrollTo(target, { offset: 0, onComplete: focus });
      // Pinning can reparent a heading and release focus during the scroll.
      window.setTimeout(() => { if (!menuIsOpen && location.hash === `#${target.id}`) focus(); }, 1200);
    }
    else { target.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' }); focus(); }
  }

  function setMenu(open, target = null) {
    menuIsOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;
    background.forEach(element => { element.inert = open; });
    document.body.classList.toggle('menu-open', open);
    gsap.killTweensOf([panel, ...links]);
    if (open) {
      lenis?.stop();
      updateActive();
      gsap.set(panel, { autoAlpha: 1 });
      gsap.to(panel, { clipPath: 'inset(0% 0% 0% 0%)', duration: reduceMotion ? 0 : .45, ease: 'premium', onComplete: () => { if (menuIsOpen) links.find(link => link.hasAttribute('aria-current'))?.focus(); } });
      gsap.fromTo(links, { y: reduceMotion ? 0 : 20, opacity: 0 }, { y: 0, opacity: 1, duration: reduceMotion ? 0 : .4, stagger: reduceMotion ? 0 : .025 });
    } else {
      lenis?.start();
      toggle.focus({ preventScroll: true });
      gsap.to(panel, { clipPath: 'inset(0 0 100% 0)', duration: reduceMotion ? 0 : .3, ease: 'premium', onComplete: () => { gsap.set(panel, { autoAlpha: 0 }); if (target) navigate(target); } });
    }
  }

  toggle.addEventListener('click', () => setMenu(!menuIsOpen));
  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault(); event.stopPropagation();
    setMenu(false, document.querySelector(link.getAttribute('href')));
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuIsOpen) setMenu(false);
    if (event.key === 'Tab' && menuIsOpen) {
      const items = [toggle, ...panel.querySelectorAll('a[href]')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}

function initCursor() {
  if (!precisePointer || reduceMotion) return;
  const cursor = document.querySelector('.cursor');
  const label = cursor.querySelector('span');
  const setX = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3' });
  const setY = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3' });

  window.addEventListener('pointermove', (event) => {
    cursor.classList.add('is-active');
    setX(event.clientX);
    setY(event.clientY);
  }, { passive: true });

  document.querySelectorAll('[data-cursor]').forEach((element) => {
    element.addEventListener('pointerenter', () => {
      label.textContent = element.dataset.cursor;
      cursor.classList.add('is-view');
    });
    element.addEventListener('pointerleave', () => cursor.classList.remove('is-view'));
  });

  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      gsap.to(element, {
        x: (event.clientX - rect.left - rect.width / 2) * 0.16,
        y: (event.clientY - rect.top - rect.height / 2) * 0.16,
        duration: 0.45,
        ease: 'power3.out',
      });
    });
    element.addEventListener('pointerleave', () => gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, .35)' }));
  });
}

function initHeader() {
  const header = document.querySelector('[data-header]');
  const brand = document.querySelector('.brand');
  let morphed = false;

  brand.addEventListener('pointerenter', () => gsap.to('.brand-shape', { morphSVG: '#brand-shape-alt', duration: 0.55, ease: 'premium' }));
  brand.addEventListener('pointerleave', () => {
    if (!morphed) gsap.to('.brand-shape', { morphSVG: 'M5 5H37V13H14V18H33V25H14V29H37V37H5Z', duration: 0.55, ease: 'premium' });
  });

  ScrollTrigger.create({
    start: 80,
    end: 'max',
    onUpdate: (self) => {
      header.classList.toggle('is-scrolled', self.scroll() > 80);
      const nextMorph = self.scroll() > window.innerHeight * 0.75;
      if (nextMorph !== morphed) {
        morphed = nextMorph;
        gsap.to('.brand-shape', { morphSVG: morphed ? '#brand-shape-alt' : 'M5 5H37V13H14V18H33V25H14V29H37V37H5Z', duration: 0.65, ease: 'premium' });
      }
      // Keep navigation reachable while inspecting long sections and the 3D tree.
      gsap.set(header, { yPercent: 0 });
    },
  });
}

function initHeroMotion() {
  if (reduceMotion) return;
  const titleSplit = new SplitText('.hero-title-line', { type: 'words,chars', charsClass: 'hero-char', aria: 'none' });

  gsap.timeline({ defaults: { ease: 'premium' } })
    .from('.hero-kicker span', { yPercent: 120, duration: 0.7 })
    .from(titleSplit.chars, { yPercent: 115, rotate: 3, duration: 1.05, stagger: 0.018 }, '-=0.42')
    .from('.hero-bottom > *', { y: 30, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, '-=0.55')
    .from('.hero-index, .scroll-cue, .portrait-caption', { autoAlpha: 0, duration: 0.5 }, '-=0.3');

  gsap.to('.hero-copy', {
    yPercent: 18,
    opacity: 0.18,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

function initSectionMotion() {
  if (reduceMotion) return;

  document.querySelectorAll('.split-lines').forEach((element) => {
    const split = new SplitText(element, { type: 'lines', linesClass: 'line', aria: 'none' });
    gsap.from(split.lines, {
      yPercent: 115,
      rotate: 1.5,
      duration: 1,
      stagger: 0.09,
      ease: 'premium',
      scrollTrigger: { trigger: element, start: 'top 84%', once: true },
    });
  });

  gsap.utils.toArray('.image-reveal').forEach((frame) => {
    const image = frame.querySelector('img');
    gsap.fromTo(frame, { clipPath: 'inset(0 0 100% 0)' }, {
      clipPath: 'inset(0 0 0% 0)', duration: 1.25, ease: 'premium',
      scrollTrigger: { trigger: frame, start: 'top 86%', once: true },
    });
    if (image && !frame.matches('.portrait-frame, .project-media-contain')) gsap.from(image, { scale: 1.16, duration: 1.5, ease: 'premium', scrollTrigger: { trigger: frame, start: 'top 86%', once: true } });
  });

  ScrollTrigger.batch('.project-meta, .principles article, .timeline article', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.from(batch, { y: 45, autoAlpha: 0, stagger: 0.09, duration: 0.85, ease: 'premium' }),
  });

  document.querySelectorAll('.project-media:not(.project-media-contain)').forEach((media) => {
    gsap.to(media.querySelector('img'), {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

function initMarquee() {
  const tween = gsap.to('.marquee-track', { xPercent: -50, duration: 24, repeat: -1, ease: 'none' });
  if (reduceMotion) {
    tween.pause();
    return;
  }

  Observer.create({
    target: window,
    type: 'wheel,touch',
    tolerance: 20,
    onDown: () => gsap.to(tween, { timeScale: 1.7, duration: 0.35, overwrite: true }),
    onUp: () => gsap.to(tween, { timeScale: -1.7, duration: 0.35, overwrite: true }),
    onStop: () => gsap.to(tween, { timeScale: 1, duration: 0.8 }),
  });
}

function initProjectFilters() {
  const buttons = [...document.querySelectorAll('.filter-button')];
  const items = [...document.querySelectorAll('.project-list > .project, .project-secondary-grid')];

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('is-active')) return;
      const state = Flip.getState(items);
      const filter = button.dataset.filter;

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      items.forEach((item) => {
        const show = filter === 'all' || item.classList.contains('project-featured');
        item.classList.toggle('is-filtered', !show);
      });

      Flip.from(state, {
        duration: reduceMotion ? 0 : 0.85,
        ease: 'premium',
        absolute: true,
        prune: true,
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  });
}

function initCapabilities() {
  const rail = document.querySelector('.capability-rail');
  const cards = [...rail.children];

  cards.forEach((card) => {
    gsap.from(card.querySelector('.draw-path'), {
      drawSVG: '0%',
      duration: 1.15,
      ease: 'premium',
      scrollTrigger: { trigger: card, start: 'left 88%', containerAnimation: undefined, once: true },
    });
  });

  if (reduceMotion || window.innerWidth <= 680) return;
  const getDistance = () => Math.max(0, rail.scrollWidth - window.innerWidth + (window.innerWidth - shell.clientWidth) / 2);

  const horizontal = gsap.to(rail, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: '.capabilities-pin',
      start: 'top top',
      end: () => `+=${getDistance() * 1.35}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      snap: { snapTo: 1 / (cards.length - 1), duration: { min: 0.12, max: 0.32 }, delay: 0.06, ease: 'power1.inOut' },
    },
  });

  cards.forEach((card) => {
    const path = card.querySelector('.draw-path');
    ScrollTrigger.create({
      trigger: card,
      containerAnimation: horizontal,
      start: 'left 78%',
      onEnter: () => gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'premium' }),
    });
  });
}

function initContactMotion() {
  if (reduceMotion) return;
  gsap.to('.contact-orbit', {
    rotate: 160,
    scale: 1.18,
    ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
  });
}

function initForm() {
  const form = document.querySelector('#contact-form');
  const status = form.querySelector('.form-status');
  const button = form.querySelector('.submit-button');
  const buttonLabel = button.querySelector('span');
  const defaultButtonLabel = buttonLabel.textContent;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = [...form.querySelectorAll('[required]')];
    let firstInvalid = null;

    fields.forEach((field) => {
      const invalid = !field.checkValidity();
      field.closest('.field').classList.toggle('is-invalid', invalid);
      if (invalid && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      status.textContent = 'Revise os campos indicados antes de continuar.';
      status.className = 'form-status is-error';
      firstInvalid.focus();
      gsap.fromTo(form, { x: -6 }, { x: 6, repeat: 3, yoyo: true, duration: 0.07, clearProps: 'x' });
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      projectType: data.get('project-type'),
      message: data.get('message'),
      website: data.get('website'),
    };

    button.disabled = true;
    button.classList.add('is-loading');
    buttonLabel.textContent = 'Enviando';
    status.textContent = 'Enviando sua mensagem com segurança.';
    status.className = 'form-status';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || 'Não foi possível enviar a mensagem.');
      }

      form.reset();
      status.textContent = result.message;
      status.className = 'form-status is-success';
    } catch (error) {
      status.textContent = error.message || 'Não foi possível enviar agora. Tente novamente.';
      status.className = 'form-status is-error';
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
      buttonLabel.textContent = defaultButtonLabel;
    }
  });

  form.addEventListener('input', (event) => event.target.closest('.field')?.classList.remove('is-invalid'));
}

function initPageTransitions() {
  window.addEventListener('pageshow', () => gsap.set('.page-wipe', { scaleY: 0, transformOrigin: 'top' }));
  document.querySelectorAll('a[href]').forEach((link) => {
    const url = new URL(link.href, window.location.href);
    const isInternalPage = url.origin === window.location.origin && url.pathname !== window.location.pathname && !link.target;
    if (!isInternalPage) return;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      gsap.to('.page-wipe', { scaleY: 1, transformOrigin: 'bottom', duration: 0.65, ease: 'premium', onComplete: () => { window.location.href = link.href; } });
    });
  });
}

async function bootstrap() {
  initKnowledgeTree({ reduceMotion, lowPowerDevice });
  initSmoothScroll();
  initMenu();
  initCursor();
  initHeader();
  initProjectFilters();
  initMarquee();
  initForm();
  initPageTransitions();

  await playLoader();
  await document.fonts.ready;
  initHeroMotion();
  initSectionMotion();
  initCapabilities();
  initContactMotion();
  ScrollTrigger.refresh();
  const initialTarget = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (initialTarget) {
    if (lenis) lenis.scrollTo(initialTarget, { immediate: true });
    else initialTarget.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}

// A failed/slow enhancement must never leave the page covered by the loader.
window.setTimeout(() => document.querySelector('.loader')?.remove(), 2900);
bootstrap().catch(() => {
  document.querySelector('.loader')?.remove();
  document.documentElement.classList.add('motion-fallback');
});
