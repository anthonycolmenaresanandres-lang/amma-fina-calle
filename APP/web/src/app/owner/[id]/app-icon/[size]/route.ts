import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { createElement } from "react";
import { isSafeRestaurantId } from "@/lib/owner/app-manifest";

const SUPPORTED_SIZES = new Set([192, 512]);

type RouteContext = {
  params: Promise<{ id: string; size: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id, size: rawSize } = await params;
  const size = Number(rawSize);
  if (!isSafeRestaurantId(id) || !SUPPORTED_SIZES.has(size)) notFound();

  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          alignItems: "center",
          background: "linear-gradient(145deg, #07131d 0%, #0d2538 62%, #123c5b 100%)",
          color: "#f4f6f7",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        },
      },
      createElement(
        "div",
        {
          style: {
            color: "#8ec5ff",
            fontSize: size * 0.38,
            fontWeight: 800,
            letterSpacing: "-0.08em",
            lineHeight: 1,
            marginLeft: "-0.08em",
          },
        },
        "FC",
      ),
      createElement(
        "div",
        {
          style: {
            color: "#d8b36d",
            fontSize: size * 0.085,
            fontWeight: 700,
            letterSpacing: "0.18em",
            marginTop: size * 0.06,
            textTransform: "uppercase",
          },
        },
        "OWNER",
      ),
    ),
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
