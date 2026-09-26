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
  const openCreateSlide = (position = 'home_hero') => {
    setEditingSlide(null);
    setSlideForm({
      ...defaultSlideForm,
      position,
      sort_order: banners.filter(b => b.position === position).length
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
      position: slide.position || 'home_hero',
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
      toast.success('Slide saved successfully');
      setShowSliderModal(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save slide');
    } finally {
      setSliderSaving(false);
    }
  };

  const handleDeleteSlide = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      toast.success('Slide deleted');
      fetchBanners();
    } catch {
      toast.error('Failed to delete slide');
    }
  };

  const handleToggleActive = async (slide: BannerItem) => {
    if (!slide.id) return;
    try {
      await api.put(`/admin/banners/${slide.id}`, {
        ...slide,
        is_active: !slide.is_active
      });
      toast.success(slide.is_active ? 'Slide deactivated' : 'Slide activated');
      fetchBanners();
    } catch {
      toast.error('Failed to update slide status');
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

  const renderSliderManager = (
    title: string,
    description: string,
    position: string,
    icon: React.ReactNode,
    addLabel = 'Add Slide',
    emptyMsg = 'No slides created yet. Add slides to enable the interactive banner carousel.'
  ) => {
    const slides = banners.filter(b => b.position === position).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return (
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h2>
              <p className="text-xs text-surface-400">{description}</p>
            </div>
          </div>
          <button onClick={() => openCreateSlide(position)} className="btn-primary py-2 text-xs flex items-center gap-1.5">
            <Plus size={14} /> {addLabel}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {slides.map((slide, idx) => (
            <div key={slide.id || idx} className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden bg-surface-50 dark:bg-surface-900/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-44 bg-surface-100 dark:bg-surface-800">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-surface-400">
                    <Image size={28} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                  {slide.subtitle && (
                    <span className="text-[10px] uppercase font-bold text-primary-400 tracking-wider mb-1 line-clamp-1">{slide.subtitle}</span>
                  )}
                  <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">{slide.title}</h4>
                  {slide.description && (
                    <p className="text-[11px] text-surface-300 line-clamp-1 mt-1">{slide.description}</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide",
                    slide.is_active ? "bg-emerald-500/80 text-white" : "bg-surface-700/80 text-surface-300"
                  )}>
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between border-t border-surface-100 dark:border-surface-800 bg-white/50 dark:bg-surface-900/50">
                <span className="text-xs font-semibold text-surface-500">Order: {slide.sort_order}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleActive(slide)}
                    className={cn(
                      "p-1.5 rounded-md text-xs transition-colors",
                      slide.is_active ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" : "text-surface-400 hover:bg-surface-100"
                    )}
                    title={slide.is_active ? "Deactivate Slide" : "Activate Slide"}
                  >
                    <Check size={14} />
                  </button>
                  <button onClick={() => openEditSlide(slide)} className="p-1.5 rounded-md text-surface-400 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" title="Edit Slide">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteSlide(slide.id)} className="p-1.5 rounded-md text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Delete Slide">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {slides.length === 0 && (
            <div className="md:col-span-3 text-center py-10 border border-dashed border-surface-300 dark:border-surface-700 rounded-xl bg-surface-50/50 dark:bg-surface-900/20 text-surface-400 text-sm space-y-2">
              <p>{emptyMsg}</p>
              <button onClick={() => openCreateSlide(position)} className="btn-secondary text-xs py-1.5">
                <Plus size={12} className="inline mr-1" /> {addLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    );
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
        <p className="text-sm text-surface-400 mt-1">Easily update sliding banner carousels, promotional campaigns, and photo feeds for each page</p>
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
          {renderSliderManager(
            'Hero Carousel Slider',
            'Sliding banners at the top of your homepage',
            'home_hero',
            <Layout size={20} />,
            'Add Slide'
          )}

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
        <div className="space-y-8">
          {renderSliderManager(
            'Customization Page Hero Slider',
            'Interactive sliding banners at the top of the Customization landing page',
            'customization_hero',
            <Laptop size={20} />,
            'Add Slide'
          )}
        </div>
      )}

      {/* 3. Embroidered Apparel Page Tab */}
      {activeTab === 'embroidered' && (
        <div className="space-y-8">
          {renderSliderManager(
            'Hero Header Banner Slider',
            'Interactive sliding banners at the top of the Embroidered Apparel landing page',
            'embroidered_hero',
            <Sparkles size={20} />,
            'Add Hero Slide'
          )}

          {renderSliderManager(
            'Promotional Campaign Banner Slider',
            'Sliding promotional campaign cards displayed in the middle of the Embroidered Apparel page',
            'campaign_embroidered',
            <Layout size={20} />,
            'Add Campaign Slide'
          )}
        </div>
      )}

      {/* 4. Patches Page Tab */}
      {activeTab === 'patches' && (
        <div className="space-y-8">
          {renderSliderManager(
            'Patches Page Hero Slider',
            'Interactive sliding banners at the top of the Patches landing page',
            'patches_hero',
            <Scissors size={20} />,
            'Add Slide'
          )}
        </div>
      )}

      {/* Hero Slide Add/Edit Modal */}
      {showSliderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSliderModal(false)}>
          <div className="glass-card w-full max-w-xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <span>{editingSlide ? 'Edit Slide' : 'New Slide'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 uppercase">
                  {slideForm.position.replace('_', ' ')}
                </span>
              </h2>
              <button onClick={() => setShowSliderModal(false)} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">SLIDE MAIN TITLE</label>
                  <input value={slideForm.title} onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })} className="input-field" placeholder="Fearless Stitches" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">SUBTITLE / TAGLINE / BADGE</label>
                  <input value={slideForm.subtitle} onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })} className="input-field" placeholder="CAMPAIGN 2026 or Premium Embroidered" />
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
                  <input value={slideForm.link_url} onChange={(e) => setSlideForm({ ...slideForm, link_url: e.target.value })} className="input-field text-xs py-1.5" placeholder="#catalog or /category" />
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

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="slide_is_active"
                  checked={slideForm.is_active} 
                  onChange={(e) => setSlideForm({ ...slideForm, is_active: e.target.checked })} 
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="slide_is_active" className="text-xs font-medium text-surface-700 dark:text-surface-300 cursor-pointer">
                  Active (display this slide on the storefront)
                </label>
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
