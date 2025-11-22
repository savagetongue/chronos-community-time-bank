import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { supabase, supabaseAdmin, checkSupabaseEnv } from '@/lib/supabase';
import { toast } from 'sonner';
import { ProfileInsert } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type RegisterFormValues = z.infer<typeof registerSchema>;
export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const onSubmit = useCallback(async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    // Check env vars
    if (!checkSupabaseEnv()) {
      toast.info('Sandbox: Using mock credentials. Real backend requires environment variables.');
    }
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.name,
          },
        },
      });
      if (signUpError) throw signUpError;
      if (authData.user) {
        // Check if profile exists (trigger might have created it)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single();
        // Admin Auto-Approval Logic
        if (authData.user.email === 'admin@gmail.com') {
          try {
            const { error: adminUpdateError } = await supabaseAdmin
              .from('profiles')
              .update({ is_approved: true })
              .eq('id', authData.user.id);
            if (adminUpdateError) {
              console.error('Admin auto-approval failed:', adminUpdateError);
            } else {
              toast.success('Admin account created and approved!');
              navigate('/dashboard');
              return; // Skip success screen
            }
          } catch (err) {
            console.error('Admin auto-approval exception:', err);
          }
        }
        if (!existingProfile) {
          // Fallback: Create profile manually if trigger failed
          // Use Partial<ProfileInsert> with only core fields to avoid schema mismatch errors
          const profileData: Partial<ProfileInsert> = {
            id: authData.user.id,
            email: data.email,
            display_name: data.name,
            is_approved: false,
            credits: 0,
            locked_credits: 0,
            reputation_score: 0,
            completed_tasks_count: 0,
            is_suspended: false,
            kyc_level: 0,
            // Explicitly omit optional fields that might cause issues if schema is out of sync
          };
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([profileData as ProfileInsert]); // Cast to ProfileInsert to satisfy type checker, but we know it's partial
            if (profileError) {
              console.error('Profile creation fallback failed:', profileError);
              // Don't block success if auth worked, but warn
              toast.warning('Account created but profile setup incomplete. Please contact support.');
            } else {
              toast.success('Profile created successfully!');
            }
          } catch (fallbackError) {
             console.error('Profile creation fallback exception:', fallbackError);
             toast.warning('Account created. Profile setup encountered an issue.');
          }
        } else {
          toast.success('Account created! Profile setup via system trigger.');
        }
        setSuccess(true);
      }
    } catch (err) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes('network') || msg.includes('fetch')) {
          setError('Network error. Please check your connection or Supabase configuration.');
        } else if (msg.includes('password')) {
          setError('Password must meet requirements (8+ chars).');
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
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Account Created!</CardTitle>
            <CardDescription className="text-center">
              Your account is pending admin approval. You will be notified once approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-chronos-teal hover:bg-chronos-teal/90"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-chronos-amber/5 p-12 relative overflow-hidden order-2">
        <div className="absolute inset-0 bg-gradient-to-bl from-chronos-amber to-orange-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="relative z-10 flex justify-end">
          <div className="flex items-center gap-2 text-white">
            <Clock className="h-8 w-8" />
            <span className="text-2xl font-display font-bold">Chronos</span>
          </div>
        </div>
        <div className="relative z-10 max-w-md ml-auto text-right">
          <blockquote className="text-2xl font-medium text-white mb-6">
            "Community is much more than belonging to something; it's about doing something together that makes belonging matter."
          </blockquote>
          <p className="text-white/80 font-medium">— Brian Solis</p>
        </div>
        <div className="relative z-10 text-white/60 text-sm text-right">
          Join the movement.
        </div>
      </div>
      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-background order-1">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader className="space-y-1 px-0">
            <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription>
              Enter your details below to join the community
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
               <div className="space-y-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
               </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-chronos-teal hover:bg-chronos-teal/90 text-white mt-2"
                    disabled={isLoading}
                  >
                    Sign Up
                  </Button>
                </form>
              </Form>
            )}
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-chronos-teal hover:text-chronos-teal/80 underline-offset-4 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}