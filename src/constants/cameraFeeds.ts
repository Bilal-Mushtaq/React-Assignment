export type CameraFeedSize = 'sm' | 'md' | 'lg' | 'hero'

const FEED_BY_CAMERA: Record<string, { file: string; label: string }> = {
  cam_1: { file: 'cam_1.jpg', label: 'Mall entrance' },
  cam_2: { file: 'cam_2.jpg', label: 'Food court' },
  cam_3: { file: 'cam_3.jpg', label: 'Central plaza' },
  cam_4: { file: 'cam_4.jpg', label: 'Parking garage' },
  cam_5: { file: 'cam_5.jpg', label: 'Jewelry storefront' },
  cam_6: { file: 'cam_6.jpg', label: 'Parking exit' },
  cam_7: { file: 'cam_7.jpg', label: 'Cinema lobby' },
  cam_8: { file: 'cam_8.jpg', label: 'Kids play area' },
  cam_9: { file: 'cam_9.jpg', label: 'Service corridor' },
  cam_10: { file: 'cam_10.jpg', label: 'Emergency stairs' },
  cam_11: { file: 'cam_11.jpg', label: 'Roof garden' },
  cam_12: { file: 'cam_12.jpg', label: 'Loading bay' },
}

export function getCameraFeedSrc(cameraId: string, _size: CameraFeedSize = 'md') {
  const feed = FEED_BY_CAMERA[cameraId] ?? FEED_BY_CAMERA.cam_3!
  // Cache-bust when assets change during HMR / hard refresh
  return `/camera-feeds/${feed.file}`
}

export function getCameraFeedSrcSet(_cameraId: string, _size: CameraFeedSize = 'md') {
  // Single local asset — no srcSet needed
  return ''
}

export function getCameraFeedLabel(cameraId: string) {
  return FEED_BY_CAMERA[cameraId]?.label ?? 'Mall camera'
}
