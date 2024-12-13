import './Admin.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faEdit } from '@fortawesome/free-solid-svg-icons';

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the admin panel. Manage products efficiently.</p>
      </div>
      <div className="admin-grid">
        <div
          className="admin-card admin-card-add"
          onClick={() => navigate('/addproduct')}
        >
          <FontAwesomeIcon icon={faPlus} className="admin-icon" />
          <h2>Add Product</h2>
          <p>Add new products to your catalog.</p>
        </div>
        <div
          className="admin-card admin-card-list"
          onClick={() => navigate('/listproduct')}
        >
          <FontAwesomeIcon icon={faList} className="admin-icon" />
          <h2>Product List</h2>
          <p>View and manage the list of available products.</p>
        </div>
        <div
          className="admin-card admin-card-update"
          onClick={() => navigate('/updateproduct')}
        >
          <FontAwesomeIcon icon={faEdit} className="admin-icon" />
          <h2>Update Product</h2>
          <p>Edit or update existing product details.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
