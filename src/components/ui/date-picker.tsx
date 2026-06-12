'use client'
/**
 * Composant DatePicker basé sur @ark-ui/react.
 * Calendrier complet avec sélection jour/mois/année et vues de navigation.
 * Adapté au design system LBS avec support du mode sombre.
 */
import { DatePicker } from '@ark-ui/react/date-picker'
import { Portal } from '@ark-ui/react/portal'
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react'

type LbsDatePickerProps = Readonly<{
  label?: string
  name?: string
  defaultValue?: string
  onValueChange?: (dateStr: string) => void
}>

export const LbsDatePicker = ({
  label = 'Sélectionner une date',
  name,
  defaultValue,
  onValueChange,
}: LbsDatePickerProps): React.JSX.Element => {
  return (
    <DatePicker.Root
      id={name ?? label}
      onValueChange={(details) => {
        const formatted: string = details.valueAsString[0] ?? ''
        if (onValueChange) {
          onValueChange(formatted)
        }
      }}
    >
      <DatePicker.Label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </DatePicker.Label>
      <DatePicker.Control className="focus-within:border-lbs-blue focus-within:ring-lbs-blue/20 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm transition focus-within:ring-2 dark:border-white/10 dark:bg-[#1a2332]">
        <DatePicker.Input
          name={name}
          className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          placeholder="jj/mm/aaaa"
          suppressHydrationWarning
        />
        <DatePicker.Trigger
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
          suppressHydrationWarning
        >
          <Calendar className="size-4" />
        </DatePicker.Trigger>
        <DatePicker.ClearTrigger
          className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
          suppressHydrationWarning
        >
          <X className="size-3.5" />
        </DatePicker.ClearTrigger>
      </DatePicker.Control>
      {name && defaultValue ? (
        <input type="hidden" name={name} defaultValue={defaultValue} />
      ) : null}
      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content className="z-50 mt-2 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#1a2332]">
            <div className="mb-3 flex gap-2">
              <DatePicker.YearSelect className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-800 outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-100" />
              <DatePicker.MonthSelect className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-800 outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-100" />
            </div>
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="mb-2 flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <DatePicker.PrevTrigger className="rounded-lg p-1 transition hover:bg-zinc-100 dark:hover:bg-white/10">
                        <ChevronLeft className="size-4" />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer rounded-lg px-2 py-1 transition hover:bg-zinc-100 dark:hover:bg-white/10">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="rounded-lg p-1 transition hover:bg-zinc-100 dark:hover:bg-white/10">
                        <ChevronRight className="size-4" />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table className="w-full text-center text-sm">
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {datePicker.weekDays.map((weekDay, idx) => (
                            <DatePicker.TableHeader
                              key={idx}
                              className="py-1 text-xs text-zinc-500 dark:text-zinc-400"
                            >
                              {weekDay.short}
                            </DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {datePicker.weeks.map((week, weekIdx) => (
                          <DatePicker.TableRow key={weekIdx}>
                            {week.map((day, dayIdx) => (
                              <DatePicker.TableCell key={dayIdx} value={day}>
                                <DatePicker.TableCellTrigger className="hover:bg-lbs-blue/10 hover:text-lbs-blue focus:ring-lbs-blue/30 data-[selected]:bg-lbs-blue dark:hover:bg-lbs-blue/20 flex size-9 items-center justify-center rounded-lg text-zinc-800 transition focus:ring-2 data-[selected]:text-white dark:text-zinc-200">
                                  {day.day}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="mb-2 flex items-center justify-between">
                      <DatePicker.PrevTrigger className="rounded-lg p-1 transition hover:bg-zinc-100 dark:hover:bg-white/10">
                        <ChevronLeft className="size-4" />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="rounded-lg p-1 transition hover:bg-zinc-100 dark:hover:bg-white/10">
                        <ChevronRight className="size-4" />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table className="w-full text-sm">
                      <DatePicker.TableBody>
                        {datePicker
                          .getMonthsGrid({ columns: 4, format: 'short' })
                          .map((months, rowIdx) => (
                            <DatePicker.TableRow key={rowIdx}>
                              {months.map((month, mIdx) => (
                                <DatePicker.TableCell key={mIdx} value={month.value}>
                                  <DatePicker.TableCellTrigger className="hover:bg-lbs-blue/10 hover:text-lbs-blue rounded-lg px-2 py-1.5 text-zinc-700 transition dark:text-zinc-300">
                                    {month.label}
                                  </DatePicker.TableCellTrigger>
                                </DatePicker.TableCell>
                              ))}
                            </DatePicker.TableRow>
                          ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Context>
                {(datePicker) => (
                  <>
                    <DatePicker.ViewControl className="mb-2 flex items-center justify-between">
                      <DatePicker.PrevTrigger className="rounded-lg p-1 transition hover:bg-zinc-100 dark:hover:bg-white/10">
                        <ChevronLeft className="size-4" />
                      </DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10">
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger className="rounded-lg p-1 transition hover:bg-zinc-100 dark:hover:bg-white/10">
                        <ChevronRight className="size-4" />
                      </DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table className="w-full text-sm">
                      <DatePicker.TableBody>
                        {datePicker.getYearsGrid({ columns: 4 }).map((years, rowIdx) => (
                          <DatePicker.TableRow key={rowIdx}>
                            {years.map((year, yIdx) => (
                              <DatePicker.TableCell key={yIdx} value={year.value}>
                                <DatePicker.TableCellTrigger className="hover:bg-lbs-blue/10 hover:text-lbs-blue rounded-lg px-2 py-1.5 text-zinc-700 transition dark:text-zinc-300">
                                  {year.label}
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                      </DatePicker.TableBody>
                    </DatePicker.Table>
                  </>
                )}
              </DatePicker.Context>
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  )
}
