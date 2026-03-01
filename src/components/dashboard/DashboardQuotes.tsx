import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, CheckCircle, CheckCircle2, MessageSquare, Loader2, Star, Mail, Phone, User } from 'lucide-react';
import { MaskedLocation } from '@/components/MaskedLocation';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type QuoteRequest = Database['public']['Tables']['quote_requests']['Row'];

interface QuoteWithDetails extends QuoteRequest {
  job_listings: {
    id: string;
    title: string;
    description: string;
    location: string | null;
    status: string;
    created_at: string;
    profiles: {
      id: string;
      full_name: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  } | null;
}

interface DashboardQuotesProps {
  userId: string;
}

const DashboardQuotes = ({ userId }: DashboardQuotesProps) => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<QuoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingRating, setRequestingRating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  useEffect(() => {
    fetchQuotes();
  }, [userId]);

  const fetchQuotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        job_listings (
          id,
          title,
          description,
          location,
          status,
          created_at,
          posted_by
        )
      `)
      .eq('provider_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
    } else if (data) {
      // Fetch profiles for job posters
      const postedByIds = [...new Set(data.map(q => q.job_listings?.posted_by).filter(Boolean))];
      let profilesMap: Record<string, any> = {};
      
      if (postedByIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', postedByIds as string[]);
        
        if (profilesData) {
          profilesMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
        }
      }
      
      const quotesWithProfiles = data.map(quote => ({
        ...quote,
        job_listings: quote.job_listings ? {
          ...quote.job_listings,
          profiles: quote.job_listings.posted_by ? profilesMap[quote.job_listings.posted_by] || null : null,
        } : null,
      }));
      
      setQuotes(quotesWithProfiles as QuoteWithDetails[]);
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRequestRating = async (quoteId: string) => {
    setRequestingRating(quoteId);
    try {
      const { data, error } = await supabase.functions.invoke('send-rating-request', {
        body: { quoteRequestId: quoteId }
      });

      if (error) throw error;

      toast({
        title: 'Rating request sent!',
        description: 'The customer has been notified to leave a review.',
      });

      // Refresh quotes to update status
      fetchQuotes();
    } catch (error: any) {
      console.error('Error requesting rating:', error);
      toast({
        title: 'Error sending request',
        description: error.message || 'Failed to send rating request',
        variant: 'destructive',
      });
    } finally {
      setRequestingRating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filter === 'all') return true;
    return quote.status === filter;
  });

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    completed: quotes.filter(q => q.status === 'completed').length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Quotes
        </CardTitle>
        <CardDescription>
          Track all your submitted quotes and their statuses
        </CardDescription>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-amber-600/80">Pending</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.accepted}</p>
            <p className="text-xs text-blue-600/80">Accepted</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-green-600/80">Completed</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No {filter === 'all' ? '' : filter} quotes found.</p>
                {filter === 'all' && (
                  <p className="text-sm mt-2">Browse jobs and start sending quote requests!</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getStatusBadge(quote.status)}
                          <span className="text-xs text-muted-foreground">
                            Sent {formatDate(quote.created_at)}
                          </span>
                        </div>

                        {quote.job_listings ? (
                          <>
                            <h4 className="font-semibold text-foreground mb-1 line-clamp-1">
                              {quote.job_listings.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {quote.job_listings.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {quote.job_listings.location && (
                                <MaskedLocation
                                  fullLocation={quote.job_listings.location}
                                  allowReveal={quote.status === 'accepted' || quote.status === 'completed'}
                                  className="text-xs"
                                  iconSize="sm"
                                />
                              )}
                              {quote.job_listings.profiles && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {quote.job_listings.profiles.full_name || 'Customer'}
                                </span>
                              )}
                              <Badge variant="outline" className="text-[10px]">
                                Job {quote.job_listings.status}
                              </Badge>
                            </div>
                            
                            {/* Show full contact details for accepted/completed quotes */}
                            {(quote.status === 'accepted' || quote.status === 'completed') && quote.job_listings.profiles && (
                              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs font-semibold text-green-800 dark:text-green-400 mb-2 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Customer Contact Details
                                </p>
                                <div className="grid gap-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{quote.job_listings.profiles.full_name || 'Not provided'}</span>
                                  </div>
                                  {quote.job_listings.profiles.email && (
                                    <a 
                                      href={`mailto:${quote.job_listings.profiles.email}`}
                                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                      <Mail className="w-4 h-4" />
                                      {quote.job_listings.profiles.email}
                                    </a>
                                  )}
                                  {quote.job_listings.profiles.phone && (
                                    <a 
                                      href={`tel:${quote.job_listings.profiles.phone}`}
                                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                      <Phone className="w-4 h-4" />
                                      {quote.job_listings.profiles.phone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Job no longer available</p>
                        )}

                        {quote.message && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                            <span className="font-medium">Your message:</span> {quote.message}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-2 flex-shrink-0">
                        {quote.job_listings && (
                          <Link to={`/jobs/${quote.job_listings.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              View Job
                            </Button>
                          </Link>
                        )}
                        {(quote.status === 'accepted' || quote.status === 'completed') && quote.job_listings?.profiles && (
                          <Button variant="outline" size="sm" className="text-xs gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Message
                          </Button>
                        )}
                        {quote.status === 'accepted' && (
                          <Button 
                            size="sm" 
                            className="text-xs gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => handleRequestRating(quote.id)}
                            disabled={requestingRating === quote.id}
                          >
                            {requestingRating === quote.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Star className="w-3 h-3" />
                            )}
                            Request Rating
                          </Button>
                        )}
                        {quote.status === 'completed' && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200 dark:border-green-800 justify-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Rating Requested
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardQuotes;
