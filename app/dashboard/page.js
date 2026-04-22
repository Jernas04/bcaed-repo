'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [academicYears, setAcademicYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [yearLevels, setYearLevels] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)


  useEffect(() => {
    checkUser()
    fetchPrograms()
  }, [])

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    setCurrentUser({
      ...user,
      profile: profile || {
        name: user.user_metadata?.name || user.email,
        role: user.user_metadata?.role || 'student'
      }
    })
  }

  const fetchPrograms = async () => {
  const { data } = await supabase
    .from('programs')
    .select('*')

  const customOrder = ['Music', 'Dance', 'Drama', 'Arts']

  const sortedPrograms = (data || []).sort((a, b) => {
    return customOrder.indexOf(a.name) - customOrder.indexOf(b.name)
  })

  setPrograms(sortedPrograms)
  setLoading(false)
}


  const fetchAcademicYears = async (programId) => {
    const { data } = await supabase
      .from('academic_years')
      .select('*')
      .eq('program_id', programId)
      .order('name', { ascending: false })

    setAcademicYears(data || [])
  }

  const fetchYearLevels = async () => {
    const { data } = await supabase
      .from('years')
      .select('*')
      .eq('program_id', selectedProgram.id)
      .order('year_level')

    setYearLevels(data || [])
  }

  const handleProgramClick = (program) => {
    setSelectedProgram(program)
    setSelectedYear(null)
    setYearLevels([])
    fetchAcademicYears(program.id)
  }

  const handleYearClick = (year) => {
    setSelectedYear(year)
    fetchYearLevels()
  }

  const handleLogout = async () => {
  await signOut()
  router.push('/login')
}

  const containerStyle = {
    minHeight: '100vh',
    background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 40%, #1e40af 100%)",
    padding: '3rem 2rem',
    fontFamily: "'Montserrat', sans-serif"
  }

  const headerStyle = {
    maxWidth: '1200px',
    margin: '0 auto 3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  }

  const mainStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  }

  const cardGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease'
  }

  const menuItemStyle = {
  width: '100%',
  padding: '0.95rem 1rem',
  border: 'none',
  backgroundColor: 'white',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: '#1f2937', 
  transition: 'all 0.2s ease',
}

  if (loading) {
    return (
      <div style={containerStyle}>
        <h1 style={{ textAlign: 'center', color: 'white' }}>Loading...</h1>
      </div>
    )
  }

  return (
    <div style={containerStyle}>

      {/* HEADER */}
      <div style={{ ...headerStyle, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src="/images/logo.png"
            alt="Logo"
            style={{ height: '60px', width: '60px', objectFit: 'contain' }}
          />
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
              BCAEd Repository
            </h1>
            {currentUser && (
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                Welcome, <strong>{currentUser.profile?.name}</strong> ({currentUser.profile?.role})
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 0.8rem',
            cursor: 'pointer',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}
        >
          ☰
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            minWidth: '180px',
            zIndex: 100
          }}>
            <button
              onClick={() => {
                setMenuOpen(false)
                router.push('/change-password')
              }}
              style={menuItemStyle}
            >
              Change Password
            </button>

            <button
              onClick={() => {
                setMenuOpen(false)
                setShowLogoutModal(true)
              }}
              style={{ ...menuItemStyle, color: '#e63946' }}
            >
              Logout
            </button>
          </div>
        )}
      </div>


      <div style={mainStyle}>

        {/* PROGRAMS */}
        {!selectedProgram && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>

            <h2 style={{
              color: 'white',
              fontSize: '32px',
              fontWeight: '700',
              letterSpacing: '1px',
              marginBottom: '0.5rem'
            }}>
              Colegio de la Ciudad de Tayabas
            </h2>

            <p style={{
              color: 'white',
              fontSize: '18px',
              letterSpacing: '2px',
              marginBottom: '1rem',
              opacity: 0.95
            }}>
              Music • Dance • Drama • Visual Arts
            </p>

            <p style={{
              color: 'white',
              fontSize: '14px',
              opacity: 0.85,
              marginBottom: '3rem'
            }}>
              Select a category to explore our collection of educational resources
            </p>

            <div style={cardGridStyle}>
              {programs.map((program) => {
                const imageMap = {
                  Music: '/images/music.jpg',
                  Dance: '/images/dance.png',
                  Arts: '/images/arts.jpg',
                  Drama: '/images/drama.png'
                }

                return (
                  <div
                    key={program.id}
                    onClick={() => handleProgramClick(program)}
                    style={cardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <img
                      src={imageMap[program.name]}
                      alt={program.name}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                    />

                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {program.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#666',
                        marginTop: '0.75rem'
                      }}>
                        {program.description || 'Explore collection'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ACADEMIC YEARS */}
        {selectedProgram && !selectedYear && (
          <div>

            <button
              onClick={() => {
                setSelectedProgram(null)
                setAcademicYears([])
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#ffffff',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '2rem',
                fontWeight: '600',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >
              ← Back to Categories
            </button>

            <h2 style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>
              {selectedProgram.name}
            </h2>

            <p style={{
              color: 'white',
              fontSize: '16px',
              opacity: 0.9,
              marginBottom: '2.5rem'
            }}>
              Select an Academic Year
            </p>

            {academicYears.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#555'
              }}>
                No academic years available yet
              </div>
            ) : (
              <div style={cardGridStyle}>
                {academicYears.map((year) => (
                  <div
                    key={year.id}
                    onClick={() => handleYearClick(year)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '2rem',
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '1rem' }}>📅</div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#222'
                    }}>
                      {year.name}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* YEAR LEVELS */}
        {selectedYear && (
          <div>

            <button
              onClick={() => {
                setSelectedYear(null)
                setYearLevels([])
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#ffffff',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '2rem',
                fontWeight: '600',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >
              ← Back to Academic Years
            </button>

            <h2 style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>
              {selectedProgram.name}
            </h2>

            <p style={{
              color: 'white',
              fontSize: '16px',
              opacity: 0.9,
              marginBottom: '2.5rem'
            }}>
              {selectedYear.name} — Select Year Level
            </p>

            {yearLevels.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#555'
              }}>
                No year levels available yet
              </div>
            ) : (
              <div style={cardGridStyle}>
                {yearLevels.map((level) => (
                  <Link
                    key={level.id}
                    href={`/outputs/${level.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                        transition: 'all 0.3s ease',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ fontSize: '36px', marginBottom: '1rem' }}>🎓</div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#222'
                      }}>
                        {level.year_level}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}


        {/* FOOTER */}
        <footer style={{
          marginTop: '5rem',
          textAlign: 'center',
          color: 'white',
          fontSize: '14px',
          opacity: 0.85
        }}>
          © 2026 Bachelor of Culture and Arts Education
        </footer>

      </div>
      
      {showLogoutModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999
            }}>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '2.5rem',
              borderRadius: '18px',
              width: '420px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}>

            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚠️</div>

            <h2 style={{
              marginBottom: '0.75rem',
              fontSize: '22px',
              fontWeight: '700',
              color: '#111827'
            }}>
              Confirm Logout
            </h2>

            <p style={{
              color: '#4b5563',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Are you sure you want to log out of your account?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#f9fafb',
                  color: '#111827',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                }}
              >
                Cancel
              </button>


              <button
                onClick={handleLogout}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '700',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626'
                }}
              >
                Yes, Logout
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
