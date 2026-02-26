import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export function MessageNotificationListener() {
  const { user } = useAuth();
  const { showNotification, permission } = useNotifications();
  const processedMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || permission !== 'granted') return;

    console.log('Setting up message notification listener');

    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          const message = payload.new as {
            id: string;
            content: string;
            sender_id: string;
            created_at: string;
          };

          // Avoid duplicate notifications
          if (processedMessagesRef.current.has(message.id)) return;
          processedMessagesRef.current.add(message.id);

          // Clean up old message IDs (keep last 100)
          if (processedMessagesRef.current.size > 100) {
            const arr = [...processedMessagesRef.current];
            processedMessagesRef.current = new Set(arr.slice(-50));
          }

          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.sender_id)
            .maybeSingle();

          const senderName = sender?.full_name || 'Someone';
          const messagePreview = message.content.length > 100 
            ? message.content.substring(0, 100) + '...' 
            : message.content;

          showNotification(`New message from ${senderName}`, {
            body: messagePreview,
            tag: `message-${message.id}`,
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up message notification listener');
      supabase.removeChannel(channel);
    };
  }, [user, permission, showNotification]);

  return null;
}
