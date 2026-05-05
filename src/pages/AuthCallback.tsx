import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSupabase } from '../lib/mock-db'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { login, allProfiles } = useSupabase()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically picks up the token from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error.message)
          navigate('/login')
          return
        }

        if (session?.user) {
          const user = session.user
          const email = user.email || ''
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            email.split('@')[0] ||
            'User'

          // Bridge the real Supabase session into the app's auth system
          login(email, fullName)

          // Check if this is a returning user who already has a role
          const existingProfile = allProfiles.find(p => p.email === email)

          if (existingProfile && existingProfile.role && existingProfile.role !== '') {
            // ── RETURNING USER ── Route to their role-specific dashboard
            if (existingProfile.role === 'customer') {
              navigate('/dashboard')
            } else if (existingProfile.role === 'pharmacy') {
              navigate(existingProfile.is_verified ? '/portal' : '/pending-verification')
            } else if (existingProfile.role === 'logistics') {
              navigate(existingProfile.is_verified ? '/logistics' : '/logistics-onboarding')
            } else {
              navigate('/dashboard')
            }
          } else {
            // ── NEW USER ── Navigate to landing so the RoleModal appears
            navigate('/')
          }
        } else {
          console.error('No session found after OAuth callback')
          navigate('/login')
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        navigate('/login')
      }
    }

    handleAuthCallback()
  }, [navigate, login, allProfiles])

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-900">Authenticating...</h2>
        <p className="text-slate-500 font-medium">Please wait while we secure your session.</p>
      </div>
    </div>
  )
}
