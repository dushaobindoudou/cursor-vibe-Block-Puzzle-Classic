import { Container, Graphics, Text } from 'pixi.js'
import { GameMode } from '@/types/game'

export interface GameOverData {
  score: number
  level: number
  gameMode: GameMode
  combo: number
}

export class GameOverUI {
  private _container: Container
  private _screenWidth: number
  private _screenHeight: number
  private _onRestart?: () => void
  private _onMainMenu?: () => void

  constructor(screenWidth: number, screenHeight: number) {
    this._container = new Container()
    this._screenWidth = screenWidth
    this._screenHeight = screenHeight
    this._container.visible = false
  }

  show(data: GameOverData): void {
    this.createUI(data)
    this._container.visible = true
  }

  hide(): void {
    this._container.visible = false
  }

  get container(): Container {
    return this._container
  }

  setOnRestart(callback: () => void): void {
    this._onRestart = callback
  }

  setOnMainMenu(callback: () => void): void {
    this._onMainMenu = callback
  }

  private createUI(data: GameOverData): void {
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
    const panelWidth = Math.min(450, this._screenWidth - 40)
    const panelHeight = Math.min(550, this._screenHeight - 40)
    const panel = new Graphics()
    panel.beginFill(0x1a1a1a, 0.95)
    panel.lineStyle(3, 0xff4444, 0.8)
    panel.drawRoundedRect(0, 0, panelWidth, panelHeight, 20)
    panel.endFill()
    panel.x = (this._screenWidth - panelWidth) / 2
    panel.y = (this._screenHeight - panelHeight) / 2
    this._container.addChild(panel)

    let yPos = 40

    // 游戏结束标题
    const title = new Text('💀 游戏结束', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 36,
      fill: 0xff4444,
      align: 'center'
    })
    title.anchor.set(0.5, 0)
    title.x = panelWidth / 2
    title.y = yPos
    panel.addChild(title)
    yPos += 70

    // 游戏模式显示
    const modeText = this.getGameModeText(data.gameMode)
    const gameMode = new Text(`游戏模式: ${modeText}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 20,
      fill: 0x00d4ff,
      align: 'center'
    })
    gameMode.anchor.set(0.5, 0)
    gameMode.x = panelWidth / 2
    gameMode.y = yPos
    panel.addChild(gameMode)
    yPos += 40

    // 关卡信息（如果是关卡模式）
    if (data.gameMode === GameMode.LEVEL) {
      const levelText = new Text(`关卡: ${data.level}`, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 18,
        fill: 0xcccccc,
        align: 'center'
      })
      levelText.anchor.set(0.5, 0)
      levelText.x = panelWidth / 2
      levelText.y = yPos
      panel.addChild(levelText)
      yPos += 35
    }

    // 最终分数
    const scoreText = new Text(`最终分数: ${data.score.toLocaleString()}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 28,
      fill: 0x39ff14,
      align: 'center'
    })
    scoreText.anchor.set(0.5, 0)
    scoreText.x = panelWidth / 2
    scoreText.y = yPos
    panel.addChild(scoreText)
    yPos += 50

    // 最高连击
    if (data.combo > 1) {
      const comboText = new Text(`最高连击: ${data.combo}x`, {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 20,
        fill: 0xffaa00,
        align: 'center'
      })
      comboText.anchor.set(0.5, 0)
      comboText.x = panelWidth / 2
      comboText.y = yPos
      panel.addChild(comboText)
      yPos += 40
    }

    // 分隔线
    const separator = new Graphics()
    separator.lineStyle(2, 0x666666, 0.5)
    separator.moveTo(50, yPos + 20)
    separator.lineTo(panelWidth - 50, yPos + 20)
    panel.addChild(separator)
    yPos += 50

    // 游戏结束原因
    const reasonText = new Text('无法放置任何候选方块', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 16,
      fill: 0xcccccc,
      align: 'center'
    })
    reasonText.anchor.set(0.5, 0)
    reasonText.x = panelWidth / 2
    reasonText.y = yPos
    panel.addChild(reasonText)
    yPos += 40

    // 按钮区域
    const buttonY = panelHeight - 120
    
    // 重新开始按钮
    const restartButton = this.createButton('🔄 重新开始', panelWidth / 2, buttonY, 0x39ff14, () => {
      if (this._onRestart) {
        this._onRestart()
      }
      this.hide()
    })
    panel.addChild(restartButton)

    // 主菜单按钮
    const menuButton = this.createButton('🏠 返回主菜单', panelWidth / 2, buttonY + 60, 0x666666, () => {
      if (this._onMainMenu) {
        this._onMainMenu()
      }
      this.hide()
    })
    panel.addChild(menuButton)
  }

  private getGameModeText(mode: GameMode): string {
    switch (mode) {
      case GameMode.CLASSIC:
        return '经典模式 ♾️'
      case GameMode.LEVEL:
        return '关卡模式 🏆'
      case GameMode.TIMED:
        return '限时挑战 ⏰'
      case GameMode.DAILY:
        return '每日挑战 📅'
      default:
        return '未知模式'
    }
  }

  private createButton(text: string, x: number, y: number, color: number, onClick: () => void): Container {
    const button = new Container()
    button.x = x
    button.y = y

    const bg = new Graphics()
    bg.beginFill(color, 0.8)
    bg.lineStyle(2, 0xffffff, 0.8)
    bg.drawRoundedRect(-100, -20, 200, 40, 20)
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
} 