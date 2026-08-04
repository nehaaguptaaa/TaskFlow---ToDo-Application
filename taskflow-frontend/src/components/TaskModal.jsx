import { useState, useEffect } from "react";
import { X, Trash2, Plus, ChevronDown, CalendarOff, Inbox } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const PRIORITY_COLORS = { HIGH: "#B5654A", MEDIUM: "#C79A2B", LOW: "#6E8F6C" };
const STATUS_LABELS = { PENDING: "Pending", IN_PROGRESS: "In Progress", COMPLETED: "Completed" };
const STATUS_COLORS = {
  PENDING: { bg: "#3B82F61A", color: "#3B82F6" },
  IN_PROGRESS: { bg: "#F59E0B1A", color: "#F59E0B" },
  COMPLETED: { bg: "#22C55E1A", color: "#22C55E" },
};

// String comparison avoids the UTC-parsing bug from `new Date(dateStr)`
function isPastDate(dateStr) {
  const todayStr = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
  return dateStr < todayStr;
}

function PriorityBadge({ priority }) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-mono font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ background: `${PRIORITY_COLORS[priority]}1A`, color: PRIORITY_COLORS[priority] }}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return (
    <span
      className="inline-flex items-center text-[10px] font-mono font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function TaskModal({ date, tasks, onClose, onTaskClick, onChange }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);

  const past = isPastDate(date);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await axiosInstance.post("/tasks", { title, description, priority, dueDate: date });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      onChange();
    } catch (err) {
      setError(err.response?.data?.title || "Could not add task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setBusyTaskId(taskId);
    setError("");
    try {
      await axiosInstance.put(`/tasks/${taskId}/mark`, null, { params: { status: newStatus } });
      onChange();
    } catch (err) {
      setError("Could not update status");
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyTaskId(id);
    setError("");
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      onChange();
    } catch (err) {
      setError("Could not delete task");
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Tasks for ${date}`}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-[overlayIn_0.2s_ease-out]" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-paper-raised border-l border-line shadow-xl flex flex-col animate-[slideIn_0.25s_ease-out]">
        <div className="px-6 py-5 border-b border-line flex items-start justify-between flex-shrink-0">
          <div>
            <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">Tasks for</p>
            <h2 className="font-display text-2xl font-semibold text-ink">{date}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-soft hover:text-ink hover:bg-paper rounded-full p-1.5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll px-6 py-4 space-y-3">
          {error && (
            <p className="text-brick text-xs bg-brick/10 border border-brick/20 rounded px-3 py-2">{error}</p>
          )}

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-12 text-ink-soft animate-[fadeUp_0.25s_ease-out]">
              <Inbox size={32} strokeWidth={1.5} className="mb-3 opacity-60" />
              <p className="text-sm">No tasks for this day.</p>
            </div>
          )}

          {tasks.map((task, i) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onTaskClick(task)}
              style={{ animationDelay: `${i * 30}ms` }}
              className="group flex items-start gap-3 border border-line rounded-lg p-3.5 bg-paper hover:border-accent/50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-[fadeUp_0.3s_ease-out_backwards] focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <span
                className="task-dot mt-1.5 flex-shrink-0"
                style={{ background: PRIORITY_COLORS[task.priority] || "#999" }}
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    task.status === "COMPLETED" ? "line-through text-ink-soft" : "text-ink"
                  }`}
                >
                  {task.title}
                </p>

                {task.description && (
                  <p className="text-xs text-ink-soft mt-1 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>

                <div className="relative inline-block mt-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={task.status}
                    disabled={busyTaskId === task.id}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="appearance-none text-xs font-mono border border-line rounded px-2 py-1 pr-6 bg-paper-raised disabled:opacity-50 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft" />
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                disabled={busyTaskId === task.id}
                aria-label={`Delete ${task.title}`}
                title="Delete task"
                className="flex items-center justify-center w-8 h-8 rounded-full text-ink-soft hover:bg-brick/10 hover:text-brick transition-colors duration-200 flex-shrink-0 disabled:opacity-40"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {past ? (
          <div className="border-t border-line px-6 py-5 flex-shrink-0">
            <div className="flex items-center gap-2 text-ink-soft text-sm bg-paper border border-line rounded-lg px-4 py-3">
              <CalendarOff size={16} className="flex-shrink-0" />
              <span>Tasks cannot be added to past dates.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="border-t border-line px-6 py-5 space-y-3 flex-shrink-0">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full border border-line rounded px-3 py-2 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-shadow"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-line rounded px-3 py-2 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none transition-shadow"
              rows={2}
            />
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 text-xs font-mono py-1.5 rounded border transition-all duration-150 ${
                    priority === p ? "text-white border-transparent scale-[1.03]" : "border-line text-ink-soft hover:border-accent/40"
                  }`}
                  style={priority === p ? { background: PRIORITY_COLORS[p] } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-deep text-white font-medium py-2 rounded transition-colors disabled:opacity-60"
            >
              <Plus size={16} />
              {submitting ? "Adding..." : "Add Task"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}