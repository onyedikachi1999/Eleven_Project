import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Check, X, Shield, Star, Crown, Landmark } from 'lucide-react'

interface PlanFeature {
  name: string
  included: boolean
}

interface Plan {
  id: 'free' | 'regular' | 'premium'
  name: string
  price: string
  period: string
  description: string
  icon: typeof Shield
  color: string
  borderColor: string
  accentColor: string
  features: PlanFeature[]
  badge?: string
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free Watcher',
    price: '₦0',
    period: 'forever',
    description: 'Perfect for reading and watching community content.',
    icon: Shield,
    color: '#6B6560',
    borderColor: 'var(--eleven-border)',
    accentColor: '#E8E4DE',
    features: [
      { name: 'Access to Testimony Hub (read-only)', included: true },
      { name: 'Access to Community Forum (read-only)', included: true },
      { name: 'Join public prayer circles', included: true },
      { name: 'Post testimonies & comments', included: false },
      { name: 'Create prayer circles & post messages', included: false },
      { name: 'Host live joint prayer sessions', included: false },
      { name: 'Premium Ambassador badge', included: false },
    ]
  },
  {
    id: 'regular',
    name: 'Regular Watcher',
    price: '₦5,000',
    period: 'month',
    description: 'Engage actively in discussions and create circles.',
    icon: Star,
    color: '#8B6914',
    borderColor: '#E8D5C0',
    accentColor: 'linear-gradient(135deg, #7B8B6F 0%, #8B9B7F 100%)',
    badge: 'Most Popular',
    features: [
      { name: 'Access to Testimony Hub (full access)', included: true },
      { name: 'Access to Community Forum (full access)', included: true },
      { name: 'Create & join prayer circles', included: true },
      { name: 'Post unlimited testimonies & comments', included: true },
      { name: 'Post messages on Chat Walls', included: true },
      { name: 'Host live joint prayer sessions', included: false },
      { name: 'Premium Ambassador badge', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium Watcher',
    price: '₦15,000',
    period: 'month',
    description: 'Host prayer watch groups and access full features.',
    icon: Crown,
    color: '#6B3A5A',
    borderColor: '#E8D5E0',
    accentColor: 'linear-gradient(135deg, #6B3A5A 0%, #8B507C 100%)',
    badge: 'Ambassador',
    features: [
      { name: 'Access to Testimony Hub (full access)', included: true },
      { name: 'Access to Community Forum (full access)', included: true },
      { name: 'Create & join prayer circles', included: true },
      { name: 'Post unlimited testimonies & comments', included: true },
      { name: 'Post messages on Chat Walls', included: true },
      { name: 'Host live joint prayer sessions', included: true },
      { name: 'Premium Ambassador badge & priority support', included: true },
    ]
  }
]

export default function Pricing() {
  const { user, isAuthenticated, refresh } = useAuth()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planId: 'free' | 'regular' | 'premium') => {
    if (!isAuthenticated) {
      toast('Please sign in to select a subscription plan.')
      navigate('/login')
      return
    }

    if (user?.subscription_plan === planId) {
      toast.info(`You are already subscribed to the ${planId.toUpperCase()} plan.`)
      return
    }

    setLoadingPlan(planId)
    try {
      await authApi.upgrade(planId)
      await refresh()
      toast.success(`Welcome to the ${planId.toUpperCase()} plan!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update subscription')
    } finally {
      setLoadingPlan(null)
    }
  }

  const currentPlan = user?.subscription_plan || 'free'

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 space-y-12" style={{ background: 'var(--eleven-bg)' }}>
      {/* Title Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--eleven-text)' }}>
          Choose Your Plan
        </h1>
        <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'var(--eleven-text-secondary)' }}>
          Support the ministry, unlock prayer watches, and access deeper fellowship tools.
        </p>
      </div>

      {/* Pricing cards grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const PlanIcon = plan.icon
          const isCurrent = currentPlan === plan.id
          const isPopular = plan.badge === 'Most Popular'

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 relative ${
                isPopular ? 'shadow-lg scale-105 z-10' : 'hover:shadow-md'
              }`}
              style={{
                borderColor: plan.borderColor,
                boxShadow: isPopular ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' : undefined
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <span
                  className="absolute top-0 right-6 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white"
                  style={{ background: plan.id === 'premium' ? 'var(--eleven-accent)' : '#7B8B6F' }}
                >
                  {plan.badge}
                </span>
              )}

              {/* Card Top */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: plan.id === 'free' ? '#F0EEEB' : '#F5F0EB' }}
                  >
                    <PlanIcon size={20} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg" style={{ color: 'var(--eleven-text)' }}>{plan.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>{plan.description}</p>
                  </div>
                </div>

                <div className="my-6">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--eleven-text)' }}>
                    {plan.price}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--eleven-text-muted)' }}>
                    {plan.period === 'forever' ? ' / forever' : ` / ${plan.period}`}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 my-6 border-t pt-6" style={{ borderColor: 'var(--eleven-border)' }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      {feat.included ? (
                        <Check size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X size={14} className="text-stone-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span style={{ color: feat.included ? 'var(--eleven-text-secondary)' : 'var(--eleven-text-muted)' }}>
                        {feat.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Bottom */}
              <div className="mt-6 pt-4">
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan !== null}
                  className="w-full rounded-xl font-semibold text-xs h-10 transition-all text-white"
                  style={{
                    background: isCurrent
                      ? '#EDEDED'
                      : plan.id === 'free'
                      ? 'var(--eleven-text)'
                      : plan.id === 'regular'
                      ? 'var(--eleven-prayer)'
                      : 'var(--eleven-accent)',
                    color: isCurrent ? 'var(--eleven-text-muted)' : 'white'
                  }}
                >
                  {loadingPlan === plan.id
                    ? 'Updating...'
                    : isCurrent
                    ? 'Current Plan'
                    : plan.id === 'free'
                    ? 'Select Free'
                    : `Upgrade to ${plan.name.split(' ')[0]}`}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Trust elements */}
      <div className="max-w-md mx-auto text-center border p-6 rounded-2xl bg-white" style={{ borderColor: 'var(--eleven-border)' }}>
        <Landmark className="mx-auto mb-2 text-stone-400" size={24} />
        <h4 className="font-display font-bold text-xs" style={{ color: 'var(--eleven-text)' }}>Secure Paystack Checkout</h4>
        <p className="text-[10px]" style={{ color: 'var(--eleven-text-muted)' }}>
          All card payments are securely encrypted. Cancel subscription anytime directly from your dashboard.
        </p>
      </div>
    </div>
  )
}
