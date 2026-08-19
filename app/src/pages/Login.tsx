import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { authApi } from '@/lib/api'
import { AlertCircle } from 'lucide-react'
import ElevenFaithBanner from '@/components/ElevenFaithBanner'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      await authApi.googleAuth(response.credential)
      toast.success('Welcome to ElevenFaith!')
      window.location.href = '/'
    } catch (err: any) {
      const msg = err.message || 'Google authentication failed'
      setErrorMsg(msg)
      toast.error(msg)
    }
  }

  useEffect(() => {
    // @ts-ignore
    if (window.google) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: '433107054238-d621b16k4q9t7a760r1bmbj5a6p19d7d.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse,
      })
      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: 340 }
      )
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      await authApi.login(username, password)
      toast.success('Welcome back!')
      window.location.href = '/'
    } catch (err: any) {
      const msg = err.message || 'Invalid username or password'
      setErrorMsg(msg)
      toast.error(msg)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-stretch">
      <div className="hidden md:flex w-1/2">
        <ElevenFaithBanner variant="sidebar" />
      </div>
      <div className="flex-1 flex items-center justify-center px-4" style={{ background: 'var(--eleven-bg)' }}>
        <Card className="w-full max-w-sm border-0 shadow-none bg-transparent">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl" style={{ color: 'var(--eleven-text)' }}>Welcome Back</CardTitle>
            <p className="text-sm mt-1" style={{ color: 'var(--eleven-text-secondary)' }}>Sign in to share your testimony and join the prayer.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 animate-shake shadow-sm">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Username or Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); if (errorMsg) setErrorMsg(''); }}
                  placeholder="Username or email address"
                  required
                  className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-colors ${errorMsg ? 'border-red-400 bg-red-50/20' : 'focus:border-[var(--eleven-accent)] bg-white'}`}
                  style={{ borderColor: errorMsg ? undefined : 'var(--eleven-border)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (errorMsg) setErrorMsg(''); }}
                  placeholder="Password"
                  required
                  className={`w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-colors ${errorMsg ? 'border-red-400 bg-red-50/20' : 'focus:border-[var(--eleven-accent)] bg-white'}`}
                  style={{ borderColor: errorMsg ? undefined : 'var(--eleven-border)' }}
                />
              </div>
              <Button type="submit" className="w-full rounded-lg font-semibold h-10" style={{ background: 'var(--eleven-accent)' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--eleven-border)' }} /></div><div className="relative flex justify-center text-xs"><span className="px-2" style={{ background: 'var(--eleven-bg)', color: 'var(--eleven-text-muted)' }}>or</span></div></div>
            <div className="flex justify-center mb-4">
              <div id="google-signin-btn"></div>
            </div>
            <p className="text-center text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
              Demo credentials: <span className="font-medium" style={{ color: 'var(--eleven-text-secondary)' }}>eleven_user / eleven2025</span>
            </p>
            <p className="text-center text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
              Admin: <span className="font-medium" style={{ color: 'var(--eleven-text-secondary)' }}>eleven_admin / eleven2025</span>
            </p>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--eleven-border)' }} /></div><div className="relative flex justify-center text-xs"><span className="px-2" style={{ background: 'var(--eleven-bg)', color: 'var(--eleven-text-muted)' }}>New to ElevenFaith?</span></div></div>
            <Link to="/register" className="w-full block">
              <Button type="button" variant="outline" className="w-full rounded-lg font-semibold h-10" style={{ borderColor: 'var(--eleven-accent)', color: 'var(--eleven-accent)' }}>
                Create an Account
              </Button>
            </Link>
            <div className="text-center pt-2">
              <Link to="/" className="text-xs" style={{ color: 'var(--eleven-accent)' }}>Back to Home</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
