'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  Move,
  Loader2,
} from 'lucide-react'

interface ImageCropperModalProps {
  isOpen: boolean
  imageSrc: string | null
  onClose: () => void
  onSave: (croppedDataUrl: string) => Promise<void> | void
  isSaving?: boolean
  title?: string
}

const CROP_CONTAINER_SIZE = 300 // px size of square crop container on screen
const CROP_DIAMETER = 240 // px diameter of circular crop mask (80% of container)
const OUTPUT_SIZE = 480 // px dimensions of exported canvas (480x480 crisp)

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  isSaving = false,
  title = 'Crop profile photo',
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; offsetStart: { x: number; y: number } }>({
    x: 0,
    y: 0,
    offsetStart: { x: 0, y: 0 },
  })
  const pinchStartRef = useRef<number | null>(null)
  const zoomStartRef = useRef<number>(1)

  // Reset transform state when imageSrc changes or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1)
      setRotation(0)
      setOffset({ x: 0, y: 0 })

      // Preload image in memory to ensure natural dimensions & loaded state even if DOM event misses
      const img = new Image()
      img.onload = () => {
        setNaturalSize({ w: img.naturalWidth || 400, h: img.naturalHeight || 400 })
        setImageLoaded(true)
      }
      img.onerror = () => {
        setNaturalSize({ w: 400, h: 400 })
        setImageLoaded(true)
      }
      img.src = imageSrc
      if (img.complete && img.naturalWidth > 0) {
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
        setImageLoaded(true)
      }
    }
  }, [isOpen, imageSrc])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setNaturalSize({ w: img.naturalWidth || 400, h: img.naturalHeight || 400 })
    setImageLoaded(true)
    setOffset({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }

  // Calculate base scale to ensure image fills crop circle at zoom = 1
  const effW = rotation % 180 === 0 ? naturalSize.w : naturalSize.h
  const effH = rotation % 180 === 0 ? naturalSize.h : naturalSize.w
  const baseScale = effW && effH ? Math.max(CROP_DIAMETER / effW, CROP_DIAMETER / effH) : 1

  // Compute maximum drag bounds so the crop circle never has empty gaps
  const currentRenderW = effW * baseScale * zoom
  const currentRenderH = effH * baseScale * zoom
  const maxDragX = Math.max(0, (currentRenderW - CROP_DIAMETER) / 2)
  const maxDragY = Math.max(0, (currentRenderH - CROP_DIAMETER) / 2)

  const clampOffset = useCallback(
    (x: number, y: number, currentZoom: number, rot: number) => {
      const eW = rot % 180 === 0 ? naturalSize.w : naturalSize.h
      const eH = rot % 180 === 0 ? naturalSize.h : naturalSize.w
      if (!eW || !eH) return { x: 0, y: 0 }
      const bScale = Math.max(CROP_DIAMETER / eW, CROP_DIAMETER / eH)
      const rW = eW * bScale * currentZoom
      const rH = eH * bScale * currentZoom
      const maxX = Math.max(0, (rW - CROP_DIAMETER) / 2)
      const maxY = Math.max(0, (rH - CROP_DIAMETER) / 2)
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      }
    },
    [naturalSize]
  )

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetStart: { ...offset },
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y
    const nextX = dragStartRef.current.offsetStart.x + deltaX
    const nextY = dragStartRef.current.offsetStart.y + deltaY
    setOffset(clampOffset(nextX, nextY, zoom, rotation))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers (pan and pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        offsetStart: { ...offset },
      }
      pinchStartRef.current = null
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      pinchStartRef.current = dist
      zoomStartRef.current = zoom
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - dragStartRef.current.x
      const deltaY = e.touches[0].clientY - dragStartRef.current.y
      const nextX = dragStartRef.current.offsetStart.x + deltaX
      const nextY = dragStartRef.current.offsetStart.y + deltaY
      setOffset(clampOffset(nextX, nextY, zoom, rotation))
    } else if (e.touches.length === 2 && pinchStartRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const factor = dist / pinchStartRef.current
      const newZoom = Math.min(3, Math.max(1, zoomStartRef.current * factor))
      setZoom(newZoom)
      setOffset((prev) => clampOffset(prev.x, prev.y, newZoom, rotation))
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    pinchStartRef.current = null
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0015
    const newZoom = Math.min(3, Math.max(1, zoom + delta))
    setZoom(newZoom)
    setOffset((prev) => clampOffset(prev.x, prev.y, newZoom, rotation))
  }

  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360
    setRotation(nextRot)
    setOffset({ x: 0, y: 0 })
  }

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom)
    setOffset((prev) => clampOffset(prev.x, prev.y, newZoom, rotation))
  }

  // Canvas Crop & Export
  const handleApplyCrop = async () => {
    if (!imageSrc) return

    // Resilient source resolution: use ref or temporary image
    let sourceImg: HTMLImageElement | null = imageRef.current
    let sW = naturalSize.w || 400
    let sH = naturalSize.h || 400

    if (!sourceImg || !sourceImg.complete || sourceImg.naturalWidth === 0) {
      const tempImg = new Image()
      tempImg.crossOrigin = 'anonymous'
      tempImg.src = imageSrc
      await new Promise<void>((resolve) => {
        if (tempImg.complete) {
          resolve()
        } else {
          tempImg.onload = () => resolve()
          tempImg.onerror = () => resolve()
        }
      })
      sourceImg = tempImg
      sW = tempImg.naturalWidth || 400
      sH = tempImg.naturalHeight || 400
    }

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Translate to center of canvas
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2)

    // Translate offset in canvas coordinates
    const scaleFactor = OUTPUT_SIZE / CROP_DIAMETER
    ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor)

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)

    const effW = rotation % 180 === 0 ? sW : sH
    const effH = rotation % 180 === 0 ? sH : sW
    const bScale = effW && effH ? Math.max(CROP_DIAMETER / effW, CROP_DIAMETER / effH) : 1

    const drawW = sW * bScale * zoom * scaleFactor
    const drawH = sH * bScale * zoom * scaleFactor

    ctx.drawImage(sourceImg, -drawW / 2, -drawH / 2, drawW, drawH)

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    await onSave(croppedDataUrl)
  }

  if (!isOpen || !imageSrc) return null

  const radiusPercent = (CROP_DIAMETER / 2 / CROP_CONTAINER_SIZE) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[380px] rounded-3xl bg-card border border-border text-foreground shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <div>
            <h3 className="font-sans font-bold text-lg text-foreground leading-tight">
              {title}
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Drag to position · Zoom to frame
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Crop Viewport */}
        <div className="p-4 flex flex-col items-center">
          <div
            className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden bg-neutral-900 select-none touch-none cursor-grab active:cursor-grabbing border border-border/60"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* The Image being transformed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              draggable={false}
              className="absolute pointer-events-none select-none max-w-none transition-none"
              style={{
                left: '50%',
                top: '50%',
                width: `${naturalSize.w * baseScale * zoom}px`,
                height: `${naturalSize.h * baseScale * zoom}px`,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />

            {/* Circular Mask & Aperture SVG Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <mask id="crop-circle-mask">
                  <rect width="100" height="100" fill="white" />
                  <circle cx="50" cy="50" r={radiusPercent} fill="black" />
                </mask>
              </defs>
              {/* Outer dimmed region */}
              <rect
                width="100"
                height="100"
                fill="rgba(0, 0, 0, 0.65)"
                mask="url(#crop-circle-mask)"
              />
              {/* Crisp dashed circle border */}
              <circle
                cx="50"
                cy="50"
                r={radiusPercent}
                fill="none"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="0.8"
                strokeDasharray="2 1.5"
              />
            </svg>

            {/* Floating Hint Pill */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-medium text-white/90">
              <Move className="w-3 h-3 opacity-75" />
              <span>Drag to move</span>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="w-[300px] mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">Zoom</span>
              <span className="font-mono text-[11px] font-semibold">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleZoomChange(Math.max(1, zoom - 0.2))}
                className="w-7 h-7 rounded-lg grid place-items-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-[#0F6E6E] dark:accent-[#22D3EE]"
                aria-label="Zoom level"
              />
              <button
                type="button"
                onClick={() => handleZoomChange(Math.min(3, zoom + 0.2))}
                className="w-7 h-7 rounded-lg grid place-items-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions (Rotate & Reset) */}
          <div className="w-[300px] mt-2.5 pt-2 border-t border-border/70 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground py-1 px-2 rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate 90°</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground py-1 px-2 rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 pt-2 border-t border-border flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 h-11 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={!imageSrc || isSaving}
            className="flex-1 h-11 rounded-xl bg-[#0F6E6E] hover:bg-[#0A4F4F] text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving photo...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Set photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
