import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Video, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/database';
import { cn } from '@/lib/utils';
interface SessionCardProps {
  task: Task;
  isProvider: boolean;
}
export function SessionCard({ task, isProvider }: SessionCardProps) {
  const isScheduled = !!task.confirmed_time;
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-l-4 border-l-chronos-teal shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="mb-2 border-chronos-teal text-chronos-teal">
              {isProvider ? 'Providing Help' : 'Receiving Help'}
            </Badge>
            <Badge className={cn(
              "capitalize",
              isCompleted ? "bg-green-500" : isInProgress ? "bg-purple-500" : "bg-blue-500"
            )}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          <CardTitle className="text-xl">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {task.estimated_credits} Credits Locked in Escrow
            </div>
            {isScheduled ? (
              <div className="flex items-center text-foreground font-medium">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Scheduled: {new Date(task.confirmed_time!).toLocaleString()}
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Scheduling Required
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              {task.mode === 'online' ? (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Online ({task.online_platform || 'Platform TBD'})
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  In Person ({task.location_city || 'Location TBD'})
                </>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-secondary/10 pt-4">
          <Link to={`/session/${task.id}`} className="w-full">
            <Button className="w-full bg-chronos-teal hover:bg-chronos-teal/90 text-white">
              Manage Session
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}