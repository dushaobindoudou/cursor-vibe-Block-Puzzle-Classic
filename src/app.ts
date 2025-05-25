import { Application } from 'pixi.js'
import { GameEngine } from './core/engine/GameEngine'
import { SceneManager } from './game/scenes/SceneManager'
import { InputManager, InputEventCallbacks } from './core/input/InputManager'
import { AudioManager } from './core/audio/AudioManager'
import { EffectManager } from './game/effects/EffectManager'
import { MobileAdapter } from './utils/MobileAdapter'
import { GameState } from './types/game'

export class GameApp {
  private app: Application
  private gameEngine: GameEngine
  private sceneManager: SceneManager
  private inputManager: InputManager
  private audioManager: AudioManager
  private effectManager: EffectManager
  private mobileAdapter: MobileAdapter
  private screenWidth: number
  private screenHeight: number
  private gameStarted = false

  constructor(config?: any) {
    console.log('GameApp constructor start')
    
    // 初始化移动端适配器
    this.mobileAdapter = MobileAdapter.getInstance()
    this.mobileAdapter.optimizeTouchEvents()
    
    // 获取适配后的配置
    const deviceInfo = this.mobileAdapter.getDeviceInfo()
    const rendererConfig = this.mobileAdapter.getRendererConfig()
    
    // 合并配置
    const finalConfig = {
      width: deviceInfo.screenWidth,
      height: deviceInfo.screenHeight,
      ...rendererConfig,
      ...config
    }
    
    this.app = new Application(finalConfig)
    this.screenWidth = finalConfig.width
    this.screenHeight = finalConfig.height
    
    this.gameEngine = new GameEngine()
    this.sceneManager = new SceneManager()
    this.inputManager = new InputManager()
    this.audioManager = new AudioManager()
    this.effectManager = new EffectManager(this.app.stage)
    
    // 监听移动端布局变化
    this.setupMobileLayoutListener()
    
    console.log(`📱 Game app initialized for ${this.mobileAdapter.isMobile() ? 'mobile' : this.mobileAdapter.isTablet() ? 'tablet' : 'desktop'} device`)
    console.log('GameApp constructor end')
  }

  async init(canvas?: HTMLCanvasElement): Promise<void> {
    try {
      // 将canvas添加到DOM
      const appElement = document.getElementById('app')
      if (appElement) {
        // 清空加载内容
        appElement.innerHTML = ''
        
        // 如果传入了canvas则使用，否则使用app自带的view
        const gameCanvas = canvas || (this.app.view as HTMLCanvasElement)
        appElement.appendChild(gameCanvas)
        
        // 移动端优化
        this.optimizeForMobile(gameCanvas)
      }

      // 初始化各个管理器
      await this.initializeManagers()

      // 启动游戏循环
      this.startGameLoop()

      console.log('✅ Game initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize game:', error)
      throw error
    }
  }

  private optimizeForMobile(canvas: HTMLCanvasElement): void {
    // 设置canvas样式
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.touchAction = 'none'
    
    // 移动端特定优化
    if (this.mobileAdapter.isMobile()) {
      canvas.style.imageRendering = 'pixelated' // 改善像素渲染
      canvas.style.webkitUserSelect = 'none'
      canvas.style.userSelect = 'none'
      
      // 添加视口元标签优化
      this.updateViewportMeta()
    }
  }

  private updateViewportMeta(): void {
    let viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) {
      viewport = document.createElement('meta')
      viewport.setAttribute('name', 'viewport')
      document.head.appendChild(viewport)
    }
    
    const content = [
      'width=device-width',
      'initial-scale=1.0',
      'maximum-scale=1.0',
      'minimum-scale=1.0',
      'user-scalable=no',
      'viewport-fit=cover'
    ].join(', ')
    
    viewport.setAttribute('content', content)
  }

  private setupMobileLayoutListener(): void {
    window.addEventListener('mobileLayoutChange', ((event: CustomEvent) => {
      const { deviceInfo, layoutConfig } = event.detail
      console.log('📱 Mobile layout changed:', deviceInfo)
      
      // 更新屏幕尺寸
      this.resize(deviceInfo.screenWidth, deviceInfo.screenHeight)
      
      // 重新配置场景管理器
      this.sceneManager.updateMobileLayout(layoutConfig)
    }) as EventListener)
  }

  private async initializeManagers(): Promise<void> {
    console.log('initializeManagers start')
    
    // 初始化音频管理器
    await this.audioManager.init()
    console.log('initializeManagers audioManager end')
    
    // 创建输入事件回调
    const inputCallbacks: InputEventCallbacks = {
      onSpacePressed: () => this.handleSpacePressed(),
      onEscapePressed: () => this.handleEscapePressed(),
      onCanvasClick: (x, y) => this.handleCanvasClick(x, y),
      onMouseMove: (x, y) => this.handleMouseMove(x, y)
    }
    
    // 初始化输入管理器，传递音频管理器和回调
    this.inputManager.init(this.app.view as HTMLCanvasElement, this.audioManager, inputCallbacks)
    console.log('initializeManagers inputManager end')
    
    // 初始化场景管理器，传递屏幕尺寸和移动端配置
    const layoutConfig = this.mobileAdapter.getLayoutConfig()
    this.sceneManager.init(this.app.stage, this.screenWidth, this.screenHeight, layoutConfig)
    console.log('initializeManagers sceneManager end')
    
    // 初始化游戏引擎
    this.gameEngine.init()
    
    // 连接特效管理器到游戏引擎
    this.gameEngine.setEffectManager(this.effectManager)
    
    // 设置场景管理器的回调
    this.setupSceneManagerCallbacks()
    
    console.log('initializeManagers end')
  }

  private setupSceneManagerCallbacks(): void {
    // 设置方块放置回调
    this.sceneManager.setBlockPlacedCallback((block, gridX, gridY) => {
      console.log(`🎯 Attempting to place block ${block.id} at (${gridX}, ${gridY})`)
      
      // 调用游戏引擎的放置方法
      const success = this.gameEngine.placeBlock(block.shape.pattern, gridX, gridY, block.id)
      
      if (success) {
        console.log(`✅ Block placed successfully!`)
        // 播放成功音效
        if (this.audioManager.isAudioReady) {
          this.audioManager.playSuccessSound()
        }
        
        // 更新场景管理器的游戏状态
        const updatedGameState = this.gameEngine.gameState
        if (updatedGameState) {
          this.sceneManager.setGameState(updatedGameState)
        }
      } else {
        console.log(`❌ Cannot place block at this position`)
        // 播放失败音效
        if (this.audioManager.isAudioReady) {
          this.audioManager.playClickSound()
        }
      }
      
      return success
    })

    // 设置方块放置验证回调
    this.sceneManager.setCanPlaceBlockCallback((pattern, gridX, gridY) => {
      return this.gameEngine.canPlaceBlock(pattern, gridX, gridY)
    })

    // 设置游戏模式选择回调 - 这是启动游戏的唯一正确方式
    this.sceneManager.setOnModeSelectedCallback((mode, options) => {
      console.log(`🎮 Mode selected: ${mode}`, options)
      this.gameEngine.switchGameMode(mode, options)
      
      // 标记游戏已开始（通过正确流程）
      this.gameStarted = true
      
      // 将游戏状态传递给场景管理器
      const gameState = this.gameEngine.gameState
      if (gameState) {
        this.sceneManager.setGameState(gameState)
        console.log('🎯 Game state loaded with candidate blocks:', gameState.candidateBlocks.length)
      }
      
      if (this.audioManager.isAudioReady) {
        this.audioManager.playSuccessSound()
      }
    })
  }

  private startGameLoop(): void {
    this.app.ticker.add((deltaTime) => {
      // 更新游戏引擎
      this.gameEngine.update(deltaTime)

      // 更新场景管理器
      this.sceneManager.update(deltaTime)

      // 更新输入管理器
      this.inputManager.update()
    })
  }

  get gameState(): GameState | null {
    return this.gameEngine.gameState
  }

  get pixiApp(): Application {
    return this.app
  }

  resize(width: number, height: number): void {
    this.screenWidth = width
    this.screenHeight = height
    this.app.renderer.resize(width, height)
    this.sceneManager.resize(width, height)
  }

  getGameEngine(): GameEngine {
    return this.gameEngine
  }

  private handleSpacePressed(): void {
    if (!this.gameStarted) {
      console.log('🎮 请使用界面按钮选择游戏模式和难度来开始游戏')
      // 不再直接启动游戏，必须通过UI流程
      return
    } else {
      console.log('⏸️ Toggling pause...')
      // 这里可以添加暂停/继续逻辑
    }
  }

  private handleEscapePressed(): void {
    if (this.gameStarted) {
      console.log('⏸️ Pausing game...')
      // 这里可以添加暂停逻辑
    } else {
      console.log('🚪 Showing menu...')
      // 这里可以添加菜单逻辑
    }
  }

  private handleCanvasClick(x: number, y: number): void {
    console.log(`🎯 Canvas clicked at (${x}, ${y})`)
    
    if (!this.gameStarted) {
      // 如果游戏未开始，提示用户使用正确流程
      console.log('🎮 请点击"进入游戏"按钮选择模式和难度后开始游戏')
      return
    } else {
      // 处理游戏中的点击逻辑
      console.log('🎲 Processing game click...')
      // 这里可以处理方块放置逻辑
    }
  }

  private handleMouseMove(x: number, y: number): void {
    // 可以在这里添加鼠标悬停效果
    // 为了避免过多的日志，这里不打印鼠标移动
  }

  destroy(): void {
    this.app.destroy(true)
    this.gameEngine.destroy()
    this.sceneManager.destroy()
    this.inputManager.destroy()
    this.audioManager.destroy()
  }
} 