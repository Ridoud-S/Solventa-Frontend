import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <p className="text-muted-foreground">Esta página no existe.</p>
      <Link to="/dashboard"><Button>Ir al inicio</Button></Link>
    </div>
  )
}
