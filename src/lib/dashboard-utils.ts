type SearchParams = Readonly<Record<string, string | string[] | undefined>>

export const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key]
  if (typeof raw === 'string') return raw
  return Array.isArray(raw) ? (raw[0] ?? '') : ''
}

export const extractCount = ({ value }: Readonly<{ value: number | string | null }>): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export const formatDuration = ({ seconds }: Readonly<{ seconds: number }>): string => {
  const r = Math.max(0, Math.round(seconds))
  if (r === 0) return '—'
  const m = Math.floor(r / 60)
  const s = r % 60
  return m === 0 ? `${s}s` : s > 0 ? `${m}m ${s}s` : `${m}m`
}

export const formatTimeAgo = ({ date }: Readonly<{ date: Date }>): string => {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diff < 60) return `il y a ${Math.max(1, diff)} min`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}
