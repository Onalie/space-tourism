(() => {
  "use strict";

  const body = document.body;
  const menu = document.querySelector(".menu");
  const nav = document.querySelector(".nav");
  const header = document.querySelector(".header");
  const progress = document.querySelector(".scroll-progress span");
  const backTop = document.querySelector(".back-top");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      body.classList.toggle("menu-open", open);
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      body.classList.remove("menu-open");
      menu.setAttribute("aria-expanded", "false");
    }));
  }

  const revealTargets = [...document.querySelectorAll(".reveal, .mask")];
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("visible"));
  }

  // Creative feature: Atmospheric Flight Recorder.
  const recorder = document.querySelector(".flight-recorder");
  const steps = [...document.querySelectorAll(".flight-step")];
  const marker = document.querySelector(".flight-marker");
  const readoutIndex = document.querySelector("[data-flight-index]");
  const readoutValue = document.querySelector("[data-flight-value]");
  const readoutTitle = document.querySelector("[data-flight-title]");
  const readoutText = document.querySelector("[data-flight-text]");
  const flightVisual = document.querySelector(".flight-visual");

  const setFlightStep = (step) => {
    if (!step) return;
    steps.forEach(s => s.classList.toggle("active", s === step));
    const color = step.dataset.color || "#72dff5";
    flightVisual?.style.setProperty("--flight-accent", color);
    if (readoutIndex) readoutIndex.textContent = step.dataset.index || "";
    if (readoutValue) readoutValue.textContent = step.dataset.value || "";
    if (readoutTitle) readoutTitle.textContent = step.dataset.title || "";
    if (readoutText) readoutText.textContent = step.dataset.text || "";
  };

  if (steps.length && "IntersectionObserver" in window) {
    const stepIo = new IntersectionObserver(entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setFlightStep(visible.target);
    }, { threshold:[.25,.45,.65], rootMargin:"-20% 0px -35% 0px" });
    steps.forEach(step => stepIo.observe(step));
    setFlightStep(steps[0]);
  }

  const rails = [...document.querySelectorAll(".section-rail a")];

  function updateRail() {
    if (!rails.length) return;
    let active = rails[0];
    rails.forEach(a => {
      const section = document.querySelector(a.getAttribute("href"));
      if (section && section.getBoundingClientRect().top <= innerHeight * .45) active = a;
    });
    rails.forEach(a => a.classList.toggle("active", a === active));
  }

  let ticking = false;
  function updateScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;

    header?.classList.toggle("scrolled", y > 24);
    backTop?.classList.toggle("visible", y > 650);

    if (progress) {
      progress.style.width = (max > 0 ? Math.min(100, Math.max(0, y/max*100)) : 0) + "%";
    }

    if (recorder && marker && innerWidth > 900) {
      const rect = recorder.getBoundingClientRect();
      const total = recorder.offsetHeight - innerHeight;
      const passed = Math.min(total, Math.max(0, -rect.top));
      const pct = total > 0 ? passed / total : 0;
      const visualHeight = flightVisual ? flightVisual.clientHeight : innerHeight * .78;
      const top = 70 + pct * Math.max(0, visualHeight - 140);
      marker.style.top = top + "px";
    }

    if (!reduceMotion) {
      document.querySelectorAll(".hero-media img").forEach(img => {
        const section = img.closest(".hero, .topic-hero");
        if (!section) return;
        const r = section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const shift = Math.max(-18, Math.min(18, r.top * -0.035));
        img.style.transform = `translate3d(0, ${shift}px, 0) scale(1.035)`;
      });
    }

    updateRail();
    ticking = false;
  }

  addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive:true });

  backTop?.addEventListener("click", () => {
    scrollTo({ top:0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  updateScroll();
})();
