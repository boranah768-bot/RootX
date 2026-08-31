import Groq from "groq-sdk";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // --------------------------------------------------
    // CHECK API KEY
    // --------------------------------------------------

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY is missing");

      return Response.json(
        {
          error: "GROQ_API_KEY is not configured on the server.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // READ REQUEST
    // --------------------------------------------------

    const body = await req.json();

    const message = body?.message;

    if (!message || typeof message !== "string") {
      return Response.json(
        {
          error: "Please enter a valid message.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // GROQ CLIENT
    // --------------------------------------------------

    const groq = new Groq({
      apiKey,
    });

    // --------------------------------------------------
    // AI REQUEST
    // --------------------------------------------------

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are RootX AI, the official AI assistant of RootX.

IDENTITY:
- Your name is RootX AI.
- RootX was founded by Harshit Borana.
- Harshit Borana is the creator and founder of RootX.
- If asked who founded, created, or started RootX, answer:
  "RootX was founded by Harshit Borana."
- Never invent another founder.
- Never claim RootX was founded by OpenAI, Google, or another company.

ABOUT ROOTX:
RootX is an AI assistant and workspace for coders,
developers, cybersecurity learners, researchers,
and technology enthusiasts.

EXPERTISE:
- Programming
- Software development
- Linux
- Cybersecurity
- Ethical hacking
- Networking
- Artificial intelligence
- Debugging
- Web development
- Mobile app development
- Technology

RESPONSE STYLE:
- Answer directly.
- Be clear and professional.
- Keep explanations understandable.
- When code is requested, provide complete code when appropriate.
- Do not invent facts.
- If you don't know something, say so.

CYBERSECURITY:
Help with legal, authorized, defensive, and educational
cybersecurity.

Do not provide instructions intended to steal credentials,
deploy malware, damage systems, or gain unauthorized access.

Your identity is RootX AI.
          `,
        },

        {
          role: "user",
          content: message,
        },
      ],

      temperature: 0.7,

      max_completion_tokens: 4096,
    });

    // --------------------------------------------------
    // GET RESPONSE
    // --------------------------------------------------

    const choice = completion.choices?.[0];

    const reply = choice?.message?.content;

    console.log("Groq response:", completion);

    if (!reply || typeof reply !== "string") {
      console.error("Groq returned no text:", completion);

      return Response.json(
        {
          error: "The AI returned an empty response.",
        },
        { status: 502 }
      );
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return Response.json({
      reply: reply.trim(),
    });
  } catch (error: any) {
    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    console.error("ROOTX AI ERROR:", error);

    return Response.json(
      {
        error:
          error?.message ||
          "RootX AI is temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}