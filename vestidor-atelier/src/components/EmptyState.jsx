import { Link } from 'react-router-dom'

export default function EmptyState({ icon: Icon, title, text, actionLabel, to, onAction, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'gap-1.5 p-2' : 'gap-3 px-6 py-16'}`}>
      {Icon && (
        <span className={`grid place-items-center rounded-2xl bg-morado/15 text-morado ${compact ? 'h-9 w-9' : 'h-14 w-14'}`}>
          <Icon className={compact ? 'h-4 w-4' : 'h-6 w-6'} aria-hidden="true" />
        </span>
      )}
      <h3 className={`font-display font-semibold ${compact ? 'text-sm' : 'text-lg'}`}>{title}</h3>
      {text && <p className={`max-w-xs text-mute ${compact ? 'text-xs' : 'text-sm'}`}>{text}</p>}
      {actionLabel && to && (
        <Link to={to} className="btn-grad mt-1 rounded-xl px-4 py-2 text-sm font-semibold text-white">{actionLabel}</Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-grad mt-1 rounded-xl px-4 py-2 text-sm font-semibold text-white">{actionLabel}</button>
      )}
    </div>
  )
}
