const MODEL_URL = `${import.meta.env.BASE_URL}models/titanic.glb`;
const MAX_RENDER_DPR = 1;
const TARGET_FRAME_MS = 1000 / 28;
const VIDEO_ID_PLACEHOLDER = "REPLACE_WITH_VIDEO_ID";

const isSmallViewport = () => window.matchMedia("(max-width: 1024px)").matches;

const isConstrainedDevice = () => {
  const memory = navigator.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  return memory <= 4 && cores <= 4;
};

const canUseWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

export async function initTitanicExperience({ section, gsap, ScrollTrigger, reducedMotion = false }) {
  if (!section) return null;

  const canvas = section.querySelector("[data-titanic-canvas]");
  const videoId = section.dataset.titanicVideoId?.trim() ?? "";
  const hasVideoId = Boolean(videoId && videoId !== VIDEO_ID_PLACEHOLDER);
  const videoModal = section.querySelector("[data-titanic-video-modal]");
  const videoPanel = section.querySelector("[data-titanic-video-panel]");
  const videoFrame = section.querySelector("[data-titanic-video-frame]");
  const videoIframe = section.querySelector("[data-titanic-video-embed]");
  const videoPlay = section.querySelector("[data-titanic-video-play]");
  const videoPlaceholder = section.querySelector("[data-titanic-video-placeholder]");
  const inlineVideoFrame = section.querySelector("[data-titanic-inline-frame]");
  const inlineVideoIframe = section.querySelector("[data-titanic-inline-embed]");
  const inlineVideoPlay = section.querySelector("[data-titanic-inline-play]");
  const inlineVideoPlaceholder = section.querySelector("[data-titanic-inline-placeholder]");
  const videoTriggers = section.querySelectorAll("[data-titanic-video-trigger]");
  const videoClosers = section.querySelectorAll("[data-titanic-video-close]");
  const videoState = section.querySelector("[data-titanic-video-state]");
  let modalTimeline = null;
  let lastFocusedElement = null;
  const modalHome = videoModal?.parentNode ?? null;
  const modalNextSibling = videoModal?.nextSibling ?? null;

  const moveModalToViewport = () => {
    if (!videoModal || videoModal.parentElement === document.body) return;
    document.body.appendChild(videoModal);
  };

  const restoreModalHome = () => {
    if (!videoModal || !modalHome || videoModal.parentNode === modalHome) return;
    modalHome.insertBefore(videoModal, modalNextSibling);
  };

  section.classList.toggle("has-titanic-video", hasVideoId);
  section.classList.toggle("is-video-placeholder", !hasVideoId);
  if (videoState) {
    videoState.textContent = hasVideoId ? "ARCHIVE READY" : "VIDEO ID MISSING";
  }
  if (videoPlaceholder) {
    videoPlaceholder.textContent = hasVideoId
      ? "Voir l'archive du Titanic"
      : "ID video a renseigner";
  }
  if (inlineVideoPlaceholder) {
    inlineVideoPlaceholder.textContent = hasVideoId
      ? "Voir l'archive du Titanic"
      : "ID video a renseigner";
  }
  if (videoPlay) {
    videoPlay.disabled = !hasVideoId;
  }
  if (inlineVideoPlay) {
    inlineVideoPlay.disabled = !hasVideoId;
  }

  const getVideoSrc = (autoplay = false) => {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
    });
    if (autoplay) params.set("autoplay", "1");
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const resetVideo = () => {
    videoFrame?.classList.remove("is-playing");
    videoIframe?.removeAttribute("src");
    inlineVideoFrame?.classList.remove("is-playing");
    inlineVideoIframe?.removeAttribute("src");
  };

  const openVideo = () => {
    if (!videoModal || !videoPanel || section.classList.contains("is-video-modal-open")) return;

    resetVideo();
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    moveModalToViewport();
    videoModal.hidden = false;
    videoModal.removeAttribute("aria-hidden");
    section.classList.add("is-video-modal-open");
    document.body.classList.add("titanic-video-open");
    document.documentElement.classList.add("titanic-video-open");

    if (!gsap || reducedMotion) {
      videoPanel.focus?.({ preventScroll: true });
      return;
    }

    modalTimeline?.kill();
    gsap.killTweensOf([videoModal, videoPanel]);
    modalTimeline = gsap.timeline({ defaults: { overwrite: true } });
    modalTimeline
      .set(videoModal, { autoAlpha: 1, pointerEvents: "auto" }, 0)
      .fromTo(
        videoPanel,
        { opacity: 0, y: 28, scale: 0.975, filter: "blur(10px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.62, ease: "expo.out" },
        0.04,
      )
      .call(() => videoPanel.focus?.({ preventScroll: true }));
  };

  const closeVideo = () => {
    if (!videoModal || !section.classList.contains("is-video-modal-open")) return;

    modalTimeline?.kill();
    section.classList.remove("is-video-modal-open");
    videoModal.setAttribute("aria-hidden", "true");
    videoModal.hidden = true;
    document.body.classList.remove("titanic-video-open");
    document.documentElement.classList.remove("titanic-video-open");
    resetVideo();
    if (gsap) {
      gsap.set([videoModal, videoPanel].filter(Boolean), { clearProps: "all" });
    }
    restoreModalHome();
    lastFocusedElement?.focus?.({ preventScroll: true });
  };

  const playVideo = () => {
    if (!hasVideoId || !videoIframe || !videoFrame) return;

    videoIframe.src = getVideoSrc(true);
    videoFrame.classList.add("is-playing");
  };

  const playInlineVideo = () => {
    if (!hasVideoId || !inlineVideoIframe || !inlineVideoFrame) return;

    inlineVideoIframe.src = getVideoSrc(true);
    inlineVideoFrame.classList.add("is-playing");
  };

  const onKeydown = (event) => {
    if (event.key === "Escape") {
      closeVideo();
      return;
    }

    if (event.key !== "Tab" || !videoModal || videoModal.hidden) return;

    const focusable = Array.from(
      videoModal.querySelectorAll(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");

    if (!focusable.length) {
      event.preventDefault();
      videoPanel?.focus?.({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  videoTriggers.forEach((trigger) => trigger.addEventListener("click", openVideo));
  videoClosers.forEach((closer) => closer.addEventListener("click", closeVideo));
  videoPlay?.addEventListener("click", playVideo);
  inlineVideoPlay?.addEventListener("click", playInlineVideo);
  document.addEventListener("keydown", onKeydown);

  const destroyVideoControls = () => {
    modalTimeline?.kill();
    videoTriggers.forEach((trigger) => trigger.removeEventListener("click", openVideo));
    videoClosers.forEach((closer) => closer.removeEventListener("click", closeVideo));
    videoPlay?.removeEventListener("click", playVideo);
    inlineVideoPlay?.removeEventListener("click", playInlineVideo);
    document.removeEventListener("keydown", onKeydown);
    document.body.classList.remove("titanic-video-open");
    document.documentElement.classList.remove("titanic-video-open");
    restoreModalHome();
  };

  if (!canvas || reducedMotion || isSmallViewport() || isConstrainedDevice() || !canUseWebGL()) {
    section.classList.add("is-fallback");
    return {
      destroy: destroyVideoControls,
    };
  }

  let THREE;
  let GLTFLoader;
  let MeshoptDecoder;

  try {
    THREE = await import("three");
    ({ GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js"));
    ({ MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js"));
  } catch {
    section.classList.add("is-fallback");
    return {
      destroy: destroyVideoControls,
    };
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_RENDER_DPR));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02080c, 0.085);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(0, 0.62, 9.4);

  const rig = new THREE.Group();
  scene.add(rig);

  const ambient = new THREE.AmbientLight(0x3f5e64, 0.9);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xb6ece9, 2.1);
  key.position.set(-3.5, 5, 4.5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x416f75, 0.9);
  fill.position.set(4, 1, -3);
  scene.add(fill);

  const terracotta = new THREE.PointLight(0xca8a24, 5.2, 18);
  terracotta.position.set(4, -1.5, 3);
  scene.add(terracotta);

  const particles = createParticleField(THREE);
  scene.add(particles);

  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const scrollState = { depth: 0 };
  const frameState = { modelScale: 1, cameraZ: 9.4, cameraY: 0.62, fov: 35 };

  let model = null;
  let modelBaseScale = 1;
  const modelBasePosition = new THREE.Vector3();
  let abyssMaterials = null;
  let hovered = false;
  let frameId = 0;
  let active = true;
  let destroyed = false;
  let lastFrameTime = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const aspect = width / height;

    frameState.fov = aspect < 1.18 ? 39 : aspect < 1.42 ? 37 : aspect > 1.72 ? 33 : 35;
    frameState.cameraZ = aspect < 1.18 ? 10.9 : aspect < 1.42 ? 10.35 : 9.65;
    frameState.cameraY = aspect < 1.18 ? 0.5 : 0.58;
    frameState.modelScale = aspect < 1.18 ? 0.82 : aspect < 1.42 ? 0.9 : 0.96;

    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.fov = frameState.fov;
    camera.updateProjectionMatrix();
  };

  const setHover = (value) => {
    if (hovered === value) return;
    hovered = value;
    section.classList.toggle("is-artifact-hover", value);

    if (abyssMaterials?.mesh) {
      abyssMaterials.mesh.color.setHex(value ? 0x769391 : 0x3d5c5b);
      abyssMaterials.mesh.emissive.setHex(value ? 0x4a310c : 0x020809);
      abyssMaterials.mesh.emissiveIntensity = value ? 0.22 : 0.12;
    }

    if (abyssMaterials?.line) {
      abyssMaterials.line.color.setHex(value ? 0xb4d6d1 : 0x8ca9a6);
    }
  };

  const updatePointer = (event) => {
    const rect = section.getBoundingClientRect();
    const localX = (event.clientX - rect.left) / rect.width;
    const localY = (event.clientY - rect.top) / rect.height;

    target.x = localX - 0.5;
    target.y = localY - 0.5;
    section.style.setProperty("--abyss-x", `${localX * 100}%`);
    section.style.setProperty("--abyss-y", `${localY * 100}%`);
    const inArtifactZone = localY > 0.43 && localY < 0.82 && Math.abs(localX - 0.5) < 0.42;
    setHover(inArtifactZone);
  };

  const onPointerMove = (event) => {
    updatePointer(event);
  };

  const onPointerLeave = () => {
    target.x = 0;
    target.y = 0;
    setHover(false);
  };

  const onClick = (event) => {
    if (event.target.closest("button, a, iframe, [data-titanic-video-modal]")) return;
    if (hovered) openVideo();
  };

  section.addEventListener("pointermove", onPointerMove, { passive: true });
  section.addEventListener("pointerleave", onPointerLeave);
  section.addEventListener("click", onClick);
  window.addEventListener("resize", resize);

  const resizeObserver = "ResizeObserver" in window
    ? new ResizeObserver(() => resize())
    : null;
  resizeObserver?.observe(section);
  resizeObserver?.observe(canvas);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  try {
    const gltf = await loader.loadAsync(MODEL_URL);
    model = gltf.scene;
    const prepared = prepareModel(THREE, model);
    modelBaseScale = prepared.scale;
    abyssMaterials = prepared.materials;
    modelBasePosition.copy(model.position);
    rig.add(model);
    section.classList.add("is-3d-ready");
  } catch {
    section.classList.add("is-fallback");
  }

  resize();

  let scrollTween = null;
  if (gsap && ScrollTrigger && !reducedMotion) {
    scrollTween = gsap.to(scrollState, {
      depth: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  }

  const clock = new THREE.Clock();

  const visibilityObserver = "IntersectionObserver" in window
    ? new IntersectionObserver(
        ([entry]) => {
          active = Boolean(entry?.isIntersecting) && !document.hidden;
          if (active && !frameId) {
            frameId = requestAnimationFrame(render);
          }
        },
        { rootMargin: "180px 0px" },
      )
    : null;

  const onVisibilityChange = () => {
    active = !document.hidden && section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < window.innerHeight;
    if (active && !frameId) {
      frameId = requestAnimationFrame(render);
    }
  };

  const render = (time = 0) => {
    frameId = active && !destroyed ? requestAnimationFrame(render) : 0;
    if (!active || destroyed || time - lastFrameTime < TARGET_FRAME_MS) return;
    lastFrameTime = time;

    const elapsed = clock.getElapsedTime();
    current.x += (target.x - current.x) * 0.045;
    current.y += (target.y - current.y) * 0.045;

    camera.position.x = current.x * 1.2;
    camera.position.y = frameState.cameraY - current.y * 0.62 - scrollState.depth * 0.62;
    camera.position.z = frameState.cameraZ - scrollState.depth * 1.18;
    camera.lookAt(0, 0.04, 0);

    particles.rotation.y = elapsed * 0.018;
    particles.position.y = -scrollState.depth * 1.8;

    if (model) {
      model.rotation.x = -0.08 + current.y * 0.05;
      model.rotation.y = -0.2 + current.x * 0.1 + Math.sin(elapsed * 0.35) * 0.018;
      model.rotation.z = Math.sin(elapsed * 0.22) * 0.015;
      model.position.x = modelBasePosition.x - 0.18 + current.x * 0.18;
      model.position.y = modelBasePosition.y - 0.1 - scrollState.depth * 0.38 + Math.sin(elapsed * 0.45) * 0.04;
      model.position.z = modelBasePosition.z;
      const hoverScale = frameState.modelScale + (hovered ? 0.018 : 0);
      model.scale.setScalar(modelBaseScale * hoverScale);
    }

    terracotta.intensity = hovered ? 4.8 : 3.8;
    terracotta.position.x = 4 + current.x * 3;
    terracotta.position.y = -1.5 - current.y * 2;

    renderer.render(scene, camera);
  };

  visibilityObserver?.observe(section);
  document.addEventListener("visibilitychange", onVisibilityChange);
  frameId = requestAnimationFrame(render);

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frameId);
      scrollTween?.scrollTrigger?.kill();
      scrollTween?.kill();
      destroyVideoControls();
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      section.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver?.disconnect();
      renderer.dispose();
    },
  };
}

function prepareModel(THREE, model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const scale = 7.15 / maxAxis;
  model.scale.setScalar(scale);
  model.position.sub(center.multiplyScalar(scale));
  model.position.y -= 0.2;

  const materials = {
    mesh: new THREE.MeshLambertMaterial({
      color: 0x3d5c5b,
      emissive: 0x020809,
      emissiveIntensity: 0.12,
      fog: true,
    }),
    line: new THREE.LineBasicMaterial({
      color: 0x8ca9a6,
      fog: true,
    }),
  };

  model.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = true;
      child.material = materials.mesh;
      return;
    }

    if (child.isLine || child.isLineSegments) {
      child.frustumCulled = true;
      child.material = materials.line;
    }
  });

  return { scale, materials };
}

function createParticleField(THREE) {
  const count = 220;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xb9d8d1,
    size: 0.018,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}
