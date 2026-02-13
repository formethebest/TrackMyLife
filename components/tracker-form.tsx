'use client'

import { useState, useEffect } from 'react'
import { Tracker } from '@/types'
import { addTracker, updateTracker, deleteTracker } from '@/lib/storage'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface TrackerFormProps {
    open: boolean
    onClose: () => void
    onSaved: () => void
    tracker?: Tracker | null
}

const COLORS = [
    { name: 'Красный', value: '#EF4444' },
    { name: 'Оранжевый', value: '#F97316' },
    { name: 'Жёлтый', value: '#EAB308' },
    { name: 'Зелёный', value: '#22C55E' },
    { name: 'Синий', value: '#3B82F6' },
    { name: 'Фиолетовый', value: '#A855F7' },
    { name: 'Розовый', value: '#EC4899' },
    { name: 'Бирюзовый', value: '#14B8A6' },
]

export function TrackerForm({ open, onClose, onSaved, tracker }: TrackerFormProps) {
    const [name, setName] = useState('')
    const [type, setType] = useState<'boolean' | 'quantitative'>('quantitative')
    const [unit, setUnit] = useState('')
    const [color, setColor] = useState(COLORS[0].value)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        if (tracker) {
            setName(tracker.name)
            setType(tracker.type)
            setUnit(tracker.unit || '')
            setColor(tracker.color)
        } else {
            setName('')
            setType('quantitative')
            setUnit('')
            setColor(COLORS[0].value)
        }
    }, [tracker, open])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) return
        if (type === 'quantitative' && !unit.trim()) return

        const trackerData = {
            name: name.trim(),
            type,
            unit: type === 'quantitative' ? unit.trim() : undefined,
            color,
        }

        if (tracker) {
            updateTracker(tracker.id, trackerData)
        } else {
            addTracker(trackerData)
        }

        onSaved()
    }

    const handleDelete = () => {
        if (tracker) {
            deleteTracker(tracker.id)
            onSaved()
            setShowDeleteConfirm(false)
        }
    }

    return (
        <>
            <Dialog open={open && !showDeleteConfirm} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {tracker ? 'Редактировать трекер' : 'Создать трекер'}
                        </DialogTitle>
                        <DialogDescription>
                            {tracker
                                ? 'Измените параметры трекера'
                                : 'Добавьте новый трекер для отслеживания привычки'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Название</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Instagram, Медитация, Шаги..."
                                    maxLength={50}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Тип метрики</Label>
                                <RadioGroup value={type} onValueChange={(v) => setType(v as any)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="boolean" id="boolean" />
                                        <Label htmlFor="boolean" className="font-normal">
                                            Да/Нет (чекбокс)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="quantitative" id="quantitative" />
                                        <Label htmlFor="quantitative" className="font-normal">
                                            Количественная (число)
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {type === 'quantitative' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Единица измерения</Label>
                                    <Input
                                        id="unit"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        placeholder="минут, часов, шагов, страниц..."
                                        maxLength={20}
                                        required
                                    />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label>Цвет</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setColor(c.value)}
                                            className={`h-10 rounded-md transition-all ${color === c.value
                                                    ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                                                    : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            {tracker && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="sm:mr-auto"
                                >
                                    Удалить
                                </Button>
                            )}
                            <Button type="button" variant="outline" onClick={onClose}>
                                Отмена
                            </Button>
                            <Button type="submit">
                                {tracker ? 'Сохранить' : 'Создать'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить трекер?</DialogTitle>
                        <DialogDescription>
                            Это действие нельзя отменить. Будут удалены все данные этого трекера.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Отмена
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
