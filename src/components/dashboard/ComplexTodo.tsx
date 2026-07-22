"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Plus,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  Flag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  dueDate?: number | null;
  completed: boolean;
  subtasks: Subtask[];
  createdAt: number;
}

export default function ComplexTodo() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback storage key
  const STORAGE_KEY = "naia-complex-todos";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    if (supabase) {
      try {
        const { data: todosData, error: todosError } = await supabase
          .from("todos")
          .select("*")
          .order("created_at", { ascending: false });

        if (!todosError && todosData) {
          const { data: subtasksData } = await supabase.from("subtasks").select("*");
          
          const formattedTasks: Task[] = todosData.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            priority: t.priority,
            dueDate: t.due_date ? new Date(t.due_date).getTime() : null,
            completed: t.completed,
            createdAt: new Date(t.created_at).getTime(),
            subtasks: (subtasksData || [])
              .filter((st) => st.todo_id === t.id)
              .map((st) => ({ id: st.id, title: st.title, completed: st.completed })),
          }));
          setTasks(formattedTasks);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Supabase fetch error, falling back to localStorage", e);
      }
    }

    // Fallback to localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTasks(JSON.parse(saved));
    }
    setLoading(false);
  };

  const saveToStorage = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    if (!supabase) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      priority: "medium",
      completed: false,
      subtasks: [],
      createdAt: Date.now(),
    };

    const updated = [newTask, ...tasks];
    saveToStorage(updated);
    setNewTaskTitle("");

    if (supabase) {
      await supabase.from("todos").insert({
        id: newTask.id,
        title: newTask.title,
        priority: newTask.priority,
        completed: newTask.completed,
      });
    }
  };

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbcfe8', '#f472b6', '#e879f9', '#a78bfa'],
      });
    }
    
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveToStorage(updated);

    if (supabase) {
      await supabase.from("todos").update({ completed: !currentCompleted }).eq("id", id);
    }
  };

  const updateTaskDetails = async (id: string, updates: Partial<Task>) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    saveToStorage(updated);

    if (supabase) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
      
      await supabase.from("todos").update(dbUpdates).eq("id", id);
    }
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveToStorage(updated);

    if (supabase) {
      await supabase.from("todos").delete().eq("id", id);
    }
  };

  const addSubtask = async (taskId: string, subtaskTitle: string) => {
    if (!subtaskTitle.trim()) return;
    const newSub: Subtask = { id: crypto.randomUUID(), title: subtaskTitle.trim(), completed: false };
    
    const updated = tasks.map((t) => {
      if (t.id === taskId) return { ...t, subtasks: [...t.subtasks, newSub] };
      return t;
    });
    saveToStorage(updated);

    if (supabase) {
      await supabase.from("subtasks").insert({
        id: newSub.id,
        todo_id: taskId,
        title: newSub.title,
        completed: newSub.completed,
      });
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#fbcfe8', '#f472b6', '#e879f9', '#a78bfa'],
      });
    }

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)),
        };
      }
      return t;
    });
    saveToStorage(updated);

    if (supabase) {
      await supabase.from("subtasks").update({ completed: !currentCompleted }).eq("id", subtaskId);
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) };
      }
      return t;
    });
    saveToStorage(updated);

    if (supabase) {
      await supabase.from("subtasks").delete().eq("id", subtaskId);
    }
  };

  const priorityColors = {
    high: "text-rose-500 bg-rose-50",
    medium: "text-orange-500 bg-orange-50",
    low: "text-blue-500 bg-blue-50",
  };

  if (loading) return <div className="p-4 text-center text-sm text-gray-500 animate-pulse">Loading Tasks...</div>;

  return (
    <div className="w-full">
      {/* Add New Task */}
      <div className="relative mb-5">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white/60 border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all placeholder-gray-400 text-gray-700 shadow-inner"
        />
        <button
          onClick={addTask}
          disabled={!newTaskTitle.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl border transition-all ${
                task.completed ? "bg-white/40 border-gray-100" : "bg-white/80 border-pink-100 shadow-sm"
              } overflow-hidden`}
            >
              {/* Task Header */}
              <div className="p-4 flex items-start gap-3">
                <button
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    task.completed
                      ? "bg-green-400 border-green-400"
                      : "border-gray-300 hover:border-pink-400"
                  }`}
                >
                  {task.completed && <Check size={14} className="text-white" />}
                </button>
                
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                >
                  <h3 className={`font-medium text-sm transition-all ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                    {task.title}
                  </h3>
                  
                  {/* Task Metadata Mini */}
                  {!task.completed && (task.dueDate || task.subtasks.length > 0 || task.priority !== 'medium') && (
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      {task.priority !== 'medium' && (
                        <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${priorityColors[task.priority]}`}>
                          <Flag size={10} />
                          <span className="capitalize">{task.priority}</span>
                        </span>
                      )}
                      {task.subtasks.length > 0 && (
                        <span className="text-gray-400 flex items-center gap-1">
                          <Check size={10} />
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-pink-500 flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded-md">
                          <Calendar size={10} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {task.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete completed task"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg"
                  >
                    {expandedTaskId === task.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              <AnimatePresence>
                {expandedTaskId === task.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-gray-50/50"
                  >
                    <div className="p-4 space-y-4">
                      {/* Description */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                        <textarea
                          value={task.description || ""}
                          onChange={(e) => updateTaskDetails(task.id, { description: e.target.value })}
                          placeholder="Add details..."
                          className="w-full text-sm bg-white border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 resize-none"
                          rows={2}
                        />
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Priority</label>
                          <select
                            value={task.priority}
                            onChange={(e) => updateTaskDetails(task.id, { priority: e.target.value as any })}
                            className="w-full text-sm bg-white border border-gray-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-pink-300 capitalize"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Due Date</label>
                          <input
                            type="date"
                            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
                            onChange={(e) => updateTaskDetails(task.id, { dueDate: e.target.value ? new Date(e.target.value).getTime() : null })}
                            className="w-full text-sm bg-white border border-gray-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-pink-300"
                          />
                        </div>
                      </div>

                      {/* Subtasks */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Subtasks</label>
                        <div className="space-y-2">
                          {task.subtasks.map((st) => (
                            <div key={st.id} className="flex items-center gap-2 group">
                              <button
                                onClick={() => toggleSubtask(task.id, st.id, st.completed)}
                                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                                  st.completed ? "bg-green-400 border-green-400" : "border-gray-300"
                                }`}
                              >
                                {st.completed && <Check size={10} className="text-white" />}
                              </button>
                              <span className={`text-sm flex-1 ${st.completed ? "text-gray-400 line-through" : "text-gray-600"}`}>
                                {st.title}
                              </span>
                              <button
                                onClick={() => deleteSubtask(task.id, st.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 mt-2">
                            <Plus size={14} className="text-pink-400" />
                            <input
                              type="text"
                              placeholder="Add subtask..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addSubtask(task.id, e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                              className="text-sm bg-transparent border-b border-gray-200 focus:border-pink-400 focus:outline-none w-full py-1 text-gray-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Delete Task Button */}
                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          <Trash2 size={12} /> Delete Entire Task
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mx-auto mb-3">
                <Check size={28} className="text-pink-400" />
              </div>
              <p className="text-sm text-gray-500">You&apos;re all caught up, bnuy! ✨</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
