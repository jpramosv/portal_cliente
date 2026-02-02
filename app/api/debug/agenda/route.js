import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Test 1: Simple Count
    const { count, error: countError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })

    // Test 2: Fetch actual rows (raw)
    const { data: rows, error: rowsError } = await supabase
        .from('appointments')
        .select('*')
        .limit(5)

    // Test 3: Fetch with Join
    const { data: joinData, error: joinError } = await supabase
        .from('appointments')
        .select('*, patient:cache_pacientes(nome)')
        .limit(5)

    return NextResponse.json({
        countTest: { count, error: countError?.message },
        rowsTest: { count: rows?.length, rows, error: rowsError?.message },
        joinTest: { count: joinData?.length, data: joinData, error: joinError?.message }
    })
}
