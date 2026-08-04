import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  LogOut,
  CalendarDays,
  Search,
  ListChecks,
  CircleDashed,
  Clock3,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import TaskModal from "../components/TaskModal";
import TaskDetailModal from "../components/TaskDetailModal";
import { useAuth } from "../context/AuthContext";

const PRIORITY_COLORS = { HIGH: "#B5654A", MEDIUM: "#C79A2B", LOW: "#6E8F6C" };
const STATUS_COLORS = { PENDING: "#3B82F6", IN_PROGRESS: "#F59E0B", COMPLETED: "#22C55E" };
const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 bg-paper-raised border border-line rounded-lg px-4 py-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div
        className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
        style={{ background: `${color}1A`, color }}
      >
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-display font-semibold text-ink leading-tight">{value}</p>
        <p className="text-[11px] font-mono uppercase tracking-wide text-ink-soft truncate">{label}</p>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const calendarRef = useRef(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { logout, user } = useAuth();

  const fetchTasks = useCallback(async (start, end) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/tasks/range", { params: { start, end } });
      setTasks(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMonthRange = (year, month) => {
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    return { start, end };
  };

  useEffect(() => {
    const { start, end } = getMonthRange(selectedYear, selectedMonth);
    fetchTasks(start, end);
  }, [selectedMonth, selectedYear, fetchTasks]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      const statusMatch = statusFilter === "ALL" || t.status === statusFilter;
      const priorityMatch = priorityFilter === "ALL" || t.priority === priorityFilter;
      const searchMatch = !q || t.title.toLowerCase().includes(q);
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
  }), [tasks]);

  const events = filteredTasks.map((t) => ({
    id: t.id,
    title: t.title,
    date: t.dueDate,
    backgroundColor: STATUS_COLORS[t.status] || "#3B82F6",
    borderColor: STATUS_COLORS[t.status] || "#3B82F6",
    textColor: "#fff",
    extendedProps: { status: t.status, priority: t.priority },
  }));

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setModalOpen(true);
  };

  const handleEventClick = (info) => {
    const task = tasks.find((t) => String(t.id) === String(info.event.id));
    if (task) setSelectedTask(task);
  };
const refreshCurrentMonth = () => {
    const { start, end } = getMonthRange(selectedYear, selectedMonth);
    fetchTasks(start, end);
  };

  const goToMonthYear = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    calendarRef.current.getApi().gotoDate(new Date(year, month, 1));
  };

  const hasActiveFilters = statusFilter !== "ALL" || priorityFilter !== "ALL" || searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-line bg-paper-raised/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">
              Daily Planner{user?.fullName ? ` · ${user.fullName}` : ""}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Your Tasks</h1>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border border-brick text-brick hover:bg-brick hover:text-white transition-all duration-200"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 sm:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={ListChecks} label="Total Tasks" value={stats.total} color="#6E8F6C" />
          <StatCard icon={CircleDashed} label="Pending" value={stats.pending} color="#3B82F6" />
          <StatCard icon={Clock3} label="In Progress" value={stats.inProgress} color="#F59E0B" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="#22C55E" />
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title..."
            aria-label="Search tasks"
            className="w-full border border-line rounded-lg pl-10 pr-9 py-2.5 text-sm bg-paper-raised focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-mono text-xs text-ink-soft uppercase tracking-wide">Filter:</span>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none text-xs font-mono border border-line rounded px-2.5 py-1.5 pr-7 bg-paper-raised text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft" />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none text-xs font-mono border border-line rounded px-2.5 py-1.5 pr-7 bg-paper-raised text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="ALL">All Priorities</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setStatusFilter("ALL"); setPriorityFilter("ALL"); setSearchQuery(""); }}
              className="text-xs text-accent hover:text-accent-deep font-mono"
            >
              Clear all
            </button>
          )}

          <span className="ml-auto text-xs text-ink-soft font-mono">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-ink-soft uppercase tracking-wide">Jump To:</span>

          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => goToMonthYear(Number(e.target.value), selectedYear)}
              className="appearance-none border border-line rounded px-3 py-2 pr-8 bg-paper-raised text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft" />
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => goToMonthYear(selectedMonth, Number(e.target.value))}
              className="appearance-none border border-line rounded px-3 py-2 pr-8 bg-paper-raised text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {Array.from({ length: 21 }, (_, i) => (
                <option key={2020 + i} value={2020 + i}>{2020 + i}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-soft" />
          </div>
        </div>

        <div className="bg-paper-raised border border-line rounded-lg shadow-sm p-4 sm:p-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-paper-raised/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-lg">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dayMaxEvents={2}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            datesSet={(info) => {
              setSelectedMonth(info.view.currentStart.getMonth());
              setSelectedYear(info.view.currentStart.getFullYear());
            }}
            height="auto"
            eventContent={(arg) => {
              const { priority, status } = arg.event.extendedProps;
              return (
                <div className="flex items-center px-1.5 py-0.5 overflow-hidden w-full">
                  <span
                    className="task-dot flex-shrink-0"
                    style={{ background: PRIORITY_COLORS[priority] || "#999", marginRight: "5px" }}
                  />
                  <span className={`text-xs truncate ${status === "COMPLETED" ? "line-through opacity-90" : ""}`}>
                    {arg.event.title}
                  </span>
                </div>
              );
            }}
          />
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          date={selectedDate}
          tasks={tasks.filter((t) => t.dueDate === selectedDate)}
          onClose={() => setModalOpen(false)}
          onChange={refreshCurrentMonth}
          onTaskClick={(task) => setSelectedTask(task)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onChange={refreshCurrentMonth}
        />
      )}
    </div>
  );
}