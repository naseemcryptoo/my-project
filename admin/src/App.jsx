import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Admin from './Pages/Admin/Admin';
import AddProduct from './Components/AddProduct/AddProduct';
import ListProduct from './Components/ListProduct/ListProduct';
import UpdateProduct from './Components/UpdateProduct/UpdateProduct';

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
      <Route path='/' element={<Admin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/listproduct" element={<ListProduct />} />
        <Route path="/updateproduct" element={<UpdateProduct />} />
      </Routes>
    </div>
  );
};

export default App;
