'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ChangePassword() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // 🔐 PASSWORD STRENGTH
  const getStrength = (pass) => {
    let score = 0
    if (pass.length >= 6) score++
    if (pass.length >= 10) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = getStrength(password)

  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully!')

      setTimeout(() => {
        router.push('/dashboard')
      }, 1200)
    }
  }

  return (
    <div style={styles.container}>

      {/* BACK BUTTON */}
      <button onClick={() => router.back()} style={styles.backBtn}>
        ← Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={styles.card}
      >

        <h2 style={styles.title}>Change Password</h2>
        <p style={styles.subtitle}>Secure your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* PASSWORD */}
          <div style={styles.inputWrapper}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <span
              onClick={() => setShowPass(!showPass)}
              style={styles.eye}
            >
              {showPass ? '🙈' : '👁'}
            </span>
          </div>

          {/* STRENGTH BAR */}
          {password && (
            <div style={styles.strengthBox}>
              <div style={{
                ...styles.strengthBar,
                width: `${(strength / 5) * 100}%`,
                background:
                  strength <= 2 ? '#ef4444' :
                  strength <= 3 ? '#f59e0b' :
                  '#22c55e'
              }} />
              <p style={styles.strengthText}>
                {strengthLabel}
              </p>
            </div>
          )}

          {/* CONFIRM */}
          <div style={styles.inputWrapper}>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              style={styles.eye}
            >
              {showConfirm ? '🙈' : '👁'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>

        </form>
      </motion.div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 40%, #1e40af 100%)",
    padding: '2rem',
    position: 'relative'
  },

  backBtn: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#1A4895'
  },

  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#fff',
    borderRadius: '18px',
    padding: '2.5rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
  },

  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1A4895',
    marginBottom: '5px'
  },

  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '1.5rem'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  inputWrapper: {
    position: 'relative'
  },

  input: {
    width: '100%',
    padding: '0.9rem 2.5rem 0.9rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(26,72,149,0.25)',
    fontSize: '15px',
    outline: 'none',
    color: '#111827'
  },

  eye: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '18px'
  },

  strengthBox: {
    marginTop: '-8px'
  },

  strengthBar: {
    height: '6px',
    borderRadius: '10px',
    transition: '0.3s ease'
  },

  strengthText: {
    fontSize: '12px',
    marginTop: '4px',
    color: '#6b7280'
  },

  button: {
    marginTop: '10px',
    padding: '0.9rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#1A4895',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer'
  }
}

