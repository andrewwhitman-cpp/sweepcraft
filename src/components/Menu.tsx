interface MenuProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  menuTab: 'instructions' | 'inventory'
  setMenuTab: (tab: 'instructions' | 'inventory') => void
  inventory: { [key: string]: number }
}

export function Menu({ isOpen, setIsOpen, menuTab, setMenuTab, inventory }: MenuProps) {
  return (
    <div className="menu-dropdown">
      <button className="menu-button" onClick={() => setIsOpen(!isOpen)}>
        Menu
      </button>
      {isOpen && (
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
              <p>Press 'E' while standing on ⬇️ to descend to the next level</p>
            </div>
          ) : (
            <div className="inventory">
              <h3>Your Loot</h3>
              {Object.entries(inventory)
                .sort(([,a], [,b]) => b - a)
                .map(([item, count]) => (
                  <div key={item} className="inventory-item">
                    <span className="item-name">{item}</span>
                    <span className="item-count">x{count}</span>
                  </div>
                ))
              }
              {Object.keys(inventory).length === 0 && (
                <p className="empty-inventory">No items yet</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}