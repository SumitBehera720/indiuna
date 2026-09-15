import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, X, Upload, Image as ImageIcon, Star, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import DataTable from '@/components/ui/DataTable';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';
import { productService } from '@/services/product.service';
import type { Product, Category } from '@/types';
import toast from 'react-hot-toast';

const generateSKU = (productName: string, color: string, size: string) => {
  const prefix = productName
    ? productName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5)
    : 'PROD';
  const colorPart = color ? color.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3) : 'GEN';
  const sizePart = size ? size.toUpperCase() : 'ALL';
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${colorPart}-${sizePart}-${rand}`;
};

const colorPresets = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Crimson', code: '#DC143C' },
  { name: 'Navy', code: '#1E3A8A' },
  { name: 'Olive', code: '#808000' },
  { name: 'Beige', code: '#F5F5DC' },
  { name: 'Charcoal', code: '#36454F' },
  { name: 'Blue', code: '#3B82F6' },
  { name: 'Red', code: '#EF4444' },
  { name: 'Green', code: '#10B981' },
];

function formatCategoryOptions(categoriesList: Category[]) {
  const roots = categoriesList.filter(c => !c.parent_id);
  const result: { id: string; name: string }[] = [];
  roots.forEach(root => {
    result.push({ id: root.id, name: root.name });
    const children = categoriesList.filter(c => c.parent_id === root.id);
    children.forEach(child => {
      result.push({ id: child.id, name: `— ${child.name}` });
      const grandChildren = categoriesList.filter(c => c.parent_id === child.id);
      grandChildren.forEach(g => {
        result.push({ id: g.id, name: `\u00A0\u00A0— ${g.name}` });
      });
    });
  });
  // Add orphans
  categoriesList.forEach(c => {
    if (c.parent_id && !categoriesList.some(r => r.id === c.parent_id)) {
      if (!result.some(r => r.id === c.id)) {
        result.push({ id: c.id, name: c.name });
      }
    }
  });
  return result;
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paginationMeta, setPaginationMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [deleting, setDeleting] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingSizeGuide, setUploadingSizeGuide] = useState(false);

  const [hasOptions, setHasOptions] = useState(false);
  const [addForm, setAddForm] = useState<{
    name: string;
    description: string;
    status: 'published' | 'draft' | 'archived';
    gender: 'unisex' | 'men' | 'women';
    categoryId: string;
    fitType: string;
    images: { url: string; is_primary: boolean }[];
    size_guide_image: string;
    variants: {
      sku: string;
      price: number;
      compare_price: number | null;
      stock: number;
      is_active: boolean;
      attributes: {
        color?: string;
        color_code?: string;
        size?: string;
        image?: string;
      };
    }[];
  }>({
    name: '',
    description: '',
    status: 'published',
    gender: 'unisex',
    categoryId: '',
    fitType: '',
    images: [],
    size_guide_image: '',
    variants: [{
      sku: '',
      price: 999,
      compare_price: null,
      stock: 10,
      is_active: true,
      attributes: {}
    }],
  });

  useEffect(() => {
    api.get('/admin/categories', { params: { per_page: 100 } })
      .then(res => setCategories(res.data.data || []))
      .catch(console.error);
  }, []);

  const addColorGroup = (colorName: string, colorCode: string = '#333333') => {
    const cleanColor = colorName.trim();
    if (!cleanColor) return;
    const exists = addForm.variants.some(v => v.attributes?.color?.toLowerCase() === cleanColor.toLowerCase());
    if (exists) {
      toast.error(`Color "${cleanColor}" already exists`);
      return;
    }
    const basePrice = addForm.variants[0]?.price || 999;
    const baseCompare = addForm.variants[0]?.compare_price || null;
    const baseStock = addForm.variants[0]?.stock || 10;
    
    // Automatically generate standard size variants for the new color
    const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const newVariants = defaultSizes.map(size => ({
      sku: generateSKU(addForm.name, cleanColor, size),
      price: basePrice,
      compare_price: baseCompare,
      stock: baseStock,
      is_active: true,
      attributes: {
        color: cleanColor,
        color_code: colorCode,
        size: size,
        image: ''
      }
    }));

    setAddForm(prev => ({
      ...prev,
      variants: [...prev.variants.filter(v => v.attributes?.color || v.attributes?.size), ...newVariants]
    }));
    toast.success(`Added color group "${cleanColor}" with standard sizes`);
  };

  const removeColorGroup = (colorName: string) => {
    if (!window.confirm(`Are you sure you want to remove the color "${colorName}" and all its size variants?`)) return;
    setAddForm(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.attributes?.color !== colorName)
    }));
  };

  const updateColorCode = (color: string, code: string) => {
    setAddForm(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.attributes?.color === color) {
          return {
            ...v,
            attributes: { ...v.attributes, color_code: code }
          };
        }
        return v;
      })
    }));
  };

  const updateColorImage = (color: string, imageUrl: string) => {
    setAddForm(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.attributes?.color === color) {
          return {
            ...v,
            attributes: { ...v.attributes, image: imageUrl }
          };
        }
        return v;
      })
    }));
  };

  const addSizeToColor = (color: string, sizeName: string) => {
    const cleanSize = sizeName.trim();
    if (!cleanSize) return;
    const exists = addForm.variants.some(v => v.attributes?.color === color && v.attributes?.size?.toLowerCase() === cleanSize.toLowerCase());
    if (exists) {
      toast.error(`Size "${cleanSize}" already exists for ${color}`);
      return;
    }
    const colorVars = addForm.variants.filter(v => v.attributes?.color === color);
    const baseVar = colorVars[0] || {};
    const basePrice = baseVar.price || 999;
    const baseCompare = baseVar.compare_price || null;
    const baseStock = 10;
    const baseColorCode = baseVar.attributes?.color_code || '#333333';
    const baseImage = baseVar.attributes?.image || '';
    const newVar = {
      sku: generateSKU(addForm.name, color, cleanSize),
      price: basePrice,
      compare_price: baseCompare,
      stock: baseStock,
      is_active: true,
      attributes: { color, color_code: baseColorCode, size: cleanSize, image: baseImage }
    };
    setAddForm(prev => ({
      ...prev,
      variants: [...prev.variants, newVar]
    }));
  };

  const removeSizeFromColor = (color: string, size: string) => {
    setAddForm(prev => ({
      ...prev,
      variants: prev.variants.filter(v => !(v.attributes?.color === color && v.attributes?.size === size))
    }));
  };

  const toggleSizeInColor = (color: string, size: string) => {
    const exists = addForm.variants.some(v => v.attributes?.color === color && v.attributes?.size === size);
    if (exists) {
      setAddForm(prev => ({
        ...prev,
        variants: prev.variants.filter(v => !(v.attributes?.color === color && v.attributes?.size === size))
      }));
    } else {
      addSizeToColor(color, size);
    }
  };

  const applyBatchToColor = (color: string, price: number | null, stock: number | null) => {
    setAddForm(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.attributes?.color === color) {
          const updated = { ...v };
          if (price !== null) updated.price = price;
          if (stock !== null) updated.stock = stock;
          return updated;
        }
        return v;
      })
    }));
  };

  const updateVariantField = (color: string, size: string, field: string, value: any) => {
    setAddForm(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.attributes?.color === color && v.attributes?.size === size) {
          return { ...v, [field]: value };
        }
        return v;
      })
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return toast.error('Product name is required');
    if (!addForm.categoryId) return toast.error('Category is required');

    let submittedVariants = [];
    if (hasOptions) {
      const activeVars = addForm.variants.filter(v => v.is_active && v.attributes?.size);
      if (activeVars.length === 0) {
        return toast.error('At least one active variant is required.');
      }
      for (const v of activeVars) {
        if (!v.sku.trim()) return toast.error('Each variant must have a SKU.');
        if (Number(v.price) <= 0) return toast.error(`Price for variant ${v.sku} must be greater than 0.`);
        if (Number(v.stock) < 0) return toast.error(`Stock for variant ${v.sku} cannot be negative.`);
        if (!v.attributes?.color?.trim()) return toast.error(`Color attribute is required for variant ${v.sku}.`);
        if (!v.attributes?.size?.trim()) return toast.error(`Size attribute is required for variant ${v.sku}.`);
      }
      submittedVariants = activeVars.map(v => ({
        sku: v.sku.trim(),
        price: Number(v.price),
        compare_price: v.compare_price ? Number(v.compare_price) : null,
        stock: Number(v.stock),
        is_active: true,
        attributes: {
          color: v.attributes.color!.trim(),
          color_code: v.attributes.color_code || '#333333',
          size: v.attributes.size!.trim(),
          image: v.attributes.image || ''
        }
      }));
    } else {
      const baseVar = addForm.variants[0];
      if (!baseVar) return toast.error('No variant data found');
      if (!baseVar.sku?.trim()) {
        baseVar.sku = addForm.name.split(' ')[0].toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
      }
      if (Number(baseVar.price) <= 0) return toast.error('Price must be greater than 0');
      if (Number(baseVar.stock) < 0) return toast.error('Stock cannot be negative');

      submittedVariants = [
        {
          sku: baseVar.sku.trim(),
          price: Number(baseVar.price),
          compare_price: baseVar.compare_price ? Number(baseVar.compare_price) : null,
          stock: Number(baseVar.stock),
          is_active: true,
          attributes: {}
        }
      ];
    }

    try {
      const slug = addForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
      const formattedImages = addForm.images.map((img, idx) => ({
        url: img.url,
        is_primary: img.is_primary || (idx === 0),
        sort_order: idx,
        alt_text: addForm.name,
      }));

      const payload = {
        name: addForm.name,
        slug: slug,
        description: addForm.description,
        status: addForm.status,
        gender: addForm.gender,
        is_featured: true,
        size_guide_image: addForm.size_guide_image || null,
        categories: [addForm.categoryId].filter(Boolean),
        tags: [addForm.fitType].filter(Boolean),
        variants: submittedVariants,
        images: formattedImages
      };

      await productService.create(payload as any);
      toast.success('Product created successfully');
      setShowAddModal(false);
      setAddForm({
        name: '',
        description: '',
        status: 'published',
        gender: 'unisex',
        categoryId: '',
        fitType: '',
        images: [],
        size_guide_image: '',
        variants: [{
          sku: '',
          price: 999,
          compare_price: null,
          stock: 10,
          is_active: true,
          attributes: {}
        }],
      });
      setHasOptions(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create product');
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (addForm.images.length >= 5) {
      return toast.error('Maximum 5 images allowed per product');
    }

    const availableSlots = 5 - addForm.images.length;
    const selectedFiles = Array.from(files).slice(0, availableSlots);

    setUploadingImage(true);
    const toastId = toast.loading(`Uploading ${selectedFiles.length} file(s)...`);

    try {
      const uploaded: { url: string; is_primary: boolean }[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/admin/media/upload', formData);
        const url = data.url || data.data?.url;
        if (url) {
          uploaded.push({
            url,
            is_primary: addForm.images.length === 0 && i === 0,
          });
        }
      }

      setAddForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploaded]
      }));
      toast.success('Images uploaded directly from device!', { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload images', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSizeGuideUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingSizeGuide(true);
    const toastId = toast.loading('Uploading size guide image...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/admin/media/upload', formData);
      const url = data.url || data.data?.url;
      if (url) {
        setAddForm(prev => ({ ...prev, size_guide_image: url }));
        toast.success('Size guide image uploaded!', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload size guide', { id: toastId });
    } finally {
      setUploadingSizeGuide(false);
    }
  };

  const removeImage = (index: number) => {
    setAddForm(prev => {
      const next = prev.images.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some(img => img.is_primary)) {
        next[0].is_primary = true;
      }
      return { ...prev, images: next };
    });
  };

  const setPrimaryImage = (index: number) => {
    setAddForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    }));
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await productService.getAll(params);
      setProducts(res.data);
      setPaginationMeta(res.meta);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(id);
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Image',
      width: '72px',
      render: (product: Product) => (
        <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 overflow-hidden relative">
          {product.images?.[0] ? (
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-400 text-xs">N/A</div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (product: Product) => (
        <div>
          <span className="font-medium text-surface-900 dark:text-white block">{product.name}</span>
          {product.stock <= 0 && (
            <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">
              Out of Stock
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      width: '120px',
      render: (product: Product) => (
        <span className="font-medium">{formatCurrency(product.price)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      width: '100px',
      render: (product: Product) => (
        <span className={cn('font-medium', product.stock <= 0 ? 'text-red-500 font-bold' : product.stock <= 5 ? 'text-amber-500' : 'text-surface-700 dark:text-surface-300')}>
          {product.stock <= 0 ? '0 (OUT)' : product.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (product: Product) => (
        <span className={cn('badge', getStatusColor(product.status))}>{product.status}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product: Product) => (
        <span className="text-surface-500">{product.categories?.[0]?.name || '—'}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      width: '130px',
      render: (product: Product) => (
        <span className="text-surface-500">{formatDate(product.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (product: Product) => (
        <button
          onClick={(e) => handleDelete(e, product.id)}
          disabled={deleting === product.id}
          className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  const statuses = ['', 'draft', 'published', 'archived'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Products</h1>
          <p className="text-sm text-surface-500 mt-1">{paginationMeta.total} total products</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
                statusFilter === s
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              )}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchable
        onSearch={setSearch}
        onRowClick={(product) => navigate(`/products/${product.id}`)}
        pagination={{
          page: paginationMeta.current_page,
          lastPage: paginationMeta.last_page,
          total: paginationMeta.total,
          onPageChange: setPage,
        }}
      />

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-2xl w-full max-w-xl border border-surface-200 dark:border-surface-800 p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-surface-400 hover:text-surface-500 dark:hover:text-surface-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Demon Mask Embroidered Tee"
                  value={addForm.name}
                  onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2.5 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the product details..."
                  value={addForm.description}
                  onChange={e => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2.5 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    required
                    value={addForm.categoryId}
                    onChange={e => setAddForm(prev => ({ ...prev, categoryId: e.target.value, filterCategoryId: '' }))}
                    className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2.5 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="">Select Category</option>
                    {formatCategoryOptions(categories).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Product Fit / Type</label>
                  <select
                    value={addForm.fitType}
                    onChange={e => setAddForm(prev => ({ ...prev, fitType: e.target.value }))}
                    className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2.5 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="">None / Default</option>
                    <option value="Oversized T-Shirts">Oversized T-Shirt</option>
                    <option value="Regular Fit">Regular Fit</option>
                    <option value="Hoodies">Hoodie</option>
                    <option value="Sweatshirts">Sweatshirt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    value={addForm.gender}
                    onChange={e => setAddForm(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2.5 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={addForm.status}
                    onChange={e => setAddForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2.5 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Product Variants Toggle */}
              <div className="p-4 bg-surface-50 dark:bg-surface-850 rounded-2xl border border-surface-200 dark:border-surface-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-surface-900 dark:text-white block">Multiple Options</span>
                    <span className="text-xs text-surface-500">This product has options like size or color</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (hasOptions) {
                        if (!window.confirm('Toggling this off will discard color/size options and reset to a single simple product variant. Proceed?')) return;
                        setHasOptions(false);
                        setAddForm(prev => {
                          const base = prev.variants[0] || {
                            sku: prev.name.split(' ')[0].toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
                            price: 999,
                            compare_price: null,
                            stock: 10,
                            is_active: true,
                          };
                          return {
                            ...prev,
                            variants: [{
                              ...base,
                              is_active: true,
                              attributes: {}
                            }]
                          };
                        });
                      } else {
                        setHasOptions(true);
                        setAddForm(prev => {
                          return {
                            ...prev,
                            variants: []
                          };
                        });
                      }
                    }}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      hasOptions ? "bg-primary-500" : "bg-surface-200 dark:bg-surface-700"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        hasOptions ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Base Price (INR)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={addForm.variants[0]?.price || ''}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setAddForm(prev => ({
                          ...prev,
                          variants: prev.variants.map(v => ({ ...v, price: val }))
                        }));
                      }}
                      className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Compare Price</label>
                    <input
                      type="number"
                      min={0}
                      value={addForm.variants[0]?.compare_price || ''}
                      onChange={e => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setAddForm(prev => ({
                          ...prev,
                          variants: prev.variants.map(v => ({ ...v, compare_price: val }))
                        }));
                      }}
                      className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  {!hasOptions && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Stock</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={addForm.variants[0]?.stock ?? 0}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setAddForm(prev => {
                              const updated = [...prev.variants];
                              if (updated[0]) updated[0].stock = val;
                              return { ...prev, variants: updated };
                            });
                          }}
                          className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">SKU</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. TEE-BLK-S"
                          value={addForm.variants[0]?.sku || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setAddForm(prev => {
                              const updated = [...prev.variants];
                              if (updated[0]) updated[0].sku = val;
                              return { ...prev, variants: updated };
                            });
                          }}
                          className="w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                {hasOptions && (
                  <div className="space-y-4 pt-2">
                    {/* Add Color Form with Picker & Presets */}
                    <div className="flex flex-col gap-3 p-3 bg-surface-55 dark:bg-surface-955 rounded-xl border border-surface-200 dark:border-surface-800">
                      <span className="text-xs font-bold text-surface-500 uppercase tracking-wider block">Add Color Option</span>
                      <p className="text-xs text-surface-400">Click a preset to fill the name field, then click <strong>Add Color</strong> to confirm.</p>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {colorPresets.map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              // Pre-fill the input fields instead of auto-adding
                              const input = document.getElementById('newColorInput') as HTMLInputElement;
                              const picker = document.getElementById('newColorPicker') as HTMLInputElement;
                              if (input) input.value = preset.name;
                              if (picker) picker.value = preset.code;
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-surface-100 dark:bg-surface-900 dark:hover:bg-surface-850 border border-surface-200 dark:border-surface-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-surface-700 dark:text-surface-300 cursor-pointer"
                          >
                            <span className="w-2.5 h-2.5 rounded-full border border-surface-300" style={{ backgroundColor: preset.code }} />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 rounded-xl px-3 py-1 flex-1">
                          <input
                            type="color"
                            id="newColorPicker"
                            defaultValue="#3B82F6"
                            className="w-6 h-6 border-0 p-0 cursor-pointer bg-transparent rounded"
                          />
                          <input
                            type="text"
                            id="newColorInput"
                            placeholder="Type color name (e.g. Lavender)"
                            className="flex-1 bg-transparent border-none py-1.5 px-0 text-sm text-surface-900 dark:text-white focus:outline-none focus:ring-0"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.currentTarget.value;
                                const picker = document.getElementById('newColorPicker') as HTMLInputElement;
                                if (val.trim()) {
                                  addColorGroup(val, picker.value);
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('newColorInput') as HTMLInputElement;
                            const picker = document.getElementById('newColorPicker') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              addColorGroup(input.value, picker.value);
                              input.value = '';
                            } else {
                              toast.error('Please enter a color name first');
                            }
                          }}
                          className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
                        >
                          + Add Color
                        </button>
                      </div>
                    </div>

                    <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-1">
                      {Array.from(new Set(addForm.variants.map(v => v.attributes?.color || 'Default'))).map(color => {
                        const colorVars = addForm.variants.filter(v => (v.attributes?.color || 'Default') === color);
                        return (
                          <div key={color} className="p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-surface-100 dark:border-surface-800">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-surface-900 dark:text-white">Color: {color}</span>
                                <input
                                  type="color"
                                  value={colorVars[0]?.attributes?.color_code || '#333333'}
                                  onChange={e => updateColorCode(color, e.target.value)}
                                  className="w-5 h-5 border-0 p-0 cursor-pointer bg-transparent rounded-full"
                                  title="Change Hex Color Code"
                                />
                                <input
                                  type="text"
                                  value={colorVars[0]?.attributes?.color_code || '#333333'}
                                  onChange={e => updateColorCode(color, e.target.value)}
                                  className="w-20 px-1 py-0.5 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 rounded text-[10px] text-surface-600 dark:text-surface-400 font-mono focus:outline-none"
                                  title="Change Hex Color Code"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeColorGroup(color)}
                                className="text-xs text-red-550 hover:text-red-750 font-semibold"
                              >
                                Remove Color Group
                              </button>
                            </div>

                            {/* Color Specific Image Selection */}
                            <div className="p-3 bg-surface-50 dark:bg-surface-955 rounded-xl border border-surface-200 dark:border-surface-800 space-y-2">
                              <span className="text-xs font-bold text-surface-500 block">Color Image (Storefront Swatch Image)</span>
                              
                              {colorVars[0]?.attributes?.image ? (
                                <div className="flex items-center gap-3">
                                  <img
                                    src={colorVars[0].attributes.image}
                                    alt={color}
                                    className="w-12 h-12 object-cover rounded-lg border border-surface-200 dark:border-surface-800"
                                  />
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => updateColorImage(color, '')}
                                      className="text-xs text-red-500 hover:text-red-650 font-semibold"
                                    >
                                      Remove Image
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                                    <Upload size={13} />
                                    <span>Upload Image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const toastId = toast.loading('Uploading color variant image...');
                                        try {
                                          const formData = new FormData();
                                          formData.append('file', file);
                                          const { data } = await api.post('/admin/media/upload', formData);
                                          const url = data.url || data.data?.url;
                                          if (url) {
                                            updateColorImage(color, url);
                                            toast.success('Uploaded color image!', { id: toastId });
                                          }
                                        } catch (err: any) {
                                          toast.error(err?.response?.data?.message || 'Upload failed', { id: toastId });
                                        }
                                      }}
                                    />
                                  </label>

                                  {addForm.images.length > 0 && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-surface-400 block font-medium">Or select from product images:</span>
                                      <div className="flex gap-1.5 overflow-x-auto py-1">
                                        {addForm.images.map((img, i) => (
                                          <button
                                            key={i}
                                            type="button"
                                            onClick={() => updateColorImage(color, img.url)}
                                            className="w-8 h-8 rounded border border-surface-200 hover:border-primary-500 overflow-hidden relative shrink-0"
                                          >
                                            <img src={img.url} className="w-full h-full object-cover" />
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 p-2 bg-surface-55 dark:bg-surface-950 rounded-lg text-xs">
                              <span className="font-semibold text-surface-500">Apply to all {color} sizes:</span>
                              <div className="flex items-center gap-2">
                                <span>Price:</span>
                                <input
                                  type="number"
                                  id={`batchPrice-${color}`}
                                  placeholder="Price"
                                  className="w-16 px-2 py-1 rounded border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Stock:</span>
                                <input
                                  type="number"
                                  id={`batchStock-${color}`}
                                  placeholder="Stock"
                                  className="w-16 px-2 py-1 rounded border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const pInput = document.getElementById(`batchPrice-${color}`) as HTMLInputElement;
                                  const sInput = document.getElementById(`batchStock-${color}`) as HTMLInputElement;
                                  const p = pInput.value ? Number(pInput.value) : null;
                                  const s = sInput.value ? Number(sInput.value) : null;
                                  if (p !== null || s !== null) {
                                    applyBatchToColor(color, p, s);
                                  }
                                }}
                                className="px-2.5 py-1 bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded font-semibold transition-colors"
                              >
                                Apply
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-3">
                                {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                                  const hasSize = colorVars.some(v => v.attributes?.size === size);
                                  return (
                                    <label key={size} className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-surface-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={hasSize}
                                        onChange={() => toggleSizeInColor(color, size)}
                                        className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                                      />
                                      <span>{size}</span>
                                    </label>
                                  );
                                })}
                              </div>

                              <div className="flex gap-2 max-w-xs pt-1">
                                <input
                                  type="text"
                                  id={`customSize-${color}`}
                                  placeholder="Custom Size (e.g. XXXL)"
                                  className="flex-1 px-2.5 py-1 rounded border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-xs text-surface-900 dark:text-white"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const val = e.currentTarget.value.trim();
                                      if (val) {
                                        addSizeToColor(color, val);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`customSize-${color}`) as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      addSizeToColor(color, input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                  className="px-2 py-1 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 rounded text-xs text-surface-750 dark:text-surface-355"
                                >
                                  + Add Size
                                </button>
                              </div>
                            </div>

                            <div className="overflow-x-auto pt-2">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-surface-100 dark:border-surface-800 text-surface-500 text-left">
                                    <th className="py-1 px-1 font-medium">Size</th>
                                    <th className="py-1 px-1 font-medium">SKU</th>
                                    <th className="py-1 px-1 font-medium">Price (₹)</th>
                                    <th className="py-1 px-1 font-medium">Compare (₹)</th>
                                    <th className="py-1 px-1 font-medium">Stock</th>
                                    <th className="py-1 px-1 font-medium text-center">Active</th>
                                    <th className="py-1 px-1 font-medium"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                                  {colorVars.filter(v => v.attributes?.size).map(v => (
                                    <tr key={`${color}-${v.attributes?.size}`} className="hover:bg-surface-50/50 dark:hover:bg-surface-955/50">
                                      <td className="py-1.5 px-1 font-bold text-surface-900 dark:text-white">
                                        {v.attributes?.size}
                                      </td>
                                      <td className="py-1.5 px-1">
                                        <input
                                          type="text"
                                          value={v.sku}
                                          required
                                          onChange={e => updateVariantField(color, v.attributes?.size || '', 'sku', e.target.value)}
                                          className="w-full px-2 py-1 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 rounded text-surface-900 dark:text-white"
                                        />
                                      </td>
                                      <td className="py-1.5 px-1 w-20">
                                        <input
                                          type="number"
                                          value={v.price}
                                          required
                                          min={0}
                                          onChange={e => updateVariantField(color, v.attributes?.size || '', 'price', Number(e.target.value))}
                                          className="w-full px-2 py-1 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 rounded text-surface-900 dark:text-white"
                                        />
                                      </td>
                                      <td className="py-1.5 px-1 w-20">
                                        <input
                                          type="number"
                                          value={v.compare_price || ''}
                                          min={0}
                                          onChange={e => updateVariantField(color, v.attributes?.size || '', 'compare_price', e.target.value ? Number(e.target.value) : null)}
                                          className="w-full px-2 py-1 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 rounded text-surface-900 dark:text-white"
                                        />
                                      </td>
                                      <td className="py-1.5 px-1 w-16">
                                        <input
                                          type="number"
                                          value={v.stock}
                                          required
                                          min={0}
                                          onChange={e => updateVariantField(color, v.attributes?.size || '', 'stock', Number(e.target.value))}
                                          className="w-full px-2 py-1 border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 rounded text-surface-900 dark:text-white"
                                        />
                                      </td>
                                      <td className="py-1.5 px-1 text-center w-12">
                                        <input
                                          type="checkbox"
                                          checked={v.is_active}
                                          onChange={e => updateVariantField(color, v.attributes?.size || '', 'is_active', e.target.checked)}
                                          className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                                        />
                                      </td>
                                      <td className="py-1.5 px-1 text-right">
                                        <button
                                          type="button"
                                          onClick={() => removeSizeFromColor(color, v.attributes?.size || '')}
                                          className="text-red-550 hover:text-red-700 font-semibold"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images (Direct File Upload from Device - Max 5) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Product Images (Max 5 Images)
                  </label>
                  <span className="text-xs text-surface-400">{addForm.images.length}/5 uploaded</span>
                </div>

                {addForm.images.length < 5 && (
                  <label className="border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 bg-surface-50/50 dark:bg-surface-950/50 transition-colors">
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-sm text-primary-500">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Uploading from device...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-surface-400 mb-2" />
                        <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                          Upload Directly From Device
                        </span>
                        <span className="text-xs text-surface-400 mt-1">Select files from your phone or computer</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </label>
                )}

                {addForm.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 pt-2">
                    {addForm.images.map((img, idx) => (
                      <div key={idx} className={cn("relative group rounded-xl overflow-hidden border-2 aspect-square", img.is_primary ? "border-primary-500" : "border-surface-200 dark:border-surface-800")}>
                        <img src={img.url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Set Primary"
                            onClick={() => setPrimaryImage(idx)}
                            className={cn("p-1.5 rounded-lg text-white", img.is_primary ? "bg-primary-500" : "bg-black/60 hover:bg-primary-500")}
                          >
                            <Star size={12} fill={img.is_primary ? "white" : "none"} />
                          </button>
                          <button
                            type="button"
                            title="Remove Image"
                            onClick={() => removeImage(idx)}
                            className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {img.is_primary && (
                          <span className="absolute top-1 left-1 text-[9px] bg-primary-500 text-white font-bold px-1.5 py-0.5 rounded shadow">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Size Guide Image (Direct Device Upload) */}
              <div className="space-y-2 pt-2 border-t border-surface-100 dark:border-surface-800">
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Size Guide Image (Direct Device Upload)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border border-surface-200 dark:border-surface-800 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors">
                    {uploadingSizeGuide ? (
                      <Loader2 size={16} className="animate-spin text-primary-500" />
                    ) : (
                      <ImageIcon size={16} className="text-surface-400" />
                    )}
                    <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                      {addForm.size_guide_image ? 'Change Size Guide File' : 'Upload Size Guide File from Device'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingSizeGuide}
                      onChange={(e) => handleSizeGuideUpload(e.target.files?.[0] || null)}
                    />
                  </label>

                  {addForm.size_guide_image && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 shrink-0">
                      <img src={addForm.size_guide_image} alt="Size Guide" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAddForm(prev => ({ ...prev, size_guide_image: '' }))}
                        className="absolute top-0.5 right-0.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-600"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-850 text-surface-700 dark:text-surface-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || uploadingSizeGuide}
                  className="btn btn-primary px-5 py-2.5"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
