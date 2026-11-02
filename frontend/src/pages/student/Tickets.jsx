import React, { useState, useEffect, useRef } from 'react';
import { ticketApi } from '../../api';
import { getSocket } from '../../api/socket';
import { useAuth } from '../../context/AuthContext';
import { 
  LifeBuoy, 
  PlusCircle, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ShieldCheck, 
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const chatBottomRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'ROOM_MAINTENANCE',
    priority: 'MEDIUM',
  });
  const [submitting, setSubmitting] = useState(false);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTickets = async (maintainId = null) => {
    try {
      const res = await ticketApi.getMyTickets();
      if (res.data.success) {
        const fetched = res.data.data;
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
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Real-time Socket.io join and message listener
  useEffect(() => {
    if (!selectedTicket?._id) return;

    const socket = getSocket();
    const ticketId = String(selectedTicket._id);

    const joinRoom = () => {
      socket.emit('join_ticket', { ticketId });
    };

    // Join room immediately and on any reconnection
    joinRoom();
    socket.on('connect', joinRoom);

    const handleNewComment = (data) => {
      if (String(data.ticketId) === ticketId) {
        setSelectedTicket((prev) => {
          if (!prev || String(prev._id) !== ticketId) return prev;
          
          // Deduplicate comment check
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
        toast.success(`Ticket status updated: ${data.status}`);
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

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await ticketApi.createTicket(form);
      if (res.data.success) {
        toast.success('Ticket submitted successfully!');
        setModalOpen(false);
        setForm({ title: '', description: '', category: 'ROOM_MAINTENANCE', priority: 'MEDIUM' });
        loadTickets(res.data.data?._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    setSendingReply(true);
    const messageToSend = replyMessage.trim();
    setReplyMessage('');

    try {
      const res = await ticketApi.addComment(selectedTicket._id, { message: messageToSend });
      if (res.data.success && res.data.data) {
        // Immediately update local state without waiting for socket or refresh!
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
      setReplyMessage(messageToSend);
    } finally {
      setSendingReply(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'OPEN') return t.status === 'OPEN' || t.status === 'IN_PROGRESS';
    if (statusFilter === 'RESOLVED') return t.status === 'RESOLVED' || t.status === 'CLOSED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Complaints & Helpdesk Chat
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Socket.io
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time messaging with hostel wardens and maintenance technicians
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary self-start sm:self-auto font-bold flex items-center gap-2 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" /> Raise New Ticket
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'OPEN', 'RESOLVED'].map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              statusFilter === filter
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filter === 'ALL' ? 'All Tickets' : filter === 'OPEN' ? 'Active / In Progress' : 'Resolved'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <LifeBuoy className="w-12 h-12 mx-auto mb-2 opacity-50 text-rose-500" />
          <p className="font-bold text-gray-700">No Tickets Found</p>
          <p className="text-xs text-gray-500 mt-1">
            Have a maintenance request or question? Click "Raise New Ticket" above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Ticket List */}
          <div className="lg:col-span-1 space-y-3">
            {filteredTickets.map((t) => {
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
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{t.description}</p>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-medium text-gray-600">{t.category?.replace('_', ' ')}</span>
                    <span className="flex items-center gap-1 font-semibold text-gray-600">
                      <MessageSquare className="w-3 h-3" /> {t.comments?.length || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ticket Detail & Real-Time Live Chat Thread */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="card p-6 flex flex-col justify-between min-h-[550px] shadow-sm">
                <div>
                  {/* Top Bar with Live Badge */}
                  <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                      <h2 className="text-xl font-black text-gray-900">{selectedTicket.title}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Connected
                      </span>
                      <span
                        className={`badge ${
                          selectedTicket.status === 'RESOLVED'
                            ? 'badge-success'
                            : selectedTicket.status === 'IN_PROGRESS'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>

                  {/* Problem Description Box */}
                  <div className="my-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-800 leading-relaxed">
                    <span className="font-bold text-gray-400 uppercase tracking-wider block mb-0.5 text-[10px]">
                      Initial Report:
                    </span>
                    {selectedTicket.description}
                  </div>

                  {/* Warden Official Note */}
                  {selectedTicket.adminResponse && (
                    <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-0.5">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-800 text-[11px]">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Warden Action Update:
                      </span>
                      <p className="text-xs font-semibold">{selectedTicket.adminResponse}</p>
                    </div>
                  )}

                  {/* Conversation Thread / Messages */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-primary-600" /> Live Chat Thread
                    </h4>

                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                      {selectedTicket.comments?.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-40" />
                          No messages in this chat yet. Send a message below to start real-time chat with the warden.
                        </div>
                      ) : (
                        selectedTicket.comments?.map((c, idx) => {
                          const isMe = c.senderRole === 'STUDENT';
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

                {/* Real-time Message Input Box */}
                <form onSubmit={handleSendReply} className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
                  <input
                    type="text"
                    placeholder="Type a message to hostel admin (instant live delivery)..."
                    className="input text-xs"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyMessage.trim()}
                    className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="card text-center py-24 text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-bold text-sm text-gray-600">Select a Ticket to View Live Chat</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click any ticket on the left to join the live chat room.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1">Raise a Problem / Query Ticket</h3>
            <p className="text-xs text-gray-500 mb-6">
              Our warden and maintenance crew will respond directly via live chat.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="label">Category *</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="ROOM_MAINTENANCE">Room Maintenance (Bed, Wardrobe, Door, Window)</option>
                  <option value="PLUMBING">Plumbing (Washbasin, Geyser, Water leak, Flush)</option>
                  <option value="ELECTRICAL">Electrical (Lights, Fan, Switch, Power socket)</option>
                  <option value="WIFI_INTERNET">Wi-Fi / Internet (Speed, Connection drop)</option>
                  <option value="FOOD_CANTEEN">Food & Canteen (Quality, Special request)</option>
                  <option value="CLEANING_HYGIENE">Cleaning & Bathroom Sanitation</option>
                  <option value="RENT_BILLING">Rent Invoices & Electricity Billing</option>
                  <option value="GENERAL_QUERY">General Resident Query</option>
                  <option value="OTHER">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="label">Subject / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser switch in room 101 sparking"
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Detailed Description *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Please describe what is happening, location in the room, etc..."
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Urgency Priority</label>
                <select
                  className="input"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="LOW">Low (Can be checked in 2-3 days)</option>
                  <option value="MEDIUM">Medium (Normal repair within 24 hours)</option>
                  <option value="HIGH">High (Same day attention)</option>
                  <option value="URGENT">Urgent (Immediate emergency)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary font-bold">
                  {submitting ? 'Submitting...' : 'Submit Help Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
