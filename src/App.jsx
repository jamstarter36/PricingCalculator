import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
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
