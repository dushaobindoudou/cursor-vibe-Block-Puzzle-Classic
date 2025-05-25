import { GameApp } from '@/app'
import './ui/styles/global.css'
import './ui/styles/mobile.css'
import { MobileAdapter } from '@/utils/MobileAdapter'

// 初始化移动端适配器
const mobileAdapter = MobileAdapter.getInstance()

// 获取优化后的屏幕尺寸
const getOptimizedScreenSize = () => {
  const deviceInfo = mobileAdapter.getDeviceInfo()
  console.log(`📱 Device detected: ${deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}`)
  console.log(`📐 Screen size: ${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`)
  console.log(`🔄 Orientation: ${deviceInfo.isPortrait ? 'Portrait' : 'Landscape'}`)
  return {
    width: deviceInfo.screenWidth,
    height: deviceInfo.screenHeight
  }
}

// 游戏配置
const screenSize = getOptimizedScreenSize()
const rendererConfig = mobileAdapter.getRendererConfig()

const gameConfig = {
  width: screenSize.width,
  height: screenSize.height,
  backgroundColor: 0x0a0a0a,
  hello: false,
  ...rendererConfig
}

// 创建游戏应用
const app = new GameApp(gameConfig)

// 初始化游戏
async function initGame() {
  try {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve)
      })
    }

    // 移除加载提示
    const loadingElement = document.querySelector('.loading')
    if (loadingElement) {
      loadingElement.remove()
    }

    // 初始化游戏
    await app.init()

    // 设置全局引用
    ;(window as any).gameApp = app

    console.log('🎮 Game initialized successfully')
    
    // 移动端特定优化
    if (mobileAdapter.isMobile()) {
      // 添加移动端特定的事件监听
      setupMobileSpecificFeatures()
    }

  } catch (error) {
    console.error('❌ Failed to initialize game:', error)
    
    // 显示错误信息
    const appElement = document.getElementById('app')
    if (appElement) {
      appElement.innerHTML = `
        <div style="color: #ff4444; text-align: center; padding: 20px;">
          <h2>游戏初始化失败</h2>
          <p>${error instanceof Error ? error.message : '未知错误'}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">重新加载</button>
        </div>
      `
    }
  }
}

// 移动端特定功能设置
function setupMobileSpecificFeatures() {
  // 监听设备方向变化
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      console.log('📱 Orientation changed, updating layout...')
      // 触发布局更新
      const newScreenSize = getOptimizedScreenSize()
      app.resize(newScreenSize.width, newScreenSize.height)
    }, 100)
  })

  // 添加全屏按钮（可选）
  if (mobileAdapter.isMobile()) {
    addFullscreenButton()
  }
  
  // 防止页面滚动
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  
  // 优化触摸延迟
  document.body.style.touchAction = 'none'
}

// 添加全屏按钮
function addFullscreenButton() {
  const fullscreenBtn = document.createElement('button')
  fullscreenBtn.innerHTML = '⛶'
  fullscreenBtn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: rgba(0, 212, 255, 0.8);
    border: none;
    border-radius: 5px;
    color: white;
    padding: 8px 12px;
    font-size: 16px;
    cursor: pointer;
    font-family: monospace;
  `
  
  fullscreenBtn.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await mobileAdapter.requestFullscreen()
        fullscreenBtn.innerHTML = '⛶'
      } else {
        await mobileAdapter.exitFullscreen()
        fullscreenBtn.innerHTML = '⛶'
      }
    } catch (error) {
      console.warn('Fullscreen operation failed:', error)
    }
  })
  
  document.body.appendChild(fullscreenBtn)
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  const newSize = getOptimizedScreenSize()
  app.resize(newSize.width, newSize.height)
  console.log(`🔄 Game resized to: ${newSize.width}x${newSize.height}`)
})

// 启动游戏
initGame()

// 开发环境热重载支持
if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
  console.log('🔥 Development mode enabled')
} 