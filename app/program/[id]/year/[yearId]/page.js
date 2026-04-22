"use client"

import { use } from "react"
import { useRouter } from "next/navigation"

export default function YearPage({ params }) {
  const p = use(params)
  const router = useRouter()

  const contentTypes = [
    { name: "Images", icon: "🖼️", type: "images" },
    { name: "Videos", icon: "🎥", type: "videos" },
    { name: "Files", icon: "📄", type: "files" },
    { name: "Records", icon: "🎙️", type: "records" }
  ]

  return (
    <div style={{ padding: 20 }}>
      <button 
        onClick={() => router.back()} 
        style={{ marginBottom: 20, padding: "10px 20px", cursor: "pointer" }}
      >
        ← Back
      </button>

      <h1>Content</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
        {contentTypes.map((ct) => (
          <div
            key={ct.type}
            onClick={() => router.push(`/program/${p.id}/year/${p.yearId}/${ct.type}`)}
            style={{
              padding: 20,
              backgroundColor: "#7DD3FC",
              cursor: "pointer",
              borderRadius: 8,
              textAlign: "center",
              fontSize: 18,
              fontWeight: "bold",
              transition: "transform 0.2s",
              userSelect: "none"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>{ct.icon}</div>
            <div>{ct.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
