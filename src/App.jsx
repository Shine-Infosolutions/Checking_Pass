import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)

  const fetchData = useCallback(async (searchValue = '') => {
    setSearching(!!searchValue)
    try {
      const url = 'https://checking-passes.vercel.app/get/passes'
      const response = await fetch(url)
      const result = await response.json()
      
      console.log('API Response:', result)
      if (result.length > 0) {
        console.log('First item keys:', Object.keys(result[0]))
      }
      
      if (searchValue) {
        console.log('Searching for:', searchValue)
        if (result.length > 0) {
          console.log('Sample item:', result[0])
          console.log('All field values:', {
            name: result[0].name,
            passNo: result[0].passNo,
            passNumber: result[0].passNumber,
            entryNumber: result[0].entryNumber,
            email: result[0].email
          })
        }
        
        // Filter results with priority matching
        const filtered = result.filter(item => {
          const searchLower = searchValue.toLowerCase()
          
          // Priority 1: Exact matches in key fields
          if (item.name?.toLowerCase() === searchLower) return true
          if (item.category?.toLowerCase() === searchLower) return true
          
          // Priority 2: Exact number matches in arrays
          if (Array.isArray(item.passNumbers) && item.passNumbers.includes(parseInt(searchValue))) return true
          if (Array.isArray(item.passNumbersStatus)) {
            const hasExactPass = item.passNumbersStatus.some(pass => pass.number === parseInt(searchValue))
            if (hasExactPass) return true
          }
          
          // Priority 3: Partial matches in names only (avoid matching numbers in other fields)
          if (isNaN(searchValue)) {
            if (item.name?.toLowerCase().includes(searchLower)) return true
            if (item.category?.toLowerCase().includes(searchLower)) return true
          }
          
          return false
        })
        console.log('Filtered results:', filtered)
        setData(Array.isArray(filtered) ? filtered : [])
      } else {
        setData(Array.isArray(result) ? result : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setData([])
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData(searchTerm)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, fetchData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Entry Passes</h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search entry passes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              {searching ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border border-white/40 border-t-white rounded-full"
                />
              ) : (
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
              />
            </div>
          ) : (
            <div className="p-6">
              {data.length === 0 ? (
                <div className="text-center p-8 text-white/60">
                  {searchTerm ? 'No results found' : 'No entry passes found'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.map((item, index) => (
                    <motion.div
                      key={item.id || item.passNo || item.passNumber || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="space-y-3">
                        {item.name && (
                          <div>
                            <p className="text-white/50 text-xs uppercase tracking-wide">Name</p>
                            <p className="text-white font-semibold text-lg">{item.name}</p>
                          </div>
                        )}
                        
                        {item.category && (
                          <div>
                            <p className="text-white/50 text-xs uppercase tracking-wide">Category</p>
                            <p className="text-white/80">{item.category}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          {item.noOfPasses && (
                            <div>
                              <p className="text-white/50 text-xs uppercase tracking-wide">No Of Passes</p>
                              <p className="text-white/80">{item.noOfPasses}</p>
                            </div>
                          )}
                          {item.peopleCount && (
                            <div>
                              <p className="text-white/50 text-xs uppercase tracking-wide">People Count</p>
                              <p className="text-white/80">{item.peopleCount}</p>
                            </div>
                          )}
                        </div>
                        
                        {item.payment && (
                          <div>
                            <p className="text-white/50 text-xs uppercase tracking-wide">Payment</p>
                            <div className="flex gap-4 text-sm">
                              <span className="text-white/80">UPI: {item.payment.upi || 0}</span>
                              <span className="text-white/80">Cash: {item.payment.cash || 0}</span>
                              <span className="text-white/80">Card: {item.payment.card || 0}</span>
                            </div>
                          </div>
                        )}
                        
                        {item.passNumbers && (
                          <div>
                            <p className="text-white/50 text-xs uppercase tracking-wide">Pass Numbers</p>
                            <p className="text-white/80">{Array.isArray(item.passNumbers) ? item.passNumbers.join(', ') : item.passNumbers}</p>
                          </div>
                        )}
                        

                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App