import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/council/ui/StatusBadge'
import { PriorityBadge } from '@/components/council/ui/PriorityBadge'
import { EmptyState } from '@/components/council/ui/EmptyState'
import { formatDateLong, formatDate, formatCurrency, isOverdue } from '@/lib/utils'
import { createEventTask, updateEventTaskStatus } from '@/lib/actions/events'
import { FormField, SelectField, SubmitButton } from '@/components/council/ui/FormField'

export const metadata: Metadata = { title: 'Event' }

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [event, members] = await Promise.all([
    prisma.councilEvent.findUnique({
      where: { id },
      include: {
        lead: { select: { name: true } },
        tasks: {
          orderBy: { dueDate: 'asc' },
          include: { owner: { select: { name: true } } },
        },
      },
    }),
    prisma.councilMember.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  if (!event) notFound()

  const createTaskWithId = createEventTask.bind(null, id)

  const completedTasks = event.tasks.filter((t) => t.status === 'complete').length
  const totalTasks = event.tasks.length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/council/events" className="text-sm text-slate-500 hover:text-slate-700">← Back to events</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              {event.eventDate && <span>{formatDateLong(event.eventDate)}</span>}
              {event.startTime && <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>}
              {event.location && <span>{event.location}</span>}
              {event.eventType && <span className="capitalize">{event.eventType.replace(/_/g, ' ')}</span>}
            </div>
            {event.lead && <div className="text-sm text-slate-500 mt-1">Lead: {event.lead.name}</div>}
            {event.budget && <div className="text-sm text-slate-500">Budget: {formatCurrency(event.budget)}</div>}
          </div>
          <StatusBadge status={event.status} />
        </div>

        {event.description && (
          <p className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-700">{event.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task list */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Tasks
              {totalTasks > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {completedTasks}/{totalTasks} done
                </span>
              )}
            </h2>
          </div>

          {/* Task progress bar */}
          {totalTasks > 0 && (
            <div className="mb-4 bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.round((completedTasks / totalTasks) * 100)}%` }}
              />
            </div>
          )}

          {event.tasks.length === 0 ? (
            <p className="text-sm text-slate-400 mb-4">No tasks yet.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {event.tasks.map((task) => {
                const toggleComplete = updateEventTaskStatus.bind(null, task.id, task.status === 'complete' ? 'not_started' : 'complete', id)
                return (
                  <div key={task.id} className={`flex items-start gap-3 p-2 rounded-md ${task.status === 'complete' ? 'opacity-60' : ''}`}>
                    <form action={toggleComplete} className="mt-0.5 flex-shrink-0">
                      <button
                        type="submit"
                        className={`w-4 h-4 rounded border flex items-center justify-center text-xs transition-colors ${task.status === 'complete' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-blue-400'}`}
                      >
                        {task.status === 'complete' && '✓'}
                      </button>
                    </form>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${task.status === 'complete' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.owner && <span className="text-xs text-slate-400">{task.owner.name}</span>}
                        {task.dueDate && (
                          <span className={`text-xs ${isOverdue(task.dueDate) && task.status !== 'complete' ? 'text-red-500' : 'text-slate-400'}`}>
                            Due {formatDate(task.dueDate)}
                          </span>
                        )}
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add task form */}
          <form action={createTaskWithId} className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-medium text-slate-500">Add task</p>
            <FormField label="" name="title" required placeholder="Task description..." />
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label=""
                name="owner_id"
                options={members.map((m) => ({ value: m.id, label: m.name }))}
                placeholder="Owner"
              />
              <SelectField
                label=""
                name="priority"
                defaultValue="medium"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>
            <FormField label="" name="due_date" type="date" />
            <SubmitButton label="Add task" />
          </form>
        </div>

        {/* Notes */}
        {event.notes && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Notes</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
