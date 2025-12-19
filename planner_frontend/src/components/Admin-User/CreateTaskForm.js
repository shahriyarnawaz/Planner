import React from 'react';

const CreateTaskForm = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
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
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="startTime" className="block text-sm font-medium text-heading">
            Start Time
          </label>
          <input
            id="startTime"
            type="time"
            defaultValue="09:00"
            className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="endTime" className="block text-sm font-medium text-heading">
            End Time
          </label>
          <input
            id="endTime"
            type="time"
            defaultValue="09:30"
            className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
      </div>

      {/* Suggested Time */}
      <div className="flex items-center justify-between text-xs md:text-sm text-body border border-background-dark rounded-xl px-3 py-2.5 bg-background-soft">
        <span className="font-medium text-heading">Suggested Time:</span>
        <span className="flex items-center gap-1">
          <span className="text-base">👉</span>
          <span>8:00 PM – 9:00 PM (Based on history)</span>
        </span>
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
            defaultValue="study"
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
            defaultValue="high"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Reminder */}
      <div className="space-y-1.5 max-w-xs">
        <label htmlFor="reminder" className="block text-sm font-medium text-heading">
          Reminder
        </label>
        <select
          id="reminder"
          className="w-full rounded-xl border border-background-dark bg-background-soft px-3 py-2.5 text-body text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          defaultValue="15"
        >
          <option value="none">No reminder</option>
          <option value="5">5 min before</option>
          <option value="15">15 min before</option>
          <option value="30">30 min before</option>
          <option value="60">1 hour before</option>
          <option value="1440">1 day before</option>
        </select>
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
        />
      </div>

      {/* Actions */}
      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          Save Task
        </button>
      </div>
    </form>
  );
};

export default CreateTaskForm;
