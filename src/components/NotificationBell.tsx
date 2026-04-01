import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type Notification = {
  id: string;
  questionId: string;
  questionTitle: string;
  providerName: string;
  createdAt: string;
  isNew: boolean;
};

const LAST_CHECKED_KEY = 'notifications_last_checked';

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Get user's questions
      const { data: questions, error: questionsError } = await supabase
        .from('expert_questions')
        .select('id, title')
        .eq('user_id', user.id);

      if (questionsError) throw questionsError;
      if (!questions || questions.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const questionIds = questions.map(q => q.id);
      const questionMap = new Map(questions.map(q => [q.id, q.title]));

      // Get answers to user's questions
      const { data: answers, error: answersError } = await supabase
        .from('expert_answers')
        .select('id, question_id, provider_id, created_at')
        .in('question_id', questionIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (answersError) throw answersError;

      // Get provider names
      const providerIds = [...new Set((answers || []).map(a => a.provider_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', providerIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p.full_name || 'An expert']));

      // Get last checked timestamp
      const lastChecked = localStorage.getItem(LAST_CHECKED_KEY);
      const lastCheckedDate = lastChecked ? new Date(lastChecked) : new Date(0);

      const notificationsList: Notification[] = (answers || []).map(answer => ({
        id: answer.id,
        questionId: answer.question_id,
        questionTitle: questionMap.get(answer.question_id) || 'Your question',
        providerName: profileMap.get(answer.provider_id) || 'An expert',
        createdAt: answer.created_at,
        isNew: new Date(answer.created_at) > lastCheckedDate,
      }));

      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => n.isNew).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark all as read when opening
      localStorage.setItem(LAST_CHECKED_KEY, new Date().toISOString());
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-black/70 hover:text-black hover:bg-black/10"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-foreground">Notifications</h4>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">When experts answer your questions, you'll see them here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={`/ask-expert/${notification.questionId}`}
                  className={`block p-3 hover:bg-accent/50 transition-colors ${
                    notification.isNew ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start gap-2">
                    {notification.isNew && (
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{notification.providerName}</span>
                        {' answered your question'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        "{notification.questionTitle}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/ask-expert">View all questions</Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
