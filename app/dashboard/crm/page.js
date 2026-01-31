import { getPatients } from '@/app/actions/patients'
import { getAllConversations } from '@/app/actions/chatwoot'
import { getColumns, getDeals } from '@/app/actions/crm'
import { Mail, Phone, Calendar, User, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import KanbanBoard from './KanbanBoard'
import ContactListActions from './ContactListActions'

export default async function CRMPage({ searchParams }) {
    const page = (await searchParams)?.page ? parseInt((await searchParams).page) : 1
    const view = (await searchParams)?.view || 'kanban' // Default to Kanban

    let patientsData = { contacts: [], meta: {} }
    let kanbanData = { columns: [], deals: [] }
    let error = null

    // Fetch data based on view to save resources
    if (view === 'list') {
        const res = await getPatients(page)
        patientsData = res
        error = res.error
    } else {
        // Parallel fetch for Kanban
        const [columnsRes, dealsRes] = await Promise.all([
            getColumns(),
            getDeals()
        ])

        kanbanData = {
            columns: columnsRes.columns || [],
            deals: dealsRes.deals || []
        }

        if (columnsRes.error) error = columnsRes.error
        if (dealsRes.error) error = dealsRes.error
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
                    <p className="text-sm text-gray-500">Gerencie seus contatos e atendimentos</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <Link
                        href="/dashboard/crm?view=kanban"
                        className={`p-2 rounded-md transition-all ${view === 'kanban' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Visualização Kanban"
                    >
                        <LayoutGrid size={20} />
                    </Link>
                    <Link
                        href="/dashboard/crm?view=list"
                        className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Visualização Lista"
                    >
                        <List size={20} />
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-lg text-red-800 shrink-0">
                    Erro ao carregar dados: {error}
                </div>
            )}

            {view === 'kanban' ? (
                <div className="flex-1 min-h-0">
                    <KanbanBoard
                        columns={kanbanData.columns}
                        initialDeals={kanbanData.deals}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Última Mensagem
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Atualizado em
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Ações</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {patientsData.contacts?.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                        <User size={20} />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{contact.nome || 'Sem Nome'}</div>
                                                    <div className="text-xs text-gray-500">{contact.telefone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500 line-clamp-2 max-w-xs">{contact.ultima_mensagem || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar size={14} className="mr-2 text-gray-400" />
                                                {contact.atualizado_em ? new Date(contact.atualizado_em).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <ContactListActions contactId={contact.id} contactName={contact.nome} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Página {page}
                        </div>
                        <div className="flex space-x-2">
                            {page > 1 && (
                                <Link href={`/dashboard/crm?view=list&page=${page - 1}`} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Anterior
                                </Link>
                            )}
                            <Link href={`/dashboard/crm?view=list&page=${page + 1}`} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Próxima
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
