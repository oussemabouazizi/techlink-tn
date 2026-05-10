import  { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../config/api'
import { CheckIcon, StarIcon, ZapIcon, BriefcaseIcon, CreditCardIcon, ExternalLinkIcon } from '../../components/ui/Icons'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setSubscription(data.subscription)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const handleManageBilling = async () => {
    try {
      const { data } = await api.post('/subscriptions/portal')
      window.location.href = data.url
    } catch { alert('Failed to open billing portal') }
  }

  const plans = [
    { name: 'Free', icon: <StarIcon size={32} className="text-yellow-500" />, features: ['Browse jobs', '3 proposals/month', 'Basic profile'], current: subscription?.plan === 'free' },
    { name: 'Pro Freelancer', icon: <ZapIcon size={32} className="text-primary" />, price: '29 TND/month', features: ['Unlimited proposals', 'Featured badge', 'Priority search', 'Analytics'], current: subscription?.plan === 'pro_freelancer' },
    { name: 'Business Client', icon: <BriefcaseIcon size={32} className="text-secondary" />, price: '49 TND/month', features: ['Unlimited jobs', 'Featured listings', 'Priority matching', 'Team tools'], current: subscription?.plan === 'business_client' }
  ]

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="container py-8 max-w-4xl">
      <div className="page-header"><h1>Subscription</h1><p>Manage your plan and billing</p></div>
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center">
          <div><p className="text-sm text-gray-500">Current Plan</p><h2 className="text-2xl font-bold capitalize">{subscription?.plan || 'Free'}</h2><p className="text-sm">Status: <span className="capitalize font-medium text-green-600">{subscription?.status}</span></p>{subscription?.current_period_end && <p className="text-sm">Renews: {new Date(subscription.current_period_end).toLocaleDateString()}</p>}</div>
          {subscription?.plan !== 'free' && <button onClick={handleManageBilling} className="flex items-center gap-2 btn-outline"><CreditCardIcon size={16} /> Manage Billing</button>}
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-3 gap-6">
        {plans.map(plan => (
          <div key={plan.name} className={`card p-6 ${plan.current ? 'border-2 border-primary bg-primary-50' : ''}`}>
            <div className="mb-4">{plan.icon}</div>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {plan.price && <p className="text-primary font-medium mb-3">{plan.price}</p>}
            <ul className="space-y-2 mb-6">{plan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm"><CheckIcon size={16} className="text-green-500" /> {f}</li>)}</ul>
            {plan.current ? <span className="btn-primary w-full text-center block">Current Plan</span> : <a href="/pricing" className="btn-outline w-full text-center block">Upgrade <ExternalLinkIcon size={14} className="inline ml-1" /></a>}
          </div>
        ))}
      </div>
    </div>
  )
}