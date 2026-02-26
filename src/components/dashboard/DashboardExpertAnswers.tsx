import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Clock, 
  Send, 
  Loader2, 
  ExternalLink,
  CheckCircle
} from 'lucide-react';

type Question = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
  service_categories: { name: string } | null;
  has_my_answer: boolean;
};

type MyAnswer = {
  id: string;
  content: string;
  created_at: string;
  expert_questions: {
    id: string;
    title: string;
    content: string;
  } | null;
};

interface DashboardExpertAnswersProps {
  userId: string;
}

const DashboardExpertAnswers = ({ userId }: DashboardExpertAnswersProps) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myAnswers, setMyAnswers] = useState<MyAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'unanswered' | 'answered'>('unanswered');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all questions
      const { data: allQuestions, error: questionsError } = await supabase
        .from('expert_questions')
        .select(`
          id,
          user_id,
          title,
          content,
          category_id,
          created_at,
          service_categories(name)
        `)
        .neq('user_id', userId)
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      // Fetch profiles for questions
      const questionsWithProfiles = await Promise.all(
        (allQuestions || []).map(async (q) => {
          const { data: profileData } = q.user_id 
            ? await supabase.from('profiles').select('full_name').eq('id', q.user_id).maybeSingle()
            : { data: null };
          return {
            ...q,
            profiles: profileData as { full_name: string | null } | null,
            service_categories: q.service_categories as { name: string } | null
          };
        })
      );

      // Fetch my answers
      const { data: answersData, error: answersError } = await supabase
        .from('expert_answers')
        .select(`
          id,
          question_id,
          provider_id,
          content,
          created_at,
          expert_questions(id, title, content)
        `)
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (answersError) throw answersError;

      const myAnsweredIds = new Set((answersData || []).map(a => a.question_id));
      
      const questionsWithAnswerStatus = questionsWithProfiles.map(q => ({
        ...q,
        has_my_answer: myAnsweredIds.has(q.id)
      }));

      setQuestions(questionsWithAnswerStatus as Question[]);
      setMyAnswers(answersData as MyAnswer[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !answerContent.trim()) return;

    setIsSubmitting(true);
    try {
      // Get provider's name for the email
      const { data: providerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const { data: answerData, error } = await supabase.from('expert_answers').insert({
        question_id: selectedQuestion.id,
        provider_id: userId,
        content: answerContent.trim(),
      }).select('id').single();

      if (error) throw error;

      // Send email notification (fire and forget)
      try {
        await supabase.functions.invoke('send-answer-notification', {
          body: {
            questionId: selectedQuestion.id,
            answerId: answerData.id,
            providerName: providerProfile?.full_name || 'An expert',
          },
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({ title: 'Answer posted successfully!' });
      setAnswerContent('');
      setSelectedQuestion(null);
      fetchData();
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
    });
  };

  const unansweredQuestions = questions.filter(q => !q.has_my_answer);
  const answeredQuestions = questions.filter(q => q.has_my_answer);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ask An Expert</h2>
          <p className="text-muted-foreground">Answer questions from users and showcase your expertise</p>
        </div>
        <Link to="/ask-expert" target="_blank">
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            View All Questions
          </Button>
        </Link>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <Button 
          variant={activeTab === 'unanswered' ? 'default' : 'outline'}
          onClick={() => setActiveTab('unanswered')}
        >
          Unanswered ({unansweredQuestions.length})
        </Button>
        <Button 
          variant={activeTab === 'answered' ? 'default' : 'outline'}
          onClick={() => setActiveTab('answered')}
        >
          My Answers ({myAnswers.length})
        </Button>
      </div>

      {/* Unanswered Questions */}
      {activeTab === 'unanswered' && (
        <>
          {unansweredQuestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">You've answered all available questions!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {unansweredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {question.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {question.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="text-muted-foreground">
                            Asked by {question.profiles?.full_name || 'Anonymous'}
                          </span>
                          <div className="flex items-center gap-1 text-muted-foreground">
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
                      <Button onClick={() => setSelectedQuestion(question)}>
                        <Send className="w-4 h-4 mr-2" />
                        Answer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* My Answers */}
      {activeTab === 'answered' && (
        <>
          {myAnswers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't answered any questions yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myAnswers.map((answer) => (
                <Card key={answer.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                      Question: {answer.expert_questions?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-foreground whitespace-pre-wrap mb-3">{answer.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Answered on {formatDate(answer.created_at)}
                      </span>
                      <Link to={`/ask-expert/${answer.expert_questions?.id}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Question
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Answer Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">{selectedQuestion.title}</h4>
                <p className="text-muted-foreground text-sm">{selectedQuestion.content}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Your Expert Answer
                </label>
                <Textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Share your professional expertise and advice..."
                  rows={6}
                  maxLength={3000}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitAnswer} disabled={isSubmitting || !answerContent.trim()}>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardExpertAnswers;