import React from 'react';
import { Check, X, Search, User, Loader2 } from 'lucide-react';
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
import { useUnapprovedUsers, useApproveUser, useRejectUser } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';
export function UserTable() {
  const { data: users, isLoading } = useUnapprovedUsers();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const [search, setSearch] = React.useState('');
  const filteredUsers = users?.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
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
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No pending users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {user.display_name || 'No Name'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}