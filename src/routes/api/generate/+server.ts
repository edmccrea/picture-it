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
  "old-school-anime":
    "Make the image in the style of a traditional hand-painted cel animation, reminiscent of a simple 1980s Japanese anime",
  monster: "Turn any subjects in the image into their own distinct monster",
  "comic-book-villain":
    "Turn any subjects in the image into a comic book villain and give the whole image a comic book style. The style of the comic book should be like marvel or dc. Give any subjects their own costume and superpowers. Change the clothes that they are wearing into a new costume.",
  "comic-book-hero":
    "Turn any subjects in the image into a comic book hero and give the whole image a comic book style. The style of the comic book should be like marvel or dc and should look hand drawn. Give any subjects their own costume and superpowers. Change the clothes that they are wearing into a new costume.",
  abstract: "Make the style of the image abstract",
  watercolor: "Make the style of the image look like a watercolor painting",
  "oil-painting": "Make the style of the image look like an oil painting",
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

    const initialMessage =
      "event: message\ndata: " +
      JSON.stringify({ type: "message", data: "Generating image..." }) +
      "\n\n";
    const encoder = new TextEncoder();
    let data = encoder.encode(initialMessage);
    let intervalId = setInterval(() => {
      data = encoder.encode(
        "event: message\ndata: " +
          JSON.stringify({
            type: "message",
            data: "Still generating image. Please be patient.",
          }) +
          "\n\n"
      );
      writer.write(data);
    }, 5000);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    writer.write(data);

    async function performApiCall() {
      const openai = new OpenAI({ apiKey: requestData.key });
      const visionResponse = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe what is in this image in great detail. Give as much detail as possible about any humans in the image, especially those in the foreground. Make sure to include how they are dressed and positioned.",
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
      clearInterval(intervalId);

      data = encoder.encode(
        "event: image\ndata: " +
          JSON.stringify({ type: "image", data: image.data }) +
          "\n\n"
      );
      writer.write(data);
      writer.close();
    }

    performApiCall();
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        connection: "keep-alive",
      },
    });
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
