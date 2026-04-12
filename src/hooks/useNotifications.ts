/**
 * useNotifications — realtime hook for platform-wide notifications.
 *
 * Mirrors useAgentRuns.ts architecture:
 *   - Initial fetch on mount
 *   - Supabase realtime INSERT subscription filtered by user_id
 *   - CHANNEL_ERROR / TIMED_OUT detection → 2 s delay → re-fetch + re-subscribe
 *   - Exposes markRead, markAllRead helpers
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type NotificationType =
  | "job_match"
  | "quote_received"
  | "contract_signed"
  | "payment_due"
  | "agent_alert"
  | "lead_scored"
  | "message";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

const CHANNEL_RETRY_DELAY_MS = 2_000;

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchErr) {
        setError(fetchErr.message);
      } else {
        setNotifications((data as AppNotification[]) ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const subscribe = useCallback(() => {
    if (!user) return;

    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`notifications_live_${user.id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const newNotif = payload.new as AppNotification;
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const updated = payload.new as AppNotification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            fetchNotifications();
            subscribe();
          }, CHANNEL_RETRY_DELAY_MS);
        }
      });

    channelRef.current = channel;
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    subscribe();

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, fetchNotifications, subscribe]);

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      await (supabase as any)
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", user?.id ?? "");
    },
    [user]
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await (supabase as any)
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user?.id ?? "")
      .eq("read", false);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    refetch: fetchNotifications,
  };
}
