"use client";

import { useEffect, useRef } from "react";

const motionTargets = "[data-motion-reveal], [data-motion-plate]";
const dustPalette = [
  [231, 188, 104],
  [105, 168, 255],
  [255, 250, 240],
] as const;

type DustParticle = {
  seed: number;
  size: number;
  sourceColor: [number, number, number];
  swirl: number;
  targetColor: [number, number, number];
  u: number;
  v: number;
};

type DustScene = {
  baseOpacity: number;
  baseTargetOpacity: number;
  columns: number;
  image: HTMLImageElement;
  particles: DustParticle[];
  rows: number;
  target: HTMLElement;
  targetImage: HTMLImageElement;
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
  const targetImageKey = image.dataset.dustNextImage;
  const target = targetPage
    ? root.querySelector<HTMLElement>(`[data-page="${targetPage}"]`)
    : null;
  const targetImage = targetImageKey
    ? Array.from(
        root.querySelectorAll<HTMLImageElement>("img[data-dust-target]"),
      ).find((candidate) => candidate.dataset.dustTarget === targetImageKey) ??
      null
    : null;

  if (
    !target ||
    !targetImage ||
    image.naturalWidth === 0 ||
    image.naturalHeight === 0 ||
    targetImage.naturalWidth === 0 ||
    targetImage.naturalHeight === 0
  ) {
    return null;
  }

  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  const lowPower =
    navigator.hardwareConcurrency <= 4 ||
    (navigatorWithMemory.deviceMemory ?? 8) <= 4;
  const mobile = window.innerWidth <= 680;
  const columns = lowPower ? 22 : mobile ? 27 : 35;
  const sourceAspect = image.naturalHeight / image.naturalWidth;
  const sourceRows = Math.max(20, Math.round(columns * sourceAspect));
  const targetAspect = targetImage.naturalHeight / targetImage.naturalWidth;
  const rows = Math.max(20, Math.round(columns * targetAspect));
  const sourceCanvas = document.createElement("canvas");
  const targetCanvas = document.createElement("canvas");
  sourceCanvas.width = columns;
  sourceCanvas.height = sourceRows;
  targetCanvas.width = columns;
  targetCanvas.height = rows;
  const sourceContext = sourceCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  const targetContext = targetCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!sourceContext || !targetContext) {
    return null;
  }

  try {
    drawImageCover(sourceContext, image, columns, sourceRows);
    drawImageCover(targetContext, targetImage, columns, rows);
    const sourcePixels = sourceContext.getImageData(
      0,
      0,
      columns,
      sourceRows,
    ).data;
    const targetPixels = targetContext.getImageData(0, 0, columns, rows).data;
    const particles: DustParticle[] = [];

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const u = (x + 0.5) / columns;
        const v = (y + 0.5) / rows;
        const sourceY = Math.min(
          sourceRows - 1,
          Math.floor(v * sourceRows),
        );
        const sourcePixelIndex = (sourceY * columns + x) * 4;
        const targetPixelIndex = (y * columns + x) * 4;
        const sourceAlpha = sourcePixels[sourcePixelIndex + 3];
        const targetAlpha = targetPixels[targetPixelIndex + 3];

        if (sourceAlpha < 22 && targetAlpha < 22) {
          continue;
        }

        const index = y * columns + x;
        const seed = seededRandom(index + sourceIndex * 2003 + 1);
        const palette = dustPalette[(index + sourceIndex) % dustPalette.length];
        const paletteAmount = index % 7 === 0 ? 0.72 : 0.18 + seed * 0.2;
        const sampledSource: [number, number, number] =
          sourceAlpha < 22
            ? [palette[0], palette[1], palette[2]]
            : [
                sourcePixels[sourcePixelIndex],
                sourcePixels[sourcePixelIndex + 1],
                sourcePixels[sourcePixelIndex + 2],
              ];
        const sampledTarget: [number, number, number] = [
          targetPixels[targetPixelIndex],
          targetPixels[targetPixelIndex + 1],
          targetPixels[targetPixelIndex + 2],
        ];

        particles.push({
          seed,
          size: 0.8 + seededRandom(index + sourceIndex * 5003 + 71) * 2.2,
          sourceColor: mixColor(sampledSource, palette, paletteAmount),
          swirl: seededRandom(index + sourceIndex * 6007 + 97) * 2 - 1,
          targetColor: mixColor(sampledTarget, palette, 0.03 + seed * 0.05),
          u,
          v,
        });
      }
    }

    return {
      baseOpacity: Number.parseFloat(getComputedStyle(image).opacity) || 1,
      baseTargetOpacity:
        Number.parseFloat(getComputedStyle(targetImage).opacity) || 1,
      columns,
      image,
      particles,
      rows,
      target,
      targetImage,
    };
  } catch {
    return null;
  }
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
      const pageRect = scene.target.getBoundingClientRect();
      const targetRect = scene.targetImage.getBoundingClientRect();
      const startLine = viewportHeight * 0.96;
      const endLine = viewportHeight * (viewportWidth <= 680 ? 0.12 : 0.16);
      const targetOffset = Math.max(0, targetRect.top - pageRect.top);
      const morphDistance = Math.max(
        viewportHeight * 0.84,
        startLine - endLine + targetOffset,
      );

      return {
        progress: clamp((startLine - pageRect.top) / morphDistance),
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

    sceneFrames.forEach(({ progress, scene, sourceRect, targetRect }) => {
      const imageOpacity = 1 - smoothstep(0.012, 0.09, progress);
      const targetImageOpacity = smoothstep(0.76, 0.985, progress);
      scene.image.style.setProperty(
        "--dust-source-opacity",
        String(scene.baseOpacity * imageOpacity),
      );
      scene.targetImage.style.setProperty(
        "--dust-target-opacity",
        String(scene.baseTargetOpacity * targetImageOpacity),
      );
      scene.image.dataset.dustProgress = progress.toFixed(3);
      scene.targetImage.dataset.dustProgress = progress.toFixed(3);

      if (progress <= 0.002 || progress >= 0.998) {
        return;
      }

      activeScenes += 1;
      const canvasIn = smoothstep(0.012, 0.075, progress);
      const canvasOut = 1 - smoothstep(0.94, 1, progress);
      const travel = smoothstep(0.04, 0.95, progress);
      const sourceCellSize =
        Math.max(
          sourceRect.width / scene.columns,
          sourceRect.height / scene.rows,
        ) + 0.7;
      const targetCellSize =
        Math.max(
          targetRect.width / scene.columns,
          targetRect.height / scene.rows,
        ) + 0.45;

      scene.particles.forEach((particle) => {
        const startX = sourceRect.left + sourceRect.width * particle.u;
        const startY = sourceRect.top + sourceRect.height * particle.v;
        const targetX = targetRect.left + targetRect.width * particle.u;
        const targetY = targetRect.top + targetRect.height * particle.v;
        const arc = Math.sin(travel * Math.PI);
        const x =
          lerp(startX, targetX, travel) +
          arc * particle.swirl * Math.min(54, viewportWidth * 0.1);
        const y =
          lerp(startY, targetY, travel) -
          arc * (18 + particle.seed * 58) +
          Math.sin((particle.seed + travel) * Math.PI * 4) * arc * 4;
        const airborneSize = lerp(
          sourceCellSize,
          particle.size,
          smoothstep(0.08, 0.58, travel),
        );
        const size = lerp(
          airborneSize,
          targetCellSize * (0.92 + particle.seed * 0.16),
          smoothstep(0.62, 0.96, travel),
        );
        const colorProgress = smoothstep(0.38, 0.9, travel);
        const color: [number, number, number] = [
          Math.round(
            lerp(particle.sourceColor[0], particle.targetColor[0], colorProgress),
          ),
          Math.round(
            lerp(particle.sourceColor[1], particle.targetColor[1], colorProgress),
          ),
          Math.round(
            lerp(particle.sourceColor[2], particle.targetColor[2], colorProgress),
          ),
        ];
        const alpha = canvasIn * canvasOut * (0.72 + particle.seed * 0.28);

        if (
          x < -size * 2 ||
          x > viewportWidth + size * 2 ||
          y < -size * 2 ||
          y > viewportHeight + size * 2
        ) {
          return;
        }

        context.fillStyle = `rgb(${color[0]} ${color[1]} ${color[2]} / ${alpha})`;

        if (particle.seed > 0.82 && travel > 0.18 && travel < 0.72) {
          context.fillRect(
            x - size * (1.5 + travel * 2.5),
            y - size * 0.22,
            size * (2.2 + travel * 3.2),
            Math.max(0.65, size * 0.42),
          );
          return;
        }

        if (particle.seed > 0.58 && travel < 0.84) {
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
    });

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
    const sourceImages = Array.from(
      root.querySelectorAll<HTMLImageElement>("img[data-dust-source]"),
    );
    const targetImages = Array.from(
      root.querySelectorAll<HTMLImageElement>("img[data-dust-target]"),
    );
    const images = Array.from(new Set([...sourceImages, ...targetImages]));

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

    scenes = sourceImages
      .map((image, index) => createDustScene(root, image, index))
      .filter((scene): scene is DustScene => scene !== null);

    if (scenes.length === 0) {
      root.dataset.dust = "static";
      return;
    }

    scenes.forEach((scene) => {
      scene.targetImage.style.setProperty("--dust-target-opacity", "0");
    });
    root.dataset.dust = "ready";
    root.dataset.dustSources = String(scenes.length);
    root.dataset.journey = "ready";
    root.dataset.dustParticles = String(
      scenes.reduce((total, scene) => total + scene.particles.length, 0),
    );
    scenes.forEach((scene) => {
      scene.image.dataset.dustParticles = String(scene.particles.length);
      scene.targetImage.dataset.dustParticles = String(scene.particles.length);
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
      scene.targetImage.style.removeProperty("--dust-target-opacity");
      delete scene.image.dataset.dustProgress;
      delete scene.image.dataset.dustParticles;
      delete scene.targetImage.dataset.dustProgress;
      delete scene.targetImage.dataset.dustParticles;
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
