import { useState } from 'react'
import {
  HeartIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      title: "Smart Symptom Tracking",
      description: "AI-powered tracking that learns your patterns and provides personalized insights for better symptom management.",
      icon: ChartBarIcon,
      image: "🩺",
      benefits: ["Daily symptom logging", "Pattern recognition", "Severity tracking", "Trigger identification"]
    },
    {
      title: "Personalized Treatment Plans", 
      description: "Get customized treatment recommendations based on your unique symptoms, lifestyle, and medical history.",
      icon: HeartIcon,
      image: "💊",
      benefits: ["HRT optimization", "Natural remedies", "Lifestyle adjustments", "Doctor consultations"]
    },
    {
      title: "Community Support",
      description: "Connect with thousands of women going through similar experiences in our supportive community.",
      icon: UserGroupIcon,
      image: "👥",
      benefits: ["Expert-moderated groups", "Anonymous discussions", "Success stories", "24/7 peer support"]
    },
    {
      title: "Progress Analytics",
      description: "Comprehensive insights and progress tracking to see how your treatments are working over time.",
      icon: SparklesIcon,
      image: "📊",
      benefits: ["Visual progress charts", "Treatment effectiveness", "Mood correlation", "Health reports"]
    }
  ]

  const testimonials = [
    {
      name: "Sarah M.",
      age: 52,
      location: "San Francisco, CA",
      text: "MenoWellness helped me understand my symptoms and find the right treatment. I feel like myself again!",
      rating: 5,
      image: "👩‍💼"
    },
    {
      name: "Jennifer L.",
      age: 48,
      location: "Austin, TX", 
      text: "The AI recommendations were spot-on. My doctor was impressed with the detailed tracking data.",
      rating: 5,
      image: "👩‍⚕️"
    },
    {
      name: "Maria C.",
      age: 55,
      location: "Miami, FL",
      text: "Finally, a community that understands. The support here has been life-changing.",
      rating: 5,
      image: "👩‍🏫"
    }
  ]

  const pricingPlans = [
    {
      name: "MenoWellness Basic",
      price: 5.99,
      description: "Essential menopause tracking and basic AI guidance",
      features: [
        "Daily symptom tracking",
        "Basic AI insights", 
        "Mood and energy monitoring",
        "Educational content library",
        "Progress tracking"
      ],
      cta: "Start Free Trial",
      popular: false,
      type: "individual"
    },
    {
      name: "Couples Bundle",
      price: 19.99,
      originalPrice: 15.98,
      description: "MenoWellness + SupportPartner for both partners",
      features: [
        "50 symptom entries & 75 AI queries/month",
        "SupportPartner app with Mama Grace AI",
        "Cross-app insights & analytics",
        "Shared progress dashboard",
        "Partner connection alerts",
        "Basic relationship health tracking",
        "Educational content library",
        "Mood correlation basics"
      ],
      cta: "Start Bundle Trial",
      popular: true,
      type: "bundle",
      savings: "Best Value for Couples"
    },
    {
      name: "Ultimate Couples",
      price: 29.99,
      originalPrice: 35.98,
      description: "Complete unlimited access for both partners",
      features: [
        "Unlimited symptom tracking",
        "Unlimited AI insights & queries",
        "Advanced relationship analytics",
        "Complete education library access",
        "Full cross-app data sharing",
        "Partner mood correlation insights",
        "Advanced progress tracking"
      ],
      cta: "Start Premium Trial", 
      popular: false,
      type: "bundle",
      savings: "Save $6/month"
    }
  ]



  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-pink-600">MenoWellness</h1>
                <p className="text-xs text-gray-500">Your menopause journey companion</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">Pricing</a>
                <a href="#testimonials" className="text-gray-700 hover:text-pink-600 px-3 py-2 text-sm font-medium">Stories</a>
                <Link to="/dashboard" className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-700">
                  Enter App
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <span className="bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">
                  🌟 AI-Powered Menopause Support
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Navigate Your 
                <span className="text-pink-600"> Menopause Journey</span> 
                with Confidence
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get personalized AI guidance, track your symptoms, and connect with a supportive community. 
                Take control of your menopause experience with the most comprehensive wellness platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard" className="bg-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-700 flex items-center justify-center">
                  Try Dashboard Now
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 flex items-center justify-center">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Watch Demo
                </button>
              </div>
              <div className="mt-6 flex items-center text-sm text-gray-500">
                <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
                <CheckIcon className="h-4 w-4 text-green-500 mr-2 ml-4" />
                Cancel anytime
                <CheckIcon className="h-4 w-4 text-green-500 mr-2 ml-4" />
                HIPAA compliant
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🌸</div>
                  <h3 className="text-2xl font-bold text-gray-900">Your Wellness Dashboard</h3>
                  <p className="text-gray-600">Track, understand, and improve your menopause experience</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Hot flashes tracked</span>
                    </div>
                    <span className="text-pink-600 font-bold">-40%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Sleep quality</span>
                    </div>
                    <span className="text-blue-600 font-bold">+65%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Energy levels</span>
                    </div>
                    <span className="text-green-600 font-bold">+85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Trusted by 50,000+ Women Worldwide</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">2M+</div>
              <div className="text-gray-600">Symptoms Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">1,000+</div>
              <div className="text-gray-600">Healthcare Providers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Support Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full mb-4">
              💙 New: Partner Support Integration
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Partner's Journey Matters Too</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Include your partner in your menopause journey with our integrated SupportPartner app. 
              Better support, better outcomes, stronger relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-2xl font-bold text-gray-900">SupportPartner App</h3>
                  <p className="text-gray-600">AI-powered guidance for your partner</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Mama Grace AI Coach</span>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Communication Tools</span>
                  </div>
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Education Hub</span>
                  </div>
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Progress Tracking</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Better Together</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Connected Insights</h4>
                    <p className="text-gray-600">Your symptoms and progress automatically shared with your partner (with your permission)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">AI-Guided Support</h4>
                    <p className="text-gray-600">Your partner gets personalized coaching on how to support you through tough days</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Relationship Analytics</h4>
                    <p className="text-gray-600">Track how your menopause journey affects your relationship and get improvement suggestions</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold">Bundle & Save</h4>
                      <p className="text-blue-100">Get both apps with shared insights</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">$19.99/mo</div>
                      <div className="text-sm text-blue-200 line-through">$15.98 separate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Menopause Wellness</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive support for every aspect of your menopause journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl cursor-pointer transition-all ${
                      activeFeature === index
                        ? 'bg-pink-50 border-2 border-pink-200'
                        : 'bg-white border-2 border-gray-100 hover:border-gray-200'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-center mb-3">
                      <feature.icon className="h-6 w-6 text-pink-600 mr-3" />
                      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    {activeFeature === index && (
                      <div className="grid grid-cols-2 gap-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center text-sm text-pink-700">
                            <CheckIcon className="h-4 w-4 mr-2" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-12">
                <div className="text-8xl mb-6">{features[activeFeature].image}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{features[activeFeature].title}</h3>
                <p className="text-gray-600">{features[activeFeature].description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Stories from Real Women</h2>
            <p className="text-xl text-gray-600">See how MenoWellness has transformed menopause journeys</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">Age {testimonial.age} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Wellness Plan</h2>
            <p className="text-xl text-gray-600">Start with a 7-day free trial. No credit card required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? plan.type === 'bundle' 
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105'
                      : 'bg-pink-600 text-white shadow-2xl scale-105'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className={`${plan.type === 'bundle' ? 'bg-yellow-400' : 'bg-yellow-400'} text-gray-900 px-4 py-1 rounded-full text-sm font-semibold`}>
                      {plan.savings || 'Most Popular'}
                    </span>
                  </div>
                )}
                {plan.type === 'bundle' && !plan.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Bundle
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mb-4 ${plan.popular ? (plan.type === 'bundle' ? 'text-blue-100' : 'text-pink-100') : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <div className={`text-sm ${plan.popular ? (plan.type === 'bundle' ? 'text-blue-200' : 'text-pink-200') : 'text-gray-500'} line-through mb-1`}>
                        ${plan.originalPrice}/month separate
                      </div>
                    )}
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-lg ${plan.popular ? (plan.type === 'bundle' ? 'text-blue-100' : 'text-pink-100') : 'text-gray-600'}`}>
                      /month
                    </span>
                    {plan.savings && plan.originalPrice && (
                      <div className={`text-sm mt-1 ${plan.popular ? 'text-yellow-200' : 'text-green-600'} font-semibold`}>
                        {plan.originalPrice > plan.price ? `Save $${(plan.originalPrice - plan.price).toFixed(2)}/mo` : plan.savings}
                      </div>
                    )}
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className={`h-5 w-5 mr-3 ${
                        plan.popular 
                          ? plan.type === 'bundle' ? 'text-blue-200' : 'text-pink-200'
                          : 'text-green-500'
                      }`} />
                      <span className={plan.popular 
                        ? plan.type === 'bundle' ? 'text-blue-100' : 'text-pink-100'
                        : 'text-gray-700'
                      }>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dashboard"
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-center block transition-colors ${
                    plan.popular
                      ? plan.type === 'bundle'
                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                        : 'bg-white text-pink-600 hover:bg-gray-100'
                      : plan.type === 'bundle'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-pink-600 text-white hover:bg-pink-700'
                  }`}
                >
                  Try Now
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include a 7-day free trial. Cancel anytime.</p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">🎯 Bundle Benefits</h4>
              <p className="text-gray-600 mb-4">
                Couples who use both apps together see 40% better outcomes and stronger relationship satisfaction.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <span>Shared Progress Insights</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <span>Partner Alert System</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <span>Relationship Analytics</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" />
                HIPAA Compliant
              </span>
              <span className="flex items-center">
                <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                Money-back guarantee
              </span>
              <span className="flex items-center">
                <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Menopause Journey?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of women who have found relief, support, and empowerment with MenoWellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-white text-pink-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 flex items-center justify-center"
            >
              Try Dashboard Now
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors">
              Talk to Our Team
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-pink-400 mb-4">MenoWellness</h3>
              <p className="text-gray-400 mb-4">
                Empowering women through their menopause journey with AI-powered insights and community support.
              </p>
              <div className="flex items-center space-x-4">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">1-800-MENO-HELP</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">support@menowellness.com</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center">
            <p className="text-gray-400">
              © 2024 MenoWellness. All rights reserved. | HIPAA Compliant | Your privacy is our priority.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}