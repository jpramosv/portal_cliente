'use server'

import { createClient } from '@/utils/supabase/server'

export async function getPatients(page = 1, searchQuery = '') {
    const supabase = await createClient()
    const PAGE_size = 20
    const from = (page - 1) * PAGE_size
    const to = from + PAGE_size - 1

    let query = supabase
        .from('cache_pacientes')
        .select('*', { count: 'exact' })
        .order('atualizado_em', { ascending: false })
        .range(from, to)

    if (searchQuery) {
        query = query.or(`nome.ilike.%${searchQuery}%, telefone.ilike.%${searchQuery}%`)
    }

    const { data: contacts, error, count } = await query

    if (error) {
        console.error('Error fetching patients:', error)
        return { error: error.message }
    }

    return {
        contacts,
        meta: {
            count,
            page,
            total_pages: Math.ceil(count / PAGE_size)
        }
    }
}

export async function getPatientById(id) {
    const supabase = await createClient()

    // Ensure ID is handled as generic to support BigInt if necessary (JS handles it automatically mostly for fetch)
    const { data: patient, error } = await supabase
        .from('cache_pacientes')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return { error: error.message }

    return patient
}
