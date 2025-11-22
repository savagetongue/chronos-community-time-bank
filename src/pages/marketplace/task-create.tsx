import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCreateTask } from '@/hooks/use-tasks';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
const taskSchema = z.object({
  type: z.enum(['offer', 'request']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  estimated_credits: z.coerce.number().min(1).max(20),
  mode: z.enum(['online', 'in_person', 'hybrid']),
  location_city: z.string().optional(),
  online_platform: z.string().optional(),
});
type TaskFormValues = z.infer<typeof taskSchema>;
const steps = [
  { id: 1, title: 'Basics', description: 'What are you offering or requesting?' },
  { id: 2, title: 'Details', description: 'Where and how will this happen?' },
  { id: 3, title: 'Review', description: 'Confirm your task details' },
];
export function TaskCreate() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const createTask = useCreateTask();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      type: 'request',
      title: '',
      description: '',
      estimated_credits: 1,
      mode: 'online',
      location_city: '',
      online_platform: '',
    },
    mode: 'onChange',
  });
  const { watch, trigger } = form;
  const formData = watch();
  const nextStep = async () => {
    let fieldsToValidate: (keyof TaskFormValues)[] = [];
    if (step === 1) fieldsToValidate = ['type', 'title', 'description', 'estimated_credits'];
    if (step === 2) fieldsToValidate = ['mode', 'location_city', 'online_platform'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);
  const onSubmit = async (data: TaskFormValues) => {
    if (!user) return;
    try {
      await createTask.mutateAsync({
        ...data,
        creator_id: user.id,
        status: 'open',
        visibility: 'public',
        max_participants: 1,
        travel_allowance: 0,
        cancellation_policy: 'flexible',
        location_city: data.location_city || null,
        online_platform: data.online_platform || null,
        location_state: null,
        location_country: null,
        location_lat: null,
        location_lng: null,
        online_link: null,
        proposed_times: null,
      });
      toast.success('Task created successfully!');
      navigate('/explore');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create task. Please try again.');
    }
  };
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to create a task</h2>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-chronos-teal -z-10 transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center bg-background px-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                ${step >= s.id
                  ? 'bg-chronos-teal border-chronos-teal text-white'
                  : 'bg-background border-muted-foreground text-muted-foreground'}
              `}>
                {step > s.id ? <Check className="w-5 h-5" /> : s.id}
              </div>
              <span className="text-xs font-medium mt-2 hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>
      </div>
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>{steps[step - 1].title}</CardTitle>
          <CardDescription>{steps[step - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I want to...</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="request">Request Help (Spend Credits)</SelectItem>
                              <SelectItem value="offer">Offer Help (Earn Credits)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Teach me Spanish basics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what you need or offering in detail..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estimated_credits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Credits (Hours)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={20} {...field} />
                          </FormControl>
                          <FormDescription>
                            1 Credit = 1 Hour of time.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Mode</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="in_person">In Person</SelectItem>
                              <SelectItem value="hybrid">Hybrid (Either)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {(formData.mode === 'in_person' || formData.mode === 'hybrid') && (
                      <FormField
                        control={form.control}
                        name="location_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., New York, NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {(formData.mode === 'online' || formData.mode === 'hybrid') && (
                      <FormField
                        control={form.control}
                        name="online_platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Platform</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Zoom, Google Meet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-secondary/20 p-6 rounded-lg border border-border">
                      <h3 className="text-lg font-bold mb-4">Summary</h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Type</dt>
                          <dd className="font-medium capitalize">{formData.type}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Credits</dt>
                          <dd className="font-medium">{formData.estimated_credits}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Mode</dt>
                          <dd className="font-medium capitalize">{formData.mode.replace('_', ' ')}</dd>
                        </div>
                        <div className="col-span-full">
                          <dt className="text-muted-foreground">Title</dt>
                          <dd className="font-medium">{formData.title}</dd>
                        </div>
                        <div className="col-span-full">
                          <dt className="text-muted-foreground">Description</dt>
                          <dd className="font-medium text-muted-foreground/80">{formData.description}</dd>
                        </div>
                      </dl>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-between pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} className="bg-chronos-teal hover:bg-chronos-teal/90 text-white">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-chronos-teal hover:bg-chronos-teal/90 text-white"
                    disabled={createTask.isPending}
                  >
                    {createTask.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Task
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}