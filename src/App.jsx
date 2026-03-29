import { useState } from 'react'
import './App.css'
import PricingCalculator from './components/PricingCalculator'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PricingCalculator/>
    </>
  )
}

export default App
