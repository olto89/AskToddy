'use client'

import { useState } from 'react'

interface ToolData {
  name: string
  category: string
  daily_rate: number
  weekly_rate?: number
  deposit?: number
  supplier: string
  requires_license: boolean
}

interface LaborData {
  trade: string
  job_type: string
  rate_structure: string
  base_rate: number
  unit: string
  min_charge?: number
  source: string
}

interface MaterialData {
  name: string
  category: string
  budget_price?: number
  mid_range_price?: number
  premium_price?: number
  unit: string
  waste_factor: number
  supplier: string
}

export default function DataEntryPage() {
  const [activeTab, setActiveTab] = useState<'tools' | 'labor' | 'materials'>('tools')
  const [toolData, setToolData] = useState<ToolData>({
    name: '',
    category: 'Power Tools',
    daily_rate: 0,
    weekly_rate: 0,
    deposit: 0,
    supplier: 'HSS Hire',
    requires_license: false
  })
  
  const [laborData, setLaborData] = useState<LaborData>({
    trade: 'Electrician',
    job_type: '',
    rate_structure: 'per_sqm',
    base_rate: 0,
    unit: 'sqm',
    source: 'Checkatrade'
  })

  const [materialData, setMaterialData] = useState<MaterialData>({
    name: '',
    category: 'Tiles',
    budget_price: 0,
    mid_range_price: 0,
    premium_price: 0,
    unit: 'per_sqm',
    waste_factor: 0.1,
    supplier: 'B&Q'
  })

  const [savedItems, setSavedItems] = useState<any[]>([])

  const handleSaveTool = () => {
    setSavedItems([...savedItems, { type: 'tool', ...toolData, id: Date.now() }])
    setToolData({
      name: '',
      category: 'Power Tools',
      daily_rate: 0,
      weekly_rate: 0,
      deposit: 0,
      supplier: 'HSS Hire',
      requires_license: false
    })
    alert('Tool data saved!')
  }

  const handleSaveLabor = () => {
    setSavedItems([...savedItems, { type: 'labor', ...laborData, id: Date.now() }])
    setLaborData({
      trade: 'Electrician',
      job_type: '',
      rate_structure: 'per_sqm',
      base_rate: 0,
      unit: 'sqm',
      source: 'Checkatrade'
    })
    alert('Labor data saved!')
  }

  const handleSaveMaterial = () => {
    setSavedItems([...savedItems, { type: 'material', ...materialData, id: Date.now() }])
    setMaterialData({
      name: '',
      category: 'Tiles',
      budget_price: 0,
      mid_range_price: 0,
      premium_price: 0,
      unit: 'per_sqm',
      waste_factor: 0.1,
      supplier: 'B&Q'
    })
    alert('Material data saved!')
  }

  const exportData = () => {
    const dataBlob = new Blob([JSON.stringify(savedItems, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `askToddy-market-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-secondary-200 to-primary-100">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-black text-navy-900 mb-2">AskToddy Data Collection</h1>
          <p className="text-xl text-grey-700 mb-8">Collect real UK market pricing data to improve AI accuracy</p>
          
          {/* Data Collection Progress */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-navy-800 mb-2">Collection Progress</h2>
            <div className="flex gap-4 text-sm">
              <span className="text-primary-600">Tools: {savedItems.filter(i => i.type === 'tool').length}</span>
              <span className="text-secondary-600">Labor: {savedItems.filter(i => i.type === 'labor').length}</span>
              <span className="text-navy-600">Materials: {savedItems.filter(i => i.type === 'material').length}</span>
              <span className="text-grey-600">Total: {savedItems.length} items</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {(['tools', 'labor', 'materials'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-grey-500 hover:text-grey-700'
                  }`}
                >
                  {tab} Data Entry
                </button>
              ))}
            </nav>
          </div>

          {/* Tool Data Entry */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-navy-800">Tool Hire Data Entry</h3>
              <div className="bg-primary-50 rounded-lg p-4 text-sm text-navy-700">
                <strong>Source:</strong> Visit HSS Hire, Speedy Hire, or Brandon Hire websites. 
                Record daily rates, weekly rates, and deposit requirements for common tools.
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Tool Name</label>
                  <input
                    type="text"
                    value={toolData.name}
                    onChange={(e) => setToolData({...toolData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Cordless Drill 18V"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Category</label>
                  <select
                    value={toolData.category}
                    onChange={(e) => setToolData({...toolData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Power Tools">Power Tools</option>
                    <option value="Access Equipment">Access Equipment</option>
                    <option value="Plant & Machinery">Plant & Machinery</option>
                    <option value="Cleaning Equipment">Cleaning Equipment</option>
                    <option value="Landscaping Tools">Landscaping Tools</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Daily Rate (£)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={toolData.daily_rate}
                    onChange={(e) => setToolData({...toolData, daily_rate: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="12.50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Weekly Rate (£)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={toolData.weekly_rate}
                    onChange={(e) => setToolData({...toolData, weekly_rate: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="45.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Deposit (£)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={toolData.deposit}
                    onChange={(e) => setToolData({...toolData, deposit: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="50.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Supplier</label>
                  <select
                    value={toolData.supplier}
                    onChange={(e) => setToolData({...toolData, supplier: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="HSS Hire">HSS Hire</option>
                    <option value="Speedy Hire">Speedy Hire</option>
                    <option value="Brandon Hire">Brandon Hire</option>
                    <option value="National Tool Hire">National Tool Hire</option>
                    <option value="Travis Perkins">Travis Perkins</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleSaveTool}
                disabled={!toolData.name || !toolData.daily_rate}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Tool Data
              </button>
            </div>
          )}

          {/* Labor Data Entry */}
          {activeTab === 'labor' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-navy-800">Labor Cost Data Entry</h3>
              <div className="bg-secondary-50 rounded-lg p-4 text-sm text-navy-700">
                <strong>Source:</strong> Visit Checkatrade cost guides or MyBuilder quotes. 
                Record specific job types with rates per square metre or per item.
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Trade</label>
                  <select
                    value={laborData.trade}
                    onChange={(e) => setLaborData({...laborData, trade: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Tiler">Tiler</option>
                    <option value="Painter & Decorator">Painter & Decorator</option>
                    <option value="General Builder">General Builder</option>
                    <option value="Kitchen Fitter">Kitchen Fitter</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Job Type</label>
                  <input
                    type="text"
                    value={laborData.job_type}
                    onChange={(e) => setLaborData({...laborData, job_type: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Small bathroom renovation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Rate Structure</label>
                  <select
                    value={laborData.rate_structure}
                    onChange={(e) => setLaborData({...laborData, rate_structure: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="per_sqm">Per Square Metre</option>
                    <option value="per_item">Per Item</option>
                    <option value="per_day">Per Day</option>
                    <option value="fixed_price">Fixed Price</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Base Rate (£)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={laborData.base_rate}
                    onChange={(e) => setLaborData({...laborData, base_rate: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="65.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Source</label>
                  <select
                    value={laborData.source}
                    onChange={(e) => setLaborData({...laborData, source: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Checkatrade">Checkatrade</option>
                    <option value="MyBuilder">MyBuilder</option>
                    <option value="Which? Trusted Traders">Which? Trusted Traders</option>
                    <option value="Direct Quote">Direct Quote</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleSaveLabor}
                disabled={!laborData.job_type || !laborData.base_rate}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Labor Data
              </button>
            </div>
          )}

          {/* Material Data Entry */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-navy-800">Material Cost Data Entry</h3>
              <div className="bg-navy-50 rounded-lg p-4 text-sm text-navy-700">
                <strong>Source:</strong> Visit B&Q, Wickes, or Screwfix websites. 
                Record prices across budget, mid-range, and premium quality tiers.
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Material Name</label>
                  <input
                    type="text"
                    value={materialData.name}
                    onChange={(e) => setMaterialData({...materialData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Ceramic wall tiles 200x250mm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Category</label>
                  <select
                    value={materialData.category}
                    onChange={(e) => setMaterialData({...materialData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Tiles">Tiles</option>
                    <option value="Paint">Paint</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Flooring">Flooring</option>
                    <option value="Building Materials">Building Materials</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Budget Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialData.budget_price}
                    onChange={(e) => setMaterialData({...materialData, budget_price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="15.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Mid-Range Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialData.mid_range_price}
                    onChange={(e) => setMaterialData({...materialData, mid_range_price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="35.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Premium Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={materialData.premium_price}
                    onChange={(e) => setMaterialData({...materialData, premium_price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="85.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-2">Supplier</label>
                  <select
                    value={materialData.supplier}
                    onChange={(e) => setMaterialData({...materialData, supplier: e.target.value})}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="B&Q">B&Q</option>
                    <option value="Wickes">Wickes</option>
                    <option value="Screwfix">Screwfix</option>
                    <option value="Travis Perkins">Travis Perkins</option>
                    <option value="Toolstation">Toolstation</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleSaveMaterial}
                disabled={!materialData.name || !materialData.mid_range_price}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Material Data
              </button>
            </div>
          )}

          {/* Export and Summary */}
          {savedItems.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-navy-800 mb-4">Collected Data Summary</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{savedItems.filter(i => i.type === 'tool').length}</div>
                  <div className="text-sm text-grey-600">Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-600">{savedItems.filter(i => i.type === 'labor').length}</div>
                  <div className="text-sm text-grey-600">Labor Types</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy-600">{savedItems.filter(i => i.type === 'material').length}</div>
                  <div className="text-sm text-grey-600">Materials</div>
                </div>
              </div>
              <button
                onClick={exportData}
                className="px-6 py-3 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
              >
                Export Data as JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}