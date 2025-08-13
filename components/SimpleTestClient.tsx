'use client'

import { useState, useEffect } from 'react'

export default function SimpleTestClient() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('SimpleTestClient mounted successfully')
  }, [])

  const handleButtonClick = () => {
    console.log('Button clicked, current count:', count)
    setCount(count + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed:', e.target.value)
    setInputValue(e.target.value)
  }

  if (!mounted) {
    return <div style={{padding: '20px'}}>Loading...</div>
  }

  return (
    <div style={{padding: '20px'}}>
      <h1>Simple Test - Client Only (Mounted: {mounted ? 'Yes' : 'No'})</h1>
      
      <div style={{marginBottom: '20px'}}>
        <p>Count: {count}</p>
        <button 
          onClick={handleButtonClick}
          style={{padding: '10px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
        >
          Increment Count
        </button>
      </div>
      
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          style={{padding: '5px', margin: '10px 0', width: '200px'}}
          placeholder="Type something..."
        />
        <p>You typed: {inputValue}</p>
      </div>
      
      <div style={{marginTop: '20px', fontSize: '12px', color: 'gray'}}>
        Debug: Component is mounted and interactive handlers are attached
      </div>
    </div>
  )
}