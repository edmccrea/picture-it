import OpenAI from "openai";
import type { RequestHandler } from "./$types";

export const config = {
  runtime: "edge",
};

const prompts = {
  "2d-cartoon":
    "\n\nFrom this description, make the style of the image a flat, vectorised 2d cartoon",
  lego: "From this description, make the style of the image look like any subjects are lego mini figures in a lego world",
  pixar:
    "\n\nFrom this description, make the style of the image look like a pixar movie. It should be a a still from the movie, not a poster",
  anime:
    "\n\nFrom this description, make the style of the image look like an anime",
  "old-school-anime":
    "\n\nUsing this description, make the image in the style of a traditional hand-painted cel animation, reminiscent of a simple 1980s Japanese anime",
  simpsons:
    "\n\nFrom this description, make the image reminiscent of the style of the Simpsons. Try to emulate the style from the show when it was on air in the late 90s/early 2000s.  It should look like a still from the show. It should be a 2D cartoon and include the signature yellow skin",
  "south-park":
    "\n\nFrom this description, make an image reminscent of the show south park. It should have an artistic style that is distinctly minimalistic and paper-cutout in appearance, reminiscent of a children's craft project. Characters are composed of simple geometrical shapes with bold, black outlines, and they feature large, circular eyes set wide apart, often with asymmetrical, simplistic facial features. The color scheme is flat and vibrant, lacking gradient and shadow, giving the impression of each element being a separate cutout piece. Proportions are exaggeratedly cartoonish, with bodies, limbs, and heads often lacking detailed articulation, providing a stark contrast to more detailed backgrounds. The style is intentionally crude and childlike, emphasizing humor and expression over realism.    ",
  "sock-puppet":
    "\n\nFrom this description, make the image in the style of a sock puppet",
  claymation:
    "\n\nFrom this description, make the image in the style of a claymation. It should look like a still from a claymation movie and shows made by Aardman with characters like Wallace and Gromit and Shaun the Sheep",
  monster: "\n\nTurn any subjects in the image into their own distinct monster",
  "comic-book-villain":
    "\n\nTurn any subjects in the image into a comic book villain and give the whole image a comic book style. The style of the comic book should be like marvel or dc. Give any subjects their own costume and superpowers. Change the clothes that they are wearing into a new costume.",
  "comic-book-hero":
    "\n\nTurn any subjects in the image into a comic book hero and give the whole image a comic book style. The style of the comic book should be like marvel or dc and should look hand drawn. Give any subjects their own costume and superpowers. Change the clothes that they are wearing into a new costume.",
  abstract: "\n\nMake the style of the image abstract",
  watercolor: "\n\nMake the style of the image look like a watercolor painting",
  "oil-painting": "\n\nMake the style of the image look like an oil painting",
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
    }, 3000);

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
                text: "Give me a very detailed description of this image using as many words as you feel are needed to give an accurate and detailed description. The description should make it possible to reproduce the image perfectly. If there are people in the image, focus on describing them. Estimate age and gender, and describe their features such as hair colour and hairstyle, eyes and eye colour, facial features and skin complexity as well as skin colour, if there is any facial hair or accessories such as glasses, jewellery or piercings. Make sure you also describe what they are wearing and if they are holding or interacting with anything. Include anything else about the person that you feel is needed to reproduce the image accurately. Lastly, describe the setting, atmosphere and anything else that describes the image.\n\n",
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
      const requestPrompt = requestData.systemPrompt
        ? requestData.systemPrompt + "\n\n"
        : "";
      const stylePrompt = prompts[style];
      const prompt = requestPrompt + basePrompt + stylePrompt;
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
        "event: prompt\ndata: " +
          JSON.stringify({ type: "prompt", data: prompt }) +
          "\n\n"
      );
      writer.write(data);

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
