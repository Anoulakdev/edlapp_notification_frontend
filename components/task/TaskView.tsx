"use client";

import React, { useState } from "react";
import { 
  Plus, Search, Filter, MoreVertical, Calendar, Clock, MessageSquare, 
  Paperclip, CheckCircle2, Circle, MoreHorizontal, AlertCircle, PlayCircle, User
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data
const initialTasksData = [
  {
    id: "TSK-01",
    title: "Design unified design system component library",
    description: "Create a comprehensive Figma library including all basic UI elements, buttons, inputs, and form layouts aligned with our new brand guidelines.",
    status: "in-progress",
    priority: "high",
    dueDate: "Today",
    project: "Design System",
    comments: 12,
    attachments: 4,
    assignees: ["A", "B"]
  },
  {
    id: "TSK-02",
    title: "Implement authentication flow with NextAuth",
    description: "Set up signin, signup, forgot password, and reset password screens using the new design system components.",
    status: "todo",
    priority: "high",
    dueDate: "Tomorrow",
    project: "Core App",
    comments: 3,
    attachments: 0,
    assignees: ["C"]
  },
  {
    id: "TSK-03",
    title: "Optimize image loading on landing page",
    description: "Noticeable layout shift occurring during initial load. Need to implement proper sizing and use next/image effectively.",
    status: "completed",
    priority: "medium",
    dueDate: "Oct 24",
    project: "Marketing",
    comments: 5,
    attachments: 2,
    assignees: ["A"]
  },
  {
    id: "TSK-04",
    title: "Write documentation for API rate limiting",
    description: "Document the new redis-based rate limit parameters for third-party developers consuming our public APIs.",
    status: "todo",
    priority: "low",
    dueDate: "Oct 28",
    project: "Documentation",
    comments: 0,
    attachments: 1,
    assignees: ["D"]
  },
  {
    id: "TSK-05",
    title: "Update privacy policy for GDPR compliance",
    description: "Legal team provided updated text. Need to replace the current privacy policy page and add a banner for users to accept.",
    status: "in-progress",
    priority: "medium",
    dueDate: "Nov 02",
    project: "Legal",
    comments: 8,
    attachments: 2,
    assignees: ["B", "C"]
  }
];

export function TaskView() {
  const [activeTab, setActiveTab] = useState('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState(initialTasksData);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Tasks", value: tasks.length, color: "rgb(var(--brand))" },
    { label: "In Progress", value: tasks.filter(t => t.status === 'in-progress').length, color: "rgb(var(--warning))" },
    { label: "Completed", value: tasks.filter(t => t.status === 'completed').length, color: "rgb(var(--success))" },
    { label: "Overdue", value: 0, color: "rgb(var(--danger))" },
  ];

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'rgb(var(--danger))';
      case 'medium': return 'rgb(var(--warning))';
      case 'low': return 'rgb(var(--success))';
      default: return 'rgb(var(--text-secondary))';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5" style={{ color: "rgb(var(--success))" }} />;
      case 'in-progress': return <PlayCircle className="w-5 h-5" style={{ color: "rgb(var(--brand))" }} />;
      default: return <Circle className="w-5 h-5" style={{ color: "rgb(var(--text-secondary))" }} />;
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-[1600px] mx-auto space-y-8 pb-24 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
            Tasks
          </h1>
          <p className="text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
            Manage your incoming tasks, track progress, and collaborate seamlessly.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[rgb(var(--brand))]" style={{ color: "rgb(var(--text-secondary))" }} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-xl text-sm border outline-none transition-all focus:ring-2"
              style={{ 
                background: "rgb(var(--card))", 
                borderColor: "rgb(var(--border))", 
                color: "rgb(var(--text-primary))",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
            />
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))", color: "rgb(var(--text-primary))" }}>
            <Filter className="w-4 h-4" />
          </button>
          <button onClick={() => alert('Open New Task modal')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] shadow-lg" style={{ background: "linear-gradient(135deg, rgb(var(--brand)) 0%, rgb(var(--brand)/0.8) 100%)", boxShadow: "0 8px 20px rgba(var(--brand), 0.25)" }}>
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border flex flex-col justify-center transition-transform hover:-translate-y-1" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold tracking-tight leading-none" style={{ color: "rgb(var(--text-primary))" }}>
                {stat.value}
              </span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "rgb(var(--text-secondary))" }}>
              <span className="w-2 h-2 rounded-full block" style={{ background: stat.color }}></span>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex border-b relative z-10" style={{ borderColor: "rgb(var(--border))" }}>
        <button 
          onClick={() => setActiveTab('board')}
          className={`pb-3 px-4 text-sm font-semibold transition-all ${activeTab === 'board' ? 'border-b-2' : 'hover:opacity-70'}`}
          style={{ 
            color: activeTab === 'board' ? "rgb(var(--text-primary))" : "rgb(var(--text-secondary))",
            borderColor: activeTab === 'board' ? "rgb(var(--brand))" : "transparent"
          }}
        >
          Board View
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`pb-3 px-4 text-sm font-semibold transition-all ${activeTab === 'list' ? 'border-b-2' : 'hover:opacity-70'}`}
          style={{ 
            color: activeTab === 'list' ? "rgb(var(--text-primary))" : "rgb(var(--text-secondary))",
            borderColor: activeTab === 'list' ? "rgb(var(--brand))" : "transparent"
          }}
        >
          List View
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* To Do Column */}
          <div 
            className="flex flex-col gap-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'todo')}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: "rgb(var(--text-primary))" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgb(var(--text-secondary))" }}></span>
                To Do
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(var(--text-secondary), 0.1)", color: "rgb(var(--text-secondary))" }}>{filteredTasks.filter(t => t.status === 'todo').length}</span>
            </div>
            {filteredTasks.filter(t => t.status === 'todo').map((task) => (
              <TaskCard key={task.id} task={task} draggable onDragStart={(e) => handleDragStart(e, task.id)} />
            ))}
          </div>

          {/* In Progress Column */}
          <div 
            className="flex flex-col gap-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'in-progress')}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: "rgb(var(--text-primary))" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgb(var(--brand))" }}></span>
                In Progress
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(var(--brand), 0.1)", color: "rgb(var(--brand))" }}>{filteredTasks.filter(t => t.status === 'in-progress').length}</span>
            </div>
            {filteredTasks.filter(t => t.status === 'in-progress').map((task) => (
              <TaskCard key={task.id} task={task} draggable onDragStart={(e) => handleDragStart(e, task.id)} />
            ))}
          </div>

          {/* Completed Column */}
          <div 
            className="flex flex-col gap-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'completed')}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: "rgb(var(--text-primary))" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgb(var(--success))" }}></span>
                Completed
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(var(--success), 0.1)", color: "rgb(var(--success))" }}>{filteredTasks.filter(t => t.status === 'completed').length}</span>
            </div>
            {filteredTasks.filter(t => t.status === 'completed').map((task) => (
              <TaskCard key={task.id} task={task} draggable onDragStart={(e) => handleDragStart(e, task.id)} />
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl border overflow-hidden relative z-10" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase border-b" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-secondary))", borderColor: "rgb(var(--border))" }}>
                <tr>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Task</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y relative" style={{ borderColor: "rgb(var(--border))" }}>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4 align-middle">
                      {getStatusIcon(task.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold mb-1" style={{ color: "rgb(var(--text-primary))" }}>{task.title}</div>
                      <div className="text-xs truncate max-w-sm" style={{ color: "rgb(var(--text-secondary))" }}>{task.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: `rgba(${getPriorityColor(task.priority).replace("rgb(", "").replace(")", "")}, 0.1)`, color: getPriorityColor(task.priority) }}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                      {task.project}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "rgb(var(--text-secondary))" }}>
                        <Calendar className="w-3.5 h-3.5" />
                        {task.dueDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: "rgb(var(--text-secondary))" }}>
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component for Kanban Cards
function TaskCard({ task, draggable, onDragStart }: { task: any, draggable?: boolean, onDragStart?: (e: React.DragEvent) => void }) {
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'rgb(var(--danger))';
      case 'medium': return 'rgb(var(--warning))';
      case 'low': return 'rgb(var(--success))';
      default: return 'rgb(var(--text-secondary))';
    }
  };

  return (
    <div 
      className="p-5 rounded-2xl border flex flex-col gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white dark:bg-[#121212] group relative overflow-hidden" 
      style={{ borderColor: "rgb(var(--border))" }}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: getPriorityColor(task.priority) }}></div>
      
      <div className="flex items-start justify-between gap-2">
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold capitalize tracking-wide" style={{ background: `rgba(${getPriorityColor(task.priority).replace("rgb(", "").replace(")", "")}, 0.1)`, color: getPriorityColor(task.priority) }}>
          {task.priority}
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "rgb(var(--text-secondary))" }}>
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <div>
        <h4 className="font-bold text-sm leading-snug mb-2 group-hover:text-[rgb(var(--brand))] transition-colors" style={{ color: "rgb(var(--text-primary))" }}>
          {task.title}
        </h4>
        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>
          {task.description}
        </p>
      </div>

      <div className="mt-2 pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="flex items-center -space-x-2">
          {task.assignees.map((assignee: string, i: number) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white z-10" style={{ background: i === 0 ? "rgb(var(--brand))" : "rgb(var(--warning))", borderColor: "rgb(var(--card))" }}>
              {assignee}
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-3 text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
          {task.comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.comments}</span>
            </div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{task.attachments}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
