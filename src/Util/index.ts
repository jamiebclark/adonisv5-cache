import { MinutesInput } from "@ioc:AdonisV5Cache"

export function serialize(data: object) {
  return JSON.stringify(data)
}

export function deserialize(data: string) {
  return JSON.parse(data)
}

export async function valueOf(value: any) {
  if (typeof value === 'function') {
    value = value()
  }
  return value
}

/**
 * Returns integer number between two numbers (inclusive)
 * 
 */
export function randomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getMinutes(duration: MinutesInput): number | null {
  if (duration === undefined) {
    return null;
  }
  if (duration instanceof Date) {
    duration = ((duration.getTime() - Date.now()) / 1000) / 60
  }
  return (duration * 60) > 0 ? duration : null
}

export function getMinutesOrZero(duration: MinutesInput): number {
  return getMinutes(duration) ?? 0
}