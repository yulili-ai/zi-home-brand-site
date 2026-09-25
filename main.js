(() => {
  document.documentElement.classList.add("js-booted");

  const frame = document.querySelector("#page-frame");
  const hero = document.querySelector(".hero");
  const image = document.querySelector(".hero__image");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateScale = () => {
    const scale = window.innerWidth / 1440;
    const heroHeight = Math.max(810, window.innerHeight / scale);
    frame.style.setProperty("--page-scale", String(scale));
    hero.style.setProperty("--hero-height", `${heroHeight}px`);
    document.body.style.height = `${frame.scrollHeight * scale}px`;
  };

  updateScale();
  window.addEventListener("resize", updateScale, { passive: true });
  new ResizeObserver(updateScale).observe(frame);

  const showHero = () => hero?.classList.add("has-entered");

  if (!image || image.complete || reducedMotion) window.requestAnimationFrame(() => window.requestAnimationFrame(showHero));
  else image?.addEventListener("load", showHero, { once: true });
  image?.addEventListener("error", showHero, { once: true });

  const letter = document.querySelector(".letter");
  if (letter && window.gsap && !reducedMotion && "IntersectionObserver" in window) {
    const revealTargets = letter.querySelectorAll(".letter__heading, .letter__body, .letter__signoff");
    const letterScene = letter.querySelector(".letter__scene");
    const letterSceneImage = letterScene?.querySelector("img");
    window.gsap.set(letterScene, { clipPath: "inset(0 0 100% 0)" });
    window.gsap.set(letterSceneImage, { scale: 1.15 });
    const revealLetterScene = () => {
      window.gsap.to(letterScene, { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "power2.out", clearProps: "clipPath" });
      window.gsap.to(letterSceneImage, { scale: 1, duration: 1.4, ease: "power2.out", clearProps: "transform" });
    };
    const letterObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      letterObserver.disconnect();
      window.gsap.fromTo(
        revealTargets,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power2.out", stagger: 0.15, clearProps: "all" }
      );
      if (letterSceneImage.complete) {
        if (letterSceneImage.naturalWidth) revealLetterScene();
        else window.gsap.set(letterScene, { clearProps: "clipPath" });
      } else {
        letterSceneImage.addEventListener("load", revealLetterScene, { once: true });
        letterSceneImage.addEventListener("error", () => window.gsap.set(letterScene, { clearProps: "clipPath" }), { once: true });
      }
    }, { threshold: 0.15 });
    letterObserver.observe(letter);
  }

  const systems = document.querySelector(".systems");
  const reserve = document.querySelector(".reserve");
  if (systems && window.gsap && window.ScrollTrigger && !reducedMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    const statement = systems.querySelector(".systems__statement h2");
    window.gsap.fromTo(statement, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 1.2, ease: "power2.out", clearProps: "all",
      scrollTrigger: { trigger: statement, start: "top 85%", once: true }
    });

    systems.querySelectorAll(".systems__figure").forEach((figure, index) => {
      window.gsap.fromTo(figure, { clipPath: "inset(0 0 100% 0)" }, {
        clipPath: "inset(0 0 0% 0)", duration: 1.1, delay: index * 0.08,
        ease: "power2.out", clearProps: "clipPath",
        scrollTrigger: { trigger: figure, start: "top 90%", once: true }
      });
    });

    window.addEventListener("resize", () => window.ScrollTrigger.refresh(), { passive: true });
    window.ScrollTrigger.refresh();
  }

  if (window.Lenis && !reducedMotion) {
    const lenis = new window.Lenis({ lerp: 0.09, autoRaf: true });
    if (window.ScrollTrigger) lenis.on("scroll", window.ScrollTrigger.update);
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          event.preventDefault();
          lenis.scrollTo(target);
        }
      });
    });
  }

  const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");

  if (pointer.matches && dot && ring) {
    document.body.classList.add("has-custom-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ringX = x;
    let ringY = y;

    const moveCursor = (event) => {
      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate3d(${x - 2.5}px, ${y - 2.5}px, 0)`;
    };

    const followCursor = () => {
      ringX += (x - ringX) * 0.12;
      ringY += (y - ringY) * 0.12;
      ring.style.transform = `translate3d(${ringX - 19}px, ${ringY - 19}px, 0)`;
      window.requestAnimationFrame(followCursor);
    };

    document.addEventListener("pointermove", moveCursor, { passive: true });
    window.requestAnimationFrame(followCursor);

    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("pointerenter", () => ring.classList.add("is-hovering"));
      link.addEventListener("pointerleave", () => ring.classList.remove("is-hovering"));
    });

    letter?.addEventListener("pointerenter", () => ring.classList.add("is-on-light"));
    letter?.addEventListener("pointerleave", () => ring.classList.remove("is-on-light"));
    systems?.addEventListener("pointerenter", () => ring.classList.add("is-on-light"));
    systems?.addEventListener("pointerleave", () => ring.classList.remove("is-on-light"));
    reserve?.addEventListener("pointerenter", () => ring.classList.add("is-on-light"));
    reserve?.addEventListener("pointerleave", () => ring.classList.remove("is-on-light"));
  }
})();
