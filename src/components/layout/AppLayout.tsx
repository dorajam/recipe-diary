import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-5 sm:px-10 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
