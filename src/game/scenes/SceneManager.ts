import { Container, Graphics, Text, Point } from 'pixi.js'
import { GameState, Block, GameMode } from '@/types/game'
import { DragManager, DragManagerCallbacks } from '../interaction/DragManager'
import { GameModeSelectUI } from '../ui/GameModeSelectUI'
// import { LevelSelectUI } from '../ui/LevelSelectUI' // Will be used later
import { LevelCompleteUI, LevelCompleteData } from '../ui/LevelCompleteUI'
import { GameOverUI, GameOverData } from '../ui/GameOverUI'
import { DifficultySelectUI, DifficultyOption } from '../ui/DifficultySelectUI'
import { GameLayoutConfig } from '@/utils/MobileAdapter'

export class SceneManager {
  private _stage: Container | null = null
  private _isInitialized = false
  private _currentScene: Container | null = null
  private _screenWidth = 1024
  private _screenHeight = 768
  private _currentSceneType: 'welcome' | 'game' | 'pause' = 'welcome'
  private _gameState: GameState | null = null
  private _gameBoard: Graphics | null = null
  private _candidateArea: Container | null = null
  private _scoreText: Text | null = null
  private _dragManager: DragManager | null = null
  private _gameModeSelectUI: GameModeSelectUI | null = null
  // Note: Level selection will be implemented in future versions
  private _levelCompleteUI: LevelCompleteUI | null = null
  private _gameOverUI: GameOverUI | null = null
  private _difficultySelectUI: DifficultySelectUI | null = null
  private _onBlockPlacedCallback: ((block: Block, gridX: number, gridY: number) => boolean) | null = null
  private _canPlaceBlockCallback: ((pattern: number[][], gridX: number, gridY: number) => boolean) | null = null
  private _onModeSelectedCallback: ((mode: GameMode, options?: any) => void) | null = null
  private _selectedGameMode: GameMode | null = null
  private _selectedModeOptions: any = null
  private _mobileLayoutConfig: GameLayoutConfig | null = null

  init(stage: Container, screenWidth = 1024, screenHeight = 768, mobileLayoutConfig?: GameLayoutConfig): void {
    this._stage = stage
    this._screenWidth = screenWidth
    this._screenHeight = screenHeight
    this._mobileLayoutConfig = mobileLayoutConfig || null
    this._isInitialized = true
    this.createWelcomeScene()
    console.log(`🎬 SceneManager initialized for ${screenWidth}x${screenHeight}`)
  }

  updateMobileLayout(layoutConfig: GameLayoutConfig): void {
    this._mobileLayoutConfig = layoutConfig
    
    // 如果当前是游戏场景，重新创建以应用新布局
    if (this._currentSceneType === 'game') {
      this.createGameScene()
    } else if (this._currentSceneType === 'welcome') {
      this.createWelcomeScene()
    }
  }

  private createWelcomeScene(): void {
    if (!this._stage) return

    // 创建欢迎场景
    const scene = new Container()
    
    // 背景
    const background = new Graphics()
    background.beginFill(0x0a0a0a)
    background.drawRect(0, 0, this._screenWidth, this._screenHeight)
    background.endFill()
    // 明确设置背景不可交互
    background.interactive = false
    background.interactiveChildren = false
    scene.addChild(background)

    // 添加动态背景效果
    this.createAnimatedBackground(scene)

    // 计算响应式位置
    const centerX = this._screenWidth / 2
    const centerY = this._screenHeight / 2

    // Logo容器
    const logoContainer = new Container()
    logoContainer.x = centerX
    logoContainer.y = Math.max(120, this._screenHeight * 0.18)
    scene.addChild(logoContainer)

    // 主标题
    const titleFontSize = Math.min(52, this._screenWidth / 18)
    const titleText = new Text('BLOCK PUZZLE', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: titleFontSize,
      fill: 0x00d4ff,
      align: 'center',
      fontWeight: 'bold'
    })
    titleText.anchor.set(0.5)
    titleText.y = -20
    logoContainer.addChild(titleText)

    // 装饰性标题
    const classicText = new Text('CLASSIC', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(32, titleFontSize * 0.6),
      fill: 0x39ff14,
      align: 'center',
      fontWeight: 'bold'
    })
    classicText.anchor.set(0.5)
    classicText.y = titleText.y + titleFontSize + 5
    logoContainer.addChild(classicText)

    // 副标题
    const subtitleText = new Text('🧩 方块拼图经典版 🎮', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(20, this._screenWidth / 45),
      fill: 0xcccccc,
      align: 'center'
    })
    subtitleText.anchor.set(0.5)
    subtitleText.y = classicText.y + 40
    logoContainer.addChild(subtitleText)

    // 游戏流程说明
    const flowText = new Text('游戏流程：选择模式 → 选择难度 → 开始游戏', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(14, this._screenWidth / 70),
      fill: 0x39ff14,
      align: 'center'
    })
    flowText.anchor.set(0.5)
    flowText.y = subtitleText.y + 35
    logoContainer.addChild(flowText)

    // 当前设置显示
    this.createCurrentSettingsDisplay(logoContainer, flowText.y + 25)

    // Logo动画效果
    this.animateLogo(logoContainer)

    // 计算游戏区域大小和位置
    const maxGameWidth = Math.min(320, this._screenWidth * 0.3)
    const maxGameHeight = Math.min(640, this._screenHeight * 0.6)
    const gameAreaWidth = maxGameWidth
    const gameAreaHeight = maxGameHeight

    // 游戏区域预览
    const gameAreaBg = new Graphics()
    gameAreaBg.lineStyle(2, 0x00d4ff, 1)
    gameAreaBg.beginFill(0x1a1a1a, 0.8)
    gameAreaBg.drawRect(0, 0, gameAreaWidth, gameAreaHeight)
    gameAreaBg.endFill()
    gameAreaBg.x = centerX - gameAreaWidth / 2
    gameAreaBg.y = centerY - gameAreaHeight / 2 + 50
    scene.addChild(gameAreaBg)

    // 网格线
    const cellSize = Math.min(32, gameAreaWidth / 10)
    this.drawGrid(gameAreaBg, gameAreaWidth, gameAreaHeight, cellSize)

    // 游戏模式按钮
    const modeButton = this.createEnhancedButton('🚀 开始游戏', centerX, Math.min(this._screenHeight - 100, gameAreaBg.y + gameAreaHeight + 30), 0x00d4ff, () => {
      this.showGameModeSelect()
    })
    scene.addChild(modeButton)

    // 提示文本
    const hintFontSize = Math.min(16, this._screenWidth / 60)
    const hintText = new Text('请先选择游戏模式和难度，然后开始游戏', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: hintFontSize,
      fill: 0xcccccc,
      align: 'center'
    })
    hintText.anchor.set(0.5)
    hintText.x = centerX
    hintText.y = Math.min(this._screenHeight - 50, gameAreaBg.y + gameAreaHeight + 60)
    scene.addChild(hintText)

    this._currentScene = scene
    this._stage.addChild(scene)
  }

  private createAnimatedBackground(scene: Container): void {
    // 创建流动的粒子背景
    const particleCount = Math.min(30, this._screenWidth / 40)
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new Graphics()
      const size = 2 + Math.random() * 3
      const hue = Math.random() * 360
      const color = this.hslToHex(hue, 70, 50)
      
      particle.beginFill(color, 0.3 + Math.random() * 0.4)
      particle.drawCircle(0, 0, size)
      particle.endFill()
      
      particle.x = Math.random() * this._screenWidth
      particle.y = Math.random() * this._screenHeight
      
      scene.addChild(particle)
      
      // 粒子动画
      this.animateBackgroundParticle(particle, hue)
    }
  }

  private animateBackgroundParticle(particle: Graphics, initialHue: number): void {
    let time = Math.random() * Math.PI * 2
    let speed = 0.3 + Math.random() * 0.7
    
    const animate = () => {
      time += 0.02
      
      particle.x += Math.sin(time) * speed
      particle.y += Math.cos(time * 0.7) * speed * 0.5 + 0.2
      
      // 边界循环
      if (particle.x > this._screenWidth + 20) particle.x = -20
      if (particle.x < -20) particle.x = this._screenWidth + 20
      if (particle.y > this._screenHeight + 20) particle.y = -20
      
      // 颜色变化
      const newHue = (initialHue + time * 20) % 360
      const newColor = this.hslToHex(newHue, 70, 50)
      particle.tint = newColor
      
      // 透明度脉动
      particle.alpha = 0.3 + Math.sin(time * 3) * 0.2
      
      requestAnimationFrame(animate)
    }
    animate()
  }

  private animateLogo(logoContainer: Container): void {
    let time = 0
    
    const animate = () => {
      time += 0.02
      
      // 轻微的上下浮动
      logoContainer.y += Math.sin(time) * 0.5
      
      // 轻微缩放脉动
      const scale = 1 + Math.sin(time * 1.5) * 0.02
      logoContainer.scale.set(scale)
      
      requestAnimationFrame(animate)
    }
    animate()
  }

  private hslToHex(h: number, s: number, l: number): number {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
    }
    return (f(0) << 16) | (f(8) << 8) | f(4)
  }

  startGame(): void {
    if (this._currentSceneType === 'welcome') {
      console.log('🎬 Switching to game scene...')
      this._currentSceneType = 'game'
      this.createGameScene()
    }
  }

  private createGameScene(): void {
    if (!this._stage) return

    // 移除当前场景
    if (this._currentScene) {
      this._stage.removeChild(this._currentScene)
    }

    // 创建游戏场景
    const scene = new Container()
    
    // 背景
    const background = new Graphics()
    background.beginFill(0x0a0a0a)
    background.drawRect(0, 0, this._screenWidth, this._screenHeight)
    background.endFill()
    // 明确设置背景不可交互
    background.interactive = false
    background.interactiveChildren = false
    scene.addChild(background)

    // 计算响应式位置
    const centerX = this._screenWidth / 2

    // 获取布局配置
    const layoutConfig = this._mobileLayoutConfig
    const fontSize = layoutConfig ? layoutConfig.fontSize : { small: 16, medium: 18, large: 24 }
    const spacing = layoutConfig ? layoutConfig.spacing : { small: 10, medium: 15, large: 20 }

    // 关卡和分数显示 - 顶部一行
    const topY = spacing.medium
    const levelText = new Text('Level: 1', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: fontSize.medium,
      fill: 0x39ff14,
      align: 'center'
    })
    levelText.anchor.set(0.5, 0)
    levelText.x = centerX - 100
    levelText.y = topY
    scene.addChild(levelText)

    this._scoreText = new Text('Score: 0 / 50', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: fontSize.medium,
      fill: 0x00d4ff,
      align: 'center'
    })
    this._scoreText.anchor.set(0.5, 0)
    this._scoreText.x = centerX + 100
    this._scoreText.y = topY
    scene.addChild(this._scoreText)

    // 游戏模式和难度显示 - 第二行，增加更多向下间距
    const settingsY = topY + fontSize.medium + spacing.large * 2
    this.createGameModeDisplay(scene, centerX, settingsY)

    // 游戏板配置
    let cellSize: number
    let boardWidth: number
    let boardHeight: number

    if (layoutConfig) {
      cellSize = layoutConfig.cellSize
      boardWidth = layoutConfig.boardSize
      boardHeight = layoutConfig.boardSize
    } else {
      // 默认桌面配置
      cellSize = Math.min(35, Math.min(this._screenWidth, this._screenHeight) / 20)
      boardWidth = cellSize * 10
      boardHeight = cellSize * 10
    }
    
    // 游戏板位置 - 确保在设置显示下方有足够间距
    const gameBoardY = settingsY + 50 + spacing.medium  // 50是设置显示的高度(40) + 一些边距
    this._gameBoard = new Graphics()
    this._gameBoard.x = centerX - boardWidth / 2
    this._gameBoard.y = gameBoardY
    this.drawGameBoard(this._gameBoard, boardWidth, boardHeight, cellSize)
    scene.addChild(this._gameBoard)

    // 候选方块区域 - 确保有足够间距
    this._candidateArea = new Container()
    
    if (layoutConfig && layoutConfig.candidateArea.direction === 'column') {
      // 横屏布局：候选方块在右侧
      this._candidateArea.x = this._gameBoard.x + boardWidth + spacing.medium
      this._candidateArea.y = this._gameBoard.y
    } else {
      // 竖屏布局：候选方块在下方，增加更多间距向下移动
      this._candidateArea.x = centerX
      this._candidateArea.y = this._gameBoard.y + boardHeight + spacing.large * 3
    }
    
    this.createCandidateArea(this._candidateArea, cellSize)
    scene.addChild(this._candidateArea)

    // 操作提示（仅在非移动端显示）
    if (!layoutConfig || !this._mobileLayoutConfig) {
      const hintText = new Text('Drag blocks from bottom to place them', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: fontSize.small,
        fill: 0xcccccc,
        align: 'center'
      });

      hintText.anchor.set(0.5)
      hintText.x = centerX
      hintText.y = this._screenHeight - spacing.large
      scene.addChild(hintText)
    }

    this._currentScene = scene
    this._stage.addChild(scene)

    // 初始化拖拽管理器
    this.initializeDragManager(cellSize)

    // 设置特效管理器的游戏板信息
    const gameApp = (window as any).gameApp
    if (gameApp && gameApp.effectManager) {
      gameApp.effectManager.setGameBoard(this._gameBoard, cellSize, this._gameBoard.x, this._gameBoard.y)
    }

    // 更新游戏显示
    this.updateGameDisplay()
  }

  resize(newWidth: number, newHeight: number): void {
    this._screenWidth = newWidth
    this._screenHeight = newHeight
    
    // 重新创建当前场景
    if (this._currentScene && this._stage) {
      this._stage.removeChild(this._currentScene)
      this._currentScene = null
    }
    
    // 根据当前场景类型重新创建
    if (this._currentSceneType === 'welcome') {
      this.createWelcomeScene()
    } else if (this._currentSceneType === 'game') {
      this.createGameScene()
    }
    
    console.log(`🔄 Scene resized to ${newWidth}x${newHeight}`)
  }

  private drawGrid(container: Graphics, width: number, height: number, cellSize: number): void {
    const cols = Math.floor(width / cellSize)
    const rows = Math.floor(height / cellSize)

    container.lineStyle(1, 0x333333, 0.5)

    // 画垂直线
    for (let x = 0; x <= cols; x++) {
      container.moveTo(x * cellSize, 0)
      container.lineTo(x * cellSize, height)
    }

    // 画水平线  
    for (let y = 0; y <= rows; y++) {
      container.moveTo(0, y * cellSize)
      container.lineTo(width, y * cellSize)
    }
  }

  update(_deltaTime: number): void {
    if (!this._isInitialized) return
    // 场景更新逻辑
  }

  destroy(): void {
    if (this._currentScene && this._stage) {
      this._stage.removeChild(this._currentScene)
    }
    this._stage = null
    this._isInitialized = false
    this._currentScene = null
    console.log('🎬 SceneManager destroyed')
  }

  setGameState(gameState: GameState | null): void {
    this._gameState = gameState
    if (this._currentSceneType === 'game') {
      this.updateGameDisplay()
    }
  }

  setBlockPlacedCallback(callback: (block: Block, gridX: number, gridY: number) => boolean): void {
    this._onBlockPlacedCallback = callback
  }

  setCanPlaceBlockCallback(callback: (pattern: number[][], gridX: number, gridY: number) => boolean): void {
    this._canPlaceBlockCallback = callback
  }

  setOnModeSelectedCallback(callback: (mode: GameMode, options?: any) => void): void {
    this._onModeSelectedCallback = callback
  }

  showLevelComplete(data: LevelCompleteData): void {
    if (!this._stage) return

    if (!this._levelCompleteUI) {
      this._levelCompleteUI = new LevelCompleteUI(this._screenWidth, this._screenHeight)
      
      this._levelCompleteUI.setOnNextLevel(() => {
        // 进入下一关
        const gameApp = (window as any).gameApp
        if (gameApp && gameApp.gameEngine) {
          gameApp.gameEngine.nextLevel()
          const gameState = gameApp.gameEngine.gameState
          if (gameState) {
            this.setGameState(gameState)
          }
        }
      })

      this._levelCompleteUI.setOnRestart(() => {
        // 重新开始当前关
        const gameApp = (window as any).gameApp
        if (gameApp && gameApp.gameEngine) {
          gameApp.gameEngine.restartLevel()
          const gameState = gameApp.gameEngine.gameState
          if (gameState) {
            this.setGameState(gameState)
          }
        }
      })

      this._levelCompleteUI.setOnMainMenu(() => {
        // 返回主界面
        this._currentSceneType = 'welcome'
        this.createWelcomeScene()
      })

      this._stage.addChild(this._levelCompleteUI.container)
    }

    this._levelCompleteUI.show(data)
  }

  showGameOver(data: GameOverData): void {
    if (!this._stage) return

    if (!this._gameOverUI) {
      this._gameOverUI = new GameOverUI(this._screenWidth, this._screenHeight)
      
      this._gameOverUI.setOnRestart(() => {
        // 重新开始游戏
        const gameApp = (window as any).gameApp
        if (gameApp && gameApp.gameEngine) {
          gameApp.gameEngine.restartLevel()
          const gameState = gameApp.gameEngine.gameState
          if (gameState) {
            this.setGameState(gameState)
          }
        }
      })

      this._gameOverUI.setOnMainMenu(() => {
        // 返回主界面
        this._currentSceneType = 'welcome'
        this.createWelcomeScene()
      })

      this._stage.addChild(this._gameOverUI.container)
    }

    this._gameOverUI.show(data)
  }



  private createEnhancedButton(text: string, x: number, y: number, color: number, onClick: () => void): Container {
    const button = new Container()
    button.x = x
    button.y = y

    // 外圈光晕
    const glow = new Graphics()
    glow.beginFill(color, 0.2)
    glow.drawRoundedRect(-85, -25, 170, 50, 25)
    glow.endFill()
    button.addChild(glow)

    // 主按钮背景
    const bg = new Graphics()
    bg.beginFill(color, 0.8)
    bg.lineStyle(3, 0xffffff, 0.9)
    bg.drawRoundedRect(-80, -20, 160, 40, 20)
    bg.endFill()
    button.addChild(bg)

    // 渐变内层
    const innerGlow = new Graphics()
    innerGlow.beginFill(0xffffff, 0.1)
    innerGlow.drawRoundedRect(-75, -18, 150, 15, 15)
    innerGlow.endFill()
    button.addChild(innerGlow)

    const buttonText = new Text(text, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 18,
      fill: 0xffffff,
      align: 'center',
      fontWeight: 'bold'
    })
    buttonText.anchor.set(0.5)
    button.addChild(buttonText)

    button.interactive = true
    button.cursor = 'pointer'
    
    // 增强的动画效果
    let animationTime = 0
    const animate = () => {
      animationTime += 0.05
      glow.alpha = 0.2 + Math.sin(animationTime) * 0.1
      requestAnimationFrame(animate)
    }
    animate()
    
    button.on('pointerdown', () => {
      button.scale.set(0.95)
      setTimeout(() => {
        button.scale.set(1.0)
        onClick()
      }, 100)
    })
    
    button.on('pointerover', () => {
      bg.tint = 0xdddddd
      button.scale.set(1.05)
      glow.alpha = 0.4
    })
    
    button.on('pointerout', () => {
      bg.tint = 0xffffff
      button.scale.set(1.0)
      glow.alpha = 0.2
    })

    return button
  }

  private showGameModeSelect(): void {
    if (!this._stage) return

    if (!this._gameModeSelectUI) {
      this._gameModeSelectUI = new GameModeSelectUI(this._screenWidth, this._screenHeight)
      this._gameModeSelectUI.setOnModeSelected((mode: GameMode, options?: any) => {
        // 保存选择的游戏模式和选项
        this._selectedGameMode = mode
        this._selectedModeOptions = options
        
        // 隐藏游戏模式选择界面
        this._gameModeSelectUI?.hide()
        
        // 显示难度选择界面
        this.showDifficultySelect()
      })
      
      this._gameModeSelectUI.setOnBackToMain(() => {
        // 返回主界面
        this._gameModeSelectUI?.hide()
        this._currentSceneType = 'welcome'
        this.createWelcomeScene()
      })
      
      this._stage.addChild(this._gameModeSelectUI.container)
    }

    this._gameModeSelectUI.show()
  }

  private showDifficultySelect(): void {
    if (!this._stage) return

    if (!this._difficultySelectUI) {
      this._difficultySelectUI = new DifficultySelectUI(this._screenWidth, this._screenHeight)
      this._difficultySelectUI.setOnDifficultySelected((difficulty: DifficultyOption) => {
        // 隐藏难度选择界面
        this._difficultySelectUI?.hide()
        
        // 应用难度设置并启动游戏
        if (this._selectedGameMode && this._onModeSelectedCallback) {
          const finalOptions = {
            ...this._selectedModeOptions,
            difficulty: difficulty
          }
          this._onModeSelectedCallback(this._selectedGameMode, finalOptions)
        }
        
        // 启动游戏
        this.startGame()
      })
      
      this._difficultySelectUI.setOnBackToModeSelect(() => {
        // 返回游戏模式选择界面
        this._difficultySelectUI?.hide()
        this._gameModeSelectUI?.show()
      })
      
      this._stage.addChild(this._difficultySelectUI.container)
    }

    this._difficultySelectUI.show()
  }

  private drawGameBoard(container: Graphics, width: number, height: number, cellSize: number): void {
    container.clear()
    
    // 背景
    container.beginFill(0x1a1a1a, 0.9)
    container.lineStyle(2, 0x00d4ff, 1)
    container.drawRect(0, 0, width, height)
    container.endFill()

    // 网格线
    container.lineStyle(1, 0x333333, 0.5)
    
    // 垂直线
    for (let x = 0; x <= 10; x++) {
      container.moveTo(x * cellSize, 0)
      container.lineTo(x * cellSize, height)
    }

    // 水平线
    for (let y = 0; y <= 10; y++) {
      container.moveTo(0, y * cellSize)
      container.lineTo(width, y * cellSize)
    }
  }

  private createCandidateArea(container: Container, cellSize: number): void {
    container.removeChildren()

    const layoutConfig = this._mobileLayoutConfig
    const fontSize = layoutConfig ? layoutConfig.fontSize : { small: 16, medium: 18, large: 24 }
    const spacing = layoutConfig ? layoutConfig.spacing : { small: 10, medium: 15, large: 20 }

    // 候选方块标题
    const title = new Text('候选方块', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: fontSize.medium,
      fill: 0x39ff14,
      align: 'center'
    })
    title.anchor.set(0.5)
    
    // 候选方块槽位配置
    const slotSize = cellSize * 3.0  // 调整槽位大小，与方块更好匹配
    
    if (layoutConfig && layoutConfig.candidateArea.direction === 'column') {
      // 横屏布局：垂直排列
      title.x = 0
      title.y = -spacing.large - fontSize.medium / 2  // 调整标题位置，避免与槽位重叠
      container.addChild(title)
      
      for (let i = 0; i < 3; i++) {
        const slotY = i * (slotSize + spacing.medium)
        
        // 槽位背景
        const slot = new Graphics()
        slot.lineStyle(1, 0x666666, 0.8)
        slot.beginFill(0x2a2a2a, 0.5)
        slot.drawRect(-slotSize/2, slotY, slotSize, slotSize)
        slot.endFill()
        container.addChild(slot)
      }
    } else {
      // 竖屏布局：水平排列
      title.x = 0
      title.y = -spacing.large - fontSize.medium / 2  // 调整标题位置，避免与槽位重叠
      container.addChild(title)

      for (let i = 0; i < 3; i++) {
        const slotX = (i - 1) * (slotSize + spacing.medium)
        
        // 槽位背景 - Y位置与方块位置对齐
        const slot = new Graphics()
        slot.lineStyle(1, 0x666666, 0.8)
        slot.beginFill(0x2a2a2a, 0.5)
        slot.drawRect(slotX - slotSize/2, 0, slotSize, slotSize)
        slot.endFill()
        container.addChild(slot)
      }
    }
  }

  private updateGameDisplay(): void {
    if (!this._gameState || !this._gameBoard || !this._candidateArea || !this._scoreText) return

    // 更新分数和关卡显示
    const level = this._gameState.board.level
    const score = this._gameState.board.score
    
    // 获取关卡配置以显示目标分数
    const gameApp = (window as any).gameApp // 临时方案获取gameApp
    if (gameApp && gameApp.gameEngine) {
      const levelConfig = gameApp.gameEngine.levelManager.getCurrentLevelConfig()
      if (levelConfig) {
        this._scoreText.text = `Score: ${score} / ${levelConfig.targetScore}`
        // 更新关卡文本
        const levelTextNode = this._scoreText.parent.children.find(child => 
          child instanceof Text && child.text.startsWith('Level:')
        ) as Text
        if (levelTextNode) {
          levelTextNode.text = `Level: ${level}`
        }
      } else {
        this._scoreText.text = `Score: ${score}`
      }
    } else {
      this._scoreText.text = `Score: ${score}`
    }

    // 使用与创建时相同的cellSize计算逻辑
    const layoutConfig = this._mobileLayoutConfig
    let cellSize: number
    if (layoutConfig) {
      cellSize = layoutConfig.cellSize
    } else {
      cellSize = Math.min(35, Math.min(this._screenWidth, this._screenHeight) / 20)
    }
    
    const boardWidth = cellSize * 10
    const boardHeight = cellSize * 10
    
    this.drawGameBoard(this._gameBoard, boardWidth, boardHeight, cellSize)
    
    // 绘制已放置的方块
    this.drawPlacedBlocks(this._gameBoard, cellSize)

    // 更新候选方块显示
    this.updateCandidateBlocks(this._candidateArea, cellSize)
  }

  private drawPlacedBlocks(container: Graphics, cellSize: number): void {
    if (!this._gameState) return

    const board = this._gameState.board
    
    // 绘制已填充的格子
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        if (board.grid[y][x] === 1) { // FILLED
          container.beginFill(0x00d4ff, 0.8)
          container.drawRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2)
          container.endFill()
        }
      }
    }
  }

  private updateCandidateBlocks(container: Container, cellSize: number): void {
    if (!this._gameState) return

    // 移除旧的方块显示
    const existingBlocks = container.children.filter(child => child.name === 'candidateBlock')
    existingBlocks.forEach(block => container.removeChild(block))

    const layoutConfig = this._mobileLayoutConfig
    const spacing = layoutConfig ? layoutConfig.spacing : { small: 10, medium: 15, large: 20 }
    const slotSize = cellSize * 3.0  // 与createCandidateArea保持一致

    // 绘制新的候选方块
    this._gameState.candidateBlocks.forEach((block, index) => {
      if (index < 3) {
        let slotX: number, slotY: number
        
        if (layoutConfig && layoutConfig.candidateArea.direction === 'column') {
          // 横屏布局：垂直排列
          slotX = 0
          slotY = index * (slotSize + spacing.medium) + slotSize / 2
        } else {
          // 竖屏布局：水平排列
          slotX = (index - 1) * (slotSize + spacing.medium)
          slotY = slotSize / 2  // 槽位中心位置
        }
        
        this.drawCandidateBlock(container, block, slotX, slotY, cellSize)
      }
    })
  }

  private initializeDragManager(cellSize: number): void {
    if (!this._stage) return

    const dragCallbacks: DragManagerCallbacks = {
      onBlockPlaced: (block: Block, gridX: number, gridY: number) => {
        if (this._onBlockPlacedCallback) {
          const success = this._onBlockPlacedCallback(block, gridX, gridY)
          if (success) {
            // 更新显示
            this.updateGameDisplay()
          }
          return success
        }
        return false
      },
      canPlaceBlock: (pattern: number[][], gridX: number, gridY: number) => {
        if (this._canPlaceBlockCallback) {
          return this._canPlaceBlockCallback(pattern, gridX, gridY)
        }
        return true
      },
      onDragStart: (block: Block) => {
        console.log(`🚀 Started dragging: ${block.shape.name}`)
      },
      onDragEnd: () => {
        console.log('🎯 Drag ended')
      }
    }

    this._dragManager = new DragManager(this._stage, dragCallbacks)
    
    // 设置游戏板信息
    if (this._gameBoard) {
      this._dragManager.setGameBoard(
        this._gameBoard,
        cellSize,
        this._gameBoard.x,
        this._gameBoard.y
      )
    }
  }

  private drawCandidateBlock(container: Container, block: Block, centerX: number, centerY: number, cellSize: number): void {
    const blockContainer = new Container()
    blockContainer.name = 'candidateBlock'
    
    // 设置容器位置为槽位中心
    blockContainer.x = centerX
    blockContainer.y = centerY
    
    const pattern = block.shape.pattern
    const patternWidth = pattern[0].length
    const patternHeight = pattern.length
    
    // 计算方块的绘制大小 
    const cellDisplaySize = cellSize * 0.6  // 适当缩小以适应槽位
    const blockWidth = patternWidth * cellDisplaySize
    const blockHeight = patternHeight * cellDisplaySize
    
    // 计算起始位置（相对于容器中心）
    const startX = -blockWidth / 2
    const startY = -blockHeight / 2

    const blockGraphics = new Graphics()
    
    // 绘制方块（相对于容器坐标系）
    for (let y = 0; y < patternHeight; y++) {
      for (let x = 0; x < patternWidth; x++) {
        if (pattern[y][x] === 1) {
          // 解析颜色
          const color = parseInt(block.shape.color.replace('#', ''), 16)
          blockGraphics.beginFill(color, 0.9)
          blockGraphics.lineStyle(1, 0xffffff, 0.3)
          blockGraphics.drawRect(
            startX + x * cellDisplaySize,
            startY + y * cellDisplaySize,
            cellDisplaySize - 1,
            cellDisplaySize - 1
          )
          blockGraphics.endFill()
        }
      }
    }
    
    blockContainer.addChild(blockGraphics)
    
    // 使方块可交互
    blockContainer.interactive = true
    blockContainer.cursor = 'pointer'
    
    // 添加拖拽事件
    blockContainer.on('pointerdown', (event) => {
      console.log(`🎯 Starting drag for block: ${block.id}`)
      
      if (this._dragManager) {
        // 获取全局位置
        const globalPos = event.data.global
        this._dragManager.startDrag(block, new Point(globalPos.x, globalPos.y))
      }
    })
    
    // 调试边框已移除 - 位置调整完成后不再需要
    
    container.addChild(blockContainer)
  }

  private createCurrentSettingsDisplay(container: Container, y: number): void {
    // 获取当前设置
    const gameApp = (window as any).gameApp
    let modeText = '未选择'
    let difficultyText = '未选择'
    let modeColor = 0x666666
    let difficultyColor = 0x666666
    let isComplete = false

    if (this._selectedGameMode) {
      switch (this._selectedGameMode) {
        case GameMode.CLASSIC:
          modeText = '经典模式 ♾️'
          modeColor = 0x00d4ff
          break
        case GameMode.LEVEL:
          modeText = '关卡模式 🏆'
          modeColor = 0x39ff14
          break
        case GameMode.TIMED:
          const timeLimit = this._selectedModeOptions?.timeLimit
          const timeStr = timeLimit ? `${timeLimit / 60}分钟` : '未设置'
          modeText = `限时挑战 ⏰ (${timeStr})`
          modeColor = 0xff4444
          break
        case GameMode.DAILY:
          modeText = '每日挑战 📅'
          modeColor = 0xffaa00
          break
      }
    }

    if (gameApp?.gameEngine?.currentDifficulty) {
      const difficulty = gameApp.gameEngine.currentDifficulty
      difficultyText = `${difficulty.icon} ${difficulty.name}`
      difficultyColor = difficulty.color
    }

    // 检查是否完成设置
    isComplete = this._selectedGameMode !== null && gameApp?.gameEngine?.currentDifficulty !== null

    // 当前设置容器
    const settingsContainer = new Container()
    settingsContainer.y = y

    // 背景颜色根据完成状态变化
    const bgColor = isComplete ? 0x1a3a1a : 0x1a1a1a
    const borderColor = isComplete ? 0x39ff14 : 0x333333

    const settingsBg = new Graphics()
    settingsBg.beginFill(bgColor, 0.7)
    settingsBg.lineStyle(1, borderColor, 0.8)
    settingsBg.drawRoundedRect(-180, -35, 360, 70, 10)
    settingsBg.endFill()
    settingsContainer.addChild(settingsBg)

    // 标题
    const titleText = new Text(isComplete ? '✅ 设置完成' : '⚙️ 当前设置', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(14, this._screenWidth / 70),
      fill: isComplete ? 0x39ff14 : 0xcccccc,
      align: 'center'
    })
    titleText.anchor.set(0.5)
    titleText.y = -25
    settingsContainer.addChild(titleText)

    // 模式显示
    const currentModeText = new Text(`模式: ${modeText}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(12, this._screenWidth / 80),
      fill: modeColor,
      align: 'center'
    })
    currentModeText.anchor.set(0.5)
    currentModeText.y = -8
    settingsContainer.addChild(currentModeText)

    // 难度显示
    const currentDifficultyText = new Text(`难度: ${difficultyText}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(12, this._screenWidth / 80),
      fill: difficultyColor,
      align: 'center'
    })
    currentDifficultyText.anchor.set(0.5)
    currentDifficultyText.y = 8
    settingsContainer.addChild(currentDifficultyText)

    container.addChild(settingsContainer)
  }

  private createGameModeDisplay(container: Container, x: number, y: number): void {
    // 获取当前设置
    const gameApp = (window as any).gameApp
    let modeText = '未选择'
    let difficultyText = '未选择'
    let modeColor = 0x666666
    let difficultyColor = 0x666666

    if (this._selectedGameMode) {
      switch (this._selectedGameMode) {
        case GameMode.CLASSIC:
          modeText = '经典模式 ♾️'
          modeColor = 0x00d4ff
          break
        case GameMode.LEVEL:
          modeText = '关卡模式 🏆'
          modeColor = 0x39ff14
          break
        case GameMode.TIMED:
          const timeLimit = this._selectedModeOptions?.timeLimit
          const timeStr = timeLimit ? `${timeLimit / 60}分钟` : '未设置'
          modeText = `限时挑战 ⏰ (${timeStr})`
          modeColor = 0xff4444
          break
        case GameMode.DAILY:
          modeText = '每日挑战 📅'
          modeColor = 0xffaa00
          break
      }
    }

    if (gameApp?.gameEngine?.currentDifficulty) {
      const difficulty = gameApp.gameEngine.currentDifficulty
      difficultyText = `${difficulty.icon} ${difficulty.name}`
      difficultyColor = difficulty.color
    }

    // 游戏模式和难度显示容器
    const gameModeDisplay = new Container()
    gameModeDisplay.x = x
    gameModeDisplay.y = y

    // 背景 - 更紧凑的高度
    const gameModeBg = new Graphics()
    gameModeBg.beginFill(0x1a1a1a, 0.7)
    gameModeBg.lineStyle(1, 0x333333, 0.8)
    gameModeBg.drawRoundedRect(-180, -20, 360, 40, 8)
    gameModeBg.endFill()
    gameModeDisplay.addChild(gameModeBg)

    // 左侧模式显示
    const currentModeText = new Text(`模式: ${modeText}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(11, this._screenWidth / 85),
      fill: modeColor,
      align: 'center'
    })
    currentModeText.anchor.set(0.5)
    currentModeText.x = -90
    currentModeText.y = 0
    gameModeDisplay.addChild(currentModeText)

    // 右侧难度显示
    const currentDifficultyText = new Text(`难度: ${difficultyText}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: Math.min(11, this._screenWidth / 85),
      fill: difficultyColor,
      align: 'center'
    })
    currentDifficultyText.anchor.set(0.5)
    currentDifficultyText.x = 90
    currentDifficultyText.y = 0
    gameModeDisplay.addChild(currentDifficultyText)

    container.addChild(gameModeDisplay)
  }
} 