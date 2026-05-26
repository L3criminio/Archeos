const MODEL_URL = `${import.meta.env.BASE_URL}models/titanic.glb`;
const MAX_RENDER_DPR = 1;
const TARGET_FRAME_MS = 1000 / 28;

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
  const trigger = section.querySelector("[data-artifact-trigger]");
  const capsule = section.querySelector("[data-analysis-capsule]");

  const openArchive = () => {
    section.classList.add("is-archive-open");
    capsule?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  };

  trigger?.addEventListener("click", openArchive);

  if (!canvas || reducedMotion || isSmallViewport() || isConstrainedDevice() || !canUseWebGL()) {
    section.classList.add("is-fallback");
    return { destroy: () => trigger?.removeEventListener("click", openArchive) };
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
    return { destroy: () => trigger?.removeEventListener("click", openArchive) };
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

  const terracotta = new THREE.PointLight(0x912810, 5.2, 18);
  terracotta.position.set(4, -1.5, 3);
  scene.add(terracotta);

  const particles = createParticleField(THREE);
  scene.add(particles);

  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const scrollState = { depth: 0 };

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
    const rect = section.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, Math.min(rect.height, window.innerHeight * 1.15));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const setHover = (value) => {
    if (hovered === value) return;
    hovered = value;
    section.classList.toggle("is-artifact-hover", value);

    if (abyssMaterials?.mesh) {
      abyssMaterials.mesh.color.setHex(value ? 0x769391 : 0x3d5c5b);
      abyssMaterials.mesh.emissive.setHex(value ? 0x42130d : 0x020809);
      abyssMaterials.mesh.emissiveIntensity = value ? 0.32 : 0.12;
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
    section.classList.add("is-pointer-inside");

    const inArtifactZone = localY > 0.42 && localY < 0.96 && Math.abs(localX - 0.5) < 0.48;
    setHover(inArtifactZone);
  };

  const onPointerMove = (event) => {
    updatePointer(event);
  };

  const onPointerLeave = () => {
    target.x = 0;
    target.y = 0;
    section.classList.remove("is-pointer-inside");
    setHover(false);
  };

  const onClick = (event) => {
    if (event.target.closest("button, a, iframe")) return;
    if (hovered) openArchive();
  };

  section.addEventListener("pointermove", onPointerMove, { passive: true });
  section.addEventListener("pointerleave", onPointerLeave);
  section.addEventListener("click", onClick);
  window.addEventListener("resize", resize);

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
    camera.position.y = 0.62 - current.y * 0.7 - scrollState.depth * 0.7;
    camera.position.z = 9.4 - scrollState.depth * 1.35;
    camera.lookAt(0, 0.04, 0);

    particles.rotation.y = elapsed * 0.018;
    particles.position.y = -scrollState.depth * 1.8;

    if (model) {
      model.rotation.x = -0.08 + current.y * 0.05;
      model.rotation.y = -0.34 + current.x * 0.16 + Math.sin(elapsed * 0.35) * 0.025;
      model.rotation.z = Math.sin(elapsed * 0.22) * 0.015;
      model.position.x = modelBasePosition.x + current.x * 0.25;
      model.position.y = modelBasePosition.y - 0.1 - scrollState.depth * 0.38 + Math.sin(elapsed * 0.45) * 0.04;
      model.position.z = modelBasePosition.z;
      model.scale.setScalar(modelBaseScale * (1 + (hovered ? 0.025 : 0)));
    }

    terracotta.intensity = hovered ? 6 : 3.8;
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
      trigger?.removeEventListener("click", openArchive);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      section.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
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
  const scale = 6.45 / maxAxis;
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
