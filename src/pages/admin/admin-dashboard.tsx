import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { data: stats, isLoading, refetch } = useAdminStats();
  const [isZipping, setIsZipping] = useState(false);
  // Real-time stats update
  useEffect(() => {
    const interval = setInterval(() => refetch(), 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [refetch]);
  const handleDownloadZip = async () => {
    setIsZipping(true);
    const toastId = toast.loading('Initializing ZIP download...');
    try {
      const zip = new JSZip();
      // Comprehensive list of files to include
      const filesToFetch = [
        'package.json',
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.node.json',
        'tailwind.config.js',
        'vite.config.ts',
        'index.html',
        'wrangler.jsonc',
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
        'src/hooks/use-mobile.tsx',
        'src/components/layout/main-layout.tsx',
        'src/components/layout/navbar.tsx',
        'src/components/layout/AppLayout.tsx',
        'src/pages/landing-page.tsx',
        'src/pages/admin/admin-dashboard.tsx',
        'src/pages/dashboard/dashboard-home.tsx',
        'src/pages/dashboard/session-management.tsx',
        'src/pages/dashboard/active-tasks.tsx',
        'src/pages/marketplace/explore-page.tsx',
        'src/pages/marketplace/task-create.tsx',
        'src/pages/marketplace/task-detail.tsx',
        'src/pages/scheduling/schedule-task.tsx',
        'src/pages/auth/login-page.tsx',
        'src/pages/auth/register-page.tsx',
        'src/components/admin/user-table.tsx',
        'src/components/admin/dispute-panel.tsx',
        'src/components/admin/review-moderator.tsx',
        'src/components/admin/notification-center.tsx',
        'src/components/session-card.tsx',
        'src/components/task-card.tsx',
        'src/components/filters/task-filters.tsx',
        'src/components/ui/skeleton.tsx',
        'src/components/ui/button.tsx',
        'src/components/ui/card.tsx',
        'src/components/ui/input.tsx',
        'src/components/ui/badge.tsx',
        'src/components/ui/avatar.tsx',
        'src/components/ui/dialog.tsx',
        'src/components/ui/sheet.tsx',
        'src/components/ui/table.tsx',
        'src/components/ui/tabs.tsx',
        'src/components/ui/select.tsx',
        'src/components/ui/textarea.tsx',
        'src/components/ui/progress.tsx',
        'src/components/ui/sonner.tsx',
        'src/components/ui/collapsible.tsx',
        'worker/index.ts',
        'worker/core-utils.ts',
        'worker/entities.ts',
        'worker/user-routes.ts',
        'shared/types.ts',
        'shared/mock-data.ts',
        'supabase/migrations/init.sql'
      ];
      let successCount = 0;
      const totalFiles = filesToFetch.length;
      // Fetch files with progress updates
      for (let i = 0; i < totalFiles; i++) {
        const filePath = filesToFetch[i];
        try {
          // Update toast every 5 files to avoid spamming
          if (i % 5 === 0) {
            toast.loading(`Fetching files... ${Math.round((i / totalFiles) * 100)}%`, { id: toastId });
          }
          const response = await fetch(`/${filePath}`);
          if (response.ok) {
            const content = await response.text();
            // Filter out HTML responses (SPA fallback)
            if (!content.trim().startsWith('<!doctype html>') && !content.trim().startsWith('<!DOCTYPE html>')) {
                zip.file(filePath, content);
                successCount++;
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch ${filePath}`, e);
        }
        // Small delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      if (successCount === 0) {
        throw new Error("Could not fetch source files. Dev server required.");
      }
      toast.loading('Compressing...', { id: toastId });
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = "chronos-project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Project zipped successfully! (${successCount} files)`, { id: toastId });
    } catch (error) {
      console.error("Zip generation failed:", error);
      toast.error("Failed to generate ZIP. See console.", { id: toastId });
    } finally {
      setIsZipping(false);
    }
  };
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <motion.div variants={item} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="hover:shadow-glow transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.users || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered members</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="hover:shadow-glow transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.disputes || 0}</div>
                  <p className="text-xs text-muted-foreground">Requiring attention</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={item} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="hover:shadow-glow transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <Activity className="h-4 w-4 text-chronos-teal" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.tasks || 0}</div>
                  <p className="text-xs text-muted-foreground">Platform activity</p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="reviews">Review Moderation</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="users" className="space-y-4">
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UserTable />
            </motion.div>
          </TabsContent>
          <TabsContent value="disputes" className="space-y-4">
            <motion.div 
              key="disputes"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DisputePanel />
            </motion.div>
          </TabsContent>
          <TabsContent value="reviews" className="space-y-4">
            <motion.div 
              key="reviews"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReviewModerator />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}