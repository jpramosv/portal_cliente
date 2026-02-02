'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Grid } from 'lucide-react'
import {
    format, addDays, startOfWeek, endOfWeek, isSameDay, eachDayOfInterval,
    addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth,
    isSameMonth, parseISO
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CreateAppointmentModal from './CreateAppointmentModal'

export default function CalendarView({ appointments }) {
    const DENTISTS = [
        { id: 5672613848547328, name: 'Silvana Maria Bernardi Lopes', color: 'bg-yellow-200 border-yellow-500 text-yellow-900', dot: 'bg-yellow-400' },
        { id: 6348578954149888, name: 'Petrus Bernardi Lopes', color: 'bg-blue-200 border-blue-500 text-blue-900', dot: 'bg-blue-400' },
    ]

    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState('week') // 'month', 'week', 'day'
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDentists, setSelectedDentists] = useState(DENTISTS.map(d => d.id))

    // Navigation handlers
    const next = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
        else setCurrentDate(addDays(currentDate, 1))
    }

    const prev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
        else setCurrentDate(addDays(currentDate, -1))
    }

    const today = () => setCurrentDate(new Date())

    // Filtering logic
    const toggleDentist = (id) => {
        setSelectedDentists(prev =>
            prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
        )
    }

    const filteredAppointments = appointments.filter(apt => {
        if (apt["Deleted"] || apt["Canceled"]) return false
        if (apt.dentist_id && !selectedDentists.includes(Number(apt.dentist_id))) return false
        return true
    })

    // --- VIEW CALCULATIONS ---

    // 1. Month View Grid
    const getMonthDays = () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
        return eachDayOfInterval({ start: startDate, end: endDate })
    }

    // 2. Week/Day View Headers
    const getHeaderDays = () => {
        if (view === 'day') return [currentDate]

        // Week view
        const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
        const endDate = endOfWeek(currentDate, { weekStartsOn: 0 })
        return eachDayOfInterval({ start: startDate, end: endDate })
    }

    const headerDays = getHeaderDays()
    const monthGridDays = view === 'month' ? getMonthDays() : []
    // Generate time slots (8:00 to 19:00, 30 min intervals)
    const timeSlots = []
    for (let i = 8; i < 19; i++) {
        timeSlots.push({ hour: i, minutes: 0, label: `${i}:00` })
        timeSlots.push({ hour: i, minutes: 30, label: `${i}:30` })
    }

    // Helper to get appointments for a specific day (for Month view)
    // Helper to get appointments for a specific day (for Month view)
    const getAptDate = (apt) => {
        if (apt.date) {
            // Treat the date string (YYYY-MM-DD...) as LOCAL midnight to avoid TZ shifts
            // If we just parse Date(apt.date), it treats as UTC and shifts to prev day in -3h.
            // We want "2026-02-04" -> Feb 4th Local
            const dateStr = typeof apt.date === 'string' ? apt.date.split('T')[0] : apt.date
            // Parsing YYYY-MM-DD + 'T00:00' ensures local time in most browsers/date-fns usage
            return parseISO(dateStr)
        }
        return new Date(apt.start_time)
    }

    const getAppointmentsForDay = (day) => {
        return filteredAppointments.filter(apt => {
            const aptDate = getAptDate(apt)
            return isSameDay(aptDate, day)
        })
    }

    return (
        <div className="flex h-[calc(100vh-140px)] gap-4">
            {/* Sidebar */}
            <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col shrink-0 overflow-y-auto hidden md:flex">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">Profissionais</h3>
                </div>
                <div className="p-2 space-y-1">
                    {DENTISTS.map(dentist => (
                        <button
                            key={dentist.id}
                            onClick={() => toggleDentist(dentist.id)}
                            className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${selectedDentists.includes(dentist.id) ? 'bg-gray-50' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className={`w-4 h-4 rounded-full ${dentist.dot} ${selectedDentists.includes(dentist.id) ? 'ring-2 ring-offset-1 ring-gray-200' : ''}`}></div>
                            <span className="text-gray-700 text-left truncate">{dentist.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0">

                {/* Header Controls */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 shrink-0">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-900 capitalize min-w-[200px]">
                            {view === 'day'
                                ? format(currentDate, "d 'de' MMMM", { locale: ptBR })
                                : format(currentDate, 'MMMM yyyy', { locale: ptBR })
                            }
                        </h2>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={prev} className="p-1 hover:bg-white hover:shadow rounded-md transition-all text-gray-500">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={today} className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-white hover:shadow rounded-md transition-all">
                                Hoje
                            </button>
                            <button onClick={next} className="p-1 hover:bg-white hover:shadow rounded-md transition-all text-gray-500">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setView('day')} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'day' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                Dia
                            </button>
                            <button onClick={() => setView('week')} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'week' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                Semana
                            </button>
                            <button onClick={() => setView('month')} className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'month' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                Mês
                            </button>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Novo</span>
                        </button>
                    </div>
                </div>

                {/* View Content */}
                <div className="flex-1 overflow-hidden flex flex-col relative">

                    {/* MONTH VIEW */}
                    {view === 'month' && (
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                                    <div key={d} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                                        {d}
                                    </div>
                                ))}
                                {monthGridDays.map(day => {
                                    const dayApts = getAppointmentsForDay(day)
                                    const isCurrentMonth = isSameMonth(day, currentDate)

                                    return (
                                        <div key={day.toString()} className={`bg-white min-h-[120px] p-2 flex flex-col gap-1 ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''}`}>
                                            <div className={`text-sm font-medium mb-1 ${isSameDay(day, new Date()) ? 'text-indigo-600' : ''}`}>
                                                {format(day, 'd')}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[120px] custom-scrollbar">
                                                {dayApts.map(apt => {
                                                    const dentist = DENTISTS.find(d => d.id === Number(apt.dentist_id))
                                                    const colorClasses = dentist ? dentist.dot : 'bg-gray-400' // Use dot color for background pill

                                                    return (
                                                        <div key={apt.id} className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate ${colorClasses.replace('bg-', 'bg-').replace('400', '500')}`} title={apt.patient?.nome || apt.metadata?.title}>
                                                            {format(new Date(apt.start_time), 'HH:mm')} {apt.patient?.nome || apt.metadata?.title || 'Bob'}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* WEEK / DAY VIEW */}
                    {(view === 'week' || view === 'day') && (
                        <div className="absolute inset-0 overflow-auto custom-scrollbar">
                            <div className="min-w-[800px] flex flex-col">
                                {/* Header Row (Sticky Top) */}
                                <div className="sticky top-0 z-20 flex bg-white border-b border-gray-100 shadow-sm">
                                    <div className="w-16 sticky left-0 z-30 bg-white border-r border-gray-100 shrink-0"></div> {/* Corner Spacer */}
                                    {headerDays.map(day => (
                                        <div key={day.toString()} className={`flex-1 min-w-[120px] py-3 text-center border-r border-gray-50 ${isSameDay(day, new Date()) ? 'bg-indigo-50/50' : ''}`}>
                                            <div className={`text-xs font-semibold uppercase ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                {format(day, 'EEE', { locale: ptBR })}
                                            </div>
                                            <div className={`text-lg mt-1 font-medium ${isSameDay(day, new Date()) ? 'text-indigo-700' : 'text-gray-900'}`}>
                                                {format(day, 'd')}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Body Rows */}
                                <div className="flex">
                                    {/* Time Column (Sticky Left) */}
                                    <div className="w-16 sticky left-0 z-10 bg-white border-r border-gray-100 shrink-0">
                                        {timeSlots.map((slot, i) => (
                                            <div key={i} className="h-8 text-xs text-gray-400 text-right pr-2 pt-1 border-b border-gray-100/50 relative">
                                                {slot.label}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Grid Cells */}
                                    {headerDays.map(day => (
                                        <div key={day.toString()} className="flex-1 min-w-[120px] border-r border-gray-50 relative z-0">
                                            {timeSlots.map((slot, i) => {
                                                const slotStart = new Date(day)
                                                slotStart.setHours(slot.hour, slot.minutes, 0, 0)

                                                // Find appointments for this slot (match 30min window)
                                                const slotApts = filteredAppointments.filter(apt => {
                                                    const aptDate = getAptDate(apt)
                                                    const aptTime = new Date(apt.start_time)

                                                    const sameDay = isSameDay(aptDate, day)
                                                    const sameHour = aptTime.getHours() === slot.hour
                                                    const aptMin = aptTime.getMinutes()
                                                    const sameBucket = aptMin >= slot.minutes && aptMin < (slot.minutes + 30)

                                                    return sameDay && sameHour && sameBucket
                                                })

                                                return (
                                                    <div key={i} className="h-8 relative border-b border-gray-100/50 hover:bg-gray-50/30 transition-colors group">
                                                        {slotApts.map((apt, index) => {
                                                            const width = 100 / slotApts.length
                                                            const left = index * width
                                                            const dentist = DENTISTS.find(d => d.id === Number(apt.dentist_id))
                                                            const colorClasses = dentist ? dentist.color : 'bg-indigo-100 border-indigo-500 text-indigo-900'

                                                            return (
                                                                <div
                                                                    key={apt.id}
                                                                    className={`absolute inset-y-0.5 border-l-4 rounded-r shadow-sm px-1 py-0 overflow-hidden text-[10px] hover:brightness-95 cursor-pointer z-50 transition-all ${colorClasses}`}
                                                                    style={{ width: `${width}%`, left: `${left}%` }}
                                                                    title={`${apt.patient?.nome || apt.metadata?.title}\n${apt["Procedures"]}`}
                                                                >
                                                                    <div className="font-semibold truncate flex items-center h-full">
                                                                        <span className="truncate">{apt.patient?.nome || apt.metadata?.title || 'Sem Nome'}</span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <CreateAppointmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </div>
    )
}
