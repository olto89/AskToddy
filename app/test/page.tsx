'use client'

import { useState } from 'react'

export default function TestPage() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Interaction Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <p>Count: {count}</p>
          <button 
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Increment Count
          </button>
        </div>
        
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="px-4 py-2 border rounded"
            placeholder="Type something..."
          />
          <p>You typed: {inputValue}</p>
        </div>
      </div>
    </div>
  )
}