import { Container, Graphics, Text } from 'pixi.js'

export interface LevelCompleteData {
  level: number
  score: number
  targetScore: number
  stars: number
  isNewRecord: boolean
  unlockedNext: boolean
  nextLevel?: number
}

export class LevelCompleteUI {
  private _container: Container
  private _screenWidth: number
  private _screenHeight: number
  private _onNextLevel?: () => void
  private _onRestart?: () => void
  private _onMainMenu?: () => void

  constructor(screenWidth: number, screenHeight: number) {
    this._container = new Container()
    this._screenWidth = screenWidth
    this._screenHeight = screenHeight
    this._container.visible = false
  }

  show(data: LevelCompleteData): void {
    this.createUI(data)
    this._container.visible = true
  }

  hide(): void {
    this._container.visible = false
    this._container.removeChildren()
  }

  private createUI(data: LevelCompleteData): void {
    this._container.removeChildren()

    // 半透明背景 - 创建点击阻止层
    const overlay = new Graphics()
    overlay.beginFill(0x000000, 0.8)
    overlay.drawRect(0, 0, this._screenWidth, this._screenHeight)
    overlay.endFill()
    // 让背景成为完全的点击阻止层
    overlay.interactive = true
    overlay.cursor = 'default'
    overlay.on('pointerdown', (event) => {
      event.stopPropagation()
      event.preventDefault?.()
    })
    overlay.on('pointerup', (event) => {
      event.stopPropagation()
      event.preventDefault?.()
    })
    overlay.on('pointermove', (event) => {
      event.stopPropagation()
      event.preventDefault?.()
    })
    this._container.addChild(overlay)

    // 主面板
    const panelWidth = Math.min(400, this._screenWidth - 40)
    const panelHeight = Math.min(500, this._screenHeight - 40)
    const panel = new Graphics()
    panel.beginFill(0x1a1a1a, 0.95)
    panel.lineStyle(3, 0x00d4ff, 0.8)
    panel.drawRoundedRect(0, 0, panelWidth, panelHeight, 20)
    panel.endFill()
    panel.x = (this._screenWidth - panelWidth) / 2
    panel.y = (this._screenHeight - panelHeight) / 2
    this._container.addChild(panel)

    let yPos = 40

    // 标题
    const title = new Text('关卡完成！', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 32,
      fill: 0x00d4ff,
      align: 'center'
    })
    title.anchor.set(0.5, 0)
    title.x = panelWidth / 2
    title.y = yPos
    panel.addChild(title)
    yPos += 60

    // 关卡信息
    const levelText = new Text(`第 ${data.level} 关`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 24,
      fill: 0xffffff,
      align: 'center'
    })
    levelText.anchor.set(0.5, 0)
    levelText.x = panelWidth / 2
    levelText.y = yPos
    panel.addChild(levelText)
    yPos += 40

    // 星级显示
    const starContainer = new Container()
    const starText = '⭐'.repeat(data.stars) + '☆'.repeat(3 - data.stars)
    const starsDisplay = new Text(starText, {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xffff00,
      align: 'center'
    })
    starsDisplay.anchor.set(0.5, 0)
    starsDisplay.x = panelWidth / 2
    starsDisplay.y = yPos
    panel.addChild(starsDisplay)
    yPos += 60

    // 分数信息
    const scoreText = new Text(`得分: ${data.score}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 20,
      fill: 0x39ff14,
      align: 'center'
    })
    scoreText.anchor.set(0.5, 0)
    scoreText.x = panelWidth / 2
    scoreText.y = yPos
    panel.addChild(scoreText)
    yPos += 30

    const targetText = new Text(`目标: ${data.targetScore}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 18,
      fill: 0xcccccc,
      align: 'center'
    })
    targetText.anchor.set(0.5, 0)
    targetText.x = panelWidth / 2
    targetText.y = yPos
    panel.addChild(targetText)
    yPos += 40

    // 新记录提示
    if (data.isNewRecord) {
      const newRecordText = new Text('🎉 新记录！', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 18,
        fill: 0xff4444,
        align: 'center'
      })
      newRecordText.anchor.set(0.5, 0)
      newRecordText.x = panelWidth / 2
      newRecordText.y = yPos
      panel.addChild(newRecordText)
      yPos += 30
    }

    // 解锁提示
    if (data.unlockedNext && data.nextLevel) {
      const unlockText = new Text(`🔓 解锁第 ${data.nextLevel} 关`, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 18,
        fill: 0x00d4ff,
        align: 'center'
      })
      unlockText.anchor.set(0.5, 0)
      unlockText.x = panelWidth / 2
      unlockText.y = yPos
      panel.addChild(unlockText)
      yPos += 40
    }

    // 按钮区域
    const buttonY = panelHeight - 100
    
    if (data.unlockedNext && data.nextLevel) {
      // 下一关按钮
      const nextButton = this.createButton('下一关', panelWidth / 2 - 80, buttonY, 0x39ff14, () => {
        if (this._onNextLevel) {
          this._onNextLevel()
        }
        this.hide()
      })
      panel.addChild(nextButton)

      // 重新开始按钮
      const restartButton = this.createButton('重新开始', panelWidth / 2 + 80, buttonY, 0xff8800, () => {
        if (this._onRestart) {
          this._onRestart()
        }
        this.hide()
      })
      panel.addChild(restartButton)
    } else {
      // 重新开始按钮（居中）
      const restartButton = this.createButton('重新开始', panelWidth / 2, buttonY, 0xff8800, () => {
        if (this._onRestart) {
          this._onRestart()
        }
        this.hide()
      })
      panel.addChild(restartButton)
    }

    // 主菜单按钮
    const menuButton = this.createButton('主菜单', panelWidth / 2, buttonY + 50, 0x666666, () => {
      if (this._onMainMenu) {
        this._onMainMenu()
      }
      this.hide()
    })
    panel.addChild(menuButton)
  }

  private createButton(text: string, x: number, y: number, color: number, onClick: () => void): Container {
    const button = new Container()
    button.x = x
    button.y = y

    const bg = new Graphics()
    bg.beginFill(color, 0.8)
    bg.lineStyle(2, 0xffffff, 0.8)
    bg.drawRoundedRect(-60, -20, 120, 40, 20)
    bg.endFill()
    button.addChild(bg)

    const buttonText = new Text(text, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 16,
      fill: 0xffffff,
      align: 'center'
    })
    buttonText.anchor.set(0.5)
    button.addChild(buttonText)

    button.interactive = true
    button.cursor = 'pointer'
    
    button.on('pointerdown', onClick)
    button.on('pointerover', () => {
      bg.tint = 0xdddddd
      button.scale.set(1.05)
    })
    button.on('pointerout', () => {
      bg.tint = 0xffffff
      button.scale.set(1.0)
    })

    return button
  }

  setOnNextLevel(callback: () => void): void {
    this._onNextLevel = callback
  }

  setOnRestart(callback: () => void): void {
    this._onRestart = callback
  }

  setOnMainMenu(callback: () => void): void {
    this._onMainMenu = callback
  }

  get container(): Container {
    return this._container
  }

  destroy(): void {
    this._container.destroy()
  }
} 