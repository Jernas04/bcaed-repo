"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { IconImage, IconVideo, IconFile, IconAudio, IconArrowLeft } from "@/lib/icons"

export default function ContentTypePage({ params }) {
  const p = use(params)
  const router = useRouter()

  const contentTypes = [
    { name: "Images", icon: IconImage, type: "images" },
    { name: "Videos", icon: IconVideo, type: "videos" },
    { name: "Files", icon: IconFile, type: "files" },
    { name: "Records", icon: IconAudio, type: "records" }
  ]

  const categoryTitle = p.category.charAt(0).toUpperCase() + p.category.slice(1)
  const yearLabel = `${p.year}${p.year === '1' ? 'st' : p.year === '2' ? 'nd' : p.year === '3' ? 'rd' : 'th'} Year`

  return (
    <div style={{ 
      padding: "2rem 1rem", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Montserrat', sans-serif"
    }}>
      <button 
        onClick={() => router.push(`/${p.category}`)} 
        style={{ 
          marginBottom: "1.5rem", 
          padding: "0.75rem 1.5rem", 
          cursor: "pointer", 
          borderRadius: "8px", 
          border: "none", 
          backgroundColor: "white",
          color: "#1f2937",
          fontWeight: "600",
          fontSize: "0.95rem",
          alignSelf: "flex-start",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem"
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#f3f4f6"
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "white"
        }}
      >
        <IconArrowLeft /> Back
      </button>

      <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%", flex: 1 }}>
        <h1 style={{ color: "white", marginBottom: "0.5rem", fontSize: "clamp(24px, 6vw, 32px)", fontWeight: "700" }}>{categoryTitle}</h1>
        <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "2rem", fontSize: "clamp(12px, 3vw, 14px)" }}>{yearLabel}</p>

        <div style={{ display: "grid", gap: "1rem" }}>
          {contentTypes.map((ct) => (
            <div
              key={ct.type}
              onClick={() => router.push(`/${p.category}/${p.year}/${ct.type}`)}
              style={{
                padding: "1rem 1.5rem",
                backgroundColor: "white",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "clamp(14px, 3vw, 16px)",
                fontWeight: "600",
                color: "#1f2937",
                transition: "all 0.3s",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
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
              <div style={{ marginBottom: "0.75rem", color: "#667eea", display: "flex", justifyContent: "center" }}>
                <ct.icon />
              </div>
              <div>{ct.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
