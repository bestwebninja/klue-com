import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";

interface QuoteRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => void;
  isSubmitting: boolean;
  jobTitle?: string;
}

export const QuoteRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  jobTitle,
}: QuoteRequestDialogProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    onSubmit(message);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMessage("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request to Quote</DialogTitle>
          <DialogDescription>
            {jobTitle 
              ? `Send a quote request for "${jobTitle}". Include a brief message to introduce yourself.`
              : "Send a quote request. Include a brief message to introduce yourself."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quote-message">Your Message (Optional)</Label>
            <Textarea
              id="quote-message"
              placeholder="Introduce yourself and explain why you're a good fit for this job. Mention your experience, availability, or any questions you have..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              A personalized message helps you stand out to the homeowner.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Quote Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
