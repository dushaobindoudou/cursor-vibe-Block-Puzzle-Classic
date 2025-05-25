import { Container, Graphics, Text } from 'pixi.js'
import { GameMode } from '@/types/game'

export interface GameModeOption {
  mode: GameMode
  title: string
  description: string
  color: number
  icon: string
}

export class GameModeSelectUI {
  private _container: Container
  private _screenWidth: number
  private _screenHeight: number
  private _onModeSelected: ((mode: GameMode, options?: any) => void) | null = null
  private _onBackToMain: (() => void) | null = null

  private _gameModes: GameModeOption[] = [
    {
      mode: GameMode.CLASSIC,
      title: '经典模式',
      description: '无限游戏，挑战最高分\n难度随分数递增',
      color: 0x00d4ff,
      icon: '♾️'
    },
    {
      mode: GameMode.LEVEL,
      title: '关卡模式',
      description: '100个精心设计的关卡\n星级评定，解锁新关卡',
      color: 0x39ff14,
      icon: '🏆'
    },
    {
      mode: GameMode.TIMED,
      title: '限时挑战',
      description: '3/5/10分钟竞速\n快速决策，刺激体验',
      color: 0xff4444,
      icon: '⏰'
    },
    {
      mode: GameMode.DAILY,
      title: '每日挑战',
      description: '每日独特关卡\n全球排行榜竞技',
      color: 0xffaa00,
      icon: '📅'
    }
  ]

  constructor(screenWidth: number, screenHeight: number) {
    this._container = new Container()
    this._screenWidth = screenWidth
    this._screenHeight = screenHeight
    this.createUI()
  }

  private createUI(): void {
    // 背景 - 创建一个完全的点击阻止层
    const background = new Graphics()
    background.beginFill(0x0a0a0a, 0.95)
    background.drawRect(0, 0, this._screenWidth, this._screenHeight)
    background.endFill()
    // 让背景成为一个完全的点击阻止层
    background.interactive = true
    background.cursor = 'default'
    // 阻止所有点击事件传播
    background.on('pointerdown', (event) => {
      event.stopPropagation()
      event.preventDefault?.()
    })
    background.on('pointerup', (event) => {
      event.stopPropagation()
      event.preventDefault?.()
    })
    background.on('pointermove', (event) => {
      event.stopPropagation()
      event.preventDefault?.()
    })
    this._container.addChild(background)

    // 标题
    const title = new Text('第一步：选择游戏模式', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(48, this._screenWidth / 20),
      fill: 0x00d4ff,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.x = this._screenWidth / 2
    title.y = 80
    this._container.addChild(title)

    // 添加步骤提示
    const stepHint = new Text('选择模式后将进入难度选择', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(16, this._screenWidth / 60),
      fill: 0xcccccc,
      align: 'center'
    })
    stepHint.anchor.set(0.5)
    stepHint.x = this._screenWidth / 2
    stepHint.y = 120
    this._container.addChild(stepHint)

    // 步骤指示器
    const stepIndicator = new Text('步骤 1/2', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(18, this._screenWidth / 55),
      fill: 0x39ff14,
      align: 'center'
    })
    stepIndicator.anchor.set(0.5)
    stepIndicator.x = this._screenWidth / 2
    stepIndicator.y = 145
    this._container.addChild(stepIndicator)

    // 模式卡片
    this.createModeCards()

    // 返回按钮
    const backButton = this.createButton('← 返回主界面', this._screenWidth / 2, this._screenHeight - 60, () => {
      this.hide()
      this.triggerBackToMain()
    })
    this._container.addChild(backButton)
  }

  private createModeCards(): void {
    const cardWidth = Math.min(280, this._screenWidth / 2 - 40)
    const cardHeight = Math.min(200, this._screenHeight / 4)
    const spacing = 20
    
    // 计算布局
    const cols = this._screenWidth > 800 ? 2 : 1
    const rows = Math.ceil(this._gameModes.length / cols)
    const totalWidth = cols * cardWidth + (cols - 1) * spacing
    const totalHeight = rows * cardHeight + (rows - 1) * spacing
    
    const startX = (this._screenWidth - totalWidth) / 2
    const startY = (this._screenHeight - totalHeight) / 2 + 40

    this._gameModes.forEach((gameMode, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = startX + col * (cardWidth + spacing)
      const y = startY + row * (cardHeight + spacing)

      const card = this.createModeCard(gameMode, x, y, cardWidth, cardHeight)
      this._container.addChild(card)
    })
  }

  private createModeCard(gameMode: GameModeOption, x: number, y: number, width: number, height: number): Container {
    const card = new Container()
    card.x = x
    card.y = y

    // 卡片背景
    const bg = new Graphics()
    bg.beginFill(0x1a1a1a, 0.9)
    bg.lineStyle(3, gameMode.color, 0.8)
    bg.drawRoundedRect(0, 0, width, height, 15)
    bg.endFill()
    card.addChild(bg)

    // 图标
    const icon = new Text(gameMode.icon, {
      fontFamily: 'Arial',
      fontSize: Math.min(48, width / 6),
      fill: gameMode.color,
      align: 'center'
    })
    icon.anchor.set(0.5)
    icon.x = width / 2
    icon.y = 50
    card.addChild(icon)

    // 标题
    const title = new Text(gameMode.title, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(24, width / 12),
      fill: 0xffffff,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.x = width / 2
    title.y = 100
    card.addChild(title)

    // 描述
    const description = new Text(gameMode.description, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(14, width / 20),
      fill: 0xcccccc,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: width - 20
    })
    description.anchor.set(0.5)
    description.x = width / 2
    description.y = 140
    card.addChild(description)

    // 交互
    card.interactive = true
    card.cursor = 'pointer'

    card.on('pointerdown', () => {
      if (gameMode.mode === GameMode.TIMED) {
        // 限时模式需要选择时间
        this.showTimerOptions(gameMode.mode)
      } else {
        if (this._onModeSelected) {
          this._onModeSelected(gameMode.mode)
        }
      }
    })

    card.on('pointerover', () => {
      bg.tint = 0xdddddd
      card.scale.set(1.05)
    })

    card.on('pointerout', () => {
      bg.tint = 0xffffff
      card.scale.set(1.0)
    })

    return card
  }

  private showTimerOptions(mode: GameMode): void {
    // 创建时间选择叠加层
    const overlay = new Container()
    
    const overlayBg = new Graphics()
    overlayBg.beginFill(0x000000, 0.8)
    overlayBg.drawRect(0, 0, this._screenWidth, this._screenHeight)
    overlayBg.endFill()
    // 让叠加层背景成为点击阻止层
    overlayBg.interactive = true
    overlayBg.cursor = 'default'
    overlayBg.on('pointerdown', (event) => {
      event.stopPropagation()
      event.preventDefault?.()
    })
    overlayBg.on('pointerup', (event) => {
      event.stopPropagation()
      event.preventDefault?.()
    })
    overlay.addChild(overlayBg)

    // 选择面板
    const panelWidth = Math.min(400, this._screenWidth - 40)
    const panelHeight = Math.min(300, this._screenHeight - 40)
    const panel = new Graphics()
    panel.beginFill(0x1a1a1a, 0.95)
    panel.lineStyle(2, 0xff4444, 0.8)
    panel.drawRoundedRect(0, 0, panelWidth, panelHeight, 20)
    panel.endFill()
    panel.x = (this._screenWidth - panelWidth) / 2
    panel.y = (this._screenHeight - panelHeight) / 2
    overlay.addChild(panel)

    // 标题
    const title = new Text('选择时间限制', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 24,
      fill: 0xff4444,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.x = panelWidth / 2
    title.y = 50
    panel.addChild(title)

    // 时间选项
    const timeOptions = [
      { time: 180, label: '3分钟 - 快速挑战' },
      { time: 300, label: '5分钟 - 标准挑战' },
      { time: 600, label: '10分钟 - 深度挑战' }
    ]

    timeOptions.forEach((option, index) => {
      const button = this.createTimeButton(
        option.label,
        panelWidth / 2,
        100 + index * 50,
        () => {
          if (this._onModeSelected) {
            this._onModeSelected(mode, { timeLimit: option.time })
          }
          this._container.removeChild(overlay)
          overlay.destroy()
        }
      )
      panel.addChild(button)
    })

    // 取消按钮
    const cancelButton = this.createTimeButton(
      '取消',
      panelWidth / 2,
      250,
      () => {
        this._container.removeChild(overlay)
        overlay.destroy()
      }
    )
    panel.addChild(cancelButton)

    this._container.addChild(overlay)
  }

  private createTimeButton(text: string, x: number, y: number, onClick: () => void): Container {
    const button = new Container()
    button.x = x
    button.y = y

    const bg = new Graphics()
    bg.beginFill(0xff4444, 0.8)
    bg.lineStyle(2, 0xffffff, 0.8)
    bg.drawRoundedRect(-150, -15, 300, 30, 15)
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
    })
    button.on('pointerout', () => {
      bg.tint = 0xffffff
    })

    return button
  }

  private createButton(text: string, x: number, y: number, onClick: () => void): Container {
    const button = new Container()
    button.x = x
    button.y = y

    const bg = new Graphics()
    bg.beginFill(0x666666, 0.8)
    bg.lineStyle(2, 0xffffff, 0.8)
    bg.drawRoundedRect(-80, -20, 160, 40, 20)
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
    })
    button.on('pointerout', () => {
      bg.tint = 0xffffff
    })

    return button
  }

  setOnModeSelected(callback: (mode: GameMode, options?: any) => void): void {
    this._onModeSelected = callback
  }

  setOnBackToMain(callback: () => void): void {
    this._onBackToMain = callback
  }

  triggerBackToMain(): void {
    if (this._onBackToMain) {
      this._onBackToMain()
    }
  }

  show(): void {
    this._container.visible = true
  }

  hide(): void {
    this._container.visible = false
  }

  get container(): Container {
    return this._container
  }

  destroy(): void {
    this._container.destroy()
  }
} 