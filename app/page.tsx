'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { getTrackers } from '@/lib/storage'
import { useAuth } from '@/lib/auth-context'
import { Tracker } from '@/types'
import { ThemeToggle } from '@/components/theme-toggle'
import { TrackerCard } from '@/components/tracker-card'
import { TrackerForm } from '@/components/tracker-form'
import { DateSelector } from '@/components/date-selector'
import { Button } from '@/components/ui/button'

export default function Home() {
    const { user, loading: authLoading, signOut } = useAuth()
    const [trackers, setTrackers] = useState<Tracker[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTracker, setEditingTracker] = useState<Tracker | null>(null)

    const loadTrackers = useCallback(async () => {
        const data = await getTrackers()
        setTrackers(data)
    }, [])

    useEffect(() => {
        if (user) {
            loadTrackers()
        }
    }, [user, loadTrackers])

    const handleTrackerSaved = () => {
        loadTrackers()
        setIsFormOpen(false)
        setEditingTracker(null)
    }

    const handleEditTracker = (tracker: Tracker) => {
        setEditingTracker(tracker)
        setIsFormOpen(true)
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setEditingTracker(null)
    }

    const handleDateChange = (newDate: Date) => {
        setCurrentDate(newDate)
    }

    if (authLoading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Загрузка...</p>
            </main>
        )
    }

    const dateString = format(currentDate, 'yyyy-MM-dd')

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-3 md:p-4">
                {/* Header */}
                <header className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">TrackMyLife</h1>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={signOut}
                            title="Выйти"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                {/* Date Selector */}
                <div className="mb-4">
                    <DateSelector date={currentDate} onDateChange={handleDateChange} />
                </div>

                {/* Add Tracker Button */}
                <div className="mb-4">
                    <Button
                        onClick={() => setIsFormOpen(true)}
                        className="w-full sm:w-auto h-8 text-sm"
                        size="sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить трекер
                    </Button>
                </div>

                {/* Trackers Grid */}
                {trackers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-sm mb-4">
                            У вас пока нет трекеров
                        </p>
                        <Button onClick={() => setIsFormOpen(true)} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Создать первый трекер
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {trackers.map((tracker) => (
                            <TrackerCard
                                key={tracker.id}
                                tracker={tracker}
                                date={dateString}
                                onEdit={handleEditTracker}
                                onUpdate={loadTrackers}
                            />
                        ))}
                    </div>
                )}

                {/* Tracker Form Dialog */}
                <TrackerForm
                    open={isFormOpen}
                    onClose={handleCloseForm}
                    onSaved={handleTrackerSaved}
                    tracker={editingTracker}
                />
            </div>
        </main>
    )
}
