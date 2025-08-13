'use client'

import { useState, useEffect } from 'react'

export default function TestClientPage() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    console.log('Pure client component mounted')
  }, [])

  const handleButtonClick = () => {
    console.log('Button clicked! Count will be:', count + 1)
    setCount(count + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input changed to:', e.target.value)
    setInputValue(e.target.value)
  }

  if (!isClient) {
    return <div style={{padding: '20px'}}>Loading client...</div>
  }

  return (
    <div style={{padding: '20px', fontFamily: 'Arial'}}>
      <h1 style={{color: 'green'}}>Pure Client Component Test</h1>
      <p><strong>Client Mounted:</strong> {isClient ? 'YES' : 'NO'}</p>
      
      <div style={{border: '2px solid #007acc', padding: '15px', margin: '10px 0', borderRadius: '5px'}}>
        <h3>Button Test</h3>
        <p>Current count: <span style={{fontSize: '20px', fontWeight: 'bold', color: 'blue'}}>{count}</span></p>
        <button 
          onClick={handleButtonClick}
          style={{
            padding: '10px 20px', 
            backgroundColor: '#007acc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Click Me! ({count})
        </button>
      </div>
      
      <div style={{border: '2px solid #ff6b35', padding: '15px', margin: '10px 0', borderRadius: '5px'}}>
        <h3>Input Test</h3>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          style={{
            padding: '10px', 
            margin: '10px 0', 
            width: '300px',
            fontSize: '16px',
            border: '2px solid #ccc',
            borderRadius: '4px'
          }}
          placeholder="Type something here..."
        />
        <p>You typed: <span style={{fontWeight: 'bold', color: '#ff6b35'}}>{inputValue}</span></p>
      </div>
      
      <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
        <small>
          Debug: Component state - count: {count}, input: "{inputValue}", isClient: {isClient.toString()}
        </small>
      </div>
    </div>
  )
}