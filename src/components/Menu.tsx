import React from 'react'

interface MenuProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  menuTab: 'instructions' | 'inventory' | 'skillTree'
  setMenuTab: (tab: 'instructions' | 'inventory' | 'skillTree') => void
  inventory: { [key: string]: number }
}

type MenuCategory = 'main' | 'instructions' | 'inventory' | 'skillTree'

export function Menu({ isOpen, setIsOpen, menuTab, setMenuTab, inventory }: MenuProps) {
  const [currentView, setCurrentView] = React.useState<MenuCategory>(menuTab === 'main' ? 'main' : menuTab)

  React.useEffect(() => {
    if (menuTab !== 'main' && currentView === 'main') {
      setCurrentView(menuTab)
    }
  }, [menuTab])

  const handleCategoryClick = (category: MenuCategory) => {
    setCurrentView(category)
    if (category !== 'main') {
      setMenuTab(category as 'instructions' | 'inventory' | 'skillTree')
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'main':
        return (
          <div className="menu-list">
            <button className="menu-item" onClick={() => handleCategoryClick('instructions')}>Instructions</button>
            <button className="menu-item" onClick={() => handleCategoryClick('inventory')}>Inventory</button>
            <button className="menu-item" onClick={() => handleCategoryClick('skillTree')}>Skill Tree</button>
          </div>
        )
      case 'instructions':
        return (
          <div className="menu-category-content">
            <button className="back-button" onClick={() => handleCategoryClick('main')}>← Back</button>
            <div className="instructions">
              <p>Use WASD or Arrow keys to move</p>
              <p>Hold Shift + WASD/Arrow keys for diagonal movement</p>
              <p>Press 'E' while standing on ⬇️ to descend to the next level</p>
            </div>
          </div>
        )
      case 'skillTree':
        return (
          <div className="menu-category-content">
            <button className="back-button" onClick={() => handleCategoryClick('main')}>← Back</button>
            <div className="skill-tree">
              <h3>Skill Tree</h3>
              <p>Coming soon...</p>
            </div>
          </div>
        )
      case 'inventory':
        return (
          <div className="menu-category-content">
            <button className="back-button" onClick={() => handleCategoryClick('main')}>← Back</button>
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
          </div>
        )
    }
  }

  return (
    <div className="menu-dropdown">
      <button className="menu-button" onClick={() => {
        setIsOpen(!isOpen)
        if (!isOpen) {
          setCurrentView('main')
        }
      }}>
        Menu
      </button>
      {isOpen && (
        <div className="menu-content">
          {renderContent()}
        </div>
      )}
    </div>
  )
}