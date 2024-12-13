import './Navbar.css';
import navlogo from '../../assets/logo.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="navbar">
      {/* Logo Section */}
      <Link to="/admin" className="nav-logo-link">
        <img src={navlogo} alt="Logo" className="nav-logo" />
        <span className="nav-title">PIXEL-TRY</span>
      </Link>

     
      {/* Navigation Links */}
      <div className="nav-links">
        <Link to="/addproduct" className="nav-link">
          Add Product
        </Link>
        <Link to="/listproduct" className="nav-link">
          Product List
        </Link>
        <Link to="/updateproduct" className="nav-link">
          Update Product
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
