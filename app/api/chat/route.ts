import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

const createRequestMessages = async (req: Request) => {
  const { messages, data } = await req.json();
  if (!data?.imageUrl) return messages;

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];
  return [
    ...initialMessages,
    {
      ...currentMessage,
      content: [
        { type: "text", text: currentMessage.content },
        {
          type: "image_url",
          image_url: data.imageUrl,
        },
      ],
    },
  ];
};

export async function POST(req: Request) {
  const inputMessages = await createRequestMessages(req);
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    messages: inputMessages,
    max_tokens: 2000,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
