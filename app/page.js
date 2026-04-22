'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAndRoute()
  }, [])

  const checkAndRoute = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // If logged in, go to dashboard
        router.push('/dashboard')
      } else {
        // If not logged in, go to login
        router.push('/login')
      }
    } catch (error) {
      // Default to login on error
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while redirecting
  return (
    <div style={{ 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Montserrat', sans-serif",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        textAlign: "center",
        color: "white"
      }}>
        <div style={{
          fontSize: "3rem",
          marginBottom: "1rem"
        }}>
          ⏳
        </div>
        <h1 style={{
          fontSize: "1.5rem",
          marginBottom: "0.5rem",
          fontWeight: "600"
        }}>
          Loading...
        </h1>
        <p style={{
          fontSize: "1rem",
          opacity: 0.9
        }}>
          Redirecting you to your dashboard
        </p>
      </div>
    </div>
  )
}
