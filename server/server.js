import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Recommendation from "./models/Recommendation.js";

dotenv.config();

// connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/recommend", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "system",
            content:
              "You recommend books and movies. Give 5 suggestions with short descriptions."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // save to MongoDB
    const savedRecommendation = await Recommendation.create({
      prompt,
      response: aiResponse
    });

    res.json(savedRecommendation);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching recommendation");
  }
});


// get history of recommendations
app.get("/history", async (req, res) => {
  try {
    const history = await Recommendation.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).send("Error fetching history");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});