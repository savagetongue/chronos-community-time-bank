import React from 'react';
import { Star, Eye, EyeOff, Flag, MoreHorizontal } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminReviews, useModerateReview } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
export function ReviewModerator() {
  const { data: reviews, isLoading } = useAdminReviews();
  const moderateReview = useModerateReview();
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border overflow-hidden">
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
            <AnimatePresence mode="popLayout">
              {reviews?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                reviews?.map((review) => (
                  <motion.tr
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      review.is_hidden ? 'bg-muted/50 opacity-70' : ''
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate font-medium">{review.title || 'No Title'}</div>
                      <div className="truncate text-sm text-muted-foreground">{review.comment || 'No comment provided.'}</div>
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
                        disabled={moderateReview.isPending}
                      >
                        {review.is_hidden ? (
                          <><Eye className="h-4 w-4 mr-2" /> Unhide</>
                        ) : (
                          <><EyeOff className="h-4 w-4 mr-2" /> Hide</>
                        )}
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        <AnimatePresence mode="popLayout">
          {reviews?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found.
            </div>
          ) : (
            reviews?.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn(review.is_hidden ? 'bg-muted/50 opacity-70' : '')}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{review.rating}/5</span>
                      </div>
                      {review.is_hidden ? (
                        <Badge variant="destructive">Hidden</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Public</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base pt-1">{review.title || 'No Title'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {review.comment || 'No comment provided.'}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderateReview.mutate({ reviewId: review.id, isHidden: !review.is_hidden })}
                        disabled={moderateReview.isPending}
                      >
                        {review.is_hidden ? (
                          <><Eye className="h-4 w-4 mr-2" /> Unhide</>
                        ) : (
                          <><EyeOff className="h-4 w-4 mr-2" /> Hide</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}