'use client'

import { useState, useEffect } from 'react'
import { Pencil, TrendingUp } from 'lucide-react'
import { Tracker } from '@/types'
import { getEntry, saveEntry } from '@/lib/storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface TrackerCardProps {
    tracker: Tracker
    date: string
    onEdit: (tracker: Tracker) => void
    onUpdate: () => void
}

export function TrackerCard({ tracker, date, onEdit, onUpdate }: TrackerCardProps) {
    const router = useRouter()
    const [value, setValue] = useState<boolean | number | null>(null)
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const entry = getEntry(tracker.id, date)
        if (entry) {
            if (tracker.type === 'boolean') {
                setValue(entry.valueBoolean ?? false)
            } else {
                setValue(entry.valueNumber ?? null)
                setInputValue(entry.valueNumber?.toString() ?? '')
            }
        } else {
            setValue(tracker.type === 'boolean' ? false : null)
            setInputValue('')
        }
    }, [tracker.id, date, tracker.type])

    const handleBooleanChange = (checked: boolean) => {
        setValue(checked)
        saveEntry({
            trackerId: tracker.id,
            date,
            valueBoolean: checked,
        })
        onUpdate()
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInputValue(val)

        const numVal = parseFloat(val)
        if (!isNaN(numVal) && val !== '') {
            setValue(numVal)
            // Debounce save
            setTimeout(() => {
                saveEntry({
                    trackerId: tracker.id,
                    date,
                    valueNumber: numVal,
                })
                onUpdate()
            }, 500)
        }
    }

    return (
        <Card className="relative">
            <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tracker.color }}
                        />
                        <CardTitle className="text-sm font-medium truncate">{tracker.name}</CardTitle>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onEdit(tracker)}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => router.push(`/analytics/${tracker.id}`)}
                        >
                            <TrendingUp className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
                {tracker.type === 'quantitative' && tracker.unit && (
                    <p className="text-xs text-muted-foreground mt-0.5">{tracker.unit}</p>
                )}
            </CardHeader>
            <CardContent className="px-3 pb-3">
                {tracker.type === 'boolean' ? (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`tracker-${tracker.id}`}
                            checked={value === true}
                            onCheckedChange={handleBooleanChange}
                        />
                        <label
                            htmlFor={`tracker-${tracker.id}`}
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Выполнено
                        </label>
                    </div>
                ) : (
                    <Input
                        type="number"
                        placeholder="0"
                        value={inputValue}
                        onChange={handleNumberChange}
                        className="h-8 text-sm"
                    />
                )}
            </CardContent>
        </Card>
    )
}
