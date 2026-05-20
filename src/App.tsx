/**
 * App.tsx — Entry point de la aplicación
 * Monta el BrowserRouter y delega todas las rutas a AppRouter.
 *
 * Para modificar rutas, ir a: src/router/AppRouter.tsx
 */

import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/router/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
