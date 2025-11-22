import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, Activity, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { useTasks } from '@/hooks/use-tasks';
import { SessionCard } from '@/components/session-card';
import { NotificationCenter } from '@/components/admin/notification-center';
export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { data: activeTasks, isLoading: tasksLoading } = useTasks(undefined, user?.id);
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.display_name || user?.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your time bank account today.
          </p>
        </div>
        <NotificationCenter />
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
              <Clock className="h-4 w-4 text-chronos-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.credits ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                +0.0 this month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.locked_credits ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Locked in active tasks
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reputation</CardTitle>
              <TrendingUp className="h-4 w-4 text-chronos-amber" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.reputation_score ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Top 20% of community
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTasks?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Actions required
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Tasks</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm">
                  No recent activity to show.
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recommended Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm">
                  Check back later for recommendations.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="active">
          {tasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : activeTasks && activeTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTasks.map(task => (
                <SessionCard
                  key={task.id}
                  task={task}
                  isProvider={task.type === 'request' ? user?.id !== task.creator_id : user?.id === task.creator_id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-secondary/20 rounded-lg border border-dashed">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No active tasks</h3>
              <p className="text-muted-foreground mb-6">You haven't posted or accepted any tasks yet.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Star className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>Complete tasks to earn reviews and build your reputation.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}