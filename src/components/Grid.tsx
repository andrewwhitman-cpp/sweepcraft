import { Cell, Character } from './types'

interface GridProps {
  grid: Cell[][]
  character: Character
}

export function Grid({ grid, character }: GridProps) {
  return (
    <div className="grid" onContextMenu={(e) => e.preventDefault()}>
      {grid.map((row, y) => (
        <div key={y} className="row">
          {row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`cell
                ${cell.isRevealed ? 'revealed' : ''}
                ${cell.isFlagged ? 'flagged' : ''}
                ${character.x === x && character.y === y ? 'character' : ''}`}
              data-emoji={character.x === x && character.y === y ? character.emoji : ''}
            >
              {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && (
                <span style={{ zIndex: 4, position: 'relative', color: '#fff', textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
                  {cell.neighborMines}
                </span>
              )}
              {cell.isRevealed && cell.isMine && '💥'}
              {cell.isRevealed && cell.isDownstairs && '⬇️'}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}