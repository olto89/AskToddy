'use client'

export default function SimplePage() {
  const handleClick = () => {
    alert('Button clicked!')
  }

  return (
    <div style={{padding: '20px'}}>
      <h1>Simple Test</h1>
      <button onClick={handleClick} style={{padding: '10px', background: 'blue', color: 'white'}}>
        Click Me
      </button>
      <input type="text" placeholder="Type here..." style={{margin: '10px', padding: '5px'}} />
    </div>
  )
}