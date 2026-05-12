import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, operation: 'add' });
  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    unit: 'kg',
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    unitPrice: 0,
    supplier: ''
  });

  useEffect(() => {
    fetchItems();
    fetchLowStockAlerts();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory');
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const response = await api.get('/inventory/alerts/low-stock');
      if (response.data.length > 0) {
        toast.warning(`${response.data.length} items are low on stock!`);
      }
    } catch (error) {
      console.error('Failed to fetch alerts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', formData);
      toast.success('Inventory item created');
      setShowForm(false);
      fetchItems();
    } catch (error) {
      toast.error('Failed to create item');
    }
  };

  const updateStock = async (id, quantity, operation) => {
    try {
      if (quantity <= 0) {
        toast.error('Quantity must be greater than 0');
        return;
      }
      await api.put(`/inventory/${id}/stock`, { quantity, operation });
      toast.success(`Stock ${operation === 'add' ? 'increased' : 'decreased'} by ${quantity}`);
      fetchItems();
      setEditingStock(null);
      setStockAdjustment({ quantity: 0, operation: 'add' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleQuickAdjust = (id, quantity, operation) => {
    updateStock(id, quantity, operation);
  };

  const handleCustomAdjust = (id) => {
    if (stockAdjustment.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    updateStock(id, stockAdjustment.quantity, stockAdjustment.operation);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Inventory Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Add Inventory Item</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="vegetables">Vegetables</option>
                <option value="meat">Meat</option>
                <option value="dairy">Dairy</option>
                <option value="beverages">Beverages</option>
                <option value="spices">Spices</option>
                <option value="grains">Grains</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="pieces">Pieces</option>
                <option value="packets">Packets</option>
              </select>
            </div>
            <div className="form-group">
              <label>Current Stock</label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Min Stock Level</label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Max Stock Level</label>
              <input
                type="number"
                value={formData.maxStockLevel}
                onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Min Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.currentStock} {item.unit}</td>
                <td>{item.minStockLevel} {item.unit}</td>
                <td>
                  {item.isOutOfStock ? (
                    <span className="badge badge-danger">Out of Stock</span>
                  ) : item.isLowStock ? (
                    <span className="badge badge-warning">Low Stock</span>
                  ) : (
                    <span className="badge badge-success">In Stock</span>
                  )}
                </td>
                <td>
                  {editingStock === item._id ? (
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="number"
                        min="1"
                        value={stockAdjustment.quantity}
                        onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: parseInt(e.target.value) || 0 })}
                        placeholder="Qty"
                        style={{
                          width: '60px',
                          padding: '4px 8px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                      <select
                        value={stockAdjustment.operation}
                        onChange={(e) => setStockAdjustment({ ...stockAdjustment, operation: e.target.value })}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="add">Add</option>
                        <option value="subtract">Subtract</option>
                      </select>
                      <button
                        onClick={() => handleCustomAdjust(item._id)}
                        className="btn btn-primary"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingStock(null);
                          setStockAdjustment({ quantity: 0, operation: 'add' });
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleQuickAdjust(item._id, 10, 'add')}
                        className="btn btn-success"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        title="Add 10 units"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(item._id, 5, 'subtract')}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        title="Subtract 5 units"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => setEditingStock(item._id)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        title="Custom adjustment"
                      >
                        ±
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventory;

