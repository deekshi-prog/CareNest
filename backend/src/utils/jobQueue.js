const Job = require('../models/Job');
const { sendEmail } = require('./mailer');

/**
 * Add a new job to the database queue
 */
const addJobToQueue = async (type, payload) => {
  try {
    const job = await Job.create({
      type,
      payload,
    });
    console.log(`[JobQueue] Job ${job._id} queued successfully.`);
    return job;
  } catch (error) {
    console.error(`[JobQueue] Failed to queue job:`, error);
  }
};

/**
 * Background worker execution cycle
 */
const processQueue = async () => {
  try {
    // Find jobs that are due for execution (pending and nextAttemptAt <= now)
    const jobs = await Job.find({
      status: 'pending',
      nextAttemptAt: { $lte: new Date() },
    });

    if (jobs.length === 0) return;

    console.log(`[JobQueue] Polling: Found ${jobs.length} jobs to process...`);

    for (const job of jobs) {
      // 1. Lock job for processing
      job.status = 'processing';
      await job.save();

      try {
        console.log(`[JobQueue] Processing job ${job._id} (Attempt ${job.attempts + 1})...`);
        
        // 2. Execute job
        if (job.type === 'email') {
          await sendEmail(job.payload);
        }

        // 3. Mark completed
        job.status = 'completed';
        await job.save();
        console.log(`[JobQueue] Job ${job._id} completed successfully.`);
      } catch (error) {
        // 4. Handle failure & backoff
        job.attempts += 1;
        job.errorLogs.push({ message: error.message || 'Unknown error occurred' });

        if (job.attempts >= job.maxAttempts) {
          // Dead letter status
          job.status = 'failed';
          console.error(`[JobQueue] Job ${job._id} failed permanently after ${job.maxAttempts} attempts.`);
        } else {
          // Exponential backoff: 15s, 30s, 60s
          const backoffDelayMs = Math.pow(2, job.attempts) * 15 * 1000;
          job.nextAttemptAt = new Date(Date.now() + backoffDelayMs);
          job.status = 'pending'; // Reset back to pending for retry
          console.warn(`[JobQueue] Job ${job._id} failed. Retrying in ${backoffDelayMs / 1000}s...`);
        }
        await job.save();
      }
    }
  } catch (error) {
    console.error(`[JobQueue] Worker error:`, error);
  }
};

/**
 * Initialize background worker
 */
const startQueueWorker = () => {
  console.log('[JobQueue] Decoupled Background Queue Worker initialized.');
  // Poll database every 5 seconds
  setInterval(processQueue, 5000);
};

module.exports = {
  addJobToQueue,
  startQueueWorker,
};
