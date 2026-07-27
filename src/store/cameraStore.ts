import { create } from 'zustand'
import type { Camera, CameraStatus } from '../types/domain'
import { createInitialCameras } from '../constants/mockData'

export type CameraState = {
  cameras: Camera[]
  updateStatus: (cameraId: string, status: CameraStatus) => void
  updateConfidence: (cameraId: string, confidence: number) => void
  touchEvent: (cameraId: string) => void
  getOnlineCount: () => number
  getAverageConfidence: () => number
}

export const useCameraStore = create<CameraState>((set, get) => ({
  cameras: createInitialCameras(),

  updateStatus: (cameraId, status) => {
    const now = Date.now()
    set((s) => ({
      cameras: s.cameras.map((c) =>
        c.id === cameraId ? { ...c, status, statusChangedAt: now, lastEventAt: now } : c,
      ),
    }))
  },

  updateConfidence: (cameraId, confidence) => {
    set((s) => ({
      cameras: s.cameras.map((c) =>
        c.id === cameraId
          ? { ...c, aiConfidence: Math.min(100, Math.max(0, confidence)), lastEventAt: Date.now() }
          : c,
      ),
    }))
  },

  touchEvent: (cameraId) => {
    set((s) => ({
      cameras: s.cameras.map((c) => (c.id === cameraId ? { ...c, lastEventAt: Date.now() } : c)),
    }))
  },

  getOnlineCount: () =>
    get().cameras.filter((c) => c.status === 'online' || c.status === 'recording').length,

  getAverageConfidence: () => {
    const cameras = get().cameras
    if (cameras.length === 0) return 0
    const sum = cameras.reduce((acc, c) => acc + c.aiConfidence, 0)
    return Math.round(sum / cameras.length)
  },
}))
