import { Container, Graphics, Text } from 'pixi.js'
import { LevelManager } from '../levels/LevelManager'

export class LevelSelectUI {
  private _container: Container
  private _levelManager: LevelManager
  private _screenWidth: number
  private _screenHeight: number
  private _onLevelSelected: ((level: number) => void) | null = null

  constructor(levelManager: LevelManager, screenWidth: number, screenHeight: number) {
    this._container = new Container()
    this._levelManager = levelManager
    this._screenWidth = screenWidth
    this._screenHeight = screenHeight
    this.createUI()
  }

  private createUI(): void {
    // 背景
    const background = new Graphics()
    background.beginFill(0x0a0a0a, 0.9)
    background.drawRect(0, 0, this._screenWidth, this._screenHeight)
    background.endFill()
    this._container.addChild(background)

    // 标题
    const title = new Text('关卡选择', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(36, this._screenWidth / 25),
      fill: 0x00d4ff,
      align: 'center'
    })
    title.anchor.set(0.5)
    title.x = this._screenWidth / 2
    title.y = 60
    this._container.addChild(title)

    // 总星级显示
    const totalStars = this._levelManager.getTotalStars()
    const maxStars = this._levelManager.getMaxStars()
    const starText = new Text(`总星级: ${totalStars}/${maxStars} ⭐`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(24, this._screenWidth / 40),
      fill: 0xffff00,
      align: 'center'
    })
    starText.anchor.set(0.5)
    starText.x = this._screenWidth / 2
    starText.y = 100
    this._container.addChild(starText)

    // 关卡网格
    this.createLevelGrid()

    // 返回按钮
    const backButton = this.createButton('返回游戏', this._screenWidth / 2, this._screenHeight - 60, () => {
      this.hide()
    })
    this._container.addChild(backButton)
  }

  private createLevelGrid(): void {
    const unlockedLevels = this._levelManager.getUnlockedLevels()
    const cellSize = Math.min(80, this._screenWidth / 12)
    const cols = Math.floor(this._screenWidth / (cellSize + 10))
    const startX = (this._screenWidth - cols * (cellSize + 10)) / 2
    const startY = 150

    // 显示前20关
    for (let i = 1; i <= Math.min(20, 100); i++) {
      const col = (i - 1) % cols
      const row = Math.floor((i - 1) / cols)
      const x = startX + col * (cellSize + 10)
      const y = startY + row * (cellSize + 10)

      const levelButton = this.createLevelButton(i, x, y, cellSize, unlockedLevels.includes(i))
      this._container.addChild(levelButton)
    }
  }

  private createLevelButton(level: number, x: number, y: number, size: number, isUnlocked: boolean): Container {
    const button = new Container()
    button.x = x
    button.y = y

    // 按钮背景
    const bg = new Graphics()
    if (isUnlocked) {
      const progress = this._levelManager.getLevelProgress(level)
      const stars = progress?.stars || 0
      
      // 根据星级设置颜色
      let color = 0x333333 // 未完成
      if (stars === 1) color = 0x8B4513 // 铜色
      else if (stars === 2) color = 0xC0C0C0 // 银色
      else if (stars === 3) color = 0xFFD700 // 金色

      bg.beginFill(color, 0.8)
      bg.lineStyle(2, 0xffffff, 0.8)
    } else {
      bg.beginFill(0x1a1a1a, 0.5)
      bg.lineStyle(2, 0x666666, 0.5)
    }
    
    bg.drawRoundedRect(0, 0, size, size, 8)
    bg.endFill()
    button.addChild(bg)

    // 关卡数字
    const levelText = new Text(level.toString(), {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(20, size / 3),
      fill: isUnlocked ? 0xffffff : 0x666666,
      align: 'center'
    })
    levelText.anchor.set(0.5)
    levelText.x = size / 2
    levelText.y = size / 2 - 10
    button.addChild(levelText)

    // 星级显示
    if (isUnlocked) {
      const progress = this._levelManager.getLevelProgress(level)
      const stars = progress?.stars || 0
      
      const starDisplay = new Text('⭐'.repeat(stars), {
        fontFamily: 'Arial',
        fontSize: Math.min(12, size / 6),
        fill: 0xffff00,
        align: 'center'
      })
      starDisplay.anchor.set(0.5)
      starDisplay.x = size / 2
      starDisplay.y = size / 2 + 15
      button.addChild(starDisplay)

      // 可交互
      button.interactive = true
      button.cursor = 'pointer'
      
      button.on('pointerdown', () => {
        if (this._onLevelSelected) {
          this._onLevelSelected(level)
        }
      })

      button.on('pointerover', () => {
        bg.tint = 0xdddddd
      })

      button.on('pointerout', () => {
        bg.tint = 0xffffff
      })
    }

    return button
  }

  private createButton(text: string, x: number, y: number, onClick: () => void): Container {
    const button = new Container()
    button.x = x
    button.y = y

    const bg = new Graphics()
    bg.beginFill(0x00d4ff, 0.8)
    bg.lineStyle(2, 0xffffff, 0.8)
    bg.drawRoundedRect(-80, -20, 160, 40, 20)
    bg.endFill()
    button.addChild(bg)

    const buttonText = new Text(text, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 18,
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

  setOnLevelSelected(callback: (level: number) => void): void {
    this._onLevelSelected = callback
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