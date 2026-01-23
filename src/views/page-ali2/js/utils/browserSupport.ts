export function detectWebGPUSupport(): boolean {
  return typeof (navigator as any).gpu !== 'undefined'
}

export function detectTransferableSupport(): boolean {
  return typeof OffscreenCanvas !== 'undefined' && typeof createImageBitmap === 'function'
}

export function detectWebGL2Support(renderer: THREE.WebGLRenderer): boolean {
  const gl = renderer.getContext()
  return gl && gl instanceof WebGL2RenderingContext
}

export function detectOffscreenCanvasSupport(): boolean {
  return typeof OffscreenCanvas !== 'undefined'
}

export function detectCanvasSupport(): boolean {
  return typeof document !== 'undefined' && !!document.createElement('canvas')
}
