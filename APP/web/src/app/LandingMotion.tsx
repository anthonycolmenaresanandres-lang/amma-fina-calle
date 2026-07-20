"use client";

import { useEffect, useRef } from "react";

const motionTargets = "[data-motion-reveal], [data-motion-plate]";
const dustPalette = [
  [231, 188, 104],
  [105, 168, 255],
  [255, 250, 240],
] as const;

type DustParticle = {
  color: [number, number, number];
  destination: number;
  endOffset: number;
  seed: number;
  size: number;
  swirl: number;
  u: number;
  v: number;
};

type DustScene = {
  baseOpacity: number;
  columns: number;
  image: HTMLImageElement;
  particles: DustParticle[];
  rows: number;
  target: HTMLElement;
  targetHeading: HTMLElement | null;
};

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const lerp = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function mixColor(
  sampled: [number, number, number],
  palette: readonly [number, number, number],
  amount: number,
): [number, number, number] {
  return [
    Math.round(lerp(sampled[0], palette[0], amount)),
    Math.round(lerp(sampled[1], palette[1], amount)),
    Math.round(lerp(sampled[2], palette[2], amount)),
  ];
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;

  if (imageRatio > targetRatio) {
    const sourceWidth = image.naturalHeight * targetRatio;
    const sourceX = (image.naturalWidth - sourceWidth) / 2;
    context.drawImage(
      image,
      sourceX,
      0,
      sourceWidth,
      image.naturalHeight,
      0,
      0,
      width,
      height,
    );
    return;
  }

  const sourceHeight = image.naturalWidth / targetRatio;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(
    image,
    0,
    sourceY,
    image.naturalWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
}

function createDustScene(
  root: HTMLElement,
  image: HTMLImageElement,
  sourceIndex: number,
): DustScene | null {
  const targetPage = image.dataset.dustNext;
  const target = targetPage
    ? root.querySelector<HTMLElement>(`[data-page="${targetPage}"]`)
    : null;

  if (!target || image.naturalWidth === 0 || image.naturalHeight === 0) {
    return null;
  }

  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  const lowPower =
    navigator.hardwareConcurrency <= 4 ||
    (navigatorWithMemory.deviceMemory ?? 8) <= 4;
  const mobile = window.innerWidth <= 680;
  const columns = lowPower ? 22 : mobile ? 27 : 35;
  const sourceAspect = image.naturalHeight / image.naturalWidth;
  const rows = Math.max(20, Math.round(columns * sourceAspect));
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = columns;
  sampleCanvas.height = rows;
  const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!sampleContext) {
    return null;
  }

  try {
    drawImageCover(sampleContext, image, columns, rows);
    const pixels = sampleContext.getImageData(0, 0, columns, rows).data;
    const particles: DustParticle[] = [];

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const pixelIndex = (y * columns + x) * 4;
        const alpha = pixels[pixelIndex + 3];

        if (alpha < 22) {
          continue;
        }

        const index = y * columns + x;
        const seed = seededRandom(index + sourceIndex * 2003 + 1);
        const sampled: [number, number, number] = [
          pixels[pixelIndex],
          pixels[pixelIndex + 1],
          pixels[pixelIndex + 2],
        ];
        const palette = dustPalette[(index + sourceIndex) % dustPalette.length];
        const paletteAmount = index % 7 === 0 ? 0.72 : 0.18 + seed * 0.2;

        particles.push({
          color: mixColor(sampled, palette, paletteAmount),
          destination: seededRandom(index + sourceIndex * 3011 + 19),
          endOffset: seededRandom(index + sourceIndex * 4001 + 37),
          seed,
          size: 0.8 + seededRandom(index + sourceIndex * 5003 + 71) * 2.2,
          swirl: seededRandom(index + sourceIndex * 6007 + 97) * 2 - 1,
          u: (x + 0.5) / columns,
          v: (y + 0.5) / rows,
        });
      }
    }

    return {
      baseOpacity: Number.parseFloat(getComputedStyle(image).opacity) || 1,
      columns,
      image,
      particles,
      rows,
      target,
      targetHeading: target.querySelector<HTMLElement>("h2"),
    };
  } catch {
    return null;
  }
}

function getTargetPoint(
  particle: DustParticle,
  targetRect: DOMRect,
  headingRect: DOMRect | null,
  viewportWidth: number,
  viewportHeight: number,
) {
  const inset = viewportWidth <= 680 ? 14 : 34;
  const left = inset;
  const right = viewportWidth - inset;
  const top = clamp(targetRect.top + inset, inset, viewportHeight - inset);
  const bottom = clamp(targetRect.bottom - inset, inset, viewportHeight - inset);

  if (particle.destination > 0.76 && headingRect) {
    return {
      x: clamp(
        headingRect.left + headingRect.width * particle.endOffset,
        inset,
        viewportWidth - inset,
      ),
      y: clamp(
        headingRect.top + headingRect.height * particle.seed,
        inset,
        viewportHeight - inset,
      ),
    };
  }

  const side = Math.floor((particle.destination / 0.76) * 4) % 4;

  if (side === 0) {
    return { x: lerp(left, right, particle.endOffset), y: top };
  }

  if (side === 1) {
    return { x: right, y: lerp(top, bottom, particle.endOffset) };
  }

  if (side === 2) {
    return { x: lerp(right, left, particle.endOffset), y: bottom };
  }

  return { x: left, y: lerp(bottom, top, particle.endOffset) };
}

function setupDust(root: HTMLElement, canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    root.dataset.dust = "static";
    return () => {
      delete root.dataset.dust;
    };
  }

  let animationFrame = 0;
  let drawCount = 0;
  let cancelled = false;
  let listening = false;
  let scenes: DustScene[] = [];
  let journeyStage = 0;
  let viewportHeight = window.innerHeight;
  let viewportWidth = window.innerWidth;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  const journeyPages = Array.from(
    root.querySelectorAll<HTMLElement>("[data-page]"),
  );
  const journeySteps = Array.from(
    root.querySelectorAll<HTMLElement>("[data-journey-rail] > span"),
  );

  const resize = () => {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(viewportWidth * pixelRatio);
    canvas.height = Math.round(viewportHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const draw = () => {
    animationFrame = 0;
    drawCount += 1;
    context.clearRect(0, 0, viewportWidth, viewportHeight);
    let activeScenes = 0;

    const sceneFrames = scenes.map((scene) => {
      const targetRect = scene.target.getBoundingClientRect();

      return {
        headingRect: scene.targetHeading?.getBoundingClientRect() ?? null,
        progress: clamp(
          (viewportHeight * 0.96 - targetRect.top) / (viewportHeight * 0.84),
        ),
        scene,
        sourceRect: scene.image.getBoundingClientRect(),
        targetRect,
      };
    });
    const journeyFrames = journeyPages.map((page) =>
      page.getBoundingClientRect(),
    );

    canvas.dataset.dustFrame = String(drawCount);

    const journeyLine = viewportHeight * 0.52;
    const nextJourneyStage = journeyFrames.reduce(
      (stage, rect, index) => (rect.top <= journeyLine ? index + 1 : stage),
      1,
    );

    if (nextJourneyStage !== journeyStage) {
      journeyStage = nextJourneyStage;
      root.dataset.journeyStage = String(journeyStage);
      journeySteps.forEach((step, index) => {
        step.dataset.journeyState =
          index + 1 < journeyStage
            ? "complete"
            : index + 1 === journeyStage
              ? "current"
              : "pending";
      });
    }

    sceneFrames.forEach(
      ({ headingRect, progress, scene, sourceRect, targetRect }) => {
        const imageOpacity = 1 - smoothstep(0.012, 0.09, progress);
        scene.image.style.setProperty(
          "--dust-source-opacity",
          String(scene.baseOpacity * imageOpacity),
        );
        scene.image.dataset.dustProgress = progress.toFixed(3);

        if (progress <= 0.002 || progress >= 0.998) {
          return;
        }

        activeScenes += 1;
        const canvasIn = smoothstep(0.012, 0.075, progress);
        const canvasOut = 1 - smoothstep(0.86, 1, progress);
        const travel = smoothstep(0.055, 0.93, progress);
        const sourceCellSize =
          Math.max(
            sourceRect.width / scene.columns,
            sourceRect.height / scene.rows,
          ) + 0.7;

        scene.particles.forEach((particle) => {
          const startX = sourceRect.left + sourceRect.width * particle.u;
          const startY = sourceRect.top + sourceRect.height * particle.v;
          const target = getTargetPoint(
            particle,
            targetRect,
            headingRect,
            viewportWidth,
            viewportHeight,
          );
          const arc = Math.sin(travel * Math.PI);
          const x =
            lerp(startX, target.x, travel) +
            arc * particle.swirl * Math.min(54, viewportWidth * 0.1);
          const y =
            lerp(startY, target.y, travel) -
            arc * (18 + particle.seed * 58) +
            Math.sin((particle.seed + travel) * Math.PI * 4) * arc * 4;
          const size = lerp(sourceCellSize, particle.size, travel);
          const alpha = canvasIn * canvasOut * (0.7 + particle.seed * 0.3);

          if (
            x < -size * 2 ||
            x > viewportWidth + size * 2 ||
            y < -size * 2 ||
            y > viewportHeight + size * 2
          ) {
            return;
          }

          context.fillStyle = `rgb(${particle.color[0]} ${particle.color[1]} ${particle.color[2]} / ${alpha})`;

          if (particle.seed > 0.82 && travel > 0.18) {
            context.fillRect(
              x - size * (1.5 + travel * 2.5),
              y - size * 0.22,
              size * (2.2 + travel * 3.2),
              Math.max(0.65, size * 0.42),
            );
            return;
          }

          if (particle.seed > 0.58) {
            const radius = size * 0.58;
            context.beginPath();
            context.moveTo(x, y - radius);
            context.lineTo(x + radius, y);
            context.lineTo(x, y + radius);
            context.lineTo(x - radius, y);
            context.closePath();
            context.fill();
            return;
          }

          context.fillRect(x - size / 2, y - size / 2, size, size);
        });
      },
    );

    canvas.dataset.dustActive = String(activeScenes);
  };

  const scheduleDraw = () => {
    if (animationFrame === 0) {
      animationFrame = window.requestAnimationFrame(draw);
    }
  };

  const handleResize = () => {
    resize();
    scheduleDraw();
  };

  const prepare = async () => {
    const images = Array.from(
      root.querySelectorAll<HTMLImageElement>("img[data-dust-source]"),
    );

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          });
        }

        try {
          await image.decode();
        } catch {
          // A complete image can reject decode after already reaching the renderer.
        }
      }),
    );

    if (cancelled) {
      return;
    }

    scenes = images
      .map((image, index) => createDustScene(root, image, index))
      .filter((scene): scene is DustScene => scene !== null);

    if (scenes.length === 0) {
      root.dataset.dust = "static";
      return;
    }

    root.dataset.dust = "ready";
    root.dataset.dustSources = String(scenes.length);
    root.dataset.journey = "ready";
    root.dataset.dustParticles = String(
      scenes.reduce((total, scene) => total + scene.particles.length, 0),
    );
    scenes.forEach((scene) => {
      scene.image.dataset.dustParticles = String(scene.particles.length);
    });
    resize();
    window.addEventListener("scroll", scheduleDraw, { passive: true });
    window.addEventListener("resize", handleResize);
    listening = true;
    scheduleDraw();
  };

  void prepare();

  return () => {
    cancelled = true;

    if (animationFrame !== 0) {
      window.cancelAnimationFrame(animationFrame);
    }

    if (listening) {
      window.removeEventListener("scroll", scheduleDraw);
      window.removeEventListener("resize", handleResize);
    }

    scenes.forEach((scene) => {
      scene.image.style.removeProperty("--dust-source-opacity");
      delete scene.image.dataset.dustProgress;
      delete scene.image.dataset.dustParticles;
    });
    delete root.dataset.dust;
    delete root.dataset.dustParticles;
    delete root.dataset.dustSources;
    delete root.dataset.journey;
    delete root.dataset.journeyStage;
    delete canvas.dataset.dustActive;
    delete canvas.dataset.dustFrame;
    journeySteps.forEach((step) => delete step.dataset.journeyState);
  };
}

type LandingMotionProps = {
  canvasClassName: string;
};

export function LandingMotion({ canvasClassName }: LandingMotionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-motion-root]");
    const canvas = canvasRef.current;

    if (!root || !canvas) {
      return;
    }

    const targets = Array.from(root.querySelectorAll<HTMLElement>(motionTargets));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      root.dataset.motion = "static";
      root.dataset.dust = "static";
      targets.forEach((target) => {
        target.dataset.motionState = "visible";
      });

      return () => {
        delete root.dataset.motion;
        delete root.dataset.dust;
        targets.forEach((target) => delete target.dataset.motionState);
      };
    }

    root.dataset.motion = "ready";
    const cleanupDust = setupDust(root, canvas);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          target.dataset.motionState = "visible";
          observer.unobserve(target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.14,
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      cleanupDust();
      delete root.dataset.motion;
      targets.forEach((target) => delete target.dataset.motionState);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={canvasClassName}
      data-dust-canvas
      aria-hidden="true"
    />
  );
}
