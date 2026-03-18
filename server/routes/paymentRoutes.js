const crypto = require('crypto');

// Chapa Webhook Listener
router.post("/webhook", async (req, res) => {
  // 1. Validate the secret hash (Security Check)
  const hash = crypto.createHmac('sha256', process.env.CHAPA_WEBHOOK_SECRET)
                     .update(JSON.stringify(req.body))
                     .digest('hex');

  const chapaSignature = req.headers['x-chapa-signature'];

  if (hash !== chapaSignature) {
    return res.status(401).send('Invalid signature');
  }

  const { txn_ref, status, event } = req.body;

  // 2. If payment is successful, update the booking
  if (event === 'checkout.completed' && status === 'success') {
    try {
      const booking = await Booking.findOneAndUpdate(
        { transactionRef: txn_ref },
        { status: "Completed", paymentStatus: "Paid" },
        { new: true }
      );

      // 3. Free up the parking slot
      if (booking) {
        await Slot.findByIdAndUpdate(booking.slotId, { isAvailable: true });
        console.log(`✅ Webhook: Slot freed for plate ${booking.plateNumber}`);
      }
    } catch (err) {
      console.error("Webhook Update Error:", err);
    }
  }

  res.status(200).send('Webhook Received');
});