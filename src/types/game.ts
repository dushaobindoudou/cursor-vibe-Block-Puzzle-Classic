export interface GameBoard {
  width: number
  height: number
  grid: CellState[][]
  score: number
  level: number
}

export enum CellState {
  EMPTY = 0,
  FILLED = 1,
  PREVIEW = 2,
  HIGHLIGHTED = 3,
  FROZEN = 4,
  BOMB = 5,
}

export interface BlockShape {
  id: string
  name: string
  pattern: number[][]
  color: string
  rotatable: boolean
  rarity: number
}

export interface Block {
  id: string
  shape: BlockShape
  x: number
  y: number
  rotation: number
}

export enum GameMode {
  CLASSIC = 'classic',
  LEVEL = 'level',
  TIMED = 'timed',
  DAILY = 'daily',
}

export interface GameState {
  board: {
    width: number
    height: number
    grid: CellState[][]
    score: number
    level: number
  }
  candidateBlocks: Block[]
  selectedBlock: Block | null
  gameMode: GameMode
  isGameOver: boolean
  isPaused: boolean
  combo: number
  lastClearTime: number
}

export interface ClearResult {
  clearedRows: number[]
  clearedCols: number[]
  score: number
  isCombo: boolean
}

export interface PlayerProfile {
  playerId: string
  playerName: string
  level: number
  experience: number
  totalScore: number
  createdAt: number
  lastPlayTime: number
}

export interface GameProgress {
  currentLevel: number
  unlockedLevels: number[]
  levelStars: Map<number, number>
  currentGameState?: GameState
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
} 