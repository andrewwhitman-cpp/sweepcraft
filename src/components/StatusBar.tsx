import { Character } from './types'
import { Menu } from '../components/Menu'

interface StatusBarProps {
  level: number
  character: Character
  isMenuOpen: boolean
  setIsMenuOpen: (isOpen: boolean) => void
  menuTab: 'instructions' | 'inventory' | 'skillTree'
  setMenuTab: (tab: 'instructions' | 'inventory' | 'skillTree') => void
}

export function StatusBar({ level, character, isMenuOpen, setIsMenuOpen, menuTab, setMenuTab }: StatusBarProps) {
  return (
    <div className="status-bar">
      <div>Level: {level}</div>
      <div>Health: {character.health}</div>
      <div>Points: {character.points}</div>
      <Menu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        menuTab={menuTab}
        setMenuTab={setMenuTab}
        inventory={character.inventory}
      />
    </div>
  )
}