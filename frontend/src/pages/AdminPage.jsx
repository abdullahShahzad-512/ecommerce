import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import './AdminPage.css';

/* ── Empty product form state ── */
const EMPTY_PRODUCT = {
  name: '', brand: '', category_slug: '', price: '', original_price: '',
  stock: '', description: '', featured: false,
  colors: '', sizes: 'one-size', tags: '', images: '',
};

/* ── Reusable form field ── */
function Field({ label, error, children }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {children}
      {error && <span className="admin-field__error">{error}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Product Form (Add / Edit)
═══════════════════════════════════════════ */
function ProductForm({ categories, editProduct, onSaved, onCancel, token, onCategoryAdded }) {
  const isEdit = !!editProduct;
  const [form, setForm] = useState(() => {
    if (!isEdit)
       return EMPTY_PRODUCT;
    return {
      name: editProduct.name,
      brand: editProduct.brand,
      category_slug: editProduct.category,
      price: editProduct.price,
      original_price: editProduct.original_price,
      stock: editProduct.stock,
      description: editProduct.description,
      featured: editProduct.featured,
      colors: (editProduct.colors || []).join(', '),
      sizes: (editProduct.sizes || []).join(', '),
      tags: (editProduct.tags || []).join(', '),
      images: (editProduct.images || []).join('\n'),
    };
  });
  const [imageInputMode, setImageInputMode] = useState(isEdit ? 'link' : 'upload');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [catApiErr, setCatApiErr] = useState('');

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.brand.trim()) e.brand = 'Required';
    if (!form.category_slug) e.category_slug = 'Select a category';
    if (!form.price || +form.price <= 0) e.price = 'Enter a valid price';
    if (!form.stock && form.stock !== 0) e.stock = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiErr('');
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category_slug: form.category_slug,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : parseFloat(form.price),
        stock: parseInt(form.stock),
        description: form.description.trim(),
        featured: form.featured,
        colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      };

      if (isEdit) {
        await api.adminUpdateProduct(editProduct.id, payload, token);
      } else {
        await api.adminCreateProduct(payload, token);
      }
      onSaved();
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      setCatApiErr('Category name is required');
      return;
    }
    setAddingCat(true);
    setCatApiErr('');
    try {
      const payload = {
        name: newCatName.trim(),
        slug: newCatSlug.trim() || undefined,
        image: newCatImage.trim() || undefined,
      };
      const res = await api.adminCreateCategory(payload, token);
      const cat = res.category;
      if (cat) {
        onCategoryAdded?.(cat);
        set('category_slug', cat.id);
        setShowNewCategory(false);
        setNewCatName('');
        setNewCatSlug('');
        setNewCatImage('');
      }
    } catch (err) {
      setCatApiErr(err.message);
    } finally {
      setAddingCat(false);
    }
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleImageFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    try {
      const urls = await Promise.all(files.map(fileToDataUrl));
      set('images', urls.join('\n'));
    } catch (err) {
      setApiErr('Could not read one of the images. Try again or use the link/path option.');
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form__header">
        <h3>{isEdit ? `Edit: ${editProduct.name}` : 'Add New Product'}</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>

      {apiErr && <div className="admin-api-error">{apiErr}</div>}

      <div className="product-form__grid">
        {/* Col 1 */}
        <div className="product-form__col">
          <Field label="Product Name *" error={errors.name}>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Ceramic Table Lamp" className={errors.name ? 'invalid' : ''} />
          </Field>

          <Field label="Brand *" error={errors.brand}>
            <input value={form.brand} onChange={e => set('brand', e.target.value)}
              placeholder="e.g. LuxGlow" className={errors.brand ? 'invalid' : ''} />
          </Field>

          <Field label="Category *" error={errors.category_slug}>
            <div className="category-select-row">
              <select
                value={form.category_slug}
                onChange={e => set('category_slug', e.target.value)}
                className={errors.category_slug ? 'invalid' : ''}
              >
                <option value="">— Select category —</option>
                {categories.map(c => (
                  <option key={c.id || c.slug} value={c.id || c.slug}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowNewCategory(s => !s)}
              >
                {showNewCategory ? 'Close' : 'Add new'}
              </button>
            </div>
            {showNewCategory && (
              <div className="new-category-box">
                <div className="new-category-grid">
                  <input
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Category name"
                  />
                  <input
                    value={newCatSlug}
                    onChange={e => setNewCatSlug(e.target.value)}
                    placeholder="Slug (optional)"
                  />
                  <input
                    value={newCatImage}
                    onChange={e => setNewCatImage(e.target.value)}
                    placeholder="Image URL (optional)"
                  />
                </div>
                {catApiErr && <div className="admin-field__error">{catApiErr}</div>}
                <div className="new-category-actions">
                  <button
                    type="button"
                    className={`btn btn-primary btn-sm${addingCat ? ' loading' : ''}`}
                    onClick={handleCreateCategory}
                    disabled={addingCat}
                  >
                    {addingCat ? 'Creating…' : 'Create category'}
                  </button>
                </div>
              </div>
            )}
          </Field>

          <div className="product-form__row">
            <Field label="Price ($) *" error={errors.price}>
              <input type="number" step="0.01" min="0"
                value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="0.00" className={errors.price ? 'invalid' : ''} />
            </Field>
            <Field label="Original Price ($)">
              <input type="number" step="0.01" min="0"
                value={form.original_price} onChange={e => set('original_price', e.target.value)}
                placeholder="Leave blank = no discount" />
            </Field>
          </div>

          <Field label="Stock *" error={errors.stock}>
            <input type="number" min="0"
              value={form.stock} onChange={e => set('stock', e.target.value)}
              placeholder="0" className={errors.stock ? 'invalid' : ''} />
          </Field>

          <Field label="Description *" error={errors.description}>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4} placeholder="Product description…"
              className={errors.description ? 'invalid' : ''} />
          </Field>
        </div>

        {/* Col 2 */}
        <div className="product-form__col">
          <Field label="Colors (comma-separated)">
            <input value={form.colors} onChange={e => set('colors', e.target.value)}
              placeholder="e.g. black, white, sand" />
          </Field>

          <Field label="Sizes (comma-separated)">
            <input value={form.sizes} onChange={e => set('sizes', e.target.value)}
              placeholder="e.g. S, M, L, XL  or  one-size" />
          </Field>

          <Field label="Tags (comma-separated)">
            <input value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="e.g. new, bestseller, trending" />
          </Field>

          <div className="image-mode">
            <div className="image-mode__header">
              <span>Product Images</span>
              <div className="image-mode__switch">
                <button
                  type="button"
                  className={`image-mode__btn${imageInputMode === 'upload' ? ' active' : ''}`}
                  onClick={() => setImageInputMode('upload')}
                >
                  Upload
                </button>
                <button
                  type="button"
                  className={`image-mode__btn${imageInputMode === 'link' ? ' active' : ''}`}
                  onClick={() => setImageInputMode('link')}
                >
                  Link / Path
                </button>
              </div>
            </div>
            <p className="image-mode__hint">Default is upload; switch to link/path if you already host the image.</p>

            {imageInputMode === 'upload' ? (
              <div className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleImageFiles(e.target.files)}
                />
                <p className="upload-box__note">Selected files are stored as data URLs in this product entry.</p>
              </div>
            ) : (
              <Field label="Image URLs or paths (one per line)">
                <textarea value={form.images} onChange={e => set('images', e.target.value)}
                  rows={4} placeholder="/src/assets/images/products/lamp.png&#10;https://..." />
              </Field>
            )}
          </div>

          {/* Image preview */}
          {form.images.split('\n').filter(Boolean).slice(0, 1).map(url => (
            <div key={url} className="product-form__preview">
              <img src={url.trim()} alt="Preview"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          ))}

          <label className="product-form__toggle">
            <input type="checkbox" checked={form.featured}
              onChange={e => set('featured', e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
            <span>Featured product</span>
          </label>
        </div>
      </div>

      <div className="product-form__footer">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className={`btn btn-primary${saving ? ' loading' : ''}`} disabled={saving}>
          {saving ? <span className="btn-spinner" /> : null}
          {saving ? 'Saving…' : (isEdit ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════
   Products Table
═══════════════════════════════════════════ */
function ProductsTable({ products, onEdit, onDelete }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Featured</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>
                <div className="admin-table__product">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.name}
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <div>
                    <span className="admin-table__name">{p.name}</span>
                    <span className="admin-table__brand">{p.brand}</span>
                  </div>
                </div>
              </td>
              <td><span className="admin-table__cat">{p.category}</span></td>
              <td>
                <span className="admin-table__price">${parseFloat(p.price).toFixed(2)}</span>
                {p.discount > 0 && <span className="admin-table__disc">-{p.discount}%</span>}
              </td>
              <td>
                <span className={`admin-table__stock${p.stock < 5 ? ' low' : ''}`}>
                  {p.stock}
                </span>
              </td>
              <td>
                {p.featured
                  ? <span className="admin-badge admin-badge--yes">Yes</span>
                  : <span className="admin-badge">No</span>
                }
              </td>
              <td>
                <div className="admin-table__actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => onEdit(p)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button className="btn btn-sm admin-delete-btn" onClick={() => onDelete(p)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Users Table
═══════════════════════════════════════════ */
function UsersTable({ users, onRoleChange, onDelete, currentUserId }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th><th>Username</th><th>Role</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <div className="admin-table__user">
                  <div className="admin-avatar">{u.full_name[0].toUpperCase()}</div>
                  <div>
                    <span className="admin-table__name">{u.full_name}</span>
                    <span className="admin-table__brand">{u.email}</span>
                  </div>
                </div>
              </td>
              <td><span className="admin-table__cat">@{u.username}</span></td>
              <td>
                <span className={`admin-badge${u.role === 'admin' ? ' admin-badge--admin' : ''}`}>
                  {u.role}
                </span>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                {u.id === currentUserId && (
                  <div className="admin-note">(You)</div>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={u.id === currentUserId && u.role === 'admin'}
                  title={u.id === currentUserId && u.role === 'admin' ? 'You cannot demote your own account' : ''}
                  onClick={() => onRoleChange(u, u.role === 'admin' ? 'customer' : 'admin')}
                >
                  {u.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                </button>
                <button
                  className="btn btn-sm admin-delete-btn"
                  disabled={u.id === currentUserId}
                  title={u.id === currentUserId ? 'You cannot delete your own account' : ''}
                  onClick={() => onDelete(u)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6" />
                  </svg>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Delete Confirm Modal
═══════════════════════════════════════════ */
function DeleteModal({ product, onConfirm, onCancel, deleting }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-icon">🗑️</div>
        <h3>Delete Product?</h3>
        <p>Are you sure you want to delete <strong>{product.name}</strong>? This cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn btn-accent" onClick={onConfirm} disabled={deleting}>
            {deleting ? <span className="btn-spinner" /> : null}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteUserModal({ user, onConfirm, onCancel, deleting }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="modal-icon">🗑️</div>
        <h3>Delete User?</h3>
        <p>Remove <strong>{user.full_name}</strong> ({user.email}) from the system?</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="btn btn-accent" onClick={onConfirm} disabled={deleting}>
            {deleting ? <span className="btn-spinner" /> : null}
            {deleting ? 'Deleting…' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Admin Page
═══════════════════════════════════════════ */
export default function AdminPage() {
  const { user, token } = useAuth();

  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [userDeleteTarget, setUserDeleteTarget] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  /* Pagination */
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  /* Search */
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  /* Load products */
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({ search: debouncedSearch || undefined, page, limit: LIMIT });
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch { setProducts([]); }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [page, debouncedSearch]);

  /* Load categories */
  useEffect(() => {
    api.getCategories().then(d => setCategories(d.categories)).catch(() => { });
  }, []);

  /* Load users */
  useEffect(() => {
    if (tab === 'users') {
      api.adminGetUsers(token).then(d => setUsers(d.users)).catch(() => { });
    }
  }, [tab, token]);

  const handleSaved = () => {
    setShowForm(false);
    setEditProduct(null);
    setPage(1);
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.adminDeleteProduct(deleteTarget.id, token);
      setDeleteTarget(null);
      loadProducts();
    } catch (e) { alert(e.message); }
    setDeleting(false);
  };

  const handleRoleChange = async (u, newRole) => {
    try {
      await api.adminUpdateUserRole(u.id, newRole, token);
      setUsers(us => us.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    } catch (e) { alert(e.message); }
  };

  const handleDeleteUser = async () => {
    if (!userDeleteTarget) return;
    setDeletingUser(true);
    try {
      await api.adminDeleteUser(userDeleteTarget.id, token);
      setUsers(us => us.filter(u => u.id !== userDeleteTarget.id));
      setUserDeleteTarget(null);
    } catch (e) { alert(e.message); }
    setDeletingUser(false);
  };

  /* Stats */
  const lowStock = products.filter(p => p.stock < 5).length;
  const featured = products.filter(p => p.featured).length;

  return (
    <div className="admin-page page-enter">
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
      {userDeleteTarget && (
        <DeleteUserModal
          user={userDeleteTarget}
          onConfirm={handleDeleteUser}
          onCancel={() => setUserDeleteTarget(null)}
          deleting={deletingUser}
        />
      )}

      {/* ── Header ── */}
      <div className="admin-header">
        <div className="container admin-header__inner">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-sub">Welcome back, <strong>{user?.full_name}</strong></p>
          </div>
          <div className="admin-header__actions">
            {tab === 'products' && !showForm && (
              <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Product
              </button>
            )}
            <Link to="/" className="btn btn-outline btn-sm">← Back to Store</Link>
          </div>
        </div>
      </div>

      <div className="container admin-body">

        {/* ── Stats bar ── */}
        <div className="admin-stats">
          {[
            { label: 'Total Products', value: total, icon: '📦' },
            { label: 'Featured', value: featured, icon: '⭐' },
            { label: 'Low Stock (<5)', value: lowStock, icon: '⚠️', warn: lowStock > 0 },
            { label: 'Categories', value: categories.length, icon: '🏷️' },
          ].map(s => (
            <div key={s.label} className={`admin-stat${s.warn ? ' admin-stat--warn' : ''}`}>
              <span className="admin-stat__icon">{s.icon}</span>
              <div>
                <span className="admin-stat__value">{s.value}</span>
                <span className="admin-stat__label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Product form (add / edit) ── */}
        {showForm && (
          <ProductForm
            categories={categories}
            editProduct={editProduct}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditProduct(null); }}
            token={token}
            onCategoryAdded={cat => setCategories(cats => [...cats, cat])}
          />
        )}

        {/* ── Tabs ── */}
        <div className="admin-tabs">
          {['products', 'users'].map(t => (
            <button key={t}
              className={`admin-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}>
              {t === 'products' ? '📦 Products' : '👥 Users'}
            </button>
          ))}
        </div>

        {/* ── Products tab ── */}
        {tab === 'products' && (
          <div className="admin-panel">
            <div className="admin-panel__toolbar">
              <div className="admin-search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  placeholder="Search products…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <span className="admin-panel__count">{total} products</span>
            </div>

            {loading ? (
              <div className="admin-loading">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📭</div>
                <h3>No products found</h3>
                <p>{search ? `No results for "${search}"` : 'Add your first product using the button above.'}</p>
              </div>
            ) : (
              <ProductsTable
                products={products}
                onEdit={handleEdit}
                onDelete={p => setDeleteTarget(p)}
              />
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="admin-pagination">
                <button className="btn btn-outline btn-sm"
                  disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <div className="admin-pagination__pages">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p}
                      className={`admin-pagination__btn${p === page ? ' active' : ''}`}
                      onClick={() => setPage(p)}>{p}
                    </button>
                  ))}
                </div>
                <button className="btn btn-outline btn-sm"
                  disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}

        {/* ── Users tab ── */}
        {tab === 'users' && (
          <div className="admin-panel">
            <div className="admin-panel__toolbar">
              <h3 className="admin-panel__title">Registered Users</h3>
              <span className="admin-panel__count">{users.length} users</span>
            </div>
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">👥</div>
                <h3>No users yet</h3>
              </div>
            ) : (
              <UsersTable
                users={users}
                onRoleChange={handleRoleChange}
                onDelete={setUserDeleteTarget}
                currentUserId={user?.id}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
