import React, { useState, useEffect, useRef } from 'react';
import { ticketApi, branchApi } from '../../api';
import { getSocket } from '../../api/socket';
import { AdminNav } from '../../components/AdminNav';
import { LifeBuoy, CheckCircle, Clock, Send, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [replying, setReplying] = useState(false);
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async (maintainId = null) => {
    try {
      const [tRes, brRes] = await Promise.all([
        ticketApi.getAllTickets({
          branch: selectedBranch || undefined,
          status: statusFilter || undefined,
        }),
        branchApi.getAll(),
      ]);
      if (tRes.data.success) {
        const fetched = tRes.data.data;
        setTickets(fetched);
        if (maintainId) {
          const match = fetched.find((t) => String(t._id) === String(maintainId));
          if (match) setSelectedTicket(match);
        } else if (fetched.length > 0) {
          setSelectedTicket((prev) => {
            if (prev) {
              const stillThere = fetched.find((t) => String(t._id) === String(prev._id));
              return stillThere || fetched[0];
            }
            return fetched[0];
          });
        }
      }
      if (brRes.data.success) setBranches(brRes.data.data);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch, statusFilter]);

  // Socket.io room connection and real-time message listener for Admin
  useEffect(() => {
    if (!selectedTicket?._id) return;

    const socket = getSocket();
    const ticketId = String(selectedTicket._id);

    const joinRoom = () => {
      socket.emit('join_ticket', { ticketId });
    };

    joinRoom();
    socket.on('connect', joinRoom);

    const handleNewComment = (data) => {
      if (String(data.ticketId) === ticketId) {
        setSelectedTicket((prev) => {
          if (!prev || String(prev._id) !== ticketId) return prev;
          
          const exists = prev.comments?.some((c) => {
            if (c._id && data.comment?._id && String(c._id) === String(data.comment._id)) {
              return true;
            }
            if (c.message === data.comment?.message && String(c.sender) === String(data.comment?.sender)) {
              return true;
            }
            return false;
          });

          if (exists) return prev;

          return {
            ...prev,
            comments: [...(prev.comments || []), data.comment],
            adminResponse: data.adminResponse || prev.adminResponse,
            status: data.status || prev.status,
          };
        });

        setTickets((prevList) =>
          prevList.map((t) =>
            String(t._id) === ticketId
              ? {
                  ...t,
                  comments: t.comments?.some((c) => String(c._id) === String(data.comment?._id))
                    ? t.comments
                    : [...(t.comments || []), data.comment],
                  status: data.status || t.status,
                }
              : t
          )
        );

        setTimeout(scrollToBottom, 50);
      }
    };

    const handleStatusUpdate = (data) => {
      if (String(data.ticketId) === ticketId) {
        setSelectedTicket((prev) => ({
          ...prev,
          status: data.status,
          adminResponse: data.adminResponse || prev.adminResponse,
          resolvedAt: data.resolvedAt,
        }));
        setTickets((prevList) =>
          prevList.map((t) =>
            String(t._id) === ticketId ? { ...t, status: data.status } : t
          )
        );
      }
    };

    socket.on('new_comment', handleNewComment);
    socket.on('ticket_status_updated', handleStatusUpdate);

    setTimeout(scrollToBottom, 150);

    return () => {
      socket.emit('leave_ticket', { ticketId });
      socket.off('connect', joinRoom);
      socket.off('new_comment', handleNewComment);
      socket.off('ticket_status_updated', handleStatusUpdate);
    };
  }, [selectedTicket?._id]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedTicket) return;
    setReplying(true);
    const messageToSend = adminReply.trim();
    setAdminReply('');

    try {
      const res = await ticketApi.addComment(selectedTicket._id, { message: messageToSend });
      if (res.data.success && res.data.data) {
        const updatedTicket = res.data.data;
        setSelectedTicket(updatedTicket);
        setTickets((prevList) =>
          prevList.map((t) =>
            String(t._id) === String(selectedTicket._id) ? updatedTicket : t
          )
        );
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      toast.error('Failed to send reply');
      setAdminReply(messageToSend);
    } finally {
      setReplying(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await ticketApi.updateStatus(id, { status });
      if (res.data.success && res.data.data) {
        setSelectedTicket(res.data.data);
        setTickets((prevList) =>
          prevList.map((t) => (String(t._id) === String(id) ? res.data.data : t))
        );
        toast.success(`Ticket marked as ${status}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Complaints & Helpdesk Desk</h1>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Socket.io
              </span>
            </div>
            <p className="text-sm text-gray-500">Respond to student maintenance requests, room queries, and complaints in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input py-2 text-xs"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-2 text-xs"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            No complaints or query tickets found matching the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* List column */}
            <div className="lg:col-span-1 space-y-3">
              {tickets.map((t) => {
                const isSelected = selectedTicket?._id === t._id;
                return (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTicket(t)}
                    className={`card p-4 cursor-pointer transition border-2 ${
                      isSelected
                        ? 'border-primary-600 shadow-sm bg-primary-50/20'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-mono text-[10px] text-gray-400 font-bold">
                        {t.ticketNumber}
                      </span>
                      <span
                        className={`badge text-[9px] ${
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'badge-success'
                            : t.status === 'IN_PROGRESS'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{t.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t.student?.name} • Room {t.room?.roomNumber || 'N/A'}
                    </p>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="badge-info text-[9px]">{t.category?.replace('_', ' ')}</span>
                      <span className="flex items-center gap-1 font-semibold text-gray-600">
                        <MessageSquare className="w-3 h-3" /> {t.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail & Live Chat Column */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <div className="card p-6 flex flex-col justify-between min-h-[550px] shadow-sm">
                  <div>
                    <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-gray-400">
                            {selectedTicket.ticketNumber}
                          </span>
                          <span className="badge-info text-[10px]">
                            {selectedTicket.category?.replace('_', ' ')}
                          </span>
                          <span className="badge-warning text-[10px]">
                            Priority: {selectedTicket.priority}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h2>
                        <p className="text-xs text-gray-500 mt-1">
                          Raised by <strong>{selectedTicket.student?.name}</strong> ({selectedTicket.student?.phone || 'No phone'}) • Room {selectedTicket.room?.roomNumber || 'N/A'} ({selectedTicket.branch?.name})
                        </p>
                      </div>

                      {/* Quick status change buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTicket.status !== 'IN_PROGRESS' && selectedTicket.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedTicket._id, 'IN_PROGRESS')}
                            className="btn bg-amber-500 hover:bg-amber-600 text-white text-xs py-1.5 px-2.5"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {selectedTicket.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedTicket._id, 'RESOLVED')}
                            className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 px-2.5"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {selectedTicket.status === 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedTicket._id, 'CLOSED')}
                            className="btn btn-outline text-xs py-1.5 px-2.5"
                          >
                            Close Ticket
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Student Description */}
                    <div className="my-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-800 leading-relaxed">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                        Issue Description:
                      </span>
                      {selectedTicket.description}
                    </div>

                    {/* Live Conversation thread */}
                    <div className="mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-primary-600" /> Live Conversation with Student
                      </h4>

                      <div className="max-h-80 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                        {selectedTicket.comments?.length === 0 ? (
                          <div className="text-center py-6 text-gray-400 text-xs">
                            No messages exchanged yet. Send a message to communicate with {selectedTicket.student?.name}.
                          </div>
                        ) : (
                          selectedTicket.comments?.map((c, idx) => {
                            const isMe = c.senderRole === 'ADMIN';
                            return (
                              <div
                                key={idx}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                              >
                                <div
                                  className={`p-3.5 rounded-2xl max-w-md shadow-2xs ${
                                    isMe
                                      ? 'bg-primary-600 text-white rounded-br-xs'
                                      : 'bg-gray-100 text-gray-900 rounded-bl-xs border border-gray-200'
                                  }`}
                                >
                                  <div
                                    className={`flex items-center gap-2 mb-1 text-[10px] font-bold ${
                                      isMe ? 'text-primary-100' : 'text-gray-500'
                                    }`}
                                  >
                                    <span>{c.senderName} ({c.senderRole})</span>
                                    <span>
                                      {new Date(c.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{c.message}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatBottomRef} />
                      </div>
                    </div>
                  </div>

                  {/* Admin Reply Input */}
                  <form onSubmit={handleSendReply} className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
                    <input
                      type="text"
                      placeholder="Type response for student (instant live delivery)..."
                      className="input text-xs"
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={replying || !adminReply.trim()}
                      className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Reply
                    </button>
                  </form>
                </div>
              ) : (
                <div className="card text-center py-24 text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm text-gray-600">Select a Ticket to Review</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click any ticket from the left list to see full details and message the student.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
