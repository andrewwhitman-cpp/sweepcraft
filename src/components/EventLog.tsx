import { LogEntry } from './types'

interface EventLogProps {
  logEntries: LogEntry[]
  isDownstairs: boolean
}

export function EventLog({ logEntries, isDownstairs }: EventLogProps) {
  return (
    <div className="right-panel">
      <div className="event-log">
        <h2>Event Log</h2>
        {logEntries.map(entry => (
          <div key={entry.id} className={`event-log-entry ${entry.type}`}>
            {entry.text}
          </div>
        ))}
      </div>
      {isDownstairs && (
        <div className="press-e-hint">
          Press 'E' to descend
        </div>
      )}
    </div>
  )
}