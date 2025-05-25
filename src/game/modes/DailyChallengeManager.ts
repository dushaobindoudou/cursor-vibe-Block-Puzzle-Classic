export interface DailyChallenge {
  date: string // YYYY-MM-DD格式
  seed: number // 随机种子
  targetScore: number
  timeLimit?: number
  specialRules: string[]
  description: string
}

export interface DailyChallengeResult {
  date: string
  score: number
  completed: boolean
  rank?: number
  attempts: number
  bestTime?: number
}

export class DailyChallengeManager {
  private _currentChallenge: DailyChallenge | null = null
  private _results: Map<string, DailyChallengeResult> = new Map()

  constructor() {
    this.loadResults()
    this.generateTodayChallenge()
  }

  private loadResults(): void {
    try {
      const saved = localStorage.getItem('blockPuzzle_dailyChallengeResults')
      if (saved) {
        const resultsData = JSON.parse(saved)
        for (const [date, result] of Object.entries(resultsData)) {
          this._results.set(date, result as DailyChallengeResult)
        }
      }
    } catch (error) {
      console.warn('Failed to load daily challenge results:', error)
    }
  }

  private saveResults(): void {
    try {
      const resultsData: Record<string, DailyChallengeResult> = {}
      for (const [date, result] of this._results.entries()) {
        resultsData[date] = result
      }
      localStorage.setItem('blockPuzzle_dailyChallengeResults', JSON.stringify(resultsData))
    } catch (error) {
      console.warn('Failed to save daily challenge results:', error)
    }
  }

  private generateTodayChallenge(): void {
    const today = this.getTodayString()
    
    // 使用日期作为种子生成确定性的挑战
    const seed = this.dateToSeed(today)
    const random = this.seededRandom(seed)
    
    // 生成挑战参数
    const challengeTypes = [
      { type: 'highScore', weight: 3 },
      { type: 'timeAttack', weight: 2 },
      { type: 'specialBlocks', weight: 2 },
      { type: 'limitedMoves', weight: 1 }
    ]
    
    const totalWeight = challengeTypes.reduce((sum, type) => sum + type.weight, 0)
    let randomValue = random() * totalWeight
    let selectedType = challengeTypes[0].type
    
    for (const challengeType of challengeTypes) {
      randomValue -= challengeType.weight
      if (randomValue <= 0) {
        selectedType = challengeType.type
        break
      }
    }

    this._currentChallenge = this.generateChallengeByType(today, seed, selectedType, random)
    console.log(`📅 Generated daily challenge for ${today}: ${this._currentChallenge.description}`)
  }

  private generateChallengeByType(date: string, seed: number, type: string, random: () => number): DailyChallenge {
    switch (type) {
      case 'highScore':
        return {
          date,
          seed,
          targetScore: 2000 + Math.floor(random() * 3000),
          specialRules: ['highScore'],
          description: '高分挑战 - 达到目标分数获得奖励'
        }
      
      case 'timeAttack':
        return {
          date,
          seed,
          targetScore: 1500 + Math.floor(random() * 2000),
          timeLimit: 300 + Math.floor(random() * 300), // 5-10分钟
          specialRules: ['timeAttack'],
          description: '限时挑战 - 在规定时间内达到目标分数'
        }
      
      case 'specialBlocks':
        return {
          date,
          seed,
          targetScore: 1800 + Math.floor(random() * 2200),
          specialRules: ['specialBlocks', 'obstacles'],
          description: '特殊方块挑战 - 游戏板包含障碍和特殊方块'
        }
      
      case 'limitedMoves':
        return {
          date,
          seed,
          targetScore: 1200 + Math.floor(random() * 1800),
          specialRules: ['limitedMoves'],
          description: '限制步数挑战 - 用有限的方块达到目标分数'
        }
      
      default:
        return {
          date,
          seed,
          targetScore: 2000,
          specialRules: [],
          description: '每日标准挑战'
        }
    }
  }

  private getTodayString(): string {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  private dateToSeed(dateString: string): number {
    // 将日期字符串转换为数字种子
    let hash = 0
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  }

  private seededRandom(seed: number): () => number {
    // 简单的线性同余生成器
    let current = seed
    return () => {
      current = (current * 1664525 + 1013904223) % 4294967296
      return current / 4294967296
    }
  }

  getCurrentChallenge(): DailyChallenge | null {
    const today = this.getTodayString()
    if (this._currentChallenge?.date !== today) {
      this.generateTodayChallenge()
    }
    return this._currentChallenge
  }

  hasCompletedToday(): boolean {
    const today = this.getTodayString()
    const result = this._results.get(today)
    return result?.completed || false
  }

  getTodayResult(): DailyChallengeResult | null {
    const today = this.getTodayString()
    return this._results.get(today) || null
  }

  submitResult(score: number, timeUsed?: number): DailyChallengeResult {
    const today = this.getTodayString()
    const challenge = this.getCurrentChallenge()
    
    if (!challenge) {
      throw new Error('No challenge available for today')
    }

    let result = this._results.get(today)
    if (!result) {
      result = {
        date: today,
        score: 0,
        completed: false,
        attempts: 0
      }
      this._results.set(today, result)
    }

    result.attempts++
    
    // 更新最佳成绩
    if (score > result.score) {
      result.score = score
      result.completed = score >= challenge.targetScore
      if (timeUsed !== undefined) {
        result.bestTime = timeUsed
      }
    }

    this.saveResults()
    console.log(`📊 Daily challenge result submitted: ${score} points, completed: ${result.completed}`)
    
    return result
  }

  getWeeklyResults(): DailyChallengeResult[] {
    const results: DailyChallengeResult[] = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      const result = this._results.get(dateString)
      if (result) {
        results.push(result)
      } else {
        results.push({
          date: dateString,
          score: 0,
          completed: false,
          attempts: 0
        })
      }
    }
    
    return results
  }

  getStreak(): number {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) { // 检查最近30天
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      const result = this._results.get(dateString)
      if (result?.completed) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  getTotalCompletedChallenges(): number {
    let completed = 0
    for (const result of this._results.values()) {
      if (result.completed) {
        completed++
      }
    }
    return completed
  }

  // 模拟排行榜功能（实际应用中需要服务器支持）
  getSimulatedRanking(score: number): number {
    // 基于分数生成模拟排名
    const baseRank = Math.max(1, Math.floor((10000 - score) / 100))
    const randomFactor = Math.floor(Math.random() * 20) - 10
    return Math.max(1, baseRank + randomFactor)
  }

  // 重置所有数据（用于测试）
  resetAllData(): void {
    this._results.clear()
    localStorage.removeItem('blockPuzzle_dailyChallengeResults')
    this.generateTodayChallenge()
    console.log('🔄 All daily challenge data reset')
  }
} 