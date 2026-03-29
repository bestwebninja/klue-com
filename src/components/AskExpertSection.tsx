import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare, Users, ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';

export function AskExpertSection() {
  return (
    <section aria-label="Ask an expert" className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <SectionHeader
              eyebrow="Ask an expert"
              title="Got a question? Ask an expert"
              subtitle={
                <>
                  Get free advice from experienced service providers. Whether you're planning a project or need guidance on a home improvement issue,
                  our community of experts is here to help.
                </>
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Ask Anything</h3>
              <p className="text-muted-foreground">
                Post your question about any home improvement topic
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Expert Answers</h3>
              <p className="text-muted-foreground">
                Get responses from qualified service providers
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <HelpCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">100% Free</h3>
              <p className="text-muted-foreground">
                No cost to ask questions or read answers
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/ask-expert">
                Ask an Expert
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
