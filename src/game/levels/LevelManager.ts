export interface LevelConfig {
  level: number
  targetScore: number
  minScore: number // 1星要求
  mediumScore: number // 2星要求  
  maxScore: number // 3星要求
  maxBlockRarity: number // 最大方块复杂度
  hasTimeLimit: boolean
  timeLimitSeconds?: number
  specialMechanics: string[]
  description: string
}

export interface LevelProgress {
  level: number
  completed: boolean
  stars: number
  bestScore: number
  attempts: number
}

export class LevelManager {
  private _currentLevel = 1
  private _levelConfigs: Map<number, LevelConfig> = new Map()
  private _levelProgress: Map<number, LevelProgress> = new Map()

  constructor() {
    this.initializeLevels()
    this.loadProgress()
  }

  private initializeLevels(): void {
    // 第1-10关：新手教学 - 降低难度，只需要能消除就行
    for (let i = 1; i <= 10; i++) {
      let baseScore: number
      if (i <= 3) {
        baseScore = 10 + (i - 1) * 5 // 10, 15, 20 - 消除一次就能过
      } else {
        baseScore = 25 + (i - 4) * 15 // 25, 40, 55, 70, 85, 100, 115
      }
      this._levelConfigs.set(i, {
        level: i,
        targetScore: baseScore,
        minScore: baseScore,
        mediumScore: Math.floor(baseScore * 1.5),
        maxScore: baseScore * 2,
        maxBlockRarity: 1, // 只有1-2格方块
        hasTimeLimit: false,
        specialMechanics: i <= 3 ? ['tutorial'] : [],
        description: `新手关卡 ${i} - 学习消除技巧`
      })
    }

    // 第11-30关：基础挑战 - 提高难度
    for (let i = 11; i <= 30; i++) {
      const baseScore = 200 + (i - 11) * 80 // 200-1720分
      this._levelConfigs.set(i, {
        level: i,
        targetScore: baseScore,
        minScore: baseScore,
        mediumScore: Math.floor(baseScore * 1.5),
        maxScore: baseScore * 2,
        maxBlockRarity: 2, // 1-3格方块
        hasTimeLimit: false,
        specialMechanics: ['preview3blocks'],
        description: `基础关卡 ${i} - 引入经典俄罗斯方块`
      })
    }

    // 第31-60关：进阶策略 - 显著提高难度
    for (let i = 31; i <= 60; i++) {
      const baseScore = 1800 + (i - 31) * 100 // 1800-4700分
      this._levelConfigs.set(i, {
        level: i,
        targetScore: baseScore,
        minScore: baseScore,
        mediumScore: Math.floor(baseScore * 1.5),
        maxScore: baseScore * 2,
        maxBlockRarity: 3, // 所有基础形状
        hasTimeLimit: i > 40, // 40关后开始限时
        timeLimitSeconds: i > 40 ? 240 : undefined, // 4分钟，更紧张
        specialMechanics: ['preview3blocks', 'timeLimit'],
        description: `进阶关卡 ${i} - ${i > 40 ? '限时挑战' : '策略关卡'}`
      })
    }

    // 第61-100关：专家级别 - 极高难度
    for (let i = 61; i <= 100; i++) {
      const baseScore = 5000 + (i - 61) * 150 // 5000-11000分
      let blockRarity = 4 // 基础专家级稀有度
      
      if (i >= 80) {
        blockRarity = 5 // 80关以上使用稀有度5（包含大型方块）
      }
      if (i >= 95) {
        blockRarity = 6 // 95关以上使用最高稀有度（巨型方块）
      }
      
      this._levelConfigs.set(i, {
        level: i,
        targetScore: baseScore,
        minScore: baseScore,
        mediumScore: Math.floor(baseScore * 1.5),
        maxScore: baseScore * 2,
        maxBlockRarity: blockRarity,
        hasTimeLimit: true,
        timeLimitSeconds: Math.max(180, 300 - (i - 61) * 3), // 5分钟递减到3分钟
        specialMechanics: ['obstacles', 'frozenBlocks', 'timeLimit'],
        description: `专家关卡 ${i} - ${i >= 95 ? '巨型方块挑战' : i >= 80 ? '大型方块挑战' : '障碍与冰冻方块'}`
      })
    }

    console.log(`🎮 Initialized ${this._levelConfigs.size} levels`)
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('blockPuzzle_levelProgress')
      if (saved) {
        const progressData = JSON.parse(saved)
        for (const [level, progress] of Object.entries(progressData)) {
          this._levelProgress.set(parseInt(level), progress as LevelProgress)
        }
      }
    } catch (error) {
      console.warn('Failed to load level progress:', error)
    }

    // 确保至少有第1关的进度
    if (!this._levelProgress.has(1)) {
      this._levelProgress.set(1, {
        level: 1,
        completed: false,
        stars: 0,
        bestScore: 0,
        attempts: 0
      })
    }
  }

  private saveProgress(): void {
    try {
      const progressData: Record<number, LevelProgress> = {}
      for (const [level, progress] of this._levelProgress.entries()) {
        progressData[level] = progress
      }
      localStorage.setItem('blockPuzzle_levelProgress', JSON.stringify(progressData))
    } catch (error) {
      console.warn('Failed to save level progress:', error)
    }
  }

  getCurrentLevel(): number {
    return this._currentLevel
  }

  setCurrentLevel(level: number): boolean {
    if (!this._levelConfigs.has(level)) {
      return false
    }

    // 检查是否解锁
    if (level > 1 && !this.isLevelUnlocked(level)) {
      console.warn(`Level ${level} is not unlocked yet`)
      return false
    }

    this._currentLevel = level
    return true
  }

  getCurrentLevelConfig(): LevelConfig | null {
    return this._levelConfigs.get(this._currentLevel) || null
  }

  isLevelUnlocked(level: number): boolean {
    if (level === 1) return true
    
    // 需要前一关至少1星才能解锁
    const prevProgress = this._levelProgress.get(level - 1)
    return prevProgress ? prevProgress.stars >= 1 : false
  }

  completeLevel(level: number, score: number): { stars: number, isNewRecord: boolean, unlockedNext: boolean } {
    const config = this._levelConfigs.get(level)
    if (!config) {
      return { stars: 0, isNewRecord: false, unlockedNext: false }
    }

    // 计算星级
    let stars = 0
    if (score >= config.minScore) stars = 1
    if (score >= config.mediumScore) stars = 2  
    if (score >= config.maxScore) stars = 3

    // 获取或创建进度记录
    let progress = this._levelProgress.get(level)
    if (!progress) {
      progress = {
        level: level,
        completed: false,
        stars: 0,
        bestScore: 0,
        attempts: 0
      }
      this._levelProgress.set(level, progress)
    }

    // 更新进度
    const isNewRecord = score > progress.bestScore
    progress.completed = true
    progress.attempts += 1
    if (isNewRecord) {
      progress.bestScore = score
      progress.stars = Math.max(progress.stars, stars)
    }

    // 检查是否解锁下一关
    const nextLevel = level + 1
    const unlockedNext = this._levelConfigs.has(nextLevel) && stars >= 1

    // 自动解锁下一关进度记录
    if (unlockedNext && !this._levelProgress.has(nextLevel)) {
      this._levelProgress.set(nextLevel, {
        level: nextLevel,
        completed: false,
        stars: 0,
        bestScore: 0,
        attempts: 0
      })
    }

    this.saveProgress()

    console.log(`🏆 Level ${level} completed: ${stars} stars, score: ${score}, new record: ${isNewRecord}`)

    return { stars, isNewRecord, unlockedNext }
  }

  getLevelProgress(level: number): LevelProgress | null {
    return this._levelProgress.get(level) || null
  }

  getUnlockedLevels(): number[] {
    const unlocked: number[] = []
    for (const level of this._levelConfigs.keys()) {
      if (this.isLevelUnlocked(level)) {
        unlocked.push(level)
      }
    }
    return unlocked.sort((a, b) => a - b)
  }

  getTotalStars(): number {
    let total = 0
    for (const progress of this._levelProgress.values()) {
      total += progress.stars
    }
    return total
  }

  getMaxStars(): number {
    return this._levelConfigs.size * 3
  }

  // 获取关卡的方块难度设置
  getBlockRarityForLevel(level: number): number {
    const config = this._levelConfigs.get(level)
    return config ? config.maxBlockRarity : 1
  }

  // 重置所有进度（用于测试）
  resetAllProgress(): void {
    this._levelProgress.clear()
    this._currentLevel = 1
    localStorage.removeItem('blockPuzzle_levelProgress')
    this.loadProgress()
    console.log('🔄 All level progress reset')
  }
} 