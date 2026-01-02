import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [editingId, setEditingId] = useState(null); // Track if we are editing
  const [errors, setErrors] = useState({});

  const API_URL = 'http://localhost:5000/api/contacts';

  // 1. Fetch Contacts
  const fetchContacts = async () => {
    try {
      const res = await axios.get(API_URL);
      setContacts(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  // 2. Validation
  const validate = (name, value) => {
    let msg = '';
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = "Invalid email";
    if (name === 'phone' && value && value.length < 10) msg = "Min 10 digits required";
    setErrors(prev => ({ ...prev, [name]: msg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validate(name, value);
  };

  // 3. Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || errors.email || errors.phone) return;

    try {
      if (editingId) {
        // Update Logic
        await axios.put(`${API_URL}/${editingId}`, formData); // *Make sure to add PUT in server.js
        setContacts(contacts.map(c => c._id === editingId ? { ...formData, _id: editingId } : c));
        setEditingId(null);
      } else {
        // Create Logic
        const res = await axios.post(API_URL, formData);
        setContacts([res.data, ...contacts]);
      }
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      alert("Operation failed");
    }
  };

  // 4. Edit Prep
  const handleEdit = (contact) => {
    setFormData(contact);
    setEditingId(contact._id);
  };

  // 5. Delete
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setContacts(contacts.filter(c => c._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Filter for Search
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <>
      <h1>✨ Contact Hub</h1>
      <div className="container">
        {/* Left: Form */}
        <div className="card">
          <h2>{editingId ? '✏️ Edit Contact' : '🚀 Add New Contact'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>
            <div className="form-group">
              <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <textarea name="message" placeholder="Notes / Message (Optional)" value={formData.message} onChange={handleChange} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={errors.email || errors.phone}>
              {editingId ? 'Update Contact' : 'Save Contact'}
            </button>
            {editingId && <button type="button" className="btn" style={{marginTop:'10px', background:'#eee'}} onClick={()=>{setEditingId(null); setFormData({ name: '', email: '', phone: '', message: '' })}}>Cancel Edit</button>}
          </form>
        </div>

        {/* Right: List */}
        <div className="card">
          <h2>👥 Your Network <span style={{fontSize:'0.8em', color:'#6b7280', marginLeft:'auto'}}>({filteredContacts.length})</span></h2>
          
          <div className="search-bar">
            <input placeholder="🔍 Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? <p>Loading...</p> : (
            <ul className="contact-list">
              {filteredContacts.length === 0 ? <p style={{textAlign:'center', color:'#999'}}>No contacts found.</p> : 
                filteredContacts.map(c => (
                  <li key={c._id} className="contact-item">
                    <div className="contact-info">
                      <strong>{c.name}</strong>
                      <span>📧 {c.email}</span>
                      <span>📱 {c.phone}</span>
                      {c.message && <span className="message-preview">📝 {c.message}</span>}
                    </div>
                    <div className="actions">
                      <button className="btn btn-icon btn-edit" onClick={() => handleEdit(c)}>Edit</button>
                      <button className="btn btn-icon btn-delete" onClick={() => handleDelete(c._id)}>✕</button>
                    </div>
                  </li>
                ))
              }
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default App;