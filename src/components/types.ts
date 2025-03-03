export interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
  loot?: string
  isDownstairs?: boolean
}

export interface Character {
  x: number
  y: number
  health: number
  points: number
  inventory: { [key: string]: number }
  emoji: string
}

export interface LogEntry {
  text: string
  type: 'damage' | 'health' | 'points'
  id: number
}