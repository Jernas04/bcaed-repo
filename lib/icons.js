// Professional SVG Icons Library
export const IconMusic = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18v-7m6 7v-7M3 8h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
    <circle cx="9" cy="15" r="2" fill="currentColor"/>
    <circle cx="15" cy="15" r="2" fill="currentColor"/>
  </svg>
)

export const IconDance = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <path d="M9 10l-3-3"/>
    <path d="M15 10l3-3"/>
    <path d="M9 14l-1 6"/>
    <path d="M15 14l1 6"/>
    <path d="M12 11v3"/>
  </svg>
)

export const IconArts = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="1" fill="currentColor"/>
    <circle cx="16" cy="8" r="1" fill="currentColor"/>
    <circle cx="12" cy="15" r="1" fill="currentColor"/>
    <path d="M3 3h18v14H3z"/>
    <path d="M15 20l-3-3-3 3"/>
  </svg>
)

export const IconDrama = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="2"/>
    <path d="M8 14h8M8 14l-1 6h10l-1-6"/>
    <path d="M5 3h14v8H5z"/>
    <path d="M7 11l-2 8"/>
    <path d="M17 11l2 8"/>
  </svg>
)

export const IconImage = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Frame */}
    <rect x="3" y="3" width="18" height="18" rx="2" fill="white" stroke="currentColor" strokeWidth="2"/>
    {/* Gradient background */}
    <defs>
      <linearGradient id="imgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 0.3}} />
        <stop offset="100%" style={{stopColor: '#764ba2', stopOpacity: 0.3}} />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="16" height="16" fill="url(#imgGrad)" rx="1"/>
    {/* Photo elements */}
    <circle cx="9" cy="8.5" r="1.5" fill="#667eea"/>
    <path d="M21 15l-4-4L5 21" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

export const IconVideo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Film strip */}
    <rect x="2" y="6" width="20" height="12" rx="2" fill="white" stroke="currentColor" strokeWidth="2"/>
    {/* Play button */}
    <polygon points="10 10 16 13 10 16" fill="#667eea"/>
    {/* Film holes */}
    <rect x="3" y="5" width="2" height="1.5" fill="#ccc"/>
    <rect x="7" y="5" width="2" height="1.5" fill="#ccc"/>
    <rect x="11" y="5" width="2" height="1.5" fill="#ccc"/>
    <rect x="15" y="5" width="2" height="1.5" fill="#ccc"/>
    <rect x="19" y="5" width="2" height="1.5" fill="#ccc"/>
  </svg>
)

export const IconFile = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Document */}
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" fill="white" stroke="currentColor" strokeWidth="2"/>
    <polyline points="13 2 13 9 20 9" fill="none"/>
    {/* Lines */}
    <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="9" y1="20" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)

export const IconAudio = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Microphone circle */}
    <circle cx="12" cy="12" r="8" fill="white" stroke="currentColor" strokeWidth="2"/>
    {/* Waveforms */}
    <path d="M8 13a4 4 0 0 0 8 0" stroke="#667eea" strokeWidth="2"/>
    <path d="M6 13a6 6 0 0 0 12 0" stroke="#764ba2" strokeWidth="1.5" opacity="0.6"/>
    {/* Mic head */}
    <circle cx="12" cy="10" r="2" fill="#667eea"/>
  </svg>
)

export const IconArrowRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

export const IconArrowLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

export const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
