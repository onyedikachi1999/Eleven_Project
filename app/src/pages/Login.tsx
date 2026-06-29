import { useState } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        toast('Welcome back!')
        window.location.href = '/'
      } else {
        const err = await res.json()
        toast.error(err.detail || 'Invalid credentials')
      }
    } catch {
      toast.error('Connection failed. Is the Django server running?')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-stretch">
      <div className="hidden md:flex w-1/2 items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F0EB 0%, #E8D5C0 100%)' }}>
        <div className="text-center px-8">
          <h1 className="font-display text-5xl font-bold mb-4" style={{ color: 'var(--eleven-text)' }}>ELEVEN&trade;</h1>
          <p className="font-display text-xl" style={{ color: 'var(--eleven-text-secondary)' }}>Where faith meets community.</p>
          <div className="mt-8 opacity-[0.03]"><svg width="200" height="200" viewBox="0 0 200 200"><defs><pattern id="cross" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 0v40M0 20h40" stroke="currentColor" strokeWidth="1" fill="none"/></pattern></defs><rect width="200" height="200" fill="url(#cross)"/></svg></div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4" style={{ background: 'var(--eleven-bg)' }}>
        <Card className="w-full max-w-sm border-0 shadow-none bg-transparent">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl" style={{ color: 'var(--eleven-text)' }}>Welcome Back</CardTitle>
            <p className="text-sm mt-1" style={{ color: 'var(--eleven-text-secondary)' }}>Sign in to share your testimony and join the prayer.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="eleven_user"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--eleven-accent)]"
                  style={{ background: 'white', borderColor: 'var(--eleven-border)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="eleven2025"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--eleven-accent)]"
                  style={{ background: 'white', borderColor: 'var(--eleven-border)' }}
                />
              </div>
              <Button type="submit" className="w-full rounded-lg font-semibold h-10" style={{ background: 'var(--eleven-accent)' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--eleven-border)' }} /></div><div className="relative flex justify-center text-xs"><span className="px-2" style={{ background: 'var(--eleven-bg)', color: 'var(--eleven-text-muted)' }}>or</span></div></div>
            <p className="text-center text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
              Demo credentials: <span className="font-medium" style={{ color: 'var(--eleven-text-secondary)' }}>eleven_user / eleven2025</span>
            </p>
            <p className="text-center text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
              Admin: <span className="font-medium" style={{ color: 'var(--eleven-text-secondary)' }}>eleven_admin / eleven2025</span>
            </p>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--eleven-border)' }} /></div><div className="relative flex justify-center text-xs"><span className="px-2" style={{ background: 'var(--eleven-bg)', color: 'var(--eleven-text-muted)' }}>New to ELEVEN?</span></div></div>
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
