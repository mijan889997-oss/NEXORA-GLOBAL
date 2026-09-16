import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  User,
  Check,
  Copy,
  Trash2,
  X,
  AlertCircle,
  Send,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import type { Dispute, TicketReply } from '../types';

interface AdminSupportTicketsProps {
  tickets: Dispute[];
  onRefresh: () => void;
  apiFetch: (url: string, options?: any) => Promise<any>;
  currentUser?: any;
}

export const AdminSupportTickets: React.FC<AdminSupportTicketsProps> = ({
  tickets,
  onRefresh,
  apiFetch,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'under_review' | 'replied' | 'resolved' | 'closed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Reply & Resolve Modal state
  const [activeTicket, setActiveTicket] = useState<Dispute | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState<'open' | 'under_review' | 'replied' | 'resolved' | 'closed'>('replied');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete modal state
  const [ticketToDelete, setTicketToDelete] = useState<Dispute | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const num = (t.ticketNumber || '').toLowerCase();
        const name = (t.userName || '').toLowerCase();
        const email = (t.userEmail || '').toLowerCase();
        const subject = (t.subject || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const reply = (t.adminReply || '').toLowerCase();
        return (
          num.includes(query) ||
          name.includes(query) ||
          email.includes(query) ||
          subject.includes(query) ||
          desc.includes(query) ||
          reply.includes(query)
        );
      }
      return true;
    });
  }, [tickets, statusFilter, categoryFilter, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'open').length;
    const underReview = tickets.filter((t) => t.status === 'under_review').length;
    const replied = tickets.filter((t) => t.status === 'replied').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    const closed = tickets.filter((t) => t.status === 'closed').length;
    return { total, open, underReview, replied, resolved, closed };
  }, [tickets]);

  // Open modal for ticket
  const handleOpenReplyModal = (ticket: Dispute) => {
    setActiveTicket(ticket);
    setReplyMessage('');
    setNewStatus(ticket.status === 'resolved' ? 'resolved' : 'replied');
    setResolutionNotes(ticket.resolutionNotes || '');
  };

  // Submit Reply / Resolution
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    setIsSubmitting(true);
    try {
      // Send to server
      const res = await apiFetch(`/api/admin/disputes/${activeTicket.id}/reply`, {
        method: 'PUT',
        body: JSON.stringify({
          replyMessage: replyMessage.trim() || undefined,
          status: newStatus,
          resolutionNotes: resolutionNotes.trim() || undefined,
        }),
      }).catch(async () => {
        return await apiFetch(`/api/admin/disputes/${activeTicket.id}/status`, {
          method: 'PUT',
          body: JSON.stringify({
            status: newStatus,
            resolutionNotes: resolutionNotes.trim() || undefined,
            adminReply: replyMessage.trim() || undefined,
          }),
        });
      });

      // Update in localStorage to guarantee instant cross-tab syncing
      try {
        const rawLocal = localStorage.getItem('nexvora_support_tickets');
        let localTickets: Dispute[] = rawLocal ? JSON.parse(rawLocal) : [];
        const existingIdx = localTickets.findIndex((t) => t.id === activeTicket.id || t.ticketNumber === activeTicket.ticketNumber);
        const updatedTicket: Dispute = {
          ...activeTicket,
          status: newStatus,
          adminReply: replyMessage.trim() || activeTicket.adminReply,
          resolutionNotes: resolutionNotes.trim() || activeTicket.resolutionNotes,
          updatedAt: new Date().toISOString(),
          replies: [
            ...(activeTicket.replies || []),
            ...(replyMessage.trim()
              ? [
                  {
                    id: `rep_${Date.now()}`,
                    senderName: currentUser?.fullName || 'Support Staff',
                    senderRole: 'admin' as const,
                    message: replyMessage.trim(),
                    createdAt: new Date().toISOString(),
                  },
                ]
              : []),
          ],
        };

        if (existingIdx !== -1) {
          localTickets[existingIdx] = updatedTicket;
        } else {
          localTickets.unshift(updatedTicket);
        }
        localStorage.setItem('nexvora_support_tickets', JSON.stringify(localTickets));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.warn('Failed to update local tickets:', err);
      }

      showFeedback('success', `Ticket ${activeTicket.ticketNumber} updated to ${newStatus.toUpperCase()} successfully.`);
      setActiveTicket(null);
      setReplyMessage('');
      onRefresh();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to submit response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick mark as Resolved
  const handleQuickResolve = async (ticket: Dispute) => {
    try {
      await apiFetch(`/api/admin/disputes/${ticket.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'resolved',
          resolutionNotes: 'Marked resolved via Admin Quick Action.',
        }),
      });

      // Update localStorage
      try {
        const rawLocal = localStorage.getItem('nexvora_support_tickets');
        if (rawLocal) {
          let list: Dispute[] = JSON.parse(rawLocal);
          list = list.map((t) => (t.id === ticket.id ? { ...t, status: 'resolved', updatedAt: new Date().toISOString() } : t));
          localStorage.setItem('nexvora_support_tickets', JSON.stringify(list));
          window.dispatchEvent(new Event('storage'));
        }
      } catch {}

      showFeedback('success', `Ticket ${ticket.ticketNumber} marked as RESOLVED.`);
      onRefresh();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update status.');
    }
  };

  // Quick status change dropdown
  const handleQuickStatusChange = async (ticket: Dispute, targetStatus: Dispute['status']) => {
    try {
      await apiFetch(`/api/admin/disputes/${ticket.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: targetStatus,
        }),
      });

      // Update localStorage
      try {
        const rawLocal = localStorage.getItem('nexvora_support_tickets');
        if (rawLocal) {
          let list: Dispute[] = JSON.parse(rawLocal);
          list = list.map((t) => (t.id === ticket.id ? { ...t, status: targetStatus, updatedAt: new Date().toISOString() } : t));
          localStorage.setItem('nexvora_support_tickets', JSON.stringify(list));
          window.dispatchEvent(new Event('storage'));
        }
      } catch {}

      showFeedback('success', `Status updated to ${targetStatus.toUpperCase()}.`);
      onRefresh();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update status.');
    }
  };

  // Confirm delete ticket
  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/admin/disputes/${ticketToDelete.id}`, {
        method: 'DELETE',
      }).catch(() => {
        // Fallback status to closed
        return apiFetch(`/api/admin/disputes/${ticketToDelete.id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'closed' }),
        });
      });

      // Remove from localStorage
      try {
        const rawLocal = localStorage.getItem('nexvora_support_tickets');
        if (rawLocal) {
          let list: Dispute[] = JSON.parse(rawLocal);
          list = list.filter((t) => t.id !== ticketToDelete.id && t.ticketNumber !== ticketToDelete.ticketNumber);
          localStorage.setItem('nexvora_support_tickets', JSON.stringify(list));
          window.dispatchEvent(new Event('storage'));
        }
      } catch {}

      showFeedback('success', `Ticket ${ticketToDelete.ticketNumber} removed successfully.`);
      setTicketToDelete(null);
      onRefresh();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete ticket.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format category name
  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'account':
        return 'Account & KYC';
      case 'task_submission':
        return 'Task Verification Review';
      case 'payment':
        return 'Payment / Withdrawal';
      case 'order_issue':
        return 'Milestone Dispute';
      case 'other':
        return 'General Inquiry';
      default:
        return cat || 'Support Issue';
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Open
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            Under Review
          </span>
        );
      case 'replied':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 text-purple-400" />
            Replied
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </span>
        );
      case 'closed':
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
            <X className="w-3 h-3 text-slate-400" />
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                Support & Issue Tickets Hub
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage user messages, payment issues, verification queries, and milestone disputes in real-time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Refresh Tickets</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-purple-950/40 border-purple-500/60 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Inquiries</span>
          <span className="text-2xl font-bold text-white font-['Space_Grotesk'] mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-slate-500">All submitted records</span>
        </div>

        <div
          onClick={() => setStatusFilter('open')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'open'
              ? 'bg-amber-950/40 border-amber-500/60 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:border-amber-800/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">Open</span>
            {stats.open > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </div>
          <span className="text-2xl font-bold text-amber-300 font-['Space_Grotesk'] mt-1 block">{stats.open}</span>
          <span className="text-[10px] text-amber-300/70">Awaiting initial reply</span>
        </div>

        <div
          onClick={() => setStatusFilter('under_review')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'under_review'
              ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:border-cyan-800/40'
          }`}
        >
          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">Under Review</span>
          <span className="text-2xl font-bold text-cyan-300 font-['Space_Grotesk'] mt-1 block">{stats.underReview}</span>
          <span className="text-[10px] text-cyan-300/70">Staff investigating</span>
        </div>

        <div
          onClick={() => setStatusFilter('replied')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'replied'
              ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:border-indigo-800/40'
          }`}
        >
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">Replied</span>
          <span className="text-2xl font-bold text-indigo-300 font-['Space_Grotesk'] mt-1 block">{stats.replied}</span>
          <span className="text-[10px] text-indigo-300/70">Response sent</span>
        </div>

        <div
          onClick={() => setStatusFilter('resolved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'resolved'
              ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:border-emerald-800/40'
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Resolved</span>
          <span className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk'] mt-1 block">{stats.resolved}</span>
          <span className="text-[10px] text-emerald-300/70">Successfully closed</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by User Name, Email, Subject, Ticket Number (#) or Message..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Statuses ({tickets.length})</option>
                <option value="open" className="bg-slate-900 text-amber-400">Open ({stats.open})</option>
                <option value="under_review" className="bg-slate-900 text-cyan-400">Under Review ({stats.underReview})</option>
                <option value="replied" className="bg-slate-900 text-purple-400">Replied ({stats.replied})</option>
                <option value="resolved" className="bg-slate-900 text-emerald-400">Resolved ({stats.resolved})</option>
                <option value="closed" className="bg-slate-900 text-slate-400">Closed ({stats.closed})</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Categories</option>
                <option value="account" className="bg-slate-900 text-white">Account & KYC</option>
                <option value="task_submission" className="bg-slate-900 text-white">Task Verification</option>
                <option value="payment" className="bg-slate-900 text-white">Payment / Payout</option>
                <option value="order_issue" className="bg-slate-900 text-white">Milestone Dispute</option>
                <option value="other" className="bg-slate-900 text-white">General Inquiry</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white font-['Space_Grotesk']">No Support Tickets Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No tickets match the selected filters or search criteria. Try resetting filters.'
              : 'There are currently no active support tickets or inquiries submitted by users.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((t) => {
            const userName = t.userName || 'Member';
            const userEmail = t.userEmail || 'No Email';
            const hasReply = Boolean(t.adminReply || (t.replies && t.replies.length > 0));

            return (
              <div
                key={t.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all shadow-md space-y-4"
              >
                {/* Top Row: Ticket Number, Category, Status, Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-purple-400 bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-800/50">
                      {t.ticketNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {formatCategory(t.category)}
                    </span>
                    {renderStatusBadge(t.status)}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Submitted: {new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* User Info Bar */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{userName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({t.raisedById})</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-300">{userEmail}</span>
                        {userEmail && userEmail !== 'No Email' && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(userEmail)}
                            className="p-1 text-slate-500 hover:text-white rounded transition-colors"
                            title="Copy email"
                          >
                            {copiedText === userEmail ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {userEmail && userEmail !== 'No Email' && (
                      <a
                        href={`mailto:${userEmail}?subject=Re:%20[${t.ticketNumber}]%20${encodeURIComponent(t.subject)}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email User</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Subject & Message Content */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white leading-snug">
                    <span className="text-slate-400 font-normal">Subject: </span>
                    {t.subject}
                  </h4>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-cyan-400" /> User Message:
                    </p>
                    {t.description}
                  </div>
                </div>

                {/* Previous Admin Reply / Resolution notes if present */}
                {hasReply && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        Latest Staff Response:
                      </span>
                      {t.updatedAt && (
                        <span className="text-[10px] text-purple-400/70">
                          {new Date(t.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap pl-5 border-l-2 border-purple-500/50">
                      {t.adminReply || (t.replies && t.replies[t.replies.length - 1]?.message)}
                    </p>

                    {t.resolutionNotes && (
                      <div className="pt-2 border-t border-purple-900/50 text-[11px] text-slate-400">
                        <strong className="text-slate-300">Internal Note: </strong>
                        {t.resolutionNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  {/* Quick Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Quick Status:</span>
                    <select
                      value={t.status}
                      onChange={(e) => handleQuickStatusChange(t, e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="replied">Replied</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {t.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleQuickResolve(t)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Quick Resolve</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenReplyModal(t)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply & Update Status</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTicketToDelete(t)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPLY & RESOLVE MODAL */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Reply & Resolve Ticket {activeTicket.ticketNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Send official staff response to {activeTicket.userName || 'user'} and update ticket status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Issue Context Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{activeTicket.userName}</span>
                  <span className="text-slate-400">({activeTicket.userEmail})</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(activeTicket.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="font-bold text-slate-200">
                Subject: <span className="text-purple-300 font-semibold">{activeTicket.subject}</span>
              </p>
              <div className="p-3 rounded-xl bg-slate-900/90 text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-800">
                {activeTicket.description}
              </div>
            </div>

            {/* Previous Replies Thread if any */}
            {activeTicket.replies && activeTicket.replies.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Message Thread History</label>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {activeTicket.replies.map((r) => (
                    <div
                      key={r.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        r.senderRole === 'admin'
                          ? 'bg-purple-950/40 border border-purple-800/40 text-purple-200 ml-4'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-bold text-white">{r.senderName} ({r.senderRole.toUpperCase()})</span>
                        <span>{new Date(r.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{r.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick canned replies templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Quick Reply Templates:</span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setReplyMessage('Thank you for reaching out. We have investigated your inquiry and the issue has been resolved successfully.');
                    setNewStatus('resolved');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/50 hover:text-purple-300 text-slate-300 border border-slate-700 transition-colors"
                >
                  ✅ "Issue Resolved"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyMessage('Your withdrawal payout request has been verified and processed by our finance desk. Please allow 1-2 hours for clearing.');
                    setNewStatus('resolved');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/50 hover:text-purple-300 text-slate-300 border border-slate-700 transition-colors"
                >
                  💳 "Payment Processed"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyMessage('Please provide additional clear screenshot proof or your transaction ID so our team can verify and approve.');
                    setNewStatus('under_review');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/50 hover:text-purple-300 text-slate-300 border border-slate-700 transition-colors"
                >
                  📸 "Request More Proof"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyMessage('Your KYC identity documents have been reviewed and your account is now verified.');
                    setNewStatus('resolved');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/50 hover:text-purple-300 text-slate-300 border border-slate-700 transition-colors"
                >
                  🛡️ "KYC Approved"
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReply} className="space-y-4 text-xs">
              {/* Reply Message Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white">
                  Staff Reply Message <span className="text-slate-400 font-normal">(Sent to user inbox/notification)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to the user..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                />
              </div>

              {/* Status Selector & Resolution Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-white">Update Ticket Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="replied">Replied (Response sent to user)</option>
                    <option value="resolved">Resolved (Issue completely solved)</option>
                    <option value="under_review">Under Review (Still investigating)</option>
                    <option value="open">Open (Reopen ticket)</option>
                    <option value="closed">Closed (Dismissed/Archived)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-white">
                    Internal Admin Note <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Verified transaction TX#82910 on bKash"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replyMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving & Notifying...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply & Update Status</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Support Ticket?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently remove ticket{' '}
                <span className="font-bold text-white font-mono">{ticketToDelete.ticketNumber}</span> from{' '}
                <span className="text-purple-300">{ticketToDelete.userName}</span>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTicket}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
