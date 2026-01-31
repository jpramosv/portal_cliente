'use client'

import { useState, useEffect } from 'react'
import { createAppointment } from '@/app/actions/calendar'
import { getPatients } from '@/app/actions/patients'
import { X, Loader2, Calendar as CalendarIcon, Clock, User } from 'lucide-react'

export default function CreateAppointmentModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [patients, setPatients] = useState([])
    const [selectedPatient, setSelectedPatient] = useState(null)

    // Form State
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:00')
    const [notes, setNotes] = useState('')

    // Search Patients debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 1) {
                const { contacts } = await getPatients(1, searchTerm)
                setPatients(contacts || [])
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        // Construct ISO timestamps
        // Input Date + Start Time => ISO
        const startDateTime = new Date(`${date}T${startTime}:00`)
        const endDateTime = new Date(`${date}T${endTime}:00`)

        const { error } = await createAppointment({
            patientId: selectedPatient?.id, // Can be null for anonymous events
            title: title || (selectedPatient ? `Consulta - ${selectedPatient.nome}` : 'Agendamento'),
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            notes
        })

        if (error) {
            alert('Erro ao criar: ' + error)
        } else {
            onClose() // Close modal
            // Reset form
            setTitle('')
            setSelectedPatient(null)
            setNotes('')
        }
        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Novo Agendamento</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Patient Search */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Paciente (Opcional)</label>
                        {selectedPatient ? (
                            <div className="flex items-center justify-between p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <span className="text-sm font-medium text-indigo-900">{selectedPatient.nome}</span>
                                <button type="button" onClick={() => setSelectedPatient(null)} className="text-indigo-400 hover:text-indigo-600">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {patients.length > 0 && searchTerm.length > 1 && (
                                    <div className="absolute top-full left-0 right-0 bg-white shadow-lg border border-gray-100 rounded-lg mt-1 z-10 max-h-48 overflow-y-auto">
                                        {patients.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => { setSelectedPatient(p); setSearchTerm(''); setPatients([]) }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex flex-col"
                                            >
                                                <span className="font-medium text-gray-900">{p.nome}</span>
                                                <span className="text-xs text-gray-500">{p.telefone}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Título</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={selectedPatient ? `Consulta - ${selectedPatient.nome}` : "Ex: Manutenção Mensal"}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Data</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">Início / Fim</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="time"
                                    className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="time"
                                    className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700">Observações</label>
                        <textarea
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                            placeholder="Adicione detalhes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="pt-2 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center"
                        >
                            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                            Agendar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
