'use client'

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateSelectorProps {
    date: Date
    onDateChange: (date: Date) => void
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
    const goToPreviousDay = () => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() - 1)
        onDateChange(newDate)
    }

    const goToNextDay = () => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + 1)
        onDateChange(newDate)
    }

    const goToToday = () => {
        onDateChange(new Date())
    }

    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousDay}
                className="h-8 w-8"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "justify-start text-left font-normal h-8 px-3",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'd MMMM yyyy', { locale: ru }) : <span>Выберите дату</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => newDate && onDateChange(newDate)}
                        initialFocus
                        locale={ru}
                    />
                </PopoverContent>
            </Popover>

            <Button
                variant="outline"
                size="icon"
                onClick={goToNextDay}
                className="h-8 w-8"
                disabled={isToday}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {!isToday && (
                <Button
                    variant="ghost"
                    onClick={goToToday}
                    className="h-8 px-3"
                >
                    Сегодня
                </Button>
            )}
        </div>
    )
}
