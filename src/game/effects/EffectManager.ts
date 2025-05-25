import { Container, Graphics, Text } from 'pixi.js'

export interface ClearEffect {
  rows: number[]
  cols: number[]
  score: number
}

export class EffectManager {
  private _stage: Container
  private _effectLayer: Container
  private _gameBoard: Container | null = null
  private _cellSize: number = 35
  private _boardX: number = 0
  private _boardY: number = 0

  constructor(stage: Container) {
    this._stage = stage
    this._effectLayer = new Container()
    this._effectLayer.name = 'effectLayer'
    this._stage.addChild(this._effectLayer)
  }

  setGameBoard(gameBoard: Container, cellSize: number, boardX: number, boardY: number): void {
    this._gameBoard = gameBoard
    this._cellSize = cellSize
    this._boardX = boardX
    this._boardY = boardY
  }

  // 播放消除动画
  playClearEffect(effect: ClearEffect): void {
    console.log(`🎆 Playing clear effect: ${effect.rows.length} rows, ${effect.cols.length} cols, +${effect.score} points`)

    const totalClears = effect.rows.length + effect.cols.length

    // 根据消除数量选择不同特效
    if (totalClears >= 3) {
      // 大量消除：彩虹波纹特效
      this.playRainbowWaveEffect(effect.rows, effect.cols)
    } else if (totalClears === 2) {
      // 双重消除：震动 + 闪光特效
      this.playShakeEffect()
      this.playEnhancedFlashEffect(effect.rows, effect.cols)
    } else {
      // 单次消除：标准闪光特效
      this.playStandardClearEffect(effect.rows, effect.cols)
    }

    // 分数飞出动画
    setTimeout(() => {
      this.playScorePopAnimation(effect.score)
    }, 200)

    // 连击消除时添加特殊特效
    if (totalClears >= 2) {
      setTimeout(() => {
        this.playComboLineEffect(effect.rows, effect.cols)
      }, 300)
    }
  }

  private playRowClearAnimation(row: number): void {
    if (!this._gameBoard) return

    // 创建闪光效果
    const flashEffect = new Graphics()
    flashEffect.beginFill(0xffffff, 0.8)
    flashEffect.drawRect(0, row * this._cellSize, this._cellSize * 10, this._cellSize)
    flashEffect.endFill()

    this._gameBoard.addChild(flashEffect)

    // 闪光动画
    let alpha = 0.8
    const fadeOut = () => {
      alpha -= 0.1
      flashEffect.alpha = alpha
      if (alpha > 0) {
        requestAnimationFrame(fadeOut)
      } else {
        this._gameBoard?.removeChild(flashEffect)
        flashEffect.destroy()
      }
    }
    requestAnimationFrame(fadeOut)

    // 粒子爆炸效果
    this.createParticleExplosion(this._cellSize * 5, row * this._cellSize + this._cellSize / 2, 0x00d4ff)
  }

  private playColClearAnimation(col: number): void {
    if (!this._gameBoard) return

    // 创建闪光效果
    const flashEffect = new Graphics()
    flashEffect.beginFill(0xffffff, 0.8)
    flashEffect.drawRect(col * this._cellSize, 0, this._cellSize, this._cellSize * 10)
    flashEffect.endFill()

    this._gameBoard.addChild(flashEffect)

    // 闪光动画
    let alpha = 0.8
    const fadeOut = () => {
      alpha -= 0.1
      flashEffect.alpha = alpha
      if (alpha > 0) {
        requestAnimationFrame(fadeOut)
      } else {
        this._gameBoard?.removeChild(flashEffect)
        flashEffect.destroy()
      }
    }
    requestAnimationFrame(fadeOut)

    // 粒子爆炸效果
    this.createParticleExplosion(col * this._cellSize + this._cellSize / 2, this._cellSize * 5, 0x39ff14)
  }

  private createParticleExplosion(x: number, y: number, color: number): void {
    if (!this._gameBoard) return

    const particleCount = 12
    for (let i = 0; i < particleCount; i++) {
      const particle = new Graphics()
      particle.beginFill(color)
      particle.drawRect(0, 0, 4, 4)
      particle.endFill()

      particle.x = x
      particle.y = y

      // 随机速度和方向
      const angle = (i / particleCount) * Math.PI * 2
      const speed = 2 + Math.random() * 3
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed

      this._gameBoard.addChild(particle)

      // 粒子动画
      let life = 1.0
      const animate = () => {
        particle.x += vx
        particle.y += vy
        life -= 0.05
        particle.alpha = life

        if (life > 0) {
          requestAnimationFrame(animate)
        } else {
          this._gameBoard?.removeChild(particle)
          particle.destroy()
        }
      }
      requestAnimationFrame(animate)
    }
  }

  private playScorePopAnimation(score: number): void {
    if (!this._gameBoard) return

    // 创建分数文本
    const scoreText = new Text(`+${score}`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 24,
      fill: 0xffff00,
      stroke: 0x000000,
      strokeThickness: 2
    })

    scoreText.anchor.set(0.5)
    scoreText.x = this._cellSize * 5 // 游戏板中心
    scoreText.y = this._cellSize * 5

    this._gameBoard.addChild(scoreText)

    // 分数飞出动画
    let time = 0
    const animate = () => {
      time += 0.016 // 假设60fps
      scoreText.y -= 2 // 向上移动
      scoreText.alpha = 1 - time / 1.5 // 1.5秒后消失
      scoreText.scale.set(1 + time * 0.5) // 逐渐放大

      if (time < 1.5) {
        requestAnimationFrame(animate)
      } else {
        this._gameBoard?.removeChild(scoreText)
        scoreText.destroy()
      }
    }
    requestAnimationFrame(animate)
  }

  // 播放方块放置动画
  playBlockPlaceEffect(gridX: number, gridY: number, pattern: number[][], color: string): void {
    if (!this._gameBoard) return

    const blockColor = parseInt(color.replace('#', ''), 16)

    // 为每个方块格子添加弹跳效果
    for (let py = 0; py < pattern.length; py++) {
      for (let px = 0; px < pattern[0].length; px++) {
        if (pattern[py][px] === 1) {
          const cellX = (gridX + px) * this._cellSize
          const cellY = (gridY + py) * this._cellSize

          // 创建弹跳方块
          const bounceBlock = new Graphics()
          bounceBlock.beginFill(blockColor, 0.9)
          bounceBlock.lineStyle(2, 0xffffff, 0.8)
          bounceBlock.drawRect(cellX + 1, cellY + 1, this._cellSize - 2, this._cellSize - 2)
          bounceBlock.endFill()

          this._gameBoard.addChild(bounceBlock)

          // 弹跳动画
          let bounceTime = 0
          const animate = () => {
            bounceTime += 0.016
            const scale = 1 + Math.sin(bounceTime * 20) * 0.1 * (1 - bounceTime / 0.3)
            bounceBlock.scale.set(scale)

            if (bounceTime < 0.3) {
              requestAnimationFrame(animate)
            } else {
              this._gameBoard?.removeChild(bounceBlock)
              bounceBlock.destroy()
            }
          }
          
          // 延迟执行，创建连锁效果
          setTimeout(() => {
            requestAnimationFrame(animate)
          }, (px + py) * 50)
        }
      }
    }
  }

  // 播放连击特效
  playComboEffect(comboCount: number, centerX: number, centerY: number): void {
    if (comboCount < 2) return

    const comboText = new Text(`COMBO x${comboCount}!`, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 32,
      fill: 0xff00ff,
      stroke: 0xffffff,
      strokeThickness: 3
    })

    comboText.anchor.set(0.5)
    comboText.x = centerX
    comboText.y = centerY - 50

    this._effectLayer.addChild(comboText)

    // 连击动画
    let time = 0
    const animate = () => {
      time += 0.016
      
      // 缩放效果
      const scale = 1 + Math.sin(time * 10) * 0.2
      comboText.scale.set(scale)
      
      // 彩虹颜色效果
      const hue = (time * 360) % 360
      comboText.tint = this.hslToHex(hue, 100, 50)
      
      // 淡出
      if (time > 1.5) {
        comboText.alpha = 1 - (time - 1.5) / 0.5
      }

      if (time < 2.0) {
        requestAnimationFrame(animate)
      } else {
        this._effectLayer.removeChild(comboText)
        comboText.destroy()
      }
    }
    requestAnimationFrame(animate)
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

  // 标准清除特效（原来的逻辑）
  private playStandardClearEffect(rows: number[], cols: number[]): void {
    // 清除行的动画
    rows.forEach((row, index) => {
      setTimeout(() => {
        this.playRowClearAnimation(row)
      }, index * 100)
    })

    // 清除列的动画
    cols.forEach((col, index) => {
      setTimeout(() => {
        this.playColClearAnimation(col)
      }, index * 100 + 50)
    })
  }

  // 增强闪光特效
  private playEnhancedFlashEffect(rows: number[], cols: number[]): void {
    if (!this._gameBoard) return

    // 双重闪光效果
    rows.forEach((row, index) => {
      setTimeout(() => {
        this.playEnhancedRowFlash(row)
      }, index * 80)
    })

    cols.forEach((col, index) => {
      setTimeout(() => {
        this.playEnhancedColFlash(col)
      }, index * 80 + 40)
    })
  }

  private playEnhancedRowFlash(row: number): void {
    if (!this._gameBoard) return

    // 第一次闪光 - 白色
    const flash1 = new Graphics()
    flash1.beginFill(0xffffff, 0.9)
    flash1.drawRect(0, row * this._cellSize, this._cellSize * 10, this._cellSize)
    flash1.endFill()
    this._gameBoard.addChild(flash1)

    // 第二次闪光 - 彩色
    setTimeout(() => {
      if (!this._gameBoard) return
      
      const flash2 = new Graphics()
      flash2.beginFill(0x00ffff, 0.7)
      flash2.drawRect(0, row * this._cellSize, this._cellSize * 10, this._cellSize)
      flash2.endFill()
      this._gameBoard.addChild(flash2)

      // 淡出动画
      let alpha = 0.7
      const fadeOut = () => {
        alpha -= 0.05
        flash2.alpha = alpha
        if (alpha > 0) {
          requestAnimationFrame(fadeOut)
        } else {
          if (this._gameBoard) {
            this._gameBoard.removeChild(flash2)
          }
          flash2.destroy()
        }
      }
      requestAnimationFrame(fadeOut)
    }, 100)

    // 第一次闪光淡出
    let alpha1 = 0.9
    const fadeOut1 = () => {
      alpha1 -= 0.1
      flash1.alpha = alpha1
      if (alpha1 > 0) {
        requestAnimationFrame(fadeOut1)
      } else {
        if (this._gameBoard) {
          this._gameBoard.removeChild(flash1)
        }
        flash1.destroy()
      }
    }
    requestAnimationFrame(fadeOut1)

    // 增强粒子效果
    this.createEnhancedParticleExplosion(this._cellSize * 5, row * this._cellSize + this._cellSize / 2, 0x00ffff, 20)
  }

  private playEnhancedColFlash(col: number): void {
    if (!this._gameBoard) return

    // 类似行闪光的双重效果
    const flash1 = new Graphics()
    flash1.beginFill(0xffffff, 0.9)
    flash1.drawRect(col * this._cellSize, 0, this._cellSize, this._cellSize * 10)
    flash1.endFill()
    this._gameBoard.addChild(flash1)

    setTimeout(() => {
      if (!this._gameBoard) return
      
      const flash2 = new Graphics()
      flash2.beginFill(0xff00ff, 0.7)
      flash2.drawRect(col * this._cellSize, 0, this._cellSize, this._cellSize * 10)
      flash2.endFill()
      this._gameBoard.addChild(flash2)

      let alpha = 0.7
      const fadeOut = () => {
        alpha -= 0.05
        flash2.alpha = alpha
        if (alpha > 0) {
          requestAnimationFrame(fadeOut)
        } else {
          if (this._gameBoard) {
            this._gameBoard.removeChild(flash2)
          }
          flash2.destroy()
        }
      }
      requestAnimationFrame(fadeOut)
    }, 100)

    let alpha1 = 0.9
    const fadeOut1 = () => {
      alpha1 -= 0.1
      flash1.alpha = alpha1
      if (alpha1 > 0) {
        requestAnimationFrame(fadeOut1)
      } else {
        if (this._gameBoard) {
          this._gameBoard.removeChild(flash1)
        }
        flash1.destroy()
      }
    }
    requestAnimationFrame(fadeOut1)

    this.createEnhancedParticleExplosion(col * this._cellSize + this._cellSize / 2, this._cellSize * 5, 0xff00ff, 20)
  }

  // 彩虹波纹特效（大量消除时）
  private playRainbowWaveEffect(rows: number[], cols: number[]): void {
    if (!this._gameBoard) return

    // 从中心向外扩散的彩虹波纹
    const centerX = this._cellSize * 5
    const centerY = this._cellSize * 5

    for (let wave = 0; wave < 3; wave++) {
      setTimeout(() => {
        this.createRainbowWave(centerX, centerY, wave)
      }, wave * 200)
    }

    // 同时播放行列的彩虹闪光
    rows.forEach((row, index) => {
      setTimeout(() => {
        this.playRainbowRowFlash(row)
      }, index * 50)
    })

    cols.forEach((col, index) => {
      setTimeout(() => {
        this.playRainbowColFlash(col)
      }, index * 50 + 100)
    })
  }

  private createRainbowWave(centerX: number, centerY: number, waveIndex: number): void {
    if (!this._gameBoard) return

    const wave = new Graphics()
    this._gameBoard.addChild(wave)

    let radius = 0
    let time = 0
    const maxRadius = this._cellSize * 8

    const animate = () => {
      time += 0.05
      radius += 3

      wave.clear()
      
      // 彩虹颜色变化
      const hue = (time * 180 + waveIndex * 120) % 360
      const color = this.hslToHex(hue, 100, 50)
      
      wave.lineStyle(4, color, 1 - radius / maxRadius)
      wave.drawCircle(centerX, centerY, radius)

      if (radius < maxRadius) {
        requestAnimationFrame(animate)
      } else {
        this._gameBoard?.removeChild(wave)
        wave.destroy()
      }
    }
    requestAnimationFrame(animate)
  }

  private playRainbowRowFlash(row: number): void {
    if (!this._gameBoard) return

    const flash = new Graphics()
    this._gameBoard.addChild(flash)

    let time = 0
    const duration = 1.0

    const animate = () => {
      time += 0.033
      
      flash.clear()
      const hue = (time * 360) % 360
      const color = this.hslToHex(hue, 100, 60)
      const alpha = 0.8 * (1 - time / duration)
      
      flash.beginFill(color, alpha)
      flash.drawRect(0, row * this._cellSize, this._cellSize * 10, this._cellSize)
      flash.endFill()

      if (time < duration) {
        requestAnimationFrame(animate)
      } else {
        this._gameBoard?.removeChild(flash)
        flash.destroy()
      }
    }
    requestAnimationFrame(animate)

    // 彩虹粒子爆炸
    this.createRainbowParticleExplosion(this._cellSize * 5, row * this._cellSize + this._cellSize / 2)
  }

  private playRainbowColFlash(col: number): void {
    if (!this._gameBoard) return

    const flash = new Graphics()
    this._gameBoard.addChild(flash)

    let time = 0
    const duration = 1.0

    const animate = () => {
      time += 0.033
      
      flash.clear()
      const hue = (time * 360 + 180) % 360
      const color = this.hslToHex(hue, 100, 60)
      const alpha = 0.8 * (1 - time / duration)
      
      flash.beginFill(color, alpha)
      flash.drawRect(col * this._cellSize, 0, this._cellSize, this._cellSize * 10)
      flash.endFill()

      if (time < duration) {
        requestAnimationFrame(animate)
      } else {
        this._gameBoard?.removeChild(flash)
        flash.destroy()
      }
    }
    requestAnimationFrame(animate)

    this.createRainbowParticleExplosion(col * this._cellSize + this._cellSize / 2, this._cellSize * 5)
  }

  // 震动特效
  private playShakeEffect(): void {
    if (!this._gameBoard) return

    const originalX = this._gameBoard.x
    const originalY = this._gameBoard.y
    let shakeTime = 0
    const shakeIntensity = 3
    const shakeDuration = 0.3

    const shake = () => {
      shakeTime += 0.016
      
      if (shakeTime < shakeDuration) {
        const offsetX = (Math.random() - 0.5) * shakeIntensity * (1 - shakeTime / shakeDuration)
        const offsetY = (Math.random() - 0.5) * shakeIntensity * (1 - shakeTime / shakeDuration)
        
        if (this._gameBoard) {
          this._gameBoard.x = originalX + offsetX
          this._gameBoard.y = originalY + offsetY
        }
        
        requestAnimationFrame(shake)
      } else {
        if (this._gameBoard) {
          this._gameBoard.x = originalX
          this._gameBoard.y = originalY
        }
      }
    }
    requestAnimationFrame(shake)
  }

  // 连击线条特效
  private playComboLineEffect(rows: number[], cols: number[]): void {
    if (!this._gameBoard) return

    // 在消除的行列之间画连接线
    rows.forEach(row => {
      cols.forEach(col => {
        this.createComboLine(
          col * this._cellSize + this._cellSize / 2,
          row * this._cellSize + this._cellSize / 2,
          this._cellSize * 5,
          this._cellSize * 5
        )
      })
    })
  }

  private createComboLine(x1: number, y1: number, x2: number, y2: number): void {
    if (!this._gameBoard) return

    const line = new Graphics()
    this._gameBoard.addChild(line)

    let progress = 0
    let time = 0

    const animate = () => {
      time += 0.033
      progress = Math.min(1, time / 0.5)
      
      line.clear()
      
      const hue = (time * 540) % 360
      const color = this.hslToHex(hue, 100, 50)
      
      line.lineStyle(3, color, 1 - progress)
      line.moveTo(x1, y1)
      
      const currentX = x1 + (x2 - x1) * progress
      const currentY = y1 + (y2 - y1) * progress
      line.lineTo(currentX, currentY)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this._gameBoard?.removeChild(line)
        line.destroy()
      }
    }
    requestAnimationFrame(animate)
  }

  // 增强粒子爆炸
  private createEnhancedParticleExplosion(x: number, y: number, color: number, count: number = 20): void {
    if (!this._gameBoard) return

    for (let i = 0; i < count; i++) {
      const particle = new Graphics()
      particle.beginFill(color)
      
      // 随机粒子形状
      if (Math.random() > 0.5) {
        particle.drawRect(0, 0, 3, 3)
      } else {
        particle.drawCircle(0, 0, 2)
      }
      particle.endFill()

      particle.x = x
      particle.y = y

      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const speed = 2 + Math.random() * 4
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed

      this._gameBoard.addChild(particle)

      let life = 1.0
      let scale = 1.0
      const animate = () => {
        particle.x += vx
        particle.y += vy
        life -= 0.03
        scale = life
        particle.alpha = life
        particle.scale.set(scale)

        if (life > 0) {
          requestAnimationFrame(animate)
        } else {
          this._gameBoard?.removeChild(particle)
          particle.destroy()
        }
      }
      requestAnimationFrame(animate)
    }
  }

  // 彩虹粒子爆炸
  private createRainbowParticleExplosion(x: number, y: number): void {
    if (!this._gameBoard) return

    const particleCount = 25
    for (let i = 0; i < particleCount; i++) {
      const particle = new Graphics()
      
      const hue = (i / particleCount) * 360
      const color = this.hslToHex(hue, 100, 60)
      particle.beginFill(color)
      particle.drawCircle(0, 0, 2 + Math.random() * 2)
      particle.endFill()

      particle.x = x
      particle.y = y

      const angle = (i / particleCount) * Math.PI * 2
      const speed = 3 + Math.random() * 5
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed

      this._gameBoard.addChild(particle)

      let life = 1.0
      let time = 0
      const animate = () => {
        time += 0.033
        particle.x += vx
        particle.y += vy
        life -= 0.02
        
        // 色彩变化
        const newHue = (hue + time * 360) % 360
        const newColor = this.hslToHex(newHue, 100, 60)
        particle.tint = newColor
        
        particle.alpha = life
        particle.scale.set(life)

        if (life > 0) {
          requestAnimationFrame(animate)
        } else {
          this._gameBoard?.removeChild(particle)
          particle.destroy()
        }
      }
      requestAnimationFrame(animate)
    }
  }

  destroy(): void {
    if (this._effectLayer.parent) {
      this._effectLayer.parent.removeChild(this._effectLayer)
    }
    this._effectLayer.destroy()
  }
} 