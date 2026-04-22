"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { IconArrowRight, IconHome } from "@/lib/icons"
export default function YearLevelPage({ params }) {
  const p = use(params)
  const router = useRouter()

  const years = [
    { level: "1st Year", id: 1 },
    { level: "2nd Year", id: 2 },
    { level: "3rd Year", id: 3 },
    { level: "4th Year", id: 4 }
  ]

  const categoryTitle = p.category.charAt(0).toUpperCase() + p.category.slice(1)

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Montserrat', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        padding: "2rem 1rem 1.5rem 1rem",
        borderBottom: "2px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Top row with logo and home button */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem"
          }}>
            {/* Logo */}
            <img 
              src="/images/logo.png" 
              alt="BCAEd Logo" 
              style={{
                height: "60px",
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.1))"
              }}
            />
            
            {/* Home Button */}
            <button 
              onClick={() => router.push("/")} 
              style={{ 
                padding: "0.5rem 1rem", 
                cursor: "pointer", 
                borderRadius: "8px", 
                border: "none", 
                backgroundColor: "white",
                color: "#1f2937",
                fontWeight: "600",
                fontSize: "0.85rem",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f3f4f6"
                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white"
                e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              <IconHome /> Home
            </button>
          </div>
          
          {/* Title */}
          <h1 style={{ 
            color: "white", 
            margin: "0", 
            fontSize: "clamp(24px, 6vw, 32px)", 
            fontWeight: "700",
            textAlign: "center"
          }}>
            {categoryTitle}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem 1rem", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "600px", width: "100%" }}>
          <div style={{ display: "grid", gap: "1rem" }}>
            {years.map((year) => (
              <div
                key={year.id}
                onClick={() => router.push(`/${p.category}/${year.id}`)}
                style={{
                  padding: "1rem 1.5rem",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  fontWeight: "600",
                  color: "#1f2937",
                  transition: "all 0.3s",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)"
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                {year.level}
                <div style={{ color: "#667eea" }}>
                  <IconArrowRight />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "1.5rem 1rem",
        backgroundColor: "rgba(0,0,0,0.1)",
        borderTop: "2px solid rgba(255,255,255,0.1)",
        textAlign: "center"
      }}>
        <p style={{
          color: "rgba(255,255,255,0.7)",
          margin: "0",
          fontSize: "0.85rem"
        }}>
          © 2026 BCAEd Digital Repository
        </p>
      </footer>
    </div>
  )
}
