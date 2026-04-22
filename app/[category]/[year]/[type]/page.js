"use client"

import { useEffect, useState, use } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// Icon Components
const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
)

const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
)

const IconVideo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
)

const IconFile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
)

const IconMusic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18v-5m-4 5v-5m8-3v8m4-8v5m4-5v3"></path>
  </svg>
)

const IconLoader = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
    <circle cx="12" cy="12" r="1" />
    <path d="M12 3a9 9 0 0 1 9 9m-9 9a9 9 0 0 1-9-9" />
  </svg>
)

export default function ContentPage({ params }) {
  const p = use(params)
  const [contents, setContents] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [yearId, setYearId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeTab, setActiveTab] = useState(p.type)
  const router = useRouter()

  // Map database types from URL-friendly names
  const typeMap = {
    images: "image",
    videos: "video",
    files: "file",
    records: "audio"
  }

  // Convert URL category to proper case for database lookup
  const categoryToProgramName = {
    music: "Music",
    dance: "Dance",
    arts: "Arts",      // URL says "arts" but DB says "Art"
    drama: "Drama"
  }

  // Convert URL year (1,2,3,4) to year_level format (1st Year, 2nd Year, etc.)
  const yearLevelMap = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year'
  }

  const currentType = typeMap[p.type] || p.type
  const typeLabel = p.type.charAt(0).toUpperCase() + p.type.slice(1)
  const categoryTitle = p.category.charAt(0).toUpperCase() + p.category.slice(1)
  const programName = categoryToProgramName[p.category] || categoryTitle
  const yearLevelString = yearLevelMap[p.year]

  useEffect(() => {
    fetchYearId()
  }, [])

  useEffect(() => {
    if (yearId) {
      fetchContents()
    }
  }, [yearId])

  async function fetchYearId() {
    console.log("🔍 Step 1 - Looking for program:", programName)
    
    try {
      // First, find the program_id by program name
      const { data: programData, error: programError } = await supabase
        .from("programs")
        .select("id, name")
        .ilike("name", programName)
        .limit(1)

      if (programError) {
        console.error("❌ Program query error:", programError)
        setError(`Database error: ${programError.message}`)
        setLoading(false)
        return
      }

      if (!programData || programData.length === 0) {
        console.error("❌ Program not found:", programName)
        console.log("💡 Available programs:", programData)
        setError(`Program "${programName}" not found. Make sure programs are seeded.`)
        setLoading(false)
        return
      }

      const programId = programData[0].id
      console.log("✅ Program found:", programData[0])
      console.log("🔍 Step 2 - Looking for year:", { programId, yearLevelString })

      // Now find the year using program_id and year_level
      const { data: yearData, error: yearError } = await supabase
        .from("years")
        .select("id, program_id, year_level")
        .eq("program_id", programId)
        .eq("year_level", yearLevelString)
        .limit(1)

      if (yearError) {
        console.error("❌ Year query error:", yearError)
        setError(`Database error: ${yearError.message}`)
        setLoading(false)
        return
      }

      if (!yearData || yearData.length === 0) {
        console.error("❌ Year not found:", { programId, yearLevelString })
        console.log("💡 Try refreshing after re-seeding the years table")
        setError(`Year "${yearLevelString}" not found. Please run: node scripts/seedYears.js`)
        setLoading(false)
        return
      }

      console.log("✅ Year found:", yearData[0])
      setYearId(yearData[0].id)
    } catch (err) {
      console.error("❌ Unexpected error:", err)
      setError(`Unexpected error: ${err.message}`)
      setLoading(false)
    }
  }

  async function fetchContents() {
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("year_id", yearId)
      .eq("type", currentType)

    if (error) {
      console.log(error)
      return
    }

    setContents(data)
    setLoading(false)
  }

  async function uploadContent() {
    if (!file || !title) {
      setError("Please enter a title and select a file")
      return
    }

    if (!yearId) {
      setError("Unable to find year data. Please refresh the page.")
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const fileName = `${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file)

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      const { data } = supabase.storage
        .from("media")
        .getPublicUrl(fileName)

      const fileUrl = data.publicUrl

      const { error: insertError } = await supabase.from("contents").insert([
        {
          year_id: yearId,
          title,
          description,
          type: currentType,
          file_url: fileUrl
        }
      ])

      if (insertError) {
        setError(`Database error: ${insertError.message}`)
        setUploading(false)
        return
      }

      setSuccess(true)
      setFile(null)
      setTitle("")
      setDescription("")
      setTimeout(() => setSuccess(false), 3000)
      fetchContents()
    } catch (err) {
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          backgroundColor: "white",
          padding: "3rem 2.5rem",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          minWidth: "280px"
        }}>
          <div style={{ 
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "center"
          }}>
            <IconLoader />
          </div>
          <p style={{ 
            fontSize: "1rem", 
            color: "#1f2937",
            margin: "0",
            fontWeight: "500"
          }}>
            Loading {typeLabel.toLowerCase()}...
          </p>
          <p style={{
            fontSize: "0.8rem",
            color: "#6b7280",
            margin: "0.5rem 0 0 0"
          }}>
            {categoryTitle} • {yearLevelString}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      padding: "1.5rem 1rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header with Back Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <button 
            onClick={() => router.back()}
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "white",
              color: "#1f2937",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#f3f4f6"
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "white"
            }}
          >
            <IconArrowLeft /> Back
          </button>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ 
              color: "white", 
              margin: "0 0 0.1rem 0", 
              fontSize: "1.5rem",
              fontWeight: "700"
            }}>
              {categoryTitle}
            </h1>
            <p style={{ 
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              fontSize: "0.85rem"
            }}>
              {yearLevelString}
            </p>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div style={{
          display: "flex",
          gap: "0.4rem",
          marginBottom: "1rem",
          backgroundColor: "rgba(255,255,255,0.1)",
          padding: "0.4rem",
          borderRadius: "8px",
          backdropFilter: "blur(10px)",
          overflowX: "auto",
          flexWrap: "wrap"
        }}>
          {[
            { key: "images", label: "Images", icon: IconImage },
            { key: "videos", label: "Videos", icon: IconVideo },
            { key: "files", label: "Files", icon: IconFile },
            { key: "records", label: "Records", icon: IconMusic }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key)
                if (key !== p.type) {
                  router.push(`/${p.category}/${p.year}/${key}`)
                }
              }}
              style={{
                padding: "0.6rem 1rem",
                backgroundColor: activeTab === key ? "white" : "transparent",
                color: activeTab === key ? "#667eea" : "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: activeTab === key ? "600" : "500",
                fontSize: "0.85rem",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                whiteSpace: "nowrap"
              }}
              onMouseOver={(e) => {
                if (activeTab !== key) {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.15)"
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== key) {
                  e.target.style.backgroundColor = "transparent"
                }
              }}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {success && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#10b981",
            color: "white",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            animation: "slideDown 0.3s ease"
          }}>
            <span style={{ fontSize: "1.25rem" }}>✓</span>
            <span><strong>Success!</strong> File uploaded successfully</span>
          </div>
        )}

        {error && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#ef4444",
            color: "white",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem"
          }}>
            <span style={{ fontSize: "1.25rem", marginTop: "0.2rem" }}>!</span>
            <div>
              <strong>Upload Error</strong>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem", opacity: 0.95 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
        }}>
          <h2 style={{ 
            margin: "0 0 1rem 0", 
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#1f2937",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem"
          }}>
            <IconUpload /> Upload {typeLabel}
          </h2>

          <div style={{ display: "grid", gap: "1rem" }}>
            {/* Title Input */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.4rem", 
                fontWeight: "500", 
                color: "#1f2937",
                fontSize: "0.9rem"
              }}>
                Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                placeholder={`Enter ${typeLabel.toLowerCase()} title...`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  width: "100%",
                  boxSizing: "border-box",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  opacity: uploading ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>

            {/* Description Input */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.4rem", 
                fontWeight: "500", 
                color: "#1f2937",
                fontSize: "0.9rem"
              }}>
                Description <span style={{ color: "#999" }}>(optional)</span>
              </label>
              <textarea
                placeholder={`Add a description for this ${typeLabel.toLowerCase()}...`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                style={{ 
                  padding: "0.6rem 0.8rem", 
                  width: "100%",
                  boxSizing: "border-box",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  minHeight: "80px",
                  resize: "vertical",
                  transition: "all 0.2s",
                  opacity: uploading ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>

            {/* File Input */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "0.4rem", 
                fontWeight: "500", 
                color: "#1f2937",
                fontSize: "0.9rem"
              }}>
                File <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{
                padding: "1.5rem",
                border: "2px dashed #667eea",
                borderRadius: "8px",
                textAlign: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                backgroundColor: file ? "#f3f4f6" : "#fafafa",
                transition: "all 0.2s",
                opacity: uploading ? 0.6 : 1
              }}>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={uploading}
                  style={{ display: "none" }}
                  id="file-input"
                />
                <label htmlFor="file-input" style={{ cursor: uploading ? "not-allowed" : "pointer" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                    {file ? "✓" : "↓"}
                  </div>
                  <p style={{ margin: "0 0 0.2rem 0", color: "#1f2937", fontWeight: "500", fontSize: "0.9rem" }}>
                    {file ? file.name : `Drop ${typeLabel.toLowerCase()} or click`}
                  </p>
                  {!file && (
                    <p style={{ margin: "0.3rem 0 0 0", color: "#9ca3af", fontSize: "0.8rem" }}>
                      Max 100MB
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <button 
              onClick={uploadContent}
              disabled={uploading || !title || !file}
              style={{ 
                padding: "0.75rem 1.5rem", 
                cursor: uploading || !title || !file ? "not-allowed" : "pointer", 
                backgroundColor: uploading || !title || !file ? "#d1d5db" : "#667eea",
                color: "white", 
                border: "none", 
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.2s",
                opacity: uploading || !title || !file ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem"
              }}
              onMouseEnter={(e) => {
                if (!uploading && title && file) {
                  e.target.style.backgroundColor = "#5568d3"
                  e.target.style.transform = "translateY(-1px)"
                }
              }}
              onMouseLeave={(e) => {
                if (!uploading && title && file) {
                  e.target.style.backgroundColor = "#667eea"
                  e.target.style.transform = "translateY(0)"
                }
              }}
            >
              <IconUpload /> {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Content Display */}
        {contents.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "3rem 2rem",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            <p style={{ fontSize: "2.5rem", margin: "0 0 0.8rem 0" }}>∅</p>
            <p style={{ fontSize: "1rem", color: "#6b7280", margin: "0 0 0.4rem 0" }}>
              No {typeLabel.toLowerCase()} uploaded yet
            </p>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: 0 }}>
              Upload your first file above
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ 
              color: "white", 
              marginBottom: "1rem", 
              fontSize: "1.1rem",
              fontWeight: "600"
            }}>
              Content ({contents.length})
            </h2>

            {/* Gallery Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem"
            }}>
              {contents.map((c) => (
                <div 
                  key={c.id} 
                  style={{ 
                    backgroundColor: "white",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    transition: "all 0.3s",
                    transform: "translateY(0)",
                    cursor: c.type === "image" ? "pointer" : "default"
                  }}
                  onClick={() => c.type === "image" && setSelectedImage(c)}
                  onMouseOver={(e) => {
                    if (c.type === "image") {
                      e.currentTarget.style.transform = "translateY(-4px)"
                      e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.25)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (c.type === "image") {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)"
                    }
                  }}
                >
                  {/* Media Preview */}
                  <div style={{
                    backgroundColor: "#f3f4f6",
                    aspectRatio: "16/10",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}>
                    {c.type === "image" && (
                      <>
                        <img src={c.file_url} style={{ 
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }} alt={c.title} />
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0,0,0,0)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s"
                        }} className="image-overlay">
                          <span style={{ fontSize: "2.5rem", opacity: 0 }}>🔍</span>
                        </div>
                      </>
                    )}

                    {c.type === "video" && (
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    )}

                    {c.type === "file" && (
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                    )}

                    {c.type === "audio" && (
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <path d="M12 2a10 10 0 0 1 10 10m-10 10a10 10 0 0 1-10-10" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ margin: "0 0 0.4rem 0", color: "#1f2937", fontSize: "0.95rem", fontWeight: "600" }}>
                      {c.title}
                    </h3>
                    {c.description && (
                      <p style={{ margin: "0 0 0.8rem 0", color: "#6b7280", fontSize: "0.8rem", lineHeight: "1.4" }}>
                        {c.description}
                      </p>
                    )}

                    {/* Media Controls */}
                    {c.type === "video" && (
                      <video style={{
                        width: "100%",
                        borderRadius: "6px",
                        marginBottom: "1rem"
                      }} controls>
                        <source src={c.file_url} />
                      </video>
                    )}

                    {c.type === "audio" && (
                      <audio style={{
                        width: "100%",
                        marginBottom: "1rem"
                      }} controls>
                        <source src={c.file_url} />
                      </audio>
                    )}

                    {c.type === "file" && (
                      <a 
                        href={c.file_url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          display: "block",
                          textAlign: "center",
                          padding: "0.75rem 1rem", 
                          backgroundColor: "#667eea", 
                          color: "white", 
                          borderRadius: "6px", 
                          textDecoration: "none",
                          fontWeight: "500",
                          fontSize: "0.9rem",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#5568d3"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#667eea"}
                      >
                        Download File
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }} onClick={() => setSelectedImage(null)}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            animation: "zoomIn 0.3s ease"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, color: "#1f2937" }}>{selectedImage.title}</h2>
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: 0,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <IconX />
              </button>
            </div>

            <img 
              src={selectedImage.file_url} 
              style={{ 
                width: "100%",
                borderRadius: "8px",
                marginBottom: "1.5rem"
              }} 
              alt={selectedImage.title}
            />

            {selectedImage.description && (
              <div>
                <h3 style={{ color: "#1f2937", marginTop: 0 }}>Description</h3>
                <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                  {selectedImage.description}
                </p>
              </div>
            )}

            <style>{`
              @keyframes zoomIn {
                from {
                  transform: scale(0.9);
                  opacity: 0;
                }
                to {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        </div>
      )}

      <style>{`
        .image-overlay:hover span {
          opacity: 1 !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
