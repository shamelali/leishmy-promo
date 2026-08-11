import { db } from "@/db";
import { webhookEvents } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export class WebhookRetryService {
  static MAX_RETRIES = 3;
  static BASE_DELAY_MS = 1000; // Base delay for exponential backoff

  /**
   * Enqueue a webhook event for retry processing
   */
  static async enqueueForRetry(eventId: number, error: string): Promise<void> {
    // Get current webhook event to check retry count
    const [event] = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.id, eventId))
      .limit(1);

    if (!event) {
      console.error(`[WebhookRetry] Event ${eventId} not found for retry`);
      return;
    }

    const currentRetryCount = (event.payload && typeof event.payload === 'object' && 'retryCount' in event.payload) ? (event.payload as { retryCount: number }).retryCount : 0;
    const newRetryCount = currentRetryCount + 1;

     // If we've exceeded max retries, move to dead letter queue
     if (newRetryCount >= this.MAX_RETRIES) {
       await db
         .update(webhookEvents)
         .set({
           status: "dead_letter",
           payload: {
             ...(typeof event.payload === 'object' && event.payload !== null ? event.payload : {}),
             retryCount: newRetryCount,
             lastError: error,
             lastRetryAttempt: new Date(),
             movedToDeadLetterAt: new Date()
           }
         })
         .where(eq(webhookEvents.id, eventId));

      console.error(`[WebhookRetry] Event ${eventId} moved to dead letter queue after ${newRetryCount} retries`);
      return;
    }

    // Calculate delay with exponential backoff and jitter
    const delayMs = this.calculateDelayWithJitter(newRetryCount);
    const nextRetryAt = new Date(Date.now() + delayMs);

     // Update event for retry
     await db
       .update(webhookEvents)
       .set({
         status: "retry_scheduled",
         payload: {
           ...(typeof event.payload === 'object' && event.payload !== null ? event.payload : {}),
           retryCount: newRetryCount,
           lastError: error,
           lastRetryAttempt: new Date(),
           nextRetryAt
         }
       })
       .where(eq(webhookEvents.id, eventId));

    console.log(`[WebhookRetry] Event ${eventId} scheduled for retry ${newRetryCount}/${this.MAX_RETRIES} in ${delayMs}ms`);
  }

  /**
   * Calculate delay with exponential backoff and jitter
   * Formula: baseDelay * 2^(retryCount-1) + random jitter (0-1000ms)
   */
  private static calculateDelayWithJitter(retryCount: number): number {
    const baseDelay = this.BASE_DELAY_MS * Math.pow(2, retryCount - 1);
    const jitter = Math.floor(Math.random() * 1000); // 0-1000ms random jitter
    return baseDelay + jitter;
  }

  /**
   * Get webhook events that are ready for retry
   */
  static async getReadyForRetry(limit = 10): Promise<Array<typeof webhookEvents.$inferSelect>> {
    const now = new Date();
    
    return await db
      .select()
      .from(webhookEvents)
      .where(and(
        eq(webhookEvents.status, "retry_scheduled"),
        // Next retry time should be in the past
        // We store nextRetryAt in payload as ISO string
        sql/*sql*/ `${webhookEvents.payload}->>'nextRetryAt' < ${now.toISOString()}`
      ))
      .limit(limit);
  }

  /**
   * Process a single webhook event retry
   * This would typically be called by a cron job or queue worker
   */
  static async processRetry(eventId: number): Promise<boolean> {
    // Get the webhook event
    const [event] = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.id, eventId))
      .limit(1);

    if (!event) {
      console.error(`[WebhookRetry] Event ${eventId} not found for processing`);
      return false;
    }

    // Check if it's actually ready for retry
    if (event.status !== "retry_scheduled") {
      console.log(`[WebhookRetry] Event ${eventId} is not ready for retry (status: ${event.status})`);
      return false;
    }

    try {
      // Here we would re-process the webhook by calling the webhook handler again
      // For now, we'll simulate success/failure based on a simple condition
      // In reality, this would re-execute the webhook processing logic
      
      // For demonstration, let's assume 70% success rate on retry
      const success = Math.random() > 0.3;
      
      if (success) {
       // Mark as successfully processed
       await db
         .update(webhookEvents)
         .set({
           status: "processed",
           payload: {
             ...(typeof event.payload === 'object' && event.payload !== null ? event.payload : {}),
             processedAt: new Date(),
             retrySuccess: true
           }
         })
         .where(eq(webhookEvents.id, eventId));
        
        console.log(`[WebhookRetry] Event ${eventId} processed successfully on retry`);
        return true;
      } else {
        // Failed again, re-queue for another retry
        await this.enqueueForRetry(eventId, "Retry processing failed");
        return false;
      }
    } catch (error) {
      // Unexpected error during retry processing
      await this.enqueueForRetry(eventId, `Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Get dead letter webhook events for manual intervention
   */
  static async getDeadLetterEvents(limit = 50): Promise<Array<typeof webhookEvents.$inferSelect>> {
    return await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.status, "dead_letter"))
      .orderBy(webhookEvents.createdAt)
      .limit(limit);
  }

  /**
   * Manually retry a dead letter event
   */
  static async manualRetryDeadLetter(eventId: number): Promise<boolean> {
    const [event] = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.id, eventId))
      .limit(1);

    if (!event) {
      console.error(`[WebhookRetry] Dead letter event ${eventId} not found`);
      return false;
    }

    if (event.status !== "dead_letter") {
      console.error(`[WebhookRetry] Event ${eventId} is not in dead letter status`);
      return false;
    }

    // Reset retry count and move back to retry queue
    const delayMs = this.calculateDelayWithJitter(1); // Start at first retry delay
    const nextRetryAt = new Date(Date.now() + delayMs);

     await db
       .update(webhookEvents)
       .set({
         status: "retry_scheduled",
         payload: {
           ...(typeof event.payload === 'object' && event.payload !== null ? event.payload : {}),
           retryCount: 0, // Reset retry count
           lastError: "Manually moved from dead letter queue",
           lastRetryAttempt: new Date(),
           nextRetryAt
         }
       })
       .where(eq(webhookEvents.id, eventId));

    console.log(`[WebhookRetry] Dead letter event ${eventId} moved to retry queue`);
    return true;
  }

  static async getDeadLetterCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(webhookEvents)
      .where(eq(webhookEvents.status, "dead_letter"));
    return result?.count ?? 0;
  }

  static async getRetryScheduledCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(webhookEvents)
      .where(eq(webhookEvents.status, "retry_scheduled"));
    return result?.count ?? 0;
  }
}