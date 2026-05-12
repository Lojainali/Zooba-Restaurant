import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main_course',
    price: '',
    isAvailable: true,
    isDailyOffer: false,
    discount: 0,
    ingredients: [],
    preparationTime: 15,
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      toast.error('Please select a valid image file (jpg, png, gif, webp)');
      return null;
    }

    // Validate file size (5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return null;
    }

    const formDataToUpload = new FormData();
    formDataToUpload.append('image', imageFile);

    try {
      setUploading(true);
      const response = await api.post('/upload/image', formDataToUpload);
      toast.success('Image uploaded successfully');
      return response.data.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      toast.error(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Upload image first if there's a new one
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          // Image upload failed, don't proceed
          return;
        }
        imageUrl = uploadedUrl;
      }

      const dataToSubmit = {
        ...formData,
        image: imageUrl
      };

      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, dataToSubmit);
        toast.success('Menu item updated');
      } else {
        await api.post('/menu', dataToSubmit);
        toast.success('Menu item created');
      }
      setShowForm(false);
      setEditingItem(null);
      setImageFile(null);
      setImagePreview(null);
      setFormData({
        name: '',
        description: '',
        category: 'main_course',
        price: '',
        isAvailable: true,
        isDailyOffer: false,
        discount: 0,
        ingredients: [],
        preparationTime: 15,
        image: ''
      });
      fetchMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    try {
      console.log('Editing item:', item);
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'main_course',
        price: item.price || '',
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        isDailyOffer: item.isDailyOffer || false,
        discount: item.discount || 0,
        ingredients: item.ingredients || [],
        preparationTime: item.preparationTime || 15,
        image: item.image || ''
      });
      setImageFile(null);
      setImagePreview(item.image ? `http://localhost:5000${item.image}` : null);
      setShowForm(true);
      
      // Scroll to form after a short delay to ensure it's rendered
      setTimeout(() => {
        const formElement = document.querySelector('.card form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error in handleEdit:', error);
      toast.error('Failed to load item for editing');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/menu/${id}`);
        toast.success('Menu item deleted');
        fetchMenuItems();
      } catch (error) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Menu Management</h2>
        <button 
          onClick={() => {
            if (showForm && editingItem) {
              setEditingItem(null);
              setFormData({
                name: '',
                description: '',
                category: 'main_course',
                price: '',
                isAvailable: true,
                isDailyOffer: false,
                discount: 0,
                ingredients: [],
                preparationTime: 15,
                image: ''
              });
              setImageFile(null);
              setImagePreview(null);
            }
            setShowForm(!showForm);
          }} 
          className="btn btn-primary"
          type="button"
        >
          {showForm ? 'Cancel' : '+ Add Menu Item'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>{editingItem ? 'Edit' : 'Add'} Menu Item</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="appetizer">Appetizer</option>
                  <option value="main_course">Main Course</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                  <option value="salad">Salad</option>
                  <option value="soup">Soup</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preparation Time (minutes)</label>
                <input
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  Available
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isDailyOffer}
                    onChange={(e) => setFormData({ ...formData, isDailyOffer: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  Daily Offer
                </label>
              </div>
              {formData.isDailyOffer && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>
              )}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {imagePreview && (
                  <div style={{ marginTop: '15px' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="btn btn-danger"
                      style={{ marginLeft: '10px', padding: '8px 15px', fontSize: '12px' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                {uploading && (
                  <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                    Uploading image...
                  </p>
                )}
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '15px' }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-filter-bar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th>Daily Offer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No menu items found
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.image ? (
                      <img
                        src={`http://localhost:5000${item.image}`}
                        alt={item.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '24px'
                      }}>
                        🖼️
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
                  <td>
                    <span className="badge badge-primary">
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#ff6b35' }}>${item.price}</td>
                  <td>
                    <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                      {item.isAvailable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    {item.isDailyOffer ? (
                      <span className="badge badge-warning">
                        Yes ({item.discount}% off)
                      </span>
                    ) : (
                      <span className="badge badge-secondary">No</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(item);
                      }} 
                      className="btn btn-primary" 
                      style={{ marginRight: '10px', padding: '8px 15px', fontSize: '12px', cursor: 'pointer' }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(item._id);
                      }} 
                      className="btn btn-danger"
                      style={{ padding: '8px 15px', fontSize: '12px', cursor: 'pointer' }}
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMenu;
