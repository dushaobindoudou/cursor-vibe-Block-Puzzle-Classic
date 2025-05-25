export class AudioManager {
  private _isInitialized = false
  private _audioContext: AudioContext | null = null
  private _isUserInteracted = false

  async init(): Promise<void> {
    try {
      // 不在这里创建AudioContext，而是等待用户交互
      this._isInitialized = true
      this.setupUserInteractionListener()
      console.log('🔊 AudioManager initialized (waiting for user interaction)')
    } catch (error) {
      console.warn('⚠️ AudioManager failed to initialize:', error)
    }
  }

  private setupUserInteractionListener(): void {
    const handleUserInteraction = async () => {
      if (this._isUserInteracted) return

      try {
        // 创建音频上下文
        this._audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        if (this._audioContext.state === 'suspended') {
          await this._audioContext.resume()
        }

        this._isUserInteracted = true
        console.log('🔊 AudioContext created after user interaction')

        // 移除监听器
        document.removeEventListener('click', handleUserInteraction)
        document.removeEventListener('keydown', handleUserInteraction)
        document.removeEventListener('touchstart', handleUserInteraction)
      } catch (error) {
        console.warn('⚠️ Failed to create AudioContext:', error)
      }
    }

    // 监听各种用户交互事件
    document.addEventListener('click', handleUserInteraction, { once: true })
    document.addEventListener('keydown', handleUserInteraction, { once: true })
    document.addEventListener('touchstart', handleUserInteraction, { once: true })
  }

  playClickSound(): void {
    if (!this._isInitialized || !this._audioContext || !this._isUserInteracted) {
      console.log('🔇 Audio not ready yet, skipping click sound')
      return
    }
    
    try {
      // 创建简单的点击音效
      const oscillator = this._audioContext.createOscillator()
      const gainNode = this._audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this._audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, this._audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, this._audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.1, this._audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this._audioContext.currentTime + 0.1)
      
      oscillator.start(this._audioContext.currentTime)
      oscillator.stop(this._audioContext.currentTime + 0.1)
    } catch (error) {
      console.warn('⚠️ Failed to play click sound:', error)
    }
  }

  playSuccessSound(): void {
    if (!this._isInitialized || !this._audioContext || !this._isUserInteracted) {
      console.log('🔇 Audio not ready yet, skipping success sound')
      return
    }
    
    try {
      // 创建成功音效
      const oscillator = this._audioContext.createOscillator()
      const gainNode = this._audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this._audioContext.destination)
      
      oscillator.frequency.setValueAtTime(400, this._audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(800, this._audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0.15, this._audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this._audioContext.currentTime + 0.2)
      
      oscillator.start(this._audioContext.currentTime)
      oscillator.stop(this._audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('⚠️ Failed to play success sound:', error)
    }
  }

  get isAudioReady(): boolean {
    return this._isInitialized && this._audioContext !== null && this._isUserInteracted
  }

  destroy(): void {
    if (this._audioContext) {
      this._audioContext.close()
      this._audioContext = null
    }
    this._isInitialized = false
    this._isUserInteracted = false
    console.log('🔊 AudioManager destroyed')
  }
} 