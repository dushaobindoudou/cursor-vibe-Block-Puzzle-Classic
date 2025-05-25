# 开发环境搭建指南

## 1. 技术选型最终确定

### 1.1 核心技术栈

#### 渲染引擎：PixiJS v7.x（强烈推荐）
```bash
# 为什么选择PixiJS？
- WebGL 2.0支持，性能卓越
- 内置粒子系统和滤镜效果
- 对2D游戏优化极佳
- 丰富的插件生态
- TypeScript支持完善
```

#### 开发工具链
- **语言**：TypeScript 5.0+
- **构建工具**：Vite 4.x
- **包管理器**：pnpm（推荐）/ npm
- **代码规范**：ESLint + Prettier
- **版本控制**：Git + Husky（pre-commit hooks）

#### 状态管理：Zustand
```bash
# 为什么选择Zustand？
- 轻量化（2.9kb gzipped）
- TypeScript友好
- 无样板代码
- 适合游戏状态管理
```

## 2. 项目结构设计

```
block-puzzle-game/
├── public/                     # 静态资源
│   ├── index.html
│   ├── manifest.json          # PWA配置
│   ├── icons/                 # 应用图标
│   └── assets/                # 游戏资源
│       ├── images/            # 图片资源
│       ├── audio/             # 音频资源
│       └── fonts/             # 字体文件
├── src/                       # 源代码
│   ├── main.ts               # 入口文件
│   ├── app.ts                # 应用主类
│   ├── core/                 # 核心游戏引擎
│   │   ├── engine/           # 游戏引擎
│   │   ├── renderer/         # 渲染系统
│   │   ├── input/            # 输入处理
│   │   ├── audio/            # 音频系统
│   │   └── utils/            # 工具类
│   ├── game/                 # 游戏逻辑
│   │   ├── scenes/           # 游戏场景
│   │   ├── entities/         # 游戏实体
│   │   ├── systems/          # 游戏系统
│   │   └── components/       # 游戏组件
│   ├── ui/                   # 用户界面
│   │   ├── components/       # UI组件
│   │   ├── styles/           # 样式文件
│   │   └── layouts/          # 布局组件
│   ├── data/                 # 数据管理
│   │   ├── stores/           # 状态存储
│   │   ├── models/           # 数据模型
│   │   └── api/              # 网络请求
│   ├── assets/               # 源码资源
│   │   ├── shaders/          # 着色器
│   │   ├── animations/       # 动画配置
│   │   └── configs/          # 配置文件
│   └── types/                # TypeScript类型定义
├── tools/                    # 开发工具
│   ├── build/                # 构建脚本
│   ├── deploy/               # 部署脚本
│   └── assets/               # 资源处理工具
├── tests/                    # 测试文件
│   ├── unit/                 # 单元测试
│   ├── integration/          # 集成测试
│   └── e2e/                  # 端到端测试
├── docs/                     # 项目文档
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## 3. 环境搭建步骤

### 3.1 系统要求
- Node.js 18+ 
- pnpm 8+ (推荐) 或 npm 9+
- Git 2.30+
- VS Code (推荐编辑器)

### 3.2 项目初始化

#### Step 1: 创建项目
```bash
# 创建项目目录
mkdir block-puzzle-game
cd block-puzzle-game

# 初始化package.json
pnpm init
```

#### Step 2: 安装核心依赖
```bash
# 核心依赖
pnpm add pixi.js@^7.3.0
pnpm add zustand@^4.4.0
pnpm add howler@^2.2.3

# TypeScript相关
pnpm add -D typescript@^5.1.0
pnpm add -D @types/node@^20.0.0

# 构建工具
pnpm add -D vite@^4.4.0
pnpm add -D @vitejs/plugin-legacy@^4.1.0

# 代码规范
pnpm add -D eslint@^8.45.0
pnpm add -D prettier@^3.0.0
pnpm add -D @typescript-eslint/parser@^6.0.0
pnpm add -D @typescript-eslint/eslint-plugin@^6.0.0

# PWA支持
pnpm add -D vite-plugin-pwa@^0.16.0

# 测试框架
pnpm add -D vitest@^0.34.0
pnpm add -D @vitest/ui@^0.34.0
pnpm add -D jsdom@^22.0.0
```

#### Step 3: 配置文件

##### package.json
```json
{
  "name": "block-puzzle-game",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\""
  },
  "dependencies": {
    "pixi.js": "^7.3.0",
    "zustand": "^4.4.0",
    "howler": "^2.2.3"
  },
  "devDependencies": {
    "typescript": "^5.1.0",
    "vite": "^4.4.0",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  }
}
```

##### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "node",
    "strict": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/core/*": ["src/core/*"],
      "@/game/*": ["src/game/*"],
      "@/ui/*": ["src/ui/*"],
      "@/data/*": ["src/data/*"],
      "@/assets/*": ["src/assets/*"],
      "@/types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

##### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Block Puzzle Classic',
        short_name: 'BlockPuzzle',
        description: 'Geek-style Tetris puzzle game',
        theme_color: '#00d4ff',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/game': resolve(__dirname, 'src/game'),
      '@/ui': resolve(__dirname, 'src/ui'),
      '@/data': resolve(__dirname, 'src/data'),
      '@/assets': resolve(__dirname, 'src/assets'),
      '@/types': resolve(__dirname, 'src/types')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['pixi.js'],
          ui: ['zustand'],
          audio: ['howler']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
```

## 4. 核心代码结构

### 4.1 主入口文件

#### src/main.ts
```typescript
import { Application } from 'pixi.js'
import { GameApp } from './app'
import './ui/styles/global.css'

// 游戏配置
const gameConfig = {
  width: 1024,
  height: 768,
  backgroundColor: 0x0a0a0a,
  antialias: true,
  powerPreference: 'high-performance'
}

// 创建游戏应用
const app = new GameApp(gameConfig)

// 启动游戏
app.init().then(() => {
  console.log('🎮 Block Puzzle Game Started!')
}).catch((error) => {
  console.error('❌ Game initialization failed:', error)
})

// 开发环境热重载支持
if (import.meta.hot) {
  import.meta.hot.accept('./app', (newModule) => {
    if (newModule) {
      app.destroy()
      const newApp = new newModule.GameApp(gameConfig)
      newApp.init()
    }
  })
}
```

#### src/app.ts
```typescript
import { Application, Container } from 'pixi.js'
import { GameEngine } from '@/core/engine/GameEngine'
import { InputManager } from '@/core/input/InputManager'
import { AudioManager } from '@/core/audio/AudioManager'
import { SceneManager } from '@/game/scenes/SceneManager'
import { UIManager } from '@/ui/UIManager'
import { GameState } from '@/data/stores/gameStore'

interface GameConfig {
  width: number
  height: number
  backgroundColor: number
  antialias?: boolean
  powerPreference?: 'high-performance' | 'low-power' | 'default'
}

export class GameApp {
  private app: Application
  private engine: GameEngine
  private inputManager: InputManager
  private audioManager: AudioManager
  private sceneManager: SceneManager
  private uiManager: UIManager

  constructor(config: GameConfig) {
    // 创建PIXI应用
    this.app = new Application({
      width: config.width,
      height: config.height,
      backgroundColor: config.backgroundColor,
      antialias: config.antialias ?? true,
      powerPreference: config.powerPreference ?? 'high-performance',
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    })

    // 初始化管理器
    this.engine = new GameEngine(this.app)
    this.inputManager = new InputManager(this.app.view as HTMLCanvasElement)
    this.audioManager = new AudioManager()
    this.sceneManager = new SceneManager(this.app.stage)
    this.uiManager = new UIManager()
  }

  async init(): Promise<void> {
    try {
      // 将canvas添加到DOM
      document.body.appendChild(this.app.view as HTMLCanvasElement)

      // 初始化各个管理器
      await this.engine.init()
      await this.inputManager.init()
      await this.audioManager.init()
      await this.sceneManager.init()
      await this.uiManager.init()

      // 设置游戏循环
      this.app.ticker.add(this.gameLoop.bind(this))

      // 启动游戏
      this.start()

    } catch (error) {
      console.error('Game initialization failed:', error)
      throw error
    }
  }

  private gameLoop(deltaTime: number): void {
    // 更新游戏引擎
    this.engine.update(deltaTime)
    
    // 更新场景
    this.sceneManager.update(deltaTime)
    
    // 更新UI
    this.uiManager.update(deltaTime)
  }

  private start(): void {
    // 加载主菜单场景
    this.sceneManager.loadScene('MainMenu')
  }

  destroy(): void {
    this.app.destroy(true)
    this.inputManager.destroy()
    this.audioManager.destroy()
  }
}
```

### 4.2 游戏状态管理

#### src/data/stores/gameStore.ts
```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { GameBoard, Block, GameMode } from '@/types/game'

export interface GameState {
  // 游戏状态
  isPlaying: boolean
  isPaused: boolean
  isGameOver: boolean
  gameMode: GameMode
  
  // 游戏数据
  score: number
  level: number
  lines: number
  combo: number
  targetScore: number
  
  // 游戏板面
  board: GameBoard
  candidateBlocks: Block[]
  selectedBlock: Block | null
  
  // 时间相关
  startTime: number
  playTime: number
  lastClearTime: number
}

export interface GameActions {
  // 游戏控制
  startGame: (mode: GameMode) => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  restartGame: () => void
  
  // 游戏操作
  selectBlock: (block: Block) => void
  placeBlock: (x: number, y: number) => boolean
  clearLines: () => number
  updateScore: (points: number) => void
  
  // 状态更新
  updatePlayTime: () => void
  incrementCombo: () => void
  resetCombo: () => void
}

export const useGameStore = create<GameState & GameActions>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    gameMode: GameMode.CLASSIC,
    
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    targetScore: 1000,
    
    board: createEmptyBoard(10, 10),
    candidateBlocks: [],
    selectedBlock: null,
    
    startTime: 0,
    playTime: 0,
    lastClearTime: 0,

    // Actions
    startGame: (mode: GameMode) => set((state) => ({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      gameMode: mode,
      score: 0,
      level: 1,
      lines: 0,
      combo: 0,
      startTime: Date.now(),
      board: createEmptyBoard(10, 10),
      candidateBlocks: generateCandidateBlocks(1, 3)
    })),

    pauseGame: () => set({ isPaused: true }),
    resumeGame: () => set({ isPaused: false }),
    
    endGame: () => set((state) => ({
      isPlaying: false,
      isGameOver: true,
      playTime: Date.now() - state.startTime
    })),

    restartGame: () => {
      const { gameMode } = get()
      get().startGame(gameMode)
    },

    selectBlock: (block: Block) => set({ selectedBlock: block }),

    placeBlock: (x: number, y: number) => {
      const state = get()
      if (!state.selectedBlock) return false

      // 验证放置位置
      if (!canPlaceBlock(state.board, state.selectedBlock, x, y)) {
        return false
      }

      // 放置方块
      const newBoard = placeBlockOnBoard(state.board, state.selectedBlock, x, y)
      
      // 生成新的候选方块
      const newCandidates = state.candidateBlocks.filter(b => b.id !== state.selectedBlock!.id)
      if (newCandidates.length === 0) {
        newCandidates.push(...generateCandidateBlocks(state.level, 3))
      }

      set({
        board: newBoard,
        candidateBlocks: newCandidates,
        selectedBlock: null
      })

      // 检查是否可以消除行列
      const clearedLines = get().clearLines()
      if (clearedLines > 0) {
        get().incrementCombo()
        get().updateScore(calculateScore(clearedLines, state.combo))
      } else {
        get().resetCombo()
      }

      return true
    },

    clearLines: () => {
      const state = get()
      const { newBoard, clearedRows, clearedCols } = clearCompleteLines(state.board)
      const totalCleared = clearedRows.length + clearedCols.length

      if (totalCleared > 0) {
        set({
          board: newBoard,
          lines: state.lines + totalCleared,
          lastClearTime: Date.now()
        })
      }

      return totalCleared
    },

    updateScore: (points: number) => set((state) => ({
      score: state.score + points
    })),

    updatePlayTime: () => set((state) => ({
      playTime: Date.now() - state.startTime
    })),

    incrementCombo: () => set((state) => ({
      combo: state.combo + 1
    })),

    resetCombo: () => set({ combo: 0 })
  }))
)

// 订阅状态变化
useGameStore.subscribe(
  (state) => state.score,
  (score) => {
    // 检查是否升级
    const level = Math.floor(score / 1000) + 1
    if (level !== useGameStore.getState().level) {
      useGameStore.setState({ level })
    }
  }
)

// 辅助函数
function createEmptyBoard(width: number, height: number): GameBoard {
  return {
    width,
    height,
    grid: Array(height).fill(null).map(() => Array(width).fill(0)),
    score: 0,
    level: 1
  }
}

function generateCandidateBlocks(level: number, count: number): Block[] {
  // 实现方块生成逻辑
  return []
}

function canPlaceBlock(board: GameBoard, block: Block, x: number, y: number): boolean {
  // 实现放置验证逻辑
  return true
}

function placeBlockOnBoard(board: GameBoard, block: Block, x: number, y: number): GameBoard {
  // 实现方块放置逻辑
  return board
}

function clearCompleteLines(board: GameBoard) {
  // 实现行列清除逻辑
  return {
    newBoard: board,
    clearedRows: [],
    clearedCols: []
  }
}

function calculateScore(lines: number, combo: number): number {
  return lines * 100 * (combo + 1)
}
```

## 5. 开发工作流

### 5.1 开发命令
```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 5.2 Git工作流
```bash
# 分支命名规范
feature/ui-design      # 新功能
bugfix/render-issue    # Bug修复
hotfix/critical-bug    # 紧急修复
refactor/engine-core   # 重构

# 提交信息规范
feat: 添加方块拖拽功能
fix: 修复消除动画卡顿问题
docs: 更新API文档
style: 优化UI组件样式
refactor: 重构游戏引擎核心
test: 添加单元测试
chore: 更新依赖包
```

### 5.3 性能监控
```typescript
// src/core/utils/Performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }

  startMeasure(label: string): () => number {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.addMetric(label, duration)
      return duration
    }
  }

  addMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(value)
  }

  getAverageMetric(label: string): number {
    const values = this.metrics.get(label) || []
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  logMetrics(): void {
    console.group('🔍 Performance Metrics')
    this.metrics.forEach((values, label) => {
      const avg = this.getAverageMetric(label)
      console.log(`${label}: ${avg.toFixed(2)}ms (${values.length} samples)`)
    })
    console.groupEnd()
  }
}
```

## 6. 部署配置

### 6.1 开发环境部署
```bash
# 本地开发
pnpm dev

# 局域网访问
pnpm dev --host
```

### 6.2 生产环境部署
```bash
# 构建生产版本
pnpm build

# 部署到静态托管服务
# - Vercel
# - Netlify  
# - GitHub Pages
# - 阿里云OSS
```

这份开发环境搭建指南为您提供了完整的HTML5+WebGL游戏开发环境，采用现代化的工具链和最佳实践，确保开发效率和代码质量。 