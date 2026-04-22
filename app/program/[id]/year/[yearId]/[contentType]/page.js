"use client"

import { useEffect, useState, use } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ContentTypePage({ params }) {
  const p = use(params)
  const [contents, setContents] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const router = useRouter()

  // Map URL-friendly names to database types
  const typeMap = {
    images: "image",
    videos: "video",
    files: "file",
    records: "audio"
  }

  const currentType = typeMap[p.contentType] || p.contentType
  const typeLabel = p.contentType.charAt(0).toUpperCase() + p.contentType.slice(1)

  useEffect(() => {
    fetchContents()
  }, [p.yearId, p.contentType])

  async function fetchContents() {
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("year_id", p.yearId)
      .eq("type", currentType)

    if (error) {
      console.log(error)
      return
    }

    setContents(data)
  }

  async function uploadContent() {
    if (!file || !title) {
      alert("Please fill in title and select a file")
      return
    }

    const fileName = `${Date.now()}-${file.name}`

    // 1. upload to storage
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file)

    if (uploadError) {
      console.log(uploadError)
      return
    }

    // 2. get public url
    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(fileName)

    const fileUrl = data.publicUrl

    // 3. save to database
    const { error } = await supabase.from("contents").insert([
      {
        year_id: p.yearId,
        title,
        type: currentType,
        file_url: fileUrl
      }
    ])

    if (error) {
      console.log(error)
      return
    }

    alert("Uploaded successfully!")
    setFile(null)
    setTitle("")

    // refresh list
    fetchContents()
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.back()} style={{ marginBottom: 20, padding: "10px 20px", cursor: "pointer" }}>
        ← Back
      </button>

      <h1>{typeLabel}</h1>

      <div style={{ marginBottom: 30, padding: 15, backgroundColor: "#f0f0f0", borderRadius: 8 }}>
        <h2>Upload {typeLabel}</h2>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 10, marginRight: 10, width: 200 }}
        />

        <br /><br />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ padding: 10, marginBottom: 10 }}
        />

        <br /><br />

        <button onClick={uploadContent} style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#0066cc", color: "white", border: "none", borderRadius: 4 }}>
          Upload
        </button>
      </div>

      {contents.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 40, color: "#999" }}>
          <p>No {typeLabel.toLowerCase()} yet</p>
          <p>Content will appear here once uploaded</p>
        </div>
      ) : (
        <div>
          {contents.map((c) => (
            <div key={c.id} style={{ marginBottom: 20, padding: 15, border: "1px solid #ddd", borderRadius: 8 }}>
              <h3>{c.title}</h3>

              {c.type === "image" && (
                <img src={c.file_url} width="200" style={{ borderRadius: 4 }} />
              )}

              {c.type === "video" && (
                <video width="300" controls style={{ borderRadius: 4 }}>
                  <source src={c.file_url} />
                </video>
              )}

              {c.type === "file" && (
                <a 
                  href={c.file_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", padding: "10px 15px", backgroundColor: "#4CAF50", color: "white", borderRadius: 4, textDecoration: "none" }}
                >
                  Download File
                </a>
              )}

              {c.type === "audio" && (
                <audio controls style={{ width: "100%" }}>
                  <source src={c.file_url} />
                </audio>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
