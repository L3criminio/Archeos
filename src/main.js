import {
  createIcons,
  Compass,
  Layers3,
  Play,
  ScanLine,
  SquarePlay,
  Waves,
} from "lucide";
import "./styles.css";

createIcons({
  icons: {
    Compass,
    Layers3,
    Play,
    ScanLine,
    SquarePlay,
    Waves,
  },
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCompactViewport = window.matchMedia("(max-width: 900px)").matches;
const nav = document.getElementById("nav");

const updateNav = (scroll = window.scrollY) => {
  nav?.classList.toggle("scrolled", scroll > 55);
};

const updateClock = () => {
  const timeEl = document.getElementById("hero-time");
  if (!timeEl) return;

  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2, "0");
  const m = String(now.getUTCMinutes()).padStart(2, "0");
  const s = String(now.getUTCSeconds()).padStart(2, "0");
  timeEl.textContent = `${h}:${m}:${s} UTC`;
};

updateClock();
setInterval(updateClock, 1000);

let lenis;
let nativeScrollBound = false;

const setupNativeScroll = () => {
  if (nativeScrollBound) return;
  nativeScrollBound = true;
  window.addEventListener("scroll", () => updateNav(), { passive: true });
};

const setupSmoothScroll = (Lenis, gsap, ScrollTrigger) => {
  lenis = new Lenis({
    duration: 1.22,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.45,
  });

  lenis.on("scroll", ({ scroll }) => {
    ScrollTrigger.update();
    updateNav(scroll);
  });

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
};

updateNav();

const setupCursor = () => {
  const dot = document.getElementById("c-dot");
  const ring = document.getElementById("c-ring");
  const cross = document.getElementById("c-cross");
  if (!dot || !ring || !cross || isCompactViewport) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let cx = mx;
  let cy = my;

  document.addEventListener(
    "mousemove",
    (event) => {
      mx = event.clientX;
      my = event.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    },
    { passive: true },
  );

  const animate = () => {
    rx += (mx - rx) * 0.09;
    ry += (my - ry) * 0.09;
    cx += (mx - cx) * 0.055;
    cy += (my - cy) * 0.055;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    cross.style.left = `${cx}px`;
    cross.style.top = `${cy}px`;
    requestAnimationFrame(animate);
  };

  animate();

  document.querySelectorAll("a, button, iframe, input, label, summary").forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("hov"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("hov"));
  });

  let cursorOffDepth = 0;
  document
    .querySelectorAll(
      "[data-titanic-experience], .latest-video-shell, .short-video-shell",
    )
    .forEach((zone) => {
      zone.addEventListener("pointerenter", () => {
        cursorOffDepth += 1;
        document.body.classList.add("cursor-off");
        document.body.classList.remove("hov");
      });

      zone.addEventListener("pointerleave", () => {
        cursorOffDepth = Math.max(0, cursorOffDepth - 1);
        if (cursorOffDepth === 0) {
          document.body.classList.remove("cursor-off");
        }
      });
    });
};

setupCursor();

const setupVideoScrollLayer = () => {
  const playEmbeddedVideo = (shell, iframe) => {
    if (!iframe) return;

    const currentSrc = iframe.dataset.videoSrc || iframe.src;
    if (!currentSrc) return;

    const separator = currentSrc.includes("?") ? "&" : "?";
    iframe.src = currentSrc.includes("autoplay=1")
      ? currentSrc
      : `${currentSrc}${separator}autoplay=1`;
    shell.classList.add("is-playing");
  };

  document.querySelectorAll(".latest-video-shell").forEach((shell) => {
    const playButton = shell.querySelector("[data-latest-video-play]");
    const iframe = shell.querySelector("[data-latest-video-embed]");
    if (!playButton) return;

    playButton.addEventListener("click", () => {
      playEmbeddedVideo(shell, iframe);
    });
  });

  document.querySelectorAll(".short-video-shell").forEach((shell) => {
    const playButton = shell.querySelector("[data-short-video-play]");
    const iframe = shell.querySelector("[data-short-video-embed]");
    if (!playButton) return;

    playButton.addEventListener("click", () => {
      playEmbeddedVideo(shell, iframe);
    });
  });

};

setupVideoScrollLayer();

const setupGalleryCarousel = () => {
  const carousel = document.querySelector("[data-gallery-carousel]");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-gallery-slide]"));

  slides.forEach((slide) => {
    const image = slide.querySelector("img");
    if (!image) return;

    const markMissing = () => {
      slide.classList.add("is-missing");
      image.hidden = true;
      image.setAttribute("aria-hidden", "true");
    };

    image.addEventListener("error", markMissing, { once: true });
    if (image.complete && image.naturalWidth === 0) markMissing();
  });
};

setupGalleryCarousel();

const setupTitanicExperienceLoader = ({ gsap = null, ScrollTrigger = null } = {}) => {
  const section = document.querySelector("[data-titanic-experience]");
  if (!section) return;

  let loaded = false;
  const loadExperience = async () => {
    if (loaded) return;
    loaded = true;

    try {
      const { initTitanicExperience } = await import("./titanicExperience.js");
      await initTitanicExperience({
        section,
        gsap,
        ScrollTrigger,
        reducedMotion: prefersReducedMotion || isCompactViewport,
      });
      ScrollTrigger?.refresh?.();
    } catch {
      section.classList.add("is-fallback");
    }
  };

  if (!("IntersectionObserver" in window)) {
    loadExperience();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadExperience();
    },
    { rootMargin: "650px 0px" },
  );

  observer.observe(section);
};

const setupDepthParallax = (gsap) => {
  if (isCompactViewport || !gsap) return;

  document.querySelectorAll("[data-parallax]").forEach((el) => {
    const depth = Number.parseFloat(el.dataset.depth || "8");
    const axis = el.dataset.axis || "y";
    const rotate = Number.parseFloat(el.dataset.rotate || "0");
    const trigger = el.closest(".scene") || el;
    const fromVars = { ease: "none" };
    const toVars = {
      ease: "none",
      scrollTrigger: {
        trigger,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.35,
      },
    };

    if (axis === "x" || axis === "both") {
      fromVars["--parallax-x"] = `${(-depth * 0.18).toFixed(2)}%`;
      toVars["--parallax-x"] = `${(depth * 0.18).toFixed(2)}%`;
    }

    if (axis === "y" || axis === "both") {
      fromVars["--parallax-y"] = `${depth.toFixed(2)}%`;
      toVars["--parallax-y"] = `${(-depth).toFixed(2)}%`;
    }

    if (rotate) {
      fromVars["--parallax-rotate"] = `${-rotate}deg`;
      toVars["--parallax-rotate"] = `${rotate}deg`;
    }

    gsap.fromTo(el, fromVars, toVars);
  });
};

const setupInteractiveTilt = (gsap) => {
  if (isCompactViewport || !gsap) return;

  document.querySelectorAll(".tilt-surface").forEach((surface) => {
    const tiltX = gsap.quickTo(surface, "--tilt-x", { duration: 0.45, ease: "power3.out" });
    const tiltY = gsap.quickTo(surface, "--tilt-y", { duration: 0.45, ease: "power3.out" });

    surface.addEventListener(
      "mousemove",
      (event) => {
        const rect = surface.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        tiltX(`${(-y * 4).toFixed(2)}deg`);
        tiltY(`${(x * 5).toFixed(2)}deg`);
      },
      { passive: true },
    );

    surface.addEventListener("mouseleave", () => {
      tiltX("0deg");
      tiltY("0deg");
    });
  });
};

const setupPremiumSectionTransitions = (gsap) => {
  if (!gsap) return;

  gsap.fromTo(
    "#video .abyss-stage",
    { yPercent: -4, scale: 1.08, opacity: 0.62 },
    {
      yPercent: 0,
      scale: 1,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#video",
        start: "top bottom",
        end: "top 18%",
        scrub: 1.4,
      },
    },
  );

  gsap.fromTo(
    "#video .abyss-head",
    { yPercent: 8, opacity: 0.76 },
    {
      yPercent: -5,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#video",
        start: "top 85%",
        end: "center 45%",
        scrub: 1.2,
      },
    },
  );

  gsap.fromTo(
    "#cta .light-rays",
    { yPercent: 8, opacity: 0.32 },
    {
      yPercent: -8,
      opacity: 0.9,
      ease: "none",
      scrollTrigger: {
        trigger: "#cta",
        start: "top bottom",
        end: "center center",
        scrub: 1.6,
      },
    },
  );

  gsap.fromTo(
    "#cta .cta-inner",
    { y: 56, scale: 0.96 },
    {
      y: -16,
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#cta",
        start: "top 92%",
        end: "center 48%",
        scrub: 1.4,
      },
    },
  );
};

const showStaticContent = () => {
  document.querySelectorAll(".rv, .rv-sc").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
    el.style.clipPath = "none";
  });
};

const setupDesktopMotion = (gsap, ScrollTrigger) => {
  gsap.set(".rv", { opacity: 0, y: 44, clipPath: "inset(12% 0 0 0)" });
  gsap.set(".rv-sc", { opacity: 0, y: 52, scale: 0.96 });
  setupDepthParallax(gsap);
  setupInteractiveTilt(gsap);
  setupPremiumSectionTransitions(gsap);

  gsap
    .timeline({ defaults: { ease: "power4.out" } })
    .from(".brand, .nav-lnk, .nav-cta", { opacity: 0, y: -16, duration: 0.75, stagger: 0.04 })
    .from("#hero-grid", { opacity: 0, scale: 1.08, duration: 1.2 }, "-=.45")
    .from(".clip-line", { clipPath: "inset(100% 0 0 0)", y: 42, duration: 1.1 }, "-=.65")
    .from(".hero-subline", { opacity: 0, y: 26, duration: 0.85 }, "-=.5")
    .to(".hero .rv", { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.9, stagger: 0.08 }, "-=.55");

  const hero = document.getElementById("hero");
  const mouseLayer = document.getElementById("hero-mouse-layer");

  if (hero && mouseLayer) {
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    hero.addEventListener(
      "mousemove",
      (event) => {
        const rect = hero.getBoundingClientRect();
        tx = ((event.clientX - rect.left) / rect.width - 0.5) * 34;
        ty = ((event.clientY - rect.top) / rect.height - 0.5) * 20;
      },
      { passive: true },
    );

    const animateHeroMouse = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      mouseLayer.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(animateHeroMouse);
    };

    animateHeroMouse();
  }

  document.querySelectorAll(".rv:not(.hero .rv)").forEach((el) => {
    const delay = el.classList.contains("d3")
      ? 0.3
      : el.classList.contains("d2")
        ? 0.2
        : el.classList.contains("d1")
          ? 0.1
          : 0;

    gsap.to(el, {
      opacity: 1,
      y: 0,
      clipPath: "inset(0% 0 0 0)",
      duration: 1,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 86%",
        toggleActions: "play none none none",
      },
    });
  });

  document.querySelectorAll(".rv-sc").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    });
  });

  document.querySelectorAll(".stitle").forEach((title) => {
    gsap.from(title, {
      clipPath: "inset(100% 0 0 0)",
      y: 26,
      duration: 1.1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: title,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });

  document.querySelectorAll(".ghost-num, .artifact-ghost").forEach((el) => {
    if (el.matches("[data-parallax]")) return;
    gsap.fromTo(
      el,
      { yPercent: 5 },
      {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section"),
          start: "top bottom",
          end: "bottom top",
          scrub: 2.4,
        },
      },
    );
  });

  document.querySelectorAll(".fsh").forEach((shape, index) => {
    if (shape.matches("[data-parallax]")) return;
    gsap.to(shape, {
      y: -50 + index * 12,
      rotate: index % 2 ? -12 : 12,
      ease: "none",
      scrollTrigger: {
        trigger: shape.closest("section") || shape.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5 + index * 0.45,
      },
    });
  });

  gsap.fromTo(
    ".vframe",
    { scale: 0.94, rotateX: 4 },
    {
      scale: 1,
      rotateX: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "#video",
        start: "top 80%",
        end: "center 55%",
        scrub: 1.2,
      },
    },
  );

  document.querySelectorAll(".ai-m-inner").forEach((inner) => {
    gsap.fromTo(
      inner,
      { yPercent: 7 },
      {
        yPercent: -7,
        ease: "none",
        scrollTrigger: {
          trigger: inner.closest(".artifact-media"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1.6,
        },
      },
    );
  });

  ScrollTrigger.refresh();
};

const initExperience = async () => {
  if (!prefersReducedMotion && !isCompactViewport) {
    try {
      const [{ default: Lenis }, gsapModule, scrollTriggerModule] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      const { gsap } = gsapModule;
      const { ScrollTrigger } = scrollTriggerModule;

      gsap.registerPlugin(ScrollTrigger);
      setupSmoothScroll(Lenis, gsap, ScrollTrigger);
      setupTitanicExperienceLoader({ gsap, ScrollTrigger });
      setupDesktopMotion(gsap, ScrollTrigger);
      return;
    } catch {
      setupNativeScroll();
    }
  } else {
    setupNativeScroll();
  }

  showStaticContent();
  setupTitanicExperienceLoader();
};

initExperience();
