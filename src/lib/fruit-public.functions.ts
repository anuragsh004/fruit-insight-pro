import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AnalysisResult } from "./scans.types";

const InputSchema = z.object({
  imageUrl: z.string().url().max(2048),
});

const SYSTEM_PROMPT = `You are an expert agricultural computer-vision model that analyzes a single fruit photo.
ONLY these fruits are supported: Mango, Banana, Apple, Orange, Guava.
Look carefully at color, surface texture, spots, bruises, mold, softening and skin condition.
Score everything 0-100 (higher = better for freshness/quality/ripeness, higher = worse for damage).
Highlights are bounding boxes (x, y, w, h all in 0..1 image-relative coordinates) of suspicious or notable regions.
Be honest: rotten fruit must be flagged as Rotten with low scores.`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "report_fruit_analysis",
    description: "Report the analysis of the fruit in the image",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        fruit_name: { type: "string" },
        is_supported: { type: "boolean" },
        fruit_confidence: { type: "number", minimum: 0, maximum: 100 },
        freshness_category: { type: "string", enum: ["Fresh", "Ripe", "Overripe", "Damaged", "Rotten"] },
        freshness_confidence: { type: "number", minimum: 0, maximum: 100 },
        freshness_score: { type: "number", minimum: 0, maximum: 100 },
        quality_score: { type: "number", minimum: 0, maximum: 100 },
        damage_score: { type: "number", minimum: 0, maximum: 100 },
        ripeness_score: { type: "number", minimum: 0, maximum: 100 },
        recommendation: { type: "string" },
        observations: { type: "array", items: { type: "string" }, minItems: 1 },
        highlights: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              x: { type: "number" },
              y: { type: "number" },
              w: { type: "number" },
              h: { type: "number" },
            },
            required: ["label", "x", "y", "w", "h"],
          },
        },
      },
      required: [
        "fruit_name",
        "is_supported",
        "fruit_confidence",
        "freshness_category",
        "freshness_confidence",
        "freshness_score",
        "quality_score",
        "damage_score",
        "ripeness_score",
        "recommendation",
        "observations",
        "highlights",
      ],
    },
  },
};

export const analyzeFruitPublic = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const imgRes = await fetch(data.imageUrl);
    if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
    const buf = await imgRes.arrayBuffer();
    const mime = imgRes.headers.get("content-type") ?? "image/jpeg";
    const b64 = Buffer.from(buf).toString("base64");
    const dataUrl = `data:${mime};base64,${b64}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this fruit image and call the report_fruit_analysis tool." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "report_fruit_analysis" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) throw new Error("Rate limit reached. Please wait and try again.");
      if (aiRes.status === 402) throw new Error("AI credits exhausted. Please top up in workspace settings.");
      const txt = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, txt);
      throw new Error("AI analysis failed.");
    }

    const payload = await aiRes.json();
    const call = payload?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!call) throw new Error("AI returned no structured result.");
    return JSON.parse(call) as AnalysisResult;
  });
