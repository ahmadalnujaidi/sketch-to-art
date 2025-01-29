// server.js

const express = require("express");
const fs = require("fs");
const path = require("path");

// import OpenAI from "openai";
const OpenAI = require("openai");
const openai = new OpenAI();

const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse JSON bodies for POST requests
app.use(express.json({ limit: "10mb" })); // Increase limit if needed

// Route for the landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route for the sketch page
app.get("/sketch", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "sketch.html"));
});

// Route for the results page
app.get("/results", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "results.html"));
});

// Route to handle saving the canvas image
app.post("/save-image", (req, res) => {
  const imageData = req.body.image;
  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
  const imagePath = path.join(uploadsDir, `sketch-${Date.now()}.png`);

  fs.writeFile(imagePath, base64Data, "base64", (err) => {
    if (err) {
      console.error(err);
      res.json({ success: false });
    } else {
      res.json({ success: true, path: imagePath });
    }
  });
});

// generate description of image
app.post("/generate-description", async (req, res) => {
  const image = req.body.image;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "whats in this image? only say the items. absolutely nothing else.",
          },
          {
            type: "image_url",
            image_url: {
              url: `${image}`,
            },
          },
        ],
      },
    ],
    store: true,
  });

  //   console.log(response.choices[0]);
  // the text itself is in response.choices[0].message.content[0].text
  console.log(response.choices[0].message.content);
  generateImage(response.choices[0].message.content);
});

const generateImage = async (description) => {
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: `${description}`,
  });

  console.log(image.data);
};

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
