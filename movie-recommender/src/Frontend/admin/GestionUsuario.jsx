import { useState } from 'react';
import './GestionUsuario.css';

function GestionUsuario() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Cliente', status: 'Activo', createdAt: '2024-01-15' },
    { id: 2, name: 'María García', email: 'maria@example.com', role: 'Cliente', status: 'Activo', createdAt: '2024-02-20' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Admin', status: 'Activo', createdAt: '2024-01-10' },
    { id: 4, name: 'Ana Martínez', email: 'ana@example.com', role: 'Cliente', status: 'Inactivo', createdAt: '2024-03-05' },
    { id: 5, name: 'Luis Rodríguez', email: 'luis@example.com', role: 'Cliente', status: 'Activo', createdAt: '2024-02-28' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Cliente',
    status: 'Activo',
  });

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', email: '', role: 'Cliente', status: 'Activo' });
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newUser = {
        id: users.length + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    } else {
      setUsers(users.map(user => 
        user.id === currentUser.id ? { ...user, ...formData } : user
      ));
    }
    handleCloseModal();
  };

  const handleDelete = (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="user-management">
      <div className="header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          + Nuevo Usuario
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Todos los roles</option>
            <option value="Cliente">Cliente</option>
            <option value="Admin">Admin</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">No se encontraron usuarios</td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.createdAt}</td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn btn-small btn-edit"
                        onClick={() => handleOpenEditModal(user)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-small btn-delete"
                        onClick={() => handleDelete(user.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Rol</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUsuario;