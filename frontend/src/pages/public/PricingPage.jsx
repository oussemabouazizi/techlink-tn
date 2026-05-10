import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../config/api'
import { CheckIcon, StarIcon, ZapIcon, BriefcaseIcon } from '../../components/ui/Icons'

const plans = [
  { name: 'Free', icon: <StarIcon size={32} className="text-yellow-500" />, price: '0', description: 'Perfect for getting started', features: ['Browse all jobs', 'Submit 3 proposals/month', 'Basic profile'], cta: 'Get Started', popular: false, plan: null },
  { name: 'Pro Freelancer', icon: <ZapIcon size={32} className="text-primary" />, price: '29', period: 'month', description: 'For serious freelancers', features: ['Unlimited proposals', 'Featured profile badge', 'Priority in search results', 'Advanced analytics', 'Priority support'], cta: 'Upgrade Now', popular: true, plan: 'pro_freelancer' },
  { name: 'Business Client', icon: <BriefcaseIcon size={32} className="text-secondary" />, price: '49', period: 'month', description: 'For hiring managers', features: ['Unlimited job posts', 'Featured job listings', 'Priority matching', 'Team collaboration', 'Dedicated account manager'], cta: 'Upgrade Now', popular: false, plan: 'business_client' }
]

export default function PricingPage() {
  const { user } = useAuth()

  const handleSubscribe = async (plan) => {
    if (!user) return window.location.href = '/login'
    try {
      const { data } = await api.post('/subscriptions/checkout', { plan })
      window.location.href = data.url
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed')
    }
  }

  return (
    <div className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold">Simple, Transparent Pricing</h1>
          <p className="text-gray-600 mt-2">Choose the plan that fits your needs. Upgrade or downgrade at any time.</p>
        </div>
        <div className="pricing-grid">
          {plans.map(plan => (
            <div key={plan.name} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
              {plan.popular && <div className="pricing-badge">MOST POPULAR</div>}
              <div className="pricing-icon">{plan.icon}</div>
              <h3 className="pricing-name">{plan.name}</h3>
              <p className="pricing-desc">{plan.description}</p>
              <div className="pricing-price">{plan.price}<span>{plan.period ? ` / ${plan.period}` : ' TND'}</span></div>
              <ul className="pricing-features">
                {plan.features.map((f, i) => <li key={i}><CheckIcon size={16} /> {f}</li>)}
              </ul>
              {plan.plan ? (
                <button onClick={() => handleSubscribe(plan.plan)} className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-outline'}`}>{plan.cta}</button>
              ) : (
                <Link to="/register" className="btn-outline w-full block text-center">{plan.cta}</Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}