"use client";

export const revalidate = 0; // Always fresh data

export default function WebhookRetriesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Webhook Retry Management</h1>
      <p className="text-muted-foreground">
        This feature is currently under maintenance. Webhook retries are processed
        automatically via cron jobs.
      </p>
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="font-semibold mb-2">Automatic Processing</h2>
        <p className="text-sm">
          Webhook retry processing is handled automatically by the 
          <code>/api/cron/process-webhook-retries</code> cron job, which runs 
          daily at 4:00 AM server time.
        </p>
      </div>
    </div>
  );
}
