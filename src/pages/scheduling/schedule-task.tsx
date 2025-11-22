import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Calendar as CalendarIcon, Clock, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTask, useUpdateTask } from '@/hooks/use-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import 'react-day-picker/style.css';
export function ScheduleTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading } = useTask(id || '');
  const updateTask = useUpdateTask();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [step, setStep] = useState(1);
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (!task) return <div>Task not found</div>;
  const handleConfirm = async () => {
    if (!selectedDate) return;
    // Combine date and time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const confirmedDateTime = new Date(selectedDate);
    confirmedDateTime.setHours(hours, minutes);
    try {
      await updateTask.mutateAsync({
        id: task.id,
        updates: {
          confirmed_time: confirmedDateTime.toISOString(),
          status: 'in_progress' // Move to in_progress once scheduled
        }
      });
      toast.success('Session scheduled successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule session');
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Schedule Session</h1>
          <p className="text-muted-foreground mb-8">
            Coordinate a time for: <span className="font-medium text-foreground">{task.title}</span>
          </p>
          <div className="space-y-6">
            <Card className={step === 1 ? 'border-chronos-teal ring-1 ring-chronos-teal' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  1. Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center p-4 bg-background rounded-lg border">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) setStep(2);
                    }}
                    disabled={{ before: new Date() }}
                    className="p-0"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className={step === 2 ? 'border-chronos-teal ring-1 ring-chronos-teal' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  2. Select Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 13 }).map((_, i) => {
                      const hour = i + 8; // 8 AM to 8 PM
                      const timeString = `${hour.toString().padStart(2, '0')}:00`;
                      return (
                        <SelectItem key={timeString} value={timeString}>
                          {timeString} ({hour > 12 ? `${hour - 12} PM` : `${hour} AM`})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <Card className="bg-secondary/20 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Review your scheduled time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <span className="text-muted-foreground">Timezone</span>
                <span className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
              </div>
              <Button 
                className="w-full h-12 text-lg bg-chronos-teal hover:bg-chronos-teal/90 text-white"
                onClick={handleConfirm}
                disabled={!selectedDate || updateTask.isPending}
              >
                {updateTask.isPending ? 'Confirming...' : 'Confirm Schedule'}
                <Check className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}