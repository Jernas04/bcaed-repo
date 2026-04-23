'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email first.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: 'http://localhost:3000/reset-password',
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password reset link sent to your email.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(`✓ Account created! Please check your email (${formData.email}) to confirm your account before logging in.`)

    // Validations
    if (isSignUp) {
      if (!formData.name.trim()) { setError('Please enter your full name.'); setLoading(false); return }
      if (formData.name.trim().length < 2) { setError('Name must be at least 2 characters.'); setLoading(false); return }
      if (!formData.email.trim()) { setError('Please enter your email address.'); setLoading(false); return }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Please enter a valid email address.'); setLoading(false); return }
      if (!formData.password) { setError('Please enter a password.'); setLoading(false); return }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
    } else {
      if (!formData.email.trim()) { setError('Please enter your email address.'); setLoading(false); return }
      if (!formData.password) { setError('Please enter your password.'); setLoading(false); return }
    }

    try {
      let result
      if (isSignUp) {
        result = await signUp(formData.email, formData.password, formData.name, formData.role)
        if (result.success) {
            if (result.requiresConfirmation) {
              // ✅ Email confirmation needed
              setSuccess(`✓ Account created! We sent a confirmation link to ${formData.email}. Please check your inbox (and spam folder) before logging in.`)
            } else {
              setSuccess(`✓ Account created! Welcome, ${formData.name}!`)
            }
            setFormData({ email: '', password: '', name: '', role: 'student' })
            setTimeout(() => { setIsSignUp(false); setSuccess('') }, 6000) // longer timeout para mabasa
          } else {
          if (result.error?.includes('already registered') || result.error?.includes('already exists')) {
            setError('This email is already registered. Please sign in instead.')
          } else if (result.error?.includes('rate limit')) {
            setError('Too many attempts. Please wait a moment and try again.')
          } else if (result.error?.includes('foreign key') || result.error?.includes('fkey')) {
            setError('Account setup failed. Please try again or contact admin.')
          } else {
            setError(result.error || 'Something went wrong. Please try again.')
          }
        }
      } else {
        result = await signIn(formData.email, formData.password)
        if (result.success) {
          router.push('/dashboard')
        } else {
          if (result.error?.includes('Invalid login') || result.error?.includes('invalid_credentials')) {
            setError('Incorrect email or password. Please try again.')
          } else if (result.error?.includes('Email not confirmed')) {
            setError('Please confirm your email first before signing in.')
          } else if (result.error?.includes('rate limit')) {
            setError('Too many login attempts. Please wait a moment.')
          } else {
            setError(result.error || 'Sign in failed. Please try again.')
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 antialiased text-sm sm:text-base'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans antialiased">

      {/* ── LEFT / TOP PANEL ── */}
      <div className="relative flex flex-col items-center justify-center text-white overflow-hidden
                      w-full lg:w-1/2
                      py-10 px-6 lg:p-10
                      min-h-[220px] sm:min-h-[260px] lg:min-h-screen">

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/school_building.jfif')", opacity: 0.5 }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 40%, #1e40af 100%)',
            opacity: 0.6,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">

          <img
            src="/images/logo.png"
            alt="logo"
            className="w-20 sm:w-24 lg:w-28 mb-4 lg:mb-6 drop-shadow-lg"
          />

          <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
            BCAEd Repository
          </h1>

          <p className="text-xs sm:text-sm mt-1 text-white/90">
            Colegio de la Ciudad de Tayabas
          </p>

          <p className="text-xs mt-2 text-white/80 tracking-widest">
            Music • Dance • Drama • Visual Arts
          </p>

          <div className="flex gap-4 sm:gap-6 mt-6 lg:mt-10 items-center">
            <img
              src="/images/school_logo.jfif"
              alt="school"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-lg"
            />
            <img
              src="/images/tayabas_logo.jfif"
              alt="tayabas"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT / BOTTOM PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50
                      px-4 py-8 sm:px-8 sm:py-10 lg:p-10">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">

          {/* Header */}
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-5 sm:mb-6 text-gray-900">
            {isSignUp ? 'Create Account' : 'Login'}
          </h2>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-100 text-green-600 p-3 rounded mb-4 text-xs sm:text-sm">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            {isSignUp && (
              <div>
                <p className="text-sm font-medium mb-2 text-gray-700">I am a:</p>
                <div className="flex gap-3">
                  {['student', 'teacher'].map((role) => (
                    <label
                      key={role}
                      className={`flex-1 text-center p-3 rounded-lg border cursor-pointer transition select-none text-sm ${
                        formData.role === role
                          ? 'bg-indigo-100 border-indigo-500 text-gray-900'
                          : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={formData.role === role}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="capitalize font-medium">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Name */}
            {isSignUp && (
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
            )}

            {/* Email */}
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
            />

            {/* Forgot password */}
            {!isSignUp && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs sm:text-sm text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm sm:text-base disabled:opacity-60"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Login'}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-xs sm:text-sm mt-5 text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
              className="text-indigo-600 font-semibold"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-5 sm:mt-6">
            © 2026 Bachelor of Culture and Arts Education
          </p>

        </div>
      </div>
    </div>
  )
}