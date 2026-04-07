import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EmailNotification {
  id: string;
  email_type: string;
  subject: string;
  status: string;
  sent_at: string;
  delivery_failed: boolean;
}

const emailTypeLabels: Record<string, string> = {
  quote_request_received: "Quote Request Received",
  quote_request_sent: "Quote Request Sent",
  quote_accepted: "Quote Accepted",
  message_notification: "New Message",
  rating_request: "Rating Request",
  review_notification: "New Review",
};

export const DashboardEmailHistory = () => {
  const { user } = useAuth();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["email-notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_email_notifications" as any)
        .select("id, email_type, subject, status, sent_at, delivery_failed")
        .order("sent_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as unknown as EmailNotification[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No email notifications yet</p>
            <p className="text-sm mt-1">
              You'll see your email notification history here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="mt-0.5">
                {notification.status === "sent" ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : notification.status === "error" ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {emailTypeLabels[notification.email_type] ||
                      notification.email_type}
                  </Badge>
                  <Badge
                    variant={
                      notification.status === "sent"
                        ? "default"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {notification.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium mt-1 truncate">
                  {notification.subject}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(notification.sent_at), {
                    addSuffix: true,
                  })}
                </p>
                {notification.delivery_failed && (
                  <p className="text-xs text-destructive mt-1">
                    Delivery failed — please check your spam folder or contact support.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
