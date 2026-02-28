import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  User, 
  Clock, 
  ChevronRight, 
  Plus,
  Loader2,
  HelpCircle
} from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import heroAskExpert from "@/assets/hero-ask-expert.jpg?format=webp&quality=80";

type Question = {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  category_id: string | null;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  service_categories: { name: string } | null;
  answer_count: number;
};

type ServiceCategory = {
  id: string;
  name: string;
};

const AskExpert = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category_id: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Use public_expert_questions view for public access
      const { data: questionsData, error: questionsError } = await supabase
        .from('public_expert_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      // Get category names, answer counts and profiles for each question
      const questionsWithDetails = await Promise.all(
        (questionsData || []).map(async (q) => {
          const [{ count }, categoryResult, profileResult] = await Promise.all([
            supabase
              .from('expert_answers')
              .select('*', { count: 'exact', head: true })
              .eq('question_id', q.id!),
            q.category_id 
              ? supabase.from('service_categories').select('name').eq('id', q.category_id).maybeSingle()
              : Promise.resolve({ data: null }),
            q.user_id 
              ? supabase.rpc('get_public_provider_profiles', { provider_ids: [q.user_id] })
              : Promise.resolve({ data: null })
          ]);
          
          const profileData = profileResult.data?.[0] || null;
          
          return { 
            ...q, 
            id: q.id!,
            user_id: q.user_id,
            title: q.title!,
            content: q.content!,
            category_id: q.category_id,
            created_at: q.created_at!,
            answer_count: count || 0,
            profiles: profileData ? { full_name: profileData.full_name, avatar_url: profileData.avatar_url } : null,
            service_categories: categoryResult.data as { name: string } | null
          };
        })
      );

      setQuestions(questionsWithDetails as Question[]);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name')
      .order('name');
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Please sign in to ask a question', variant: 'destructive' });
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('expert_questions').insert({
        user_id: user.id,
        title: form.title.trim(),
        content: form.content.trim(),
        category_id: form.category_id || null,
      });

      if (error) throw error;

      toast({ title: 'Question posted successfully!' });
      setForm({ title: '', content: '', category_id: '' });
      setIsDialogOpen(false);
      fetchQuestions();
    } catch (error: any) {
      toast({ 
        title: 'Error posting question', 
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
    });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || q.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Ask an Expert – Free Trade Advice | Kluje" description="Ask home improvement, renovation or trade questions and get free answers from verified US professionals. No sign-up needed to browse answers." pageType="ask-expert" />
      <Navbar />
      
      <main>
        <PageHero
          backgroundImage={heroAskExpert}
          title="Ask An Expert"
          description="Get answers from verified service professionals. Post your question and receive expert advice."
        >
          {user ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Ask a Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ask Your Question</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Question Title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Brief summary of your question"
                      maxLength={200}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Details *</Label>
                    <Textarea
                      id="content"
                      value={form.content}
                      onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                      placeholder="Provide more details about your question..."
                      rows={5}
                      maxLength={2000}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category (optional)</Label>
                    <select
                      id="category"
                      value={form.category_id}
                      onChange={(e) => setForm(p => ({ ...p, category_id: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Question'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Link to="/auth">
              <Button variant="secondary" size="lg">
                Sign In to Ask a Question
              </Button>
            </Link>
          )}
        </PageHero>

        {/* Filters */}
        <section className="py-4 md:py-6 bg-secondary border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4">
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-12 md:h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full md:w-60"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Questions List */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 md:py-16">
                <LoadingSpinner size="lg" text="Loading questions..." />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <MessageSquare className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No questions yet</h3>
                <p className="text-muted-foreground">Be the first to ask a question!</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredQuestions.map((question) => (
                  <Link key={question.id} to={`/ask-expert/${question.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start justify-between gap-3 md:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-semibold text-foreground mb-2 line-clamp-2">
                              {question.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3 md:mb-4">
                              {question.content}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm">
                              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                                <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span>{question.profiles?.full_name || 'Anonymous'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span>{formatDate(question.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 md:gap-2 text-primary">
                                <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span>{question.answer_count} answer{question.answer_count !== 1 ? 's' : ''}</span>
                              </div>
                              {question.service_categories && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                                  {question.service_categories.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AskExpert;