import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User, 
  Clock, 
  MessageSquare, 
  CheckCircle,
  Loader2,
  Send,
  UserPlus,
  LogIn
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type Question = {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  category_id: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  service_categories: { name: string } | null;
};

type Answer = {
  id: string;
  question_id: string;
  provider_id: string;
  content: string;
  created_at: string;
  profiles: { 
    full_name: string | null; 
    avatar_url: string | null;
    bio: string | null;
  } | null;
};

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuestionData();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      checkIfProvider();
      checkIfAnswered();
    }
  }, [user, answers]);

  const fetchQuestionData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch question from public view for anonymous access
      const { data: questionData, error: questionError } = await supabase
        .from('public_expert_questions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (questionError) throw questionError;
      
      let questionProfile = null;
      let categoryData = null;
      
      if (questionData) {
        // Fetch profile using public function
        if (questionData.user_id) {
          const { data: profileResult } = await supabase
            .rpc('get_public_provider_profiles', { provider_ids: [questionData.user_id] });
          questionProfile = profileResult?.[0] || null;
        }
        
        // Fetch category
        if (questionData.category_id) {
          const { data: catData } = await supabase
            .from('service_categories')
            .select('name')
            .eq('id', questionData.category_id)
            .maybeSingle();
          categoryData = catData;
        }

        setQuestion({
          id: questionData.id!,
          user_id: questionData.user_id,
          title: questionData.title!,
          content: questionData.content!,
          category_id: questionData.category_id,
          created_at: questionData.created_at!,
          profiles: questionProfile ? { full_name: questionProfile.full_name, avatar_url: questionProfile.avatar_url } : null,
          service_categories: categoryData as { name: string } | null
        });
      }

      // Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from('expert_answers')
        .select('id, question_id, provider_id, content, created_at')
        .eq('question_id', id)
        .order('created_at', { ascending: true });

      if (answersError) throw answersError;

      // Fetch provider profiles for answers using public function
      const providerIds = [...new Set((answersData || []).map(a => a.provider_id))];
      let profilesMap: Record<string, any> = {};
      
      if (providerIds.length > 0) {
        const { data: profilesData } = await supabase
          .rpc('get_public_provider_profiles', { provider_ids: providerIds });
        
        if (profilesData) {
          profilesMap = Object.fromEntries(profilesData.map((p: any) => [p.id, p]));
        }
      }
      
      const answersWithProfiles = (answersData || []).map(a => ({
        ...a,
        profiles: profilesMap[a.provider_id] ? {
          full_name: profilesMap[a.provider_id].full_name,
          avatar_url: profilesMap[a.provider_id].avatar_url,
          bio: profilesMap[a.provider_id].bio
        } : null
      }));

      setAnswers(answersWithProfiles as Answer[]);
    } catch (error) {
      console.error('Error fetching question data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfProvider = async () => {
    if (!user) return;
    
    // Check if user has any services (making them a provider)
    const { count } = await supabase
      .from('provider_services')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', user.id);
    
    setIsProvider((count || 0) > 0);
  };

  const checkIfAnswered = () => {
    if (!user) return;
    const userAnswer = answers.find(a => a.provider_id === user.id);
    setHasAnswered(!!userAnswer);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Please sign in to answer', variant: 'destructive' });
      return;
    }

    if (!isProvider) {
      toast({ title: 'Only service providers can answer questions', variant: 'destructive' });
      return;
    }

    if (!answerContent.trim()) {
      toast({ title: 'Please enter your answer', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('expert_answers').insert({
        question_id: id!,
        provider_id: user.id,
        content: answerContent.trim(),
      });

      if (error) throw error;

      toast({ title: 'Answer posted successfully!' });
      setAnswerContent('');
      fetchQuestionData();
    } catch (error: any) {
      toast({ 
        title: 'Error posting answer', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading question..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Question Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The question you are looking for does not exist or has been removed.
            </p>
            <Link to="/ask-expert">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canAnswer = user && isProvider && !hasAnswered && question.user_id !== user.id;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${question.title} – Ask an Expert | Kluje`}
        description={question.content?.substring(0, 155) || `Read expert answers to "${question.title}" from verified UK service providers on Kluje.`}
        keywords={[
          'ask expert',
          'professional advice',
          ...(question.service_categories?.name ? [question.service_categories.name] : []),
        ]}
        pageType="question"
        pageContent={question.content}
        category={question.service_categories?.name}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "QAPage",
          "mainEntity": {
            "@type": "Question",
            "name": question.title,
            "text": question.content,
            "dateCreated": question.created_at,
            "answerCount": answers.length,
            ...(answers.length > 0 ? {
              "acceptedAnswer": {
                "@type": "Answer",
                "text": answers[0].content,
                "dateCreated": answers[0].created_at,
                "author": {
                  "@type": "Person",
                  "name": answers[0].profiles?.full_name || "Expert"
                }
              }
            } : {})
          }
        }}
      />
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {question.profiles?.avatar_url ? (
                    <img 
                      src={question.profiles.avatar_url} 
                      alt={question.profiles.full_name || 'User'} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {question.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>Asked by {question.profiles?.full_name || 'Anonymous'}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(question.created_at)}
                    </div>
                    {question.service_categories && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {question.service_categories.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{question.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Answers Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h2>

            {answers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No answers yet. Be the first expert to answer!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {answers.map((answer) => (
                  <Card key={answer.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Link to={`/service-provider/${answer.provider_id}`} className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors">
                            {answer.profiles?.avatar_url ? (
                              <img 
                                src={answer.profiles.avatar_url} 
                                alt={answer.profiles.full_name || 'Provider'} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <User className="w-6 h-6 text-primary" />
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link 
                              to={`/service-provider/${answer.provider_id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {answer.profiles?.full_name || 'Expert'}
                            </Link>
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              Verified Expert
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {formatDate(answer.created_at)}
                          </p>
                          <p className="text-foreground whitespace-pre-wrap">{answer.content}</p>
                          
                          <Link 
                            to={`/service-provider/${answer.provider_id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4"
                          >
                            View Provider Profile →
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Answer Form */}
          {canAnswer && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Expert Answer</h3>
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <Textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="Share your professional expertise and advice..."
                    rows={5}
                    maxLength={3000}
                    required
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Answer
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {user && !isProvider && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Only verified service providers can answer questions.
                </p>
                <Link to="/dashboard">
                  <Button variant="outline">
                    Become a Provider
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {user && hasAnswered && (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-muted-foreground">
                  You have already answered this question.
                </p>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Join the conversation
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create an account to ask questions, get expert answers, and connect with verified service providers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                      <Link to="/auth?signup=true">
                        <Button size="lg" className="w-full sm:w-auto">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </Button>
                      </Link>
                      <Link to="/auth">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuestionDetail;