'use client'
/**
 * Sélecteur de campagne avec recherche intégrée.
 * Dropdown filtrable sans dépendances externes lourdes.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

type CampaignOption = Readonly<{
  id: string
  title: string
}>
type CampaignSelectProps = Readonly<{
  name: string
  label?: string
  options: readonly CampaignOption[]
  defaultValue?: string
  placeholder?: string
}>

export const CampaignSelect = ({
  name,
  label = 'Campagne',
  options,
  defaultValue = '',
  placeholder = 'Toutes les campagnes',
}: CampaignSelectProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [selectedId, setSelectedId] = useState<string>(defaultValue)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedOption: CampaignOption | undefined = options.find((o) => o.id === selectedId)
  const displayLabel: string = selectedOption?.title ?? placeholder
  const filteredOptions: readonly CampaignOption[] = options.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase())
  )
  const handleToggle = useCallback((): void => {
    setIsOpen((prev) => !prev)
    setSearch('')
  }, [])
  const handleSelect = useCallback((id: string): void => {
    setSelectedId(id)
    setIsOpen(false)
    setSearch('')
  }, [])
  const handleClear = useCallback((): void => {
    setSelectedId('')
    setSearch('')
  }, [])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])
  return (
    <div ref={wrapperRef} className="relative">
      {label.length > 0 ? (
        <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      ) : null}
      <input type="hidden" name={name} value={selectedId} />
      <button
        type="button"
        onClick={handleToggle}
        className="focus:border-lbs-blue focus:ring-lbs-blue/20 flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm shadow-sm transition hover:border-zinc-300 focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#1a2332] dark:text-zinc-100 dark:hover:border-white/20"
      >
        <span
          className={
            selectedId.length > 0
              ? 'text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-400 dark:text-zinc-500'
          }
        >
          {displayLabel}
        </span>
        <div className="flex items-center gap-1">
          {selectedId.length > 0 ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  handleClear()
                }
              }}
              className="rounded p-0.5 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <X className="size-3.5" />
            </span>
          ) : null}
          <ChevronDown
            className={`size-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {isOpen ? (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 dark:border-white/5">
            <Search className="size-3.5 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une campagne..."
              className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto p-1">
            <li>
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedId === ''
                    ? 'bg-lbs-blue/10 text-lbs-blue'
                    : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5'
                }`}
              >
                {placeholder}
                {selectedId === '' ? <Check className="size-3.5" /> : null}
              </button>
            </li>
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-zinc-400">
                Aucune campagne trouvée
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedId === option.id
                        ? 'bg-lbs-blue/10 text-lbs-blue'
                        : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5'
                    }`}
                  >
                    {option.title}
                    {selectedId === option.id ? <Check className="size-3.5" /> : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
