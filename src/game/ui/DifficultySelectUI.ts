import { Container, Graphics, Text } from 'pixi.js'

export interface DifficultyOption {
  id: string
  name: string
  description: string
  color: number
  icon: string
  settings: {
    startingLevel: number
    scoreMultiplier: number
    blockComplexityBonus: number
    timeMultiplier: number
  }
}

export class DifficultySelectUI {
  private _container: Container
  private _screenWidth: number
  private _screenHeight: number
  private _onDifficultySelected: ((difficulty: DifficultyOption) => void) | null = null
  private _onBackToModeSelect: (() => void) | null = null

  private _difficulties: DifficultyOption[] = [
    {
      id: 'easy',
      name: '简单',
      description: '适合新手\n• 简单方块为主\n• 较低分数要求\n• 充裕时间限制',
      color: 0x39ff14,
      icon: '🌱',
      settings: {
        startingLevel: 1,
        scoreMultiplier: 0.7,
        blockComplexityBonus: -1,
        timeMultiplier: 1.5
      }
    },
    {
      id: 'normal',
      name: '普通',
      description: '标准难度\n• 平衡的方块分布\n• 标准分数要求\n• 正常时间限制',
      color: 0x00d4ff,
      icon: '⚖️',
      settings: {
        startingLevel: 1,
        scoreMultiplier: 1.0,
        blockComplexityBonus: 0,
        timeMultiplier: 1.0
      }
    },
    {
      id: 'hard',
      name: '困难',
      description: '挑战性强\n• 更多复杂方块\n• 更高分数要求\n• 时间压力大',
      color: 0xff8800,
      icon: '🔥',
      settings: {
        startingLevel: 10,
        scoreMultiplier: 1.3,
        blockComplexityBonus: 2,
        timeMultiplier: 0.8
      }
    },
    {
      id: 'expert',
      name: '专家',
      description: '极限挑战\n• 大量复杂方块\n• 极高分数要求\n• 极限时间压力',
      color: 0xff4444,
      icon: '💀',
      settings: {
        startingLevel: 30,
        scoreMultiplier: 1.8,
        blockComplexityBonus: 3,
        timeMultiplier: 0.6
      }
    },
    {
      id: 'nightmare',
      name: '噩梦',
      description: '只适合大师\n• 巨型方块挑战\n• 恐怖分数要求\n• 分秒必争',
      color: 0x8000ff,
      icon: '👹',
      settings: {
        startingLevel: 60,
        scoreMultiplier: 2.5,
        blockComplexityBonus: 4,
        timeMultiplier: 0.4
      }
    }
  ]

  constructor(screenWidth: number, screenHeight: number) {
    this._container = new Container()
    this._screenWidth = screenWidth
    this._screenHeight = screenHeight
    this._container.visible = false
    this.createUI()
  }

  private createUI(): void {
    // 半透明背景 - 创建点击阻止层
    const background = new Graphics()
    background.beginFill(0x000000, 0.9)
    background.drawRect(0, 0, this._screenWidth, this._screenHeight)
    background.endFill()
    // 让背景成为完全的点击阻止层
    background.interactive = true
    background.cursor = 'default'
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
    const title = new Text('第二步：选择游戏难度', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(42, this._screenWidth / 24),
      fill: 0x00d4ff,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.x = this._screenWidth / 2
    title.y = 80
    this._container.addChild(title)

    // 提示文本
    const hint = new Text('选择难度后将开始游戏 • 难度影响方块复杂度、分数要求和时间限制', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(16, this._screenWidth / 60),
      fill: 0xcccccc,
      align: 'center'
    })
    hint.anchor.set(0.5)
    hint.x = this._screenWidth / 2
    hint.y = 120
    this._container.addChild(hint)

    // 步骤指示器
    const stepIndicator = new Text('步骤 2/2 - 最后一步！', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(18, this._screenWidth / 55),
      fill: 0x39ff14,
      align: 'center'
    })
    stepIndicator.anchor.set(0.5)
    stepIndicator.x = this._screenWidth / 2
    stepIndicator.y = 145
    this._container.addChild(stepIndicator)

    // 难度卡片
    this.createDifficultyCards()

    // 返回按钮
    const backButton = this.createButton('← 返回模式选择', this._screenWidth / 2, this._screenHeight - 60, 0x666666, () => {
      this.hide()
      if (this._onBackToModeSelect) {
        this._onBackToModeSelect()
      }
    })
    this._container.addChild(backButton)
  }

  private createDifficultyCards(): void {
    const cardWidth = Math.min(200, this._screenWidth / 6)
    const cardHeight = Math.min(280, this._screenHeight / 3)
    const spacing = 15
    
    // 计算布局 - 一行显示所有难度
    const totalWidth = this._difficulties.length * cardWidth + (this._difficulties.length - 1) * spacing
    const startX = (this._screenWidth - totalWidth) / 2
    const startY = (this._screenHeight - cardHeight) / 2 + 20

    this._difficulties.forEach((difficulty, index) => {
      const x = startX + index * (cardWidth + spacing)
      const y = startY

      const card = this.createDifficultyCard(difficulty, x, y, cardWidth, cardHeight)
      this._container.addChild(card)
    })
  }

  private createDifficultyCard(
    difficulty: DifficultyOption, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): Container {
    const card = new Container()
    card.x = x
    card.y = y

    // 卡片背景
    const bg = new Graphics()
    bg.beginFill(0x1a1a1a, 0.95)
    bg.lineStyle(3, difficulty.color, 0.8)
    bg.drawRoundedRect(0, 0, width, height, 12)
    bg.endFill()
    card.addChild(bg)

    // 图标
    const icon = new Text(difficulty.icon, {
      fontFamily: 'Arial',
      fontSize: Math.min(36, width / 5),
      fill: difficulty.color,
      align: 'center'
    })
    icon.anchor.set(0.5)
    icon.x = width / 2
    icon.y = 40
    card.addChild(icon)

    // 标题
    const title = new Text(difficulty.name, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(20, width / 10),
      fill: difficulty.color,
      align: 'center',
      fontWeight: 'bold'
    })
    title.anchor.set(0.5)
    title.x = width / 2
    title.y = 80
    card.addChild(title)

    // 描述
    const description = new Text(difficulty.description, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(12, width / 16),
      fill: 0xcccccc,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: width - 16
    })
    description.anchor.set(0.5)
    description.x = width / 2
    description.y = 150
    card.addChild(description)

    // 设置信息
    const settings = difficulty.settings
    const settingsText = new Text(
      `起始: ${settings.startingLevel}关\n分数: x${settings.scoreMultiplier}\n时间: x${settings.timeMultiplier}`,
      {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: Math.min(10, width / 20),
        fill: 0xaaaaaa,
        align: 'center'
      }
    )
    settingsText.anchor.set(0.5)
    settingsText.x = width / 2
    settingsText.y = height - 40
    card.addChild(settingsText)

    // 交互
    card.interactive = true
    card.cursor = 'pointer'

    card.on('pointerdown', () => {
      if (this._onDifficultySelected) {
        this._onDifficultySelected(difficulty)
      }
    })

    card.on('pointerover', () => {
      bg.tint = 0xdddddd
      card.scale.set(1.05)
      
      // 特殊效果
      if (difficulty.id === 'nightmare') {
        // 噩梦模式特殊抖动效果
        let shakeTime = 0
        const shake = () => {
          shakeTime += 0.1
          const offsetX = Math.sin(shakeTime * 20) * 2
          const offsetY = Math.cos(shakeTime * 25) * 1
          card.x = x + offsetX
          card.y = y + offsetY
          
          if (card.parent && shakeTime < 1) {
            requestAnimationFrame(shake)
          } else {
            card.x = x
            card.y = y
          }
        }
        shake()
      }
    })

    card.on('pointerout', () => {
      bg.tint = 0xffffff
      card.scale.set(1.0)
      card.x = x
      card.y = y
    })

    return card
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

  setOnDifficultySelected(callback: (difficulty: DifficultyOption) => void): void {
    this._onDifficultySelected = callback
  }

  setOnBackToModeSelect(callback: () => void): void {
    this._onBackToModeSelect = callback
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