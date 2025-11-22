import React, { useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useMarkNotificationRead } from '@/hooks/use-admin';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
export function NotificationCenter() {
  const user = useAuthStore((s) => s.user);
  const { data: notifications, refetch, isLoading } = useNotifications(user?.id);
  const markRead = useMarkNotificationRead();
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  useEffect(() => {
    if (!user) return;
    // Real-time subscription
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          toast.info('New Notification', { description: 'You have a new update.' });
          refetch();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-background" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {notifications?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No notifications yet.
                  </div>
                ) : (
                  notifications?.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.is_read ? 'bg-background' : 'bg-secondary/30 border-l-4 border-l-chronos-teal'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium capitalize">{notification.type.replace('_', ' ')}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {JSON.stringify(notification.payload)}
                      </p>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs ml-auto flex"
                          onClick={() => markRead.mutate(notification.id)}
                        >
                          <Check className="h-3 w-3 mr-1" /> Mark Read
                        </Button>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}