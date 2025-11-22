import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTasks } from '@/hooks/use-tasks';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
export function ActiveTasks() {
  const user = useAuthStore((s) => s.user);
  // Fetch tasks where user is involved (mocked by fetching created tasks for now)
  const { data: tasks, isLoading } = useTasks(undefined, user?.id);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/20 rounded-lg border border-dashed">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No active tasks</h3>
        <p className="text-muted-foreground mb-6">You haven't posted or accepted any tasks yet.</p>
        <Link to="/create-task">
          <Button>Create Task</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {tasks.map((task) => {
        const isScheduled = !!task.confirmed_time;
        const isCompleted = task.status === 'completed';
        return (
          <Card key={task.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <Badge variant={task.type === 'offer' ? 'default' : 'secondary'} className="mb-2">
                  {task.type}
                </Badge>
                <Badge variant="outline" className={cn(
                  "capitalize",
                  task.status === 'accepted' && "border-blue-500 text-blue-600",
                  task.status === 'in_progress' && "border-purple-500 text-purple-600",
                  task.status === 'completed' && "border-green-500 text-green-600"
                )}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  {task.estimated_credits} Credits Locked
                </div>
                {isScheduled ? (
                  <div className="flex items-center text-green-600 font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(task.confirmed_time!).toLocaleDateString()} at {new Date(task.confirmed_time!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Scheduling Needed
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              {task.status === 'open' ? (
                <Button variant="outline" className="w-full" disabled>Waiting for Accept</Button>
              ) : (
                <Link to={isScheduled ? `/tasks/${task.id}` : `/schedule/${task.id}`} className="w-full">
                  <Button className="w-full" variant={isScheduled ? "secondary" : "default"}>
                    {isScheduled ? 'View Details' : 'Schedule Now'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}