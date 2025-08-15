const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const stripe = Stripe("sk_test_YOUR_SECRET_KEY"); // Replace with your Stripe secret key

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  const { cart } = req.body;

  const line_items = cart.map((item) => ({
    price_data: {
      currency: "zar",
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100), // Stripe expects cents
    },
    quantity: item.quantity,
  }));

  // Add shipping as a line item if needed
  if (cart.length > 0) {
    line_items.push({
      price_data: {
        currency: "zar",
        product_data: { name: "Shipping" },
        unit_amount: 6000, // R60.00 in cents
      },
      quantity: 1,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://yourdomain.com/cancel",
    });
    res.json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/send-order-email", async (req, res) => {
  const { resellerEmail, orderId, address, contact, cart } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sibscarmen@gmail.com", // Replace with your Gmail
      pass: "Hlelo1509*", // Use an app password, not your Gmail password
    },
  });

  const items = cart.map((item) => `${item.name} x${item.quantity}`).join(", ");
  const mailOptions = {
    from: "sibscarmen@gmail.com",
    to: `${resellerEmail}, sibscarmen@gmail.com`,
    subject: `Kyla & Co Bulk Order Placed: ${orderId}`,
    text: `Order ID: ${orderId}\nAddress: ${address}\nContact: ${contact}\nItems: ${items}\nStatus: Processing`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log("Server running on port 4242"));

/fetch("http://localhost:4242/send-order-email", { ... })


</script>
