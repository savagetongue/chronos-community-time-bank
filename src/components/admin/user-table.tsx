import React, { useEffect } from 'react';
import { Check, X, Search, User, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useUnapprovedUsers, useApproveUser, useRejectUser } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
export function UserTable() {
  const { data: users, isLoading, refetch } = useUnapprovedUsers();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const [search, setSearch] = React.useState('');
  const [openItems, setOpenItems] = React.useState<string[]>([]);
  useEffect(() => {
    const channel = supabase.channel('admin-users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => refetch())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const filteredUsers = users?.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );
  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="ml-2">
          {filteredUsers?.length || 0} Pending
        </Badge>
      </div>
      {/* Desktop Table */}
      <div className="hidden sm:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No pending users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="truncate max-w-[120px] lg:max-w-none">
                          {user.display_name || 'No Name'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 whitespace-nowrap">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0">
                              <Check className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to approve <strong>{user.display_name || user.email}</strong>? They will be able to post and accept tasks immediately.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                onClick={() => approveUser.mutate(user.id)}
                                disabled={approveUser.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {approveUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Approval'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                              <X className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject User</DialogTitle>
                              <DialogDescription>
                                This will suspend the account for <strong>{user.display_name || user.email}</strong>.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={() => rejectUser.mutate(user.id)}
                                disabled={rejectUser.isPending}
                              >
                                {rejectUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      {/* Mobile List with Collapsible Cards */}
      <div className="sm:hidden space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredUsers?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending users found.
            </div>
          ) : (
            filteredUsers?.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border rounded-lg overflow-hidden"
              >
                <Collapsible
                  open={openItems.includes(user.id)}
                  onOpenChange={() => toggleItem(user.id)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{user.display_name || 'No Name'}</p>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">
                          Pending
                        </Badge>
                      </div>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {openItems.includes(user.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="px-4 pb-4 pt-0 space-y-4">
                    <div className="text-sm text-muted-foreground space-y-1 border-t pt-3">
                      <p><span className="font-medium text-foreground">Email:</span> {user.email}</p>
                      <p><span className="font-medium text-foreground">Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve User</DialogTitle>
                            <DialogDescription>
                              Approve <strong>{user.display_name || user.email}</strong>?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              onClick={() => approveUser.mutate(user.id)}
                              disabled={approveUser.isPending}
                              className="bg-green-600 text-white w-full"
                            >
                              Confirm
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                            <X className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject User</DialogTitle>
                            <DialogDescription>
                              Suspend <strong>{user.display_name || user.email}</strong>?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="destructive"
                              onClick={() => rejectUser.mutate(user.id)}
                              disabled={rejectUser.isPending}
                              className="w-full"
                            >
                              Reject
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}