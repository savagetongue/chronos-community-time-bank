import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '@/components/filters/task-filters';
import { TaskCard } from '@/components/task-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTasks, TaskFilters as FilterType } from '@/hooks/use-tasks';
import { useAuthStore } from '@/store/auth-store';
export function ExplorePage() {
  const user = useAuthStore((s) => s.user);
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    type: 'all',
    mode: 'all',
    minCredits: 0,
    maxCredits: 10,
  });
  const { data: tasks, isLoading, error } = useTasks(filters);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">
            Explore <span className="text-chronos-teal">Opportunities</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Find help for your projects or offer your skills to earn credits.
          </p>
        </div>
        {user ? (
          <Link to="/create-task">
            <Button className="bg-chronos-teal hover:bg-chronos-teal/90 text-white shadow-lg hover:shadow-xl transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Post a Task
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button variant="outline">
              Log in to Post
            </Button>
          </Link>
        )}
      </div>
      {/* Filters */}
      <div className="mb-8 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <TaskFilters filters={filters} setFilters={setFilters} />
      </div>
      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton variant="card" />
              <div className="space-y-2">
                <Skeleton variant="line" className="w-3/4" />
                <Skeleton variant="line" className="w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-destructive/5 rounded-lg border border-destructive/20">
          <h3 className="text-lg font-medium text-destructive mb-2">Failed to load tasks</h3>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      ) : tasks?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-lg border border-border border-dashed">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or be the first to post!
          </p>
          {user && (
            <Link to="/create-task">
              <Button variant="outline">Create Task</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}