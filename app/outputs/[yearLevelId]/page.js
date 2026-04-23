'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
)
const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
)
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
  </svg>
)
const AudioIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
)
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Tab config ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'images',  label: 'Images',  type: 'image', Icon: ImageIcon,
    accept: 'image/*', hint: 'PNG, JPG, GIF, WEBP' },
  { key: 'videos',  label: 'Videos',  type: 'video', Icon: VideoIcon,
    accept: 'video/*', hint: 'MP4, MOV, AVI, WEBM' },
  { key: 'files',   label: 'Files',   type: 'file',  Icon: FileIcon,
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip', hint: 'PDF, DOC, PPT, XLS, ZIP' },
  { key: 'records', label: 'Records', type: 'audio', Icon: AudioIcon,
    accept: 'audio/*', hint: 'MP3, WAV, AAC, OGG' },
]

// ── Responsive hook ────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function OutputsPage() {
  const params  = useParams()
  const router  = useRouter()
  const yearId  = params.yearLevelId
  const fileRef = useRef(null)
  const isMobile = useIsMobile()

  const [currentUser,     setCurrentUser]     = useState(null)
  const [editingContentId, setEditingContentId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [activeTab,       setActiveTab]        = useState('images')
  const [contents,        setContents]         = useState([])
  const [loading,         setLoading]          = useState(true)
  const [selectedContent, setSelectedContent]  = useState(null)
  const [comments,        setComments]         = useState([])
  const [newComment,      setNewComment]       = useState('')
  const [commentLoading,  setCommentLoading]   = useState(false)
  const [uploading,       setUploading]        = useState(false)
  const [file,            setFile]             = useState(null)
  const [title,           setTitle]            = useState('')
  const [description,     setDescription]      = useState('')
  const [uploadError,     setUploadError]      = useState(null)
  const [uploadSuccess,   setUploadSuccess]    = useState(false)
  const [dragOver,        setDragOver]         = useState(false)
  // Mobile detail view tab: 'media' | 'comments'
  const [detailTab,       setDetailTab]        = useState('media')

  const currentTab = TABS.find(t => t.key === activeTab)
  const isTeacher  = currentUser?.profile?.role === 'teacher'
  const isStudent  = currentUser?.profile?.role === 'student'

  useEffect(() => { checkUser() }, [])
  useEffect(() => { if (currentUser) fetchContents() }, [currentUser, activeTab])
  useEffect(() => { if (selectedContent) { fetchComments(selectedContent.id); setDetailTab('media') } }, [selectedContent])

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    setCurrentUser({ ...user, profile })
  }

  const fetchContents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contents').select('*')
      .eq('year_id', yearId).eq('type', currentTab?.type)
      .order('created_at', { ascending: false })
    if (error) { setContents([]); setLoading(false); return }
    const contentsWithDetails = await Promise.all((data || []).map(async (content) => {
      const { data: userData } = await supabase.from('users').select('name, role').eq('id', content.user_id).single()
      const { data: yearData } = await supabase.from('years').select('year_level, academic_year_id').eq('id', content.year_id).single()
      let academicYearName = ''
      if (yearData?.academic_year_id) {
        const { data: ayData } = await supabase.from('academic_years').select('name').eq('id', yearData.academic_year_id).single()
        academicYearName = ayData?.name || ''
      }
      return { ...content, uploader: userData || { name: 'Unknown', role: '' }, year: { year_level: yearData?.year_level || '', academic_year: academicYearName } }
    }))
    setContents(contentsWithDetails)
    setLoading(false)
  }

  const fetchComments = async (contentId) => {
    if (!contentId) return
    const { data, error } = await supabase.from('comments').select('*').eq('output_id', contentId).order('created_at', { ascending: true })
    if (error) { setComments([]); return }
    const commentsWithUsers = await Promise.all((data || []).map(async (comment) => {
      const { data: userData } = await supabase.from('users').select('name, role').eq('id', comment.user_id).single()
      return { ...comment, commenter: userData || { name: 'Unknown', role: '' } }
    }))
    setComments(commentsWithUsers)
  }

  const handleUpload = async () => {
    if (!file || !title.trim()) { setUploadError('Please enter a title and select a file'); return }
    setUploading(true); setUploadError(null)
    const fileName = `${currentTab.type}/${Date.now()}-${file.name}`
    const { error: storageError } = await supabase.storage.from('media').upload(fileName, file)
    if (storageError) { setUploadError(storageError.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
    const { error: dbError } = await supabase.from('contents').insert([{
      year_id: yearId, user_id: currentUser.id,
      title: title.trim(), description: description.trim(),
      type: currentTab.type, file_url: urlData.publicUrl
    }])
    if (dbError) { setUploadError(dbError.message); setUploading(false); return }
    setFile(null); setTitle(''); setDescription('')
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 3000)
    fetchContents()
    setUploading(false)
  }

  const handleComment = async () => {
    if (!newComment.trim() || !selectedContent?.id) return
    setCommentLoading(true)
    const { error } = await supabase.from('comments').insert([{
      output_id: selectedContent.id,
      user_id: currentUser.id,
      comment_text: newComment.trim()
    }])
    setCommentLoading(false)
    if (error) { console.error(error); return }
    setNewComment('')
    fetchComments(selectedContent.id)
  }

  const handleUpdateContent = async () => {
  if (!editingContentId) return

  const { error } = await supabase
    .from('contents')
    .update({
      title: editTitle.trim(),
      description: editDescription.trim()
    })
    .eq('id', editingContentId)

  if (error) return console.error(error)

  setEditingContentId(null)
  fetchContents()
}

const handleDeleteContent = async (content) => {
  const confirmDelete = confirm('Delete this output permanently?')
  if (!confirmDelete) return

  try {
    const url = content.file_url
    const path = url.split('/media/')[1]

    // delete file
    await supabase.storage.from('media').remove([path])

    // delete record
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', content.id)

    if (error) {
      console.error(error)
      return
    }

    fetchContents()
  } catch (err) {
    console.error(err)
  }
}

const handleUpdateComment = async (id) => {
  const { error } = await supabase
    .from('comments')
    .update({ comment_text: editCommentText })
    .eq('id', id)

  if (error) return console.error(error)

  setEditingCommentId(null)
  fetchComments(selectedContent.id)
}

const handleDeleteComment = async (id) => {
  const confirmDelete = confirm('Delete this comment?')
  if (!confirmDelete) return

  await supabase.from('comments').delete().eq('id', id)
  fetchComments(selectedContent.id)
}

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  // ── Styles ────────────────────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: '100vh',
      background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 40%, #1e40af 100%)",
      fontFamily: "'Montserrat', 'Segoe UI', sans-serif",
      display: 'flex', flexDirection: 'column'
    },
    header: {
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
      gap: '0.5rem'
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 },
    backBtn: {
      display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
      padding: isMobile ? '0.5rem 0.65rem' : '0.5rem 1rem',
      borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
      fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', transition: 'all 0.2s'
    },
    headerTitle: {
      color: 'white',
      fontSize: isMobile ? '14px' : '18px',
      fontWeight: '700', margin: 0,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
    },
    userBadge: {
      display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0,
      background: isTeacher ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.2)',
      border: `1px solid ${isTeacher ? 'rgba(251,191,36,0.4)' : 'rgba(99,102,241,0.4)'}`,
      borderRadius: '20px', padding: isMobile ? '0.3rem 0.55rem' : '0.35rem 0.85rem',
      color: isTeacher ? '#fbbf24' : '#a5b4fc',
      fontSize: isMobile ? '11px' : '12px', fontWeight: '600',
      maxWidth: isMobile ? '120px' : 'none',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
    },
    main: {
      flex: 1,
      padding: isMobile ? '1rem' : '1.5rem 2rem',
      maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box'
    },
    tabBar: {
      display: 'flex', gap: '0.3rem', marginBottom: '1.25rem',
      background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    tabActive: {
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: isMobile ? '0' : '0.4rem',
      padding: isMobile ? '0.6rem 0.25rem' : '0.6rem 0.5rem',
      borderRadius: '8px', border: 'none', cursor: 'pointer',
      background: 'white', color: '#312e81', fontWeight: '700',
      fontSize: isMobile ? '11px' : '13px',
      fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s',
      flexDirection: 'column'
    },
    tabInactive: {
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: isMobile ? '0' : '0.4rem',
      padding: isMobile ? '0.6rem 0.25rem' : '0.6rem 0.5rem',
      borderRadius: '8px', border: 'none', cursor: 'pointer',
      background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: '500',
      fontSize: isMobile ? '11px' : '13px',
      fontFamily: 'inherit', transition: 'all 0.2s',
      flexDirection: 'column'
    },
    uploadCard: {
      background: 'rgba(255,255,255,0.95)', borderRadius: '16px',
      padding: isMobile ? '1rem' : '1.5rem',
      marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    },
    uploadTitle: { margin: '0 0 1rem', color: '#1e1b4b', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    input: {
      width: '100%', padding: '0.65rem 0.9rem', border: '2px solid #e5e7eb',
      borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
      color: '#1f2937', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
    },
    textarea: {
      width: '100%', padding: '0.65rem 0.9rem', border: '2px solid #e5e7eb',
      borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', color: '#1f2937',
      outline: 'none', boxSizing: 'border-box', minHeight: '70px', resize: 'vertical', transition: 'border-color 0.2s'
    },
    dropZone: (active) => ({
      border: `2px dashed ${active ? '#6366f1' : '#c4b5fd'}`,
      borderRadius: '10px', padding: '1.25rem',
      background: active ? 'rgba(99,102,241,0.05)' : '#fafafa',
      textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
    }),
    uploadBtn: (disabled) => ({
      width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none',
      background: disabled ? '#d1d5db' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: 'white', fontWeight: '700', fontSize: '14px', fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s'
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? 'repeat(auto-fill, minmax(150px, 1fr))'
        : 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: isMobile ? '0.85rem' : '1.25rem'
    },
    card: {
      background: 'rgba(255,255,255,0.97)', borderRadius: '14px', overflow: 'hidden',
      cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'all 0.25s',
      border: '1px solid rgba(255,255,255,0.3)'
    },
    emptyBox: {
      background: 'rgba(255,255,255,0.07)', borderRadius: '16px', padding: '4rem 2rem',
      textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)'
    },
    footer: {
      textAlign: 'center', padding: '1.25rem',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.35)', fontSize: '12px'
    },
    actionRow: {
  display: 'flex',
  gap: '0.5rem',
  marginTop: '0.75rem',
  flexWrap: 'wrap'
},

editBtn: {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.4rem 0.7rem',
  borderRadius: '8px',
  border: '1px solid rgba(99,102,241,0.3)',
  background: 'rgba(99,102,241,0.1)',
  color: '#6366f1',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s'
},

deleteBtn: {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.4rem 0.7rem',
  borderRadius: '8px',
  border: '1px solid rgba(239,68,68,0.3)',
  background: 'rgba(239,68,68,0.1)',
  color: '#ef4444',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s'
},

saveBtn: {
  padding: '0.5rem 0.9rem',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  color: 'white',
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer'
},

cancelBtn: {
  padding: '0.5rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  background: '#f9fafb',
  color: '#374151',
  fontWeight: '600',
  fontSize: '12px',
  cursor: 'pointer'
},
  }

  // ── Detail view ───────────────────────────────────────────────────────────────
  if (selectedContent) {
    const uploaderName = selectedContent.uploader?.name || 'Unknown'
    const uploaderRole = selectedContent.uploader?.role || ''
    const academicYear = selectedContent.year?.academic_year || ''
    const yearLevel    = selectedContent.year?.year_level || ''

    // Mobile detail: tab switcher between media and comments
    const detailContent = (
      <>
        {/* Media panel */}
        {(!isMobile || detailTab === 'media') && (
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#0f0f23', minHeight: isMobile ? '200px' : '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedContent.type === 'image' && (
                <img src={selectedContent.file_url} style={{ maxWidth: '100%', maxHeight: isMobile ? '280px' : '500px', objectFit: 'contain' }} alt={selectedContent.title} />
              )}
              {selectedContent.type === 'video' && (
                <video controls style={{ width: '100%', maxHeight: isMobile ? '280px' : '500px' }}>
                  <source src={selectedContent.file_url} />
                </video>
              )}
              {selectedContent.type === 'audio' && (
                <div style={{ padding: '2rem', width: '100%' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}><span style={{ fontSize: '4rem' }}>🎵</span></div>
                  <audio controls style={{ width: '100%' }}><source src={selectedContent.file_url} /></audio>
                </div>
              )}
              {selectedContent.type === 'file' && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <span style={{ fontSize: '5rem', display: 'block', marginBottom: '1rem' }}>📄</span>
                  <a href={selectedContent.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
                    <DownloadIcon /> Download File
                  </a>
                </div>
              )}
            </div>
            <div style={{ padding: isMobile ? '0.85rem' : '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.4rem', color: '#1e1b4b', fontSize: isMobile ? '15px' : '18px' }}>{selectedContent.title}</h2>
              {selectedContent.description && <p style={{ margin: '0 0 0.75rem', color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>{selectedContent.description}</p>}
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px', lineHeight: '1.6' }}>
                Uploaded by <strong style={{ color: '#6366f1' }}>{uploaderName} ({uploaderRole})</strong><br />
                {(academicYear || yearLevel) && <>{academicYear ? `${academicYear} · ` : ''}{yearLevel}<br /></>}
                {new Date(selectedContent.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Comments panel */}
        {(!isMobile || detailTab === 'comments') && (
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: isMobile ? 'none' : '80vh' }}>
            <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '15px', fontWeight: '700' }}>
                💬 Comments <span style={{ color: '#9ca3af', fontWeight: '400' }}>({comments.length})</span>
              </h3>
            </div>
            {isTeacher && (
              <div style={{ margin: '0.75rem 1.25rem 0', padding: '0.6rem 0.9rem', background: 'linear-gradient(135deg,#fef9c3,#fef3c7)', borderRadius: '8px', fontSize: '12px', color: '#92400e', fontWeight: '600', border: '1px solid #fde68a' }}>
                ✏️ You are providing feedback as a <strong>Teacher</strong>
              </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem', maxHeight: isMobile ? '300px' : 'none' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
                  <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>💭</p>
                  <p style={{ fontSize: '13px', margin: 0 }}>No comments yet</p>
                </div>
              ) : comments.map(c => {
                const role = c.commenter?.role || c.users?.role
                const name = c.commenter?.name || c.users?.name || 'Unknown'
                const isT = role === 'teacher'
                return (
                  <div key={c.id} style={{ padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '10px', background: isT ? '#fffbeb' : '#f8faff', borderLeft: `3px solid ${isT ? '#f59e0b' : '#6366f1'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '12px' }}>
                        {name}
                        {isT && <span style={{ marginLeft: '0.4rem', fontSize: '10px', background: '#f59e0b', color: 'white', padding: '1px 5px', borderRadius: '4px' }}>TEACHER</span>}
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '11px' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    {editingCommentId === c.id ? (
  <>
    <textarea
      value={editCommentText}
      onChange={(e) => setEditCommentText(e.target.value)}
      style={S.textarea}
    />
    <button
  onClick={() => handleUpdateComment(c.id)}
  style={{
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  }}
>
  Save
</button>
  </>
) : (
  <p style={{ color: '#1f2937', fontSize: '13px', margin: 0 }}>
  {c.comment_text}
</p>
)}
{currentUser?.id === c.user_id && (
  <div style={S.actionRow}>
    <button
      style={S.editBtn}
      onClick={() => {
        setEditingCommentId(c.id)
        setEditCommentText(c.comment_text)
      }}
    >
      ✏️ Edit
    </button>

    <button
      style={S.deleteBtn}
      onClick={() => handleDeleteComment(c.id)}
    >
      🗑 Delete
    </button>
  </div>
)}
                  </div>
                  
                )
              })}
            </div>
            <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid #f3f4f6' }}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment() }}
                placeholder={isTeacher ? 'Write your feedback...' : 'Add a comment...'}
                style={{ ...S.textarea, minHeight: '70px', marginBottom: '0.5rem' }}
              />
              <button onClick={handleComment} disabled={!newComment.trim() || commentLoading}
                style={{ ...S.uploadBtn(!newComment.trim() || commentLoading), padding: '0.6rem' }}>
                <SendIcon /> {isTeacher ? 'Post Feedback' : 'Post Comment'}
              </button>
            </div>
          </div>
        )}
      </>
    )

    return (
      <div style={S.page}>
        <header style={S.header}>
          <div style={S.headerLeft}>
            <button style={S.backBtn} onClick={() => setSelectedContent(null)}>
              <ArrowLeftIcon /> {isMobile ? '' : 'Back'}
            </button>
            <h3 style={S.headerTitle}>{selectedContent.title}</h3>
          </div>
          <div style={S.userBadge}>
            {isTeacher ? '👩‍🏫' : '👨‍🎓'} {currentUser?.profile?.name}
          </div>
        </header>

        {/* Mobile tab switcher */}
        {isMobile && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {['media', 'comments'].map(tab => (
              <button key={tab} onClick={() => setDetailTab(tab)} style={{
                flex: 1, padding: '0.65rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
                background: detailTab === tab ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: detailTab === tab ? 'white' : 'rgba(255,255,255,0.5)',
                borderBottom: detailTab === tab ? '2px solid white' : '2px solid transparent'
              }}>
                {tab === 'media' ? '🖼 Media' : `💬 Comments (${comments.length})`}
              </button>
            ))}
          </div>
        )}

        <div style={{
          ...S.main,
          display: isMobile ? 'flex' : 'grid',
          flexDirection: 'column',
          gridTemplateColumns: isMobile ? undefined : '1fr 380px',
          gap: '1.5rem', alignItems: 'start'
        }}>
          {detailContent}
        </div>

        <footer style={S.footer}>© 2026 BCAEd Digital Repository · Colegio de la Ciudad de Tayabas</footer>
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <button style={S.backBtn} onClick={() => router.push('/dashboard')}>
            <ArrowLeftIcon /> {isMobile ? '' : 'Dashboard'}
          </button>
          <h1 style={S.headerTitle}>📤 Student Outputs</h1>
        </div>
        <div style={S.userBadge}>
          {isTeacher ? '👩‍🏫' : '👨‍🎓'} {currentUser?.profile?.name}
        </div>
      </header>

      <div style={S.main}>
        {/* Tab Bar */}
        <div style={S.tabBar}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={activeTab === tab.key ? S.tabActive : S.tabInactive}>
              <tab.Icon />
              <span style={{ marginTop: isMobile ? '2px' : '0' }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Upload Section */}
        {currentUser && (
          <div style={S.uploadCard}>
            <h3 style={S.uploadTitle}><UploadIcon /> Upload {currentTab?.label}</h3>
            {uploadSuccess && (
              <div style={{ padding: '0.7rem 1rem', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', marginBottom: '0.75rem', fontWeight: '600', fontSize: '13px', border: '1px solid #a7f3d0' }}>
                ✓ Uploaded successfully!
              </div>
            )}
            {uploadError && (
              <div style={{ padding: '0.7rem 1rem', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '13px', border: '1px solid #fecaca' }}>
                ⚠ {uploadError}
              </div>
            )}
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <input placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} style={S.input}
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} style={S.textarea}
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <div style={S.dropZone(dragOver)}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept={currentTab?.accept} style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#6366f1', fontSize: '1.2rem' }}>✓</span>
                    <span style={{ color: '#374151', fontWeight: '600', fontSize: '13px', wordBreak: 'break-all' }}>{file.name}</span>
                    <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 0.2rem' }}>
                      <XIcon />
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ margin: '0 0 0.25rem', color: '#6366f1', fontWeight: '600', fontSize: '14px' }}>
                      {isMobile ? 'Tap to browse' : `Drop ${currentTab?.label.toLowerCase()} here or click to browse`}
                    </p>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>{currentTab?.hint} · Max 100MB</p>
                  </>
                )}
              </div>
              <button onClick={handleUpload} disabled={uploading || !title.trim() || !file} style={S.uploadBtn(uploading || !title.trim() || !file)}>
                <UploadIcon /> {uploading ? 'Uploading...' : `Upload ${currentTab?.label}`}
              </button>
            </div>
          </div>
        )}

        {/* Teacher banner */}
        {isTeacher && (
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#fbbf24', fontSize: '13px', fontWeight: '500' }}>
            👩‍🏫 Click on any output to view and leave feedback
          </div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '4rem' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>⏳</p>
            <p>Loading {currentTab?.label.toLowerCase()}...</p>
          </div>
        ) : contents.length === 0 ? (
          <div style={S.emptyBox}>
            <p style={{ fontSize: '3rem', margin: '0 0 0.75rem' }}>📭</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 0.3rem', fontWeight: '600' }}>No {currentTab?.label.toLowerCase()} uploaded yet</p>
            {isStudent && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>Be the first to upload above!</p>}
          </div>
        ) : (
          <div style={S.grid}>
  {contents.map(content => {
    const uploaderName = content.uploader?.name || 'Unknown'
    const uploaderRole = content.uploader?.role || ''
    const academicYear = content.year?.academic_year || ''
    const yearLevel = content.year?.year_level || ''

    const isEditingThis = editingContentId === content.id

    return (
      <div
        key={content.id}
        style={S.card}
        onClick={() => {
          if (!isEditingThis) setSelectedContent(content)
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-5px)'
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
        }}
      >

        {/* MEDIA */}
        <div style={{
          aspectRatio: '16/9',
          background: '#1e1b4b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {content.type === 'image' && (
            <img
              src={content.file_url}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt={content.title}
            />
          )}

          {content.type === 'video' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🎬</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Video</span>
            </div>
          )}

          {content.type === 'audio' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🎵</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Audio</span>
            </div>
          )}

          {content.type === 'file' && (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>📄</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Document</span>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div style={{ padding: isMobile ? '0.65rem' : '0.9rem' }}>

          {/* 🔥 EDIT MODE */}
          {isEditingThis ? (
  <>
    {/* TITLE INPUT */}
    <input
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      style={S.input}
      placeholder="Edit title..."
    />

    {/* DESCRIPTION INPUT */}
    <textarea
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      style={S.textarea}
      placeholder="Edit description..."
    />

    {/* ACTION BUTTONS */}
    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>

      {/* SAVE */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleUpdateContent()
        }}
        style={{
          padding: '0.35rem 0.7rem',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          cursor: 'pointer'
        }}
      >
        💾 Save
      </button>

      {/* CANCEL */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setEditingContentId(null)
setEditTitle('')
setEditDescription('')
        }}
        style={{
          padding: '0.35rem 0.7rem',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.15)',
          background: 'white',
          color: '#374151',
          fontSize: '11px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Cancel
      </button>

    </div>
  </>
) : (
  <>
    {/* TITLE */}
    <h3 style={{
      margin: '0 0 0.3rem',
      color: '#1e1b4b',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '700',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}>
      {content.title}
    </h3>

    {/* DESCRIPTION */}
    {!isMobile && content.description && (
      <p style={{
        margin: '0 0 0.4rem',
        color: '#6b7280',
        fontSize: '12px',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {content.description}
      </p>
    )}

    {/* META */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{
        color: '#6366f1',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        by {uploaderName}
      </span>

      {!isMobile && (academicYear || yearLevel) && (
        <span style={{ color: '#6b7280', fontSize: '11px' }}>
          {academicYear ? `${academicYear} · ` : ''}{yearLevel}
        </span>
      )}

      <span style={{ color: '#9ca3af', fontSize: '11px' }}>
        {new Date(content.created_at).toLocaleDateString()}
      </span>
    </div>

    {/* ACTION BUTTONS */}
    {currentUser?.id === content.user_id && (
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginTop: '0.5rem'
      }}>

        {/* EDIT */}
        <button
          onClick={(e) => {
  e.stopPropagation()

  setEditingContentId(content.id)
  setEditTitle(content.title || '')
  setEditDescription(content.description || '')
}}
          style={{
            padding: '0.35rem 0.7rem',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(99,102,241,0.15)',
            color: '#4f46e5',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          ✏️ Edit
        </button>

        {/* DELETE */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteContent(content)
          }}
          style={{
            padding: '0.35rem 0.7rem',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(239,68,68,0.15)',
            color: '#ef4444',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🗑 Delete
        </button>

      </div>
    )}

    {/* HINT */}
    {!isMobile && (
      <div style={{
        marginTop: '0.5rem',
        padding: '0.3rem 0.5rem',
        background: '#f5f3ff',
        borderRadius: '6px',
        fontSize: '10px',
        color: '#6366f1',
        fontWeight: '600'
      }}>
        💬 Click to view
      </div>
    )}
  </>
)}

        </div>
      </div>
    )
  })}
</div>
        )}
      </div>

      <footer style={S.footer}>© 2026 BCAEd Digital Repository · Colegio de la Ciudad de Tayabas</footer>
    </div>
  )
}