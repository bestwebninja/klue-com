import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectUrl: string;
  title?: string;
  description?: string;
}

export function LoginPromptDialog({
  open,
  onOpenChange,
  redirectUrl,
  title = 'Sign in required',
  description = 'Please sign in or create an account to continue.',
}: LoginPromptDialogProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onOpenChange(false);
    navigate(`/auth?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  const handleSignUp = () => {
    onOpenChange(false);
    navigate(`/auth?signup=true&redirect=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleSignIn} className="w-full gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
          <Button onClick={handleSignUp} variant="outline" className="w-full gap-2">
            <UserPlus className="w-4 h-4" />
            Create Account
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Creating an account is free and only takes a minute.
        </p>
      </DialogContent>
    </Dialog>
  );
}
