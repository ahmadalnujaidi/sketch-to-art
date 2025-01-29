import OpenAI from "openai";
const openai = new OpenAI();

const image = await openai.images.generate({ prompt: `${promptFromGPT}` });

console.log(image.data[0].url);
