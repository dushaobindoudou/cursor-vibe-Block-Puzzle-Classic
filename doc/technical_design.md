# 俄罗斯方块拼图游戏技术设计文档

## 1. 技术架构概述

### 1.1 总体架构
```
┌─────────────────────────────────────────────────────────┐
│                   前端表现层                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  游戏视图    │ │   UI组件    │ │   动画系统   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│                   游戏逻辑层                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  游戏引擎    │ │   关卡系统   │ │   计分系统   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│                   数据管理层                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  状态管理    │ │   存档系统   │ │   配置管理   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
├─────────────────────────────────────────────────────────┤
│                   平台适配层                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   输入系统   │ │   音频系统   │ │   网络通信   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选择

#### 第一版本：HTML5 + WebGL方案
- **渲染引擎**：PixiJS v7.x （推荐）/ Three.js / Phaser 3
- **开发语言**：TypeScript + JavaScript ES2020+
- **构建工具**：Vite / Webpack 5
- **状态管理**：Redux Toolkit / Zustand （轻量化状态管理）
- **数据存储**：IndexedDB （本地存储）+ Firebase Firestore （云存储）
- **网络通信**：Fetch API + WebSocket （实时功能）
- **音频处理**：Web Audio API + Howler.js
- **PWA支持**：Service Worker + Web App Manifest

#### 后续版本：跨平台扩展
- **移动端**：Capacitor + Ionic （Web转原生）
- **桌面端**：Electron （Web转桌面）
- **小程序**：Taro / uni-app （多端统一）

## 2. 核心数据结构

### 2.1 游戏板面数据结构

```typescript
interface GameBoard {
  width: number;          // 板面宽度
  height: number;         // 板面高度
  grid: CellState[][];    // 二维网格状态
  score: number;          // 当前分数
  level: number;          // 当前关卡
}

enum CellState {
  EMPTY = 0,              // 空格
  FILLED = 1,             // 已填充
  PREVIEW = 2,            // 预览状态
  HIGHLIGHTED = 3,        // 高亮状态
  FROZEN = 4,             // 冰冻状态
  BOMB = 5               // 炸弹状态
}
```

### 2.2 方块形状数据结构

```typescript
interface BlockShape {
  id: string;             // 唯一标识符
  name: string;           // 方块名称
  pattern: number[][];    // 形状模式（二维数组）
  color: string;          // 方块颜色
  rotatable: boolean;     // 是否可旋转
  rarity: number;         // 稀有度（1-5）
}

interface Block {
  shape: BlockShape;      // 方块形状
  x: number;              // X坐标
  y: number;              // Y坐标
  rotation: number;       // 旋转角度（0, 90, 180, 270）
}
```

### 2.3 游戏状态数据结构

```typescript
interface GameState {
  board: GameBoard;               // 游戏板面
  candidateBlocks: Block[];       // 候选方块列表
  selectedBlock: Block | null;    // 当前选中的方块
  gameMode: GameMode;             // 游戏模式
  isGameOver: boolean;            // 游戏是否结束
  isPaused: boolean;              // 游戏是否暂停
  combo: number;                  // 连击数
  lastClearTime: number;          // 上次清除时间
}

enum GameMode {
  CLASSIC = 'classic',            // 经典模式
  LEVEL = 'level',                // 关卡模式
  TIMED = 'timed',                // 限时模式
  DAILY = 'daily'                 // 每日挑战
}
```

## 3. 核心算法设计

### 3.1 方块放置验证算法

```typescript
class PlacementValidator {
  /**
   * 验证方块是否可以放置在指定位置
   */
  static canPlaceBlock(
    board: GameBoard, 
    block: Block, 
    targetX: number, 
    targetY: number
  ): boolean {
    const pattern = this.getRotatedPattern(block.shape.pattern, block.rotation);
    
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] === 1) {
          const boardX = targetX + col;
          const boardY = targetY + row;
          
          // 检查边界
          if (boardX < 0 || boardX >= board.width || 
              boardY < 0 || boardY >= board.height) {
            return false;
          }
          
          // 检查是否已被占用
          if (board.grid[boardY][boardX] !== CellState.EMPTY) {
            return false;
          }
        }
      }
    }
    
    return true;
  }
  
  /**
   * 获取旋转后的方块模式
   */
  private static getRotatedPattern(
    pattern: number[][], 
    rotation: number
  ): number[][] {
    // 实现方块旋转逻辑
    let rotated = pattern;
    const rotations = rotation / 90;
    
    for (let i = 0; i < rotations; i++) {
      rotated = this.rotateMatrix90(rotated);
    }
    
    return rotated;
  }
  
  private static rotateMatrix90(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated: number[][] = [];
    
    for (let col = 0; col < cols; col++) {
      rotated[col] = [];
      for (let row = rows - 1; row >= 0; row--) {
        rotated[col][cols - 1 - row] = matrix[row][col];
      }
    }
    
    return rotated;
  }
}
```

### 3.2 行列清除算法

```typescript
class LineClearing {
  /**
   * 检查并清除完整的行和列
   */
  static clearCompleteLines(board: GameBoard): ClearResult {
    const clearedRows: number[] = [];
    const clearedCols: number[] = [];
    
    // 检查完整行
    for (let row = 0; row < board.height; row++) {
      if (this.isRowComplete(board, row)) {
        clearedRows.push(row);
      }
    }
    
    // 检查完整列
    for (let col = 0; col < board.width; col++) {
      if (this.isColComplete(board, col)) {
        clearedCols.push(col);
      }
    }
    
    // 执行清除
    this.clearRows(board, clearedRows);
    this.clearCols(board, clearedCols);
    
    return {
      clearedRows,
      clearedCols,
      score: this.calculateScore(clearedRows, clearedCols),
      isCombo: clearedRows.length > 0 && clearedCols.length > 0
    };
  }
  
  private static isRowComplete(board: GameBoard, row: number): boolean {
    for (let col = 0; col < board.width; col++) {
      if (board.grid[row][col] === CellState.EMPTY) {
        return false;
      }
    }
    return true;
  }
  
  private static isColComplete(board: GameBoard, col: number): boolean {
    for (let row = 0; row < board.height; row++) {
      if (board.grid[row][col] === CellState.EMPTY) {
        return false;
      }
    }
    return true;
  }
}

interface ClearResult {
  clearedRows: number[];
  clearedCols: number[];
  score: number;
  isCombo: boolean;
}
```

### 3.3 游戏结束检测算法

```typescript
class GameOverDetector {
  /**
   * 检测游戏是否结束
   */
  static isGameOver(board: GameBoard, candidateBlocks: Block[]): boolean {
    // 遍历所有候选方块
    for (const block of candidateBlocks) {
      // 检查是否有任何位置可以放置这个方块
      if (this.hasValidPlacement(board, block)) {
        return false; // 找到可放置位置，游戏继续
      }
    }
    
    return true; // 没有找到任何可放置位置，游戏结束
  }
  
  private static hasValidPlacement(board: GameBoard, block: Block): boolean {
    // 遍历板面上的每个位置
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        // 如果可以旋转，检查所有旋转角度
        const rotations = block.shape.rotatable ? [0, 90, 180, 270] : [0];
        
        for (const rotation of rotations) {
          const testBlock = { ...block, rotation };
          if (PlacementValidator.canPlaceBlock(board, testBlock, x, y)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
}
```

### 3.4 方块生成算法

```typescript
class BlockGenerator {
  private static readonly SHAPE_POOL: BlockShape[] = [
    // 定义所有可能的方块形状
  ];
  
  /**
   * 生成候选方块列表
   */
  static generateCandidateBlocks(level: number, count: number = 3): Block[] {
    const blocks: Block[] = [];
    
    for (let i = 0; i < count; i++) {
      const shape = this.selectShapeByLevel(level);
      blocks.push({
        shape,
        x: 0,
        y: 0,
        rotation: 0
      });
    }
    
    return blocks;
  }
  
  private static selectShapeByLevel(level: number): BlockShape {
    // 根据关卡等级调整方块复杂度
    const availableShapes = this.SHAPE_POOL.filter(shape => {
      const maxRarity = Math.min(5, Math.floor(level / 10) + 1);
      return shape.rarity <= maxRarity;
    });
    
    // 加权随机选择
    return this.weightedRandomSelect(availableShapes);
  }
  
  private static weightedRandomSelect(shapes: BlockShape[]): BlockShape {
    // 实现加权随机选择逻辑
    const weights = shapes.map(shape => 6 - shape.rarity); // 稀有度越高，权重越低
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < shapes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return shapes[i];
      }
    }
    
    return shapes[shapes.length - 1]; // 兜底返回
  }
}
```

## 4. 性能优化策略

### 4.1 渲染优化

```typescript
class RenderOptimizer {
  private static dirtyRegions: Set<string> = new Set();
  
  /**
   * 标记脏区域，只重绘变化的部分
   */
  static markDirtyRegion(x: number, y: number, width: number, height: number) {
    const key = `${x},${y},${width},${height}`;
    this.dirtyRegions.add(key);
  }
  
  /**
   * 批量更新渲染
   */
  static batchRender(canvas: HTMLCanvasElement) {
    if (this.dirtyRegions.size === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    // 只重绘脏区域
    this.dirtyRegions.forEach(region => {
      const [x, y, width, height] = region.split(',').map(Number);
      this.renderRegion(ctx, x, y, width, height);
    });
    
    this.dirtyRegions.clear();
  }
}
```

### 4.2 内存管理

```typescript
class MemoryManager {
  private static objectPool: Map<string, any[]> = new Map();
  
  /**
   * 对象池管理，减少GC压力
   */
  static getObject<T>(type: string, factory: () => T): T {
    const pool = this.objectPool.get(type) || [];
    
    if (pool.length > 0) {
      return pool.pop() as T;
    }
    
    return factory();
  }
  
  static returnObject(type: string, obj: any) {
    const pool = this.objectPool.get(type) || [];
    
    if (pool.length < 100) { // 限制池大小
      // 重置对象状态
      this.resetObject(obj);
      pool.push(obj);
      this.objectPool.set(type, pool);
    }
  }
}
```

## 5. 数据持久化设计

### 5.1 本地存储结构

```typescript
interface SaveData {
  version: string;                    // 存档版本
  playerProfile: PlayerProfile;       // 玩家资料
  gameProgress: GameProgress;         // 游戏进度
  settings: GameSettings;             // 游戏设置
  achievements: Achievement[];        // 成就列表
  statistics: PlayerStatistics;      // 统计数据
}

interface PlayerProfile {
  playerId: string;
  playerName: string;
  level: number;
  experience: number;
  totalScore: number;
  createdAt: number;
  lastPlayTime: number;
}

interface GameProgress {
  currentLevel: number;
  unlockedLevels: number[];
  levelStars: Map<number, number>;    // 关卡星级
  currentGameState?: GameState;       // 当前游戏状态（用于续关）
}
```

### 5.2 存档系统

```typescript
class SaveSystem {
  private static readonly SAVE_KEY = 'block_puzzle_save';
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30秒自动存档
  
  /**
   * 保存游戏数据
   */
  static async saveGame(data: SaveData): Promise<void> {
    try {
      // 压缩数据
      const compressed = await this.compressData(data);
      
      // 本地存储
      localStorage.setItem(this.SAVE_KEY, compressed);
      
      // 云端同步
      if (this.isCloudSyncEnabled()) {
        await this.syncToCloud(data);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  }
  
  /**
   * 加载游戏数据
   */
  static async loadGame(): Promise<SaveData | null> {
    try {
      // 优先从云端加载
      if (this.isCloudSyncEnabled()) {
        const cloudData = await this.loadFromCloud();
        if (cloudData) return cloudData;
      }
      
      // 本地加载
      const localData = localStorage.getItem(this.SAVE_KEY);
      if (localData) {
        return await this.decompressData(localData);
      }
      
      return null;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }
  
  /**
   * 自动存档
   */
  static startAutoSave(gameState: () => GameState) {
    setInterval(() => {
      const currentState = gameState();
      if (currentState && !currentState.isPaused) {
        this.saveGame(this.createSaveData(currentState));
      }
    }, this.AUTO_SAVE_INTERVAL);
  }
}
```

## 6. 网络通信设计

### 6.1 API接口设计

```typescript
interface GameAPI {
  // 玩家相关
  getPlayerProfile(playerId: string): Promise<PlayerProfile>;
  updatePlayerProfile(profile: PlayerProfile): Promise<void>;
  
  // 排行榜
  getLeaderboard(type: LeaderboardType, limit: number): Promise<LeaderboardEntry[]>;
  submitScore(score: ScoreSubmission): Promise<void>;
  
  // 每日挑战
  getDailyChallenge(): Promise<DailyChallenge>;
  submitDailyChallengeResult(result: ChallengeResult): Promise<void>;
  
  // 好友系统
  getFriendsList(playerId: string): Promise<Friend[]>;
  addFriend(playerId: string, friendId: string): Promise<void>;
  getFriendsScores(playerId: string): Promise<FriendScore[]>;
}

enum LeaderboardType {
  GLOBAL_HIGH_SCORE = 'global_high_score',
  WEEKLY_CHALLENGE = 'weekly_challenge',
  FRIENDS_RANKING = 'friends_ranking'
}
```

### 6.2 实时通信

```typescript
class RealtimeManager {
  private socket: WebSocket | null = null;
  
  /**
   * 建立实时连接
   */
  connect(playerId: string) {
    this.socket = new WebSocket(`ws://api.game.com/realtime/${playerId}`);
    
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleRealtimeMessage(message);
    };
  }
  
  /**
   * 处理实时消息
   */
  private handleRealtimeMessage(message: RealtimeMessage) {
    switch (message.type) {
      case 'friend_score_update':
        this.notifyFriendScoreUpdate(message.data);
        break;
      case 'challenge_invitation':
        this.handleChallengeInvitation(message.data);
        break;
      case 'leaderboard_update':
        this.updateLeaderboard(message.data);
        break;
    }
  }
}
```

## 7. 测试策略

### 7.1 单元测试

```typescript
describe('PlacementValidator', () => {
  test('should validate block placement correctly', () => {
    const board = createTestBoard(10, 10);
    const block = createTestBlock('I_SHAPE');
    
    expect(PlacementValidator.canPlaceBlock(board, block, 0, 0)).toBe(true);
    expect(PlacementValidator.canPlaceBlock(board, block, 9, 0)).toBe(false);
  });
});

describe('LineClearing', () => {
  test('should clear complete rows and columns', () => {
    const board = createBoardWithCompleteRow(5);
    const result = LineClearing.clearCompleteLines(board);
    
    expect(result.clearedRows).toContain(5);
    expect(result.score).toBeGreaterThan(0);
  });
});
```

### 7.2 性能测试

```typescript
class PerformanceProfiler {
  private static measurements: Map<string, number[]> = new Map();
  
  static startMeasurement(label: string) {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      const measurements = this.measurements.get(label) || [];
      measurements.push(duration);
      this.measurements.set(label, measurements);
      
      return duration;
    };
  }
  
  static getAverageTime(label: string): number {
    const measurements = this.measurements.get(label) || [];
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }
}
```

## 8. 部署与监控

### 8.1 构建配置

```json
{
  "build": {
    "development": {
      "optimization": false,
      "sourceMap": true,
      "debugger": true
    },
    "production": {
      "optimization": true,
      "sourceMap": false,
      "debugger": false,
      "compression": true
    }
  }
}
```

### 8.2 错误监控

```typescript
class ErrorReporter {
  static init() {
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }
  
  private static handleError(event: ErrorEvent) {
    this.reportError({
      type: 'javascript_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  }
  
  private static reportError(errorInfo: ErrorInfo) {
    // 发送错误报告到监控服务
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorInfo)
    });
  }
}
```

这份技术设计文档提供了游戏实现的详细技术框架，涵盖了核心算法、数据结构、性能优化、测试策略等各个方面，为开发团队提供了清晰的技术实现指导。 