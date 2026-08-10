import { db } from "@/db";
import { webhookEvents } from "@/db/schema";
import { WebhookRetryService } from "@/lib/webhook-retry";
import { and, eq, sql } from "drizzle-orm";
import { useState, useEffect } from "react";

export const revalidate = 0; // Always fresh data

// Using the inferred select type from drizzle-orm
type WebhookEventWithPayload = typeof webhookEvents.$inferSelect;

export default async function WebhookRetriesPage() {
  const [retryEvents, setRetryEvents] = useState<WebhookEventWithPayload[]>([]);
  const [deadLetterEvents, setDeadLetterEvents] = useState<WebhookEventWithPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWebhookEvents();
  }, []);

  const loadWebhookEvents = async () => {
    try {
      setLoading(true);
      
      // Get retry scheduled events
      const retryList = await db
        .select()
        .from(webhookEvents)
        .where(and(
          eq(webhookEvents.status, "retry_scheduled"),
          // Next retry time should be in the past
          sql/*sql*/ `${webhookEvents.payload}->>'nextRetryAt' < ${new Date().toISOString()}`
        ))
        .orderBy(webhookEvents.createdAt);

      // Get dead letter events
      const deadLetterList = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.status, "dead_letter"))
        .orderBy(webhookEvents.createdAt);

      setRetryEvents(retryList);
      setDeadLetterEvents(deadLetterList);
    } catch (err) {
      console.error("Failed to load webhook events:", err);
      setError("Failed to load webhook events");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (eventId: number) => {
    try {
      const success = await WebhookRetryService.processRetry(eventId);
      if (success) {
        await loadWebhookEvents();
        // In a real app, we'd use sonner toast here
        alert("Webhook retried successfully");
      } else {
        alert("Failed to retry webhook");
      }
    } catch (err) {
      console.error("Error retrying webhook:", err);
      alert("Error retrying webhook");
    }
  };

  const handleManualRetryDeadLetter = async (eventId: number) => {
    try {
      const success = await WebhookRetryService.manualRetryDeadLetter(eventId);
      if (success) {
        await loadWebhookEvents();
        alert("Dead letter webhook moved to retry queue");
      } else {
        alert("Failed to move dead letter webhook");
      }
    } catch (err) {
      console.error("Error processing dead letter webhook:", err);
      alert("Error processing dead letter webhook");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Webhook Retry Management</h1>
        <p className="text-muted-foreground">Loading webhook retry information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Webhook Retry Management</h1>
        <p className="text-destructive">{error}</p>
        <button onClick={loadWebhookEvents} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Webhook Retry Management</h1>
      <div className="grid gap-6">
        {/* Retry Queue Card */}
        <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Retry Queue ({retryEvents.length})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Webhooks scheduled for retry processing
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            {retryEvents.length === 0 ? (
              <p className="px-6 py-4 text-muted-foreground text-center">
                No webhooks in retry queue
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Event Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Retry Count</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Next Retry At</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Last Error</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                  {retryEvents.map((event) => {
                    const payload = event.payload as { retryCount?: number; nextRetryAt?: string; lastError?: string } || {};
                    const nextRetryAt = payload.nextRetryAt ? new Date(payload.nextRetryAt) : null;
                    
                    return (
                      <tr key={event.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{event.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{event.event}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-700">
                            {payload.retryCount ?? 0}/3
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {nextRetryAt ? nextRetryAt.toLocaleTimeString() : "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs break-all">
                          {payload.lastError || "No error"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          <button onClick={() => handleRetry(event.id)} className="px-2 py-1 text-xs border border-gray-300 rounded-hover">
                            Retry
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dead Letter Queue Card */}
        <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Dead Letter Queue ({deadLetterEvents.length})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Webhooks that exceeded maximum retry attempts
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            {deadLetterEvents.length === 0 ? (
              <p className="px-6 py-4 text-muted-foreground text-center">
                No webhooks in dead letter queue
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Event Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Retry Count</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Moved to DLQ At</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Last Error</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                  {deadLetterEvents.map((event) => {
                    const payload = event.payload as { 
                      retryCount?: number; 
                      movedToDeadLetterAt?: string; 
                      lastError?: string 
                    } || {};
                    const movedAt = payload.movedToDeadLetterAt ? new Date(payload.movedToDeadLetterAt) : null;
                    
                    return (
                      <tr key={event.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{event.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{event.event}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400">
                            {payload.retryCount ?? 0}/3
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {movedAt ? movedAt.toLocaleString() : "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs break-all">
                          {payload.lastError || "No error"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          <button onClick={() => handleManualRetryDeadLetter(event.id)} className="px-2 py-1 text-xs border border-gray-300 rounded-hover">
                            Move to Retry Queue
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button onClick={loadWebhookEvents} className="mr-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          Refresh
        </button>
      </div>
    </div>
  );
}
