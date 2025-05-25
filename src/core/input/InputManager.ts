import { AudioManager } from '../audio/AudioManager'

export interface InputEventCallbacks {
  onSpacePressed?: () => void
  onEscapePressed?: () => void
  onCanvasClick?: (x: number, y: number) => void
  onMouseMove?: (x: number, y: number) => void
}

export class InputManager {
  private _canvas: HTMLCanvasElement | null = null
  private _isInitialized = false
  private _keys: Set<string> = new Set()
  private _audioManager: AudioManager | null = null
  private _callbacks: InputEventCallbacks = {}

  init(canvas: HTMLCanvasElement, audioManager?: AudioManager, callbacks?: InputEventCallbacks): void {
    this._canvas = canvas
    this._audioManager = audioManager || null
    this._callbacks = callbacks || {}
    this._isInitialized = true
    this.setupEventListeners()
    console.log('🎮 InputManager initialized')
  }

  private setupEventListeners(): void {
    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))

    // 鼠标事件
    if (this._canvas) {
      this._canvas.addEventListener('click', this.handleClick.bind(this))
      this._canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this._keys.add(event.code)
    
    // 播放点击音效
    if (this._audioManager) {
      this._audioManager.playClickSound()
    }
    
    // 处理特殊按键
    switch (event.code) {
      case 'Space':
        event.preventDefault()
        console.log('🚀 Space key pressed - Game should start!')
        if (this._callbacks.onSpacePressed) {
          this._callbacks.onSpacePressed()
        }
        break
      case 'Escape':
        console.log('⏸️ Escape key pressed - Game should pause!')
        if (this._callbacks.onEscapePressed) {
          this._callbacks.onEscapePressed()
        }
        break
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this._keys.delete(event.code)
  }

  private handleClick(event: MouseEvent): void {
    if (!this._canvas) return
    
    const rect = this._canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 播放点击音效
    if (this._audioManager) {
      this._audioManager.playClickSound()
    }
    
    console.log(`🖱️ Click at (${x}, ${y})`)
    
    // 触发点击回调
    if (this._callbacks.onCanvasClick) {
      this._callbacks.onCanvasClick(x, y)
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this._canvas) return
    
    const rect = this._canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 触发鼠标移动回调
    if (this._callbacks.onMouseMove) {
      this._callbacks.onMouseMove(x, y)
    }
  }

  update(): void {
    if (!this._isInitialized) return
    // 输入处理逻辑
  }

  isKeyPressed(keyCode: string): boolean {
    return this._keys.has(keyCode)
  }

  destroy(): void {
    // 移除事件监听器
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    document.removeEventListener('keyup', this.handleKeyUp.bind(this))
    
    if (this._canvas) {
      this._canvas.removeEventListener('click', this.handleClick.bind(this))
      this._canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    }

    this._canvas = null
    this._audioManager = null
    this._isInitialized = false
    this._keys.clear()
    console.log('🎮 InputManager destroyed')
  }
} 