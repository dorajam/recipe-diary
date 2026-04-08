import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/auth/AuthGuard'
import { AppLayout } from './components/layout/AppLayout'
import { RecipeList } from './components/recipes/RecipeList'
import { RecipeDetail } from './components/recipes/RecipeDetail'
import { RecipeForm } from './components/recipes/RecipeForm'

function App() {
  return (
    <AuthGuard>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipes/new" element={<RecipeForm />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/:id/edit" element={<RecipeForm />} />
        </Route>
      </Routes>
    </AuthGuard>
  )
}

export default App
