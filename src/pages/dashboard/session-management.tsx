import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  MapPin,
  Video,
  Upload,
  Shield,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTask, useCheckIn, useCompleteTask, useUploadEvidence, useTaskFiles } from '@/hooks/use-tasks';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export function SessionManagement() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: task, isLoading } = useTask(id || '');
  const { data: files, isLoading: filesLoading } = useTaskFiles(id || '');
  const checkIn = useCheckIn();
  const completeTask = useCompleteTask();
  const uploadEvidence = useUploadEvidence();
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  if (!task || !user) return <div>Task not found or not authorized</div>;
  const isProvider = (task.type === 'request' && user.id !== task.creator_id) ||
                     (task.type === 'offer' && user.id === task.creator_id);
  const isScheduled = !!task.confirmed_time;
  const isInProgress = task.status === 'in_progress';
  const isCompleted = task.status === 'completed';
  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync(task.id);
      toast.success('Checked in successfully!');
    } catch (error) {
      toast.error('Failed to check in');
    }
  };
  const handleComplete = async () => {
    try {
      await completeTask.mutateAsync(task.id);
      toast.success('Task marked as completed! Escrow released.');
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        await uploadEvidence.mutateAsync({ file, taskId: task.id, userId: user.id });
      } catch (error) {
        // Error handled in hook
      } finally {
        // Reset input
        e.target.value = '';
      }
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="border-chronos-teal text-chronos-teal">
              {isProvider ? 'Provider View' : 'Requester View'}
            </Badge>
            <Badge className={cn(
              "capitalize",
              isCompleted ? "bg-green-500" : isInProgress ? "bg-purple-500" : "bg-blue-500"
            )}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{task.title}</h1>
        </div>
        {isCompleted && (
          <Button variant="outline" className="border-green-500 text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            Session Completed
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Action Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className="border-t-4 border-t-chronos-teal shadow-md">
            <CardHeader>
              <CardTitle>Session Status</CardTitle>
              <CardDescription>Current state of your exchange</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-8">
                  {/* Step 1: Scheduled */}
                  <div className="relative flex items-start pl-10">
                    <div className={cn(
                      "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-background",
                      isScheduled ? "border-green-500 text-green-500" : "border-muted text-muted-foreground"
                    )}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Scheduled</h4>
                      <p className="text-sm text-muted-foreground">
                        {isScheduled
                          ? `Confirmed for ${new Date(task.confirmed_time!).toLocaleString()}`
                          : "Waiting for scheduling"}
                      </p>
                      {!isScheduled && (
                        <Link to={`/schedule/${task.id}`}>
                          <Button size="sm" variant="outline" className="mt-2 hover:scale-105 transition-transform">Schedule Now</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  {/* Step 2: Check In */}
                  <div className="relative flex items-start pl-10">
                    <div className={cn(
                      "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-background",
                      isInProgress || isCompleted ? "border-green-500 text-green-500" : "border-muted text-muted-foreground"
                    )}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Check In</h4>
                      <p className="text-sm text-muted-foreground">Confirm you are ready to start</p>
                      {isScheduled && !isInProgress && !isCompleted && (
                        <Button
                          size="sm"
                          className="mt-2 bg-chronos-teal hover:bg-chronos-teal/90 text-white hover:scale-105 transition-transform"
                          onClick={handleCheckIn}
                          disabled={checkIn.isPending}
                        >
                          {checkIn.isPending ? 'Checking in...' : "I'm Here / Ready"}
                        </Button>
                      )}
                      {(isInProgress || isCompleted) && (
                        <Badge variant="secondary" className="mt-2 text-green-600 bg-green-50">Checked In</Badge>
                      )}
                    </div>
                  </div>
                  {/* Step 3: Completion */}
                  <div className="relative flex items-start pl-10">
                    <div className={cn(
                      "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-background",
                      isCompleted ? "border-green-500 text-green-500" : "border-muted text-muted-foreground"
                    )}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Completion</h4>
                      <p className="text-sm text-muted-foreground">Mark task as done to release credits</p>
                      {isInProgress && !isCompleted && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-transform"
                            onClick={handleComplete}
                            disabled={completeTask.isPending}
                          >
                            {completeTask.isPending ? 'Processing...' : 'Mark Complete'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Evidence Upload */}
          {(isInProgress || isCompleted) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Evidence & Records
                </CardTitle>
                <CardDescription>Upload screenshots or photos for dispute protection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-secondary/50 transition-colors relative">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,.pdf"
                      disabled={uploadEvidence.isPending}
                    />
                    {uploadEvidence.isPending ? (
                      <div className="flex flex-col items-center text-chronos-teal">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="font-medium">Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">Click or drag to upload evidence</p>
                        <p className="text-xs">Images, PDF, or small videos</p>
                      </div>
                    )}
                  </div>
                  {/* File List */}
                  {filesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : files && files.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                      {files.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative block aspect-square rounded-lg overflow-hidden border bg-secondary/20 hover:ring-2 ring-chronos-teal transition-all"
                        >
                          {file.mime_type.startsWith('image/') ? (
                            <img src={file.url} alt="Evidence" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                              <FileText className="w-8 h-8 mb-1" />
                              <span className="text-xs px-2 text-center truncate w-full">
                                {file.path.split('/').pop()}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center italic">No evidence uploaded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Meeting Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.mode === 'online' ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-medium">
                    <Video className="w-4 h-4" />
                    Online Meeting
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Platform: {task.online_platform || 'Zoom'}
                  </p>
                  {isScheduled ? (
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-transform">
                      Join Meeting
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Link available after scheduling</p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-medium">
                    <MapPin className="w-4 h-4" />
                    In Person
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.location_city || 'City TBD'}
                  </p>
                  {isScheduled && (
                    <Button size="sm" variant="outline" className="w-full mt-3 border-amber-200 text-amber-700 hover:bg-amber-100 hover:scale-105 transition-transform">
                      Get Directions
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Safety Tips */}
          <Card className="bg-secondary/20 border-none">
            <CardHeader>
              <CardTitle className="text-sm flex items-center text-muted-foreground">
                <Shield className="w-4 h-4 mr-2" />
                Safety First
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Keep communication within Chronos.</p>
              <p>• For in-person tasks, meet in public places first.</p>
              <p>• Verify the other person's profile details.</p>
              <Button variant="link" className="h-auto p-0 text-xs text-chronos-teal">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Report an Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}