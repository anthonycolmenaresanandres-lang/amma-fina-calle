export type FreeToolName = "rembg" | "ImageMagick" | "SAM 2" | "Upscayl" | "FFmpeg";

export type FreeToolRegistryEntry = {
  name: FreeToolName;
  purpose: string;
  installCheckCommand: string;
  safeUses: string[];
  forbiddenUses: string[];
  fallbackAction: string;
  requiredForFirstPass: boolean;
};

export const FREE_TOOLS_REGISTRY: FreeToolRegistryEntry[] = [
  {
    name: "rembg",
    purpose: "Background removal and subject cutout for owner, product, and object isolation.",
    installCheckCommand: "where rembg",
    safeUses: [
      "Draft owner cutouts",
      "Draft product cutouts",
      "Simple foreground/background separation",
      "Local cleanup before paid image tooling",
    ],
    forbiddenUses: [
      "Changing facial features",
      "Inventing missing subject details",
      "Treating poor cutout edges as final",
      "Replacing human approval",
    ],
    fallbackAction: "Mark cutout as needs-manual/API-cleanup and stop that operation.",
    requiredForFirstPass: false,
  },
  {
    name: "ImageMagick",
    purpose: "Crop, resize, convert, batch export, transparent PNG/WebP generation, and normalized asset export.",
    installCheckCommand: "magick -version",
    safeUses: [
      "9:16 exports",
      "4:5 exports",
      "1:1 exports",
      "PNG/WebP conversion",
      "Batch resize",
      "Safe transparent canvas and padding",
    ],
    forbiddenUses: [
      "Recreating logos",
      "Recreating QR codes",
      "Baking in unapproved CTA or menu text",
      "Destructive edits without source preservation",
    ],
    fallbackAction: "Use an already-available local tool such as Pillow if approved, otherwise mark export as blocked: ImageMagick missing.",
    requiredForFirstPass: false,
  },
  {
    name: "SAM 2",
    purpose: "Advanced segmentation for difficult owner, product, plant, glassware, pastry, and environment boundaries.",
    installCheckCommand: "python -c \"import sam2; print('sam2 available')\"",
    safeUses: [
      "Complex subject segmentation",
      "Hair or hands boundary support",
      "Product isolation when rembg fails",
      "Environment object masking for cleanup planning",
    ],
    forbiddenUses: [
      "Final owner identity approval",
      "Inventing missing visual details",
      "Replacing official source references",
      "Generating logos, QR codes, or text",
    ],
    fallbackAction: "Mark segmentation as needs-manual/API-cleanup and continue with crop-only references when safe.",
    requiredForFirstPass: false,
  },
  {
    name: "Upscayl",
    purpose: "Free AI upscaling for low-resolution seller/client assets before mockup or video reference use.",
    installCheckCommand: "where upscayl",
    safeUses: [
      "Low-resolution product upscaling",
      "Low-resolution environment upscaling",
      "Internal-preview enhancement",
      "Preparing weak but useful references for review",
    ],
    forbiddenUses: [
      "Changing owner identity",
      "Treating hallucinated detail as verified source truth",
      "Upscaling QR codes for final use without scan-testing",
      "Replacing request for better official source assets",
    ],
    fallbackAction: "Mark asset as low-resolution and request better source or keep as internal reference only.",
    requiredForFirstPass: false,
  },
  {
    name: "FFmpeg",
    purpose: "Video trimming, frame extraction, compression, format conversion, and future video assembly prep.",
    installCheckCommand: "ffmpeg -version",
    safeUses: [
      "Frame extraction from seller-provided video",
      "Review clip trimming",
      "Local compression",
      "Format conversion for future video passes",
    ],
    forbiddenUses: [
      "Publishing",
      "Final video generation without approval",
      "Baking unapproved legal, CTA, menu, or pricing text into video",
      "Provider upload or paid API execution",
    ],
    fallbackAction: "Mark video processing as blocked and request stills or approved video tooling.",
    requiredForFirstPass: false,
  },
];

export function getFreeToolByName(name: FreeToolName): FreeToolRegistryEntry | undefined {
  return FREE_TOOLS_REGISTRY.find((tool) => tool.name === name);
}

export function listInstallCheckCommands(): Array<{ name: FreeToolName; installCheckCommand: string }> {
  return FREE_TOOLS_REGISTRY.map((tool) => ({
    name: tool.name,
    installCheckCommand: tool.installCheckCommand,
  }));
}
