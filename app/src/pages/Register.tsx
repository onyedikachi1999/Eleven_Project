import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { authApi } from '@/lib/api'
import ElevenFaithBanner from '@/components/ElevenFaithBanner'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  })

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      await authApi.googleAuth(response.credential)
      toast('Welcome to ElevenFaith!')
      window.location.href = '/'
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed')
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
        document.getElementById('google-signup-btn'),
        { theme: 'outline', size: 'large', width: 340 }
      )
    }
  }, [])
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await authApi.register(formData)
      toast('Welcome to ElevenFaith!')
      window.location.href = '/'
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-stretch">
      {/* Decorative Sidebar */}
      <div className="hidden md:flex w-1/2">
        <ElevenFaithBanner variant="sidebar" />
      </div>

      {/* Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8" style={{ background: 'var(--eleven-bg)' }}>
        <Card className="w-full max-w-sm border-0 shadow-none bg-transparent">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl" style={{ color: 'var(--eleven-text)' }}>Create Account</CardTitle>
            <p className="text-sm mt-1" style={{ color: 'var(--eleven-text-secondary)' }}>Join our faith community and make a difference.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="John"
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--eleven-accent)]"
                    style={{ background: 'white', borderColor: 'var(--eleven-border)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--eleven-accent)]"
                    style={{ background: 'white', borderColor: 'var(--eleven-border)' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="choose_username"
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--eleven-accent)]"
                  style={{ background: 'white', borderColor: 'var(--eleven-border)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--eleven-accent)]"
                  style={{ background: 'white', borderColor: 'var(--eleven-border)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--eleven-accent)]"
                  style={{ background: 'white', borderColor: 'var(--eleven-border)' }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--eleven-text-secondary)' }}>Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors focus:border-[var(--eleven-accent)]"
                  style={{ background: 'white', borderColor: 'var(--eleven-border)' }}
                />
              </div>
              <Button type="submit" className="w-full rounded-lg font-semibold h-10 mt-2" style={{ background: 'var(--eleven-accent)' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--eleven-border)' }} /></div><div className="relative flex justify-center text-xs"><span className="px-2" style={{ background: 'var(--eleven-bg)', color: 'var(--eleven-text-muted)' }}>or</span></div></div>
            <div className="flex justify-center mb-4">
              <div id="google-signup-btn"></div>
            </div>
            <p className="text-center text-xs mt-4" style={{ color: 'var(--eleven-text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--eleven-accent)' }}>Sign In</Link>
            </p>
            <div className="text-center pt-2">
              <Link to="/" className="text-xs" style={{ color: 'var(--eleven-accent)' }}>Back to Home</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
