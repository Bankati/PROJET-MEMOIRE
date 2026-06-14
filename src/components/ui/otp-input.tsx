'use client'
/**
 * Composant de saisie OTP premium avec 6 champs individuels.
 * Navigation automatique entre les champs, support coller et backspace.
 * Design glassmorphism inspiré du design system LBS.
 */
import { useRef, useCallback } from 'react'

type OtpInputProps = Readonly<{
  value: readonly string[]
  onChange: (value: readonly string[]) => void
  length?: number
  disabled?: boolean
}>

export const OtpInput = ({
  value,
  onChange,
  length = 6,
  disabled = false,
}: OtpInputProps): React.JSX.Element => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const handleChange = useCallback(
    (index: number, inputValue: string): void => {
      if (inputValue.length > 1) {
        const chars: string[] = inputValue.split('').slice(0, length)
        const newOtp: string[] = [...value] as string[]
        chars.forEach((char, i) => {
          if (index + i < length) {
            newOtp[index + i] = char
          }
        })
        onChange(newOtp)
        const nextIndex: number = Math.min(index + chars.length, length - 1)
        inputRefs.current[nextIndex]?.focus()
        return
      }
      const newOtp: string[] = [...value] as string[]
      newOtp[index] = inputValue
      onChange(newOtp)
      if (inputValue.length > 0 && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [value, onChange, length]
  )
  const handleKeyDown = useCallback(
    (index: number, event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Backspace' && value[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault()
        inputRefs.current[index - 1]?.focus()
      }
      if (event.key === 'ArrowRight' && index < length - 1) {
        event.preventDefault()
        inputRefs.current[index + 1]?.focus()
      }
    },
    [value, length]
  )
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>): void => {
      event.preventDefault()
      const pastedData: string = event.clipboardData.getData('text').trim()
      const chars: string[] = pastedData.split('').slice(0, length)
      const newOtp: string[] = Array.from({ length }, () => '')
      chars.forEach((char, i) => {
        newOtp[i] = char
      })
      onChange(newOtp)
      const nextIndex: number = Math.min(chars.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    },
    [onChange, length]
  )
  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] ?? ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={index === 0}
          className="size-14 rounded-2xl border border-white/20 bg-white/10 text-center text-xl font-semibold text-white shadow-lg transition-all duration-200 outline-none placeholder:text-white/30 focus:border-white/50 focus:bg-white/20 focus:ring-2 focus:ring-white/20 disabled:opacity-50"
        />
      ))}
    </div>
  )
}
