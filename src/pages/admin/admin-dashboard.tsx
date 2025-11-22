import React from 'react';
import { Users, AlertTriangle, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserTable } from '@/components/admin/user-table';
import { DisputePanel } from '@/components/admin/dispute-panel';
import { ReviewModerator } from '@/components/admin/review-moderator';
import { useAdminStats } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';
export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground mt-1">
          Platform governance and moderation overview.
        </p>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.users || 0}</div>
                <p className="text-xs text-muted-foreground">Registered members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.disputes || 0}</div>
                <p className="text-xs text-muted-foreground">Requiring attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Activity className="h-4 w-4 text-chronos-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.tasks || 0}</div>
                <p className="text-xs text-muted-foreground">Platform activity</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="reviews">Review Moderation</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserTable />
        </TabsContent>
        <TabsContent value="disputes" className="space-y-4">
          <DisputePanel />
        </TabsContent>
        <TabsContent value="reviews" className="space-y-4">
          <ReviewModerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}