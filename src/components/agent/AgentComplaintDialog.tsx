import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const complaintSchema = z.object({
  category: z.enum(['general', 'technical', 'scheduling', 'management', 'safety', 'other']),
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
});

interface AgentComplaintDialogProps {
  agentId: string;
  assignedPropertyIds: string[];
}

export function AgentComplaintDialog({ agentId, assignedPropertyIds }: AgentComplaintDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: '' as string,
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = complaintSchema.parse(form);

      const { error } = await supabase.from('agent_complaints' as any).insert({
        agent_id: agentId,
        property_id: assignedPropertyIds[0] || null,
        category: validated.category,
        subject: validated.subject,
        message: validated.message,
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Complaint submitted successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Failed to submit complaint');
        console.error('Complaint submission error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ category: '', subject: '', message: '' });
    setSubmitted(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset on close
      setTimeout(() => {
        setForm({ category: '', subject: '', message: '' });
        setSubmitted(false);
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Send Complaint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit a Complaint</DialogTitle>
          <DialogDescription>
            Report an issue or concern to management. Your complaint will be reviewed promptly.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">Complaint Submitted</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Management will review your complaint and follow up.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Submit Another
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complaint-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="scheduling">Scheduling</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="safety">Safety Concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-subject">Subject</Label>
              <Input
                id="complaint-subject"
                placeholder="Brief summary of your complaint"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-message">Details</Label>
              <Textarea
                id="complaint-message"
                placeholder="Describe the issue in detail..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                maxLength={3000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.message.length}/3000
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting || !form.category} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
