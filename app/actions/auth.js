'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
    const data = {
        email: formData.get('email'),
    }

    console.log('Login attempt for:', data.email)

    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: `${origin}/auth/callback`,
        }
    })

    if (error) {
        console.error('Supabase Login Error:', error)
        redirect('/login?error=' + encodeURIComponent(error.message))
    }

    console.log('Success! Redirecting...')
    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
