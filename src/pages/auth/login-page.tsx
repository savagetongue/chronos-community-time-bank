import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase, checkSupabaseEnv } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { Profile } from '@/types/database';
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
type LoginFormValues = z.infer<typeof loginSchema>;
export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  // Polling for admin approval if logged in but not approved
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (user && profile && profile.is_approved === false) {
      interval = setInterval(async () => {
        const { data: freshProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (freshProfile && freshProfile.is_approved === true) {
          toast.success('Your account has been approved!');
          setSession(user, freshProfile as Profile);
          navigate('/dashboard');
          clearInterval(interval);
        }
      }, 30000); // Check every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, profile, setSession, navigate]);
  const onSubmit = useCallback(async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    // Check env vars
    if (!checkSupabaseEnv()) {
      toast.info('Sandbox: Using mock credentials. Real backend requires environment variables.');
    }
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        throw signInError;
      }
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        // Map Supabase errors to user-friendly messages
        const msg = err.message.toLowerCase();
        if (msg.includes('invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setError('Please configure your Supabase URL and key in environment variables to enable login.');
        } else {
          setError(err.message);
        }
        toast.error(err.message);
      } else {
        setError('An unknown error occurred');
        toast.error('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-chronos-teal/5 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chronos-teal to-indigo-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white">
            <Clock className="h-8 w-8" />
            <span className="text-2xl font-display font-bold">Chronos</span>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <blockquote className="text-2xl font-medium text-white mb-6">
            "Time is the only capital that any human being has, and the only thing he can't afford to lose."
          </blockquote>
          <p className="text-white/80 font-medium">— Thomas Edison</p>
        </div>
        <div className="relative z-10 text-white/60 text-sm">
          &copy; {new Date().getFullYear()} Chronos Community
        </div>
      </div>
      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader className="space-y-1 px-0">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button
                    type="submit"
                    className="w-full bg-chronos-teal hover:bg-chronos-teal/90 text-white"
                    disabled={isLoading}
                    >
                    Sign In
                    </Button>
                </form>
                </Form>
            )}
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-chronos-teal hover:text-chronos-teal/80 underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}