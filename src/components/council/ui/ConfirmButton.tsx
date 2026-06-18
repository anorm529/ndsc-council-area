'use client'

export function ConfirmButton({
  action,
  message,
  label,
  className,
}: {
  action: (formData: FormData) => Promise<void>
  message: string
  label: string
  className?: string
}) {
  return (
    <form action={action} className="inline">
      <button
        type="submit"
        className={className}
        onClick={(e) => {
          if (!confirm(message)) e.preventDefault()
        }}
      >
        {label}
      </button>
    </form>
  )
}
