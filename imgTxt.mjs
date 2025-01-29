import OpenAI from "openai";
const openai = new OpenAI();

const imageURL = "./uploads/sketch-1738167409076.png";
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What's in this image?" },
        {
          type: "image_url",
          image_url: {
            url: `${imageURL}`,
          },
        },
      ],
    },
  ],
  store: true,
});

console.log(response.choices[0]);
