import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Phone, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  Plus, 
  AlertTriangle, 
  X, 
  Calendar, 
  User, 
  MapPin, 
  ExternalLink,
  ChevronDown,
  Filter,
  Check
} from 'lucide-react';
import { apiClient, mockTasksApi } from '../api/client';

const TASK_TYPE_ICONS = {
  PERSONAL_MEET: MapPin,
  PHONE_CALL: Phone,
  WHATSAPP_FOLLOWUP: MessageSquare,
  SAMPLE_DISPATCH: Send,
  PAYMENT_REMINDER: AlertTriangle,
  INQUIRY_CLOSING: CheckCircle2,
};

const PRIORITY_BADGES = {
  P1_URGENT: { label: 'P1 Urgent', bg: 'bg-rose-50 text-rose-700 border-rose-200', border: 'border-l-rose-500' },
  P2_HIGH: { label: 'P2 High', bg: 'bg-amber-50 text-amber-800 border-amber-200', border: 'border-l-amber-500' },
  P3_MEDIUM: { label: 'P3 Medium', bg: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' },
  P4_LOW: { label: 'P4 Low', bg: 'bg-slate-100 text-slate-700 border-slate-200', border: 'border-l-slate-400' },
};

export default function SalesTodoList() {
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaskForComplete, setSelectedTaskForComplete] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    task_type: 'PHONE_CALL',
    priority: 'P1_URGENT',
    party_name: '',
    contact_person: '',
    phone: '',
    related_inquiry_or_order_no: '',
    inquiry_meters: 50000,
    assigned_to_user_id: 2,
    due_date: new Date().toISOString().slice(0, 10),
    due_time_slot: '10:30 AM - 11:30 AM',
  });

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/sales/tasks/daily-queue');
      setTasks(res.data);
      const mRes = await apiClient.get('/sales/tasks/metrics');
      setMetrics(mRes.data);
    } catch (e) {
      setTasks(mockTasksApi.getDailyQueue());
      setMetrics(mockTasksApi.getMetrics());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/sales/tasks/create', newTask);
    } catch (e) {
      mockTasksApi.createTask(newTask);
    }
    setShowAddModal(false);
    setNewTask({
      title: '',
      task_type: 'PHONE_CALL',
      priority: 'P1_URGENT',
      party_name: '',
      contact_person: '',
      phone: '',
      related_inquiry_or_order_no: '',
      inquiry_meters: 50000,
      assigned_to_user_id: 2,
      due_date: new Date().toISOString().slice(0, 10),
      due_time_slot: '10:30 AM - 11:30 AM',
    });
    loadTasks();
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskForComplete) return;

    try {
      await apiClient.put(`/sales/tasks/${selectedTaskForComplete.id}/status`, {
        status: 'COMPLETED',
        completion_notes: completionNotes
      });
    } catch (e) {
      mockTasksApi.updateStatus(selectedTaskForComplete.id, {
        status: 'COMPLETED',
        completion_notes: completionNotes
      });
    }

    setSelectedTaskForComplete(null);
    setCompletionNotes('');
    loadTasks();
  };

  const handleStartTask = async (taskId) => {
    try {
      await apiClient.put(`/sales/tasks/${taskId}/status`, { status: 'IN_PROGRESS' });
    } catch (e) {
      mockTasksApi.updateStatus(taskId, { status: 'IN_PROGRESS' });
    }
    loadTasks();
  };

  const filteredTasks = tasks.filter(t => {
    const matchesType = filterType === 'ALL' || t.task_type === filterType;
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    return matchesType && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Priority Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Action Queue</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-1">{metrics.total}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-rose-600">Pending Actions</span>
            <p className="text-2xl font-black font-mono text-rose-700 mt-1">{metrics.pending}</p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-amber-600">In Progress</span>
            <p className="text-2xl font-black font-mono text-amber-700 mt-1">{metrics.in_progress}</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex justify-between items-center">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-600">Closed Today</span>
            <p className="text-2xl font-black font-mono text-emerald-700 mt-1">{metrics.completed}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header and Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>
          
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Priorities</option>
            <option value="P1_URGENT">P1 - Urgent Only</option>
            <option value="P2_HIGH">P2 - High</option>
            <option value="P3_MEDIUM">P3 - Medium</option>
            <option value="P4_LOW">P4 - Low</option>
          </select>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Action Types</option>
            <option value="PERSONAL_MEET">Personal Factory Visits</option>
            <option value="PHONE_CALL">Phone Call Negotiations</option>
            <option value="WHATSAPP_FOLLOWUP">WhatsApp Confirmations</option>
            <option value="PAYMENT_REMINDER">Payment Collection Dues</option>
            <option value="SAMPLE_DISPATCH">Sample Follow-ups</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Sales Task
        </button>
      </div>

      {/* Task Cards Queue */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const Icon = TASK_TYPE_ICONS[task.task_type] || Phone;
          const prio = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.P3_MEDIUM;
          const isDone = task.status === 'COMPLETED';

          const whatsappMessage = encodeURIComponent(
            `Namaste ${task.contact_person} ji, following up from Weave-Tech Mills regarding ${task.party_name} inquiry for ${Number(task.inquiry_meters || 0).toLocaleString()} meters.`
          );

          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl border border-slate-200 border-l-4 ${prio.border} shadow-xs p-4 transition hover:shadow-md ${
                isDone ? 'opacity-60 bg-slate-50/50' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                {/* Task Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${prio.bg}`}>
                      {prio.label}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                      <Icon className="w-3 h-3 text-slate-500" />
                      {task.task_type.replace('_', ' ')}
                    </span>
                    {task.due_time_slot && (
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {task.due_time_slot}
                      </span>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                        In Progress
                      </span>
                    )}
                    {isDone && (
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Closed
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>Party: <strong className="text-slate-900">{task.party_name}</strong></span>
                    <span>• Contact: <strong className="text-slate-800">{task.contact_person}</strong></span>
                    {task.inquiry_meters > 0 && (
                      <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                        {Number(task.inquiry_meters).toLocaleString()} Meters
                      </span>
                    )}
                    {task.related_inquiry_or_order_no && (
                      <span className="font-mono text-slate-500">Ref: {task.related_inquiry_or_order_no}</span>
                    )}
                  </div>

                  {task.completion_notes && (
                    <p className="text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-600 mt-1 italic">
                      "Notes: {task.completion_notes}"
                    </p>
                  )}
                </div>

                {/* 1-Click Action Buttons */}
                {!isDone && (
                  <div className="flex items-center gap-2 pt-2 lg:pt-0 w-full lg:w-auto justify-end">
                    {/* Direct Call */}
                    <a
                      href={`tel:${task.phone}`}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call ({task.phone})
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/91${task.phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </a>

                    {/* Start / In Progress */}
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => handleStartTask(task.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Start
                      </button>
                    )}

                    {/* Mark Complete */}
                    <button
                      onClick={() => {
                        setSelectedTaskForComplete(task);
                        setCompletionNotes('');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Close Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No sales tasks found in this priority category.
          </div>
        )}
      </div>

      {/* Complete Task Modal */}
      {selectedTaskForComplete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Close & Log Task Outcome</h3>
              <button onClick={() => setSelectedTaskForComplete(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedTaskForComplete.title}</p>
                <p className="text-xs text-slate-500">{selectedTaskForComplete.party_name}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Call / Meeting Outcome & Remarks
                </label>
                <textarea
                  rows="3"
                  required
                  value={completionNotes}
                  onChange={e => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Rate finalized at Rs. 42.50/m. Contract booked for 50,000 meters. Delivery by 15th March."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForComplete(null)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Close Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Assign Sales Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Title / Action Objective *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Personal Meet - Rate Negotiation 60x60"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Action Type</label>
                  <select
                    value={newTask.task_type}
                    onChange={e => setNewTask({ ...newTask, task_type: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="PERSONAL_MEET">Personal Meet / Visit</option>
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="WHATSAPP_FOLLOWUP">WhatsApp Follow-up</option>
                    <option value="PAYMENT_REMINDER">Payment Reminder</option>
                    <option value="SAMPLE_DISPATCH">Sample Dispatch</option>
                    <option value="INQUIRY_CLOSING">Inquiry Closing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="P1_URGENT">P1 - Urgent</option>
                    <option value="P2_HIGH">P2 - High</option>
                    <option value="P3_MEDIUM">P3 - Medium</option>
                    <option value="P4_LOW">P4 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client / Party Name *</label>
                  <input
                    type="text"
                    required
                    value={newTask.party_name}
                    onChange={e => setNewTask({ ...newTask, party_name: e.target.value })}
                    placeholder="e.g. Vardhman Textiles"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={newTask.contact_person}
                    onChange={e => setNewTask({ ...newTask, contact_person: e.target.value })}
                    placeholder="Key Person"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number (with WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={newTask.phone}
                    onChange={e => setNewTask({ ...newTask, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inquiry Fabric Meters</label>
                  <input
                    type="number"
                    value={newTask.inquiry_meters}
                    onChange={e => setNewTask({ ...newTask, inquiry_meters: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Time Slot</label>
                  <input
                    type="text"
                    value={newTask.due_time_slot}
                    onChange={e => setNewTask({ ...newTask, due_time_slot: e.target.value })}
                    placeholder="e.g. 10:30 AM - 11:30 AM"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ref Order / Inq No</label>
                  <input
                    type="text"
                    value={newTask.related_inquiry_or_order_no}
                    onChange={e => setNewTask({ ...newTask, related_inquiry_or_order_no: e.target.value })}
                    placeholder="e.g. INQ-2026-042"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
