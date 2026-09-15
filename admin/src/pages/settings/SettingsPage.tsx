import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Store, MapPin, Link, Loader2, Save, CreditCard, Truck } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  trending_products?: string;
  new_arrivals?: string;
  cod_enabled?: string;
  razorpay_enabled?: string;
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  shiprocket_enabled?: string;
  shiprocket_email?: string;
  shiprocket_password?: string;
  shiprocket_webhook_token?: string;
  pickup_postcode?: string;
  shiprocket_pickup_location?: string;
  shiprocket_company_name?: string;
}

const defaultSettings: StoreSettings = {
  store_name: '',
  store_email: '',
  store_phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
  facebook_url: '',
  twitter_url: '',
  instagram_url: '',
  youtube_url: '',
  trending_products: '',
  new_arrivals: '',
  cod_enabled: 'false',
  razorpay_enabled: 'false',
  razorpay_key_id: '',
  razorpay_key_secret: '',
  shiprocket_enabled: 'false',
  shiprocket_email: '',
  shiprocket_password: '',
  shiprocket_webhook_token: '',
  pickup_postcode: '',
  shiprocket_pickup_location: '',
  shiprocket_company_name: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/admin/settings');
        setSettings({ ...defaultSettings, ...data.data });

        // Fetch products for curation selectors
        const productsRes = await api.get('/admin/products', { params: { limit: 100 } });
        setAllProducts(productsRes.data.data ?? []);
      } catch {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const update = (key: keyof StoreSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleProductToggle = (group: 'trending_products' | 'new_arrivals', productId: string) => {
    const currentVal = settings[group] || '';
    let ids = currentVal ? currentVal.split(',').map(id => id.trim()).filter(Boolean) : [];
    
    if (ids.includes(productId)) {
      ids = ids.filter(id => id !== productId);
    } else {
      ids.push(productId);
    }
    
    update(group, ids.join(','));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      // Never overwrite stored secrets with an empty value
      if (!payload.razorpay_key_secret) delete payload.razorpay_key_secret;
      if (!payload.shiprocket_password) delete payload.shiprocket_password;
      await api.put('/admin/settings', payload);
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Settings</h1>
          <p className="text-sm text-surface-400 mt-1">Store configuration</p>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-6 space-y-4">
            <div className="h-5 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                  <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Settings</h1>
          <p className="text-sm text-surface-400 mt-1">Store configuration</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Settings</h1>
          <p className="text-sm text-surface-400 mt-1">Store configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
            <Store size={20} />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">General</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Store Name</label>
            <input value={settings.store_name} onChange={(e) => update('store_name', e.target.value)} className="input-field" placeholder="INDIUNA" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Store Email</label>
            <input type="email" value={settings.store_email} onChange={(e) => update('store_email', e.target.value)} className="input-field" placeholder="store@indiuna.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Store Phone</label>
            <input type="tel" value={settings.store_phone} onChange={(e) => update('store_phone', e.target.value)} className="input-field" placeholder="+91 98765 43210" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
            <MapPin size={20} />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Address</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Address Line 1</label>
            <input value={settings.address_line1} onChange={(e) => update('address_line1', e.target.value)} className="input-field" placeholder="123 Main Street" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Address Line 2</label>
            <input value={settings.address_line2} onChange={(e) => update('address_line2', e.target.value)} className="input-field" placeholder="Apartment, suite, etc." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">City</label>
            <input value={settings.city} onChange={(e) => update('city', e.target.value)} className="input-field" placeholder="Mumbai" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">State</label>
            <input value={settings.state} onChange={(e) => update('state', e.target.value)} className="input-field" placeholder="Maharashtra" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Pincode</label>
            <input value={settings.pincode} onChange={(e) => update('pincode', e.target.value)} className="input-field" placeholder="400001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Country</label>
            <input value={settings.country} onChange={(e) => update('country', e.target.value)} className="input-field" placeholder="India" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
            <Link size={20} />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Social Links</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Facebook</label>
            <input value={settings.facebook_url} onChange={(e) => update('facebook_url', e.target.value)} className="input-field" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Twitter</label>
            <input value={settings.twitter_url} onChange={(e) => update('twitter_url', e.target.value)} className="input-field" placeholder="https://twitter.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Instagram</label>
            <input value={settings.instagram_url} onChange={(e) => update('instagram_url', e.target.value)} className="input-field" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">YouTube</label>
            <input value={settings.youtube_url} onChange={(e) => update('youtube_url', e.target.value)} className="input-field" placeholder="https://youtube.com/..." />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
            <CreditCard size={20} />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Payments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3 border border-surface-200 dark:border-surface-800 rounded-xl">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Razorpay (online payments)</span>
            <input
              type="checkbox"
              checked={settings.razorpay_enabled === 'true' || settings.razorpay_enabled === '1'}
              onChange={(e) => update('razorpay_enabled', e.target.checked ? 'true' : 'false')}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-surface-200 dark:border-surface-800 rounded-xl">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Cash on Delivery</span>
            <input
              type="checkbox"
              checked={settings.cod_enabled === 'true' || settings.cod_enabled === '1'}
              onChange={(e) => update('cod_enabled', e.target.checked ? 'true' : 'false')}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Razorpay Key ID</label>
            <input value={settings.razorpay_key_id || ''} onChange={(e) => update('razorpay_key_id', e.target.value)} className="input-field font-mono" placeholder="rzp_live_..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Razorpay Key Secret</label>
            <input type="password" value={settings.razorpay_key_secret || ''} onChange={(e) => update('razorpay_key_secret', e.target.value)} className="input-field font-mono" placeholder="Leave blank to keep current" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
            <Truck size={20} />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Shiprocket Shipping</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3 border border-surface-200 dark:border-surface-800 rounded-xl">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Enable Shiprocket</span>
            <input
              type="checkbox"
              checked={settings.shiprocket_enabled === 'true' || settings.shiprocket_enabled === '1'}
              onChange={(e) => update('shiprocket_enabled', e.target.checked ? 'true' : 'false')}
              className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Account Email</label>
            <input value={settings.shiprocket_email || ''} onChange={(e) => update('shiprocket_email', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Account Password</label>
            <input type="password" value={settings.shiprocket_password || ''} onChange={(e) => update('shiprocket_password', e.target.value)} className="input-field" placeholder="Leave blank to keep current" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Pickup Pincode</label>
            <input value={settings.pickup_postcode || ''} onChange={(e) => update('pickup_postcode', e.target.value)} className="input-field" placeholder="400001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Pickup Location</label>
            <input value={settings.shiprocket_pickup_location || ''} onChange={(e) => update('shiprocket_pickup_location', e.target.value)} className="input-field" placeholder="Primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Company Name</label>
            <input value={settings.shiprocket_company_name || ''} onChange={(e) => update('shiprocket_company_name', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Webhook Token</label>
            <input value={settings.shiprocket_webhook_token || ''} onChange={(e) => update('shiprocket_webhook_token', e.target.value)} className="input-field font-mono" placeholder="Random token for Shiprocket webhook" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
            <SettingsIcon size={20} />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Homepage Product Curation</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Trending Now Products</h3>
            <div className="border border-surface-200 dark:border-surface-800 rounded-xl max-h-[300px] overflow-y-auto p-3 space-y-2 bg-surface-50 dark:bg-surface-900/50">
              {allProducts.map((p) => {
                const isChecked = (settings.trending_products || '').split(',').map(x => x.trim()).includes(p.id);
                return (
                  <label key={`trending-${p.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => handleProductToggle('trending_products', p.id)} 
                      className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" 
                    />
                    <span className="text-sm text-surface-700 dark:text-surface-300">{p.name}</span>
                  </label>
                );
              })}
              {allProducts.length === 0 && <span className="text-xs text-surface-400">No products found</span>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">New Arrivals Products</h3>
            <div className="border border-surface-200 dark:border-surface-800 rounded-xl max-h-[300px] overflow-y-auto p-3 space-y-2 bg-surface-50 dark:bg-surface-900/50">
              {allProducts.map((p) => {
                const isChecked = (settings.new_arrivals || '').split(',').map(x => x.trim()).includes(p.id);
                return (
                  <label key={`new-${p.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => handleProductToggle('new_arrivals', p.id)} 
                      className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" 
                    />
                    <span className="text-sm text-surface-700 dark:text-surface-300">{p.name}</span>
                  </label>
                );
              })}
              {allProducts.length === 0 && <span className="text-xs text-surface-400">No products found</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
