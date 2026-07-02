export type ScriptGenerationInput = {
  topic: string;
  targetAudience: string;
  videoLength: string;
  tone: string;
  platform: string;
};

export type GeneratedScript = {
  title: string;
  hook: string;
  script: string;
  cta: string;
  hashtags: string;
  coverText: string;
};

type ResponsesApiOutputText = {
  type?: string;
  text?: string;
};

type ResponsesApiOutputItem = {
  type?: string;
  content?: ResponsesApiOutputText[];
};

type ResponsesApiResponse = {
  output_text?: string;
  output?: ResponsesApiOutputItem[];
};

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MODEL = "gpt-4.1-mini";

const scriptSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    hook: { type: "string" },
    script: { type: "string" },
    cta: { type: "string" },
    hashtags: { type: "string" },
    coverText: { type: "string" }
  },
  required: ["title", "hook", "script", "cta", "hashtags", "coverText"]
};

export async function generateInsuranceScript(
  input: ScriptGenerationInput
): Promise<GeneratedScript> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        {
          role: "system",
          content:
            "You generate concise Traditional Chinese insurance video scripts for a personal DailyOS workspace. Return only structured JSON that follows the schema."
        },
        {
          role: "user",
          content: buildPrompt(input)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "insurance_video_script",
          schema: scriptSchema,
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as ResponsesApiResponse;
  const outputText = extractOutputText(data);

  if (!outputText) {
    throw new Error("OpenAI response did not include output text.");
  }

  return parseGeneratedScript(outputText);
}

function buildPrompt(input: ScriptGenerationInput) {
  return [
    "請根據以下欄位產生一支保險短影音腳本：",
    `保險主題：${input.topic}`,
    `目標客群：${input.targetAudience}`,
    `影片長度：${input.videoLength}`,
    `語氣風格：${input.tone}`,
    `發布平台：${input.platform}`,
    "請輸出繁體中文，內容要清楚、可信、適合保險專業人士日常使用。",
    "hashtags 請使用繁體中文或常見平台標籤，coverText 請短而有力。"
  ].join("\n");
}

function extractOutputText(data: ResponsesApiResponse) {
  if (data.output_text) {
    return data.output_text;
  }

  return data.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && content.text)?.text;
}

function parseGeneratedScript(outputText: string): GeneratedScript {
  const parsed = JSON.parse(outputText) as Partial<GeneratedScript>;

  if (
    typeof parsed.title !== "string" ||
    typeof parsed.hook !== "string" ||
    typeof parsed.script !== "string" ||
    typeof parsed.cta !== "string" ||
    typeof parsed.hashtags !== "string" ||
    typeof parsed.coverText !== "string"
  ) {
    throw new Error("OpenAI response did not match the expected script shape.");
  }

  return {
    title: parsed.title,
    hook: parsed.hook,
    script: parsed.script,
    cta: parsed.cta,
    hashtags: parsed.hashtags,
    coverText: parsed.coverText
  };
}
