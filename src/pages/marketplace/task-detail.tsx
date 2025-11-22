import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MapPin, Video, User, Shield, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTask } from '@/hooks/use-tasks';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, error } = useTask(id || '');
  const user = useAuthStore((s) => s.user);
  const handleAccept = () => {
    if (!user) {
      toast.error('Please log in to accept tasks');
      return;
    }
    // Mock logic for now - Phase 3 will implement real escrow
    toast.success('Task accepted! Credits locked in escrow.');
  };
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !task) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Task not found</h2>
        <Link to="/explore">
          <Button variant="outline">Back to Explore</Button>
        </Link>
      </div>
    );
  }
  const isOffer = task.type === 'offer';
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Link to="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Explore
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={isOffer ? "default" : "secondary"} className={
                isOffer ? "bg-chronos-teal" : "bg-chronos-amber text-white"
              }>
                {task.type.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Posted {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{task.title}</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          </div>
          {/* Location/Mode Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                {task.mode === 'online' ? <Video className="w-5 h-5 mr-2" /> : <MapPin className="w-5 h-5 mr-2" />}
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {task.mode === 'online' ? (
                <div className="space-y-2">
                  <p className="font-medium">Online Task</p>
                  <p className="text-sm text-muted-foreground">
                    Platform: {task.online_platform || 'To be decided'}
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    Link will be shared after acceptance.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted h-48 rounded-lg flex items-center justify-center text-muted-foreground">
                    Map Placeholder (Google Maps Integration)
                  </div>
                  <div>
                    <p className="font-medium">{task.location_city}, {task.location_state}</p>
                    <p className="text-sm text-muted-foreground">
                      Exact address hidden until accepted for safety.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="border-chronos-teal/20 shadow-lg">
            <CardHeader className="bg-chronos-teal/5 border-b border-chronos-teal/10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Value</span>
                <span className="text-2xl font-bold text-chronos-teal">
                  {task.estimated_credits} Credits
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" /> Duration
                </span>
                <span className="font-medium">~{task.estimated_credits} Hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-muted-foreground">
                  <Shield className="w-4 h-4 mr-2" /> Escrow
                </span>
                <span className="font-medium text-green-600">Protected</span>
              </div>
              <Button 
                className="w-full bg-chronos-teal hover:bg-chronos-teal/90 text-white h-12 text-lg"
                onClick={handleAccept}
                disabled={user?.id === task.creator_id}
              >
                {user?.id === task.creator_id ? 'You Posted This' : 'Accept Task'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By accepting, you agree to the Community Guidelines.
              </p>
            </CardContent>
          </Card>
          {/* Creator Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the {isOffer ? 'Provider' : 'Requester'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {task.profiles?.display_name?.substring(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.profiles?.display_name || 'Unknown User'}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-3 h-3 mr-1" />
                    Member since 2024
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center border-t border-border pt-4">
                <div>
                  <div className="text-xl font-bold">{task.profiles?.reputation_score || 0}</div>
                  <div className="text-xs text-muted-foreground">Reputation</div>
                </div>
                <div>
                  <div className="text-xl font-bold">100%</div>
                  <div className="text-xs text-muted-foreground">Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}