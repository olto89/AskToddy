'use client'

import React, { useEffect } from 'react'

export default function DebugPage() {
  useEffect(() => {
    console.log('Client component mounted!')
    console.log('React version:', React.version)
  }, [])

  const handleClick = () => {
    console.log('Button clicked!')
    alert('Button works!')
  }

  return (
    <div style={{padding: '20px'}}>
      <h1>Debug Page</h1>
      <p>Check browser console for debug info</p>
      <button onClick={handleClick} style={{padding: '10px', background: 'red', color: 'white', border: 'none'}}>
        Debug Click Test
      </button>
      <script dangerouslySetInnerHTML={{
        __html: `
          console.log('Inline script executed');
          console.log('Document ready state:', document.readyState);
        `
      }} />
    </div>
  )
}