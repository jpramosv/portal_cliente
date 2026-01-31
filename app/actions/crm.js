'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getColumns() {
    const supabase = await createClient()

    const { data: columns, error } = await supabase
        .from('crm_columns')
        .select('*')
        .order('position')

    if (error) {
        console.error('Error fetching columns:', error)
        return { error: error.message }
    }

    return { columns }
}

export async function getDeals() {
    const supabase = await createClient()

    // Fetch deals and related patient name
    const { data: deals, error } = await supabase
        .from('crm_deals')
        .select(`
            *,
            patient:cache_pacientes(nome, telefone)
        `)
        .order('position')

    if (error) {
        console.error('Error fetching deals:', error)
        return { error: error.message }
    }

    // Map to flatten structure if needed, or just use as is in frontend
    const mappedDeals = deals.map(deal => ({
        ...deal,
        title: deal.title || deal.patient?.nome || 'Novo Negócio'
    }))

    return { deals: mappedDeals }
}

export async function updateDealStage(dealId, columnId) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('crm_deals')
        .update({ column_id: columnId })
        .eq('id', dealId)

    if (error) {
        console.error('Error updating deal stage:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/crm')
    return { success: true }
}

export async function createDeal({ title, patientId, columnId }) {
    const supabase = await createClient()

    let targetColumnId = columnId

    // If no column specified, find the first one (position 0)
    if (!targetColumnId) {
        const { data: firstCol } = await supabase
            .from('crm_columns')
            .select('id')
            .order('position')
            .limit(1)
            .single()

        if (firstCol) targetColumnId = firstCol.id
    }

    const { data, error } = await supabase
        .from('crm_deals')
        .insert({
            title,
            patient_id: patientId, // Using the new FK
            column_id: targetColumnId
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating deal:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/crm')
    return { success: true, deal: data }
}
