import React, { useState } from 'react';
import { Users, AlertTriangle, Activity, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserTable } from '@/components/admin/user-table';
import { DisputePanel } from '@/components/admin/dispute-panel';
import { ReviewModerator } from '@/components/admin/review-moderator';
import { useAdminStats } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import JSZip from 'jszip';
export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const [isZipping, setIsZipping] = useState(false);
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      // List of critical files to include in the zip
      // In a real environment, this would be dynamic or server-side
      const filesToFetch = [
        'package.json',
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.node.json',
        'tailwind.config.js',
        'vite.config.ts',
        'index.html',
        'src/main.tsx',
        'src/index.css',
        'src/App.css',
        'src/vite-env.d.ts',
        'src/lib/supabase.ts',
        'src/lib/utils.ts',
        'src/lib/api-client.ts',
        'src/types/database.ts',
        'src/store/auth-store.ts',
        'src/hooks/use-admin.ts',
        'src/hooks/use-tasks.ts',
        'src/hooks/use-theme.ts',
        'src/components/layout/main-layout.tsx',
        'src/components/layout/navbar.tsx',
        'src/components/layout/AppLayout.tsx',
        'src/pages/landing-page.tsx',
        'src/pages/admin/admin-dashboard.tsx',
        'src/pages/dashboard/dashboard-home.tsx',
        'src/pages/marketplace/explore-page.tsx',
        'src/pages/marketplace/task-create.tsx',
        'src/pages/marketplace/task-detail.tsx',
        'src/pages/auth/login-page.tsx',
        'src/pages/auth/register-page.tsx',
        'worker/index.ts',
        'worker/core-utils.ts',
        'worker/entities.ts',
        'worker/user-routes.ts',
        'shared/types.ts',
        'shared/mock-data.ts'
      ];
      let successCount = 0;
      await Promise.all(filesToFetch.map(async (filePath) => {
        try {
          // Try to fetch the file relative to root
          const response = await fetch(`/${filePath}`);
          if (response.ok) {
            const content = await response.text();
            // Don't include HTML responses (e.g. if SPA fallback returns index.html for missing files)
            if (!content.trim().startsWith('<!doctype html>') && !content.trim().startsWith('<!DOCTYPE html>')) {
                zip.file(filePath, content);
                successCount++;
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch ${filePath}`, e);
        }
      }));
      if (successCount === 0) {
        throw new Error("Could not fetch source files. This feature requires the dev server to serve source files.");
      }
      // Generate the zip
      const content = await zip.generateAsync({ type: "blob" });
      // Trigger download
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = "chronos-project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Project zipped successfully! (${successCount} files)`);
    } catch (error) {
      console.error("Zip generation failed:", error);
      toast.error("Failed to generate ZIP. See console for details.");
    } finally {
      setIsZipping(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1">
            Platform governance and moderation overview.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-chronos-teal text-chronos-teal hover:bg-chronos-teal/10"
          onClick={handleDownloadZip}
          disabled={isZipping}
        >
          {isZipping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Zipping...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download ZIP
            </>
          )}
        </Button>
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