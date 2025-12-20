import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const CreateTaskForm = ({ onTaskCreated, onClose }) => {
  const [title, setTitle] = React.useState('');
  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [endTime, setEndTime] = React.useState('09:30');
  const [category, setCategory] = React.useState('study');
  const [priority, setPriority] = React.useState('high');
  const [reminder, setReminder] = React.useState('15');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('You must be logged in to create tasks.');
      return;
    }

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!date || !startTime || !endTime) {
      setError('Please provide date, start time, and end time.');
      return;
    }

    // Front-end validation mirroring backend rules
    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      if (Number.isNaN(startDateTime.getTime()) || Number.isNaN(endDateTime.getTime())) {
        setError('Invalid date or time.');
        return;
      }

      // Calculate duration in minutes, supporting overnight tasks
      let adjustedEnd = new Date(endDateTime.getTime());
      if (adjustedEnd < startDateTime) {
        adjustedEnd = new Date(adjustedEnd.getTime() + 24 * 60 * 60 * 1000);
      }

      const minutes = Math.round((adjustedEnd.getTime() - startDateTime.getTime()) / 60000);
      if (minutes < 15) {
        setError('Task duration must be at least 15 minutes.');
        return;
      }

      // Prevent creating tasks fully in the past
      const now = new Date();
      const taskDateOnly = new Date(`${date}T00:00:00`);
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (taskDateOnly < todayOnly) {
        setError('Task date cannot be in the past.');
        return;
      }

      if (taskDateOnly.getTime() === todayOnly.getTime() && startDateTime <= now) {
        setError('Task start time must be in the future.');
        return;
      }
    } catch (validationError) {
      console.error('Client-side task validation error', validationError);
      setError('Invalid date or time selection.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || '',
          priority,
          category,
          task_date: date,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendError = data?.error || data?.detail || data?.non_field_errors?.[0];
        if (backendError) {
          setError(backendError);
        } else if (typeof data === 'object') {
          const keys = Object.keys(data || {});
          const firstKey = keys[0];
          const firstMessage = firstKey ? (Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]) : null;
          setError(firstMessage || 'Failed to create task. Please try again.');
        } else {
          setError('Failed to create task. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (data?.task && onTaskCreated) {
        onTaskCreated(data.task);
      }

      // Reset the form
      setTitle('');
      setDate('');
      setStartTime('09:00');
      setEndTime('09:30');
      setCategory('study');
      setPriority('high');
      setReminder('15');
      setDescription('');

      setLoading(false);

      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Create task error', err);
      setError('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white border border-background-dark shadow-sm p-5 md:p-7 space-y-5"
    >
      <h2 className="text-lg font-semibold text-heading mb-1">Create New Task</h2>

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium text-heading">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          placeholder="e.g. Study for math exam"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Date & Time */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-sm font-medium text-heading">
            Date
          </label>
          <input
            id="date"
            type="date"
            className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="startTime" className="block text-sm font-medium text-heading">
            Start Time
          </label>
          <input
            id="startTime"
            type="time"
            className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="endTime" className="block text-sm font-medium text-heading">
            End Time
          </label>
          <input
            id="endTime"
            type="time"
            className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      {/* Category & Priority */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-sm font-medium text-heading">
            Category
          </label>
          <select
            id="category"
            className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="study">Study</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="health">Health</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="priority" className="block text-sm font-medium text-heading">
            Priority
          </label>
          <select
            id="priority"
            className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-heading">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary resize-none"
          placeholder="Add extra details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Actions */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-xl border border-background-dark/70 px-4 py-2.5 text-sm font-semibold text-body bg-background-soft hover:bg-background-dark/40 transition-all duration-200"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark disabled:bg-primary/60 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          {loading ? 'Saving...' : 'Save Task'}
        </button>
      </div>
    </form>
  );
};

export default CreateTaskForm;
