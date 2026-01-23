/**
 * Worker管理器 - 管理Web Worker相关操作
 */
import { UltimateBridgeOptions } from './types'

export class WorkerManager {
  private worker?: Worker
  private enabled: boolean
  private options: any // 简化选项类型

  constructor(options?: any) {
    this.enabled = options?.enableWorker ?? false
    this.options = options
  }

  async initialize(): Promise<void> {
    if (!this.enabled) {
      return
    }

    try {
      if (this.options.workerScript) {
        this.worker = new Worker(this.options.workerScript)
      } else {
        // 使用内联 Worker 脚本
        const workerScript = `
          self.onmessage = function(e) {
            const { type, data } = e.data;
            switch(type) {
              case 'process':
                // 处理数据
                self.postMessage({ type: 'result', data: data });
                break;
            }
          };
        `
        const blob = new Blob([workerScript], { type: 'application/javascript' })
        this.worker = new Worker(URL.createObjectURL(blob))
      }
    } catch (error) {
      console.warn('Worker initialization failed:', error)
    }
  }

  postMessage(message: any): void {
    if (this.worker) {
      this.worker.postMessage(message)
    }
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = undefined
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }

  dispose(): void {
    this.terminate()
  }
}
