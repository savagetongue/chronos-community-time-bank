import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MapPin, Video, User, Shield, Calendar, ArrowLeft, Lock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTask, useAcceptTask, useAddReview, useRaiseDispute } from '@/hooks/use-tasks';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, error } = useTask(id || '');
  const user = useAuthStore((s) => s.user);
  const acceptTask = useAcceptTask();
  const addReview = useAddReview();
  const raiseDispute = useRaiseDispute();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDetails, setDisputeDetails] = useState('');
  const handleAccept = async () => {
    if (!user) {
      toast.error('Please log in to accept tasks');
      return;
    }
    if (!task) return;
    try {
      await acceptTask.mutateAsync({ taskId: task.id, userId: user.id });
      toast.success('Task accepted! Credits locked in escrow.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept task. Please try again.');
    }
  };
  const handleSubmitReview = async () => {
    if (!task || !user) return;
    try {
      await addReview.mutateAsync({
        task_id: task.id,
        reviewer_id: user.id,
        reviewee_id: task.creator_id, // Simplified: assumes reviewer is always reviewing creator for now
        rating: reviewRating,
        comment: reviewComment,
        tags: [],
        is_anonymous: false,
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleRaiseDispute = async () => {
    if (!task || !user) return;
    try {
      await raiseDispute.mutateAsync({
        escrow_id: 'mock-escrow-id', // In real app, fetch escrow ID
        raised_by: user.id,
        reason: disputeReason as any,
        details: disputeDetails,
        status: 'open',
        evidence: []
      });
    } catch (err) {
      console.error(err);
    }
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
  const isAccepted = task.status === 'accepted' || task.status === 'in_progress';
  const isCompleted = task.status === 'completed';
  const isCreator = user?.id === task.creator_id;
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
              {isAccepted && (
                <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Accepted
                </Badge>
              )}
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
          {/* Escrow Status */}
          {isAccepted && (
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-green-700 dark:text-green-400">
                  <Lock className="w-5 h-5 mr-2" />
                  Escrow Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {task.estimated_credits} Credits have been securely locked. They will be released to the provider upon task completion.
                </p>
                <Link to={`/schedule/${task.id}`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {/* Review Section (If Completed) */}
          {isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${star <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                      onClick={() => setReviewRating(star)}
                    />
                  ))}
                </div>
                <Textarea 
                  placeholder="Share your experience..." 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <Button onClick={handleSubmitReview} disabled={addReview.isPending}>
                  {addReview.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </CardContent>
            </Card>
          )}
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
              {!isAccepted && !isCompleted ? (
                <>
                  <Button
                    className="w-full bg-chronos-teal hover:bg-chronos-teal/90 text-white h-12 text-lg"
                    onClick={handleAccept}
                    disabled={isCreator || acceptTask.isPending}
                  >
                    {isCreator ? 'You Posted This' : acceptTask.isPending ? 'Processing...' : 'Accept Task'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By accepting, you agree to the Community Guidelines.
                  </p>
                </>
              ) : (
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <p className="font-medium text-foreground">
                    {isCompleted ? 'Task Completed' : 'Task in Progress'}
                  </p>
                  {!isCompleted && (
                    <Link to={`/schedule/${task.id}`} className="text-sm text-chronos-teal hover:underline">
                      Manage Schedule
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
            {/* Dispute Button */}
            {isAccepted && !isCompleted && (
              <CardFooter className="border-t pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Raise Dispute
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Raise a Dispute</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Select onValueChange={setDisputeReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no_show">No Show</SelectItem>
                          <SelectItem value="poor_quality">Poor Quality</SelectItem>
                          <SelectItem value="safety">Safety Concern</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea 
                        placeholder="Describe the issue in detail..." 
                        value={disputeDetails}
                        onChange={(e) => setDisputeDetails(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="destructive" onClick={handleRaiseDispute} disabled={raiseDispute.isPending}>
                        {raiseDispute.isPending ? 'Submitting...' : 'Submit Dispute'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            )}
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