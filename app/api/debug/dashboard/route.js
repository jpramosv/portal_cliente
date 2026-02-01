import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Test 1: Check connection
    const { data: testQuery, error: testError } = await supabase
        .from('bot_interactions')
        .select('count')
        .limit(1)

    // Test 2: Get all data without filters
    const { data: allData, error: allError, count: totalCount } = await supabase
        .from('bot_interactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50)

    // Test 3: Get unique operation_types
    const { data: opsData } = await supabase
        .from('bot_interactions')
        .select('operation_type')

    const operationTypes = {}
    opsData?.forEach(record => {
        const type = record.operation_type || 'null'
        operationTypes[type] = (operationTypes[type] || 0) + 1
    })

    // Test 4: Filter by today
    const today = new Date().toISOString().split('T')[0]
    const { data: todayData, count: todayCount } = await supabase
        .from('bot_interactions')
        .select('*', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00`)

    // Test 5: Filter by create_calendar
    const { count: createCalendarCount } = await supabase
        .from('bot_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('operation_type', 'create_calendar')

    return NextResponse.json({
        connection: {
            testError: testError?.message || null,
            allError: allError?.message || null
        },
        counts: {
            total: totalCount,
            today: todayCount,
            createCalendar: createCalendarCount
        },
        operationTypes,
        todayFilter: today,
        sampleRecords: allData?.slice(0, 5).map(r => ({
            id: r.id,
            created_at: r.created_at,
            operation_type: r.operation_type,
            status: r.status,
            patient_name: r.patient_name
        })),
        todaySample: todayData?.slice(0, 3).map(r => ({
            id: r.id,
            created_at: r.created_at,
            operation_type: r.operation_type
        }))
    })
}
