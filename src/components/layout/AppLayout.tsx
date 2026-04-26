import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-[22px] sm:px-14 pt-3 pb-10 sm:pt-6 sm:pb-10">
        <Outlet />
      </main>
    </div>
  )
}
