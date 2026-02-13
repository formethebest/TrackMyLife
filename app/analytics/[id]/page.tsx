'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { Tracker, Entry } from '@/types'
import { getTrackers, getEntriesForTracker } from '@/lib/storage'
import { getDateRange } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function AnalyticsPage() {
    const params = useParams()
    const router = useRouter()
    const trackerId = params.id as string

    const [tracker, setTracker] = useState<Tracker | null>(null)
    const [entries, setEntries] = useState<Entry[]>([])
    const [period, setPeriod] = useState<7 | 30>(7)

    useEffect(() => {
        const trackers = getTrackers()
        const found = trackers.find((t) => t.id === trackerId)
        if (!found) {
            router.push('/')
            return
        }
        setTracker(found)
        loadEntries(found, period)
    }, [trackerId, period, router])

    const loadEntries = (tracker: Tracker, days: number) => {
        const { start, end } = getDateRange(days)
        const data = getEntriesForTracker(tracker.id, start, end)
        setEntries(data)
    }

    if (!tracker) {
        return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
    }

    // Prepare chart data
    const { start, end } = getDateRange(period)
    const chartData = []
    const startDate = new Date(start)
    const endDate = new Date(end)

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        const entry = entries.find((e) => e.date === dateStr)

        let value = 0
        if (entry) {
            if (tracker.type === 'boolean') {
                value = entry.valueBoolean ? 1 : 0
            } else {
                value = entry.valueNumber || 0
            }
        }

        chartData.push({
            date: format(d, 'd MMM', { locale: ru }),
            value,
            fullDate: dateStr,
        })
    }

    // Calculate statistics
    const values = entries
        .map((e) => (tracker.type === 'boolean' ? (e.valueBoolean ? 1 : 0) : e.valueNumber || 0))
        .filter((v) => v !== null && v !== undefined)

    const stats = {
        count: values.length,
        average: values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0',
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        total: values.reduce((a, b) => a + b, 0),
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад
                    </Button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tracker.color }} />
                        <h1 className="text-3xl font-bold">{tracker.name}</h1>
                    </div>
                    <p className="text-muted-foreground">
                        {tracker.type === 'boolean' ? 'Да/Нет трекер' : `Количественный трекер (${tracker.unit})`}
                    </p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={period === 7 ? 'default' : 'outline'}
                        onClick={() => setPeriod(7)}
                    >
                        Неделя
                    </Button>
                    <Button
                        variant={period === 30 ? 'default' : 'outline'}
                        onClick={() => setPeriod(30)}
                    >
                        Месяц
                    </Button>
                </div>

                {/* Chart */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>График за последние {period} дней</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="date"
                                    className="text-xs"
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <YAxis
                                    className="text-xs"
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="value" fill={tracker.color} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Среднее</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.average}
                                {tracker.type === 'quantitative' && tracker.unit && (
                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                        {tracker.unit}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Минимум</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.min}
                                {tracker.type === 'quantitative' && tracker.unit && (
                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                        {tracker.unit}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Максимум</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.max}
                                {tracker.type === 'quantitative' && tracker.unit && (
                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                        {tracker.unit}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Дней с данными</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.count}</div>
                        </CardContent>
                    </Card>
                </div>

                {tracker.type === 'boolean' && (
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Процент выполнения</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {period > 0 ? Math.round((stats.total / period) * 100) : 0}%
                            </div>
                            <p className="text-muted-foreground mt-2">
                                {stats.total} из {period} дней
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    )
}
