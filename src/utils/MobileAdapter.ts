/**
 * 移动端适配工具类
 * 负责检测设备类型、屏幕方向，并提供相应的适配方案
 */

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isPortrait: boolean
  isLandscape: boolean
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface GameLayoutConfig {
  cellSize: number
  boardSize: number
  fontSize: {
    small: number
    medium: number
    large: number
  }
  spacing: {
    small: number
    medium: number
    large: number
  }
  candidateArea: {
    width: number
    height: number
    direction: 'row' | 'column'
  }
}

export class MobileAdapter {
  private static instance: MobileAdapter
  private deviceInfo: DeviceInfo
  private layoutConfig: GameLayoutConfig

  private constructor() {
    this.deviceInfo = this.detectDevice()
    this.layoutConfig = this.calculateLayout()
    this.setupEventListeners()
  }

  static getInstance(): MobileAdapter {
    if (!MobileAdapter.instance) {
      MobileAdapter.instance = new MobileAdapter()
    }
    return MobileAdapter.instance
  }

  private detectDevice(): DeviceInfo {
    const width = window.innerWidth
    const height = window.innerHeight
    const devicePixelRatio = window.devicePixelRatio || 1

    // 检测设备类型
    const isMobile = width <= 480 || this.isMobileUserAgent()
    const isTablet = !isMobile && width <= 768
    const isDesktop = !isMobile && !isTablet

    // 检测屏幕方向
    const isPortrait = height > width
    const isLandscape = width > height

    // 获取安全区域信息
    const safeAreaInsets = this.getSafeAreaInsets()

    return {
      isMobile,
      isTablet,
      isDesktop,
      isPortrait,
      isLandscape,
      screenWidth: width,
      screenHeight: height,
      devicePixelRatio,
      safeAreaInsets
    }
  }

  private isMobileUserAgent(): boolean {
    const userAgent = navigator.userAgent.toLowerCase()
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  }

  private getSafeAreaInsets() {
    // 尝试获取CSS环境变量中的安全区域信息
    const testEl = document.createElement('div')
    testEl.style.cssText = `
      position: fixed;
      top: env(safe-area-inset-top);
      right: env(safe-area-inset-right);
      bottom: env(safe-area-inset-bottom);
      left: env(safe-area-inset-left);
      visibility: hidden;
      pointer-events: none;
    `
    document.body.appendChild(testEl)

    const computedStyle = getComputedStyle(testEl)
    const insets = {
      top: parseInt(computedStyle.top) || 0,
      right: parseInt(computedStyle.right) || 0,
      bottom: parseInt(computedStyle.bottom) || 0,
      left: parseInt(computedStyle.left) || 0
    }

    document.body.removeChild(testEl)
    return insets
  }

  private calculateLayout(): GameLayoutConfig {
    const { isMobile, isTablet, isPortrait, screenWidth, screenHeight, safeAreaInsets } = this.deviceInfo

    // 计算可用屏幕空间
    const availableWidth = screenWidth - safeAreaInsets.left - safeAreaInsets.right
    const availableHeight = screenHeight - safeAreaInsets.top - safeAreaInsets.bottom

    let config: GameLayoutConfig

    if (isMobile) {
      if (isPortrait) {
        // 手机竖屏布局
        const boardMaxSize = Math.min(availableWidth - 20, availableHeight * 0.6)
        config = {
          cellSize: Math.floor(boardMaxSize / 10),
          boardSize: boardMaxSize,
          fontSize: {
            small: 10,
            medium: 12,
            large: 16
          },
          spacing: {
            small: 4,
            medium: 8,
            large: 12
          },
          candidateArea: {
            width: availableWidth,
            height: availableHeight * 0.25,
            direction: 'row'
          }
        }
      } else {
        // 手机横屏布局
        const boardMaxSize = Math.min(availableHeight - 20, availableWidth * 0.6)
        config = {
          cellSize: Math.floor(boardMaxSize / 10),
          boardSize: boardMaxSize,
          fontSize: {
            small: 9,
            medium: 11,
            large: 14
          },
          spacing: {
            small: 3,
            medium: 6,
            large: 9
          },
          candidateArea: {
            width: availableWidth * 0.3,
            height: availableHeight,
            direction: 'column'
          }
        }
      }
    } else if (isTablet) {
      // 平板布局
      const boardMaxSize = Math.min(availableWidth * 0.7, availableHeight * 0.7)
      config = {
        cellSize: Math.floor(boardMaxSize / 10),
        boardSize: boardMaxSize,
        fontSize: {
          small: 14,
          medium: 16,
          large: 20
        },
        spacing: {
          small: 8,
          medium: 12,
          large: 16
        },
        candidateArea: {
          width: availableWidth,
          height: availableHeight * 0.2,
          direction: 'row'
        }
      }
    } else {
      // 桌面布局
      config = {
        cellSize: 35,
        boardSize: 350,
        fontSize: {
          small: 16,
          medium: 18,
          large: 24
        },
        spacing: {
          small: 10,
          medium: 15,
          large: 20
        },
        candidateArea: {
          width: 600,
          height: 150,
          direction: 'row'
        }
      }
    }

    return config
  }

  private setupEventListeners(): void {
    // 监听屏幕方向变化
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceInfo = this.detectDevice()
        this.layoutConfig = this.calculateLayout()
        this.notifyLayoutChange()
      }, 100) // 延迟一点等待方向变化完成
    })

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.deviceInfo = this.detectDevice()
      this.layoutConfig = this.calculateLayout()
      this.notifyLayoutChange()
    })

    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => {
        this.deviceInfo = this.detectDevice()
        this.layoutConfig = this.calculateLayout()
        this.notifyLayoutChange()
      }, 100)
    })
  }

  private notifyLayoutChange(): void {
    // 触发自定义事件通知布局变化
    const event = new CustomEvent('mobileLayoutChange', {
      detail: {
        deviceInfo: this.deviceInfo,
        layoutConfig: this.layoutConfig
      }
    })
    window.dispatchEvent(event)
  }

  // 获取当前设备信息
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }

  // 获取当前布局配置
  getLayoutConfig(): GameLayoutConfig {
    return { ...this.layoutConfig }
  }

  // 检查是否为移动设备
  isMobile(): boolean {
    return this.deviceInfo.isMobile
  }

  // 检查是否为平板设备
  isTablet(): boolean {
    return this.deviceInfo.isTablet
  }

  // 检查是否为桌面设备
  isDesktop(): boolean {
    return this.deviceInfo.isDesktop
  }

  // 检查是否为竖屏
  isPortrait(): boolean {
    return this.deviceInfo.isPortrait
  }

  // 检查是否为横屏
  isLandscape(): boolean {
    return this.deviceInfo.isLandscape
  }

  // 获取适合的字体大小
  getFontSize(size: 'small' | 'medium' | 'large'): number {
    return this.layoutConfig.fontSize[size]
  }

  // 获取适合的间距
  getSpacing(size: 'small' | 'medium' | 'large'): number {
    return this.layoutConfig.spacing[size]
  }

  // 获取游戏板配置
  getBoardConfig(): { cellSize: number; boardSize: number } {
    return {
      cellSize: this.layoutConfig.cellSize,
      boardSize: this.layoutConfig.boardSize
    }
  }

  // 获取候选方块区域配置
  getCandidateAreaConfig(): { width: number; height: number; direction: 'row' | 'column' } {
    return { ...this.layoutConfig.candidateArea }
  }

  // 优化触摸事件
  optimizeTouchEvents(): void {
    // 禁用双击缩放
    let lastTouchEnd = 0
    document.addEventListener('touchend', (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }, { passive: false })

    // 禁用长按菜单
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    })

    // 优化滚动
    document.addEventListener('touchmove', (event) => {
      event.preventDefault()
    }, { passive: false })
  }

  // 启用全屏模式
  requestFullscreen(): Promise<void> {
    const element = document.documentElement
    
    if (element.requestFullscreen) {
      return element.requestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
      return (element as any).mozRequestFullScreen()
    } else if ((element as any).webkitRequestFullscreen) {
      return (element as any).webkitRequestFullscreen()
    } else if ((element as any).msRequestFullscreen) {
      return (element as any).msRequestFullscreen()
    }
    
    return Promise.reject(new Error('Fullscreen not supported'))
  }

  // 退出全屏模式
  exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      return document.exitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      return (document as any).mozCancelFullScreen()
    } else if ((document as any).webkitExitFullscreen) {
      return (document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      return (document as any).msExitFullscreen()
    }
    
    return Promise.reject(new Error('Exit fullscreen not supported'))
  }

  // 获取推荐的渲染器设置
  getRendererConfig(): any {
    const { isMobile, devicePixelRatio } = this.deviceInfo
    
    return {
      antialias: !isMobile, // 移动端关闭抗锯齿以提升性能
      powerPreference: isMobile ? 'low-power' : 'high-performance',
      resolution: Math.min(devicePixelRatio, isMobile ? 1 : 2), // 移动端限制分辨率
      preserveDrawingBuffer: false,
      clearBeforeRender: true,
      backgroundColor: 0x0a0a0a
    }
  }
} 