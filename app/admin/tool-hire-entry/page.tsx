'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Common tool categories and types
const TOOL_CATEGORIES = {
  'Excavators & Diggers': [
    '0.8 Tonne Micro Excavator',
    '1.5 Tonne Mini Excavator', 
    '3 Tonne Excavator',
    '5 Tonne Excavator',
    '8 Tonne Excavator'
  ],
  'Concrete & Mixers': [
    'Belle 110L Petrol Mixer',
    'Belle 150L Electric Mixer',
    'Diesel Concrete Mixer 200L',
    'Forced Action Mixer',
    'Pan Mixer'
  ],
  'Generators': [
    '2kVA Petrol Generator',
    '3kVA Diesel Generator',
    '6kVA Generator',
    '10kVA Generator',
    '20kVA Generator'
  ],
  'Drills & Breakers': [
    'Small Breaker (Kango)',
    'Medium Breaker',
    'Large Breaker (Road)',
    'Core Drill',
    'Diamond Drill'
  ],
  'Compressors': [
    'Electric Compressor 50L',
    'Petrol Compressor 100L',
    'Diesel Road Compressor',
    'Atlas Copco 7 Bar',
    'High Pressure Compressor'
  ],
  'Saws': [
    'Circular Saw',
    'Chop Saw',
    'Floor Saw',
    'Stihl Saw (Petrol)',
    'Wall Chaser'
  ],
  'Access Equipment': [
    'Scaffold Tower 4m',
    'Scaffold Tower 6m',
    'Scaffold Tower 8m',
    'Podium Steps',
    'Ladder (Extension)'
  ],
  'Pumps': [
    'Submersible Pump 25mm',
    'Submersible Pump 50mm',
    'Dirty Water Pump',
    'Clean Water Pump',
    'Puddle Pump'
  ],
  'Compactors': [
    'Wacker Plate (Small)',
    'Wacker Plate (Large)',
    'Trench Rammer',
    'Single Drum Roller',
    'Double Drum Roller'
  ],
  'Other Tools': [
    'Angle Grinder 115mm',
    'Angle Grinder 230mm', 
    'Floor Grinder',
    'Pressure Washer',
    'Steam Cleaner'
  ]
}

// Load suppliers from our analyzed data
const SUPPLIERS = [
  { name: 'Toddy Tool Hire', region: 'East England', website: 'toddytoolhire.co.uk' },
  { name: 'Hirebase', region: 'East England', website: 'hirebase.uk' },
  { name: 'Brandon Hire Station', region: 'East England', website: 'brandonhirestation.com' },
  { name: 'SHC', region: 'North West', website: 'shc.co.uk' },
  { name: 'WTA Plant Hire', region: 'Yorkshire', website: 'wtaphire.co.uk' },
  { name: 'GA Plant', region: 'South West', website: 'gaplant.co.uk' },
  { name: 'London Plant Hire', region: 'London', website: 'londonplanthire.co.uk' },
  { name: 'Andara Tools', region: 'South East', website: 'andaratools.com' },
  { name: 'Midlands Tool & Plant', region: 'Midlands', website: 'midlandstoolandplanthire.co.uk' },
  { name: 'Lancashire Plant', region: 'Midlands', website: 'lancashireplant.com' }
]

export default function ToolHireDataEntry() {
  const [selectedSupplier, setSelectedSupplier] = useState(SUPPLIERS[0])
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(TOOL_CATEGORIES)[0])
  const [entries, setEntries] = useState<any[]>([])
  const [currentEntry, setCurrentEntry] = useState({
    toolName: '',
    dailyRate: '',
    weeklyRate: '',
    weekendRate: '',
    notes: ''
  })

  // Load saved entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('toolHireEntries')
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('toolHireEntries', JSON.stringify(entries))
    }
  }, [entries])

  const handleAddEntry = () => {
    if (!currentEntry.toolName || (!currentEntry.dailyRate && !currentEntry.weeklyRate)) {
      alert('Please enter tool name and at least one price')
      return
    }

    const newEntry = {
      id: Date.now(),
      supplier: selectedSupplier.name,
      region: selectedSupplier.region,
      website: selectedSupplier.website,
      category: selectedCategory,
      ...currentEntry,
      timestamp: new Date().toISOString()
    }

    setEntries([...entries, newEntry])
    
    // Clear form but keep the same tool selected for quick variations
    setCurrentEntry({
      toolName: currentEntry.toolName,
      dailyRate: '',
      weeklyRate: '',
      weekendRate: '',
      notes: ''
    })
  }

  const handleQuickAdd = (toolName: string) => {
    setCurrentEntry({ ...currentEntry, toolName })
  }

  const exportToCSV = () => {
    const headers = ['supplier', 'region', 'website', 'category', 'tool_name', 'daily_rate', 'weekly_rate', 'weekend_rate', 'notes', 'timestamp']
    const csvContent = [
      headers.join(','),
      ...entries.map(e => [
        e.supplier,
        e.region,
        e.website,
        e.category,
        `"${e.toolName}"`,
        e.dailyRate || '',
        e.weeklyRate || '',
        e.weekendRate || '',
        `"${e.notes || ''}"`,
        e.timestamp
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tool-hire-prices-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tool-hire-prices-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const getSupplierEntryCount = (supplierName: string) => {
    return entries.filter(e => e.supplier === supplierName).length
  }

  const getCategoryEntryCount = (category: string) => {
    return entries.filter(e => e.category === category).length
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tool Hire Price Data Entry</h1>
        <p className="text-gray-600">Efficiently collect pricing data from supplier websites</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2">📝 Quick Tips:</h3>
          <ul className="text-sm space-y-1">
            <li>• Open supplier website in another tab: <a href={`https://${selectedSupplier.website}`} target="_blank" className="text-blue-600 underline">{selectedSupplier.website}</a></li>
            <li>• Click tool names for quick entry</li>
            <li>• Just enter daily rate if weekly not shown</li>
            <li>• Data auto-saves to browser</li>
          </ul>
        </div>
      </div>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entry">Data Entry</TabsTrigger>
          <TabsTrigger value="review">Review ({entries.length})</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <div className="grid gap-6">
            {/* Supplier Selection */}
            <div className="bg-white rounded-lg border p-4">
              <Label className="text-lg font-semibold mb-3 block">Select Supplier</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {SUPPLIERS.map(supplier => (
                  <Button
                    key={supplier.name}
                    variant={selectedSupplier.name === supplier.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSupplier(supplier)}
                    className="text-xs"
                  >
                    {supplier.name}
                    <span className="ml-1 text-xs opacity-70">({getSupplierEntryCount(supplier.name)})</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-lg border p-4">
              <Label className="text-lg font-semibold mb-3 block">Tool Category</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {Object.keys(TOOL_CATEGORIES).map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs"
                  >
                    {category}
                    <span className="ml-1 text-xs opacity-70">({getCategoryEntryCount(category)})</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Tool Selection */}
            <div className="bg-white rounded-lg border p-4">
              <Label className="text-lg font-semibold mb-3 block">Quick Select Tool</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {TOOL_CATEGORIES[selectedCategory].map(tool => (
                  <Button
                    key={tool}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(tool)}
                    className="text-xs text-left justify-start"
                  >
                    {tool}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Entry Form */}
            <div className="bg-white rounded-lg border p-4">
              <Label className="text-lg font-semibold mb-3 block">Enter Prices</Label>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="toolName">Tool Name/Model</Label>
                  <Input
                    id="toolName"
                    value={currentEntry.toolName}
                    onChange={(e) => setCurrentEntry({...currentEntry, toolName: e.target.value})}
                    placeholder="e.g., 1.5 Tonne Mini Excavator"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dailyRate">Daily Rate (£)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      value={currentEntry.dailyRate}
                      onChange={(e) => setCurrentEntry({...currentEntry, dailyRate: e.target.value})}
                      placeholder="85"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weeklyRate">Weekly Rate (£)</Label>
                    <Input
                      id="weeklyRate"
                      type="number"
                      value={currentEntry.weeklyRate}
                      onChange={(e) => setCurrentEntry({...currentEntry, weeklyRate: e.target.value})}
                      placeholder="255"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weekendRate">Weekend Rate (£)</Label>
                    <Input
                      id="weekendRate"
                      type="number"
                      value={currentEntry.weekendRate}
                      onChange={(e) => setCurrentEntry({...currentEntry, weekendRate: e.target.value})}
                      placeholder="170"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={currentEntry.notes}
                    onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
                    placeholder="e.g., Includes VAT, Delivery POA"
                  />
                </div>

                <Button onClick={handleAddEntry} size="lg" className="w-full">
                  Add Entry ({entries.length} total)
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Entered Prices ({entries.length} total)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Supplier</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Tool</th>
                    <th className="text-right p-2">Daily</th>
                    <th className="text-right p-2">Weekly</th>
                    <th className="text-right p-2">Weekend</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(-20).reverse().map(entry => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{entry.supplier}</td>
                      <td className="p-2">{entry.category}</td>
                      <td className="p-2">{entry.toolName}</td>
                      <td className="text-right p-2">{entry.dailyRate ? `£${entry.dailyRate}` : '-'}</td>
                      <td className="text-right p-2">{entry.weeklyRate ? `£${entry.weeklyRate}` : '-'}</td>
                      <td className="text-right p-2">{entry.weekendRate ? `£${entry.weekendRate}` : '-'}</td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEntries(entries.filter(e => e.id !== entry.id))}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {entries.length > 20 && (
                <p className="text-sm text-gray-500 mt-2">Showing last 20 entries of {entries.length} total</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Export Data</h2>
            
            <div className="grid gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Entries:</div>
                  <div className="font-semibold">{entries.length}</div>
                  <div>Suppliers:</div>
                  <div className="font-semibold">{new Set(entries.map(e => e.supplier)).size}</div>
                  <div>Categories:</div>
                  <div className="font-semibold">{new Set(entries.map(e => e.category)).size}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={exportToCSV} size="lg" variant="default">
                  📊 Export as CSV
                </Button>
                <Button onClick={exportToJSON} size="lg" variant="outline">
                  📄 Export as JSON
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                <p>CSV format is ready to import into your database.</p>
                <p>JSON format preserves all data for API integration.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}