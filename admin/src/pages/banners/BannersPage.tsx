import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Pencil, Trash2, X, Check, Loader2, Image, 
  Sparkles, Camera, Scissors, Laptop, Layout, Save, Upload
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BannerItem {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  link_text?: string;
  position: string;
  sort_order: number;
  is_active: boolean;
}

const defaultSlideForm = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  mobile_image_url: '',
  link_url: '',
  link_text: 'Shop Now',
  position: 'home_hero',
  sort_order: 0,
  is_active: true
};

export default function BannersPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'customization' | 'embroidered' | 'patches'>('home');
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Home Hero Slider Modal State
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerItem | null>(null);
  const [slideForm, setSlideForm] = useState(defaultSlideForm);
  const [sliderSaving, setSliderSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/banners', { params: { limit: 100 } });
      setBanners(data.data ?? []);
    } catch {
      toast.error('Failed to load website content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  // Image Upload helper
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const { data } = await api.post('/admin/media/upload', formData);
      const url = data.url || data.data?.url;
      if (url) {
        callback(url);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to parse uploaded image URL');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // General Banner Save Helper
  const saveBanner = async (item: BannerItem, customId: string) => {
    setSavingId(customId);
    try {
      if (item.id) {
        await api.put(`/admin/banners/${item.id}`, item);
      } else {
        await api.post('/admin/banners', item);
      }
      toast.success('Content saved successfully');
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save content');
    } finally {
      setSavingId(null);
    }
  };

  // Slider actions
  const openCreateSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      ...defaultSlideForm,
      sort_order: banners.filter(b => b.position === 'home_hero').length
    });
    setShowSliderModal(true);
  };

  const openEditSlide = (slide: BannerItem) => {
    setEditingSlide(slide);
    setSlideForm({
      title: slide.title,
      subtitle: slide.subtitle ?? '',
      description: slide.description ?? '',
      image_url: slide.image_url,
      mobile_image_url: slide.mobile_image_url ?? '',
      link_url: slide.link_url ?? '',
      link_text: slide.link_text ?? 'Shop Now',
      position: 'home_hero',
      sort_order: slide.sort_order,
      is_active: slide.is_active
    });
    setShowSliderModal(true);
  };

  const handleSaveSlide = async () => {
    if (!slideForm.title.trim()) return toast.error('Slide title is required');
    if (!slideForm.image_url.trim()) return toast.error('Slide image is required');
    
    setSliderSaving(true);
    try {
      if (editingSlide && editingSlide.id) {
        await api.put(`/admin/banners/${editingSlide.id}`, slideForm);
      } else {
        await api.post('/admin/banners', slideForm);
      }
      toast.success('Hero slide saved');
      setShowSliderModal(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save hero slide');
    } finally {
      setSliderSaving(false);
    }
  };

  const handleDeleteSlide = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this hero slide?')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      toast.success('Hero slide deleted');
      fetchBanners();
    } catch {
      toast.error('Failed to delete slide');
    }
  };

  // Filter banner items by position
  const getBannerByPosition = (pos: string, defaults: Partial<BannerItem> = {}) => {
    const match = banners.find(b => b.position === pos);
    return match || {
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      link_url: '',
      link_text: 'Shop Now',
      position: pos,
      sort_order: 0,
      is_active: true,
      ...defaults
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-surface-900 dark:text-surface-100">Storefront Content Manager</h1>
        <p className="text-sm text-surface-400 mt-1">Easily update hero sliders, page banners, and campaigns for each page separately</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-surface-200 dark:border-surface-800">
        <button 
          onClick={() => setActiveTab('home')} 
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200",
            activeTab === 'home' 
              ? "border-primary-500 text-primary-600 dark:text-primary-400 font-semibold" 
              : "border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300"
          )}
        >
          Home Page
        </button>
        <button 
          onClick={() => setActiveTab('customization')} 
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200",
            activeTab === 'customization' 
              ? "border-primary-500 text-primary-600 dark:text-primary-400 font-semibold" 
              : "border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300"
          )}
        >
          Customization Page
        </button>
        <button 
          onClick={() => setActiveTab('embroidered')} 
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200",
            activeTab === 'embroidered' 
              ? "border-primary-500 text-primary-600 dark:text-primary-400 font-semibold" 
              : "border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300"
          )}
        >
          Embroidered Apparel Page
        </button>
        <button 
          onClick={() => setActiveTab('patches')} 
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200",
            activeTab === 'patches' 
              ? "border-primary-500 text-primary-600 dark:text-primary-400 font-semibold" 
              : "border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300"
          )}
        >
          Patches Page
        </button>
      </div>

      {/* 1. Home Page Tab */}
      {activeTab === 'home' && (
        <div className="space-y-8">
          {/* Home Hero Slides */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                  <Layout size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Hero Carousel Slider</h2>
                  <p className="text-xs text-surface-400">Sliding banners at the top of your homepage</p>
                </div>
              </div>
              <button onClick={openCreateSlide} className="btn-primary py-2 text-xs">
                <Plus size={14} /> Add Slide
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {banners.filter(b => b.position === 'home_hero').map((slide, idx) => (
                <div key={slide.id || idx} className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden bg-surface-50 dark:bg-surface-900/40 flex flex-col justify-between">
                  <div className="relative h-40 bg-surface-100 dark:bg-surface-800">
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                      <span className="text-[10px] uppercase font-bold text-primary-400 tracking-wider">{slide.subtitle}</span>
                      <h4 className="text-sm font-bold text-white line-clamp-2">{slide.title}</h4>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between border-t border-surface-100 dark:border-surface-800">
                    <span className="text-xs font-semibold text-surface-500">Order: {slide.sort_order}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditSlide(slide)} className="p-1 text-surface-400 hover:text-primary-500">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteSlide(slide.id)} className="p-1 text-surface-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.filter(b => b.position === 'home_hero').length === 0 && (
                <div className="md:col-span-3 text-center py-8 text-surface-400 text-sm">
                  No slides created. The storefront will fall back to default slides.
                </div>
              )}
            </div>
          </div>

          {/* Middle Promotional Campaign */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/10 text-orange-500">
                  <Layout size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Middle Promotional Campaign</h2>
                  <p className="text-xs text-surface-400">The wide campaign promotion banner displayed on the Embroidered Apparel landing page</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const banner = getBannerByPosition('campaign_embroidered');
                  saveBanner(banner, 'emb_camp_home');
                }} 
                disabled={savingId === 'emb_camp_home'} 
                className="btn-primary py-2 text-xs flex items-center gap-2"
              >
                {savingId === 'emb_camp_home' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Campaign Config
              </button>
            </div>

            {(() => {
              const item = getBannerByPosition('campaign_embroidered', { link_text: 'Explore Campaign' });
              const setItemField = (key: keyof BannerItem, value: any) => {
                const match = banners.find(b => b.position === 'campaign_embroidered');
                if (match) {
                  (match as any)[key] = value;
                  setBanners([...banners]);
                } else {
                  setBanners([...banners, { ...item, [key]: value }]);
                }
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Campaign Red Banner Title</label>
                      <input value={item.title} onChange={(e) => setItemField('title', e.target.value)} className="input-field" placeholder="Fearless Stitches" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Red Badge Text / Label</label>
                      <input value={item.subtitle} onChange={(e) => setItemField('subtitle', e.target.value)} className="input-field" placeholder="CAMPAIGN 2026" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Campaign Description</label>
                      <textarea value={item.description} onChange={(e) => setItemField('description', e.target.value)} className="input-field min-h-[80px]" placeholder="Built for durability, designed to stand out..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Link Target URL</label>
                        <input value={item.link_url} onChange={(e) => setItemField('link_url', e.target.value)} className="input-field" placeholder="/embroidered" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cta Button Text</label>
                        <input value={item.link_text} onChange={(e) => setItemField('link_text', e.target.value)} className="input-field" placeholder="Explore Campaign" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Campaign Image</label>
                    <div className="border border-surface-200 dark:border-surface-800 rounded-xl p-4 bg-surface-50 dark:bg-surface-900/40 space-y-4">
                      <div className="relative h-56 bg-surface-200 dark:bg-surface-800 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-surface-300 dark:border-surface-700">
                        {item.image_url ? (
                          <>
                            <img src={item.image_url} alt="Campaign Promo" className="w-full h-full object-cover" />
                            <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors">
                              <Upload size={14} /> Change Image
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                              />
                            </label>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center">
                            <Image size={32} className="text-surface-400" />
                            <span className="text-sm text-surface-500 font-semibold hover:underline">Choose Image</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                            />
                          </label>
                        )}
                      </div>
                      <input 
                        value={item.image_url} 
                        onChange={(e) => setItemField('image_url', e.target.value)} 
                        className="input-field text-xs py-1.5" 
                        placeholder="Paste image URL (https://...)" 
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Instagram Grid */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-900/10 text-pink-500">
                <Camera size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Instagram Polaroid Grid</h2>
                <p className="text-xs text-surface-400">The 6 polaroid photo slots showing style inspiration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => {
                const item = banners.find(b => b.position === 'instagram_gallery' && b.sort_order === idx) || {
                  title: `#INDIUNA${idx+1}`,
                  image_url: '',
                  link_url: '',
                  position: 'instagram_gallery',
                  sort_order: idx,
                  is_active: true
                };

                return (
                  <div key={idx} className="p-4 border border-surface-200 dark:border-surface-800 rounded-xl space-y-4 bg-surface-50 dark:bg-surface-900/40">
                    <h3 className="text-xs font-bold text-surface-500 tracking-wider">SLOT {idx + 1}</h3>
                    <div className="relative h-48 bg-surface-200 dark:bg-surface-800 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-surface-300 dark:border-surface-700">
                      {item.image_url ? (
                        <>
                          <img src={item.image_url} alt="Insta" className="w-full h-full object-cover" />
                          <label className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white cursor-pointer transition-colors">
                            <Upload size={14} />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleUpload(e, (url) => {
                                const updated = { ...item, image_url: url };
                                saveBanner(updated, `insta-${idx}`);
                              })} 
                            />
                          </label>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center">
                          <Image size={24} className="text-surface-400" />
                          <span className="text-xs text-surface-400 hover:underline font-semibold">Upload Photo</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleUpload(e, (url) => {
                              const updated = { ...item, image_url: url };
                              saveBanner(updated, `insta-${idx}`);
                            })} 
                          />
                        </label>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-surface-400 mb-0.5">HASHTAG / CAPTION</label>
                        <input 
                          value={item.title} 
                          onChange={(e) => {
                            const match = banners.find(b => b.position === 'instagram_gallery' && b.sort_order === idx);
                            if (match) {
                              match.title = e.target.value;
                              setBanners([...banners]);
                            } else {
                              setBanners([...banners, { ...item, title: e.target.value }]);
                            }
                          }}
                          className="input-field py-1 text-xs" 
                          placeholder="#STYLE" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-surface-400 mb-0.5">REDIRECT URL (INSTAGRAM LINK)</label>
                        <input 
                          value={item.link_url} 
                          onChange={(e) => {
                            const match = banners.find(b => b.position === 'instagram_gallery' && b.sort_order === idx);
                            if (match) {
                              match.link_url = e.target.value;
                              setBanners([...banners]);
                            } else {
                              setBanners([...banners, { ...item, link_url: e.target.value }]);
                            }
                          }}
                          className="input-field py-1 text-xs" 
                          placeholder="https://instagram.com/p/..." 
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => saveBanner(item, `insta-${idx}`)} 
                      disabled={savingId === `insta-${idx}`} 
                      className="btn-primary w-full py-1.5 text-xs flex items-center justify-center gap-2"
                    >
                      {savingId === `insta-${idx}` ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      Save Slot {idx + 1}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Customization Page Tab */}
      {activeTab === 'customization' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/10 text-purple-500">
                <Laptop size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Customization Page Hero</h2>
                <p className="text-xs text-surface-400">The main promotional hero banner of the Customization subpage</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const banner = getBannerByPosition('customization_hero');
                saveBanner(banner, 'custom_hero');
              }} 
              disabled={savingId === 'custom_hero'} 
              className="btn-primary py-2 text-xs flex items-center gap-2"
            >
              {savingId === 'custom_hero' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Hero Config
            </button>
          </div>

          {(() => {
            const item = getBannerByPosition('customization_hero', { link_text: 'Start Customizing' });
            const setItemField = (key: keyof BannerItem, value: any) => {
              const match = banners.find(b => b.position === 'customization_hero');
              if (match) {
                (match as any)[key] = value;
                setBanners([...banners]);
              } else {
                setBanners([...banners, { ...item, [key]: value }]);
              }
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Banner Title</label>
                    <input value={item.title} onChange={(e) => setItemField('title', e.target.value)} className="input-field" placeholder="Your design, our premium craftsmanship." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Banner Tagline / Subtitle</label>
                    <input value={item.subtitle} onChange={(e) => setItemField('subtitle', e.target.value)} className="input-field" placeholder="Custom Customs" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description Details</label>
                    <textarea value={item.description} onChange={(e) => setItemField('description', e.target.value)} className="input-field min-h-[100px]" placeholder="Brief page intro description details..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Link URL</label>
                      <input value={item.link_url} onChange={(e) => setItemField('link_url', e.target.value)} className="input-field" placeholder="#catalog" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Link CTA Text</label>
                      <input value={item.link_text} onChange={(e) => setItemField('link_text', e.target.value)} className="input-field" placeholder="Start Customizing" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Banner Background Photo</label>
                  <div className="border border-surface-200 dark:border-surface-800 rounded-xl p-4 bg-surface-50 dark:bg-surface-900/40 space-y-4">
                    <div className="relative h-56 bg-surface-200 dark:bg-surface-800 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-surface-300 dark:border-surface-700">
                      {item.image_url ? (
                        <>
                          <img src={item.image_url} alt="Customization Hero" className="w-full h-full object-cover" />
                          <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors">
                            <Upload size={14} /> Change Photo
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                            />
                          </label>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center">
                          <Image size={32} className="text-surface-400" />
                          <span className="text-sm text-surface-500 font-semibold hover:underline">Choose Hero Image</span>
                          <span className="text-[10px] text-surface-400">Drag or click to upload</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                          />
                        </label>
                      )}
                    </div>
                    <input 
                      value={item.image_url} 
                      onChange={(e) => setItemField('image_url', e.target.value)} 
                      className="input-field text-xs py-1.5" 
                      placeholder="Or paste direct image URL (https://...)" 
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. Embroidered Apparel Page Tab */}
      {activeTab === 'embroidered' && (
        <div className="space-y-8">
          {/* Embroidered Hero Banner */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Hero Header Banner</h2>
                  <p className="text-xs text-surface-400">Header section at the top of the Embroidered Apparel landing page</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const banner = getBannerByPosition('embroidered_hero');
                  saveBanner(banner, 'emb_hero');
                }} 
                disabled={savingId === 'emb_hero'} 
                className="btn-primary py-2 text-xs flex items-center gap-2"
              >
                {savingId === 'emb_hero' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Hero
              </button>
            </div>

            {(() => {
              const item = getBannerByPosition('embroidered_hero', { link_text: 'Shop New Collection' });
              const setItemField = (key: keyof BannerItem, value: any) => {
                const match = banners.find(b => b.position === 'embroidered_hero');
                if (match) {
                  (match as any)[key] = value;
                  setBanners([...banners]);
                } else {
                  setBanners([...banners, { ...item, [key]: value }]);
                }
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Banner Title</label>
                      <input value={item.title} onChange={(e) => setItemField('title', e.target.value)} className="input-field" placeholder="Heavyweight fabrics, high-density stitches." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Banner Subtitle / Tagline</label>
                      <input value={item.subtitle} onChange={(e) => setItemField('subtitle', e.target.value)} className="input-field" placeholder="Premium Embroidered" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description details</label>
                      <textarea value={item.description} onChange={(e) => setItemField('description', e.target.value)} className="input-field min-h-[80px]" placeholder="Brief page header description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Redirect Link URL</label>
                        <input value={item.link_url} onChange={(e) => setItemField('link_url', e.target.value)} className="input-field" placeholder="#new-arrivals" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Link CTA Text</label>
                        <input value={item.link_text} onChange={(e) => setItemField('link_text', e.target.value)} className="input-field" placeholder="Shop New Collection" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Banner Background Photo</label>
                    <div className="border border-surface-200 dark:border-surface-800 rounded-xl p-4 bg-surface-50 dark:bg-surface-900/40 space-y-4">
                      <div className="relative h-56 bg-surface-200 dark:bg-surface-800 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-surface-300 dark:border-surface-700">
                        {item.image_url ? (
                          <>
                            <img src={item.image_url} alt="Embroidered Hero" className="w-full h-full object-cover" />
                            <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors">
                              <Upload size={14} /> Change Photo
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                              />
                            </label>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center">
                            <Image size={32} className="text-surface-400" />
                            <span className="text-sm text-surface-500 font-semibold hover:underline">Choose Image</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                            />
                          </label>
                        )}
                      </div>
                      <input 
                        value={item.image_url} 
                        onChange={(e) => setItemField('image_url', e.target.value)} 
                        className="input-field text-xs py-1.5" 
                        placeholder="Paste image URL (https://...)" 
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Embroidered Campaign Banner */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/10 text-orange-500">
                  <Layout size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Middle Promotional Campaign</h2>
                  <p className="text-xs text-surface-400">The wide campaign promotion banner in the middle of the page</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const banner = getBannerByPosition('campaign_embroidered');
                  saveBanner(banner, 'emb_camp');
                }} 
                disabled={savingId === 'emb_camp'} 
                className="btn-primary py-2 text-xs flex items-center gap-2"
              >
                {savingId === 'emb_camp' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Campaign
              </button>
            </div>

            {(() => {
              const item = getBannerByPosition('campaign_embroidered', { link_text: 'Explore Campaign' });
              const setItemField = (key: keyof BannerItem, value: any) => {
                const match = banners.find(b => b.position === 'campaign_embroidered');
                if (match) {
                  (match as any)[key] = value;
                  setBanners([...banners]);
                } else {
                  setBanners([...banners, { ...item, [key]: value }]);
                }
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Campaign Red Banner Title</label>
                      <input value={item.title} onChange={(e) => setItemField('title', e.target.value)} className="input-field" placeholder="Fearless Stitches" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Red Badge Text / Label</label>
                      <input value={item.subtitle} onChange={(e) => setItemField('subtitle', e.target.value)} className="input-field" placeholder="CAMPAIGN 2026" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Campaign Description</label>
                      <textarea value={item.description} onChange={(e) => setItemField('description', e.target.value)} className="input-field min-h-[80px]" placeholder="Built for durability, designed to stand out..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Link Target URL</label>
                        <input value={item.link_url} onChange={(e) => setItemField('link_url', e.target.value)} className="input-field" placeholder="/embroidered" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cta Button Text</label>
                        <input value={item.link_text} onChange={(e) => setItemField('link_text', e.target.value)} className="input-field" placeholder="Explore Campaign" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Campaign Image</label>
                    <div className="border border-surface-200 dark:border-surface-800 rounded-xl p-4 bg-surface-50 dark:bg-surface-900/40 space-y-4">
                      <div className="relative h-56 bg-surface-200 dark:bg-surface-800 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-surface-300 dark:border-surface-700">
                        {item.image_url ? (
                          <>
                            <img src={item.image_url} alt="Campaign Promo" className="w-full h-full object-cover" />
                            <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors">
                              <Upload size={14} /> Change Image
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                              />
                            </label>
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center">
                            <Image size={32} className="text-surface-400" />
                            <span className="text-sm text-surface-500 font-semibold hover:underline">Choose Image</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                            />
                          </label>
                        )}
                      </div>
                      <input 
                        value={item.image_url} 
                        onChange={(e) => setItemField('image_url', e.target.value)} 
                        className="input-field text-xs py-1.5" 
                        placeholder="Paste image URL (https://...)" 
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. Patches Page Tab */}
      {activeTab === 'patches' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-500">
                <Scissors size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Patches Page Hero Banner</h2>
                <p className="text-xs text-surface-400">Header section at the top of the Patches landing page</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const banner = getBannerByPosition('patches_hero');
                saveBanner(banner, 'patches_hero_btn');
              }} 
              disabled={savingId === 'patches_hero_btn'} 
              className="btn-primary py-2 text-xs flex items-center gap-2"
            >
              {savingId === 'patches_hero_btn' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Hero Config
            </button>
          </div>

          {(() => {
            const item = getBannerByPosition('patches_hero', { link_text: 'View All Patches' });
            const setItemField = (key: keyof BannerItem, value: any) => {
              const match = banners.find(b => b.position === 'patches_hero');
              if (match) {
                (match as any)[key] = value;
                setBanners([...banners]);
              } else {
                setBanners([...banners, { ...item, [key]: value }]);
              }
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Banner Title</label>
                    <input value={item.title} onChange={(e) => setItemField('title', e.target.value)} className="input-field" placeholder="Personalize anything instantly." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Banner Tagline / Subtitle</label>
                    <input value={item.subtitle} onChange={(e) => setItemField('subtitle', e.target.value)} className="input-field" placeholder="Premium Stitched Patches" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description Details</label>
                    <textarea value={item.description} onChange={(e) => setItemField('description', e.target.value)} className="input-field min-h-[100px]" placeholder="Upload patch desc details..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Redirect Link URL</label>
                      <input value={item.link_url} onChange={(e) => setItemField('link_url', e.target.value)} className="input-field" placeholder="#catalog" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Link CTA Text</label>
                      <input value={item.link_text} onChange={(e) => setItemField('link_text', e.target.value)} className="input-field" placeholder="View All Patches" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Banner Background Photo</label>
                  <div className="border border-surface-200 dark:border-surface-800 rounded-xl p-4 bg-surface-50 dark:bg-surface-900/40 space-y-4">
                    <div className="relative h-56 bg-surface-200 dark:bg-surface-800 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-surface-300 dark:border-surface-700">
                      {item.image_url ? (
                        <>
                          <img src={item.image_url} alt="Patches Hero" className="w-full h-full object-cover" />
                          <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors">
                            <Upload size={14} /> Change Photo
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                            />
                          </label>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center">
                          <Image size={32} className="text-surface-400" />
                          <span className="text-sm text-surface-500 font-semibold hover:underline">Choose Banner Image</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleUpload(e, (url) => setItemField('image_url', url))} 
                          />
                        </label>
                      )}
                    </div>
                    <input 
                      value={item.image_url} 
                      onChange={(e) => setItemField('image_url', e.target.value)} 
                      className="input-field text-xs py-1.5" 
                      placeholder="Paste image URL (https://...)" 
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Hero Slide Add/Edit Modal */}
      {showSliderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSliderModal(false)}>
          <div className="glass-card w-full max-w-xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                {editingSlide ? 'Edit Hero Slide' : 'New Hero Slide'}
              </h2>
              <button onClick={() => setShowSliderModal(false)} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">SLIDE MAIN TITLE</label>
                  <input value={slideForm.title} onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })} className="input-field" placeholder="Streetwear Crafted\nto Stand Out." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">SUBTITLE / TAGLINE</label>
                  <input value={slideForm.subtitle} onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })} className="input-field" placeholder="Premium Embroidered" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">DESCRIPTION DETAILS</label>
                <textarea value={slideForm.description} onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })} className="input-field min-h-[80px]" placeholder="Brief promotion description..." />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-surface-500">SLIDE IMAGE</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <input 
                      value={slideForm.image_url} 
                      onChange={(e) => setSlideForm({ ...slideForm, image_url: e.target.value })} 
                      className="input-field text-xs py-1.5" 
                      placeholder="Paste image URL (https://...)" 
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-surface-400">Or:</span>
                      <label className="inline-flex items-center justify-center px-2.5 py-1 border border-surface-200 dark:border-surface-800 rounded-lg text-[10px] font-semibold text-surface-700 dark:text-surface-300 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors">
                        <Upload size={10} className="mr-1" /> Choose File
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleUpload(e, (url) => setSlideForm(prev => ({ ...prev, image_url: url })))} 
                        />
                      </label>
                      {uploading && <Loader2 size={10} className="animate-spin text-primary-500" />}
                    </div>
                  </div>
                  {slideForm.image_url && (
                    <img 
                      src={slideForm.image_url} 
                      alt="Preview" 
                      className="w-16 h-12 object-cover rounded-lg border border-surface-200 dark:border-surface-800" 
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">LINK TARGET URL</label>
                  <input value={slideForm.link_url} onChange={(e) => setSlideForm({ ...slideForm, link_url: e.target.value })} className="input-field text-xs py-1.5" placeholder="#catalog" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">CTA BUTTON TEXT</label>
                  <input value={slideForm.link_text} onChange={(e) => setSlideForm({ ...slideForm, link_text: e.target.value })} className="input-field text-xs py-1.5" placeholder="Shop Now" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">SORT ORDER</label>
                  <input type="number" value={slideForm.sort_order} onChange={(e) => setSlideForm({ ...slideForm, sort_order: Number(e.target.value) })} className="input-field text-xs py-1.5" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-surface-100 dark:border-surface-800">
              <button onClick={() => setShowSliderModal(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
              <button onClick={handleSaveSlide} disabled={sliderSaving || uploading} className="btn-primary text-xs py-1.5">
                {sliderSaving && <Loader2 size={12} className="animate-spin" />}
                {editingSlide ? 'Update Slide' : 'Create Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
