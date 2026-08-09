import { db } from "@/db";
import { webhookEvents } from "@/db/schema";
import { WebhookRetryService } from "@/lib/webhook-retry";
import { and, eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
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
        <Button variant="outline" onClick={loadWebhookEvents}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Webhook Retry Management</h1>
      <div className="grid gap-6">
        {/* Retry Queue Card */}
        <Card>
          <CardHeader>
            <CardTitle>Retry Queue ({retryEvents.length})</CardTitle>
            <CardDescription>
              Webhooks scheduled for retry processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {retryEvents.length === 0 ? (
              <p className="text-muted-foreground">No webhooks in retry queue</p>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHeader>ID</TableHeader>
                    <TableHeader>Event Type</TableHeader>
                    <TableHeader>Retry Count</TableHeader>
                    <TableHeader>Next Retry At</TableHeader>
                    <TableHeader>Last Error</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retryEvents.map((event) => {
                    const payload = event.payload as { retryCount?: number; nextRetryAt?: string; lastError?: string } || {};
                    const nextRetryAt = payload.nextRetryAt ? new Date(payload.nextRetryAt) : null;
                    
                    return (
                      <TableRow key={event.id}>
                        <TableCell>{event.id}</TableCell>
                        <TableCell>{event.event}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{payload.retryCount ?? 0}/3</Badge>
                        </TableCell>
                        <TableCell>
                          {nextRetryAt ? nextRetryAt.toLocaleTimeString() : "Unknown"}
                        </TableCell>
                        <TableCell className="max-w-xs break-all">
                          {payload.lastError || "No error"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="p-1">
                                Retry
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRetry(event.id)}>
                                Process Retry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dead Letter Queue Card */}
        <Card>
          <CardHeader>
            <CardTitle>Dead Letter Queue ({deadLetterEvents.length})</CardTitle>
            <CardDescription>
              Webhooks that exceeded maximum retry attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deadLetterEvents.length === 0 ? (
              <p className="text-muted-foreground">No webhooks in dead letter queue</p>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHeader>ID</TableHeader>
                    <TableHeader>Event Type</TableHeader>
                    <TableHeader>Retry Count</TableHeader>
                    <TableHeader>Moved to DLQ At</TableHeader>
                    <TableHeader>Last Error</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deadLetterEvents.map((event) => {
                    const payload = event.payload as { 
                      retryCount?: number; 
                      movedToDeadLetterAt?: string; 
                      lastError?: string 
                    } || {};
                    const movedAt = payload.movedToDeadLetterAt ? new Date(payload.movedToDeadLetterAt) : null;
                    
                    return (
                      <TableRow key={event.id}>
                        <TableCell>{event.id}</TableCell>
                        <TableCell>{event.event}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{payload.retryCount ?? 0}/3</Badge>
                        </TableCell>
                        <TableCell>
                          {movedAt ? movedAt.toLocaleString() : "Unknown"}
                        </TableCell>
                        <TableCell className="max-w-xs break-all">
                          {payload.lastError || "No error"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="p-1" disabled={false}>
                                Retry
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleManualRetryDeadLetter(event.id)}>
                                Move to Retry Queue
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={loadWebhookEvents} className="mr-2">
          Refresh
        </Button>
      </div>
    </div>
  );
}