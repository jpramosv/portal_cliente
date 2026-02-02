'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import { clinicorp } from '@/app/lib/integrations/clinicorp'

export async function getAppointments(start, end) {
    const supabase = await createClient()

    // Fetch from local mirror
    // Ideally, we would have a background sync job.
    // For now, we trust the local DB is updated via create/webhooks.
    let query = supabase
        .from('appointments')
        .select(`
            id,
            patient_id,
            start_time,
            end_time,
            status,
            procedure_type,
            notes,
            metadata,
            id_app_clinicorp,
            "Deleted",
            "Canceled",
            "Procedures",
            date,
            dentist_id,
            patient:cache_pacientes(nome, telefone)
        `)
        .order('date', { ascending: true })

    if (start) query = query.gte('date', start.toISOString())
    if (end) query = query.lte('date', end.toISOString())

    const { data: appointments, error } = await query

    if (error) {
        console.error('Error fetching appointments:', error)
        return { error: error.message }
    }

    return { appointments }
}

export async function createAppointment({ patientId, title, startTime, endTime, notes }) {
    const supabase = await createClient()

    try {
        // 1. Create in Clinicorp System (Source of Truth)
        // We look up patient name if needed, or pass ID. Mock service handles it.
        const clinicorpAppt = await clinicorp.createAppointment({
            patient_id: patientId,
            title,
            start_time: startTime,
            end_time: endTime,
            notes
        })

        if (!clinicorpAppt || !clinicorpAppt.id) {
            throw new Error('Failed to create appointment in Clinicorp ERP')
        }

        // 2. Save/Sync to Supabase Mirror
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                patient_id: patientId,
                start_time: startTime,
                end_time: endTime,
                notes,
                status: 'scheduled',
                id_app_clinicorp: clinicorpAppt.external_id || clinicorpAppt.id,
                metadata: {
                    title: title,
                    source_id: clinicorpAppt.external_id || clinicorpAppt.id,
                    synced_at: new Date().toISOString()
                }
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating local appointment mirror:', error)
            // We should probably rollback Clinicorp here or mark as sync-error
            return { error: 'Created in ERP but failed to save locally: ' + error.message }
        }

        revalidatePath('/dashboard/agenda')
        return { success: true, appointment: data }

    } catch (error) {
        console.error('Integration Error:', error)
        return { error: error.message }
    }
}

export async function updateAppointment(id, updates) {
    const supabase = await createClient()

    // NOTE: Should also update Clinicorp here via service

    const { error } = await supabase
        .from('appointments')
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

    // NOTE: Should also cancel in Clinicorp here via service

    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting appointment:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/agenda')
    return { success: true }
}
