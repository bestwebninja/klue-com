import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QuoteMessages from "@/components/QuoteMessages";
import { 
  MessageSquare, 
  User, 
  Search, 
  ArrowLeft,
  Briefcase,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  quoteRequestId: string;
  jobTitle: string;
  jobId: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isJobPoster: boolean;
}

const DashboardMessages = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['dashboard-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all messages where user is sender or recipient
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          recipient_id,
          read_at,
          quote_request_id
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by quote_request_id
      const conversationMap = new Map<string, {
        messages: typeof messages;
        quoteRequestId: string;
      }>();

      messages.forEach(msg => {
        if (!conversationMap.has(msg.quote_request_id)) {
          conversationMap.set(msg.quote_request_id, {
            messages: [],
            quoteRequestId: msg.quote_request_id,
          });
        }
        conversationMap.get(msg.quote_request_id)!.messages.push(msg);
      });

      // Fetch quote request details with job and profiles
      const quoteRequestIds = [...conversationMap.keys()];
      if (quoteRequestIds.length === 0) return [];

      const { data: quoteRequests } = await supabase
        .from('quote_requests')
        .select(`
          id,
          provider_id,
          job_listing_id,
          job_listings:job_listing_id(
            id,
            title,
            posted_by
          )
        `)
        .in('id', quoteRequestIds);

      // Build profile IDs to fetch
      const profileIds = new Set<string>();
      quoteRequests?.forEach(qr => {
        profileIds.add(qr.provider_id);
        if (qr.job_listings?.posted_by) {
          profileIds.add(qr.job_listings.posted_by);
        }
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', [...profileIds]);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Build conversations
      const result: Conversation[] = [];

      quoteRequests?.forEach(qr => {
        const conv = conversationMap.get(qr.id);
        if (!conv || !qr.job_listings) return;

        const isJobPoster = qr.job_listings.posted_by === user.id;
        const otherUserId = isJobPoster ? qr.provider_id : qr.job_listings.posted_by;
        const otherProfile = profileMap.get(otherUserId);
        
        const lastMsg = conv.messages[0];
        const unreadCount = conv.messages.filter(
          m => m.recipient_id === user.id && !m.read_at
        ).length;

        result.push({
          quoteRequestId: qr.id,
          jobTitle: qr.job_listings.title,
          jobId: qr.job_listings.id,
          otherUserId,
          otherUserName: otherProfile?.full_name || null,
          otherUserAvatar: otherProfile?.avatar_url || null,
          lastMessage: lastMsg.content,
          lastMessageAt: lastMsg.created_at,
          unreadCount,
          isJobPoster,
        });
      });

      // Sort by last message time
      result.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      return result;
    },
    enabled: !!user,
  });

  const filteredConversations = conversations?.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.jobTitle.toLowerCase().includes(query) ||
      conv.otherUserName?.toLowerCase().includes(query)
    );
  });

  const totalUnread = conversations?.reduce((sum, c) => sum + c.unreadCount, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
              {totalUnread > 0 && (
                <Badge variant="destructive">{totalUnread}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {totalUnread > 0 
                ? `${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </CardDescription>
          </div>
          <Link to="/messages">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full Inbox
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Conversations List */}
          <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : ''}`}>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-1 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations && filteredConversations.length > 0 ? (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.quoteRequestId}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full p-3 text-left hover:bg-muted/50 transition-colors flex gap-3 ${
                          selectedConversation?.quoteRequestId === conv.quoteRequestId 
                            ? 'bg-muted' 
                            : ''
                        }`}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={conv.otherUserAvatar || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate text-sm">
                              {conv.otherUserName || 'User'}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Briefcase className="h-3 w-3" />
                            <span className="truncate">{conv.jobTitle}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge variant="destructive" className="shrink-0 text-xs h-5 min-w-5 flex items-center justify-center">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center lg:hidden" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="font-medium text-sm">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Messages will appear here when you start chatting.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
            <div className="border rounded-lg h-[400px] flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="border-b p-3 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="lg:hidden -ml-2"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedConversation.otherUserAvatar || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {selectedConversation.otherUserName || 'User'}
                      </p>
                      <Link 
                        to={`/jobs/${selectedConversation.jobId}`}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <Briefcase className="h-3 w-3" />
                        <span className="truncate">{selectedConversation.jobTitle}</span>
                      </Link>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <QuoteMessages
                      quoteRequestId={selectedConversation.quoteRequestId}
                      otherUserId={selectedConversation.otherUserId}
                      otherUserName={selectedConversation.otherUserName || undefined}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-6">
                  <div>
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="font-medium text-muted-foreground">
                      Select a conversation
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardMessages;
