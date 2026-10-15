import React, { useState } from 'react';
import {
  BellRing,
  CheckSquare,
  Clock,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Calendar,
  X,
  User,
  Shield,
  Edit2,
  Trash2
} from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { NotificationItem, TaskItem } from '../types';
import { Badge } from '../components/common/Badge';

interface TasksNotificationsPageProps {
  initialTab?: 'notifications' | 'tasks';
}

export const TasksNotificationsPage: React.FC<TasksNotificationsPageProps> = ({ initialTab = 'notifications' }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'tasks'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    storage.getNotifications(currentUser?.id)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() => storage.getTasks());

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newTaskDue, setNewTaskDue] = useState(new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]);

  const refreshData = () => {
    setNotifications(storage.getNotifications(currentUser?.id));
    setTasks(storage.getTasks());
  };

  const handleToggleTask = (taskId: string) => {
    storage.toggleTaskComplete(taskId);
    refreshData();
  };

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead(currentUser?.id);
    refreshData();
  };

  const handleClearAllNotifications = () => {
    storage.clearAllNotifications(currentUser?.id);
    refreshData();
  };

  const handleDeleteNotification = (notifId: string) => {
    storage.deleteNotification(notifId);
    refreshData();
  };

  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('Medium');
    setNewTaskDue(new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDesc(task.description || '');
    setNewTaskPriority(task.priority);
    setNewTaskDue(task.dueDate);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    storage.deleteTask(taskId);
    refreshData();
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTaskTitle.trim()) return;

    storage.saveTask(
      {
        ...(editingTask ? { id: editingTask.id } : {}),
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        priority: newTaskPriority,
        dueDate: newTaskDue,
        assignedToId: editingTask ? editingTask.assignedToId : currentUser.id,
        assignedToName: editingTask ? editingTask.assignedToName : currentUser.name
      },
      currentUser
    );

    setNewTaskTitle('');
    setNewTaskDesc('');
    setEditingTask(null);
    setIsTaskModalOpen(false);
    refreshData();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-wide">
              Operations Center: Alerts &amp; Tasks
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-400 text-xs font-mono font-semibold border border-red-500/20">
                {unreadCount} Unread Alerts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Operational action items, court deadlines, and case assignment directives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'notifications' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-700 transition-colors"
              >
                Mark All as Read
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAllNotifications}
                  className="px-3 py-2 bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 rounded-lg text-xs font-semibold uppercase tracking-wider border border-slate-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleOpenCreateTask}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-1 text-xs font-semibold uppercase tracking-wider font-mono">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-blue-500 text-blue-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'tasks'
              ? 'border-blue-500 text-blue-400 bg-slate-800/30'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Investigation Task List ({tasks.length})
        </button>
      </div>

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No notifications active.</div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                    !item.isRead
                      ? 'bg-blue-950/20 border-blue-900/50 text-slate-200'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'deadline' ? (
                      <Clock className="w-5 h-5 text-amber-400" />
                    ) : item.type === 'alert' ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteNotification(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                  task.isCompleted
                    ? 'bg-slate-950/50 border-slate-800/60 opacity-60'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-1 rounded-sm bg-slate-800 text-blue-600 cursor-pointer"
                  />
                  <div>
                    <h4
                      className={`text-xs font-bold text-white ${
                        task.isCompleted ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                    )}
                    <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-3">
                      <span>Assigned to: {task.assignedToName}</span>
                      <span>&bull;</span>
                      <span className="text-amber-400">Due: {task.dueDate}</span>
                      {task.relatedCaseId && (
                        <>
                          <span>&bull;</span>
                          <span className="text-indigo-400">{task.relatedCaseId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge type="casePriority" value={task.priority} size="sm" />
                  <button
                    onClick={() => handleOpenEditTask(task)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono uppercase">
                {editingTask ? 'Edit Operational Task Directive' : 'Create Operational Task'}
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Task Directive *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="E.g. Swab ballistic casing from Bay 4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Specific procedural directives..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
