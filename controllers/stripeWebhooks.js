export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("❌ Webhook signature error:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    console.log("📥 Stripe event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("🔍 Session metadata:", session.metadata);

        const bookingId = session.metadata?.bookingId;
        if (!bookingId) {
          console.warn("⚠️ Missing bookingId in session metadata");
          break;
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          console.error("❌ Booking not found with ID:", bookingId);
          break;
        }

        booking.isPaid = true;
        booking.paymentLink = "";
        await booking.save();

        console.log(`✅ Booking ${bookingId} marked as paid.`);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    response.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    response.status(500).send("Internal Server Error");
  }
};
