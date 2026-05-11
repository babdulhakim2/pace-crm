import { getSession } from "@/lib/auth/session";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

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

  const businessNames = (businesses || []).map((b: { name: string }) => b.name);

  const systemPrompt = `You are a sales visit extraction assistant. Extract structured visit data from a salesperson's notes.

Known businesses (use EXACT name if the text refers to one of these):
${businessList || "(none)"}

All business names for matching: ${businessNames.length > 0 ? JSON.stringify(businessNames) : "(none)"}

Service codes (use EXACT code):
${serviceList || "(none)"}

Outcome codes (use EXACT code):
${outcomeList || "(none)"}

Known areas (use EXACT name): ${areaList || "(none)"}

IMPORTANT RULES:
- For the "business" field: if the salesperson mentions a business that matches or closely resembles one from the known list, you MUST return the EXACT name from the list (e.g. if they say "went to Tony's" and "Tony's Barbers" is in the list, return "Tony's Barbers"). If no match, return the name as stated.
- For "svc" and "out" fields: ONLY use codes from the lists above. Never invent codes.
- For "area": match to a known area when possible.
- For "notes": summarize the key points from the text.
- For "followUp": extract any follow-up actions or next steps mentioned.`;

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
