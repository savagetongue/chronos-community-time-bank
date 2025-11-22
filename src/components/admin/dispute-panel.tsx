import React, { useState } from 'react';
import { AlertTriangle, FileText, Gavel, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDisputes, useResolveDispute } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';
export function DisputePanel() {
  const { data: disputes, isLoading } = useDisputes();
  const resolveDispute = useResolveDispute();
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [decision, setDecision] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const selectedDispute = disputes?.find(d => d.id === selectedDisputeId);
  const handleResolve = () => {
    if (!selectedDisputeId || !decision) return;
    resolveDispute.mutate({
      disputeId: selectedDisputeId,
      decision,
      payload: { notes }
    });
    setSelectedDisputeId(null);
    setDecision('');
    setNotes('');
  };
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* List */}
      <Card className="lg:col-span-1 overflow-hidden flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Active Disputes</CardTitle>
          <CardDescription>{disputes?.length || 0} cases requiring attention</CardDescription>
        </CardHeader>
        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2">
          {disputes?.map(dispute => (
            <div 
              key={dispute.id}
              onClick={() => setSelectedDisputeId(dispute.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedDisputeId === dispute.id 
                  ? 'bg-accent border-accent-foreground/20' 
                  : 'hover:bg-secondary/50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <Badge variant={dispute.status === 'open' ? 'destructive' : 'outline'}>
                  {dispute.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(dispute.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="font-medium text-sm line-clamp-1">
                {dispute.reason.replace('_', ' ')}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {dispute.details}
              </p>
            </div>
          ))}
          {disputes?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active disputes.
            </div>
          )}
        </div>
      </Card>
      {/* Detail */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedDispute ? (
          <>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Dispute #{selectedDispute.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    Reason: <span className="font-medium text-foreground capitalize">{selectedDispute.reason.replace('_', ' ')}</span>
                  </CardDescription>
                </div>
                {selectedDispute.status === 'resolved' && (
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                <div className="p-4 bg-secondary/20 rounded-md text-sm">
                  {selectedDispute.details}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Evidence</h4>
                {selectedDispute.evidence && selectedDispute.evidence.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDispute.evidence.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center p-2 border rounded hover:bg-secondary">
                        <FileText className="h-4 w-4 mr-2" />
                        Evidence {i + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No evidence uploaded.</p>
                )}
              </div>
              {selectedDispute.status === 'open' && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium flex items-center">
                    <Gavel className="h-4 w-4 mr-2" />
                    Resolution
                  </h4>
                  <div className="grid gap-4">
                    <Select value={decision} onValueChange={setDecision}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select decision..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="refund_requester">Full Refund to Requester</SelectItem>
                        <SelectItem value="release_provider">Release Full Amount to Provider</SelectItem>
                        <SelectItem value="split_50_50">Split 50/50</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Admin notes regarding this decision..." 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            {selectedDispute.status === 'open' && (
              <CardFooter className="border-t pt-4">
                <Button 
                  className="w-full bg-destructive hover:bg-destructive/90 text-white"
                  onClick={handleResolve}
                  disabled={!decision || resolveDispute.isPending}
                >
                  {resolveDispute.isPending ? 'Processing...' : 'Finalize Decision'}
                </Button>
              </CardFooter>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Gavel className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a dispute to view details</p>
          </div>
        )}
      </Card>
    </div>
  );
}