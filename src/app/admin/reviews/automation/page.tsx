'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Pause, Mail, Eye, MessageSquare, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

interface ReviewWorkflow {
  id: string;
  name: string;
  triggerType: string;
  triggerDelayHours: number;
  subject: string;
  channel: string;
  remindersEnabled: boolean;
  remindersCount: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalReviewed: number;
  isActive: boolean;
  _count: { logs: number };
}

interface ReviewLog {
  id: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  workflow: { name: string };
}

export default function ReviewAutomationPage() {
  const [workflows, setWorkflows] = useState<ReviewWorkflow[]>([]);
  const [logs, setLogs] = useState<ReviewLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workflowsRes, logsRes] = await Promise.all([
        fetch('/api/admin/review-workflows'),
        fetch('/api/admin/review-workflows/logs?limit=20'),
      ]);

      if (workflowsRes.ok) {
        const data = await workflowsRes.json();
        setWorkflows(data.workflows || []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWorkflow = async (formData: FormData) => {
    try {
      const response = await fetch('/api/admin/review-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          triggerType: formData.get('triggerType'),
          triggerDelayHours: parseInt(formData.get('triggerDelayHours') as string) || 72,
          subject: formData.get('subject'),
          body: formData.get('body'),
          channel: formData.get('channel') || 'email',
          remindersEnabled: formData.get('remindersEnabled') === 'on',
          remindersCount: parseInt(formData.get('remindersCount') as string) || 2,
          incentiveType: formData.get('incentiveType') || null,
          incentiveValue: formData.get('incentiveValue') ? parseFloat(formData.get('incentiveValue') as string) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create workflow');
      }

      toast.success('Workflow created successfully');
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create workflow');
    }
  };

  const toggleWorkflowActive = async (workflow: ReviewWorkflow) => {
    try {
      await fetch(`/api/admin/review-workflows/${workflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !workflow.isActive }),
      });
      toast.success(`Workflow ${workflow.isActive ? 'disabled' : 'enabled'}`);
      fetchData();
    } catch {
      toast.error('Failed to update workflow');
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await fetch(`/api/admin/review-workflows/${id}`, { method: 'DELETE' });
      toast.success('Workflow deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete workflow');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-blue-100 text-blue-700';
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'OPENED': return 'bg-purple-100 text-purple-700';
      case 'CLICKED': return 'bg-orange-100 text-orange-700';
      case 'REVIEWED': return 'bg-teal-100 text-teal-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalSent = workflows.reduce((sum, w) => sum + w.totalSent, 0);
  const totalOpened = workflows.reduce((sum, w) => sum + w.totalOpened, 0);
  const totalReviewed = workflows.reduce((sum, w) => sum + w.totalReviewed, 0);
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const reviewRate = totalSent > 0 ? ((totalReviewed / totalSent) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Request Automation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Automate review requests after order delivery
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Review Request Workflow</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateWorkflow(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input id="name" name="name" required placeholder="e.g., Post-Delivery Review Request" />
                </div>
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <select id="channel" name="channel" className="w-full border rounded-md px-3 py-2">
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="both">Email + SMS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="triggerType">Trigger</Label>
                  <select id="triggerType" name="triggerType" className="w-full border rounded-md px-3 py-2">
                    <option value="order_delivered">Order Delivered</option>
                    <option value="order_completed">Order Completed</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="triggerDelayHours">Delay (hours)</Label>
                  <Input id="triggerDelayHours" name="triggerDelayHours" type="number" defaultValue="72" />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input id="subject" name="subject" required placeholder="How was your experience with {{productName}}?" />
              </div>

              <div>
                <Label htmlFor="body">Email Body (HTML)</Label>
                <Textarea
                  id="body"
                  name="body"
                  rows={6}
                  placeholder="<h1>Thank you for your order!</h1><p>We'd love to hear about your experience...</p>"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables: {'{{customerName}}'}, {'{{productName}}'}, {'{{orderNumber}}'}, {'{{reviewUrl}}'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="incentiveType">Incentive Type</Label>
                  <select id="incentiveType" name="incentiveType" className="w-full border rounded-md px-3 py-2">
                    <option value="">None</option>
                    <option value="discount">Discount %</option>
                    <option value="store_credit">Store Credit $</option>
                    <option value="loyalty_points">Loyalty Points</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="incentiveValue">Incentive Value</Label>
                  <Input id="incentiveValue" name="incentiveValue" type="number" placeholder="10" />
                </div>
                <div>
                  <Label htmlFor="remindersCount">Reminder Count</Label>
                  <Input id="remindersCount" name="remindersCount" type="number" defaultValue="2" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remindersEnabled" name="remindersEnabled" defaultChecked />
                <Label htmlFor="remindersEnabled">Enable automatic reminders</Label>
              </div>

              <Button type="submit" className="w-full">Create Workflow</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Reviews Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Review Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" />
            Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No workflows created yet. Create your first workflow to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                        <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Trigger: {workflow.triggerType.replace('_', ' ')} • {workflow.triggerDelayHours}h delay • {workflow.channel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWorkflowActive(workflow)}
                      >
                        {workflow.isActive ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWorkflow(workflow.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{workflow.totalSent} sent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span>{workflow.totalOpened} opened</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span>{workflow._count.logs} total logs</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reminders: </span>
                      <span>{workflow.remindersEnabled ? workflow.remindersCount : 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No activity yet</div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.customerEmail}</p>
                    <p className="text-xs text-gray-500">{log.workflow.name}</p>
                  </div>
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
