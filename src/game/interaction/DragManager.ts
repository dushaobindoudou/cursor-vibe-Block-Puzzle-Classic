import { Container, Graphics, Point } from 'pixi.js'
import { Block, GameState, CellState } from '@/types/game'

export interface DragManagerCallbacks {
  onBlockPlaced?: (block: Block, gridX: number, gridY: number) => boolean
  onDragStart?: (block: Block) => void
  onDragEnd?: () => void
  canPlaceBlock?: (pattern: number[][], gridX: number, gridY: number) => boolean
}

export class DragManager {
  private _stage: Container
  private _callbacks: DragManagerCallbacks
  private _isDragging = false
  private _draggedBlock: Block | null = null
  private _dragGraphics: Graphics | null = null
  private _previewGraphics: Graphics | null = null
  private _gameBoard: Container | null = null
  private _cellSize: number = 35
  private _boardX: number = 0
  private _boardY: number = 0

  constructor(stage: Container, callbacks: DragManagerCallbacks = {}) {
    this._stage = stage
    this._callbacks = callbacks
    this.setupGlobalEvents()
  }

  private setupGlobalEvents(): void {
    // 监听全局鼠标移动和释放事件
    this._stage.interactive = true
    this._stage.on('pointermove', this.onGlobalPointerMove.bind(this))
    this._stage.on('pointerup', this.onGlobalPointerUp.bind(this))
    this._stage.on('pointerupoutside', this.onGlobalPointerUp.bind(this))
  }

  setGameBoard(gameBoard: Container, cellSize: number, boardX: number, boardY: number): void {
    this._gameBoard = gameBoard
    this._cellSize = cellSize
    this._boardX = boardX
    this._boardY = boardY
  }

  startDrag(block: Block, startPosition: Point): void {
    if (this._isDragging) return

    this._isDragging = true
    this._draggedBlock = block
    
    // 创建拖拽中的方块图形
    this._dragGraphics = this.createBlockGraphics(block, 0.8) // 半透明
    this._dragGraphics.x = startPosition.x
    this._dragGraphics.y = startPosition.y
    this._stage.addChild(this._dragGraphics)

    // 创建预览图形
    this._previewGraphics = new Graphics()
    if (this._gameBoard) {
      this._gameBoard.addChild(this._previewGraphics)
    }

    // 触发回调
    if (this._callbacks.onDragStart) {
      this._callbacks.onDragStart(block)
    }

    console.log(`🚀 Started dragging block: ${block.id}`)
  }

  private onGlobalPointerMove(event: any): void {
    if (!this._isDragging || !this._dragGraphics || !this._draggedBlock) return

    // 更新拖拽方块位置
    const globalPos = event.data.global
    this._dragGraphics.x = globalPos.x - this._dragGraphics.width / 2
    this._dragGraphics.y = globalPos.y - this._dragGraphics.height / 2

    // 更新预览
    this.updatePreview(globalPos)
  }

  private updatePreview(globalPos: Point): void {
    if (!this._previewGraphics || !this._draggedBlock || !this._gameBoard) return

    // 计算鼠标在游戏板上的网格位置
    const localPos = this._gameBoard.toLocal(globalPos)
    const gridX = Math.floor(localPos.x / this._cellSize)
    const gridY = Math.floor(localPos.y / this._cellSize)

    // 清除之前的预览
    this._previewGraphics.clear()

    // 检查是否在游戏板范围内
    if (gridX < 0 || gridY < 0 || gridX >= 10 || gridY >= 10) {
      return
    }

    // 检查是否可以放置
    const canPlace = this.canPlaceAt(gridX, gridY)
    
    // 绘制预览
    this.drawPreview(gridX, gridY, canPlace)
  }

  private canPlaceAt(gridX: number, gridY: number): boolean {
    if (!this._draggedBlock) return false

    // 检查边界
    const pattern = this._draggedBlock.shape.pattern
    const patternWidth = pattern[0].length
    const patternHeight = pattern.length

    if (gridX < 0 || gridY < 0 || 
        gridX + patternWidth > 10 || 
        gridY + patternHeight > 10) {
      return false
    }

    // 使用回调检查游戏状态
    if (this._callbacks.canPlaceBlock) {
      return this._callbacks.canPlaceBlock(pattern, gridX, gridY)
    }

    return true
  }

  private drawPreview(gridX: number, gridY: number, canPlace: boolean): void {
    if (!this._previewGraphics || !this._draggedBlock) return

    const pattern = this._draggedBlock.shape.pattern
    const color = canPlace ? 0x00ff00 : 0xff0000 // 绿色可放置，红色不可放置
    const alpha = 0.5

    this._previewGraphics.beginFill(color, alpha)
    this._previewGraphics.lineStyle(1, color, 0.8)

    for (let py = 0; py < pattern.length; py++) {
      for (let px = 0; px < pattern[0].length; px++) {
        if (pattern[py][px] === 1) {
          const x = (gridX + px) * this._cellSize
          const y = (gridY + py) * this._cellSize
          this._previewGraphics.drawRect(x + 1, y + 1, this._cellSize - 2, this._cellSize - 2)
        }
      }
    }
    this._previewGraphics.endFill()
  }

  private onGlobalPointerUp(event: any): void {
    if (!this._isDragging || !this._draggedBlock) return

    const globalPos = event.data.global
    const success = this.tryPlaceBlock(globalPos)

    this.endDrag(success)
  }

  private tryPlaceBlock(globalPos: Point): boolean {
    if (!this._draggedBlock || !this._gameBoard) return false

    // 计算放置位置
    const localPos = this._gameBoard.toLocal(globalPos)
    const gridX = Math.floor(localPos.x / this._cellSize)
    const gridY = Math.floor(localPos.y / this._cellSize)

    // 检查边界
    if (gridX < 0 || gridY < 0 || gridX >= 10 || gridY >= 10) {
      return false
    }

    // 尝试放置方块
    if (this._callbacks.onBlockPlaced) {
      return this._callbacks.onBlockPlaced(this._draggedBlock, gridX, gridY)
    }

    return false
  }

  private endDrag(success: boolean): void {
    // 清理拖拽元素
    if (this._dragGraphics) {
      this._stage.removeChild(this._dragGraphics)
      this._dragGraphics.destroy()
      this._dragGraphics = null
    }

    if (this._previewGraphics) {
      if (this._gameBoard) {
        this._gameBoard.removeChild(this._previewGraphics)
      }
      this._previewGraphics.destroy()
      this._previewGraphics = null
    }

    // 重置状态
    this._isDragging = false
    this._draggedBlock = null

    // 触发回调
    if (this._callbacks.onDragEnd) {
      this._callbacks.onDragEnd()
    }

    console.log(`🎯 Drag ended, success: ${success}`)
  }

  private createBlockGraphics(block: Block, alpha: number = 1): Graphics {
    const graphics = new Graphics()
    const pattern = block.shape.pattern
    const color = parseInt(block.shape.color.replace('#', ''), 16)
    const blockCellSize = this._cellSize * 0.8

    graphics.beginFill(color, alpha)
    graphics.lineStyle(1, 0xffffff, 0.6)

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[0].length; x++) {
        if (pattern[y][x] === 1) {
          graphics.drawRect(
            x * blockCellSize,
            y * blockCellSize,
            blockCellSize - 1,
            blockCellSize - 1
          )
        }
      }
    }
    graphics.endFill()

    return graphics
  }

  destroy(): void {
    this.endDrag(false)
    // 清理事件监听器
    this._stage.off('pointermove', this.onGlobalPointerMove.bind(this))
    this._stage.off('pointerup', this.onGlobalPointerUp.bind(this))
    this._stage.off('pointerupoutside', this.onGlobalPointerUp.bind(this))
  }
} 