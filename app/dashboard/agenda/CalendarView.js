'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CreateAppointmentModal from './CreateAppointmentModal'

export default function CalendarView({ appointments }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Calculate week range
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday start
    const endDate = endOfWeek(currentDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    // Generate time slots (8:00 to 19:00)
    const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8)

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const today = () => setCurrentDate(new Date())

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900 capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={prevWeek} className="p-1 hover:bg-white hover:shadow rounded-md transition-all text-gray-500">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={today} className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-white hover:shadow rounded-md transition-all">
                            Hoje
                        </button>
                        <button onClick={nextWeek} className="p-1 hover:bg-white hover:shadow rounded-md transition-all text-gray-500">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Novo Agendamento</span>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-1 overflow-hidden">
                {/* Time Column */}
                <div className="w-16 flex-shrink-0 border-r border-gray-100 overflow-y-auto custom-scrollbar bg-gray-50/50">
                    <div className="h-10"></div> {/* Header spacer */}
                    {timeSlots.map(hour => (
                        <div key={hour} className="h-20 text-xs text-gray-400 text-right pr-2 pt-2 border-b border-gray-100/50 relative">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                <div className="flex-1 flex flex-col min-w-0 overflow-x-auto">
                    {/* Days Header */}
                    <div className="flex border-b border-gray-100">
                        {days.map(day => (
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

                    {/* Days Body */}
                    <div className="flex-1 flex overflow-y-auto custom-scrollbar relative">
                        {/* Horizontal Lines for Grid */}
                        <div className="absolute inset-0 z-0 pointer-events-none w-full">
                            {timeSlots.map(hour => (
                                <div key={hour} className="h-20 border-b border-gray-100 w-full"></div>
                            ))}
                        </div>

                        {days.map(day => (
                            <div key={day.toString()} className="flex-1 min-w-[120px] border-r border-gray-50 relative z-10 group">
                                {timeSlots.map(hour => {
                                    // Use setHours on a new date object correctly
                                    const slotStart = new Date(day)
                                    slotStart.setHours(hour, 0, 0, 0)

                                    // Filter appointments for this slot
                                    const slotAppointments = appointments.filter(apt => {
                                        if (!apt.start_time) return false
                                        // Be resilient with date parsing
                                        const aptStart = new Date(apt.start_time)

                                        // Simple comparison (ignoring minute precision for visual slot for now, or just hour matching)
                                        return isSameDay(aptStart, day) && aptStart.getHours() === hour
                                    })

                                    return (
                                        <div key={hour} className="h-20 relative hover:bg-gray-50/30 transition-colors">
                                            {/* Render Appointments */}
                                            {slotAppointments.map(apt => (
                                                <div
                                                    key={apt.id}
                                                    className="absolute inset-x-1 top-1 bottom-1 bg-indigo-100 border-l-4 border-indigo-500 rounded-r shadow-sm p-1.5 overflow-hidden text-xs hover:brightness-95 cursor-pointer z-50 transition-all"
                                                    title={`${apt.title || 'Agendamento'}\n${new Date(apt.start_time).toLocaleTimeString()} - ${new Date(apt.end_time).toLocaleTimeString()}`}
                                                >
                                                    <div className="font-semibold text-indigo-900 truncate">
                                                        {apt.title || (apt.patient ? apt.patient.nome : 'Sem Título')}
                                                    </div>
                                                    <div className="text-indigo-700 truncate">
                                                        {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <CreateAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}
