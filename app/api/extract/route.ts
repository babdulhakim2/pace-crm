import { getSession } from "@/lib/auth/session";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-preview";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 503 });
  }

  const { text, businesses, services, outcomes, areas } = await request.json();

  if (!text || typeof text !== "string") {
    return Response.json({ error: "Missing text" }, { status: 400 });
  }

  const businessList = (businesses || [])
    .map((b: { name: string; area: string; contact: string; role: string }) =>
      `- ${b.name} (${b.area}) — contact: ${b.contact}, role: ${b.role}`
    )
    .join("\n");

  const serviceList = Object.entries(services || {})
    .map(([code, info]: [string, unknown]) => `- ${code}: ${(info as { label: string }).label}`)
    .join("\n");

  const outcomeList = Object.entries(outcomes || {})
    .map(([code, info]: [string, unknown]) => `- ${code}: ${(info as { label: string }).label}`)
    .join("\n");

  const areaList = (areas || []).join(", ");

  const systemPrompt = `You are a sales visit extraction assistant. Extract structured visit data from a salesperson's notes.

Known businesses:
${businessList || "(none)"}

Service codes:
${serviceList || "(none)"}

Outcome codes:
${outcomeList || "(none)"}

Known areas: ${areaList || "(none)"}

Extract the visit details and call the log_visit function. Match businesses, services, outcomes, and areas to the known values when possible. If a service or outcome is mentioned but doesn't match a known code, use the closest match. For notes, summarize the key points from the text. For followUp, extract any follow-up actions mentioned.`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        tool_choice: { type: "function", function: { name: "log_visit" } },
        tools: [
          {
            type: "function",
            function: {
              name: "log_visit",
              description: "Log a structured sales visit extracted from the salesperson's notes",
              parameters: {
                type: "object",
                properties: {
                  business: {
                    type: "string",
                    description: "Business name",
                  },
                  area: {
                    type: "string",
                    description: "Geographic area",
                  },
                  contact: {
                    type: "string",
                    description: "Contact person name",
                  },
                  role: {
                    type: "string",
                    description: "Contact's role (e.g. Owner, Manager)",
                  },
                  notes: {
                    type: "string",
                    description: "Summary of key points from the visit",
                  },
                  followUp: {
                    type: "string",
                    description: "Follow-up actions or next steps",
                  },
                  items: {
                    type: "array",
                    description: "Services pitched and their outcomes",
                    items: {
                      type: "object",
                      properties: {
                        svc: {
                          type: "string",
                          description: "Service code",
                        },
                        out: {
                          type: "string",
                          description: "Outcome code",
                        },
                      },
                      required: ["svc", "out"],
                    },
                  },
                },
                required: ["business", "area", "contact", "role", "notes", "followUp", "items"],
              },
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[extract] OpenRouter error:", res.status, errBody);
      return Response.json({ error: "Extraction failed" }, { status: 500 });
    }

    const data = await res.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return Response.json(parsed);
    }

    return Response.json({ error: "No extraction produced" }, { status: 500 });
  } catch (e) {
    console.error("[extract] API error:", e);
    return Response.json({ error: "Extraction failed" }, { status: 500 });
  }
}
