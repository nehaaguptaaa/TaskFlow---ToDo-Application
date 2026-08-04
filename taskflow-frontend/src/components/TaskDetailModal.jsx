import { useState, useEffect } from "react";
import { X, Trash2, Pencil, Clock3, CalendarDays, ChevronDown, Check, XCircle } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const STATUS_LABELS = { PENDING: "Pending", IN_PROGRESS: "In Progress", COMPLETED: "Completed" };
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const PRIORITY_COLORS = { HIGH: "#B5654A", MEDIUM: "#C79A2B", LOW: "#6E8F6C" };
const STATUS_COLORS = {
  PENDING: { bg: "#3B82F61A", color: "#3B82F6" },
  IN_PROGRESS: { bg: "#F59E0B1A", color: "#F59E0B" },
  COMPLETED: { bg: "#22C55E1A", color: "#22C55E" },
};

function todayStr() {
  return new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
}

export default function TaskDetailModal({ task, onClose, onChange }) {
  const [currentTask, setCurrentTask] = useState(task);
  const [status, setStatus] = useState(task.status);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editDueDate, setEditDueDate] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !isEditing && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, isEditing]);

  const startEditing = () => {
    setEditTitle(currentTask.title);
    setEditDescription(currentTask.description || "");
    setEditPriority(currentTask.priority);
    setEditDueDate(currentTask.dueDate);
    setEditError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError("");
  };

  const handleSaveEdit = async () => {
    setEditError("");

    if (!editTitle.trim()) {
      setEditError("Title is required");
      return;
    }
    if (editDueDate !== currentTask.dueDate && editDueDate < todayStr()) {
      setEditError("Due date cannot be moved to the past");
      return;
    }

    setSaving(true);
    try {
      const res = await axiosInstance.put(`/tasks/${currentTask.id}`, {
        title: editTitle.trim(),
        description: editDescription,
        priority: editPriority,
        status,
        dueDate: editDueDate,
      });
      setCurrentTask(res.data);
      setStatus(res.data.status);
      setIsEditing(false);
      onChange();
    } catch (err) {
      setEditError(err.response?.data?.title || "Could not update task");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setError("");
    setBusy(true);
    try {
      await axiosInstance.put(`/tasks/${currentTask.id}/mark`, null, { params: { status: newStatus } });
      setStatus(newStatus);
      setCurrentTask((t) => ({ ...t, status: newStatus }));
      onChange();
    } catch (err) {
      setError("Could not update status");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await axiosInstance.delete(`/tasks/${currentTask.id}`);
      onChange();
      onClose();
    } catch (err) {
      setError("Could not delete task");
      setBusy(false);
    }
  };

  const sc = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  const inputClass =
    "w-full border border-line rounded px-3 py-2 text-sm bg-paper focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-shadow";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-[overlayIn_0.2s_ease-out]" onClick={!isEditing ? onClose : undefined} />

      <div className="relative w-full max-w-lg max-h-[85vh] bg-paper-raised border border-line rounded-xl shadow-xl flex flex-col animate-[modalIn_0.22s_ease-out]">
        <div className="px-6 py-5 border-b border-line flex items-start justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            {!isEditing && (
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="inline-flex items-center text-[10px] font-mono font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ background: `${PRIORITY_COLORS[currentTask.priority]}1A`, color: PRIORITY_COLORS[currentTask.priority] }}
                >
                  {currentTask.priority}
                </span>
                <span
                  className="inline-flex items-center text-[10px] font-mono font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ background: sc.bg, color: sc.color }}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>
            )}

            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={100}
                className="font-display text-2xl font-semibold text-ink w-full border-b-2 border-accent bg-transparent focus:outline-none pb-1"
                placeholder="Task title"
                autoFocus
              />
            ) : (
              <h2 id="task-detail-title" className="font-display text-2xl font-semibold text-ink break-words">
                {currentTask.title}
              </h2>
            )}

            {!isEditing && (
              <p className="flex items-center gap-1.5 text-xs text-ink-soft font-mono mt-1.5">
                <CalendarDays size={13} /> Due {currentTask.dueDate}
              </p>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-ink-soft hover:text-ink hover:bg-paper rounded-full p-1.5 transition-colors flex-shrink-0 ml-4"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll px-6 py-5 space-y-5">
          {error && (
            <p className="text-brick text-xs bg-brick/10 border border-brick/20 rounded px-3 py-2">{error}</p>
          )}
          {isEditing && editError && (
            <p className="text-brick text-xs bg-brick/10 border border-brick/20 rounded px-3 py-2">{editError}</p>
          )}

          {isEditing ? (
            <>
              <div>
                <p className="font-mono text-xs tracking-widest text-ink-soft uppercase mb-2">Description</p>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Description (optional)"
                />
              </div>

              <div>
                <p className="font-mono text-xs tracking-widest text-ink-soft uppercase mb-2">Priority</p>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setEditPriority(p)}
                      className={`flex-1 text-xs font-mono py-1.5 rounded border transition-all duration-150 ${
                        editPriority === p ? "text-white border-transparent scale-[1.03]" : "border-line text-ink-soft hover:border-accent/40"
                      }`}
                      style={editPriority === p ? { background: PRIORITY_COLORS[p] } : {}}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-xs tracking-widest text-ink-soft uppercase mb-2">Due Date</p>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <div>
              <p className="font-mono text-xs tracking-widest text-ink-soft uppercase mb-2">Description</p>
              {currentTask.description ? (
                <p className="text-sm text-ink whitespace-pre-wrap break-words leading-relaxed">
                  {currentTask.description}
                </p>
              ) : (
                <p className="text-sm text-ink-soft italic">No description provided.</p>
              )}
            </div>
          )}

          {!isEditing && (
            <div>
              <p className="font-mono text-xs tracking-widest text-ink-soft uppercase mb-2">Status</p>
              <div className="relative inline-block w-full sm:w-auto">
                <select
                  value={status}
                  disabled={busy}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="appearance-none text-sm font-mono border border-line rounded px-3 py-2 pr-8 bg-paper w-full sm:w-48 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft" />
              </div>
            </div>
          )}

          {!isEditing && currentTask.createdAt && (
            <div className="flex items-center gap-1.5 text-xs text-ink-soft font-mono pt-3 border-t border-line">
              <Clock3 size={13} />
              <span>Created {new Date(currentTask.createdAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-line flex items-center justify-between gap-3 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink px-4 py-2 rounded transition-colors disabled:opacity-50"
              >
                <XCircle size={15} /> Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-accent hover:bg-accent-deep px-4 py-2 rounded transition-colors disabled:opacity-60"
              >
                <Check size={15} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-accent px-3 py-2 rounded transition-colors"
              >
                <Pencil size={15} /> Edit
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-ink-soft hover:text-ink px-4 py-2 rounded transition-colors"
                >
                  Close
                </button>
                {confirmingDelete ? (
                  <button
                    onClick={handleDelete}
                    disabled={busy}
                    className="flex items-center gap-1.5 text-sm font-medium text-white bg-brick hover:bg-brick/90 px-4 py-2 rounded transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={15} /> Confirm Delete
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    onBlur={() => setConfirmingDelete(false)}
                    className="flex items-center gap-1.5 text-sm font-medium text-brick border border-brick/30 hover:bg-brick hover:text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}