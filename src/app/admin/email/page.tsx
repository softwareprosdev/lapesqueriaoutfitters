'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Send,
  Inbox,
  Archive,
  Plus,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  X,
  ArchiveRestore,
  Eye,
  Clock,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Email {
  id: string;
  to: string;
  subject: string;
  htmlContent?: string | null;
  status: string;
  provider?: string | null;
  sentAt?: string | null;
  createdAt: string;
  archived: boolean;
}

type Tab = 'compose' | 'sent' | 'archived' | 'inbox';

export default function EmailClientPage() {
  const [activeTab, setActiveTab] = useState<Tab>('compose');
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'sent' ? '/api/admin/email/sent' : '/api/admin/email/archived';
      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails);
      } else {
        toast.error(data.error || 'Failed to fetch emails');
      }
    } catch (error) {
      console.error('Fetch emails error:', error);
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'sent' || activeTab === 'archived') {
      fetchEmails();
    }
  }, [activeTab, fetchEmails]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email sent successfully!');
        setEmailData({ to: '', cc: '', bcc: '', subject: '', body: '' });
        setShowCc(false);
        setShowBcc(false);
      } else {
        toast.error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error('Failed to send email');
    }
  };

  const handleArchive = async (emailId: string, archived: boolean) => {
    try {
      const response = await fetch('/api/admin/email/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId, archived }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchEmails();
        setSelectedEmail(null);
      } else {
        toast.error(data.error || 'Failed to archive email');
      }
    } catch (error) {
      console.error('Archive email error:', error);
      toast.error('Failed to archive email');
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setEmailData({ ...emailData, body: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 10);
  };

  const tabs = [
    { id: 'compose' as Tab, label: 'Compose', icon: Plus, color: 'from-cyan-500 to-teal-500' },
    { id: 'sent' as Tab, label: 'Sent', icon: Send, color: 'from-blue-500 to-indigo-500' },
    { id: 'archived' as Tab, label: 'Archive', icon: Archive, color: 'from-violet-500 to-purple-500' },
    { id: 'inbox' as Tab, label: 'Inbox', icon: Inbox, color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
          Email Client
        </h1>
        <p className="text-slate-600 text-lg">Send and manage your emails with beautiful ocean-themed interface</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-xl`
                  : 'bg-white text-slate-700 hover:shadow-lg border border-slate-200 hover:border-cyan-300'
              }`}
            >
              <div className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
              {!isActive && (
                <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'compose' && (
        <Card className="border-slate-200/60 shadow-2xl">
          <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-cyan-50 to-teal-50">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-600" />
              <span className="bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent">New Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSend} className="space-y-5">
              {/* To Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">To *</label>
                <input
                  type="email"
                  required
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  placeholder="recipient@example.com"
                />
                <div className="flex gap-3 mt-2">
                  {!showCc && (
                    <button
                      type="button"
                      onClick={() => setShowCc(true)}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      + Cc
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      type="button"
                      onClick={() => setShowBcc(true)}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      + Bcc
                    </button>
                  )}
                </div>
              </div>

              {/* CC Field */}
              {showCc && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cc</label>
                  <input
                    type="email"
                    value={emailData.cc}
                    onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    placeholder="cc@example.com"
                  />
                </div>
              )}

              {/* BCC Field */}
              {showBcc && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bcc</label>
                  <input
                    type="email"
                    value={emailData.bcc}
                    onChange={(e) => setEmailData({ ...emailData, bcc: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    placeholder="bcc@example.com"
                  />
                </div>
              )}

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  placeholder="Email subject"
                />
              </div>

              {/* Formatting Toolbar */}
              <div className="border-2 border-slate-200 rounded-t-xl bg-gradient-to-r from-slate-50 to-white p-3 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => insertText('**', '**')}
                  className="p-2.5 hover:bg-cyan-100 rounded-lg transition-colors group"
                  title="Bold"
                >
                  <Bold className="w-4 h-4 text-slate-600 group-hover:text-cyan-700" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText('*', '*')}
                  className="p-2.5 hover:bg-cyan-100 rounded-lg transition-colors group"
                  title="Italic"
                >
                  <Italic className="w-4 h-4 text-slate-600 group-hover:text-cyan-700" />
                </button>
                <div className="w-px bg-slate-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => insertText('[Link Text](https://)', '')}
                  className="p-2.5 hover:bg-cyan-100 rounded-lg transition-colors group"
                  title="Insert Link"
                >
                  <LinkIcon className="w-4 h-4 text-slate-600 group-hover:text-cyan-700" />
                </button>
                <div className="w-px bg-slate-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => insertText('- ', '\n')}
                  className="p-2.5 hover:bg-cyan-100 rounded-lg transition-colors group"
                  title="Bullet List"
                >
                  <List className="w-4 h-4 text-slate-600 group-hover:text-cyan-700" />
                </button>
              </div>

              {/* Message Body */}
              <div>
                <textarea
                  id="email-body"
                  required
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-slate-200 border-t-0 rounded-b-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 min-h-[350px] font-mono text-sm transition-all"
                  placeholder="Write your message here...

You can use basic markdown formatting:
**bold text**
*italic text*
[link text](https://example.com)
- bullet points"
                />
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t-2 border-slate-200">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-6 text-base font-semibold flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Email
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sent Emails */}
      {activeTab === 'sent' && (
        <Card className="border-slate-200/60 shadow-2xl">
          <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Sent Emails</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-600 border-r-transparent mb-4"></div>
                <p className="text-slate-600 font-medium">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-16">
                <Send className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium text-lg">No sent emails yet</p>
                <p className="text-slate-500 text-sm mt-2">Compose and send your first email to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="group p-5 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200/60 rounded-xl hover:shadow-lg hover:border-blue-300/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                            {email.subject}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">To:</span> {email.to}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(email.sentAt || email.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Sent
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(email.id, true);
                        }}
                        variant="outline"
                        size="sm"
                        className="hover:bg-violet-50 hover:border-violet-300 transition-all"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Archived Emails */}
      {activeTab === 'archived' && (
        <Card className="border-slate-200/60 shadow-2xl">
          <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-violet-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-violet-600" />
              <span className="bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">Archived Emails</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-600 border-r-transparent mb-4"></div>
                <p className="text-slate-600 font-medium">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-16">
                <Archive className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium text-lg">No archived emails</p>
                <p className="text-slate-500 text-sm mt-2">Archive emails from your sent folder to keep them organized</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="group p-5 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200/60 rounded-xl hover:shadow-lg hover:border-violet-300/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="w-4 h-4 text-violet-600 flex-shrink-0" />
                          <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors truncate">
                            {email.subject}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">To:</span> {email.to}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(email.sentAt || email.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(email.id, false);
                        }}
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50 hover:border-blue-300 transition-all"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inbox (Coming Soon) */}
      {activeTab === 'inbox' && (
        <Card className="border-slate-200/60 shadow-2xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="border-b border-emerald-200/60">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-emerald-600" />
              <span className="bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">Inbox</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <Inbox className="w-20 h-20 text-emerald-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Incoming Email Integration</h3>
            <p className="text-slate-600 text-lg mb-4">
              Resend is an outgoing email service. To receive emails, you&apos;ll need to integrate with an incoming email provider.
            </p>
            <div className="max-w-md mx-auto bg-white rounded-xl p-6 border-2 border-emerald-200 shadow-lg">
              <h4 className="font-semibold text-slate-900 mb-3">Recommended Providers:</h4>
              <ul className="space-y-2 text-sm text-slate-700 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Gmail API for Google Workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Microsoft Graph API for Office 365</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>IMAP/POP3 for custom email servers</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Reading Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-600" />
                  Email Details
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-slate-600">To:</label>
                  <p className="text-slate-900 font-medium">{selectedEmail.to}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Subject:</label>
                  <p className="text-lg font-bold text-slate-900">{selectedEmail.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Sent:</label>
                  <p className="text-slate-700">
                    {new Date(selectedEmail.sentAt || selectedEmail.createdAt).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="border-t-2 border-slate-200 pt-6">
                  <label className="text-sm font-semibold text-slate-600 mb-3 block">Message:</label>
                  {selectedEmail.htmlContent ? (
                    <div
                      className="prose max-w-none bg-slate-50 p-6 rounded-xl border border-slate-200"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                    />
                  ) : (
                    <p className="text-slate-600 italic">No content available</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t-2 border-slate-200 mt-6">
                {selectedEmail.archived ? (
                  <Button
                    onClick={() => handleArchive(selectedEmail.id, false)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  >
                    <ArchiveRestore className="w-4 h-4 mr-2" />
                    Unarchive
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleArchive(selectedEmail.id, true)}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedEmail(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
