import { useState, useEffect } from 'react'
import './App.css'

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
  loot?: string
  isDownstairs?: boolean
}

interface Character {
  x: number
  y: number
  health: number
  points: number
  inventory: { [key: string]: number }
  emoji: string
}

interface LogEntry {
  text: string
  type: 'damage' | 'health' | 'points'
  id: number
}

function App() {
  const [level, setLevel] = useState(1)
  const GRID_SIZE_WIDTH = 25
  const GRID_SIZE_HEIGHT = 20
  const MINE_COUNT = Math.min(GRID_SIZE_HEIGHT * GRID_SIZE_WIDTH * (0.15 + (level * 0.05)), GRID_SIZE_HEIGHT * GRID_SIZE_WIDTH * 0.50)
  const INITIAL_HEALTH = 100

  const [grid, setGrid] = useState<Cell[][]>([])
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [menuTab, setMenuTab] = useState<'instructions' | 'inventory'>('instructions')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const AVAILABLE_CHARACTERS = [
    '🧙‍♂️', '🕵️‍♂️', '🥷'
  ]

  const [showCharacterSelect, setShowCharacterSelect] = useState(true)
  const [character, setCharacter] = useState<Character>({
    x: Math.floor(GRID_SIZE_WIDTH / 2),
    y: Math.floor(GRID_SIZE_HEIGHT / 2),
    health: INITIAL_HEALTH,
    points: 0,
    inventory: {},
    emoji: '🧙‍♂️'
  })

  const addLogEntry = (text: string, type: 'damage' | 'health' | 'points') => {
    const id = Date.now()
    setLogEntries(prev => [{ text, type, id }, ...prev.slice(0, 49)])
  }

  const initializeGrid = () => {
    // Create empty grid
    const newGrid: Cell[][] = Array(GRID_SIZE_HEIGHT).fill(null).map(() =>
      Array(GRID_SIZE_WIDTH).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    )
  
    // Always use character's current position as the starting point
    const startX = character.x
    const startY = character.y
  
    // Create a safe zone around the starting position
    const safeZone = []
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = startY + dy
        const nx = startX + dx
        if (ny >= 0 && ny < GRID_SIZE_HEIGHT && nx >= 0 && nx < GRID_SIZE_WIDTH) {
          safeZone.push({ x: nx, y: ny })
        }
      }
    }
  
    // Place mines randomly, avoiding the safe zone
    let minesPlaced = 0
    while (minesPlaced < MINE_COUNT) {
      const x = Math.floor(Math.random() * GRID_SIZE_WIDTH)
      const y = Math.floor(Math.random() * GRID_SIZE_HEIGHT)
      if (!newGrid[y][x].isMine && !safeZone.some(pos => pos.x === x && pos.y === y)) {
        newGrid[y][x].isMine = true
        minesPlaced++
      }
    }

    // Place downstairs on a random safe cell
    let downstairsPlaced = false
    while (!downstairsPlaced) {
      const x = Math.floor(Math.random() * GRID_SIZE_WIDTH)
      const y = Math.floor(Math.random() * GRID_SIZE_HEIGHT)
      if (!newGrid[y][x].isMine && !safeZone.some(pos => pos.x === x && pos.y === y)) {
        newGrid[y][x].isDownstairs = true
        downstairsPlaced = true
      }
    }

    // Calculate neighbor mines
    for (let y = 0; y < GRID_SIZE_HEIGHT; y++) {
      for (let x = 0; x < GRID_SIZE_WIDTH; x++) {
        if (!newGrid[y][x].isMine) {
          let count = 0
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy
              const nx = x + dx
              if (ny >= 0 && ny < GRID_SIZE_HEIGHT && nx >= 0 && nx < GRID_SIZE_WIDTH) {
                if (newGrid[ny][nx].isMine) count++
              }
            }
          }
          newGrid[y][x].neighborMines = count
        }
      }
    }

    // Reveal the starting area and safe zone
    const revealCell = (y: number, x: number) => {
      if (y < 0 || y >= GRID_SIZE_HEIGHT || x < 0 || x >= GRID_SIZE_WIDTH || newGrid[y][x].isRevealed) return
      
      newGrid[y][x].isRevealed = true
      
      if (newGrid[y][x].neighborMines === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            revealCell(y + dy, x + dx)
          }
        }
      }
    }

    // Reveal all cells in the safe zone
    safeZone.forEach(pos => revealCell(pos.y, pos.x))
    setGrid(newGrid)
  }

  useEffect(() => {
    // Grid will be initialized after character selection
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    const { x, y } = character
    let newX = x
    let newY = y

    // Handle diagonal movement with WASD + Arrow key combinations
    const key = e.key.toLowerCase()
    
    // Diagonal movements
    if ((key === 'w' && e.shiftKey) || (e.key === 'ArrowUp' && e.shiftKey)) {
      // Up-left diagonal
      newY = Math.max(0, y - 1)
      newX = Math.max(0, x - 1)
    } else if ((key === 's' && e.shiftKey) || (e.key === 'ArrowDown' && e.shiftKey)) {
      // Down-right diagonal
      newY = Math.min(GRID_SIZE_HEIGHT - 1, y + 1)
      newX = Math.min(GRID_SIZE_WIDTH - 1, x + 1)
    } else if ((key === 'a' && e.shiftKey) || (e.key === 'ArrowLeft' && e.shiftKey)) {
      // Down-left diagonal
      newY = Math.min(GRID_SIZE_HEIGHT - 1, y + 1)
      newX = Math.max(0, x - 1)
    } else if ((key === 'd' && e.shiftKey) || (e.key === 'ArrowRight' && e.shiftKey)) {
      // Up-right diagonal
      newY = Math.max(0, y - 1)
      newX = Math.min(GRID_SIZE_WIDTH - 1, x + 1)
    } else {
      // Regular cardinal movements
      switch (key) {
        case 'w':
        case 'arrowup':
          newY = Math.max(0, y - 1)
          break
        case 's':
        case 'arrowdown':
          newY = Math.min(GRID_SIZE_HEIGHT - 1, y + 1)
          break
        case 'a':
        case 'arrowleft':
          newX = Math.max(0, x - 1)
          break
        case 'd':
        case 'arrowright':
          newX = Math.min(GRID_SIZE_WIDTH - 1, x + 1)
          break
        default:
          return
      }
    }

    // Allow movement to unrevealed cells and trigger dig
    if (newX !== x || newY !== y) {
      if (!grid[newY][newX].isRevealed) {
        handleDig(newX, newY)
      }
      setCharacter(prev => ({ ...prev, x: newX, y: newY }))
      
      // Check for downstairs after movement is complete
      if (grid[newY][newX].isDownstairs) {
        // Go to next level
        setLevel(prev => prev + 1)
        initializeGrid()
        addLogEntry(`Descended to level ${level + 1}!`, 'points')
      }
    }
  }

  // Comment out the handleCellClick and handleFlag functions
  /*
  const handleCellClick = (e: React.MouseEvent, cellX: number, cellY: number) => {
    e.preventDefault()
    // Only allow interaction with cells adjacent to the character
    const isAdjacent = Math.abs(cellX - character.x) <= 1 && Math.abs(cellY - character.y) <= 1
    if (!isAdjacent) return
  
    if (e.button === 0) { // Left click for digging
      handleDig(cellX, cellY)
    } else if (e.button === 2) { // Right click for flagging
      handleFlag(cellX, cellY)
    }
  }
  
  const handleFlag = (targetX: number, targetY: number) => {
    if (grid[targetY][targetX].isRevealed) return
  
    const newGrid = [...grid]
    newGrid[targetY][targetX].isFlagged = !newGrid[targetY][targetX].isFlagged
    setGrid(newGrid)
  }
  */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [character, grid])

  const handleDig = (targetX: number, targetY: number) => {
    if (grid[targetY][targetX].isFlagged || grid[targetY][targetX].isRevealed) return

    const newGrid = [...grid]
    let newlyRevealedCount = 0
    newGrid[targetY][targetX].isRevealed = true
    newlyRevealedCount++

    if (grid[targetY][targetX].isMine) {
      setCharacter(prev => ({
        ...prev,
        health: prev.health - 20
      }))
      addLogEntry('-20 HP', 'damage')
    } else {
      // Add random loot with adjusted probabilities
      const lootTypes = [
        { type: 'iron', chance: 0.125 },      // 1 in 8 chance
        { type: 'copper', chance: 0.05 },      // 1 in 20 chance
        { type: 'silver', chance: 0.025 },     // 1 in 40 chance
        { type: 'gold', chance: 0.01 },        // 1 in 100 chance
        { type: 'platinum', chance: 0.005 },    // 1 in 200 chance
        { type: 'amethyst', chance: 0.0025 },   // 1 in 400 chance
        { type: 'diamond', chance: 0.001 },     // 1 in 1000 chance
        { type: 'orbeez', chance: 0.0005 },     // 1 in 2000 chance
        { type: 'aether', chance: 0.00025 },    // 1 in 4000 chance
        { type: 'dark matter', chance: 0.0001 } // 1 in 10000 chance
      ]

      const roll = Math.random()
      let cumulativeChance = 0
      let selectedLoot = null

      for (const loot of lootTypes) {
        cumulativeChance += loot.chance
        if (roll < cumulativeChance) {
          selectedLoot = loot
          break
        }
      }

      if (selectedLoot) {
        setCharacter(prev => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            [selectedLoot.type]: (prev.inventory[selectedLoot.type] || 0) + 1
          }
        }))
        addLogEntry(`Found ${selectedLoot.type}!`, 'points')
      }

      // Reveal adjacent cells if this is a zero
      if (grid[targetY][targetX].neighborMines === 0) {
        const revealCell = (y: number, x: number) => {
          if (y < 0 || y >= GRID_SIZE_HEIGHT || x < 0 || x >= GRID_SIZE_WIDTH || newGrid[y][x].isRevealed) return
          
          newGrid[y][x].isRevealed = true
          newlyRevealedCount++
          
          if (newGrid[y][x].neighborMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                revealCell(y + dy, x + dx)
              }
            }
          }
        }
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            revealCell(targetY + dy, targetX + dx)
          }
        }
      }

      // Award points based on total revealed cells
      setCharacter(prev => ({
        ...prev,
        points: prev.points + newlyRevealedCount
      }))
    }

    setGrid(newGrid)
  }

  const handleFlag = (targetX: number, targetY: number) => {
    if (grid[targetY][targetX].isRevealed) return

    const newGrid = [...grid]
    newGrid[targetY][targetX].isFlagged = !newGrid[targetY][targetX].isFlagged
    setGrid(newGrid)
  }

  const handleCharacterSelect = (emoji: string) => {
    setCharacter(prev => ({ ...prev, emoji }))
    setShowCharacterSelect(false)
    initializeGrid()
  }

  if (showCharacterSelect) {
    return (
      <div className="character-select">
        <h2>Choose Your Character</h2>
        <div className="character-grid">
          {AVAILABLE_CHARACTERS.map((emoji, index) => (
            <button
              key={index}
              className="character-option"
              onClick={() => handleCharacterSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-content">
        <div className="status-bar">
          <div>Level: {level}</div>
          <div>Health: {character.health}</div>
          <div>Points: {character.points}</div>
          <div className="menu-dropdown">
            <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              Menu
            </button>
            {isMenuOpen && (
              <div className="menu-content">
                <div className="menu-tabs">
                  <button 
                    className={`menu-tab ${menuTab === 'instructions' ? 'active' : ''}`}
                    onClick={() => setMenuTab('instructions')}
                  >
                    Instructions
                  </button>
                  <button 
                    className={`menu-tab ${menuTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setMenuTab('inventory')}
                  >
                    Inventory
                  </button>
                </div>
                {menuTab === 'instructions' ? (
                  <div className="instructions">
                    <p>Use WASD or Arrow keys to move</p>
                    <p>Hold Shift + WASD/Arrow keys for diagonal movement</p>
                  </div>
                ) : (
                  <div className="inventory">
                    <h3>Your Loot</h3>
                    {Object.entries(character.inventory)
                      .sort(([,a], [,b]) => b - a)
                      .map(([item, count]) => (
                        <div key={item} className="inventory-item">
                          <span className="item-name">{item}</span>
                          <span className="item-count">x{count}</span>
                        </div>
                      ))
                    }
                    {Object.keys(character.inventory).length === 0 && (
                      <p className="empty-inventory">No items yet</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
                  <span style={{ zIndex: 4, position: 'relative', color: '#fff', textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>{cell.neighborMines}</span>
                )}
                {cell.isRevealed && cell.isMine && '💥'}
                {cell.isRevealed && cell.isDownstairs && '⬇️'}
              </div>
            ))}
          </div>
        ))}
      </div>

      </div>
      <div className="event-log">
        <h2>Event Log</h2>
        {logEntries.map(entry => (
          <div key={entry.id} className={`event-log-entry ${entry.type}`}>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
