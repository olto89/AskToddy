'use client'

import dynamic from 'next/dynamic'

// Import with SSR disabled
const SimpleTestClient = dynamic(() => import('@/components/SimpleTestClient'), {
  ssr: false,
  loading: () => <div style={{padding: '20px'}}>Loading interactive test...</div>
})

export default function SimpleClientPage() {
  return <SimpleTestClient />
}