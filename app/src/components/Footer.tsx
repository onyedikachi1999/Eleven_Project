import { Link } from 'react-router'
import { Instagram, Youtube, Mail, MessageCircle } from 'lucide-react'

const platformLinks = [
  { to: '/', label: 'Home' },
  { to: '/testimonies', label: 'Testimonies' },
  { to: '/prayer-room', label: 'Prayer Room' },
  { to: '/tv', label: 'ELEVEN TV' },
  { to: '/community', label: 'Community' },
]

const resourceLinks = [
  { to: '/about', label: 'About' },
  { to: '#', label: 'Guidelines' },
  { to: '#', label: 'Privacy' },
  { to: '#', label: 'Terms' },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--eleven-dark)' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold mb-3">ELEVEN™</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--eleven-text-muted)' }}>
              A global community of faith, testimonies, and prayer.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--eleven-text-muted)' }}>
              Platform
            </h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--eleven-text-muted)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--eleven-text-muted)' }}>
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--eleven-text-muted)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--eleven-text-muted)' }}>
              Connect
            </h4>
            <div className="flex gap-3">
              {[Instagram, Youtube, MessageCircle, Mail].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ color: 'var(--eleven-text-muted)' }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-2"
          style={{ borderColor: '#333' }}
        >
          <p className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
            © 2025 ELEVEN™. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
            Made with faith and purpose.
          </p>
        </div>
      </div>
    </footer>
  )
}
