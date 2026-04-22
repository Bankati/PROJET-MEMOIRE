"use client";
/**
 * Sélecteur dropdown filtrable réutilisable.
 * Même style que CampaignSelect mais générique pour tout type d'option.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

type FilterOption = Readonly<{
  value: string;
  label: string;
}>;
type FilterSelectProps = Readonly<{
  name: string;
  label?: string;
  options: readonly FilterOption[];
  defaultValue?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}>;

export const FilterSelect = ({
  name,
  label = "",
  options,
  defaultValue = "",
  placeholder = "Tous",
  searchable = true,
  searchPlaceholder = "Rechercher...",
}: FilterSelectProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedOption: FilterOption | undefined = options.find((o) => o.value === selectedValue);
  const displayLabel: string = selectedOption?.label ?? placeholder;
  const filteredOptions: readonly FilterOption[] = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;
  const handleToggle = useCallback((): void => {
    setIsOpen((prev) => !prev);
    setSearch("");
  }, []);
  const handleSelect = useCallback((value: string): void => {
    setSelectedValue(value);
    setIsOpen(false);
    setSearch("");
  }, []);
  const handleClear = useCallback((): void => {
    setSelectedValue("");
    setSearch("");
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  return (
    <div ref={wrapperRef} className="relative">
      {label.length > 0 ? (
        <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      ) : null}
      <input type="hidden" name={name} value={selectedValue} />
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm shadow-sm transition hover:border-zinc-300 focus:border-lbs-blue focus:outline-none focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/10 dark:bg-[#1a2332] dark:text-zinc-100 dark:hover:border-white/20"
      >
        <span className={selectedValue.length > 0 ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}>
          {displayLabel}
        </span>
        <div className="flex items-center gap-1">
          {selectedValue.length > 0 ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); handleClear(); } }}
              className="rounded p-0.5 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <X className="size-3.5" />
            </span>
          ) : null}
          <ChevronDown className={`size-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#1a2332]">
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 dark:border-white/5">
              <Search className="size-3.5 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          ) : null}
          <ul className="max-h-52 overflow-y-auto p-1">
            <li>
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  selectedValue === ""
                    ? "bg-lbs-blue/10 text-lbs-blue"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5"
                }`}
              >
                {placeholder}
                {selectedValue === "" ? <Check className="size-3.5" /> : null}
              </button>
            </li>
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-zinc-400">Aucun résultat</li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedValue === option.value
                        ? "bg-lbs-blue/10 text-lbs-blue"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5"
                    }`}
                  >
                    {option.label}
                    {selectedValue === option.value ? <Check className="size-3.5" /> : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
