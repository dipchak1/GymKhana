require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("Gymkhana backend running");
});

/**
 * Create Razorpay Order
 * Calculates 10% commission
 */
app.post("/create-order", async (req, res) => {
  try {
    const amount = req.body.amount; // in INR

    if (!amount) {
      return res.status(400).json({ error: "Amount required" });
    }

    const commission = Math.round(amount * 0.10);
    const gymPayout = amount - commission;

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: "gymkhana_" + Date.now()
    });

    res.json({
      orderId: order.id,
      amount,
      commission,
      gymPayout
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Gymkhana backend running on port " + PORT);
});

