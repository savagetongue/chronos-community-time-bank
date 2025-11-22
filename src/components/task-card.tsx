import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Video, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/database';
import { cn } from '@/lib/utils';
interface TaskCardProps {
  task: Task & { profiles?: { display_name: string; reputation_score: number } };
}
export function TaskCard({ task }: TaskCardProps) {
  const isOffer = task.type === 'offer';
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className={cn(
            "h-2 w-full",
            isOffer ? "bg-chronos-teal" : "bg-chronos-amber"
          )} />
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <Badge variant={isOffer ? "default" : "secondary"} className={cn(
              "capitalize",
              isOffer ? "bg-chronos-teal hover:bg-chronos-teal/90" : "bg-chronos-amber hover:bg-chronos-amber/90 text-white"
            )}>
              {task.type}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground font-medium">
              <Clock className="w-4 h-4 mr-1" />
              {task.estimated_credits} Credit{task.estimated_credits !== 1 ? 's' : ''}
            </div>
          </div>
          <Link to={`/tasks/${task.id}`} className="group">
            <h3 className="text-xl font-bold mb-2 group-hover:text-chronos-teal transition-colors line-clamp-1">
              {task.title}
            </h3>
          </Link>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {task.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            {task.mode === 'online' ? (
              <div className="flex items-center bg-secondary px-2 py-1 rounded-full">
                <Video className="w-3 h-3 mr-1" />
                Online
              </div>
            ) : (
              <div className="flex items-center bg-secondary px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3 mr-1" />
                {task.location_city || 'In Person'}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-border/50 mt-auto bg-secondary/10">
          <div className="flex items-center gap-2 mt-4">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">
                {task.profiles?.display_name?.substring(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium">
                {task.profiles?.display_name || 'Unknown User'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {task.profiles?.reputation_score || 0} Reputation
              </span>
            </div>
          </div>
          <Link to={`/tasks/${task.id}`} className="mt-4">
            <Button size="sm" variant="ghost" className="h-8 px-2 hover:bg-chronos-teal/10 hover:text-chronos-teal">
              View
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}