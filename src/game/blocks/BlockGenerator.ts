import { Block } from '@/types/game'
import { BlockShapes } from './BlockShapes'

export class BlockGenerator {
  private level: number = 1
  private nextId: number = 1

  constructor(level: number = 1) {
    this.level = level
  }

  // 生成一个随机方块
  generateBlock(): Block {
    const shape = BlockShapes.getRandomShape(this.level)
    const block: Block = {
      id: `block_${this.nextId++}`,
      shape: shape,
      x: 0,
      y: 0,
      rotation: 0
    }
    return block
  }

  // 生成候选方块列表（通常是3个）
  generateCandidateBlocks(count: number = 3): Block[] {
    const blocks: Block[] = []
    for (let i = 0; i < count; i++) {
      blocks.push(this.generateBlock())
    }
    return blocks
  }

  // 更新难度等级
  setLevel(level: number): void {
    this.level = level
  }

  // 获取当前等级
  getLevel(): number {
    return this.level
  }
} 