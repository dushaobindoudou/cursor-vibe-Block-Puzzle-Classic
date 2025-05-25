export interface TimedModeConfig {
  timeLimit: number // 秒数
  scoreMultiplier: number
  timeBonus: number // 剩余时间奖励分数
  warningTime: number // 警告时间（秒）
}

export interface TimedModeState {
  timeRemaining: number
  totalTime: number
  isActive: boolean
  isPaused: boolean
  finalScore: number
  timeBonus: number
}

export class TimedModeManager {
  private _config: TimedModeConfig
  private _state: TimedModeState
  private _startTime: number = 0
  private _pausedTime: number = 0
  private _onTimeUpdate?: (timeRemaining: number) => void
  private _onTimeWarning?: (timeRemaining: number) => void
  private _onTimeUp?: () => void
  private _updateInterval?: number

  constructor(config: TimedModeConfig) {
    this._config = config
    this._state = {
      timeRemaining: config.timeLimit,
      totalTime: config.timeLimit,
      isActive: false,
      isPaused: false,
      finalScore: 0,
      timeBonus: 0
    }
  }

  start(): void {
    if (this._state.isActive) return

    this._state.isActive = true
    this._state.isPaused = false
    this._startTime = Date.now()
    this._pausedTime = 0

    this.startTimer()
    console.log(`⏰ Timed mode started: ${this._config.timeLimit}s`)
  }

  pause(): void {
    if (!this._state.isActive || this._state.isPaused) return

    this._state.isPaused = true
    this._pausedTime = Date.now()
    this.stopTimer()
    console.log('⏸️ Timed mode paused')
  }

  resume(): void {
    if (!this._state.isActive || !this._state.isPaused) return

    this._state.isPaused = false
    const pauseDuration = Date.now() - this._pausedTime
    this._startTime += pauseDuration
    this.startTimer()
    console.log('▶️ Timed mode resumed')
  }

  stop(): void {
    if (!this._state.isActive) return

    this._state.isActive = false
    this._state.isPaused = false
    this.stopTimer()
    this.calculateFinalScore()
    console.log(`🏁 Timed mode ended. Final score: ${this._state.finalScore}`)
  }

  private startTimer(): void {
    this.stopTimer() // 清除之前的计时器
    
    this._updateInterval = window.setInterval(() => {
      this.updateTimer()
    }, 100) // 每100ms更新一次
  }

  private stopTimer(): void {
    if (this._updateInterval) {
      clearInterval(this._updateInterval)
      this._updateInterval = undefined
    }
  }

  private updateTimer(): void {
    if (!this._state.isActive || this._state.isPaused) return

    const elapsed = (Date.now() - this._startTime) / 1000
    this._state.timeRemaining = Math.max(0, this._config.timeLimit - elapsed)

    // 触发更新回调
    if (this._onTimeUpdate) {
      this._onTimeUpdate(this._state.timeRemaining)
    }

    // 检查警告时间
    if (this._state.timeRemaining <= this._config.warningTime && this._state.timeRemaining > 0) {
      if (this._onTimeWarning) {
        this._onTimeWarning(this._state.timeRemaining)
      }
    }

    // 检查时间结束
    if (this._state.timeRemaining <= 0) {
      this.stop()
      if (this._onTimeUp) {
        this._onTimeUp()
      }
    }
  }

  private calculateFinalScore(): void {
    // 计算时间奖励：剩余时间 × 奖励系数
    this._state.timeBonus = Math.floor(this._state.timeRemaining * this._config.timeBonus)
    this._state.finalScore = this._state.finalScore + this._state.timeBonus
  }

  // 添加分数（会应用时间模式的分数倍数）
  addScore(baseScore: number): number {
    const multipliedScore = Math.floor(baseScore * this._config.scoreMultiplier)
    this._state.finalScore += multipliedScore
    return multipliedScore
  }

  // 获取格式化的时间显示
  getFormattedTime(): string {
    const minutes = Math.floor(this._state.timeRemaining / 60)
    const seconds = Math.floor(this._state.timeRemaining % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // 获取时间进度百分比
  getTimeProgress(): number {
    return (this._config.timeLimit - this._state.timeRemaining) / this._config.timeLimit
  }

  // 检查是否处于警告时间
  isWarningTime(): boolean {
    return this._state.timeRemaining <= this._config.warningTime && this._state.timeRemaining > 0
  }

  // 添加时间奖励（某些特殊操作可以增加时间）
  addBonusTime(seconds: number): void {
    this._config.timeLimit += seconds
    this._state.timeRemaining += seconds
    this._state.totalTime += seconds
    console.log(`⏰ Added ${seconds}s bonus time`)
  }

  // 设置回调函数
  setOnTimeUpdate(callback: (timeRemaining: number) => void): void {
    this._onTimeUpdate = callback
  }

  setOnTimeWarning(callback: (timeRemaining: number) => void): void {
    this._onTimeWarning = callback
  }

  setOnTimeUp(callback: () => void): void {
    this._onTimeUp = callback
  }

  // 获取状态
  get state(): TimedModeState {
    return { ...this._state }
  }

  get config(): TimedModeConfig {
    return { ...this._config }
  }

  get isActive(): boolean {
    return this._state.isActive
  }

  get isPaused(): boolean {
    return this._state.isPaused
  }

  get timeRemaining(): number {
    return this._state.timeRemaining
  }

  get finalScore(): number {
    return this._state.finalScore
  }

  destroy(): void {
    this.stopTimer()
    this._state.isActive = false
  }
}

// 预定义的限时模式配置
export const TIMED_MODE_CONFIGS: Record<string, TimedModeConfig> = {
  quick: {
    timeLimit: 180, // 3分钟
    scoreMultiplier: 1.5,
    timeBonus: 10,
    warningTime: 30
  },
  standard: {
    timeLimit: 300, // 5分钟
    scoreMultiplier: 1.2,
    timeBonus: 8,
    warningTime: 60
  },
  extended: {
    timeLimit: 600, // 10分钟
    scoreMultiplier: 1.0,
    timeBonus: 5,
    warningTime: 120
  }
} 