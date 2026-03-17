const cron = require('node-cron');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

const startCleanupTask = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('--- Running Slot Recovery Task ---');

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    try {
      // Find bookings that never finished paying
      const expiredBookings = await Booking.find({
        paymentStatus: 'pending',
        createdAt: { $lt: tenMinutesAgo }
      });

      for (const book of expiredBookings) {
        // Use 'available' exactly as it appears in your Slot Schema enum
        await Slot.findByIdAndUpdate(book.slotId, { status: 'available' });

        book.paymentStatus = 'failed';
        await book.save();
      }

      if(expiredBookings.length > 0) {
        console.log(`✅ Recovered ${expiredBookings.length} slots.`);
      }
    } catch (err) {
      console.error('Cleanup Error:', err);
    }
  });
};

module.exports = startCleanupTask;