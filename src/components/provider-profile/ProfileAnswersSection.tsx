import { Link } from 'react-router-dom';
import { MessageCircle, Eye, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ExpertAnswer {
  id: string;
  content: string;
  created_at: string;
  question: {
    id: string;
    title: string;
    content: string;
  } | null;
}

interface ProfileAnswersSectionProps {
  answers: ExpertAnswer[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const ProfileAnswersSection = ({ 
  answers, 
  currentPage = 1,
  totalPages = 1,
  onPageChange 
}: ProfileAnswersSectionProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (answers.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No expert answers yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Answers</h2>
      
      <div className="space-y-4">
        {answers.map((answer) => (
          <Card key={answer.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Question Header */}
              {answer.question && (
                <div className="p-4 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Link 
                        to={`/ask-expert/${answer.question.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {answer.question.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Posted on {formatDate(answer.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Answer Content */}
              <div className="p-4">
                <p className="text-muted-foreground leading-relaxed">
                  {answer.content}
                </p>
              </div>

              {/* Stats */}
              <div className="px-4 pb-4 flex items-center gap-4">
                <span className="flex items-center gap-1 text-primary text-sm">
                  <MessageCircle className="w-4 h-4" />
                  1 Answer
                </span>
                <span className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Eye className="w-4 h-4" />
                  1 View
                </span>
              </div>

              {/* Quote Highlight (optional) */}
              {answer.content.length > 100 && (
                <div className="bg-muted/30 px-4 py-3 border-t border-border">
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground italic line-clamp-2">
                      {answer.content.slice(0, 150)}...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-sm text-muted-foreground">
            Page: {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded border border-border flex items-center justify-center disabled:opacity-50"
            >
              &lt;
            </button>
            <button 
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded border border-border flex items-center justify-center disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
