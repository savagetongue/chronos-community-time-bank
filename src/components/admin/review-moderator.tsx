import React from 'react';
import { Star, Eye, EyeOff, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminReviews, useModerateReview } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';
export function ReviewModerator() {
  const { data: reviews, isLoading } = useAdminReviews();
  const moderateReview = useModerateReview();
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No reviews found.
              </TableCell>
            </TableRow>
          ) : (
            reviews?.map((review) => (
              <TableRow key={review.id} className={review.is_hidden ? 'bg-muted/50 opacity-70' : ''}>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium">{review.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate font-medium">{review.title}</div>
                  <div className="truncate text-sm text-muted-foreground">{review.comment}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {review.is_hidden ? (
                    <Badge variant="destructive">Hidden</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Public</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moderateReview.mutate({ reviewId: review.id, isHidden: !review.is_hidden })}
                  >
                    {review.is_hidden ? (
                      <><Eye className="h-4 w-4 mr-2" /> Unhide</>
                    ) : (
                      <><EyeOff className="h-4 w-4 mr-2" /> Hide</>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}