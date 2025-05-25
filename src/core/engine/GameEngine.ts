import { GameState, GameMode, CellState } from '../../types/game'
import { BlockGenerator } from '../../game/blocks/BlockGenerator'
import { EffectManager, ClearEffect } from '../../game/effects/EffectManager'
import { LevelManager, LevelConfig } from '../../game/levels/LevelManager'
import { SpecialBlockManager, SpecialBlockType } from '../../game/blocks/SpecialBlocks'
import { TimedModeManager, TIMED_MODE_CONFIGS } from '../../game/modes/TimedModeManager'
import { DailyChallengeManager } from '../../game/modes/DailyChallengeManager'
import { DifficultyOption } from '../../game/ui/DifficultySelectUI'

export class GameEngine {
  private _isInitialized = false
  private _gameState: GameState | null = null
  private _blockGenerator: BlockGenerator
  private _effectManager: EffectManager | null = null
  private _levelManager: LevelManager
  private _specialBlockManager: SpecialBlockManager
  private _timedModeManager: TimedModeManager | null = null
  private _dailyChallengeManager: DailyChallengeManager
  private _lastClearTime = 0
  private _currentGameMode: GameMode = GameMode.CLASSIC
  private _currentDifficulty: DifficultyOption | null = null

  constructor() {
    this._blockGenerator = new BlockGenerator(1)
    this._levelManager = new LevelManager()
    this._specialBlockManager = new SpecialBlockManager()
    this._dailyChallengeManager = new DailyChallengeManager()
  }

  init(): void {
    this._isInitialized = true
    this.initializeGame()
    console.log('🔧 GameEngine initialized')
  }

  setEffectManager(effectManager: EffectManager): void {
    this._effectManager = effectManager
  }

  private initializeGame(): void {
    // 应用难度设置
    let startingLevel = 1
    if (this._currentDifficulty) {
      startingLevel = this._currentDifficulty.settings.startingLevel
      // 设置关卡管理器的起始关卡
      this._levelManager.setCurrentLevel(startingLevel)
    }
    
    const currentLevel = this._levelManager.getCurrentLevel()
    const levelConfig = this._levelManager.getCurrentLevelConfig()
    
    // 初始化游戏状态 - 标准10x10网格
    this._gameState = {
      board: {
        width: 10,
        height: 10,
        grid: this.createEmptyGrid(10, 10),
        score: 0,
        level: currentLevel
      },
      candidateBlocks: this._blockGenerator.generateCandidateBlocks(3),
      selectedBlock: null,
      gameMode: this._currentGameMode,
      isGameOver: false,
      isPaused: false,
      combo: 0,
      lastClearTime: 0
    }

    // 设置方块生成器的难度（考虑难度加成）
    let blockRarity = this._levelManager.getBlockRarityForLevel(currentLevel)
    if (this._currentDifficulty) {
      blockRarity += this._currentDifficulty.settings.blockComplexityBonus
      blockRarity = Math.min(6, Math.max(1, blockRarity)) // 限制在1-6范围内
    }
    this._blockGenerator.setLevel(blockRarity)

    console.log(`🎮 Game initialized for level ${currentLevel} (block rarity: ${blockRarity})`)
    if (this._currentDifficulty) {
      console.log(`⚙️ Difficulty: ${this._currentDifficulty.name}`)
    }
    if (levelConfig) {
      const adjustedTarget = this.getAdjustedTargetScore(levelConfig.targetScore)
      console.log(`🎯 Target: ${adjustedTarget} points (original: ${levelConfig.targetScore})`)
    }
  }

  private createEmptyGrid(width: number, height: number): CellState[][] {
    const grid: CellState[][] = []
    for (let y = 0; y < height; y++) {
      grid[y] = []
      for (let x = 0; x < width; x++) {
        grid[y][x] = CellState.EMPTY
      }
    }
    return grid
  }

  // 检查方块是否可以放置在指定位置
  canPlaceBlock(blockPattern: number[][], boardX: number, boardY: number): boolean {
    if (!this._gameState) return false

    const board = this._gameState.board
    const patternHeight = blockPattern.length
    const patternWidth = blockPattern[0].length

    // 检查边界
    if (boardX < 0 || boardY < 0 || 
        boardX + patternWidth > board.width || 
        boardY + patternHeight > board.height) {
      return false
    }

    // 检查是否与已有方块重叠
    for (let py = 0; py < patternHeight; py++) {
      for (let px = 0; px < patternWidth; px++) {
        if (blockPattern[py][px] === 1) {
          if (board.grid[boardY + py][boardX + px] !== CellState.EMPTY) {
            return false
          }
        }
      }
    }

    return true
  }

  // 放置方块到游戏板
  placeBlock(blockPattern: number[][], boardX: number, boardY: number, blockId: string): boolean {
    if (!this._gameState || !this.canPlaceBlock(blockPattern, boardX, boardY)) {
      return false
    }

    const board = this._gameState.board
    const patternHeight = blockPattern.length
    const patternWidth = blockPattern[0].length

    // 放置方块
    for (let py = 0; py < patternHeight; py++) {
      for (let px = 0; px < patternWidth; px++) {
        if (blockPattern[py][px] === 1) {
          board.grid[boardY + py][boardX + px] = CellState.FILLED
        }
      }
    }

    // 移除已使用的候选方块
    const placedBlock = this._gameState.candidateBlocks.find(block => block.id === blockId)
    this._gameState.candidateBlocks = this._gameState.candidateBlocks.filter(block => block.id !== blockId)
    
    // 播放放置特效
    if (this._effectManager && placedBlock) {
      this._effectManager.playBlockPlaceEffect(boardX, boardY, blockPattern, placedBlock.shape.color)
    }

    // 检查行列消除
    this.checkAndClearLines()

    // 如果候选方块用完，生成新的
    if (this._gameState.candidateBlocks.length === 0) {
      let blockRarity = this._levelManager.getBlockRarityForLevel(board.level)
      // 应用难度加成（与初始化时保持一致）
      if (this._currentDifficulty) {
        blockRarity += this._currentDifficulty.settings.blockComplexityBonus
        blockRarity = Math.min(6, Math.max(1, blockRarity)) // 限制在1-6范围内
      }
      this._blockGenerator.setLevel(blockRarity)
      this._gameState.candidateBlocks = this._blockGenerator.generateCandidateBlocks(3)
      console.log(`🔄 Generated new candidate blocks (block rarity: ${blockRarity})`)
    }

    // 检查关卡完成
    this.checkLevelCompletion()

    // 检查游戏是否结束
    this.checkGameOver()

    return true
  }

  // 检查并消除完整的行和列
  private checkAndClearLines(): void {
    if (!this._gameState) return

    const board = this._gameState.board
    const clearedRows: number[] = []
    const clearedCols: number[] = []

    // 检查行
    for (let y = 0; y < board.height; y++) {
      let isFullRow = true
      for (let x = 0; x < board.width; x++) {
        if (board.grid[y][x] === CellState.EMPTY) {
          isFullRow = false
          break
        }
      }
      if (isFullRow) {
        clearedRows.push(y)
      }
    }

    // 检查列
    for (let x = 0; x < board.width; x++) {
      let isFullCol = true
      for (let y = 0; y < board.height; y++) {
        if (board.grid[y][x] === CellState.EMPTY) {
          isFullCol = false
          break
        }
      }
      if (isFullCol) {
        clearedCols.push(x)
      }
    }

    if (clearedRows.length > 0 || clearedCols.length > 0) {
      // 计算连击
      const currentTime = Date.now()
      if (currentTime - this._lastClearTime < 3000) { // 3秒内连击
        this._gameState.combo++
      } else {
        this._gameState.combo = 1
      }
      this._lastClearTime = currentTime

      // 清除行和列
      clearedRows.forEach(y => {
        for (let x = 0; x < board.width; x++) {
          board.grid[y][x] = CellState.EMPTY
        }
      })

      clearedCols.forEach(x => {
        for (let y = 0; y < board.height; y++) {
          board.grid[y][x] = CellState.EMPTY
        }
      })

      // 计算分数
      const baseScore = this.calculateClearScore(clearedRows.length, clearedCols.length)
      const comboMultiplier = Math.min(this._gameState.combo, 8) // 最高8倍
      const finalScore = baseScore * comboMultiplier

      board.score += finalScore

      console.log(`🎯 Cleared ${clearedRows.length} rows, ${clearedCols.length} cols`)
      console.log(`💥 Combo x${this._gameState.combo}, Score: ${baseScore} x ${comboMultiplier} = +${finalScore}`)

      // 播放消除特效
      if (this._effectManager) {
        const clearEffect: ClearEffect = {
          rows: clearedRows,
          cols: clearedCols,
          score: finalScore
        }
        this._effectManager.playClearEffect(clearEffect)

        // 连击特效
        if (this._gameState.combo >= 2) {
          this._effectManager.playComboEffect(this._gameState.combo, 175, 300) // 游戏板中心位置
        }
      }
    } else {
      // 没有消除则重置连击
      this._gameState.combo = 0
    }
  }

  private calculateClearScore(rows: number, cols: number): number {
    let score = 0
    
    // 基础分数
    score += rows * 100 + rows * 10 * 10 // 整行消除：100 + 行内格子数 × 10
    score += cols * 100 + cols * 10 * 10 // 整列消除：100 + 列内格子数 × 10
    
    // 同时多行/列消除奖励
    if (rows > 1 || cols > 1) {
      score *= (rows + cols)
    }
    
    // 满格消除奖励
    if (rows > 0 && cols > 0) {
      score += 200 // 同时消除行列额外奖励
    }

    return score
  }

  private checkLevelCompletion(): void {
    if (!this._gameState) return

    const currentLevel = this._gameState.board.level
    const levelConfig = this._levelManager.getCurrentLevelConfig()
    
    if (levelConfig) {
      const adjustedTargetScore = this.getAdjustedTargetScore(levelConfig.targetScore)
      
      if (this._gameState.board.score >= adjustedTargetScore) {
        // 关卡完成
        const result = this._levelManager.completeLevel(currentLevel, this._gameState.board.score)
        
        console.log(`🏆 Level ${currentLevel} completed!`)
        console.log(`⭐ Stars: ${result.stars}, New Record: ${result.isNewRecord}`)
        
        if (result.unlockedNext) {
          console.log(`🔓 Level ${currentLevel + 1} unlocked!`)
        }

        // 触发关卡完成UI显示
        const gameApp = (window as any).gameApp
        if (gameApp && gameApp.sceneManager && this._gameState && this._gameState.board) {
          const levelCompleteData = {
            level: currentLevel,
            score: this._gameState.board.score,
            targetScore: adjustedTargetScore,
            stars: result.stars,
            isNewRecord: result.isNewRecord,
            unlockedNext: result.unlockedNext,
            nextLevel: result.unlockedNext ? currentLevel + 1 : undefined
          }
          gameApp.sceneManager.showLevelComplete(levelCompleteData)
        }
      }
    }
  }

  // 开始下一关
  nextLevel(): boolean {
    const currentLevel = this._levelManager.getCurrentLevel()
    const nextLevel = currentLevel + 1
    
    if (this._levelManager.setCurrentLevel(nextLevel)) {
      this.initializeGame()
      return true
    }
    
    return false
  }

  // 重新开始当前关卡
  restartLevel(): void {
    this.initializeGame()
  }

  // 切换游戏模式
  switchGameMode(mode: GameMode, options?: any): void {
    this._currentGameMode = mode
    
    // 保存难度设置
    if (options?.difficulty) {
      this._currentDifficulty = options.difficulty
      if (this._currentDifficulty) {
        console.log(`⚙️ Difficulty set to: ${this._currentDifficulty.name}`)
      }
    }
    
    // 清理之前的模式管理器
    if (this._timedModeManager) {
      this._timedModeManager.destroy()
      this._timedModeManager = null
    }
    
    switch (mode) {
      case GameMode.TIMED:
        if (options?.timeLimit) {
          const configKey = options.timeLimit === 180 ? 'quick' : 
                           options.timeLimit === 300 ? 'standard' : 'extended'
          let timeConfig = TIMED_MODE_CONFIGS[configKey]
          
          // 应用难度时间倍数
          if (this._currentDifficulty) {
            timeConfig = {
              ...timeConfig,
              timeLimit: Math.floor(timeConfig.timeLimit * this._currentDifficulty.settings.timeMultiplier)
            }
          }
          
          this._timedModeManager = new TimedModeManager(timeConfig)
        }
        break
      
      case GameMode.DAILY:
        // 每日挑战模式的特殊设置
        const challenge = this._dailyChallengeManager.getCurrentChallenge()
        if (challenge) {
          console.log(`📅 Starting daily challenge: ${challenge.description}`)
        }
        break
    }
    
    this.initializeGame()
    console.log(`🎮 Switched to ${mode} mode`)
  }

  // 获取调整后的目标分数（根据难度）
  private getAdjustedTargetScore(originalScore: number): number {
    if (!this._currentDifficulty) return originalScore
    return Math.floor(originalScore * this._currentDifficulty.settings.scoreMultiplier)
  }

  // 获取关卡管理器
  get levelManager(): LevelManager {
    return this._levelManager
  }

  // 获取特殊方块管理器
  get specialBlockManager(): SpecialBlockManager {
    return this._specialBlockManager
  }

  // 获取每日挑战管理器
  get dailyChallengeManager(): DailyChallengeManager {
    return this._dailyChallengeManager
  }

  // 获取限时模式管理器
  get timedModeManager(): TimedModeManager | null {
    return this._timedModeManager
  }

  // 获取当前游戏模式
  get currentGameMode(): GameMode {
    return this._currentGameMode
  }

  update(_deltaTime: number): void {
    if (!this._isInitialized || !this._gameState) return
    // 游戏逻辑更新
  }

  destroy(): void {
    this._isInitialized = false
    this._gameState = null
    console.log('🔧 GameEngine destroyed')
  }

  get gameState(): GameState | null {
    return this._gameState
  }

  // 获取当前难度设置
  get currentDifficulty(): DifficultyOption | null {
    return this._currentDifficulty
  }

  // 检查游戏是否结束（所有候选方块都无法放置）
  private checkGameOver(): void {
    if (!this._gameState || this._gameState.isGameOver) return

    // 检查是否有任何候选方块可以放置
    const hasValidPlacement = this._gameState.candidateBlocks.some(block => 
      this.hasValidPlacementForBlock(block.shape.pattern)
    )

    if (!hasValidPlacement) {
      // 游戏结束
      this._gameState.isGameOver = true
      console.log('💀 Game Over! No valid placements for any candidate blocks')
      
      // 触发游戏结束UI显示
      this.showGameOverUI()
    }
  }

  // 检查指定方块是否有任何可放置的位置
  private hasValidPlacementForBlock(pattern: number[][]): boolean {
    if (!this._gameState) return false

    const board = this._gameState.board
    
    // 遍历游戏板上的每个位置
    for (let y = 0; y <= board.height - pattern.length; y++) {
      for (let x = 0; x <= board.width - pattern[0].length; x++) {
        if (this.canPlaceBlock(pattern, x, y)) {
          return true
        }
      }
    }
    
    return false
  }

  // 显示游戏结束UI
  private showGameOverUI(): void {
    const gameApp = (window as any).gameApp
    if (gameApp && gameApp.sceneManager && this._gameState) {
      const gameOverData = {
        score: this._gameState.board.score,
        level: this._gameState.board.level,
        gameMode: this._gameState.gameMode,
        combo: this._gameState.combo
      }
      gameApp.sceneManager.showGameOver(gameOverData)
    }
  }
} 