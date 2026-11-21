import { vi } from 'vitest'

type Success = (position: unknown) => void
type Failure = (error: { code: number; PERMISSION_DENIED: number }) => void

// jsdom has no geolocation. The fake keeps the callbacks of the latest watch so
// a test can push positions or errors into the hook.
export function installFakeGeolocation() {
  let onSuccess: Success = () => {}
  let onFailure: Failure = () => {}
  let nextId = 0

  const watchPosition = vi.fn((ok: Success, fail: Failure) => {
    onSuccess = ok
    onFailure = fail
    nextId += 1
    return nextId
  })
  const clearWatch = vi.fn()

  Object.defineProperty(navigator, 'geolocation', {
    value: { watchPosition, clearWatch },
    configurable: true,
  })

  return {
    watchPosition,
    clearWatch,
    emit: (lat: number, lng: number, accuracy = 5) =>
      onSuccess({ coords: { latitude: lat, longitude: lng, accuracy }, timestamp: 0 }),
    emitRaw: (position: unknown) => onSuccess(position),
    fail: (code: number) => onFailure({ code, PERMISSION_DENIED: 1 }),
  }
}

export function removeFakeGeolocation() {
  Reflect.deleteProperty(navigator, 'geolocation')
}
