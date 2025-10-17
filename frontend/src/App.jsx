
import { Routes, Route } from 'react-router-dom';
import IngredientesPage from './pages/IngredientesPage';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout'; // 1. Importar el nuevo Layout
import ProductosPage from './pages/ProductosPage';
import CalculadoraPage from './pages/CalculadoraPage';

function App() {

  return (
    <Routes>
      {/* 2. Ruta padre que renderiza el Layout y contiene las rutas hijas */}
      <Route path="/" element={<Layout />}>
      
        <Route index element={<DashboardPage />} /> {/* 3. La ruta "index" es la página por defecto para "/" */}
        <Route path="ingredientes" element={<IngredientesPage />} />
        <Route path="productos" element={<ProductosPage/>} />
        <Route path='calculadora' element={<CalculadoraPage/>}/>
      </Route>
    </Routes>
  )
}

export default App
