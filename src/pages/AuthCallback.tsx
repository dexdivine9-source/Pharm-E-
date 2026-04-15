import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSupabase } from '../lib/mock-db'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { login } = useSupabase()

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

          // Bridge the real Supabase session into the mock auth system
          // so that ProtectedRoute recognizes the user as logged in
          login(email, fullName)

          // Navigate to the landing page (which triggers role selection)
          navigate('/')
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
  }, [navigate, login])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-900">Authenticating...</h2>
        <p className="text-slate-500 font-medium">Please wait while we secure your session.</p>
      </div>
    </div>
  )
}
