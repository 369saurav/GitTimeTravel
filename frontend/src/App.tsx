import { ThemeProvider } from "./components/theme-provider"
import Home from "./Home"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="gittimetravel-theme">
      <div className="min-h-screen w-full bg-background antialiased flex flex-col">
        <div className="flex-1 flex">
          <Home />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
