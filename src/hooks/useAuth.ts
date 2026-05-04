'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import type { Profile } from '@/types'

export function useAuth() {
  const { profile, setProfile } = useAppStore()
  const [loading, setLoading] = useState(!profile)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data as Profile | null)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) fetchProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return { profile, loading, signOut, isLoggedIn: !!profile }
}
