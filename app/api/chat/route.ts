import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `
You are RootX AI, the official AI assistant of RootX.

You are an expert in:
- Programming
- Software development
- Linux
- Cybersecurity
- Ethical hacking
- Networking
- Artificial intelligence
- Debugging
- Technology

Give clear, useful and professional answers.

For cybersecurity topics, help only with legal, authorized and educational activities. Do not provide instructions intended to harm systems, steal credentials, deploy malware, or gain unauthorized access.

When explaining code, provide clean and properly formatted code with a short explanation.

Your name is RootX AI.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "RootX AI could not generate a response.";

    return Response.json({
      reply,
    });
  } catch (error) {
    console.error("RootX AI Error:", error);

    return Response.json(
      {
        error: "RootX AI is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}