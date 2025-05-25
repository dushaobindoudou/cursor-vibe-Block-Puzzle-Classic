# 俄罗斯方块拼图游戏UI设计文档

## 1. 设计理念与风格定位

### 1.1 Geek风格设计理念
**"数字朋克 × 赛博美学 × 极简科技"**

#### 核心设计元素
- **霓虹色彩**：以暗黑背景为基调，搭配霓虹蓝、电光绿、赛博紫的发光效果
- **网格美学**：大量使用网格线条，体现数字化和程序化的感觉
- **像素化字体**：使用等宽字体和像素风格字体，突出程序员文化
- **终端界面**：借鉴命令行终端的视觉语言
- **代码元素**：适度融入代码片段、16进制颜色值等程序元素

#### 色彩方案
```css
/* 主色调 */
--primary-bg: #0a0a0a;           /* 深黑背景 */
--secondary-bg: #1a1a1a;         /* 次级背景 */
--accent-bg: #2a2a2a;            /* 强调背景 */

/* 霓虹色彩 */
--neon-blue: #00d4ff;            /* 霓虹蓝 */
--neon-green: #39ff14;           /* 电光绿 */
--neon-purple: #bf00ff;          /* 赛博紫 */
--neon-orange: #ff6600;          /* 警告橙 */
--neon-pink: #ff007f;            /* 粉色高亮 */

/* 方块颜色 */
--block-yellow: #ffff00;         /* 经典黄 */
--block-cyan: #00ffff;           /* 青色 */
--block-magenta: #ff00ff;        /* 品红 */
--block-red: #ff3333;            /* 红色 */
--block-green: #33ff33;          /* 绿色 */
--block-blue: #3333ff;           /* 蓝色 */
--block-white: #ffffff;          /* 白色 */

/* 系统色彩 */
--text-primary: #ffffff;         /* 主文字 */
--text-secondary: #b0b0b0;       /* 次级文字 */
--text-accent: #00d4ff;          /* 强调文字 */
--border-glow: #00d4ff;          /* 发光边框 */
--success: #39ff14;              /* 成功色 */
--warning: #ff6600;              /* 警告色 */
--error: #ff3333;                /* 错误色 */
```

### 1.2 字体系统
```css
/* 主字体 - 等宽字体家族 */
--font-primary: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;

/* 像素字体 - 用于标题和强调 */
--font-pixel: 'Press Start 2P', 'Courier New', monospace;

/* 数字字体 - 用于分数显示 */
--font-digital: 'Digital-7', 'LCD', monospace;

/* 字体大小 */
--font-xs: 10px;    /* 小标签 */
--font-sm: 12px;    /* 普通文本 */
--font-md: 14px;    /* 标准文本 */
--font-lg: 16px;    /* 大文本 */
--font-xl: 20px;    /* 标题文本 */
--font-2xl: 24px;   /* 大标题 */
--font-3xl: 32px;   /* 主标题 */
```

## 2. 界面布局设计

### 2.1 主游戏界面

```
┌─────────────────────────────────────────────────────────┐
│  BLOCK_PUZZLE.EXE                            [_][□][×]  │
├─────────────────────────────────────────────────────────┤
│  > LEVEL: 001  SCORE: 012450  TARGET: 015000           │
│  > COMBO: x3   LINES: 0042    TIME: 03:42              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    ┌─────────────────────────────────────────┐         │
│    │ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░                   │         │
│    │ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░                   │         │
│    │ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░                   │         │
│    │ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░                   │         │
│    │ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░    [NEXT]         │         │
│    │ ░ ░ ░ █ █ █ ░ ░ ░ ░     ▓▓             │         │
│    │ ░ ░ ░ █ █ █ ░ ░ ░ ░     ▓▓             │         │
│    │ ░ ░ ░ █ █ █ ░ ░ ░ ░                   │         │
│    │ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░    [HOLD]         │         │
│    │ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░     ▓▓▓           │         │
│    └─────────────────────────────────────────┘         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ QUEUE:  [▓▓] [▓▓▓] [▓]                         │   │
│  │                                                 │   │
│  │ > /help /pause /restart /settings              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 界面组件设计

#### 2.2.1 游戏板面
```css
.game-board {
  background: linear-gradient(45deg, #0a0a0a 0%, #1a1a1a 100%);
  border: 2px solid var(--neon-blue);
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.5),
    inset 0 0 20px rgba(0, 212, 255, 0.1);
  backdrop-filter: blur(10px);
}

.grid-cell {
  border: 1px solid rgba(0, 212, 255, 0.2);
  background: rgba(26, 26, 26, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid-cell:hover {
  background: rgba(0, 212, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}
```

#### 2.2.2 状态栏设计
```css
.status-bar {
  background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%);
  border-bottom: 1px solid var(--neon-green);
  font-family: var(--font-primary);
  color: var(--neon-green);
  text-shadow: 0 0 10px currentColor;
}

.status-item {
  position: relative;
  padding: 8px 16px;
}

.status-item::before {
  content: '> ';
  color: var(--neon-blue);
}

.status-value {
  color: var(--text-primary);
  font-weight: bold;
}
```

## 3. 方块消失动画效果设计

### 3.1 消失动画序列

#### 阶段1：识别标记（0.1秒）
```css
@keyframes identify-line {
  0% {
    background: var(--block-color);
    transform: scale(1);
  }
  50% {
    background: var(--neon-white);
    transform: scale(1.1);
    box-shadow: 0 0 20px var(--neon-white);
  }
  100% {
    background: var(--neon-white);
    transform: scale(1);
    box-shadow: 0 0 30px var(--neon-white);
  }
}
```

#### 阶段2：数据流效果（0.3秒）
```css
@keyframes data-stream {
  0% {
    opacity: 1;
    background: var(--neon-white);
  }
  25% {
    background: var(--neon-blue);
    box-shadow: 0 0 40px var(--neon-blue);
  }
  50% {
    background: var(--neon-green);
    box-shadow: 0 0 40px var(--neon-green);
  }
  75% {
    background: var(--neon-purple);
    box-shadow: 0 0 40px var(--neon-purple);
  }
  100% {
    opacity: 0;
    background: transparent;
    transform: scale(0);
  }
}
```

#### 阶段3：粒子爆炸效果（0.5秒）
```javascript
// WebGL粒子系统
class ParticleExplosion {
  constructor(x, y, color) {
    this.particles = [];
    this.createParticles(x, y, color);
  }
  
  createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.01,
        size: Math.random() * 3 + 1,
        color: color,
        glow: true
      });
    }
  }
  
  update(deltaTime) {
    this.particles.forEach(particle => {
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life -= particle.decay;
      particle.size *= 0.98;
    });
    
    this.particles = this.particles.filter(p => p.life > 0);
  }
  
  render(ctx) {
    this.particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      ctx.restore();
    });
  }
}
```

### 3.2 连击动画效果

#### 连击文字动画
```css
@keyframes combo-text {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  20% {
    transform: scale(1.3) rotate(2deg);
    opacity: 1;
    color: var(--neon-green);
    text-shadow: 0 0 20px var(--neon-green);
  }
  40% {
    transform: scale(1.1) rotate(-1deg);
    color: var(--neon-blue);
    text-shadow: 0 0 25px var(--neon-blue);
  }
  60% {
    transform: scale(1.2) rotate(1deg);
    color: var(--neon-purple);
    text-shadow: 0 0 30px var(--neon-purple);
  }
  80% {
    transform: scale(1) rotate(0deg);
    color: var(--neon-orange);
    text-shadow: 0 0 35px var(--neon-orange);
  }
  100% {
    transform: scale(0.8) translateY(-50px);
    opacity: 0;
  }
}
```

#### 屏幕震动效果
```css
@keyframes screen-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-2px) translateY(1px); }
  20% { transform: translateX(2px) translateY(-1px); }
  30% { transform: translateX(-1px) translateY(2px); }
  40% { transform: translateX(1px) translateY(-2px); }
  50% { transform: translateX(-2px) translateY(1px); }
  60% { transform: translateX(2px) translateY(-1px); }
  70% { transform: translateX(-1px) translateY(2px); }
  80% { transform: translateX(1px) translateY(-2px); }
  90% { transform: translateX(-2px) translateY(1px); }
}
```

## 4. HTML5 + WebGL技术方案

### 4.1 推荐游戏引擎

#### 方案1：PixiJS（推荐）
```javascript
// PixiJS配置
const app = new PIXI.Application({
  width: 1024,
  height: 768,
  backgroundColor: 0x0a0a0a,
  antialias: true,
  transparent: false,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  powerPreference: "high-performance",
  sharedTicker: true,
  sharedLoader: true
});

// 添加后处理效果
const filter = new PIXI.filters.GlowFilter({
  distance: 15,
  outerStrength: 2,
  innerStrength: 1,
  color: 0x00d4ff,
  quality: 0.5
});
```

#### 方案2：Three.js + 2D渲染
```javascript
// Three.js 2D渲染配置
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  -window.innerWidth/2, window.innerWidth/2,
  window.innerHeight/2, -window.innerHeight/2,
  0.1, 1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});

// 自定义着色器
const glowVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  varying vec2 vUv;
  
  void main() {
    float glow = pow(0.5, distance(vUv, vec2(0.5)) * 10.0);
    gl_FragColor = vec4(glowColor * intensity * glow, 1.0);
  }
`;
```

#### 方案3：Phaser 3（备选）
```javascript
// Phaser 3配置
const config = {
  type: Phaser.WEBGL,
  width: 1024,
  height: 768,
  backgroundColor: '#0a0a0a',
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  render: {
    pixelArt: false,
    antialias: true,
    powerPreference: 'high-performance'
  },
  fps: {
    target: 60,
    forceSetTimeOut: true
  }
};
```

### 4.2 性能优化策略

#### WebGL渲染优化
```javascript
class RenderOptimizer {
  constructor() {
    this.batchRenderer = new BatchRenderer();
    this.textureAtlas = new TextureAtlas();
    this.objectPool = new ObjectPool();
  }
  
  // 批量渲染
  batchRender(objects) {
    // 按纹理分组
    const batches = this.groupByTexture(objects);
    
    batches.forEach(batch => {
      this.batchRenderer.render(batch);
    });
  }
  
  // 纹理图集
  createTextureAtlas() {
    const atlas = new PIXI.BaseTexture.fromCanvas(
      this.createAtlasCanvas()
    );
    return atlas;
  }
  
  // 对象池管理
  getPooledSprite(textureId) {
    return this.objectPool.acquire('sprite', () => {
      return new PIXI.Sprite(this.textureAtlas.getTexture(textureId));
    });
  }
}
```

### 4.3 特效系统设计

#### 发光效果着色器
```glsl
// 顶点着色器
attribute vec2 position;
attribute vec2 texCoord;
varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vTexCoord = texCoord;
}

// 片元着色器
precision mediump float;
uniform sampler2D texture;
uniform vec3 glowColor;
uniform float glowIntensity;
uniform float time;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(texture, vTexCoord);
  
  // 基础发光
  float glow = sin(time * 2.0) * 0.5 + 0.5;
  vec3 glowEffect = glowColor * glowIntensity * glow;
  
  // 边缘检测发光
  vec2 texelSize = 1.0 / textureSize(texture, 0);
  vec4 edge = vec4(0.0);
  edge += texture2D(texture, vTexCoord + vec2(-texelSize.x, 0.0));
  edge += texture2D(texture, vTexCoord + vec2(texelSize.x, 0.0));
  edge += texture2D(texture, vTexCoord + vec2(0.0, -texelSize.y));
  edge += texture2D(texture, vTexCoord + vec2(0.0, texelSize.y));
  edge *= 0.25;
  
  float edgeGlow = length(color - edge) * 2.0;
  
  gl_FragColor = vec4(color.rgb + glowEffect + edgeGlow * glowColor, color.a);
}
```

#### 粒子系统
```javascript
class ParticleSystem {
  constructor(maxParticles = 1000) {
    this.particles = new Float32Array(maxParticles * 6); // x,y,vx,vy,life,size
    this.colors = new Float32Array(maxParticles * 3);    // r,g,b
    this.maxParticles = maxParticles;
    this.activeParticles = 0;
    
    this.createWebGLBuffers();
  }
  
  createWebGLBuffers() {
    // 创建VBO
    this.positionBuffer = gl.createBuffer();
    this.colorBuffer = gl.createBuffer();
    
    // 编译着色器
    this.shaderProgram = createShaderProgram(
      particleVertexShader,
      particleFragmentShader
    );
  }
  
  emit(x, y, count, config) {
    for (let i = 0; i < count && this.activeParticles < this.maxParticles; i++) {
      const index = this.activeParticles * 6;
      
      this.particles[index + 0] = x + (Math.random() - 0.5) * 10; // x
      this.particles[index + 1] = y + (Math.random() - 0.5) * 10; // y
      this.particles[index + 2] = (Math.random() - 0.5) * 200;    // vx
      this.particles[index + 3] = (Math.random() - 0.5) * 200;    // vy
      this.particles[index + 4] = 1.0;                            // life
      this.particles[index + 5] = Math.random() * 5 + 1;         // size
      
      const colorIndex = this.activeParticles * 3;
      this.colors[colorIndex + 0] = config.color.r;
      this.colors[colorIndex + 1] = config.color.g;
      this.colors[colorIndex + 2] = config.color.b;
      
      this.activeParticles++;
    }
  }
  
  update(deltaTime) {
    for (let i = 0; i < this.activeParticles; i++) {
      const index = i * 6;
      
      // 更新位置
      this.particles[index + 0] += this.particles[index + 2] * deltaTime; // x += vx
      this.particles[index + 1] += this.particles[index + 3] * deltaTime; // y += vy
      
      // 更新生命周期
      this.particles[index + 4] -= deltaTime * 2; // life
      
      // 更新大小
      this.particles[index + 5] *= 0.99; // size
      
      // 移除死亡粒子
      if (this.particles[index + 4] <= 0) {
        this.removeParticle(i);
        i--; // 重新检查当前索引
      }
    }
  }
  
  render() {
    if (this.activeParticles === 0) return;
    
    gl.useProgram(this.shaderProgram);
    
    // 更新缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particles, gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.DYNAMIC_DRAW);
    
    // 渲染粒子
    gl.drawArrays(gl.POINTS, 0, this.activeParticles);
  }
}
```

## 5. 交互设计

### 5.1 拖拽系统
```javascript
class DragSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.isDragging = false;
    this.dragObject = null;
    this.startPos = { x: 0, y: 0 };
    this.currentPos = { x: 0, y: 0 };
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // 触摸事件
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
  }
  
  onMouseDown(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const hitObject = this.hitTest(x, y);
    if (hitObject && hitObject.draggable) {
      this.startDrag(hitObject, x, y);
    }
  }
  
  startDrag(object, x, y) {
    this.isDragging = true;
    this.dragObject = object;
    this.startPos = { x, y };
    this.currentPos = { x, y };
    
    // 创建拖拽预览
    this.createDragPreview(object);
    
    // 添加发光效果
    object.addFilter(new PIXI.filters.GlowFilter({
      color: 0x00d4ff,
      outerStrength: 2,
      innerStrength: 1
    }));
  }
  
  createDragPreview(object) {
    this.dragPreview = object.clone();
    this.dragPreview.alpha = 0.7;
    this.dragPreview.tint = 0x00d4ff;
    this.canvas.addChild(this.dragPreview);
  }
}
```

### 5.2 动画缓动函数
```javascript
const Easing = {
  // 弹性缓动
  elastic: (t) => {
    return Math.sin(-13 * (t + 1) * Math.PI / 2) * Math.pow(2, -10 * t) + 1;
  },
  
  // 回弹缓动
  bounce: (t) => {
    if (t < 1/2.75) {
      return 7.5625 * t * t;
    } else if (t < 2/2.75) {
      return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
    } else if (t < 2.5/2.75) {
      return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
    }
  },
  
  // 赛博朋克风格缓动
  cyber: (t) => {
    const glitch = Math.sin(t * 50) * 0.05;
    const smooth = t * t * (3 - 2 * t);
    return smooth + glitch;
  }
};
```

## 6. 音效设计建议

### 6.1 音效类型
- **方块放置音**：低频"哔"声，带有轻微的电子干扰
- **行列消除音**：高频"滋"声，模拟数据流
- **连击音效**：合成器和弦，频率递增
- **游戏结束音**：低沉的错误提示音
- **背景音乐**：Synthwave/Retrowave风格的循环音乐

### 6.2 Web Audio API实现
```javascript
class AudioSystem {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
  }
  
  // 生成方块放置音效
  createPlaceSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }
  
  // 生成消除音效
  createClearSound(comboLevel = 1) {
    const baseFreq = 440 * comboLevel;
    
    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const delay = i * 0.05;
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(baseFreq * (i + 1), this.audioContext.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.start(this.audioContext.currentTime + delay);
      oscillator.stop(this.audioContext.currentTime + delay + 0.3);
    }
  }
}
```

## 7. 响应式设计

### 7.1 屏幕适配
```css
/* 基础响应式布局 */
.game-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-board {
    width: 90vw;
    height: 60vh;
  }
  
  .status-bar {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .candidate-blocks {
    flex-direction: row;
    justify-content: space-around;
    padding: 10px;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .game-board {
    width: 70vw;
    height: 70vh;
  }
}

/* 桌面端适配 */
@media (min-width: 1025px) {
  .game-board {
    width: 600px;
    height: 600px;
  }
}
```

### 7.2 动态UI缩放
```javascript
class ResponsiveUI {
  constructor() {
    this.baseWidth = 1024;
    this.baseHeight = 768;
    this.currentScale = 1;
    
    this.updateScale();
    window.addEventListener('resize', () => this.updateScale());
  }
  
  updateScale() {
    const scaleX = window.innerWidth / this.baseWidth;
    const scaleY = window.innerHeight / this.baseHeight;
    this.currentScale = Math.min(scaleX, scaleY);
    
    // 更新游戏画布缩放
    const gameCanvas = document.getElementById('game-canvas');
    gameCanvas.style.transform = `scale(${this.currentScale})`;
    
    // 更新UI元素大小
    this.updateUIElements();
  }
  
  updateUIElements() {
    const elements = document.querySelectorAll('.scalable-ui');
    elements.forEach(element => {
      element.style.fontSize = `${14 * this.currentScale}px`;
    });
  }
}
```

这份UI设计文档为您的geek风格俄罗斯方块拼图游戏提供了完整的视觉设计和技术实现方案。通过WebGL/PixiJS的强大渲染能力，结合赛博朋克美学，将创造出独特而现代的游戏体验。 