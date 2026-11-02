const cron = require('node-cron');
const User = require('../models/User');
const RentRecord = require('../models/RentRecord');

/**
 * Runs on the 1st of every month at 06:00 to auto-generate rent records.
 */
const startRentCron = () => {
  cron.schedule('0 6 1 * *', async () => {
    console.log('⏰ [CRON] Generating monthly rent records...');
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const dueDate = new Date(year, month - 1, 5);

      const students = await User.find({ role: 'STUDENT', active: true }).populate('room');
      let count = 0;
      for (const student of students) {
        if (!student.room) continue;
        try {
          await RentRecord.create({
            student: student._id,
            month,
            year,
            amount: student.room.monthlyRent,
            dueDate,
            status: 'PENDING',
          });
          count++;
        } catch (e) {
          if (e.code !== 11000) console.error('[CRON] Error creating rent record:', e.message);
        }
      }
      console.log(`✅ [CRON] Generated ${count} rent records for ${month}/${year}`);
    } catch (err) {
      console.error('[CRON] Rent generation failed:', err.message);
    }
  });

  // Mark overdue rent records every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await RentRecord.updateMany(
        { status: 'PENDING', dueDate: { $lt: new Date() } },
        { $set: { status: 'OVERDUE' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`⏰ [CRON] Marked ${result.modifiedCount} rent records as OVERDUE`);
      }
    } catch (err) {
      console.error('[CRON] Overdue check failed:', err.message);
    }
  });

  console.log('✅ Cron jobs started');
};

module.exports = { startRentCron };

