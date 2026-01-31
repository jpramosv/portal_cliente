import { getAppointments } from '@/app/actions/calendar'
import CalendarView from './CalendarView'
import { startOfMonth, endOfMonth } from 'date-fns'

export default async function AgendaPage() {
    // Initial fetch for current month to optimize load
    const today = new Date()
    const start = startOfMonth(today)
    const end = endOfMonth(today)

    // Fetch broadly to cover month view, UI can fetch more specific if needed later
    // For MVP we fetch everything from DB or a wide range? 
    // Let's fetch current month + surrounding weeks or just all for now if volume is low.
    // For safety, let's fetch a wide window around today (e.g. -1 month to +2 months)

    // Wait, getAppointments actions supports start/end.
    // Let's just pass reasonable defaults.

    const { appointments, error } = await getAppointments() // No range = fetch all (careful with scale, but fine for MVP)

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
                    <p className="text-sm text-gray-500">Gerencie seus horários e atendimentos</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg text-red-800 shrink-0">
                    Erro ao carregar agenda: {error}
                </div>
            )}

            <div className="flex-1 min-h-0">
                <CalendarView appointments={appointments || []} />
            </div>
        </div>
    )
}
