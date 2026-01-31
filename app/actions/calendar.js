'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAppointments(start, end) {
    const supabase = await createClient()

    // Default to current month if not provided
    let query = supabase
        .from('crm_appointments')
        .select(`
            *,
            patient:cache_pacientes(nome, telefone)
        `)
        .order('start_time', { ascending: true })

    if (start) query = query.gte('start_time', start.toISOString())
    if (end) query = query.lte('end_time', end.toISOString())

    const { data: appointments, error } = await query

    if (error) {
        console.error('Error fetching appointments:', error)
        return { error: error.message }
    }

    return { appointments }
}

export async function createAppointment({ patientId, title, startTime, endTime, notes }) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('crm_appointments')
        .insert({
            patient_id: patientId,
            title,
            start_time: startTime,
            end_time: endTime,
            notes
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating appointment:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/agenda')
    return { success: true, appointment: data }
}

export async function updateAppointment(id, updates) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('crm_appointments')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error('Error updating appointment:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/agenda')
    return { success: true }
}

export async function deleteAppointment(id) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('crm_appointments')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting appointment:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/agenda')
    return { success: true }
}
