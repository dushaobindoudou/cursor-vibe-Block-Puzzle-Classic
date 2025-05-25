import { BlockShape } from '@/types/game'
import { CellState } from '@/types/game'

export enum SpecialBlockType {
  OBSTACLE = 'obstacle',     // 障碍方块
  FROZEN = 'frozen',         // 冰冻方块 
  BOMB = 'bomb',            // 炸弹方块
  RAINBOW = 'rainbow'       // 彩虹方块
}

export interface SpecialCell {
  type: SpecialBlockType
  state: CellState
  freezeLevel?: number  // 冰冻方块的冰层数
  bombRadius?: number   // 炸弹范围
}

export class SpecialBlockManager {
  private _specialCells: Map<string, SpecialCell> = new Map()

  // 在游戏板上设置特殊方块
  setSpecialCell(x: number, y: number, type: SpecialBlockType, options?: any): void {
    const key = `${x},${y}`
    const specialCell: SpecialCell = {
      type,
      state: CellState.FILLED,
      freezeLevel: type === SpecialBlockType.FROZEN ? (options?.freezeLevel || 2) : undefined,
      bombRadius: type === SpecialBlockType.BOMB ? (options?.bombRadius || 3) : undefined
    }
    this._specialCells.set(key, specialCell)
  }

  // 获取特殊方块
  getSpecialCell(x: number, y: number): SpecialCell | null {
    const key = `${x},${y}`
    return this._specialCells.get(key) || null
  }

  // 移除特殊方块
  removeSpecialCell(x: number, y: number): boolean {
    const key = `${x},${y}`
    return this._specialCells.delete(key)
  }

  // 检查位置是否为特殊方块
  isSpecialCell(x: number, y: number): boolean {
    const key = `${x},${y}`
    return this._specialCells.has(key)
  }

  // 处理冰冻方块的消除
  processFrozenBlock(x: number, y: number): boolean {
    const special = this.getSpecialCell(x, y)
    if (special && special.type === SpecialBlockType.FROZEN && special.freezeLevel) {
      special.freezeLevel--
      if (special.freezeLevel <= 0) {
        this.removeSpecialCell(x, y)
        return true // 完全消除
      }
      return false // 只是减少冰层
    }
    return false
  }

  // 处理炸弹方块爆炸
  processBombExplosion(x: number, y: number, boardWidth: number, boardHeight: number): { x: number, y: number }[] {
    const special = this.getSpecialCell(x, y)
    if (special && special.type === SpecialBlockType.BOMB) {
      const radius = special.bombRadius || 3
      const affected: { x: number, y: number }[] = []
      
      // 计算3x3范围内的所有格子
      for (let dy = -Math.floor(radius / 2); dy <= Math.floor(radius / 2); dy++) {
        for (let dx = -Math.floor(radius / 2); dx <= Math.floor(radius / 2); dx++) {
          const newX = x + dx
          const newY = y + dy
          
          if (newX >= 0 && newX < boardWidth && newY >= 0 && newY < boardHeight) {
            affected.push({ x: newX, y: newY })
          }
        }
      }
      
      // 移除炸弹本身
      this.removeSpecialCell(x, y)
      
      return affected
    }
    return []
  }

  // 检查是否为障碍方块（不可消除）
  isObstacle(x: number, y: number): boolean {
    const special = this.getSpecialCell(x, y)
    return special?.type === SpecialBlockType.OBSTACLE || false
  }

  // 检查是否为彩虹方块（万能匹配）
  isRainbow(x: number, y: number): boolean {
    const special = this.getSpecialCell(x, y)
    return special?.type === SpecialBlockType.RAINBOW || false
  }

  // 获取所有特殊方块位置
  getAllSpecialCells(): { x: number, y: number, cell: SpecialCell }[] {
    const result: { x: number, y: number, cell: SpecialCell }[] = []
    for (const [key, cell] of this._specialCells.entries()) {
      const [x, y] = key.split(',').map(Number)
      result.push({ x, y, cell })
    }
    return result
  }

  // 清空所有特殊方块
  clearAll(): void {
    this._specialCells.clear()
  }

  // 为关卡生成特殊方块布局
  generateLevelSpecialBlocks(level: number, boardWidth: number, boardHeight: number): void {
    this.clearAll()
    
    if (level >= 61) {
      // 61关以上：障碍方块和冰冻方块
      const obstacleCount = Math.floor(level / 20) + 1
      const frozenCount = Math.floor(level / 15) + 1
      
      // 随机放置障碍方块
      for (let i = 0; i < obstacleCount; i++) {
        const x = Math.floor(Math.random() * boardWidth)
        const y = Math.floor(Math.random() * boardHeight)
        if (!this.isSpecialCell(x, y)) {
          this.setSpecialCell(x, y, SpecialBlockType.OBSTACLE)
        }
      }
      
      // 随机放置冰冻方块
      for (let i = 0; i < frozenCount; i++) {
        const x = Math.floor(Math.random() * boardWidth)
        const y = Math.floor(Math.random() * boardHeight)
        if (!this.isSpecialCell(x, y)) {
          this.setSpecialCell(x, y, SpecialBlockType.FROZEN, { freezeLevel: 2 })
        }
      }
    }
    
    // 稀有彩虹方块（高级关卡）
    if (level >= 80 && Math.random() < 0.1) {
      const x = Math.floor(Math.random() * boardWidth)
      const y = Math.floor(Math.random() * boardHeight)
      if (!this.isSpecialCell(x, y)) {
        this.setSpecialCell(x, y, SpecialBlockType.RAINBOW)
      }
    }
  }
}

// 特殊方块的颜色配置
export const SPECIAL_BLOCK_COLORS = {
  [SpecialBlockType.OBSTACLE]: 0x333333,  // 深灰色
  [SpecialBlockType.FROZEN]: 0x87CEEB,    // 天蓝色
  [SpecialBlockType.BOMB]: 0xFF4500,      // 橙红色
  [SpecialBlockType.RAINBOW]: 0xFF00FF    // 紫色（会动态变化）
}

// 特殊方块形状定义
export const SPECIAL_BLOCK_SHAPES: Record<SpecialBlockType, BlockShape> = {
  [SpecialBlockType.OBSTACLE]: {
    id: 'obstacle_block',
    name: '障碍方块',
    pattern: [[1]],
    color: '#333333',
    rotatable: false,
    rarity: 5
  },
  [SpecialBlockType.FROZEN]: {
    id: 'frozen_block',
    name: '冰冻方块',
    pattern: [[1]],
    color: '#87CEEB',
    rotatable: false,
    rarity: 4
  },
  [SpecialBlockType.BOMB]: {
    id: 'bomb_block',
    name: '炸弹方块',
    pattern: [[1]],
    color: '#FF4500',
    rotatable: false,
    rarity: 6
  },
  [SpecialBlockType.RAINBOW]: {
    id: 'rainbow_block',
    name: '彩虹方块',
    pattern: [[1]],
    color: '#FF00FF',
    rotatable: false,
    rarity: 7
  }
} 