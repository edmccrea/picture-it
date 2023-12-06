import OpenAI from "openai";
import type { RequestHandler } from "./$types";

export const config = {
  runtime: "edge",
};

const prompts = {
  "2d-cartoon":
    "From this description, make the style of the image a flat, vectorised 2d cartoon",
  lego: "From this description, make the style of the image look like any subjects are lego mini figures in a lego world",
  pixar:
    "Make the style of the image look like a pixar movie. It should be a a still from the movie, not a poster",
  anime: "Make the style of the image look like an anime",
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const requestData = await request.json();

    if (
      !requestData ||
      !requestData.image ||
      !requestData.key ||
      !requestData.style
    ) {
      throw new Error("Image or key is missing");
    }

    const openai = new OpenAI({ apiKey: requestData.key });
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Desribe what is in this image in great detail. Give as much detail as possible about any humans in the image, especially those in the foreground. Make sure to include how they are dressed and positioned.",
            },
            {
              type: "image_url",
              image_url: { url: requestData.image },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const style: App.Style = requestData.style;

    const basePrompt = visionResponse.choices[0].message.content;
    const stylePrompt = prompts[style];
    const prompt = basePrompt + stylePrompt;
    if (!prompt) {
      throw new Error("GPT Vision failed");
    }

    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      response_format: "b64_json",
      quality: requestData.isHD ? "hd" : "standard",
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
