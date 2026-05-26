import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createIcons, Compass, Layers3, Play, ScanLine, SquarePlay, Waves } from "lucide";
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

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const makeWebhookUrl = "https://hook.eu1.make.com/2uutni4wmoy3ueemdp5sxpyo12adn1cs";
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

if (!prefersReducedMotion) {
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
} else {
  window.addEventListener("scroll", () => updateNav(), { passive: true });
}

updateNav();

const setupCursor = () => {
  const dot = document.getElementById("c-dot");
  const ring = document.getElementById("c-ring");
  const cross = document.getElementById("c-cross");
  if (!dot || !ring || !cross || window.matchMedia("(max-width: 900px)").matches) return;

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

  document.querySelectorAll("a, button, iframe, input, textarea").forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("hov"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("hov"));
  });
};

setupCursor();

const setupContactForm = () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("status");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    status.style.display = "block";
    status.textContent = "Envoi en cours...";
    status.dataset.state = "loading";
    submitButton.disabled = true;

    const payload = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    try {
      const response = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        status.textContent = "✅ Message envoyé ! Vérifiez votre boîte mail.";
        status.dataset.state = "success";
        event.target.reset();
      } else {
        status.textContent = "❌ Une erreur est survenue, réessayez.";
        status.dataset.state = "error";
      }
    } catch {
      status.textContent = "❌ Connexion impossible.";
      status.dataset.state = "error";
    } finally {
      submitButton.disabled = false;
    }
  });
};

setupContactForm();

const setupVideoScrollLayer = () => {
  document.querySelectorAll(".video-shell").forEach((shell) => {
    const iframe = shell.querySelector("[data-video-embed]");
    const playButton = shell.querySelector("[data-video-play]");
    if (!iframe || !playButton) return;

    playButton.addEventListener("click", () => {
      if (!shell.classList.contains("is-playing")) {
        iframe.removeAttribute("srcdoc");
        iframe.src = iframe.dataset.videoSrc || iframe.src;
        shell.classList.add("is-playing");
      }
    });
  });
};

setupVideoScrollLayer();

if (!prefersReducedMotion) {
  gsap.set(".rv", { opacity: 0, y: 44, clipPath: "inset(12% 0 0 0)" });
  gsap.set(".rv-sc", { opacity: 0, y: 52, scale: 0.96 });

  gsap
    .timeline({ defaults: { ease: "power4.out" } })
    .from(".brand, .nav-lnk, .nav-cta", { opacity: 0, y: -16, duration: 0.75, stagger: 0.04 })
    .from("#hero-grid", { opacity: 0, scale: 1.08, duration: 1.2 }, "-=.45")
    .from(".clip-line", { clipPath: "inset(100% 0 0 0)", y: 42, duration: 1.1 }, "-=.65")
    .from(".hero-subline", { opacity: 0, y: 26, duration: 0.85 }, "-=.5")
    .to(".hero .rv", { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.9, stagger: 0.08 }, "-=.55");

  gsap.to("#hero-ghost", {
    yPercent: 32,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.6,
    },
  });

  gsap.to("#hero-grid", {
    yPercent: 14,
    scale: 1.08,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 2.2,
    },
  });

  gsap.to("#glow-a", {
    yPercent: 24,
    xPercent: -5,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.3,
    },
  });

  gsap.to(".hero-media img", {
    yPercent: 12,
    scale: 1.15,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.7,
    },
  });

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

  gsap.fromTo(
    "#cta-ghost",
    { yPercent: 8 },
    {
      yPercent: -8,
      ease: "none",
      scrollTrigger: {
        trigger: "#cta",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.8,
      },
    },
  );

  ScrollTrigger.refresh();
} else {
  document.querySelectorAll(".rv, .rv-sc").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
    el.style.clipPath = "none";
  });
}
