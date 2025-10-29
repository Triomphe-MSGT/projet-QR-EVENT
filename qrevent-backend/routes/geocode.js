// routes/geocode.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });

  try {
    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/search",
      {
        params: {
          text: q,
          apiKey:
            process.env.GEOAPIFY_KEY || "9c75ef48a4494d958fbbb9e241db7bfc",
        },
      }
    );

    console.log("✅ Geocode OK:", q);
    res.json(response.data.features);
  } catch (error) {
    console.error("❌ Erreur proxy /geocode :", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res
      .status(error.response?.status || 500)
      .json({ error: "Erreur lors de la récupération des données." });
  }
});

export default router;
