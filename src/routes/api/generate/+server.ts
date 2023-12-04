import OpenAI from "openai";
import type { RequestHandler } from "./$types";

export const config = {
  runtime: "edge",
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const requestData = await request.json();

    if (!requestData || !requestData.image || !requestData.key) {
      throw new Error("Image or key is missing");
    }

    console.log(
      "testing testing testing:",
      `data:image/jpeg;base64,${requestData.image}`
    ); // This should log the data URL
    const openai = new OpenAI({ apiKey: requestData.key });
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image?" },
            {
              type: "image_url",
              image_url: { url: requestData.image },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const basePrompt = visionResponse.choices[0].message.content;
    const stylePrompt =
      "Make the style of the image look like the subjects are from a disney movie. The image should be a fantastical cartoon where everything is very pretty. Similar to something like the original Cinderella movie";
    const prompt = basePrompt + stylePrompt;
    if (!prompt) {
      throw new Error("GPT Vision failed");
    }

    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      response_format: "b64_json",
      style: requestData.style,
    });

    return new Response(JSON.stringify(image.data));
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    } else {
      console.error(error);
      return new Response(`An unknown error occurred`, { status: 500 });
    }
  }
};
