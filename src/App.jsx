import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  Search, 
  Heart, 
  Play, 
  ChevronRight, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Percent, 
  Scissors, 
  Shirt, 
  FolderHeart, 
  Plus, 
  Minus, 
  Sparkles, 
  Upload, 
  Cpu, 
  ArrowRight,
  ArrowLeft,
  Undo2,
  CornerUpLeft,
  Dog,
  Car,
  Smile,
  Compass,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Trash2,
  LogOut,
  Package,
  CreditCard,
  Lock,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  HelpCircle,
  Ruler,
  Award,
  PhoneCall,
  Mail,
  Clock,
  Layers,
  CheckCircle2,
  Globe,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import Lenis from 'lenis';

const formatImageUrl = (url) => {
  if (!url) return '/images/products/placeholder.png';
  let clean = typeof url === 'object' ? (url.url || url.path || url.image_url || '') : String(url).trim();
  if (!clean) return '/images/products/placeholder.png';

  clean = clean.replace(/\\/g, '/');

  if (clean.includes('localhost') || clean.includes('127.0.0.1') || clean.includes('192.168.')) {
    clean = clean.replace(/^https?:\/\/[^\/]+/, '');
  }

  if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://');
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  clean = clean.replace(/^\/?(public\/)?storage\/?/i, '/storage/');

  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }

  if (!clean.startsWith('/storage/') && !clean.startsWith('/images/')) {
    clean = '/storage/' + clean.replace(/^\/+/, '');
  }

  clean = clean.replace(/\/storage\/+storage\//g, '/storage/');

  return clean;
};

const isProductOutOfStock = (product) => {
  if (!product) return false;
  if (product.is_out_of_stock) return true;
  if (product.stock !== undefined && product.stock !== null) {
    return Number(product.stock) <= 0;
  }
  if (product.variants && product.variants.length > 0) {
    return product.variants.every(v => (Number(v.stock) || 0) <= 0);
  }
  return false;
};

const matchProductFitOrTag = (p, filterValue) => {
  if (!filterValue || filterValue === 'ALL') return true;

  const target = String(filterValue).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!target) return true;

  // 1. Check tags / subCategories
  const allTags = [
    ...(p.tags || []),
    ...(p.subCategories || [])
  ];

  for (const rawTag of allTags) {
    const cleanTag = String(rawTag).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanTag === target || cleanTag.includes(target) || target.includes(cleanTag)) {
      return true;
    }
  }

  // 2. Check categories
  const catNames = [
    p.category || '',
    ...(p.categoryNames || [])
  ];

  for (const rawCat of catNames) {
    const cleanCat = String(rawCat).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanCat === target || cleanCat.includes(target) || target.includes(cleanCat)) {
      return true;
    }
  }

  // 3. Check product name
  const nameClean = String(p.name || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (nameClean.includes(target) || target.includes(nameClean)) {
    return true;
  }

  return false;
};

const TrustBadges = () => {
  return (
    <section className="trust-badges-bar-section">
      <div className="trust-badges-bar-compact">
        <div className="trust-badges-compact-grid">
          <div className="trust-badge-compact-card">
            <div className="trust-badge-compact-icon"><Percent /></div>
            <div className="trust-badge-compact-info">
              <span className="trust-badge-compact-title">10% Cashback</span>
              <span className="trust-badge-compact-desc">on all App orders</span>
            </div>
          </div>
          <div className="trust-badge-compact-card">
            <div className="trust-badge-compact-icon"><RotateCcw /></div>
            <div className="trust-badge-compact-info">
              <span className="trust-badge-compact-title">30 days Easy Returns</span>
              <span className="trust-badge-compact-desc">&amp; Exchanges</span>
            </div>
          </div>
          <div className="trust-badge-compact-card">
            <div className="trust-badge-compact-icon"><Truck /></div>
            <div className="trust-badge-compact-info">
              <span className="trust-badge-compact-title">Free &amp; Fast Shipping</span>
              <span className="trust-badge-compact-desc">Pan India Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api/v1'
    : `${window.location.origin}/api/v1`;

  // URL Hash Cleaner for #size / #size_guide
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('size')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  // Loading & View States
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'product' | 'profile' | 'checkout'
  const [previousView, setPreviousView] = useState('home');
  const [activeProductId, setActiveProductId] = useState(1);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Search Modal States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Carousel & Filtering States
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [freshDropsSlide, setFreshDropsSlide] = useState(0);
  const [newArrivalsIndex, setNewArrivalsIndex] = useState(10);
  const [newArrivalsNoAnim, setNewArrivalsNoAnim] = useState(false);

  const [activeTab, setActiveTab] = useState('customization');
  const [activeCustomizationCategory, setActiveCustomizationCategory] = useState('All');
  const [activeEmbroideredCategory, setActiveEmbroideredCategory] = useState('All');
  const [activePatchesCategory, setActivePatchesCategory] = useState('All');
  const [activeGenderTab, setActiveGenderTab] = useState('ALL');
  const [activeSubCategory, setActiveSubCategory] = useState('ALL');
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('ALL');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null = show all
  const [selectedCategoryName, setSelectedCategoryName] = useState(null); // null = show all
  const [selectedFilterCategoryId, setSelectedFilterCategoryId] = useState('ALL');

  const lastScrollPosition = useRef(0);
  const savedViewState = useRef({});
  const isReturningFromProduct = useRef(false);
  const isNavigatingToProduct = useRef(false);

  const saveCurrentScroll = (viewName = currentView) => {
    if (isNavigatingToProduct.current && viewName !== 'product') {
      return;
    }

    const y = window.scrollY || document.documentElement.scrollTop || (lenisRef.current ? lenisRef.current.scroll : 0);
    const existingScroll = savedViewState.current[viewName]?.scroll || 0;
    
    if (y === 0 && existingScroll > 0 && isNavigatingToProduct.current) {
      return;
    }

    lastScrollPosition.current = y;
    
    savedViewState.current[viewName] = {
      scroll: y,
      activeTab,
      activeCustomizationCategory,
      activeEmbroideredCategory,
      activePatchesCategory,
      activeGenderTab,
      activeSubCategory,
      selectedSubCategoryId,
      selectedParentCategoryId,
      selectedCategoryId,
      selectedCategoryName,
      selectedFilterCategoryId
    };

    try {
      sessionStorage.setItem('indiuna_scroll_' + viewName, y.toString());
      sessionStorage.setItem('indiuna_state_' + viewName, JSON.stringify(savedViewState.current[viewName]));
    } catch (e) {
      console.warn('sessionStorage not available', e);
    }
  };

  const restorePreviousScroll = (targetView) => {
    const viewToRestore = targetView || previousView || 'home';
    let savedState = savedViewState.current[viewToRestore];

    if (!savedState) {
      try {
        const stored = sessionStorage.getItem('indiuna_state_' + viewToRestore);
        if (stored) savedState = JSON.parse(stored);
      } catch (e) {
        console.warn('sessionStorage read failed', e);
      }
    }

    if (savedState) {
      if (savedState.activeTab !== undefined) setActiveTab(savedState.activeTab);
      if (savedState.activeCustomizationCategory !== undefined) setActiveCustomizationCategory(savedState.activeCustomizationCategory);
      if (savedState.activeEmbroideredCategory !== undefined) setActiveEmbroideredCategory(savedState.activeEmbroideredCategory);
      if (savedState.activePatchesCategory !== undefined) setActivePatchesCategory(savedState.activePatchesCategory);
      if (savedState.activeGenderTab !== undefined) setActiveGenderTab(savedState.activeGenderTab);
      if (savedState.activeSubCategory !== undefined) setActiveSubCategory(savedState.activeSubCategory);
      if (savedState.selectedSubCategoryId !== undefined) setSelectedSubCategoryId(savedState.selectedSubCategoryId);
      if (savedState.selectedParentCategoryId !== undefined) setSelectedParentCategoryId(savedState.selectedParentCategoryId);
      if (savedState.selectedCategoryId !== undefined) setSelectedCategoryId(savedState.selectedCategoryId);
      if (savedState.selectedCategoryName !== undefined) setSelectedCategoryName(savedState.selectedCategoryName);
      if (savedState.selectedFilterCategoryId !== undefined) setSelectedFilterCategoryId(savedState.selectedFilterCategoryId);
    }

    let savedY = savedState?.scroll;
    if (savedY === undefined || savedY === null) {
      try {
        const stored = sessionStorage.getItem('indiuna_scroll_' + viewToRestore);
        if (stored) savedY = parseFloat(stored);
      } catch (e) {}
    }

    if (savedY && savedY > 0) {
      const doScroll = () => {
        if (lenisRef.current) {
          lenisRef.current.resize();
          lenisRef.current.scrollTo(savedY, { immediate: true });
        }
        window.scrollTo({ top: savedY, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = savedY;
        document.body.scrollTop = savedY;
      };
      doScroll();
      requestAnimationFrame(doScroll);
      setTimeout(doScroll, 50);
      setTimeout(doScroll, 150);
      setTimeout(doScroll, 300);
      setTimeout(doScroll, 500);
    }
  };

  // Auth States
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile & Customer Account States
  const [profileTab, setProfileTab] = useState('details');
  const [userAddresses, setUserAddresses] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // Swipe & Wheel gesture handlers for Fresh Drops
  const [freshTouchStartX, setFreshTouchStartX] = useState(0);
  const [freshTouchEndX, setFreshTouchEndX] = useState(0);
  const freshWheelCooldown = useRef(false);

  const handleFreshTouchStart = (e) => {
    setFreshTouchStartX(e.targetTouches[0].clientX);
    setFreshTouchEndX(e.targetTouches[0].clientX); // initialize endX to startX
  };

  const handleFreshTouchMove = (e) => {
    setFreshTouchEndX(e.targetTouches[0].clientX);
  };

  const handleFreshTouchEnd = () => {
    if (freshTouchStartX - freshTouchEndX > 40) {
      setFreshDropsSlide(prev => (prev + 1) % 3);
    } else if (freshTouchStartX - freshTouchEndX < -40) {
      setFreshDropsSlide(prev => (prev - 1 + 3) % 3);
    }
  };

  const handleFreshWheel = (e) => {
    if (freshWheelCooldown.current) return;
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 20) {
      freshWheelCooldown.current = true;
      if (delta > 0) {
        setFreshDropsSlide(prev => (prev + 1) % 3);
      } else {
        setFreshDropsSlide(prev => (prev - 1 + 3) % 3);
      }
      setTimeout(() => {
        freshWheelCooldown.current = false;
      }, 400);
    }
  };

  // Swipe, Drag & Wheel gesture handlers for New Arrivals
  const [arrivalsTouchStartX, setArrivalsTouchStartX] = useState(0);
  const [arrivalsTouchEndX, setArrivalsTouchEndX] = useState(0);
  const arrivalsWheelCooldown = useRef(false);
  const arrivalsMouseDown = useRef(false);
  const arrivalsMouseStartX = useRef(0);
  const arrivalsMouseDragDist = useRef(0);

  const handleArrivalsTouchStart = (e) => {
    setArrivalsTouchStartX(e.targetTouches[0].clientX);
    setArrivalsTouchEndX(e.targetTouches[0].clientX); // initialize endX to startX
  };

  const handleArrivalsTouchMove = (e) => {
    setArrivalsTouchEndX(e.targetTouches[0].clientX);
  };

  const handleArrivalsTouchEnd = () => {
    if (arrivalsTouchStartX - arrivalsTouchEndX > 40) {
      setNewArrivalsIndex(prev => prev + 1);
    } else if (arrivalsTouchStartX - arrivalsTouchEndX < -40) {
      setNewArrivalsIndex(prev => prev - 1);
    }
  };

  const handleArrivalsWheel = (e) => {
    if (arrivalsWheelCooldown.current) return;
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 20) {
      arrivalsWheelCooldown.current = true;
      if (delta > 0) {
        setNewArrivalsIndex(prev => prev + 1);
      } else {
        setNewArrivalsIndex(prev => prev - 1);
      }
      setTimeout(() => {
        arrivalsWheelCooldown.current = false;
      }, 300);
    }
  };

  const handleArrivalsMouseDown = (e) => {
    arrivalsMouseDown.current = true;
    arrivalsMouseStartX.current = e.clientX;
    arrivalsMouseDragDist.current = 0;
  };

  const handleArrivalsMouseMove = (e) => {
    if (!arrivalsMouseDown.current) return;
    arrivalsMouseDragDist.current = e.clientX - arrivalsMouseStartX.current;
  };

  const handleArrivalsMouseUp = () => {
    if (!arrivalsMouseDown.current) return;
    arrivalsMouseDown.current = false;
    if (arrivalsMouseDragDist.current < -40) {
      setNewArrivalsIndex(prev => prev + 1);
    } else if (arrivalsMouseDragDist.current > 40) {
      setNewArrivalsIndex(prev => prev - 1);
    }
  };

  const handleArrivalsMouseLeave = () => {
    if (arrivalsMouseDown.current) {
      handleArrivalsMouseUp();
    }
  };

  useEffect(() => {
    setSelectedFilterCategoryId('ALL');
  }, [selectedSubCategoryId]);

  // Navigation helper to update view and URL hash
  const changeView = (view, params = {}, replace = false) => {
    const { productId, isCustomizing: custom = false } = params;
    
    // Save current listing view state before moving away
    if (currentView !== view) {
      if (['home', 'customization', 'embroidered', 'patches'].includes(currentView)) {
        saveCurrentScroll(currentView);
        setPreviousView(currentView);
      } else if (currentView === 'product' && view === 'checkout') {
        setPreviousView('product');
      }
    }

    if (view === 'product') {
      if (currentView !== 'product') {
        if (['home', 'customization', 'embroidered', 'patches'].includes(currentView)) {
          saveCurrentScroll(currentView);
          setPreviousView(currentView);
        }
        isReturningFromProduct.current = false;
      }
      if (productId !== undefined && productId !== null) setActiveProductId(productId);
      setIsCustomizing(custom);
    } else if (currentView === 'product') {
      isReturningFromProduct.current = true;
    }

    setCurrentView(view);

    let targetHash = '#home';
    if (view === 'customization') targetHash = '#customization';
    else if (view === 'embroidered') targetHash = '#embroidered';
    else if (view === 'patches') targetHash = '#patches';
    else if (view === 'product') {
      const pid = productId !== undefined && productId !== null ? productId : activeProductId;
      targetHash = custom ? `#custom-product-${pid}` : `#product-${pid}`;
    }
    else if (view === 'profile') targetHash = '#profile';
    else if (view === 'wishlist') targetHash = '#wishlist';
    else if (view === 'checkout') targetHash = '#checkout';
    else if (view === 'auth') targetHash = '#auth';
    else if (['track-order','returns','shipping','size-guide','faqs','story','quality'].includes(view)) {
      targetHash = `#${view}`;
    } else {
      targetHash = '#home';
    }

    if (window.location.hash !== targetHash) {
      if (replace) {
        window.history.replaceState(null, '', targetHash);
      } else {
        window.location.hash = targetHash;
      }
    }

    // Always scroll to top when opening a new detail/info/checkout/profile view
    if (!['home', 'customization', 'embroidered', 'patches'].includes(view)) {
      scrollToTop();
    }
  };

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handleScrollSave = () => {
      if (['home', 'customization', 'embroidered', 'patches'].includes(currentView) && !isNavigatingToProduct.current) {
        saveCurrentScroll(currentView);
      }
    };

    window.addEventListener('scroll', handleScrollSave, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSave);
  }, [currentView]);

  // Sync React state from URL Hash on page load / refresh and browser back/forward buttons
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      let targetView = 'home';

      if (!hash || hash === '#' || hash === '#home') {
        targetView = 'home';
      } else if (hash === '#customization') {
        targetView = 'customization';
      } else if (hash === '#embroidered') {
        targetView = 'embroidered';
      } else if (hash === '#patches') {
        targetView = 'patches';
      } else if (hash.startsWith('#product-')) {
        const rawPid = hash.replace('#product-', '');
        const pid = (!isNaN(Number(rawPid)) && rawPid.trim() !== '') ? Number(rawPid) : rawPid;
        if (pid) {
          setActiveProductId(pid);
          setIsCustomizing(false);
          setCurrentView('product');
          scrollToTop();
          return;
        }
      } else if (hash.startsWith('#custom-product-')) {
        const rawPid = hash.replace('#custom-product-', '');
        const pid = (!isNaN(Number(rawPid)) && rawPid.trim() !== '') ? Number(rawPid) : rawPid;
        if (pid) {
          setActiveProductId(pid);
          setIsCustomizing(true);
          setCurrentView('product');
          scrollToTop();
          return;
        }
      } else if (hash === '#profile') {
        targetView = 'profile';
      } else if (hash === '#wishlist') {
        targetView = 'wishlist';
      } else if (hash === '#checkout') {
        targetView = 'checkout';
      } else if (hash === '#auth') {
        targetView = 'auth';
      } else if (['track-order','returns','shipping','size-guide','faqs','story','quality'].includes(hash.replace('#', ''))) {
        targetView = hash.replace('#', '');
      }

      setCurrentView(targetView);
      if (['home', 'customization', 'embroidered', 'patches'].includes(targetView)) {
        restorePreviousScroll(targetView);
      } else {
        scrollToTop();
      }
    };

    syncFromHash();

    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);

    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  // Restore scroll position when returning from product view
  useEffect(() => {
    if (currentView !== 'product' && isReturningFromProduct.current) {
      isReturningFromProduct.current = false;
      restorePreviousScroll();
    }
  }, [currentView]);

  const heroSlides = [
    {
      tag: "Premium Embroidered",
      title: "Streetwear Crafted to Stand Out.",
      desc: "Timeless embroidery. Modern designs. Made to last.",
      image: "/images/hero_banner.png",
      cta: "Shop New Arrivals",
      secondaryCta: "Customize Now"
    },
    {
      tag: "Limited Drop",
      title: "Artistry in Every Single Stitch.",
      desc: "Inspired by modern anime and dark streetwear design cultures.",
      image: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1200&auto=format&fit=crop",
      cta: "Explore Drop",
      secondaryCta: "Watch Craft"
    },
    {
      tag: "Custom Customs",
      title: "Your Design, Our Craftsmanship.",
      desc: "Upload your custom graphics, logos or sketches and we'll embroider it onto premium fabrics.",
      image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=1200&auto=format&fit=crop",
      cta: "Start Designing",
      secondaryCta: "Learn More"
    }
  ];

  // Loader timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Hydrate products from Backend API
  useEffect(() => {
    fetch(`${API_BASE}/products?per_page=100`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map(p => {
            const rawImg = p.images?.find(img => img.is_primary)?.url 
              || p.images?.[0]?.url 
              || p.image;
            const primaryImg = formatImageUrl(rawImg);
            
            let rawTags = [];
            if (Array.isArray(p.tags)) {
              rawTags = p.tags;
            } else if (typeof p.tags === 'string') {
              try {
                rawTags = p.tags.startsWith('[') ? JSON.parse(p.tags) : p.tags.split(',');
              } catch {
                rawTags = p.tags.split(',');
              }
            }
            const cleanTags = (rawTags || []).map(t => String(t).trim()).filter(Boolean);

            return {
              id: p.id,
              name: p.name,
              price: p.price ? parseFloat(p.price) : 999,
              originalPrice: p.compare_price ? parseFloat(p.compare_price) : (p.price ? parseFloat(p.price) : 1299),
              tag: p.is_featured ? 'FEATURED' : 'NEW',
              category: p.categories?.[0]?.name || p.category || 'Apparel',
              categories: p.categories || [],
              categoryIds: (p.categories || []).map(c => c.id),
              categoryNames: (p.categories || []).map(c => (c.name || '').toUpperCase()),
              show_in_pages: p.show_in_pages || (p.categories || []).map(c => c.show_in_pages).filter(Boolean).join(',') || '',
              is_customizing: Boolean(p.is_customizing || p.is_customizable),
              tags: cleanTags,
              subCategories: cleanTags.map(t => t.toUpperCase()),
              gender: (p.gender || 'unisex').toUpperCase(),
              image: primaryImg,
              desc: p.description || p.short_description || '',
              rating: p.average_rating ? parseFloat(p.average_rating) : 4.8,
              reviewCount: p.reviews_count || 10,
              thumbnails: p.images?.length > 0 ? p.images.map(img => formatImageUrl(img.url || img.path)) : [primaryImg],
              variants: p.variants || [],
              stock: p.stock !== null && p.stock !== undefined ? parseInt(p.stock, 10) : (p.variants?.length ? p.variants.reduce((a, b) => a + (parseInt(b.stock, 10) || 0), 0) : 0),
              size_guide_image: p.size_guide_image ? formatImageUrl(p.size_guide_image) : null,
            };
          });
          setProducts(mapped);
        }
      })
      .catch(err => console.error('Failed to fetch backend products:', err));
  }, []);

  // Hydrate categories from Backend API
  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          setDbCategories(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch backend categories:', err));
  }, []);

  // Hydrate banners from Backend API
  const [dbBanners, setDbBanners] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/banners`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          setDbBanners(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch backend banners:', err));
  }, []);

  // Auth verification and URL query parameters check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'login' && !user) {
      setCurrentView('auth');
      setAuthTab('login');
      scrollToTop();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  useEffect(() => {
    if (token && !user) {
      fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(res => {
        if (res.status === 401) {
          handleLogoutLocal();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success && data.data) {
          setUser(data.data);
          localStorage.setItem('user', JSON.stringify(data.data));
        }
      })
      .catch(err => console.error('Failed to verify token:', err));
    }
  }, [token]);

  const handleLogoutLocal = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('home');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = (authEmail || '').trim();
    const cleanPassword = authPassword || '';
    if (!cleanEmail || !cleanPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('token', data.data.token); // Write to 'token' key for admin panel
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setIsAuthOpen(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
        
        let role = 'customer';
        const userObj = data.data.user;
        if (userObj.role) {
          role = typeof userObj.role === 'object' ? userObj.role.name : userObj.role;
        } else if (userObj.roles && userObj.roles.length > 0) {
          const firstRole = userObj.roles[0];
          role = typeof firstRole === 'object' ? firstRole.name : firstRole;
        }
        
        const roleLower = role.toLowerCase();
        if (roleLower.includes('admin') || roleLower.includes('manager') || roleLower.includes('support')) {
          window.location.href = '/admin';
        } else {
          setCurrentView('home');
        }
      } else {
        const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Invalid email or password.');
        setAuthError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanEmail = (authEmail || '').trim();
    const cleanPassword = authPassword || '';
    const cleanConfirmPassword = authConfirmPassword || '';

    if (!authFirstName.trim() || !authLastName.trim()) {
      setAuthError('Please enter your first name and last name.');
      return;
    }
    if (!cleanEmail) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (cleanPassword !== cleanConfirmPassword) {
      setAuthError('Password and Confirm Password do not match.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          first_name: authFirstName.trim(),
          last_name: authLastName.trim(),
          email: cleanEmail,
          password: cleanPassword,
          password_confirmation: cleanConfirmPassword,
          phone: authPhone.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('token', data.data.token); // Sync for admin panel too
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setIsAuthOpen(false);
        setAuthFirstName('');
        setAuthLastName('');
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthPhone('');
        setCurrentView('home');
      } else {
        const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Registration failed. Please check your inputs.');
        setAuthError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      handleLogoutLocal();
    }
  };



  // Auto-play Announcement Bar, Hero Slide, Fresh Drops & New Arrivals
  useEffect(() => {
    const annTimer = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % 3);
    }, 4000);

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    const freshTimer = setInterval(() => {
      setFreshDropsSlide((prev) => (prev + 1) % 3);
    }, 5000);

    const arrivalsTimer = setInterval(() => {
      setNewArrivalsIndex((prev) => prev + 1); // continuous increment, no modulo
    }, 4000);

    return () => {
      clearInterval(annTimer);
      clearInterval(slideTimer);
      clearInterval(freshTimer);
      clearInterval(arrivalsTimer);
    };
  }, [heroSlides.length]);

  // Silent infinite-loop reset for New Arrivals
  // After the CSS transition (0.65s) completes, silently reposition the track
  // so continuous forward/backward never shows a jump-back
  useEffect(() => {
    if (newArrivalsIndex >= 20) {
      // Went past last item of middle copy → jump to same position in middle copy
      const t = setTimeout(() => {
        setNewArrivalsNoAnim(true);
        setNewArrivalsIndex(newArrivalsIndex - 10);
        requestAnimationFrame(() => requestAnimationFrame(() => setNewArrivalsNoAnim(false)));
      }, 700);
      return () => clearTimeout(t);
    } else if (newArrivalsIndex <= 9) {
      // Went before first item of middle copy → jump to same position in middle copy
      const t = setTimeout(() => {
        setNewArrivalsNoAnim(true);
        setNewArrivalsIndex(newArrivalsIndex + 10);
        requestAnimationFrame(() => requestAnimationFrame(() => setNewArrivalsNoAnim(false)));
      }, 700);
      return () => clearTimeout(t);
    }
  }, [newArrivalsIndex]);

  // Scroll Reveal Intersection Observer
  useEffect(() => {
    if (isLoading) return;
    
    // Tiny delay to ensure DOM is fully rendered
    const initObserver = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      }, { threshold: 0.08 });

      const elements = document.querySelectorAll('.reveal-section');
      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }, 100);

    return () => clearTimeout(initObserver);
  }, [isLoading, currentView]);

  // Track scroll position to hide sub-navbar on scroll (debounced scroll threshold to prevent flickering)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY;

          if (currentScrollY > 200) {
            if (delta > 15) {
              setIsScrolled(true); // scrolling down significantly: hide sub-navbar
            } else if (delta < -15) {
              setIsScrolled(false); // scrolling up significantly: show sub-navbar
            }
          } else {
            setIsScrolled(false); // near top: show sub-navbar
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Wishlist State
  const [wishlist, setWishlist] = useState([]);
  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Quick View Modal State (still kept for homepage catalog or general use)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('L');

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Smooth Scroll Initialization
  const lenisRef = useRef(null);
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Categories Data
  const [dbCategories, setDbCategories] = useState([]);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null); // 'customization' | 'embroidered' | 'patches' | null
  const customizationCats = dbCategories.filter(c => c.is_active && c.show_in_pages?.split(',').map(s => s.trim()).includes('customization'));
  const embroideredCats = dbCategories.filter(c => c.is_active && c.show_in_pages?.split(',').map(s => s.trim()).includes('embroidered'));
  const patchesCats = dbCategories.filter(c => c.is_active && c.show_in_pages?.split(',').map(s => s.trim()).includes('patches'));

  // Products Data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Demon Mask Embroidered Oversized Tee",
      price: 1299,
      originalPrice: 1799,
      tag: "NEW",
      category: "Oversized T-Shirts",
      subCategories: ["OVERSIZED T-SHIRTS", "T-SHIRTS", "TRENDING", "NEW COLLECTIONS"],
      gender: "UNISEX",
      image: "/images/products/demon_mask_tee.png",
      desc: "This oversized streetwear tee features a premium, thick embroidered Japanese Oni demon mask on the back. Made from heavy-weight 240 GSM organic cotton fabric to ensure both longevity and comfort.",
      rating: 4.9,
      reviewCount: 52,
      thumbnails: [
        "/images/products/demon_mask_tee.png",
        "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 2,
      name: "Chaos Anime Embroidered T-Shirt",
      price: 1199,
      originalPrice: 1599,
      tag: "BEST SELLER",
      category: "Regular Fit T-Shirts",
      subCategories: ["REGULAR FIT T-SHIRTS", "T-SHIRTS", "TRENDING"],
      gender: "UNISEX",
      image: "/images/products/chaos_anime_tee.png",
      desc: "Inspired by raw urban cyberpunk street style, this high-contrast white t-shirt boasts a fine-line black embroidered anime-style illustration on the back. Perfect for layering.",
      rating: 4.7,
      reviewCount: 38,
      thumbnails: [
        "/images/products/chaos_anime_tee.png",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 3,
      name: "Itachi Uchiha Embroidered T-Shirt",
      price: 1249,
      originalPrice: 1699,
      tag: "TRENDING",
      category: "Oversized T-Shirts",
      subCategories: ["OVERSIZED T-SHIRTS", "T-SHIRTS", "NEW COLLECTIONS"],
      gender: "UNISEX",
      image: "/images/products/itachi_uchiha_tee.png",
      desc: "Featuring the legendary red sharingan eyes and symbolic red clouds embroidered meticulously on the back. Heavy-weight black cotton streetwear fit with premium reinforcement stitches.",
      rating: 4.8,
      reviewCount: 45,
      thumbnails: [
        "/images/products/itachi_uchiha_tee.png",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 4,
      name: "Akatsuki Cloud Embroidered T-Shirt",
      price: 1099,
      originalPrice: 1499,
      tag: "LIMITED EDITION",
      category: "Regular Fit T-Shirts",
      subCategories: ["REGULAR FIT T-SHIRTS", "T-SHIRTS"],
      gender: "UNISEX",
      image: "/images/products/akatsuki_cloud_tee.png",
      desc: "A sleek, minimalist design featuring a small, clean red embroidered Akatsuki cloud on the left chest. Subtle styling with premium-grade embroidery thread for Naruto fans.",
      rating: 4.6,
      reviewCount: 29,
      thumbnails: [
        "/images/products/akatsuki_cloud_tee.png",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 5,
      name: "Earth Moss Baggy Jeans",
      price: 2199,
      originalPrice: 2999,
      tag: "27% OFF",
      category: "Jeans",
      subCategories: ["NEW COLLECTIONS", "TRENDING"],
      gender: "WOMEN",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
      desc: "Premium heavyweight denim utility jeans in earthy moss green. Relaxed baggy fit with multiple deep pockets, contrast stitches, and subtle brand embroidery on the back pocket.",
      rating: 4.7,
      reviewCount: 22,
      thumbnails: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1475180098004-ca77a66827ae?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 6,
      name: "Peach Haze Baggy Jeans",
      price: 2199,
      originalPrice: 2999,
      tag: "27% OFF",
      category: "Jeans",
      subCategories: ["NEW COLLECTIONS", "TRENDING"],
      gender: "WOMEN",
      image: "https://images.unsplash.com/photo-1565084888279-aca607ecad0c?q=80&w=600&auto=format&fit=crop",
      desc: "Chic dusty peach baggy jeans crafted from 100% organic cotton denim. High-rise fit, reinforced belt loops, and premium custom embroidery detail.",
      rating: 4.8,
      reviewCount: 31,
      thumbnails: [
        "https://images.unsplash.com/photo-1565084888279-aca607ecad0c?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 7,
      name: "Tactical Olive Cargos",
      price: 2499,
      originalPrice: 3299,
      tag: "HOT",
      category: "Cargos",
      subCategories: ["NEW COLLECTIONS"],
      gender: "MEN",
      image: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop",
      desc: "Heavy-duty ripstop utility cargos. Feature 6 pockets, adjustable drawstrings, and embroidered streetwear logo detail.",
      rating: 4.9,
      reviewCount: 18,
      thumbnails: [
        "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 8,
      name: "Sandstorm Multi-Pocket Cargos",
      price: 2499,
      originalPrice: 3299,
      tag: "LIMITED",
      category: "Cargos",
      subCategories: ["NEW COLLECTIONS", "TRENDING"],
      gender: "UNISEX",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop",
      desc: "Desert sand utility pants with detailed knee panels, zip compartments, and signature branding embroidery.",
      rating: 4.5,
      reviewCount: 12,
      thumbnails: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 9,
      name: "Pleated Streetwear Skirt",
      price: 1499,
      originalPrice: 1999,
      tag: "NEW",
      category: "Skirts",
      subCategories: ["NEW COLLECTIONS"],
      gender: "WOMEN",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
      desc: "High-waisted pleated tennis skirt featuring a custom embroidered logo along the hemline. Built-in inner shorts for all-day comfort.",
      rating: 4.6,
      reviewCount: 15,
      thumbnails: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 10,
      name: "Signature Comfort Boxers (Set of 3)",
      price: 899,
      originalPrice: 1199,
      tag: "BEST VALUE",
      category: "Underwear",
      subCategories: ["NEW COLLECTIONS"],
      gender: "MEN",
      image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop",
      desc: "Ultra-soft modal cotton underwear with premium elastic waistband and embroidered brand initials.",
      rating: 4.7,
      reviewCount: 42,
      thumbnails: [
        "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 11,
      name: "Cyberpunk Embroidered Button-Up Shirt",
      price: 1599,
      originalPrice: 2199,
      tag: "HOT DROP",
      category: "Shirts",
      subCategories: ["SHIRTS", "TRENDING", "NEW COLLECTIONS"],
      gender: "UNISEX",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
      desc: "Premium structure button-up streetwear shirt featuring detailed cyber-mesh logo embroidery on the collar and back. Heavyweight canvas-like feel.",
      rating: 4.8,
      reviewCount: 19,
      thumbnails: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop"
      ]
    },
    {
      id: 12,
      name: "Sakura Blossom Streetwear Sweatshirt",
      price: 1899,
      originalPrice: 2499,
      tag: "NEW DROP",
      category: "Sweatshirts",
      subCategories: ["SWEATSHIRTS", "NEW COLLECTIONS", "TRENDING"],
      gender: "UNISEX",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
      desc: "Cozy custom pink and white sakura floral branches embroidered meticulously on a heavy black cotton blend sweatshirt.",
      rating: 4.9,
      reviewCount: 26,
      thumbnails: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"
      ]
    }
  ]);

  // Cart Handlers
  const addToCart = (product, size, color, customOptions = null) => {
    const chosenColor = color || 'Black';
    const imageUrl = product.image || (product.images && product.images[0] ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : '') || '/images/products/placeholder.png';
    const cartProduct = { ...product, image: formatImageUrl(imageUrl) };

    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.size === size && 
        (item.color || 'Black') === chosenColor &&
        JSON.stringify(item.customOptions || null) === JSON.stringify(customOptions || null)
      );
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.size === size && (item.color || 'Black') === chosenColor && JSON.stringify(item.customOptions || null) === JSON.stringify(customOptions || null)) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...cartProduct, size, color: chosenColor, quantity: 1, customOptions }];
    });
    setIsCartOpen(true);
  };

  const buyNow = (product, size, color, customOptions = null) => {
    addToCart(product, size, color, customOptions);
    setIsCartOpen(false);
    changeView('checkout');
    scrollToTop();
  };

  const updateQty = (id, size, color, delta, customOptions = null) => {
    setCart(prev => 
      prev.map(item => {
        if (
          item.id === id && 
          item.size === size && 
          (item.color || 'Black') === (color || 'Black') &&
          JSON.stringify(item.customOptions || null) === JSON.stringify(customOptions || null)
        ) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeFromCart = (id, size, color, customOptions = null) => {
    setCart(prev => prev.filter(item => !(
      item.id === id && 
      item.size === size && 
      (item.color || 'Black') === (color || 'Black') &&
      JSON.stringify(item.customOptions || null) === JSON.stringify(customOptions || null)
    )));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  const navigateToProduct = (id) => {
    const y = window.scrollY || document.documentElement.scrollTop || (lenisRef.current ? lenisRef.current.scroll : 0);
    if (y > 0) {
      lastScrollPosition.current = y;
      savedViewState.current[currentView] = {
        scroll: y,
        activeTab,
        activeCustomizationCategory,
        activeEmbroideredCategory,
        activePatchesCategory,
        activeGenderTab,
        activeSubCategory,
        selectedSubCategoryId,
        selectedParentCategoryId,
        selectedCategoryId,
        selectedCategoryName,
        selectedFilterCategoryId
      };
      try {
        sessionStorage.setItem('indiuna_scroll_' + currentView, y.toString());
        sessionStorage.setItem('indiuna_state_' + currentView, JSON.stringify(savedViewState.current[currentView]));
      } catch (e) {}
    }
    isNavigatingToProduct.current = true;
    changeView('product', { productId: id, isCustomizing: false });
    scrollToTop();
    setTimeout(() => {
      isNavigatingToProduct.current = false;
    }, 600);
  };

  const navigateToCustomProduct = (id) => {
    const y = window.scrollY || document.documentElement.scrollTop || (lenisRef.current ? lenisRef.current.scroll : 0);
    if (y > 0) {
      lastScrollPosition.current = y;
      savedViewState.current[currentView] = {
        scroll: y,
        activeTab,
        activeCustomizationCategory,
        activeEmbroideredCategory,
        activePatchesCategory,
        activeGenderTab,
        activeSubCategory,
        selectedSubCategoryId,
        selectedParentCategoryId,
        selectedCategoryId,
        selectedCategoryName,
        selectedFilterCategoryId
      };
      try {
        sessionStorage.setItem('indiuna_scroll_' + currentView, y.toString());
        sessionStorage.setItem('indiuna_state_' + currentView, JSON.stringify(savedViewState.current[currentView]));
      } catch (e) {}
    }
    isNavigatingToProduct.current = true;
    changeView('product', { productId: id, isCustomizing: true });
    scrollToTop();
    setTimeout(() => {
      isNavigatingToProduct.current = false;
    }, 600);
  };

  const handleCategoryClick = (cat) => {
    const redirect = String(cat?.redirectTo || cat?.redirect_to || '').toLowerCase().trim();
    const nameUpper = String(cat?.name || cat?.filter || '').toUpperCase().trim();
    const slugLower = String(cat?.slug || '').toLowerCase().trim();

    if (redirect === 'customization' || nameUpper.includes('CUSTOMIZ') || slugLower.includes('customiz')) {
      changeView('customization');
      scrollToTop();
      return;
    }
    
    if (redirect === 'embroidered' || nameUpper.includes('EMBROIDER') || slugLower.includes('embroider')) {
      changeView('embroidered');
      scrollToTop();
      return;
    }
    
    if (redirect === 'patches' || nameUpper.includes('PATCH') || slugLower.includes('patch')) {
      changeView('patches');
      scrollToTop();
      return;
    }

    if (redirect === 'home') {
      changeView('home');
      scrollToTop();
      return;
    }

    if (redirect === 'new-arrivals') {
      changeView('home');
      setTimeout(() => document.getElementById('new-arrivals-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    // Default fallback for any category: route to customization page
    changeView('customization');
    scrollToTop();
  };

  const activeProduct = products.find(p => String(p.id) === String(activeProductId)) || products[0];

  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);

  return (
    <>
      <div className={`page-loader ${!isLoading ? 'fade-out' : ''}`}>
        <div className="loader-inner">
          <div className="loader-brand">
            {'INDIUNA'.split('').map((letter, i) => (
              <span key={i} className="loader-letter" style={{ animationDelay: `${i * 0.08}s` }}>
                {letter}
              </span>
            ))}
          </div>
          <p className="loader-tagline">EMBROIDERY &amp; CUSTOMS</p>
          <div className="loader-bar">
            <div className="loader-bar-fill"></div>
          </div>
        </div>
      </div>

      {!isFullscreenImageOpen && (
        <div className="announcement-bar">
          <div className="container announcement-bar-content">
            <div className={`announcement-bar-item ${currentAnnouncement === 0 ? 'active' : ''}`}>
              <Percent /> 10% CASHBACK ON ALL APP ORDERS
            </div>
            <div className="announcement-bar-divider"></div>
            <div className={`announcement-bar-item ${currentAnnouncement === 1 ? 'active' : ''}`}>
              <RotateCcw /> 30 DAYS EASY RETURNS & EXCHANGES
            </div>
            <div className="announcement-bar-divider"></div>
            <div className={`announcement-bar-item ${currentAnnouncement === 2 ? 'active' : ''}`}>
              <Truck /> FREE & FAST SHIPPING PAN INDIA
            </div>
          </div>
        </div>
      )}

      {!isFullscreenImageOpen && (
        <header className="header">
          <div className="container navbar">
            <div className="header-left-group">
              <button className="menu-toggle" aria-label="Open Menu" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu />
              </button>
              
              <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => { changeView('home'); scrollToTop(); }}>
                <img src="/images/Picsart_26-04-22_14-06-19-641.png" alt="INDIUNA Logo" className="logo-img" />
              </div>
            </div>



            <div className="nav-actions">
              <button className="nav-action-btn" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
                <Search size={20} />
              </button>
              {token && user ? (
                <button 
                  className="nav-action-btn user-btn" 
                  aria-label="Profile" 
                  onClick={() => changeView('profile')}
                  title={`Logged in as ${user.first_name || 'User'}`}
                >
                  <User size={20} />
                  <span className="user-name-label">{user.first_name || 'Profile'}</span>
                </button>
              ) : (
                <button 
                  className="nav-action-btn" 
                  aria-label="Account" 
                  onClick={() => changeView('auth')}
                >
                  <User size={20} />
                </button>
              )}
              <button 
                className="nav-action-btn" 
                aria-label="Wishlist"
                onClick={() => {
                  changeView('wishlist');
                  scrollToTop();
                }}
              >
                <Heart size={20} />
                {wishlist.length > 0 && <span className="cart-badge">{wishlist.length}</span>}
              </button>
              <button className="nav-action-btn" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={20} />
                {cart.length > 0 && <span className="cart-badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
              </button>
            </div>
          </div>
        </header>
      )}

      {!isFullscreenImageOpen && ['home', 'customization', 'embroidered', 'patches'].includes(currentView) && (
        <div className="sub-navbar">
          <div className="sub-navbar-track container">
            <button 
              className={`sub-navbar-tab ${currentView === 'customization' ? 'active' : ''}`}
              onClick={() => { changeView('customization'); scrollToTop(); }}
            >
              <Scissors size={15} />
              <span>CUSTOMIZATION</span>
            </button>
            <button 
              className={`sub-navbar-tab ${currentView === 'embroidered' ? 'active' : ''}`}
              onClick={() => { changeView('embroidered'); scrollToTop(); }}
            >
              <Shirt size={15} />
              <span>EMBROIDERED APPAREL</span>
            </button>
            <button 
              className={`sub-navbar-tab ${currentView === 'patches' ? 'active' : ''}`}
              onClick={() => { changeView('patches'); scrollToTop(); }}
            >
              <FolderHeart size={15} />
              <span>PATCHES</span>
            </button>
          </div>
        </div>
      )}

      {currentView === 'home' ? (
        <>
          <section className="custom-hero-section">
            {(() => {
              const dbHeroBanners = dbBanners.filter(b => (b.position === 'home_hero' || !b.position) && b.is_active !== false);
              const activeHeroSlides = dbHeroBanners.length > 0
                ? dbHeroBanners.map(b => ({
                    image: formatImageUrl(b.image_url),
                    tag: b.subtitle || 'Premium Embroidered',
                    title: b.title || 'Streetwear Crafted\nto Stand Out.',
                    cta: b.link_text || 'Shop Now'
                  }))
                : [
                    {
                      image: '/images/hero_banner.png',
                      tag: 'Premium Embroidered',
                      title: 'Streetwear Crafted\nto Stand Out.',
                      cta: 'Shop New Arrivals'
                    },
                    {
                      image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1400&auto=format&fit=crop',
                      tag: 'Limited Drop',
                      title: 'Artistry in\nEvery Stitch.',
                      cta: 'Explore Drop'
                    },
                    {
                      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1400&auto=format&fit=crop',
                      tag: 'Custom Customs',
                      title: 'Your Design,\nOur Craft.',
                      cta: 'Start Designing'
                    }
                  ];
              
              const activeIndex = currentSlide % activeHeroSlides.length;

              return (
                <>
                  {activeHeroSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      className={`hero-slide ${activeIndex === idx ? 'active' : ''}`}
                    >
                      <div
                        className="hero-slide-bg"
                        style={{ backgroundImage: `url('${slide.image}')` }}
                      />
                      <div className="hero-slide-overlay" />
                      <div className="hero-slide-content container">
                        <span className="hero-slide-tag">{slide.tag}</span>
                        <h1 className="hero-slide-title">
                          {(slide.title || '').split('\n').map((line, li) => (
                            <span key={li}>{line}<br /></span>
                          ))}
                        </h1>
                        <button className="hero-slide-cta">{slide.cta}</button>
                      </div>
                    </div>
                  ))}
                  <div className="hero-dots">
                    {activeHeroSlides.map((_, i) => (
                      <button
                        key={i}
                        className={`hero-dot ${activeIndex === i ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(i)}
                        aria-label={`Slide ${i+1}`}
                      />
                    ))}
                  </div>
                </>
              );
            })()}
          </section>

          <TrustBadges />

          <section className="categories-section container" id="categories-section">
            <h2 className="categories-main-title">CATEGORIES</h2>
            <div className="categories-grid-new">
              {(() => {
                const homeCats = dbCategories.filter(c => (c.is_active !== false && String(c.is_active) !== '0') && (!c.show_in_pages || c.show_in_pages.split(',').includes('home')));
                const displayHomeCats = homeCats.length > 0 ? homeCats.map(c => ({
                  id: c.id,
                  name: c.name,
                  img: formatImageUrl(c.image),
                  filter: (c.name || '').toUpperCase(),
                  redirect_to: c.redirect_to,
                  gender: c.gender
                })) : [
                  { name: "CUSTOMIZATION", img: "/images/hero_banner.png", redirect_to: "customization" },
                  { name: "EMBROIDERED APPAREL", img: "/images/products/peach_haze_jeans.png", redirect_to: "embroidered" },
                  { name: "PATCHES", img: "/images/streetwear_culture.png", redirect_to: "patches" }
                ];
                return displayHomeCats.map((cat, i) => (
                  <div
                    key={i}
                    className="category-item-card-new"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    <div className="category-image-wrapper-new">
                      <img src={cat.img} alt={cat.name} className="category-image-new" />
                    </div>
                    <h4 className="category-item-title-new">{cat.name}</h4>
                  </div>
                ));
              })()}
            </div>
          </section>

          <section className="fresh-drops-section container">
            <h2 className="section-title-new">Fresh Drops</h2>
            <div 
              className="fresh-drops-slider-container"
              onTouchStart={handleFreshTouchStart}
              onTouchMove={handleFreshTouchMove}
              onTouchEnd={handleFreshTouchEnd}
              onWheel={handleFreshWheel}
            >
              {[
                {
                  name: "Demon Mask Embroidered Oversized Tee",
                  image: "/images/hero_banner.png",
                  productId: 1
                },
                {
                  name: "Chaos Anime Embroidered T-Shirt",
                  image: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1200&auto=format&fit=crop",
                  productId: 2
                },
                {
                  name: "Sakura Blossom Streetwear Sweatshirt",
                  image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop",
                  productId: 12
                }
              ].map((slide, idx) => (
                <div 
                  key={idx} 
                  className={`fresh-drops-slide ${freshDropsSlide === idx ? 'active' : ''}`}
                  onClick={() => navigateToProduct(slide.productId)}
                >
                  <div 
                    className="fresh-drops-image" 
                    style={{ backgroundImage: `url('${slide.image}')` }}
                  ></div>
                  <div className="fresh-drops-content">
                    <h3 className="fresh-drops-title">{slide.name}</h3>
                    <button className="fresh-drops-cta">Shop Now &rarr;</button>
                  </div>
                  <div className="fresh-drops-dots-overlay">
                    {[0, 1, 2].map((dotIdx) => (
                      <span 
                        key={dotIdx} 
                        className={`fresh-drops-dot ${freshDropsSlide === dotIdx ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFreshDropsSlide(dotIdx);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="new-arrivals-section" id="new-arrivals-section">
            <div className="container">
              <h2 className="section-title-new">New Arrivals</h2>
            </div>
            
            <div 
              className="new-arrivals-carousel-outer"
              style={{ cursor: 'grab' }}
              onTouchStart={handleArrivalsTouchStart}
              onTouchMove={handleArrivalsTouchMove}
              onTouchEnd={handleArrivalsTouchEnd}
              onWheel={handleArrivalsWheel}
              onMouseDown={handleArrivalsMouseDown}
              onMouseMove={handleArrivalsMouseMove}
              onMouseUp={handleArrivalsMouseUp}
              onMouseLeave={handleArrivalsMouseLeave}
            >
              <div className="new-arrivals-carousel-viewport">
                <div 
                  className="new-arrivals-carousel-track-pop"
                  style={{ 
                    '--active-index': newArrivalsIndex,
                    ...(newArrivalsNoAnim ? { transition: 'none' } : {})
                  }}
                >
                  {(() => {
                    const uniqueNew = products.slice(0, 30);
                    let list = [...uniqueNew];
                    while (list.length < 30 && products.length > 0) {
                      list = list.concat(products.slice(0, 30 - list.length));
                    }
                    return list.slice(0, 30);
                  })().map((targetProduct, idx) => {
                    const isActive = idx === newArrivalsIndex;
                    return (
                      <div 
                        key={idx} 
                        className={`new-arrival-item-card-pop ${isActive ? 'active' : ''}`}
                        onClick={() => navigateToProduct(targetProduct.id)}
                      >
                        <div className="new-arrival-image-wrapper">
                          <img src={targetProduct.image} alt={targetProduct.name} className="new-arrival-image" />
                          <span className="new-arrival-badge">{targetProduct.tag}</span>
                        </div>
                        <div className="new-arrival-details">
                          <h4 className="new-arrival-name">{targetProduct.name}</h4>
                          <span className="new-arrival-price">₹{targetProduct.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="new-arrivals-pagination-dots">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((dotIndex) => (
                <button 
                  key={dotIndex}
                  className={`new-arrivals-pagination-dot ${((newArrivalsIndex % 10) + 10) % 10 === dotIndex ? 'active' : ''}`}
                  onClick={() => setNewArrivalsIndex(10 + dotIndex)}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                />
              ))}
            </div>
          </section>



          <section className="how-it-works reveal-section" style={{ paddingTop: '40px' }}>
            <div className="container">
              <div className="section-header" style={{ justifyContent: 'center', marginBottom: '50px' }}>
                <h2 className="section-title">How It Works</h2>
              </div>
              <div className="how-grid">
                <div className="how-step">
                  <div className="how-step-header">
                    <span className="how-step-number">01</span>
                    <div className="how-step-icon"><Shirt /></div>
                  </div>
                  <h3 className="how-step-title">Choose</h3>
                  <p className="how-step-desc">Pick your product and customize details.</p>
                </div>
                <div className="how-connector"><ChevronRight /></div>
                <div className="how-step">
                  <div className="how-step-header">
                    <span className="how-step-number">02</span>
                    <div className="how-step-icon"><Upload /></div>
                  </div>
                  <h3 className="how-step-title">Design</h3>
                  <p className="how-step-desc">Upload your logo or original artwork.</p>
                </div>
                <div className="how-connector"><ChevronRight /></div>
                <div className="how-step">
                  <div className="how-step-header">
                    <span className="how-step-number">03</span>
                    <div className="how-step-icon"><Cpu /></div>
                  </div>
                  <h3 className="how-step-title">We Craft</h3>
                  <p className="how-step-desc">Our team digitizes and embroiders your masterpiece.</p>
                </div>
                <div className="how-connector"><ChevronRight /></div>
                <div className="how-step">
                  <div className="how-step-header">
                    <span className="how-step-number">04</span>
                    <div className="how-step-icon"><Truck /></div>
                  </div>
                  <h3 className="how-step-title">Delivered</h3>
                  <p className="how-step-desc">Fast and safe delivery straight to your doorstep.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="testimonials-section container reveal-section">
            <div className="section-header" style={{ justifyContent: 'center', marginBottom: '48px' }}>
              <h2 className="section-title">What Our Customers Say</h2>
            </div>
            <div className="testimonials-grid">
              {[
                { name: "Arjun Mehta", location: "Mumbai", rating: 5, text: "Absolutely blown away by the quality! The embroidery on my oversized tee is insanely detailed. Got so many compliments the first time I wore it.", product: "Demon Mask Oversized Tee", avatar: "AM" },
                { name: "Priya Sharma", location: "Delhi", rating: 5, text: "Ordered a custom embroidery for my pet's portrait and it turned out flawless. The fabric is super soft and the stitching is perfect. Will definitely order again!", product: "Custom Pet Embroidery", avatar: "PS" },
                { name: "Rohan Kapoor", location: "Bangalore", rating: 5, text: "Fast shipping, premium packaging, and the product quality exceeded expectations. This is what streetwear should feel like. 10/10 brand.", product: "Chaos Anime Embroidered Tee", avatar: "RK" },
                { name: "Sneha Patel", location: "Ahmedabad", rating: 5, text: "Got matching custom sweatshirts for our squad and everyone loves them. The embroidery stayed perfect even after multiple washes!", product: "Custom Sweatshirt", avatar: "SP" },
                { name: "Vikram Singh", location: "Pune", rating: 5, text: "The attention to detail on the patches is insane. I use them on everything — jackets, bags, caps. Great price for such premium quality.", product: "Custom Patches", avatar: "VS" },
                { name: "Ananya Roy", location: "Kolkata", rating: 5, text: "Finally a desi brand that delivers on its promises. The sizing is perfect, the GSM is heavy and premium, and the embroidery is chef's kiss!", product: "Regular Fit Embroidered Tee", avatar: "AR" }
              ].map((review, i) => (
                <div key={i} className="testimonial-card">
                  <div className="testimonial-stars">
                    {Array.from({ length: review.rating }).map((_, si) => (
                      <svg key={si} viewBox="0 0 24 24" fill="#ff2e93" width="16" height="16">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="testimonial-text">"{review.text}"</p>
                  <div className="testimonial-footer">
                    <div className="testimonial-avatar">{review.avatar}</div>
                    <div className="testimonial-author-info">
                      <span className="testimonial-name">{review.name}</span>
                      <span className="testimonial-location">{review.location} &middot; {review.product}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="instagram-section container reveal-section">
            <div className="insta-header">
              <h2 className="section-title">Follow @Indiuna</h2>
              <p className="insta-subtitle">For Daily Style Inspo</p>
            </div>
            <div className="insta-grid">
              {[
                { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop", tag: "#INDIUNA" },
                { url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop", tag: "#STREETWEAR" },
                { url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop", tag: "#EMBROIDERY" },
                { url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop", tag: "#CHAOS" },
                { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop", tag: "#OVERSIZED" },
                { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop", tag: "#STYLE" }
              ].map((item, i) => (
                <div className="insta-item polaroid-card" key={i}>
                  <div className="polaroid-img-frame">
                    <img src={item.url} alt={`Insta style ${i+1}`} className="insta-item-img" />
                    <div className="insta-overlay">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </div>
                  </div>
                  <span className="polaroid-caption">{item.tag}</span>
                </div>
              ))}
            </div>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="btn-insta-follow">
              View On Instagram
            </a>
          </section>
        </>
      ) : currentView === 'customization' ? (
        <CustomizationLandingPage 
          products={products}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onNavigateProduct={navigateToCustomProduct}
          onGoHome={() => { changeView('home'); scrollToTop(); }}
          dbCategories={dbCategories}
          dbBanners={dbBanners}
          onCategoryClick={handleCategoryClick}
          activeCategory={activeCustomizationCategory}
          setActiveCategory={setActiveCustomizationCategory}
        />
      ) : currentView === 'embroidered' ? (
        <EmbroideredLandingPage 
          products={products}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onNavigateProduct={navigateToProduct}
          onGoHome={() => { changeView('home'); scrollToTop(); }}
          dbCategories={dbCategories}
          dbBanners={dbBanners}
          onCategoryClick={handleCategoryClick}
          activeCategory={activeEmbroideredCategory}
          setActiveCategory={setActiveEmbroideredCategory}
        />
      ) : currentView === 'patches' ? (
        <PatchesLandingPage 
          products={products}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onNavigateProduct={navigateToProduct}
          onGoHome={() => { changeView('home'); scrollToTop(); }}
          dbCategories={dbCategories}
          dbBanners={dbBanners}
          onCategoryClick={handleCategoryClick}
          activeCategory={activePatchesCategory}
          setActiveCategory={setActivePatchesCategory}
        />
      ) : currentView === 'profile' ? (
        <ProfilePage 
          user={user}
          token={token}
          API_BASE={API_BASE}
          wishlist={wishlist}
          products={products}
          toggleWishlist={toggleWishlist}
          activeTab={profileTab}
          setActiveTab={setProfileTab}
          addresses={userAddresses}
          setAddresses={setUserAddresses}
          orders={userOrders}
          setOrders={setUserOrders}
          orderLoading={orderLoading}
          setOrderLoading={setOrderLoading}
          addressLoading={addressLoading}
          setAddressLoading={setAddressLoading}
          onLogout={handleLogout}
          onNavigateProduct={navigateToProduct}
          onGoHome={() => { changeView('home'); scrollToTop(); }}
        />
      ) : currentView === 'wishlist' ? (
        <WishlistPage 
          products={products}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onNavigateProduct={navigateToProduct}
          onGoHome={() => { changeView('home'); scrollToTop(); }}
          addToCart={addToCart}
        />
      ) : currentView === 'auth' ? (
        <AuthPage 
          authTab={authTab}
          setAuthTab={setAuthTab}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authConfirmPassword={authConfirmPassword}
          setAuthConfirmPassword={setAuthConfirmPassword}
          authFirstName={authFirstName}
          setAuthFirstName={setAuthFirstName}
          authLastName={authLastName}
          setAuthLastName={setAuthLastName}
          authPhone={authPhone}
          setAuthPhone={setAuthPhone}
          authError={authError}
          setAuthError={setAuthError}
          authLoading={authLoading}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          API_BASE={API_BASE}
          onGoHome={() => { changeView('home'); scrollToTop(); }}
        />
      ) : currentView === 'checkout' ? (
        <CheckoutPage 
          cart={cart}
          setCart={setCart}
          products={products}
          user={user}
          token={token}
          API_BASE={API_BASE}
          onGoHome={() => { changeView('home'); scrollToTop(); }}
          onBack={() => {
            const target = previousView || 'home';
            changeView(target);
            if (target === 'product') {
              scrollToTop();
            } else {
              restorePreviousScroll(target);
            }
          }}
          onClearCart={() => setCart([])}
        />
      ) : ['track-order','returns','shipping','size-guide','faqs','story','quality'].includes(currentView) ? (
        <InfoPage 
          view={currentView}
          onBack={() => {
            const target = previousView || 'home';
            changeView(target);
            restorePreviousScroll(target);
          }}
          onChangeView={(v) => { changeView(v); scrollToTop(); }}
        />
      ) : (
        <ProductDetailPage 
          product={activeProduct} 
          products={products}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          buyNow={buyNow}
          onBack={() => {
            const target = previousView || 'home';
            changeView(target);
            restorePreviousScroll(target);
          }}
          onNavigateProduct={navigateToProduct}
          API_BASE={API_BASE}
          token={token}
          user={user}
          isCustomizing={isCustomizing}
          setCurrentView={(v) => changeView(v)}
          onFullscreenToggle={setIsFullscreenImageOpen}
        />
      )}

      <section className="newsletter-bar">
        <div className="container newsletter-content">
          <div className="newsletter-info">
            <h2 className="newsletter-title">Join The Indiuna Crew</h2>
            <p className="newsletter-subtitle">Get exclusive offers, new drops &amp; customization deals.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="newsletter-input"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">
              {newsletterSubscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand-column">
            <div className="logo-container" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'flex-start' }} onClick={() => { changeView('home'); scrollToTop(); }}>
              <img src="/images/Picsart_26-04-22_14-06-19-641.png" alt="INDIUNA Logo" style={{ height: 'auto', maxHeight: '100px', maxWidth: '280px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <p className="footer-desc">Premium custom embroidery &amp; structured streetwear styles. Crafted in-house, designed for the bold.</p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook"><Smile /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Youtube"><Play /></a>
            </div>
          </div>

          <div>
            <h4 className="footer-column-title">Shop</h4>
            <ul className="footer-links">
              <li><a href="#new" onClick={(e) => { e.preventDefault(); setSelectedCategoryId(null); setActiveSubCategory('ALL'); changeView('home'); scrollToTop(); setTimeout(() => document.getElementById('new-arrivals-section')?.scrollIntoView({ behavior: 'smooth' }), 200); }}>New In</a></li>
              <li><a href="#t-shirts" onClick={(e) => { e.preventDefault(); setSelectedCategoryId(null); setActiveSubCategory('T-SHIRTS'); setActiveGenderTab('ALL'); changeView('home'); scrollToTop(); setTimeout(() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200); }}>T-Shirts</a></li>
              <li><a href="#shirts" onClick={(e) => { e.preventDefault(); setSelectedCategoryId(null); setActiveSubCategory('SHIRTS'); setActiveGenderTab('ALL'); changeView('home'); scrollToTop(); setTimeout(() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200); }}>Shirts</a></li>
              <li><a href="#sweatshirts" onClick={(e) => { e.preventDefault(); setSelectedCategoryId(null); setActiveSubCategory('SWEATSHIRTS'); setActiveGenderTab('ALL'); changeView('home'); scrollToTop(); setTimeout(() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200); }}>Hoodies &amp; Sweatshirts</a></li>
              <li><a href="#patches" onClick={(e) => { e.preventDefault(); changeView('patches'); scrollToTop(); }}>Patches</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Customization</h4>
            <ul className="footer-links">
              <li><a href="#logo" onClick={(e) => { e.preventDefault(); changeView('customization'); scrollToTop(); }}>Logo Embroidery</a></li>
              <li><a href="#pet" onClick={(e) => { e.preventDefault(); changeView('customization'); scrollToTop(); }}>Pet Embroidery</a></li>
              <li><a href="#portrait" onClick={(e) => { e.preventDefault(); changeView('customization'); scrollToTop(); }}>Portrait Embroidery</a></li>
              <li><a href="#vehicle" onClick={(e) => { e.preventDefault(); changeView('customization'); scrollToTop(); }}>Vehicle Embroidery</a></li>
              <li><a href="#custom-patches" onClick={(e) => { e.preventDefault(); changeView('patches'); scrollToTop(); }}>Custom Patches</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Help</h4>
            <ul className="footer-links">
              <li><a href="#track" onClick={(e) => { e.preventDefault(); changeView('track-order'); scrollToTop(); }}>Track Order</a></li>
              <li><a href="#returns" onClick={(e) => { e.preventDefault(); changeView('returns'); scrollToTop(); }}>Returns &amp; Exchanges</a></li>
              <li><a href="#shipping" onClick={(e) => { e.preventDefault(); changeView('shipping'); scrollToTop(); }}>Shipping Policy</a></li>
              <li><a href="#size" onClick={(e) => { e.preventDefault(); changeView('size-guide'); scrollToTop(); }}>Size Guide</a></li>
              <li><a href="#faqs" onClick={(e) => { e.preventDefault(); changeView('faqs'); scrollToTop(); }}>FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">About</h4>
            <ul className="footer-links">
              <li><a href="#story" onClick={(e) => { e.preventDefault(); changeView('story'); scrollToTop(); }}>Our Story</a></li>
              <li><a href="#quality" onClick={(e) => { e.preventDefault(); changeView('quality'); scrollToTop(); }}>Quality &amp; Fabrics</a></li>
            </ul>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>&copy; {new Date().getFullYear()} INDIUNA. All Rights Reserved.</span>
          <span className="footer-dev-credit">
            Developed by{' '}
            <a href="https://qubnixtechnology.com/" target="_blank" rel="noopener noreferrer" className="footer-dev-link">
              Qubnix Technology
            </a>
          </span>
          <div className="footer-bottom-links">
            <a href="#terms" onClick={(e) => { e.preventDefault(); setCurrentView('returns'); scrollToTop(); }}>Terms &amp; Conditions</a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); setCurrentView('shipping'); scrollToTop(); }}>Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* Search Overlay Modal */}
      {isSearchOpen && createPortal(
        <div 
          className="search-modal-overlay animate-fade-in"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="search-modal-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Input */}
            <div className="search-modal-header">
              <Search size={22} style={{ color: '#e11d48', flexShrink: 0 }} />
              <input
                type="text"
                className="search-modal-input"
                placeholder="Search products, anime, embroidery, patches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: '#475569',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                Close
              </button>
            </div>

            {/* Content / Live Results */}
            <div className="search-modal-body">
              {!searchQuery.trim() ? (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Popular Searches
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Oversized Tee', 'Demon Mask', 'Itachi', 'Anime Embroidery', 'Patches', 'Sweatshirt', 'Jeans'].map((tag, i) => (
                      <button
                        key={i}
                        className="search-chip-btn"
                        onClick={() => setSearchQuery(tag)}
                      >
                        🔍 {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                (() => {
                  const query = searchQuery.trim().toLowerCase();
                  const results = products.filter(p => 
                    p.name.toLowerCase().includes(query) ||
                    (p.category || '').toLowerCase().includes(query) ||
                    (p.desc || '').toLowerCase().includes(query) ||
                    (p.subCategories || []).some(sub => sub.toLowerCase().includes(query)) ||
                    (p.tags || []).some(tag => String(tag).toLowerCase().includes(query))
                  );

                  if (results.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        <p style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>No products found for "{searchQuery}"</p>
                        <p style={{ fontSize: '0.88rem' }}>Try searching for "Oversized", "Anime", "Demon", or "Patches"</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        Products Found ({results.length})
                      </div>
                      {results.map((product) => (
                        <div
                          key={product.id}
                          className="search-result-row"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            navigateToProduct(product.id);
                          }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="search-result-img"
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase' }}>{product.category}</span>
                            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '2px 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {product.name}
                            </h5>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <button
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              backgroundColor: '#e11d48',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 15. Slideout Cart Drawer */}
      <div 
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      >
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="cart-drawer-header">
            <h3 className="cart-drawer-title">Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</h3>
            <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
              <X />
            </button>
          </div>

          <div className="cart-drawer-body">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBag />
                <p>Your cart is empty.</p>
                <button className="btn-solid-red" onClick={() => setIsCartOpen(false)}>Continue Shopping</button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div className="cart-item" key={`${item.id}-${item.size}-${item.color || 'Black'}-${idx}`}>
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.name}</h4>
                    <span className="cart-item-meta">Size: {item.size} | Color: {item.color || 'Black'}</span>
                    {item.customOptions && (
                      <div className="cart-item-custom-details" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '6px', borderLeft: '2px solid #e11d48', paddingLeft: '8px' }}>
                        {item.customOptions.photoUrl && (
                          <div style={{ marginBottom: '2px' }}>
                            Photo: <a href={item.customOptions.photoUrl} target="_blank" rel="noreferrer" style={{ color: '#e11d48', textDecoration: 'underline', fontWeight: 600 }}>View Image</a>
                          </div>
                        )}
                        {item.customOptions.embroiderySize && <div style={{ marginBottom: '2px' }}>Embroidery: {item.customOptions.embroiderySize}</div>}
                        {item.customOptions.placement && <div>Placement: {item.customOptions.placement}</div>}
                      </div>
                    )}
                    <div className="cart-item-qty" style={{ marginTop: '8px' }}>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.size, item.color, -1, item.customOptions)}><Minus size={12} /></button>
                      <span>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.size, item.color, 1, item.customOptions)}><Plus size={12} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id, item.size, item.color, item.customOptions)}><X size={16} /></button>
                    <span className="cart-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-drawer-footer">
              <div className="cart-summary-line">
                <span>Subtotal</span>
                <span className="cart-summary-total">₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
              <button 
                className="checkout-btn" 
                onClick={() => {
                  setIsCartOpen(false);
                  changeView('checkout');
                  scrollToTop();
                }}
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 16. Quick View Product Modal (kept for legacy catalog triggers) */}
      <div 
        className={`quickview-overlay ${selectedProduct ? 'open' : ''}`}
        onClick={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="quickview-close" onClick={() => setSelectedProduct(null)}>
              <X />
            </button>
            <div className="quickview-gallery">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>
            <div className="quickview-details">
              <h3 className="quickview-title">{selectedProduct.name}</h3>
              <span className="quickview-price">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
              <p className="quickview-desc">{selectedProduct.desc}</p>
              
              <div>
                <h4 className="quickview-option-title">Select Size</h4>
                <div className="quickview-sizes">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button 
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="add-to-cart-btn"
                onClick={() => {
                  addToCart(selectedProduct, selectedSize);
                  setSelectedProduct(null);
                }}
              >
                Add To Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 17. Slideout Mobile Menu Drawer */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); scrollToTop(); }}>
              <img src="/images/Picsart_26-04-22_14-06-19-641.png" alt="INDIUNA Logo" style={{ height: 'auto', maxHeight: '75px', maxWidth: '220px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
              <X />
            </button>
          </div>
          <div className="mobile-menu-body">
            <nav className="mobile-nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#home" onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); scrollToTop(); }} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>Home</a>
              
              {/* Customization Main Category with Dropdown */}
              <div className="mobile-nav-dropdown-item" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === 'customization' ? null : 'customization')}
                >
                  <a 
                    href="#customization" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      e.preventDefault(); 
                      setActiveCustomizationCategory('All');
                      setIsMobileMenuOpen(false); 
                      setCurrentView('customization'); 
                      scrollToTop(); 
                    }} 
                    style={{ flex: 1, textDecoration: 'none', color: 'inherit', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em' }}
                  >
                    CUSTOMIZATION
                  </a>
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setOpenMobileDropdown(openMobileDropdown === 'customization' ? null : 'customization'); 
                    }}
                    style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-dark)' }}
                  >
                    {openMobileDropdown === 'customization' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
                {openMobileDropdown === 'customization' && (
                  <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid var(--color-primary, #ff2e93)', margin: '4px 0 12px 6px' }}>
                    <a 
                      href="#customization-all" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setActiveCustomizationCategory('All'); 
                        setIsMobileMenuOpen(false); 
                        setCurrentView('customization'); 
                        scrollToTop(); 
                      }}
                      style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)', fontWeight: 600, padding: '4px 0', textDecoration: 'none' }}
                    >
                      All Customization
                    </a>
                    {(customizationCats.length > 0 ? customizationCats : [
                      { id: 'custom-jackets', name: 'Custom Jackets' },
                      { id: 'custom-hoodies', name: 'Custom Hoodies' },
                      { id: 'custom-tees', name: 'Custom T-Shirts' },
                      { id: 'custom-caps', name: 'Custom Caps' }
                    ]).map(cat => (
                      <a 
                        key={cat.id} 
                        href={`#cat-${cat.id}`}
                        onClick={(e) => { 
                          e.preventDefault();
                          setActiveCustomizationCategory(cat.id ? String(cat.id) : cat.name); 
                          setIsMobileMenuOpen(false); 
                          setCurrentView('customization'); 
                          scrollToTop();
                        }}
                        style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', padding: '4px 0', textDecoration: 'none' }}
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Embroidered Apparel Main Category with Dropdown */}
              <div className="mobile-nav-dropdown-item" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === 'embroidered' ? null : 'embroidered')}
                >
                  <a 
                    href="#embroidered" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      e.preventDefault(); 
                      setActiveEmbroideredCategory('All');
                      setIsMobileMenuOpen(false); 
                      setCurrentView('embroidered'); 
                      scrollToTop(); 
                    }} 
                    style={{ flex: 1, textDecoration: 'none', color: 'inherit', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em' }}
                  >
                    EMBROIDERED APPAREL
                  </a>
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setOpenMobileDropdown(openMobileDropdown === 'embroidered' ? null : 'embroidered'); 
                    }}
                    style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-dark)' }}
                  >
                    {openMobileDropdown === 'embroidered' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
                {openMobileDropdown === 'embroidered' && (
                  <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid var(--color-primary, #ff2e93)', margin: '4px 0 12px 6px' }}>
                    <a 
                      href="#embroidered-all" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setActiveEmbroideredCategory('All'); 
                        setIsMobileMenuOpen(false); 
                        setCurrentView('embroidered'); 
                        scrollToTop(); 
                      }}
                      style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)', fontWeight: 600, padding: '4px 0', textDecoration: 'none' }}
                    >
                      All Embroidered
                    </a>
                    {(embroideredCats.length > 0 ? embroideredCats : [
                      { id: 'emb-tshirts', name: 'Embroidered T-Shirts' },
                      { id: 'emb-hoodies', name: 'Embroidered Hoodies' },
                      { id: 'emb-sweatshirts', name: 'Embroidered Sweatshirts' },
                      { id: 'emb-jackets', name: 'Embroidered Jackets' }
                    ]).map(cat => (
                      <a 
                        key={cat.id} 
                        href={`#cat-${cat.id}`}
                        onClick={(e) => { 
                          e.preventDefault();
                          setActiveEmbroideredCategory(cat.id ? String(cat.id) : cat.name); 
                          setIsMobileMenuOpen(false); 
                          setCurrentView('embroidered'); 
                          scrollToTop();
                        }}
                        style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', padding: '4px 0', textDecoration: 'none' }}
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Patches Main Category with Dropdown */}
              <div className="mobile-nav-dropdown-item" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}
                  onClick={() => setOpenMobileDropdown(openMobileDropdown === 'patches' ? null : 'patches')}
                >
                  <a 
                    href="#patches" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      e.preventDefault(); 
                      setActivePatchesCategory('All');
                      setIsMobileMenuOpen(false); 
                      setCurrentView('patches'); 
                      scrollToTop(); 
                    }} 
                    style={{ flex: 1, textDecoration: 'none', color: 'inherit', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em' }}
                  >
                    PATCHES
                  </a>
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setOpenMobileDropdown(openMobileDropdown === 'patches' ? null : 'patches'); 
                    }}
                    style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-dark)' }}
                  >
                    {openMobileDropdown === 'patches' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
                {openMobileDropdown === 'patches' && (
                  <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid var(--color-primary, #ff2e93)', margin: '4px 0 12px 6px' }}>
                    <a 
                      href="#patches-all" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setActivePatchesCategory('All'); 
                        setIsMobileMenuOpen(false); 
                        setCurrentView('patches'); 
                        scrollToTop(); 
                      }}
                      style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)', fontWeight: 600, padding: '4px 0', textDecoration: 'none' }}
                    >
                      All Patches
                    </a>
                    {(patchesCats.length > 0 ? patchesCats : [
                      { id: 'iron-on-patches', name: 'Iron-On Patches' },
                      { id: 'chenille-patches', name: 'Chenille Patches' },
                      { id: 'custom-patches', name: 'Custom Patches' },
                      { id: 'velcro-patches', name: 'Velcro Patches' }
                    ]).map(cat => (
                      <a 
                        key={cat.id} 
                        href={`#cat-${cat.id}`}
                        onClick={(e) => { 
                          e.preventDefault();
                          setActivePatchesCategory(cat.id ? String(cat.id) : cat.name); 
                          setIsMobileMenuOpen(false); 
                          setCurrentView('patches'); 
                          scrollToTop();
                        }}
                        style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', padding: '4px 0', textDecoration: 'none' }}
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Policy Pages Links */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Information & Policies</span>
                {[
                  { view: 'track-order', label: 'Track Order' },
                  { view: 'returns', label: 'Returns & Exchanges' },
                  { view: 'shipping', label: 'Shipping Policy' },
                  { view: 'size-guide', label: 'Size Guide' },
                  { view: 'faqs', label: 'FAQs' },
                  { view: 'quality', label: 'Our Quality' },
                  { view: 'story', label: 'Our Story' }
                ].map(p => (
                  <a 
                    key={p.view} 
                    href={`#${p.view}`} 
                    onClick={() => { setIsMobileMenuOpen(false); setCurrentView(p.view); scrollToTop(); }}
                    style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', padding: '4px 0', display: 'block' }}
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            </nav>
            <div className="mobile-menu-footer">
              <p>Premium custom embroidery & structured streetwear styles. Crafted in-house, designed for the bold.</p>
              <div className="footer-socials" style={{ marginTop: '20px' }}>
                <a href="https://instagram.com" className="footer-social-link" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
                <a href="https://facebook.com" className="footer-social-link" aria-label="Facebook"><Smile /></a>
                <a href="https://youtube.com" className="footer-social-link" aria-label="Youtube"><Play /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* STANDALONE PROFESSIONAL INFO & POLICY PAGES COMPONENT */
function InfoPage({ view, onBack, onChangeView }) {
  const [sizeUnit, setSizeUnit] = useState('in'); // 'in' | 'cm'
  const [selectedSize, setSelectedSize] = useState('L');
  const [sizeCategory, setSizeCategory] = useState('TSHIRTS'); // 'TSHIRTS' | 'HOODIES' | 'SHIRTS'
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('ALL');
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [trackingEmail, setTrackingEmail] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedOrderResult, setTrackedOrderResult] = useState(null);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackingOrderId.trim()) return;
    setIsTracking(true);
    setTimeout(() => {
      setIsTracking(false);
      setTrackedOrderResult({
        id: trackingOrderId.toUpperCase(),
        status: 'In Production & Stitching',
        estimatedDelivery: '3–4 Business Days',
        carrier: 'Delhivery Express',
        step: 2,
        steps: [
          { title: 'Order Confirmed', date: 'Yesterday, 02:30 PM', done: true },
          { title: 'Embroidery Digitizing & Setup', date: 'Today, 09:15 AM', done: true },
          { title: 'In Production & Stitching', date: 'In Progress', active: true },
          { title: 'Quality Control Audit', date: 'Expected Tomorrow' },
          { title: 'Handed to Delhivery Express', date: 'Expected Friday' },
        ]
      });
    }, 600);
  };

  const pageMeta = {
    'track-order': {
      title: 'Track Your Order',
      badgeText: 'Real-Time Shipment Lookup',
      BadgeIcon: Package,
      sub: 'Check real-time production, digitizing, and delivery status for your INDIUNA orders.',
      category: 'Help Center'
    },
    'returns': {
      title: 'Returns & Exchanges Policy',
      badgeText: '30-Day Effortless Policy',
      BadgeIcon: RotateCcw,
      sub: 'Our transparent 30-day return, refund, and size exchange policy for all streetwear orders.',
      category: 'Policies'
    },
    'shipping': {
      title: 'Shipping & Delivery Policy',
      badgeText: 'Pan-India Delivery SLA',
      BadgeIcon: Truck,
      sub: 'Nationwide shipping timelines, courier partners, tracking procedures, and packaging standards.',
      category: 'Policies'
    },
    'size-guide': {
      title: 'Size & Fit Specifications',
      badgeText: 'Official Garment Measurements',
      BadgeIcon: Ruler,
      sub: 'Comprehensive sizing charts, fit recommendations, and measurement instructions.',
      category: 'Help Center'
    },
    'faqs': {
      title: 'Frequently Asked Questions',
      badgeText: 'Verified Knowledge Base',
      BadgeIcon: HelpCircle,
      sub: 'Instant answers to all inquiries regarding custom embroidery, payments, delivery, and garment care.',
      category: 'Help Center'
    },
    'story': {
      title: 'Our Heritage & Philosophy',
      badgeText: 'Crafted In-House Since 2022',
      BadgeIcon: Sparkles,
      sub: 'The story of INDIUNA: blending Indian craftsmanship, mythology, and modern urban streetwear.',
      category: 'About'
    },
    'quality': {
      title: 'Quality & Fabric Standards',
      badgeText: '240 GSM Heavyweight Standards',
      BadgeIcon: Award,
      sub: 'Technical textile specifications, high-density embroidery threads, and quality inspection protocols.',
      category: 'About'
    }
  };

  const meta = pageMeta[view] || pageMeta['track-order'];
  const BadgeIcon = meta.BadgeIcon;

  // Size chart tables for different apparel categories
  const sizeDataMap = {
    'TSHIRTS': [
      { size: 'S', chestIn: '36–38"', chestCm: '91–96 cm', shoulderIn: '16.5"', shoulderCm: '42 cm', lengthIn: '27"', lengthCm: '68 cm', sleeveIn: '8"', sleeveCm: '20 cm' },
      { size: 'M', chestIn: '38–40"', chestCm: '96–101 cm', shoulderIn: '17.5"', shoulderCm: '44 cm', lengthIn: '28"', lengthCm: '71 cm', sleeveIn: '8.5"', sleeveCm: '21 cm' },
      { size: 'L', chestIn: '40–42"', chestCm: '101–106 cm', shoulderIn: '18.5"', shoulderCm: '47 cm', lengthIn: '29"', lengthCm: '73 cm', sleeveIn: '9"', sleeveCm: '23 cm' },
      { size: 'XL', chestIn: '42–44"', chestCm: '106–112 cm', shoulderIn: '19.5"', shoulderCm: '49 cm', lengthIn: '30"', lengthCm: '76 cm', sleeveIn: '9.5"', sleeveCm: '24 cm' },
      { size: 'XXL', chestIn: '44–46"', chestCm: '112–117 cm', shoulderIn: '20.5"', shoulderCm: '52 cm', lengthIn: '31"', lengthCm: '78 cm', sleeveIn: '10"', sleeveCm: '25 cm' },
      { size: '3XL', chestIn: '46–48"', chestCm: '117–122 cm', shoulderIn: '21.5"', shoulderCm: '54 cm', lengthIn: '32"', lengthCm: '81 cm', sleeveIn: '10.5"', sleeveCm: '26 cm' },
    ],
    'HOODIES': [
      { size: 'S', chestIn: '38–40"', chestCm: '96–101 cm', shoulderIn: '17.5"', shoulderCm: '44 cm', lengthIn: '27.5"', lengthCm: '70 cm', sleeveIn: '24"', sleeveCm: '61 cm' },
      { size: 'M', chestIn: '40–42"', chestCm: '101–106 cm', shoulderIn: '18.5"', shoulderCm: '47 cm', lengthIn: '28.5"', lengthCm: '72 cm', sleeveIn: '24.5"', sleeveCm: '62 cm' },
      { size: 'L', chestIn: '42–44"', chestCm: '106–112 cm', shoulderIn: '19.5"', shoulderCm: '49 cm', lengthIn: '29.5"', lengthCm: '75 cm', sleeveIn: '25"', sleeveCm: '63.5 cm' },
      { size: 'XL', chestIn: '44–46"', chestCm: '112–117 cm', shoulderIn: '20.5"', shoulderCm: '52 cm', lengthIn: '30.5"', lengthCm: '77 cm', sleeveIn: '25.5"', sleeveCm: '65 cm' },
      { size: 'XXL', chestIn: '46–48"', chestCm: '117–122 cm', shoulderIn: '21.5"', shoulderCm: '54 cm', lengthIn: '31.5"', lengthCm: '80 cm', sleeveIn: '26"', sleeveCm: '66 cm' },
      { size: '3XL', chestIn: '48–50"', chestCm: '122–127 cm', shoulderIn: '22.5"', shoulderCm: '57 cm', lengthIn: '32.5"', lengthCm: '82 cm', sleeveIn: '26.5"', sleeveCm: '67 cm' },
    ],
    'SHIRTS': [
      { size: 'S', chestIn: '37–39"', chestCm: '94–99 cm', shoulderIn: '17"', shoulderCm: '43 cm', lengthIn: '28"', lengthCm: '71 cm', sleeveIn: '9"', sleeveCm: '23 cm' },
      { size: 'M', chestIn: '39–41"', chestCm: '99–104 cm', shoulderIn: '18"', shoulderCm: '46 cm', lengthIn: '29"', lengthCm: '73 cm', sleeveIn: '9.5"', sleeveCm: '24 cm' },
      { size: 'L', chestIn: '41–43"', chestCm: '104–109 cm', shoulderIn: '19"', shoulderCm: '48 cm', lengthIn: '30"', lengthCm: '76 cm', sleeveIn: '10"', sleeveCm: '25 cm' },
      { size: 'XL', chestIn: '43–45"', chestCm: '109–114 cm', shoulderIn: '20"', shoulderCm: '51 cm', lengthIn: '31"', lengthCm: '78 cm', sleeveIn: '10.5"', sleeveCm: '26.5 cm' },
      { size: 'XXL', chestIn: '45–47"', chestCm: '114–119 cm', shoulderIn: '21"', shoulderCm: '53 cm', lengthIn: '32"', lengthCm: '81 cm', sleeveIn: '11"', sleeveCm: '28 cm' },
      { size: '3XL', chestIn: '47–49"', chestCm: '119–124 cm', shoulderIn: '22"', shoulderCm: '56 cm', lengthIn: '33"', lengthCm: '84 cm', sleeveIn: '11.5"', sleeveCm: '29 cm' },
    ]
  };

  const sizeChartData = sizeDataMap[sizeCategory] || sizeDataMap['TSHIRTS'];

  const faqItems = [
    { cat: 'EMBROIDERY', q: 'How long does custom embroidery production take?', a: 'Custom embroidery orders undergo high-resolution digital vector pathing, thread density configuration, and multi-head stitching. Production takes 5 to 7 business days, followed by 2 to 5 days express transit.' },
    { cat: 'EMBROIDERY', q: 'What file formats and resolutions are accepted for artwork uploads?', a: 'We accept PNG, JPG, WEBP, SVG, PDF, and AI vector files up to 10MB. High-resolution 300 DPI vector files or transparent PNGs produce the sharpest embroidery stitching.' },
    { cat: 'CARE', q: 'What are the recommended wash care instructions for embroidered apparel?', a: 'Wash garments inside-out in cold water (30°C or 85°F) on a gentle cycle using mild detergent. Do not tumble dry on high heat or use chlorine bleach. Iron on the reverse side only.' },
    { cat: 'SHIPPING', q: 'What are the shipping delivery SLAs and free shipping thresholds?', a: 'Standard Delivery takes 5–7 business days (FREE on orders over ₹999, else ₹49). Express Shipping takes 2–3 business days (₹99 flat or FREE on orders over ₹1999).' },
    { cat: 'RETURNS', q: 'What is the return and exchange policy window?', a: 'We provide a 30-day return and size exchange window from the date of package delivery. Items must be unworn, unwashed, and in original zip-lock packaging with tags intact.' },
    { cat: 'RETURNS', q: 'Are custom personalized embroidery orders eligible for returns?', a: 'Custom personalized orders (with uploaded custom artwork or names) are non-returnable due to custom digitizing. However, if there is a manufacturing defect or wrong item delivered, we provide 100% free immediate replacement.' },
    { cat: 'ORDERS', q: 'Can I modify or cancel an order after placing it?', a: 'Orders can be updated or cancelled within 2 hours of placement by emailing support@indiuna.com. Once custom embroidery digitizing or stitching has started, modifications cannot be accepted.' },
    { cat: 'CARE', q: 'Will the 240 GSM organic cotton fabric shrink after washing?', a: 'No. All INDIUNA garments undergo a pre-shrunk wash treatment during mill finishing, ensuring 0% post-wash dimensional shrinkage.' },
    { cat: 'ORDERS', q: 'Which payment methods are accepted on INDIUNA?', a: 'We support all major Indian payment channels including UPI (Google Pay, PhonePe, Paytm), Credit Cards, Debit Cards, Net Banking, and Cash on Delivery (COD) for eligible pin codes.' }
  ];

  const filteredFaqs = faqItems.filter(item => {
    const matchesCat = faqCategory === 'ALL' || item.cat === faqCategory;
    const matchesSearch = !faqSearch.trim() || item.q.toLowerCase().includes(faqSearch.toLowerCase()) || item.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="info-page-wrapper animate-fade-in">
      {/* 1. STANDALONE HERO BANNER */}
      <div className="info-page-hero-banner">
        <div className="info-page-hero-bg-glow"></div>
        <div className="container info-hero-inner">
          <div className="info-hero-breadcrumb">
            <button 
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginRight: '8px'
              }}
            >
              ← Back
            </button>
            <span>Home</span>
            <span>/</span>
            <span>{meta.category}</span>
            <span>/</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>{meta.title}</span>
          </div>

          <div className="info-hero-badge">
            <BadgeIcon size={14} />
            <span>{meta.badgeText}</span>
          </div>
          <h1 className="info-hero-title">{meta.title}</h1>
          <p className="info-hero-sub">{meta.sub}</p>
        </div>
      </div>

      {/* 2. STANDALONE MAIN CONTENT */}
      <div className="container info-main-content">
        <div className="info-card-container">
          
          {/* ==================== 1. TRACK ORDER VIEW ==================== */}
          {view === 'track-order' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={22} color="var(--color-primary)" />
                Real-Time Order & Production Tracker
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px', lineHeight: '1.6' }}>
                Enter your unique Order ID (received via confirmation SMS/Email) and registered contact info to view real-time embroidery digitizing, stitching, and courier transit updates.
              </p>

              <form onSubmit={handleTrackSubmit} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Order Reference ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ORD-2024-8812" 
                      value={trackingOrderId}
                      onChange={(e) => setTrackingOrderId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Registered Email / Phone</label>
                    <input 
                      type="text" 
                      placeholder="your@email.com or 10-digit mobile"
                      value={trackingEmail}
                      onChange={(e) => setTrackingEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isTracking}
                  style={{ width: '100%', padding: '16px', backgroundColor: 'var(--color-primary)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)' }}
                >
                  <Search size={18} />
                  {isTracking ? 'Searching Logistics Database...' : 'Track Order Status'}
                </button>
              </form>

              {trackedOrderResult && (
                <div className="animate-fade-in" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #dcfce7', paddingBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Ref #{trackedOrderResult.id}</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>{trackedOrderResult.status}</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#15803d' }}>Estimated Delivery</span>
                      <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14532d', margin: 0 }}>{trackedOrderResult.estimatedDelivery}</p>
                    </div>
                  </div>

                  <div className="info-timeline-grid">
                    {trackedOrderResult.steps.map((s, idx) => (
                      <div key={idx} className="info-timeline-step">
                        <div className={`info-timeline-badge ${s.done ? 'completed' : ''}`}></div>
                        <div className="info-timeline-card">
                          <h4>{s.title}</h4>
                          <p>{s.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="info-grid-3col">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><Truck size={24} /></div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Express Logistics</h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Shipped via Delhivery & BlueDart express networks.</p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><FileText size={24} /></div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>SMS & Email Alerts</h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Instant notifications sent at every hub scan.</p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><PhoneCall size={24} /></div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>24/7 Desk Support</h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>Email support@indiuna.com with your Order ID.</p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. RETURNS & EXCHANGES VIEW ==================== */}
          {view === 'returns' && (
            <div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ color: '#166534', flexShrink: 0, marginTop: '2px' }}><ShieldCheck size={28} /></div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532d', marginBottom: '4px' }}>30-Day Effortless Guarantee</h3>
                  <p style={{ color: '#166534', fontSize: '0.92rem', margin: 0, lineHeight: '1.6' }}>
                    Try on your apparel at home. If the size or fit isn't perfect, return or exchange your item within 30 days of delivery with zero hassle.
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>4-Step Return & Exchange Authorization Workflow</h3>
              
              <div className="info-grid-2col" style={{ marginBottom: '36px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'inline-flex', width: '32px', height: '32px', background: '#0f172a', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>1</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Submit Request</h4>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>Email <strong>returns@indiuna.com</strong> with your Order ID and reason for return or size exchange.</p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'inline-flex', width: '32px', height: '32px', background: '#0f172a', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>2</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Free Doorstep Reverse Pickup</h4>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>Our courier partner collects the unwashed, tagged item from your delivery address within 24–48 hours.</p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'inline-flex', width: '32px', height: '32px', background: '#0f172a', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>3</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Quality Audit & Inspection</h4>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>Returned items are inspected upon arrival at our facility for original tag attachment and clean condition.</p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'inline-flex', width: '32px', height: '32px', background: '#0f172a', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: '12px' }}>4</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Refund / Replacement Dispatch</h4>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>Refunds credited to your original payment channel within 3–5 days, or new size dispatched immediately.</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '28px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Detailed Refund Timelines by Payment Method</h4>
                <div className="info-size-table-wrapper" style={{ marginBottom: '28px' }}>
                  <table className="info-size-table">
                    <thead>
                      <tr>
                        <th>Payment Mode</th>
                        <th>Refund Processing Method</th>
                        <th>Crediting SLA</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>UPI (GPay / PhonePe / Paytm)</strong></td>
                        <td>Direct Original Bank Account Credit</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>Instant – 24 Hours</td>
                      </tr>
                      <tr>
                        <td><strong>Credit / Debit Cards</strong></td>
                        <td>Original Card Issuer Reversal</td>
                        <td>3 – 5 Business Days</td>
                      </tr>
                      <tr>
                        <td><strong>Net Banking</strong></td>
                        <td>IMPS / NEFT Bank Transfer</td>
                        <td>3 – 5 Business Days</td>
                      </tr>
                      <tr>
                        <td><strong>Cash on Delivery (COD)</strong></td>
                        <td>Encrypted NEFT Bank Transfer Link</td>
                        <td>24 – 48 Hours after verification</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Policy Exceptions & Notes</h4>
                <ul style={{ paddingLeft: '20px', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.8' }}>
                  <li>Garments must be returned in unworn condition, unwashed, and packed in original zip-lock pouches with tags.</li>
                  <li>Custom uploaded artwork/photo embroidery items are non-returnable unless a manufacturing defect or wrong item was delivered.</li>
                  <li>If you receive a defective or damaged product, report it within 48 hours with photo proof to <strong>support@indiuna.com</strong> for immediate 100% free replacement.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ==================== 3. SHIPPING POLICY VIEW ==================== */}
          {view === 'shipping' && (
            <div>
              <div className="info-grid-3col">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '8px' }}><Truck size={28} /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Standard Shipping</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 4px 0' }}>5–7 Days</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>FREE Pan India on ₹999+</p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ color: '#059669', marginBottom: '8px' }}><Clock size={28} /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Express Delivery</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 4px 0' }}>2–3 Days</h3>
                  <p style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, margin: 0 }}>₹99 Flat or FREE on ₹1999+</p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ color: '#0f172a', marginBottom: '8px' }}><Scissors size={28} /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Custom Embroidery</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 4px 0' }}>7–12 Days</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Includes in-house digitizing</p>
                </div>
              </div>

              <div style={{ lineHeight: '1.8', color: '#334155' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Order Processing & Production SLAs</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                  In-stock streetwear collections are processed and dispatched within 24 business hours of order placement. Custom embroidery orders undergo vector digitizing, machine setup, and high-density stitching, requiring 5 to 7 business days in production prior to courier dispatch.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Pan-India Coverage & Logistics Partners</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                  We ship to over 19,000+ pin codes across all 28 states and 8 union territories in India. Primary courier partners include Delhivery Express, BlueDart, and India Post. Live tracking links are automatically transmitted via SMS and WhatsApp as soon as your shipment is scanned at the hub.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Eco-Friendly Waterproof Packaging Standards</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                  Every garment is protected inside a heavy-duty matte black ziplock pouch enclosed within a 100% recyclable waterproof outer mailer, ensuring your streetwear arrives in clean, factory-fresh condition regardless of weather conditions.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Transit Insurance & Weather Delays</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                  All INDIUNA shipments carry 100% transit insurance. In the rare event of severe weather disruptions or carrier loss exceeding 10 business days beyond the SLA, an automatic free replacement or full refund is issued immediately.
                </p>
              </div>
            </div>
          )}

          {/* ==================== 4. SIZE GUIDE VIEW ==================== */}
          {view === 'size-guide' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Official Measurement Matrix</h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>All measurements are taken with the garment laid flat.</p>
                </div>

                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '50px', padding: '4px', border: '1px solid #e2e8f0' }}>
                  <button 
                    onClick={() => setSizeUnit('in')}
                    style={{ padding: '6px 16px', borderRadius: '50px', border: 'none', background: sizeUnit === 'in' ? '#0f172a' : 'transparent', color: sizeUnit === 'in' ? '#fff' : '#64748b', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Inches (in)
                  </button>
                  <button 
                    onClick={() => setSizeUnit('cm')}
                    style={{ padding: '6px 16px', borderRadius: '50px', border: 'none', background: sizeUnit === 'cm' ? '#0f172a' : 'transparent', color: sizeUnit === 'cm' ? '#fff' : '#64748b', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Centimeters (cm)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { key: 'TSHIRTS', label: 'T-Shirts (Oversized Boxy)' },
                  { key: 'HOODIES', label: 'Hoodies & Sweatshirts' },
                  { key: 'SHIRTS', label: 'Structured Button-Up Shirts' }
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSizeCategory(cat.key)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '50px',
                      border: '1px solid transparent',
                      background: sizeCategory === cat.key ? '#0f172a' : '#f1f5f9',
                      color: sizeCategory === cat.key ? '#ffffff' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '10px',
                      border: selectedSize === sz ? '2px solid var(--color-primary)' : '1px solid #cbd5e1',
                      background: selectedSize === sz ? '#fff1f2' : '#ffffff',
                      color: selectedSize === sz ? 'var(--color-primary)' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              <div className="info-size-table-wrapper">
                <table className="info-size-table">
                  <thead>
                    <tr>
                      <th>Size Label</th>
                      <th>Chest Width</th>
                      <th>Shoulder Width</th>
                      <th>Body Length</th>
                      <th>Sleeve Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChartData.map(row => (
                      <tr key={row.size} className={selectedSize === row.size ? 'active' : ''}>
                        <td><strong>{row.size}</strong></td>
                        <td>{sizeUnit === 'in' ? row.chestIn : row.chestCm}</td>
                        <td>{sizeUnit === 'in' ? row.shoulderIn : row.shoulderCm}</td>
                        <td>{sizeUnit === 'in' ? row.lengthIn : row.lengthCm}</td>
                        <td>{sizeUnit === 'in' ? row.sleeveIn : row.sleeveCm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#fff7f7', border: '1px solid #fecdd3', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ color: '#be123c', flexShrink: 0, marginTop: '2px' }}><CheckCircle2 size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#9f1239', marginBottom: '4px' }}>Structured Oversized Fit Guide</h4>
                  <p style={{ fontSize: '0.9rem', color: '#be123c', lineHeight: '1.6', margin: 0 }}>
                    Our streetwear t-shirts are tailored with a modern boxy silhouette featuring dropped shoulders and a wider chest. Order your standard size for an authentic streetwear drape. For a traditional fitted silhouette, select one size down.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '36px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>High-Resolution Measurement Diagram</h4>
                <ZoomableSizeChart src="/images/size_chart_default.png" alt="Size Chart Diagram" />
              </div>
            </div>
          )}

          {/* ==================== 5. FAQS VIEW ==================== */}
          {view === 'faqs' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <input 
                  type="text" 
                  placeholder="Search questions by keyword (e.g. wash care, shipping, embroidery)..." 
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  style={{ width: '100%', padding: '16px 20px', borderRadius: '14px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { key: 'ALL', label: 'All Questions' },
                  { key: 'EMBROIDERY', label: 'Custom Embroidery' },
                  { key: 'SHIPPING', label: 'Shipping & Delivery' },
                  { key: 'RETURNS', label: 'Returns & Refunds' },
                  { key: 'CARE', label: 'Garment Care & Fabric' },
                  { key: 'ORDERS', label: 'Orders & Payments' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setFaqCategory(cat.key)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '50px',
                      border: '1px solid transparent',
                      background: faqCategory === cat.key ? '#0f172a' : '#f1f5f9',
                      color: faqCategory === cat.key ? '#ffffff' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div>
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, i) => (
                    <div key={i} className="info-faq-accordion-item">
                      <button 
                        className="info-faq-header"
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      >
                        <span className="info-faq-question">{faq.q}</span>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                          {expandedFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </button>
                      {expandedFaq === i && (
                        <div className="info-faq-body animate-fade-in">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No matching questions found.</p>
                    <p style={{ fontSize: '0.9rem' }}>Contact our customer desk directly at support@indiuna.com for assistance.</p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '36px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Still Have Questions?</h4>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '18px' }}>Our customer service desk is available Monday through Saturday, 10:00 AM – 7:00 PM IST.</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="mailto:support@indiuna.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>
                    <Mail size={16} /> Email Support
                  </a>
                  <a href="tel:+919876543210" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>
                    <PhoneCall size={16} /> +91 98765 43210
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 6. OUR STORY VIEW (EDITORIAL REDESIGN) ==================== */}
          {view === 'story' && (
            <div className="animate-fade-in" style={{ lineHeight: '1.8', color: '#334155' }}>
              {/* EDITORIAL HERO BANNER */}
              <div style={{ textAlign: 'center', marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid #e2e8f0' }}>
                <span className="story-badge-pill">
                  <Sparkles size={14} /> Est. 2022 • New Delhi Atelier
                </span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '14px', lineHeight: '1.2' }}>
                  Born from Frustration. Crafted for the Bold.
                </h2>
                <p style={{ fontSize: '1.08rem', color: '#64748b', maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
                  INDIUNA was founded to challenge the disposable fast-fashion ecosystem. We build heavyweight 240 GSM organic cotton streetwear fused with intricate 3D embroidery and rich cultural storytelling.
                </p>
              </div>

              {/* STATS COUNTER STRIP */}
              <div className="story-stats-counter-strip">
                <div>
                  <div className="story-stat-number">50,000+</div>
                  <div className="story-stat-label">Streetwear Creators</div>
                </div>
                <div>
                  <div className="story-stat-number">100,000+</div>
                  <div className="story-stat-label">Embroidered Stitches</div>
                </div>
                <div>
                  <div className="story-stat-number">240 GSM</div>
                  <div className="story-stat-label">Organic Cotton Spec</div>
                </div>
                <div>
                  <div className="story-stat-number">100%</div>
                  <div className="story-stat-label">Made in India Atelier</div>
                </div>
              </div>

              {/* CHAPTER 1: THE ORIGIN & STREETWEAR VISION */}
              <div className="story-split-row">
                <div>
                  <span className="story-badge-pill"><Shirt size={14} /> Chapter 01 • The Vision</span>
                  <h3 className="story-heading">Reimagining Streetwear Beyond Thin Fast-Fashion</h3>
                  <p className="story-text">
                    In 2022, we looked at the Indian streetwear market and saw a sea of mass-produced, thin 160 GSM tees with cracking screen prints that lost shape after three washes. Clothing had become disposable.
                  </p>
                  <p className="story-text">
                    We set out to create something permanent. Garments with real physical weight, heavy drop-shoulder boxy cuts, and tactile 3D embroidery threads that never fade, warp, or bleed.
                  </p>
                </div>
                <div className="story-img-container">
                  <img src="/images/streetwear_culture.png" alt="INDIUNA Luxury Streetwear Culture" />
                </div>
              </div>

              {/* CHAPTER 2: THE EMBROIDERY ATELIER */}
              <div className="story-split-row reverse">
                <div>
                  <span className="story-badge-pill"><Scissors size={14} /> Chapter 02 • Craftsmanship</span>
                  <h3 className="story-heading">Precision Digitizing & Industrial Atelier Machinery</h3>
                  <p className="story-text">
                    Every INDIUNA design begins on digital drafting tables. Our artwork engineers spend 10+ hours per design mapping out individual needle paths, thread tension angles, and stitch density layers.
                  </p>
                  <p className="story-text">
                    Using industrial multi-head embroidery machinery in our New Delhi studio, we bring complex anime, mythological, and cybernetic artwork to life with high-density polyester threads engineered to endure 100+ machine wash cycles.
                  </p>
                </div>
                <div className="story-img-container">
                  <img src="/images/atelier_craftsmanship.png" alt="INDIUNA Embroidery Atelier Machinery" />
                </div>
              </div>

              {/* CHAPTER 3: CULTURAL FUSION PRODUCT SHOWCASE */}
              <div style={{ margin: '56px 0', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '36px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <span className="story-badge-pill"><Sparkles size={14} /> Iconic Creations</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 8px 0' }}>Where Mythology & Modern Street Art Collide</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
                    From Japanese anime mythos to ancient Indian warrior aesthetics, our drops celebrate authentic subculture stories.
                  </p>
                </div>

                <div className="info-grid-3col" style={{ margin: 0 }}>
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', textAlign: 'center', padding: '16px' }}>
                    <img src="/images/products/akatsuki_cloud_tee.png" alt="Akatsuki Cloud Embroidered Tee" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Akatsuki Cloud Tee</h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>3D High-Density Cloud Embroidery</p>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', textAlign: 'center', padding: '16px' }}>
                    <img src="/images/products/demon_mask_tee.png" alt="Demon Mask Heavyweight Tee" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Demon Mask Tee</h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>Multi-Thread Hannya Mask Stitching</p>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', textAlign: 'center', padding: '16px' }}>
                    <img src="/images/products/itachi_uchiha_tee.png" alt="Itachi Uchiha Oversized Tee" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Itachi Uchiha Tee</h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>240 GSM Heavyweight Drop-Shoulder</p>
                  </div>
                </div>
              </div>

              {/* CORE VALUES GRID */}
              <div style={{ marginBottom: '56px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '24px', textAlign: 'center' }}>The 4 Core Guiding Principles</h3>
                <div className="info-grid-2col">
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '28px' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}><Award size={28} /></div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>1. Uncompromising Textile Integrity</h4>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                      We custom knit 100% organic cotton into heavyweight 240 GSM fabric. It holds structure, resists shrinking, and drapes naturally.
                    </p>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '28px' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}><Scissors size={28} /></div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>2. Tactile 3D Embroidery Art</h4>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                      Unlike flat prints that crack, our high-density embroidery threads provide rich tactile depth and vibrant permanent colors.
                    </p>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '28px' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}><Globe size={28} /></div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>3. Authentic Indian Artisanship</h4>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                      All garments are proudly designed, digitised, embroidered, and quality checked in India by skilled textile artisans.
                    </p>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '28px' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}><ShieldCheck size={28} /></div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>4. Sustainable & Plastic-Free</h4>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                      We pack all garments in reusable heavy-duty ziplock pouches inside 100% recyclable waterproof outer packaging.
                    </p>
                  </div>
                </div>
              </div>

              {/* TIMELINE MILESTONES */}
              <div style={{ marginBottom: '56px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '24px', textAlign: 'center' }}>The INDIUNA Growth Journey</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { year: '2022', title: 'Studio Founded in New Delhi', desc: 'Started with 2 industrial embroidery machines and a vision to build heavyweight streetwear.' },
                    { year: '2023', title: 'Formulated 240 GSM Organic Cotton', desc: 'Custom engineered our preshrunk 240 GSM organic cotton fabric weight for boxy drapes.' },
                    { year: '2024', title: 'Custom Embroidery Platform Launch', desc: 'Enabled creators across India to upload custom designs and create 1-of-1 embroidered pieces.' },
                    { year: '2025', title: 'Pan-India 19,000+ Pin Code SLA', desc: 'Crossed 50,000+ happy customers with express delivery coverage across all 28 Indian states.' },
                    { year: '2026', title: 'Sustainable Atelier Roadmap', desc: 'Working toward 100% carbon-neutral shipping and expanding international deliveries.' },
                  ].map((m, idx) => (
                    <div key={idx} className="story-timeline-card-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
                        <span style={{ background: '#0f172a', color: '#ffffff', fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: '50px' }}>{m.year}</span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{m.title}</h4>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, paddingLeft: '64px', lineHeight: '1.6' }}>{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOUNDER'S MANIFESTO QUOTE */}
              <div style={{ background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)', color: '#ffffff', borderRadius: '24px', padding: '44px 36px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, fontStyle: 'italic', margin: '0 0 16px 0', color: '#f43f5e', letterSpacing: '-0.01em', lineHeight: '1.5' }}>
                  "We refuse to build soulless apparel. Every shirt that leaves our atelier carries hours of digital vector pathing, tens of thousands of needle stitches, and an unwavering commitment to identity."
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, margin: 0 }}>
                  — The INDIUNA Founders & Atelier Team
                </p>
              </div>
            </div>
          )}

          {/* ==================== 7. QUALITY & FABRICS VIEW ==================== */}
          {view === 'quality' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Textile Engineering & Quality Standards</h2>

              <div className="info-grid-2col" style={{ marginBottom: '36px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><Shirt size={24} /></div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>240 GSM Combed Organic Cotton</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    Thicker, heavier, and softer than standard retail tees (which average 160–180 GSM). Delivers a structured drape that retains shape after repeated machine washes.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><Scissors size={24} /></div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>High-Density Embroidery Thread</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    High-strength polyester threads engineered to resist color bleeding, fading, and thread warping through 100+ machine wash cycles.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><CheckCircle2 size={24} /></div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>5-Point Quality Inspection SLA</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    5-step audit: raw fabric weight verification, stitch density check, thread tension audit, seam reinforcement review, and final packaging scan.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ color: 'var(--color-primary)', marginBottom: '10px' }}><RotateCcw size={24} /></div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Mill Pre-Shrunk Washing</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    All fabrics undergo pre-shrinking treatments at the mill prior to cutting, ensuring 0% post-wash dimensional shrinkage.
                  </p>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Comparative Specification Matrix</h3>
                <div className="info-size-table-wrapper">
                  <table className="info-size-table">
                    <thead>
                      <tr>
                        <th>Quality Feature</th>
                        <th>Standard Retail Apparel</th>
                        <th style={{ background: 'var(--color-primary)' }}>INDIUNA Heavyweight Standard</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Fabric Weight</strong></td>
                        <td>160 – 180 GSM (Lightweight)</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>240 GSM Heavyweight Organic Cotton</td>
                      </tr>
                      <tr>
                        <td><strong>Artwork Execution</strong></td>
                        <td>Screen Print (Cracks over time)</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>3D High-Density Machine Embroidery</td>
                      </tr>
                      <tr>
                        <td><strong>Shrinkage Guarantee</strong></td>
                        <td>Shrinks 5–8% after washing</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>0% (Mill Pre-Shrunk Wash Process)</td>
                      </tr>
                      <tr>
                        <td><strong>Seam Construction</strong></td>
                        <td>Single-Stitch Edges</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Double-Needle Reinforced Hems & Ribbing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ZOOMABLE SIZE CHART COMPONENT (FOR MOBILE & DESKTOP)
   ========================================================================== */
function ZoomableSizeChart({ src, alt = "Size Guide" }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchDistance, setTouchDistance] = useState(null);

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = (e) => {
    e?.stopPropagation();
    setZoomLevel(1);
  };

  const toggleZoom = (e) => {
    e?.stopPropagation();
    setZoomLevel(prev => (prev === 1 ? 2 : 1));
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchDistance !== null) {
        const delta = dist - touchDistance;
        if (Math.abs(delta) > 8) {
          if (delta > 0) {
            setZoomLevel(prev => Math.min(prev + 0.1, 3.5));
          } else {
            setZoomLevel(prev => Math.max(prev - 0.1, 1));
          }
        }
      }
      setTouchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Zoom Control Bar */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '10px',
          padding: '6px 12px',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🔍 <span>Tap image to zoom in ({Math.round(zoomLevel * 100)}%)</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            type="button" 
            onClick={handleZoomOut} 
            disabled={zoomLevel <= 1}
            style={{ 
              border: '1px solid #cbd5e1', 
              background: zoomLevel <= 1 ? '#e2e8f0' : '#ffffff', 
              borderRadius: '6px', 
              padding: '4px 8px', 
              cursor: zoomLevel <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Zoom Out"
          >
            <ZoomOut size={15} color={zoomLevel <= 1 ? '#94a3b8' : '#1e293b'} />
          </button>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '40px', textAlign: 'center', color: '#0f172a' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button 
            type="button" 
            onClick={handleZoomIn} 
            disabled={zoomLevel >= 3.5}
            style={{ 
              border: '1px solid #cbd5e1', 
              background: zoomLevel >= 3.5 ? '#e2e8f0' : '#ffffff', 
              borderRadius: '6px', 
              padding: '4px 8px', 
              cursor: zoomLevel >= 3.5 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Zoom In"
          >
            <ZoomIn size={15} color={zoomLevel >= 3.5 ? '#94a3b8' : '#1e293b'} />
          </button>
          {zoomLevel > 1 && (
            <button 
              type="button" 
              onClick={handleResetZoom}
              style={{ 
                border: '1px solid #cbd5e1', 
                background: '#ffffff', 
                borderRadius: '6px', 
                padding: '4px 8px', 
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#e11d48',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
            style={{ 
              border: '1px solid #cbd5e1', 
              background: '#ffffff', 
              borderRadius: '6px', 
              padding: '4px 8px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Fullscreen Zoom View"
          >
            <Maximize2 size={15} color="#1e293b" />
          </button>
        </div>
      </div>

      {/* Image Viewport Container */}
      <div 
        style={{ 
          overflow: 'auto', 
          maxHeight: '65vh', 
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#fafafa',
          cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
          touchAction: zoomLevel > 1 ? 'pan-x pan-y' : 'manipulation',
          position: 'relative',
          WebkitOverflowScrolling: 'touch'
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ display: 'inline-block', minWidth: '100%', minHeight: '100%' }}>
          <img 
            src={src} 
            alt={alt} 
            onClick={toggleZoom}
            style={{ 
              width: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%',
              maxWidth: zoomLevel > 1 ? 'none' : '100%',
              transition: 'width 0.2s ease-out',
              display: 'block',
              borderRadius: '12px',
              objectFit: 'contain'
            }} 
          />
        </div>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginTop: '6px', marginBottom: 0 }}>
        Tap image or double pinch to zoom • Drag to pan when zoomed
      </p>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            zIndex: 99999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <div 
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px', 
              display: 'flex', 
              gap: '10px', 
              zIndex: 100000000 
            }}
          >
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(prev + 0.5, 3.5)); }} 
              style={{ border: 'none', background: '#ffffff', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              title="Zoom In"
            >
              <ZoomIn size={20} color="#111" />
            </button>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(prev - 0.5, 1)); }} 
              style={{ border: 'none', background: '#ffffff', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              title="Zoom Out"
            >
              <ZoomOut size={20} color="#111" />
            </button>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }} 
              style={{ border: 'none', background: '#e11d48', color: '#ffffff', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              title="Close Fullscreen"
            >
              <X size={22} />
            </button>
          </div>

          <div 
            style={{ 
              width: '100%', 
              height: '100%', 
              overflow: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              touchAction: 'pan-x pan-y',
              padding: '40px 10px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={src} 
              alt={alt} 
              style={{ 
                width: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
                maxWidth: zoomLevel > 1 ? 'none' : '95vw', 
                maxHeight: zoomLevel === 1 ? '85vh' : 'none', 
                transition: 'width 0.2s ease-out',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
              onClick={() => setZoomLevel(prev => (prev === 1 ? 2 : 1))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* DEDICATED PRODUCT DETAIL PAGE COMPONENT */
function ProductDetailPage({ 
  product, 
  products, 
  wishlist, 
  toggleWishlist, 
  addToCart, 
  buyNow, 
  onBack, 
  onNavigateProduct,
  API_BASE,
  token,
  user,
  isCustomizing: isCustomizingProp,
  setCurrentView,
  onFullscreenToggle
}) {
  const fileInputRef = useRef(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [customEmbroiderySize, setCustomEmbroiderySize] = useState('Pocket Logo (3" × 3")');
  const [customPlacement, setCustomPlacement] = useState('Left Chest');
  const [customNotes, setCustomNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(true);

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    // Validate file type and extension permissively
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.jfif', '.avif', '.bmp'];
    const fileName = file.name ? file.name.toLowerCase() : '';
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/avif', 'image/x-icon'];
    const hasValidType = file.type ? (validTypes.includes(file.type) || file.type.startsWith('image/')) : false;

    if (!hasValidExt && !hasValidType) {
      setUploadError('Invalid file format. Please upload an image file (JPG, PNG, WEBP, SVG, etc.).');
      return;
    }
    
    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size is too large. Max size is 10MB.');
      return;
    }
    
    setUploadError('');
    setIsUploading(true);
    
    try {
      const blobUrl = URL.createObjectURL(file);
      setCustomPhotoUrl(blobUrl);
    } catch (err) {
      console.error('Blob URL creation error:', err);
    } finally {
      setIsUploading(false);
    }

    // Safely reset input value asynchronously so it does not interfere with React event dispatching
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 100);

    // Upload in background to API if configured
    if (API_BASE) {
      const formData = new FormData();
      formData.append('file', file);
      fetch(`${API_BASE}/customization/upload`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.success && data.data && data.data.url) {
          let serverUrl = data.data.url;
          if (!serverUrl.startsWith('http')) {
            const apiOrigin = API_BASE.replace(/\/api\/v1\/?$/, '');
            serverUrl = `${apiOrigin}${serverUrl.startsWith('/') ? '' : '/'}${serverUrl}`;
          }
          setCustomPhotoUrl(serverUrl);
        }
      })
      .catch(err => console.error('Background server upload note:', err));
    }
  };
  // State declarations (MUST BE UNCONDITIONAL AT TOP OF COMPONENT)
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('L');
  const [activeImage, setActiveImage] = useState(product?.image || '');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(user?.email || '');
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null); // 'shipping' | 'returns' | 'fabric' | null
  const [openQA, setOpenQA] = useState(0); // active QA index
  const [dbReviews, setDbReviews] = useState([]);
  const [dbQuestions, setDbQuestions] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);

  // Reset active image when product changes
  useEffect(() => {
    if (product) setActiveImage(product.image);
  }, [product]);

  useEffect(() => {
    if (API_BASE && product?.id) {
      // Fetch Reviews
      fetch(`${API_BASE}/products/${product.id}/reviews`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.data) {
            setDbReviews(data.data);
          } else {
            setDbReviews([]);
          }
        })
        .catch(err => {
          console.error('Failed to load reviews:', err);
          setDbReviews([]);
        });

      // Fetch Questions
      fetch(`${API_BASE}/products/${product.id}/questions`)
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.data) {
            setDbQuestions(data.data);
          } else {
            setDbQuestions([]);
          }
        })
        .catch(err => {
          console.error('Failed to load questions:', err);
          setDbQuestions([]);
        });
    }
  }, [product?.id, API_BASE]);

  useEffect(() => {
    if (onFullscreenToggle) {
      onFullscreenToggle(isFullscreenImageOpen);
    }
  }, [isFullscreenImageOpen, onFullscreenToggle]);

  useEffect(() => {
    if (showSizeGuideModal) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showSizeGuideModal]);

  if (!product) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Product Not Found</h2>
        <button onClick={onBack} className="btn-solid-red" style={{ display: 'inline-block', width: 'auto', padding: '12px 24px' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const colorHexMap = {
    'Black': '#000000',
    'White': '#ffffff',
    'Olive': '#556b2f',
    'Navy': '#000080',
    'Beige': '#f5f5dc',
    'Crimson': '#dc143c',
    'Charcoal': '#36454f',
    'Red': '#e11d48',
    'Blue': '#2563eb',
    'Green': '#16a34a',
  };

  const availableColors = Array.from(new Set(
    (product.variants || []).map(v => v.attributes?.color || v.color).filter(Boolean)
  ));
  const colorsList = availableColors.length > 0 ? availableColors : ['Black', 'Olive', 'Beige'];

  // Dynamically find current variant matching color & size
  const currentVariant = (product.variants || []).find(v => {
    const vColor = (v.attributes?.color || v.color || '').toLowerCase();
    const vSize = (v.attributes?.size || v.size || '').toString().toLowerCase();
    return (vColor === selectedColor.toLowerCase()) && (vSize === selectedSize.toLowerCase());
  }) || (product.variants || []).find(v => (v.attributes?.color || v.color || '').toLowerCase() === selectedColor.toLowerCase()) || null;

  const activePrice = currentVariant?.price ? parseFloat(currentVariant.price) : product.price;
  const activeComparePrice = currentVariant?.compare_price ? parseFloat(currentVariant.compare_price) : product.originalPrice;
  const activeVariantStock = currentVariant !== null && currentVariant !== undefined ? parseInt(currentVariant.stock, 10) : product.stock;
  const isVariantOutOfStock = activeVariantStock <= 0;

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    setNotifySubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}/notify-back-in-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email: notifyEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifySuccess(true);
        setTimeout(() => {
          setNotifySuccess(false);
          setShowNotifyModal(false);
        }, 2500);
      } else {
        alert(data.message || 'Failed to request notification');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          rating: newRating,
          title: newTitle || undefined,
          body: newBody || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Review submitted successfully!');
        setNewTitle('');
        setNewBody('');
        setNewRating(5);
        setDbReviews(prev => [data.data, ...prev]);
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!newQuestion.trim()) return;
    setQuestionSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: newQuestion
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Question asked successfully!');
        setNewQuestion('');
        setDbQuestions(prev => [data.data, ...prev]);
      } else {
        alert(data.message || 'Failed to submit question');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  };

  const similarProducts = products.filter(p => p.id !== product.id).slice(0, 3);

  // Mock Reviews Data
  const mockReviews = [
    { name: "Rahul S.", rating: 5, date: "July 08, 2026", verified: true, text: "The embroidery is top-notch. It's thick, rich, and has survived 3 washes already with absolutely zero loose threads. Definitely buying another one." },
    { name: "Ananya M.", rating: 5, date: "June 29, 2026", verified: true, text: "Super oversized fit, exactly what I was looking for. Fabric feels very premium and heavy. The Oni design is sick." },
    { name: "Vikram K.", rating: 4, date: "June 15, 2026", verified: false, text: "Really cool design. Just note it is quite heavyweight fabric, so it might feel warm on high-summer days, but perfect for evenings." }
  ];

  // Q&A List
  const qnaList = [
    { q: "Is the embroidery thread plastic or cotton?", a: "We use high-grade premium polyester embroidery threads. This ensures the colors stay extremely vibrant, do not bleed in the wash, and the structure doesn't shrink or warp over time." },
    { q: "What are the wash care instructions?", a: "We recommend washing the garment inside-out in cold water on a gentle cycle. Hang dry or tumble dry low. Do not iron directly on the embroidered surface to preserve the stitches." },
    { q: "Can I request a custom size or customized design?", a: "Yes! Head to our Custom Embroidery Services section on the homepage, or select your design style and upload your custom files directly for our digitizing team." }
  ];


  const catName = (product.category || '').toLowerCase();
  const catNames = (product.categories || []).map(c => `${c.name || ''} ${c.slug || ''}`).join(' ').toLowerCase();
  const catNamesFromList = (product.categoryNames || []).join(' ').toLowerCase();
  const tagsStr = (product.tags || []).map(t => (typeof t === 'string' ? t : t.name || '').toLowerCase()).join(' ');
  const showPages = (product.show_in_pages || product.showInPages || '').toLowerCase();
  const prodName = (product.name || '').toLowerCase();

  const allCategoryInfo = `${catName} ${catNames} ${catNamesFromList} ${tagsStr} ${showPages} ${prodName}`;

  const isPurePatch = (catName.includes('patch') || catNames.includes('patch')) && !allCategoryInfo.includes('custom');

  const isCustomizationProduct = !isPurePatch && (
    allCategoryInfo.includes('custom') ||
    product.is_customizing === true ||
    product.isCustomizing === true ||
    Boolean(isCustomizingProp)
  );

  return (
    <div className="product-detail-page container animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <button onClick={onBack} className="back-btn" title="Back" aria-label="Back" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Undo2 size={19} style={{ color: '#0f172a' }} />
        </button>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">{product.category}</span>
      </div>

      {/* Main Details Grid */}
      <div className="product-detail-grid">
        {/* Left Column: Image Gallery */}
        <div className="product-gallery-container">
          <div className="product-main-preview" onClick={() => setIsFullscreenImageOpen(true)} style={{ cursor: 'pointer' }}>
            <img src={activeImage} alt={product.name} className="main-preview-img" />
          </div>
          <div className="product-thumbnails-list">
            {product.thumbnails.map((thumb, idx) => (
              <button 
                key={idx} 
                className={`thumb-btn ${activeImage === thumb ? 'active' : ''}`}
                onClick={() => setActiveImage(thumb)}
              >
                <img src={thumb} alt={`Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Information Panel */}
        <div className="product-info-panel">
          <div className="info-header">
            <span className="product-info-tag">{product.tag}</span>
            <h2 className="product-info-title">{product.name}</h2>
            <div className="info-rating-row" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} />
                ))}
              </div>
              <span className="rating-text">{product.rating} ({product.reviewCount} Reviews)</span>
            </div>
            <div className="product-info-price" style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span>₹{activePrice.toLocaleString('en-IN')}</span>
              {activeComparePrice && activeComparePrice > activePrice && (
                <span className="price-original" style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: '#9ca3af', fontWeight: 500 }}>
                  ₹{activeComparePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Color Swatch Selectors */}
          <div className="color-selector-block" style={{ marginBottom: '20px' }}>
            <div className="option-header-row" style={{ marginBottom: '10px' }}>
              <span className="option-title" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select Color: <strong style={{ color: 'var(--color-primary)' }}>{selectedColor}</strong>
              </span>
            </div>
            <div className="color-swatches-flex" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '6px 8px 6px 6px' }}>
               {colorsList.map(color => {
                 const matchedVar = (product.variants || []).find(v => (v.attributes?.color || v.color) === color);
                 const hex = matchedVar?.attributes?.color_code || colorHexMap[color] || (color.startsWith('#') ? color : '#333333');
                 const isSelected = selectedColor === color;
                 return (
                   <button
                     key={color}
                     type="button"
                     title={color}
                     onClick={() => {
                       setSelectedColor(color);
                       const varWithImg = (product.variants || []).find(v => (v.attributes?.color || v.color) === color && (v.image || v.attributes?.image));
                       const imgUrl = varWithImg?.image || varWithImg?.attributes?.image;
                       if (imgUrl) {
                         setActiveImage(imgUrl);
                       }
                     }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: hex,
                      border: isSelected ? '3px solid #e11d48' : '2px solid #d4d4d8',
                      boxShadow: isSelected ? '0 0 0 3px rgba(225, 29, 72, 0.25)' : 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      outline: 'none',
                      position: 'relative',
                      padding: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    {hex === '#ffffff' && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid #e4e4e7' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selectors */}
          <div className="size-selector-block">
            <div className="option-header-row">
              <span className="option-title">Select Size</span>
              <button 
                type="button" 
                className="size-guide-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => setShowSizeGuideModal(true)}
              >
                Size Guide
              </button>
            </div>
            <div className="size-buttons-grid">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button 
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Customization Section */}
          {isCustomizationProduct && (
            <div style={{ margin: '16px 0', backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              {/* Single persistent hidden file input - NEVER UNMOUNTS */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              {/* Header with compact upload button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🎨 Custom Embroidery Design
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Upload your logo/artwork & select specs
                  </span>
                </div>
              </div>

              {/* Design Image Upload Card */}
              <div style={{ marginBottom: '12px' }}>
                {customPhotoUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1.5px solid #86efac' }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #bbf7d0', backgroundColor: '#ffffff', flexShrink: 0 }}>
                      <img src={customPhotoUrl} alt="Design Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 800, color: '#15803d' }}>
                        ✓ Custom Image Attached
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#166534', display: 'block' }}>
                        Ready for embroidery digitizing
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomPhotoUrl('')}
                        style={{ padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #fca5a5', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1.5px dashed #e11d48', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    {isUploading ? (
                      <span style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Loader2 size={16} className="animate-spin" /> Processing Upload...
                      </span>
                    ) : (
                      <>
                        <Upload size={16} style={{ color: '#e11d48' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Click to Upload Design Image / Logo</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>(PNG, JPG, WEBP, SVG)</span>
                      </>
                    )}
                  </button>
                )}
                {uploadError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{uploadError}</p>}
              </div>

              {/* Compact Specs Selectors Row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {/* Size Pills with clear dimensions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', minWidth: '70px' }}>Design Size:</span>
                  {[
                    { label: 'Pocket Logo (3" × 3")', val: 'Pocket Logo (3" × 3")' },
                    { label: 'Chest Graphic (6" × 6")', val: 'Chest Graphic (6" × 6")' },
                    { label: 'Large Back (10" × 10")', val: 'Large Back (10" × 10")' }
                  ].map(s => {
                    const isSel = customEmbroiderySize === s.val || (s.val.includes('3') && customEmbroiderySize.includes('4'));
                    return (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => setCustomEmbroiderySize(s.val)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.73rem',
                          fontWeight: isSel ? 800 : 600,
                          borderRadius: '6px',
                          border: isSel ? '1.5px solid #e11d48' : '1px solid #cbd5e1',
                          backgroundColor: isSel ? '#fff1f2' : '#ffffff',
                          color: isSel ? '#e11d48' : '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                {/* Placement Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', minWidth: '70px' }}>Placement:</span>
                  {['Left Chest', 'Center Chest', 'Full Back', 'Sleeve'].map(p => {
                    const isSel = customPlacement === p || (p === 'Sleeve' && customPlacement.includes('Sleeve'));
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCustomPlacement(p === 'Sleeve' ? 'Left Sleeve' : p)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.73rem',
                          fontWeight: isSel ? 800 : 600,
                          borderRadius: '6px',
                          border: isSel ? '1.5px solid #e11d48' : '1px solid #cbd5e1',
                          backgroundColor: isSel ? '#fff1f2' : '#ffffff',
                          color: isSel ? '#e11d48' : '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compact 1-line Notes Input */}
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Optional notes (special thread color, font, details...)"
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons-stack">
            {isVariantOutOfStock ? (
              <div className="primary-actions-row flex flex-col gap-2">
                <div style={{ padding: '8px 12px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', color: '#e11d48', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
                  ⚠️ Selected Variant ({selectedColor} / {selectedSize}) Out of Stock
                </div>
                <button 
                  type="button"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)'
                  }}
                  onClick={() => {
                    setNotifyEmail(user?.email || '');
                    setShowNotifyModal(true);
                  }}
                >
                  <Sparkles size={18} /> Notify Me When In Stock
                </button>
              </div>
            ) : (
              <div className="primary-actions-row">
                <button className="btn-buy-now" onClick={() => {
                  if (isCustomizationProduct) {
                    if (!customPhotoUrl) { alert('Please upload a reference image to customize your order.'); return; }
                    if (!customEmbroiderySize) { alert('Please select an embroidery size for your customization.'); return; }
                    if (!customPlacement) { alert('Please select a placement location for your customization.'); return; }
                  }
                  const customOptions = isCustomizationProduct ? {
                    photoUrl: customPhotoUrl,
                    embroiderySize: customEmbroiderySize,
                    placement: customPlacement,
                    notes: customNotes
                  } : null;
                  buyNow(product, selectedSize, selectedColor, customOptions);
                }}>Buy Now</button>
                
                <button className="btn-add-cart" onClick={() => {
                  if (isCustomizationProduct) {
                    if (!customPhotoUrl) { alert('Please upload a reference image to customize your order.'); return; }
                    if (!customEmbroiderySize) { alert('Please select an embroidery size for your customization.'); return; }
                    if (!customPlacement) { alert('Please select a placement location for your customization.'); return; }
                  }
                  const customOptions = isCustomizationProduct ? {
                    photoUrl: customPhotoUrl,
                    embroiderySize: customEmbroiderySize,
                    placement: customPlacement,
                    notes: customNotes
                  } : null;
                  addToCart(product, selectedSize, selectedColor, customOptions);
                }}>Add To Cart</button>
              </div>
            )}
            
            <div className="secondary-actions-row">
              <button 
                className={`btn-wishlist-toggle ${wishlist.includes(product.id) ? 'active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart size={18} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                {wishlist.includes(product.id) ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
              
              <button className="btn-share-link" onClick={handleShare}>
                <Share2 size={18} />
                Share
                {shareTooltip && <span className="share-tooltip">Copied URL!</span>}
              </button>
            </div>
          </div>

          {/* Back In Stock Notify Modal */}
          {showNotifyModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '28px', border: '1px solid #e4e4e7', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: 0 }}>Back In Stock Alert</h3>
                  <button type="button" onClick={() => setShowNotifyModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#71717a' }}><X size={20} /></button>
                </div>
                {notifySuccess ? (
                  <div style={{ padding: '20px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', textAlign: 'center', fontWeight: 600 }}>
                    🎉 Success! We will send an email notification to <strong>{notifyEmail}</strong> as soon as this item is restocked.
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#71717a', marginBottom: '20px', lineHeight: '1.5' }}>
                      Get an automatic email notification as soon as <strong>{product.name}</strong> is replenished and back in stock.
                    </p>
                    <form onSubmit={handleNotifySubmit}>
                      <input 
                        type="email" 
                        required 
                        placeholder="Enter your email address" 
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d4d4d8', fontSize: '0.9rem', marginBottom: '16px', outline: 'none' }}
                      />
                      <button 
                        type="submit" 
                        disabled={notifySubmitting}
                        style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: '#e11d48', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', opacity: notifySubmitting ? 0.6 : 1 }}
                      >
                        {notifySubmitting ? 'Submitting...' : 'Notify Me When Restocked'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Product Description Section */}
          <div className="product-details-accordion-clean">
            <div className="accordion-clean-header" onClick={() => setIsDescOpen(!isDescOpen)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={20} style={{ color: 'var(--color-primary, #6366f1)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em' }}>PRODUCT DESCRIPTION</h3>
                  <span className="subtitle" style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>Fabric, Care and Fit</span>
                </div>
              </div>
              <button className="accordion-toggle-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#666' }}>
                {isDescOpen ? <Minus size={18} /> : <Plus size={18} />}
              </button>
            </div>
            
            {isDescOpen && (
              <div className="accordion-clean-content" style={{ animation: 'slideDown 0.3s ease' }}>
                <p className="clean-desc-paragraph">{product.desc}</p>
                
                <div className="specs-grid-clean">
                  <div className="spec-row-clean">
                    <span className="spec-label">Material / Fabric</span>
                    <span className="spec-value">100% Organic Cotton (240 GSM Premium Heavyweight)</span>
                  </div>
                  <div className="spec-row-clean">
                    <span className="spec-label">Pattern</span>
                    <span className="spec-value">Meticulous High-Density Embroidery / Solid</span>
                  </div>
                  <div className="spec-row-clean">
                    <span className="spec-label">Fit Type</span>
                    <span className="spec-value">{product.category?.toLowerCase().includes('oversized') ? 'Oversized Streetwear Fit' : 'Regular Classic Fit'}</span>
                  </div>
                  <div className="spec-row-clean">
                    <span className="spec-label">Wash Care</span>
                    <span className="spec-value">Machine Wash Cold inside out, Tumble Dry Low, Do Not Iron Embroidery</span>
                  </div>
                  <div className="spec-row-clean">
                    <span className="spec-label">Available Sizes</span>
                    <span className="spec-value">S, M, L, XL, XXL</span>
                  </div>
                  <div className="spec-row-clean">
                    <span className="spec-label">Country of Origin</span>
                    <span className="spec-value">India</span>
                  </div>
                </div>
                
                <div className="manufacturer-info-clean">
                  <p><strong>Manufactured & Packed By:</strong> INDIUNA CUSTOMS & CO., Ahmedabad, India</p>
                  <p><strong>Shipped & Marketed By:</strong> INDIUNA CUSTOMS & CO., India</p>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Terms & Policies Accordion */}
          <div className="policies-accordion">
            <div className="accordion-item">
              <button 
                className="accordion-header" 
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
              >
                <span className="header-text"><Truck size={16} /> Shipping & Delivery Information</span>
                {openAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className={`accordion-body ${openAccordion === 'shipping' ? 'open' : ''}`}>
                <p>We deliver Pan-India in 3-5 business days. Express shipping options are available at checkout. Tracking links are automatically sent via SMS and Email once shipped.</p>
              </div>
            </div>

            <div className="accordion-item">
              <button 
                className="accordion-header" 
                onClick={() => setOpenAccordion(openAccordion === 'returns' ? null : 'returns')}
              >
                <span className="header-text"><RotateCcw size={16} /> 30-Day Hassle-Free Returns</span>
                {openAccordion === 'returns' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className={`accordion-body ${openAccordion === 'returns' ? 'open' : ''}`}>
                <p>We offer a 30-day return or exchange policy on all unworn, unwashed products with tags intact. Returns are completely free and processed within 2 days of pickup.</p>
              </div>
            </div>

            <div className="accordion-item">
              <button 
                className="accordion-header" 
                onClick={() => setOpenAccordion(openAccordion === 'fabric' ? null : 'fabric')}
              >
                <span className="header-text"><ShieldCheck size={16} /> Fabric, Care & Quality</span>
                {openAccordion === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className={`accordion-body ${openAccordion === 'fabric' ? 'open' : ''}`}>
                <p>Made from 100% heavy-weight 240 GSM organic ring-spun cotton. Stitched with double-needle hems. Machine wash cold, tumble dry low, do not iron embroidery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <section className="similar-products-section">
        <div className="section-header">
          <h3 className="section-title">Similar Products</h3>
        </div>

        <div className="product-grid">
          {similarProducts.map((p) => (
            <div 
              key={p.id} 
              className="product-card" 
              onClick={() => onNavigateProduct(p.id)}
            >
              <div className="product-card-img-wrapper">
                <img src={p.image} alt={p.name} className="product-card-image" />
                <button 
                  className={`product-card-wishlist ${wishlist.includes(p.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p.id);
                  }}
                  aria-label="Add to wishlist"
                >
                  <Heart fill={wishlist.includes(p.id) ? 'currentColor' : 'none'} />
                </button>
                <span className="product-card-tag">{p.tag}</span>
              </div>
              <div className="product-card-info">
                <span className="product-card-category">{p.category}</span>
                <h4 className="product-card-title">{p.name}</h4>
                
                {/* Rating show on card */}
                <div className="product-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                  <div className="product-card-stars" style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < Math.floor(p.rating || 4.8) ? 'star-filled' : 'star-empty'} />
                    ))}
                  </div>
                  <span className="product-card-rating-num" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{p.rating || '4.8'}</span>
                </div>

                <span className="product-card-price">₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews-section" className="product-reviews-section">
        <h3 className="section-title">Customer Reviews</h3>
        
        <div className="reviews-layout-grid">
          {/* Left Review Panel: Stats */}
          <div className="reviews-summary-card">
            <span className="average-rating-num">{product.rating}</span>
            <div className="stars-row justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} />
              ))}
            </div>
            <span className="reviews-total-text">Based on {dbReviews.length > 0 ? dbReviews.length : product.reviewCount} verified reviews</span>
            
            {/* Show "Write a Review" form if user is logged in */}
            {token ? (
              <form onSubmit={submitReview} style={{ marginTop: '30px', textAlign: 'left', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '15px' }}>Write A Review</h4>
                <div className="auth-form-group">
                  <label className="auth-label">Rating</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[1, 2, 3, 4, 5].map(stars => (
                      <button 
                        key={stars} 
                        type="button" 
                        onClick={() => setNewRating(stars)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star size={20} className={stars <= newRating ? 'star-filled' : 'star-empty'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="auth-form-group">
                  <label className="auth-label">Review Title</label>
                  <input 
                    type="text" 
                    className="auth-input" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="E.g. Great quality shirt!" 
                  />
                </div>
                <div className="auth-form-group">
                  <label className="auth-label">Review Body</label>
                  <textarea 
                    className="auth-input" 
                    value={newBody} 
                    onChange={(e) => setNewBody(e.target.value)} 
                    placeholder="Write your review here..."
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    required
                  />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
                Please <button type="button" onClick={() => { setCurrentView('auth'); setAuthTab('login'); scrollToTop(); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>sign in</button> to write a review.
              </div>
            )}
          </div>

          {/* Right Review Panel: Reviews List */}
          <div className="reviews-list-container">
            {(() => {
              const allReviews = dbReviews.length > 0 ? dbReviews.map(r => ({
                name: r.customer_name || (r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : 'Anonymous'),
                rating: r.rating,
                date: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                verified: !!r.order_id,
                title: r.title,
                text: r.body
              })) : mockReviews;
              
              const displayedReviews = allReviews.slice(0, visibleReviewsCount);
              
              return (
                <>
                  {displayedReviews.map((rev, idx) => (
                    <div className="review-item-card animate-slide-up" key={idx}>
                      <div className="review-item-header">
                        <span className="reviewer-name">{rev.name}</span>
                        {rev.verified && <span className="verified-badge"><Check size={12} /> Verified Buyer</span>}
                        <span className="review-date">{rev.date}</span>
                      </div>
                      <div className="stars-row" style={{ margin: '8px 0' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < rev.rating ? 'star-filled' : 'star-empty'} />
                        ))}
                      </div>
                      {rev.title && <h5 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '5px' }}>{rev.title}</h5>}
                      <p className="review-text">{rev.text}</p>
                    </div>
                  ))}
                  {allReviews.length > visibleReviewsCount && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <button 
                        type="button" 
                        onClick={() => setVisibleReviewsCount(prev => prev + 5)}
                        className="btn-add-cart"
                        style={{ padding: '12px 28px', fontSize: '0.85rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <ChevronDown size={16} /> View More Reviews ({allReviews.length - visibleReviewsCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Customer Q&A Section */}
      <section className="product-qna-section">
        <h3 className="section-title">Customer Questions &amp; Answers</h3>
        
        <div className="qna-layout-grid">
          <div className="qna-stack">
            {(dbQuestions.length > 0 ? dbQuestions.map(q => ({
              q: q.question,
              a: q.answer || 'Awaiting response from admin',
              name: q.customer_name || 'Guest'
            })) : qnaList.map(q => ({ q: q.q, a: q.a, name: 'Support Team' }))).map((qna, idx) => (
              <div className="qna-item-card" key={idx}>
                <button 
                  className="qna-header-btn"
                  onClick={() => setOpenQA(openQA === idx ? -1 : idx)}
                >
                  <div style={{ textAlign: 'left' }}>
                    <span className="qna-question-text" style={{ display: 'block', fontWeight: 'bold' }}>Q: {qna.q}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>Asked by {qna.name}</span>
                  </div>
                  {openQA === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <div className={`qna-body-panel ${openQA === idx ? 'open' : ''}`}>
                  <p className="qna-answer-text"><strong>A:</strong> {qna.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            {token ? (
              <form onSubmit={submitQuestion} style={{ padding: '20px', backgroundColor: '#fdfdfd', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '15px' }}>Ask a Question</h4>
                <div className="auth-form-group">
                  <textarea 
                    className="auth-input" 
                    value={newQuestion} 
                    onChange={(e) => setNewQuestion(e.target.value)} 
                    placeholder="Ask about sizing, wash care, custom details..."
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    required
                  />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={questionSubmitting}>
                  {questionSubmitting ? 'Submitting...' : 'Submit Question'}
                </button>
              </form>
            ) : (
              <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', fontSize: '0.85rem', textAlign: 'center' }}>
                Please <button type="button" onClick={() => { setCurrentView('auth'); setAuthTab('login'); scrollToTop(); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>sign in</button> to ask a question.
              </div>
            )}
          </div>
        </div>
      </section>

      {isFullscreenImageOpen && (
        <div 
          className="fullscreen-image-overlay"
          onClick={() => setIsFullscreenImageOpen(false)}
        >
          <button 
            className="fullscreen-image-close"
            onClick={(e) => { e.stopPropagation(); setIsFullscreenImageOpen(false); }}
            aria-label="Close fullscreen"
          >
            <X size={24} />
          </button>
          <img 
            src={activeImage} 
            alt={product.name} 
            className="fullscreen-image-el"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}



      {/* Size Guide Modal */}
      {showSizeGuideModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            backdropFilter: 'blur(6px)', 
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 9999999, 
            padding: '80px 16px 20px 16px'
          }}
          onClick={() => setShowSizeGuideModal(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              maxWidth: '650px', 
              width: '100%', 
              padding: '20px', 
              border: '1px solid #e4e4e7', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', 
              maxHeight: 'calc(100vh - 100px)', 
              overflowY: 'auto', 
              position: 'relative', 
              zIndex: 10000000 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#09090b', margin: 0 }}>Size Guide - {product.name}</h3>
              <button 
                type="button" 
                onClick={() => setShowSizeGuideModal(false)} 
                style={{ border: 'none', background: '#f4f4f5', borderRadius: '50%', cursor: 'pointer', color: '#71717a', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
            <ZoomableSizeChart src={product.size_guide_image || '/images/size_chart_default.png'} alt={`Size Guide - ${product.name}`} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   SHARED LANDING PAGE HERO COMPONENT
   ========================================================================== */
function LandingPageHero({ tag, title, desc, image, ctaText, onGoHome, onCtaClick }) {
  return (
    <section className="landing-hero-section">
      <div className="landing-hero-bg" style={{ backgroundImage: `url('${image}')` }} />
      <div className="landing-hero-overlay" />
      <div className="landing-hero-content container">
        {onGoHome && (
          <button className="landing-hero-home-btn" onClick={onGoHome}>
            <ArrowLeft size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Back to Home
          </button>
        )}
        <span className="landing-hero-tag" style={{ marginTop: onGoHome ? '10px' : '0' }}>{tag}</span>
        <h1 className="landing-hero-title">{title}</h1>
        <p className="landing-hero-desc">{desc}</p>
        <button className="landing-hero-cta" onClick={onCtaClick}>{ctaText}</button>
      </div>
    </section>
  );
}

/* ==========================================================================
   SHARED CATEGORIES GRID COMPONENT
   ========================================================================== */
function LandingCategories({ categories, onCategoryClick }) {
  return (
    <section className="categories-section container">
      <h2 className="categories-main-title">Categories</h2>
      <div className="categories-grid-new">
        {categories.map((cat, i) => (
          <div 
            key={i} 
            className="category-item-card-new"
            style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
            onClick={() => onCategoryClick && onCategoryClick(cat)}
          >
            <div className="category-image-wrapper-new">
              <img src={cat.img} alt={cat.name} className="category-image-new" />
            </div>
            <h4 className="category-item-title-new">{cat.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   SHARED TRENDING / NEW ARRIVALS GRID COMPONENT
   ========================================================================== */
/* ==========================================================================
   SHARED TRENDING / NEW ARRIVALS CAROUSEL COMPONENT (HOMEPAGE DESIGN MATCH)
   ========================================================================== */
function LandingProductGrid({ title, products, onNavigateProduct }) {
  const [carouselIndex, setCarouselIndex] = useState(10);
  const [noAnim, setNoAnim] = useState(false);

  // Swipe, Drag & Wheel gesture handlers
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const wheelCooldown = useRef(false);
  const isMouseDown = useRef(false);
  const mouseStartX = useRef(0);
  const mouseDragDist = useRef(0);

  // Auto-play landing page carousels
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Infinite reset loop
  useEffect(() => {
    if (carouselIndex >= 20) {
      const t = setTimeout(() => {
        setNoAnim(true);
        setCarouselIndex(carouselIndex - 10);
        requestAnimationFrame(() => requestAnimationFrame(() => setNoAnim(false)));
      }, 700);
      return () => clearTimeout(t);
    } else if (carouselIndex <= 9) {
      const t = setTimeout(() => {
        setNoAnim(true);
        setCarouselIndex(carouselIndex + 10);
        requestAnimationFrame(() => requestAnimationFrame(() => setNoAnim(false)));
      }, 700);
      return () => clearTimeout(t);
    }
  }, [carouselIndex]);

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      setCarouselIndex(prev => prev + 1);
    } else if (diff < -40) {
      setCarouselIndex(prev => prev - 1);
    }
  };

  // Mouse wheel handler
  const handleWheel = (e) => {
    if (wheelCooldown.current) return;
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 20) {
      wheelCooldown.current = true;
      if (delta > 0) {
        setCarouselIndex(prev => prev + 1);
      } else {
        setCarouselIndex(prev => prev - 1);
      }
      setTimeout(() => {
        wheelCooldown.current = false;
      }, 300);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
    mouseDragDist.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current) return;
    mouseDragDist.current = e.clientX - mouseStartX.current;
  };

  const handleMouseUp = () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    if (mouseDragDist.current < -40) {
      setCarouselIndex(prev => prev + 1);
    } else if (mouseDragDist.current > 40) {
      setCarouselIndex(prev => prev - 1);
    }
  };

  const handleMouseLeave = () => {
    if (isMouseDown.current) {
      handleMouseUp();
    }
  };

  // Pad the products array so it always has at least 10 items for the infinite carousel layout
  const paddedProducts = [...products];
  while (paddedProducts.length < 10 && paddedProducts.length > 0) {
    paddedProducts.push(...products);
  }
  const sliceProducts = paddedProducts.slice(0, 10);

  // Triple the items to support infinite scroll smoothly
  const tripledProducts = [
    ...sliceProducts,
    ...sliceProducts,
    ...sliceProducts
  ];

  return (
    <section className="new-arrivals-section reveal-section reveal-active" style={{ background: 'transparent', border: 'none', paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="container">
        <h2 className="section-title-new" style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h2>
      </div>
      
      <div 
        className="new-arrivals-carousel-outer"
        style={{ cursor: 'grab' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="new-arrivals-carousel-viewport">
          <div 
            className="new-arrivals-carousel-track-pop"
            style={{ 
              '--active-index': carouselIndex,
              ...(noAnim ? { transition: 'none' } : {})
            }}
          >
            {tripledProducts.map((targetProduct, idx) => {
              const isActive = idx === carouselIndex;
              return (
                <div 
                  key={idx} 
                  className={`new-arrival-item-card-pop ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    if (Math.abs(mouseDragDist.current) > 10) {
                      e.preventDefault();
                      e.stopPropagation();
                      mouseDragDist.current = 0;
                      return;
                    }
                    onNavigateProduct(targetProduct.id);
                  }}
                >
                  <div className="new-arrival-image-wrapper">
                    <img src={targetProduct.image} alt={targetProduct.name} className="new-arrival-image" />
                    {targetProduct.stock <= 0 ? (
                      <span className="new-arrival-badge" style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 800 }}>OUT OF STOCK</span>
                    ) : (
                      <span className="new-arrival-badge">{targetProduct.tag}</span>
                    )}
                  </div>
                  <div className="new-arrival-details">
                    <h4 className="new-arrival-name">{targetProduct.name}</h4>
                    <span className="new-arrival-price">₹{targetProduct.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </div>

      {/* Dot Pagination */}
      <div className="new-arrivals-pagination-dots">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((dotIndex) => (
          <button 
            key={dotIndex}
            className={`new-arrivals-pagination-dot ${((carouselIndex % 10) + 10) % 10 === dotIndex ? 'active' : ''}`}
            onClick={() => setCarouselIndex(10 + dotIndex)}
            aria-label={`Go to slide ${dotIndex + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   SHARED FILTERABLE PRODUCT SECTION
   ========================================================================== */
function FilterableProductsBlock({ 
  products, 
  wishlist, 
  toggleWishlist, 
  onNavigateProduct, 
  activeTab: externalActiveTab, 
  setActiveTab: externalSetActiveTab,
  categories = [],
  title = 'OUR COLLECTION',
  dbCategories = [],
  hideFitOptions = false
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('All');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab !== undefined ? externalSetActiveTab : setInternalActiveTab;

  const [activeGenderTab, setActiveGenderTab] = useState('ALL');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('ALL');

  useEffect(() => {
    setSelectedSubCategoryId('ALL');
  }, [activeTab]);

  const activeParentCat = dbCategories.find(c => String(c.id) === String(activeTab) || c.name.toUpperCase() === String(activeTab).toUpperCase());
  const childCats = activeParentCat 
    ? dbCategories.filter(c => c.is_active && c.parent_id === activeParentCat.id) 
    : [];

  const fallbackChildCats = [
    { id: 'Oversized T-Shirts', name: 'Oversized T-Shirt' },
    { id: 'Regular Fit T-Shirts', name: 'Regular Fit' },
    { id: 'Sweatshirts', name: 'Sweatshirts' },
    { id: 'Hoodies', name: 'Hoodies' }
  ];
  
  const displayChildCats = childCats.length > 0 ? childCats : fallbackChildCats;

  const rootOnlyNames = ['CUSTOMIZATION', 'EMBROIDERED APPAREL'];

  const cleanCategories = categories.length > 0
    ? categories
    : [];

  const tabs = cleanCategories.length > 0 ? [
    { label: 'All', value: 'All' },
    ...cleanCategories.map(c => ({
      label: c.name,
      value: c.id ? String(c.id) : c.name
    }))
  ] : [
    { label: 'All', value: 'All' },
    ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))
      .filter(cat => !rootOnlyNames.includes((cat || '').trim().toUpperCase()))
      .map(cat => ({
        label: cat,
        value: cat
      }))
  ];

  const filteredProducts = products.filter(p => {
    // 1. Gender Filter
    let matchesGender;
    if (activeGenderTab === 'ALL') {
      matchesGender = true;
    } else if (activeGenderTab === 'UNISEX') {
      matchesGender = p.gender === 'UNISEX';
    } else {
      matchesGender = p.gender === activeGenderTab || p.gender === 'UNISEX';
    }
    if (!matchesGender) return false;

    // 2. Category Filter
    let matchesCategory = false;
    if (activeTab === 'All' || !activeTab) {
      matchesCategory = true;
    } else if (activeTab === 'TRENDING') {
      matchesCategory = (p.subCategories || []).includes('TRENDING') || (p.tag || '').toUpperCase() === 'TRENDING';
    } else if (activeTab === 'NEW COLLECTIONS') {
      matchesCategory = (p.subCategories || []).includes('NEW COLLECTIONS') || (p.tag || '').toUpperCase() === 'NEW';
    } else {
      const tabUpper = String(activeTab).toUpperCase().replace(/^CATEGORY:/i, '');
      const matchesName = (p.categoryNames || []).some(name => name === tabUpper || name.includes(tabUpper) || tabUpper.includes(name));
      const matchesIds = (p.categoryIds || []).some(id => String(id) === String(activeTab));
      const matchesDirectName = (p.category || '').toUpperCase() === tabUpper || tabUpper.includes((p.category || '').toUpperCase());
      const matchesTags = (p.tags || []).some(t => {
        const tagStr = (typeof t === 'string' ? t : t.name || '').toUpperCase();
        return tagStr === tabUpper || tagStr.includes(tabUpper) || tabUpper.includes(tagStr);
      });
      matchesCategory = matchesName || matchesIds || matchesDirectName || matchesTags || matchProductFitOrTag(p, activeTab);
    }
    if (!matchesCategory) return false;

    // 3. Subcategory Filter (Fit Style Option)
    if (selectedSubCategoryId === 'ALL') return true;
    return matchProductFitOrTag(p, selectedSubCategoryId);
  });

  // Ensure products never disappear if subcategory string mismatch occurs
  const finalProducts = (filteredProducts.length > 0 || activeTab === 'All' || !activeTab)
    ? filteredProducts
    : products.filter(p => activeGenderTab === 'ALL' || p.gender === activeGenderTab || p.gender === 'UNISEX');

  return (
    <section id="customization-catalog" className="catalog-section container">
      <h2 className="section-title-new" style={{ textAlign: 'center' }}>{title}</h2>
      
      {/* Gender Tabs */}
      <div className="catalog-gender-tabs" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        {['ALL', 'MEN', 'WOMEN', 'UNISEX'].map((gender) => (
          <button 
            key={gender} 
            className={`catalog-gender-tab ${activeGenderTab === gender ? 'active' : ''}`}
            onClick={() => setActiveGenderTab(gender)}
          >
            {gender}
          </button>
        ))}
      </div>

      {/* Category Tabs (Tier 1) - Only shown when activeTab === 'All' */}
      {activeTab === 'All' && tabs.length > 1 && (
        <div className="catalog-filter-pills" style={{ marginBottom: '25px' }}>
          {tabs.map((tab) => (
            <button 
              key={tab.value} 
              className={`catalog-filter-pill ${String(activeTab).toUpperCase() === String(tab.value).toUpperCase() ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-category / Fit Option Row (Tier 2) */}
      {!hideFitOptions && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '35px' }}>
          {activeTab !== 'All' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '6px 16px', backgroundColor: '#111827', color: '#ffffff', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <span>Category:</span>
              <span style={{ color: 'var(--color-primary)' }}>
                {(() => {
                  const match = categories.find(c => String(c.id) === String(activeTab) || c.name.toUpperCase() === String(activeTab).toUpperCase());
                  return match ? match.name : activeTab;
                })()}
              </span>
              <button 
                type="button"
                onClick={() => setActiveTab('All')}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, marginLeft: '4px', display: 'flex', alignItems: 'center' }}
                title="Show All Categories"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="catalog-filter-pills subcategories-pills-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '10px 15px', backgroundColor: 'var(--color-bg-alt, #f8fafc)', borderRadius: '12px', border: '1px solid var(--color-border, #e2e8f0)', width: 'fit-content' }}>
            {[
              { id: 'ALL', name: 'ALL' },
              ...displayChildCats.map(c => ({ id: c.id, name: c.name.toUpperCase() }))
            ].map((sub) => (
              <button 
                key={sub.id} 
                className={`catalog-filter-pill sub-pill ${selectedSubCategoryId === sub.id ? 'active' : ''}`}
                onClick={() => setSelectedSubCategoryId(sub.id)}
                style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '8px' }}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="product-grid" key={`${activeGenderTab}-${activeTab}-${selectedSubCategoryId}`}>
        {finalProducts.length > 0 ? (
          finalProducts.map((product) => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => onNavigateProduct(product.id)}
            >
              <div className="product-card-img-wrapper">
                <img src={product.image} alt={product.name} className="product-card-image" />
                <button 
                  className={`product-card-wishlist ${wishlist.includes(product.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  aria-label="Add to wishlist"
                >
                  <Heart fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                </button>
                {product.stock <= 0 ? (
                  <span className="product-card-tag" style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 800, right: '12px', left: 'auto' }}>
                    OUT OF STOCK
                  </span>
                ) : (
                  <span className="product-card-tag">{product.tag}</span>
                )}
              </div>
              <div className="product-card-info">
                <span className="product-card-category">{product.category}</span>
                <h4 className="product-card-title">{product.name}</h4>
                
                {/* Rating show on card */}
                <div className="product-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                  <div className="product-card-stars" style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < Math.floor(product.rating || 4.8) ? 'star-filled' : 'star-empty'} />
                    ))}
                  </div>
                  <span className="product-card-rating-num" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{product.rating || '4.8'}</span>
                </div>

                <div className="product-price-layout">
                  {product.originalPrice ? (
                    <div className="product-price-discount-box">
                      <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="price-sale">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="price-discount-percent">{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>
                    </div>
                  ) : (
                    <span className="price-sale-only">₹{product.price.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products-msg">No products found in this category.</div>
        )}
      </div>
    </section>
  );
}

/* ==========================================================================
   DEDICATED WISHLIST PAGE COMPONENT
   ========================================================================== */
function WishlistPage({ 
  products = [], 
  wishlist = [], 
  toggleWishlist, 
  onNavigateProduct, 
  onGoHome,
  addToCart
}) {
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="wishlist-page-wrapper container animate-fade-in" style={{ padding: '40px 0 60px', minHeight: '60vh' }}>
      <div className="wishlist-header" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 className="section-title-new" style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>
          My Wishlist {wishlistProducts.length > 0 && <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 700 }}>({wishlistProducts.length})</span>}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          {wishlistProducts.length > 0 ? 'Your saved items for later' : 'Save your favorite items here to view or shop anytime'}
        </p>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {wishlistProducts.map((product) => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => onNavigateProduct(product.id)}
            >
              <div className="product-card-img-wrapper">
                <img src={product.image} alt={product.name} className="product-card-image" />
                <button 
                  className="product-card-wishlist active"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  aria-label="Remove from wishlist"
                  title="Remove from wishlist"
                >
                  <Heart fill="currentColor" />
                </button>
                {product.tag && <span className="product-card-tag">{product.tag}</span>}
              </div>
              <div className="product-card-info">
                <span className="product-card-category">{product.category}</span>
                <h4 className="product-card-title">{product.name}</h4>
                <div className="product-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                  <div className="product-card-stars" style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < Math.floor(product.rating || 4.8) ? 'star-filled' : 'star-empty'} />
                    ))}
                  </div>
                  <span className="product-card-rating-num" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{product.rating || '4.8'}</span>
                </div>
                <div className="product-price-layout">
                  {product.originalPrice ? (
                    <div className="product-price-discount-box">
                      <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="price-sale">₹{product.price.toLocaleString('en-IN')}</span>
                      <span className="price-discount-percent">{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</span>
                    </div>
                  ) : (
                    <span className="price-sale-only">₹{product.price.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-wishlist-box" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--color-bg-alt, #f8fafc)', borderRadius: '16px', border: '1px solid var(--color-border, #e2e8f0)', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(227, 30, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--color-primary)' }}>
            <Heart size={36} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '10px', color: 'var(--color-text-dark)' }}>Your Wishlist is Empty</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '25px', lineHeight: 1.5 }}>
            Explore our custom streetwear and embroidered collections to save your favorite pieces here!
          </p>
          <button 
            type="button" 
            onClick={onGoHome} 
            className="btn-solid-red"
            style={{ padding: '12px 30px', fontSize: '0.9rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            Explore Collection
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   1. CUSTOMIZATION LANDING PAGE
   ========================================================================== */
function CustomizationLandingPage({ products, wishlist, toggleWishlist, onNavigateProduct, onGoHome, dbCategories = [], dbBanners = [], onCategoryClick, activeCategory = 'All', setActiveCategory }) {
  const customizationCats = dbCategories.filter(c => {
    const nameUpper = (c.name || '').trim().toUpperCase();
    const isRootName = ['CUSTOMIZATION', 'CUSTOM', 'CUSTOM APPAREL'].includes(nameUpper);
    const isTargetPage = (!c.show_in_pages || c.show_in_pages.split(',').map(s => s.trim()).includes('customization'));
    return c.is_active !== false && String(c.is_active) !== '0' && !isRootName && isTargetPage;
  });
  const customizationCatIds = customizationCats.map(c => String(c.id));
  const customizationCatNames = customizationCats.map(c => c.name.toUpperCase());

  const heroBanner = dbBanners.find(b => b.position === 'customization_hero' && String(b.is_active) !== '0' && b.is_active !== false);

  const heroTag = heroBanner?.subtitle || "Custom Customs";
  const heroTitle = heroBanner?.title || "Your design, our premium craftsmanship.";
  const heroDesc = heroBanner?.description || "Upload custom logos, sketches or text, and our embroidery specialists will recreate them on high-weight cotton styles.";
  const heroImage = heroBanner?.image_url ? formatImageUrl(heroBanner.image_url) : "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=1200&auto=format&fit=crop";
  const heroCta = heroBanner?.link_text || "Start Customizing";

  const categories = customizationCats.length > 0 ? customizationCats.map(c => ({
    id: c.id,
    name: c.name,
    img: formatImageUrl(c.image),
    filter: c.name.toUpperCase(),
    redirect_to: c.redirect_to,
    gender: c.gender
  })) : [
    { name: "Logo Embroidery", img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop" },
    { name: "Customize Embroidery", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop" },
    { name: "Portrait Embroidery", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop" }
  ];

  const pageProducts = customizationCats.length > 0 ? products.filter(p => {
    const matchesId = (p.categoryIds || []).some(id => customizationCatIds.includes(String(id)));
    const matchesName = (p.categoryNames || []).some(name => customizationCatNames.includes(name.toUpperCase()));
    const matchesMainName = p.category && customizationCatNames.includes(p.category.toUpperCase());
    return matchesId || matchesName || matchesMainName;
  }) : products;

  const trendingProducts = pageProducts.slice(0, 4);

  return (
    <div className="landing-page animate-fade-in">
      <LandingPageHero 
        tag={heroTag}
        title={heroTitle}
        desc={heroDesc}
        image={heroImage}
        ctaText={heroCta}
        onGoHome={onGoHome}
        onCtaClick={() => { document.getElementById('customization-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
      />
      <TrustBadges />
      <LandingCategories 
        categories={categories} 
        onCategoryClick={(cat) => {
          const redirect = cat.redirect_to || cat.redirectTo || '';
          if (redirect && ['customization', 'embroidered', 'patches', 'home'].includes(redirect)) {
            onCategoryClick(cat);
          } else {
            const filterValue = cat.id ? String(cat.id) : (cat.name || 'All');
            setActiveCategory(filterValue);
            setTimeout(() => {
              document.getElementById('customization-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }} 
      />
      <LandingProductGrid 
        title="Trending Now" 
        products={trendingProducts}
        onNavigateProduct={onNavigateProduct}
      />
      <FilterableProductsBlock 
        title="CUSTOM APPAREL CATALOG"
        products={pageProducts}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onNavigateProduct={onNavigateProduct}
        activeTab={activeCategory}
        setActiveTab={setActiveCategory}
        categories={categories}
        dbCategories={dbCategories}
      />
    </div>
  );
}

/* ==========================================================================
   2. EMBROIDERED APPAREL LANDING PAGE
   ========================================================================== */
function EmbroideredLandingPage({ products, wishlist, toggleWishlist, onNavigateProduct, onGoHome, dbCategories = [], dbBanners = [], onCategoryClick, activeCategory = 'All', setActiveCategory }) {
  const embroideredCats = dbCategories.filter(c => {
    const nameUpper = (c.name || '').trim().toUpperCase();
    const isRootName = ['EMBROIDERED APPAREL', 'EMBROIDERED'].includes(nameUpper);
    const isTargetPage = (!c.show_in_pages || c.show_in_pages.split(',').map(s => s.trim()).includes('embroidered'));
    return c.is_active !== false && String(c.is_active) !== '0' && !isRootName && isTargetPage;
  });
  const embroideredCatIds = embroideredCats.map(c => String(c.id));
  const embroideredCatNames = embroideredCats.map(c => c.name.toUpperCase());

  const heroBanner = dbBanners.find(b => b.position === 'embroidered_hero' && String(b.is_active) !== '0' && b.is_active !== false);
  const campaignBanner = dbBanners.find(b => b.position === 'campaign_embroidered' && String(b.is_active) !== '0' && b.is_active !== false);

  const heroTag = heroBanner?.subtitle || "Premium Embroidered";
  const heroTitle = heroBanner?.title || "Heavyweight fabrics, high-density stitches.";
  const heroDesc = heroBanner?.description || "Explore our collection of custom anime graphics, cyberpunk typography, and classic streetwear art embroidered to perfection.";
  const heroImage = heroBanner?.image_url ? formatImageUrl(heroBanner.image_url) : "/images/hero_banner.png";
  const heroCta = heroBanner?.link_text || "Shop New Collection";

  const campaignBadge = campaignBanner?.subtitle || "CAMPAIGN 2026";
  const campaignTitle = campaignBanner?.title || "Fearless Stitches";
  const campaignDesc = campaignBanner?.description || "Built for durability, designed to stand out. Our latest collection challenges standard embroidery styles with thick, multi-layered 3D stitches.";
  const campaignImage = campaignBanner?.image_url ? formatImageUrl(campaignBanner.image_url) : "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1000&auto=format&fit=crop";
  const campaignCta = campaignBanner?.link_text || "Explore Campaign";

  const categories = embroideredCats.length > 0 ? embroideredCats.map(c => ({
    id: c.id,
    name: c.name,
    img: formatImageUrl(c.image),
    filter: c.name.toUpperCase(),
    redirect_to: c.redirect_to,
    gender: c.gender
  })) : [
    { name: "Streetwear Embroidery", img: "/images/products/demon_mask_tee.png" },
    { name: "Artwork Embroidery", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" },
    { name: "Anime Embroidery", img: "/images/products/chaos_anime_tee.png" }
  ];

  const pageProducts = embroideredCats.length > 0 ? products.filter(p => {
    const matchesId = (p.categoryIds || []).some(id => embroideredCatIds.includes(String(id)));
    const matchesName = (p.categoryNames || []).some(name => embroideredCatNames.includes(name.toUpperCase()));
    const matchesMainName = p.category && embroideredCatNames.includes(p.category.toUpperCase());
    return matchesId || matchesName || matchesMainName;
  }) : products;

  const newArrivals = pageProducts.slice(0, 4);

  return (
    <div className="landing-page animate-fade-in">
      <LandingPageHero 
        tag={heroTag}
        title={heroTitle}
        desc={heroDesc}
        image={heroImage}
        ctaText={heroCta}
        onGoHome={onGoHome}
        onCtaClick={() => { document.getElementById('customization-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
      />
      <TrustBadges />
      <LandingCategories 
        categories={categories} 
        onCategoryClick={(cat) => {
          const redirect = cat.redirect_to || cat.redirectTo || '';
          if (redirect && ['customization', 'embroidered', 'patches', 'home'].includes(redirect)) {
            onCategoryClick(cat);
          } else {
            const filterValue = cat.id ? String(cat.id) : (cat.name || 'All');
            setActiveCategory(filterValue);
            setTimeout(() => {
              document.getElementById('customization-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }} 
      />

      {/* Campaign Section */}
      <section className="campaign-banner-section container">
        <div className="campaign-banner-card">
          <div className="campaign-banner-content">
            <span className="campaign-badge-red">{campaignBadge}</span>
            <h2 className="campaign-banner-title">{campaignTitle}</h2>
            <p className="campaign-banner-desc">{campaignDesc}</p>
            <button className="btn-solid-red" onClick={() => { document.getElementById('customization-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}>{campaignCta}</button>
          </div>
          <div className="campaign-banner-bg" style={{ backgroundImage: `url('${campaignImage}')` }} />
        </div>
      </section>

      <LandingProductGrid 
        title="New Arrivals" 
        products={newArrivals}
        onNavigateProduct={onNavigateProduct}
      />
      <FilterableProductsBlock 
        title="EMBROIDERED APPAREL CATALOG"
        products={pageProducts}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onNavigateProduct={onNavigateProduct}
        activeTab={activeCategory}
        setActiveTab={setActiveCategory}
        categories={categories}
        dbCategories={dbCategories}
      />
    </div>
  );
}

/* ==========================================================================
   3. PATCHES LANDING PAGE
   ========================================================================== */
function PatchesLandingPage({ products, wishlist, toggleWishlist, onNavigateProduct, onGoHome, dbCategories = [], dbBanners = [], onCategoryClick, activeCategory = 'All', setActiveCategory }) {
  const patchesCats = dbCategories.filter(c => {
    const nameUpper = (c.name || '').trim().toUpperCase();
    const isRootName = ['PATCHES', 'PATCH'].includes(nameUpper);
    const isTargetPage = (!c.show_in_pages || c.show_in_pages.split(',').map(s => s.trim()).includes('patches'));
    return c.is_active !== false && String(c.is_active) !== '0' && !isRootName && isTargetPage;
  });
  const patchesCatIds = patchesCats.map(c => String(c.id));
  const patchesCatNames = patchesCats.map(c => c.name.toUpperCase());

  const heroBanner = dbBanners.find(b => b.position === 'patches_hero' && String(b.is_active) !== '0' && b.is_active !== false);

  const heroTag = heroBanner?.subtitle || "Premium Stitched Patches";
  const heroTitle = heroBanner?.title || "Personalize anything instantly.";
  const heroDesc = heroBanner?.description || "High-density collectible thread art patches with premium merrowed borders. Designed to be sewn or ironed onto bags, jackets, or denim.";
  const heroImage = heroBanner?.image_url ? formatImageUrl(heroBanner.image_url) : "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1200&auto=format&fit=crop";
  const heroCta = heroBanner?.link_text || "View All Patches";

  const categories = patchesCats.length > 0 ? patchesCats.map(c => ({
    id: c.id,
    name: c.name,
    img: formatImageUrl(c.image),
    filter: c.name.toUpperCase(),
    redirect_to: c.redirect_to,
    gender: c.gender
  })) : [
    { name: "Velcro Patches", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop" },
    { name: "Iron-On Patches", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" },
    { name: "Sew-On Patches", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop" }
  ];

  const pageProducts = patchesCats.length > 0 ? products.filter(p => {
    const matchesId = (p.categoryIds || []).some(id => patchesCatIds.includes(String(id)));
    const matchesName = (p.categoryNames || []).some(name => patchesCatNames.includes(name.toUpperCase()));
    const matchesMainName = p.category && patchesCatNames.includes(p.category.toUpperCase());
    return matchesId || matchesName || matchesMainName;
  }) : products;

  const trendingPatches = pageProducts.slice(0, 4);

  return (
    <div className="landing-page animate-fade-in">
      <LandingPageHero 
        tag={heroTag}
        title={heroTitle}
        desc={heroDesc}
        image={heroImage}
        ctaText={heroCta}
        onGoHome={onGoHome}
        onCtaClick={() => { document.getElementById('customization-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
      />
      <TrustBadges />
      <LandingCategories 
        categories={categories} 
        onCategoryClick={(cat) => {
          const redirect = cat.redirect_to || cat.redirectTo || '';
          if (redirect && ['customization', 'embroidered', 'patches', 'home'].includes(redirect)) {
            onCategoryClick(cat);
          } else {
            const filterValue = cat.id ? String(cat.id) : (cat.name || 'All');
            setActiveCategory(filterValue);
            setTimeout(() => {
              document.getElementById('customization-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }} 
      />
      <LandingProductGrid 
        title="Trending Now" 
        products={trendingPatches}
        onNavigateProduct={onNavigateProduct}
      />
      <FilterableProductsBlock 
        title="PATCHES CATALOG"
        products={pageProducts}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onNavigateProduct={onNavigateProduct}
        activeTab={activeCategory}
        setActiveTab={setActiveCategory}
        categories={categories}
        dbCategories={dbCategories}
        hideFitOptions={true}
      />
    </div>
  );
}

/* ==========================================================================
   4. USER PROFILE PAGE COMPONENT
   ========================================================================== */
function ProfilePage({ 
  user, 
  token, 
  API_BASE, 
  wishlist = [], 
  products = [], 
  toggleWishlist, 
  activeTab = 'details', 
  setActiveTab = () => {}, 
  addresses = [], 
  setAddresses = () => {}, 
  orders = [], 
  setOrders = () => {}, 
  orderLoading = false, 
  setOrderLoading = () => {}, 
  addressLoading = false, 
  setAddressLoading = () => {}, 
  onLogout, 
  onNavigateProduct, 
  onGoHome,
  onChangeView
}) {

  const [activeAddressForm, setActiveAddressForm] = useState(null); // null | 'new' | addressObj
  const [addressFirstName, setAddressFirstName] = useState('');
  const [addressLastName, setAddressLastName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('India');
  const [addressIsDefault, setAddressIsDefault] = useState(false);

  const [detailsFirstName, setDetailsFirstName] = useState(user?.first_name || '');
  const [detailsLastName, setDetailsLastName] = useState(user?.last_name || '');
  const [detailsPhone, setDetailsPhone] = useState(user?.phone || '');
  const [detailsEmail, setDetailsEmail] = useState(user?.email || '');
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDetailsFirstName(user.first_name || '');
      setDetailsLastName(user.last_name || '');
      setDetailsPhone(user.phone || '');
      setDetailsEmail(user.email || '');
    }
  }, [user]);

  if (!token || !user) {
    return (
      <div className="container animate-fade-in" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ maxWidth: '450px', margin: '0 auto', padding: '40px 30px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(227, 30, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-primary)' }}>
            <User size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', color: 'var(--color-text-dark)' }}>Sign In to View Your Account</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Please log in to manage your profile, view order history, and saved addresses.
          </p>
          <button 
            type="button"
            onClick={() => { window.location.hash = '#auth'; }} 
            className="btn-solid-red" 
            style={{ padding: '12px 30px', fontSize: '0.9rem', width: 'auto', display: 'inline-block' }}
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const formatUserError = (status, data, actionName = 'perform this action') => {
    if (status === 401 || data?.message === 'Unauthenticated.' || data?.message?.toLowerCase().includes('unauthenticated')) {
      return {
        title: 'Session Expired (Unauthenticated)',
        message: 'Your login token is no longer valid or has expired.',
        howToFix: 'Please sign in again to refresh your authentication.',
        isAuthError: true
      };
    }
    
    if (status === 403) {
      return {
        title: 'Permission Denied',
        message: data?.message || `You do not have permission to ${actionName}.`,
        howToFix: 'Please sign out and log back in with an authorized account.'
      };
    }
    
    if (status === 422 || data?.errors) {
      let errorDetails = '';
      if (data?.errors && typeof data.errors === 'object') {
        errorDetails = Object.entries(data.errors)
          .map(([field, errs]) => `${field.replace('_', ' ')}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
          .join('\n• ');
      } else {
        errorDetails = data?.message || 'Invalid input data provided.';
      }
      return {
        title: 'Validation Error',
        message: `The submitted details could not be validated:\n• ${errorDetails}`,
        howToFix: 'Please check the required fields, correct any mistakes, and try again.'
      };
    }
    
    if (status >= 500) {
      return {
        title: 'Server Error',
        message: data?.message || 'The server encountered an error processing your request.',
        howToFix: 'Please wait a moment and try again.'
      };
    }

    return {
      title: 'Action Failed',
      message: data?.message || `Could not ${actionName}.`,
      howToFix: 'Please double-check your entries and try again.'
    };
  };

  const showAlertError = (errObj) => {
    alert(`⚠️ ${errObj.title}\n\nWhy it happened:\n${errObj.message}\n\nHow to fix:\n${errObj.howToFix}`);
    if (errObj.isAuthError && typeof onLogout === 'function') {
      onLogout();
    }
  };

  const fetchAddresses = async () => {
    const currentToken = token || localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!currentToken) return;
    setAddressLoading(true);
    try {
      const pRes = await fetch(`${API_BASE}/customer/profile`, {
        headers: { 'Authorization': `Bearer ${currentToken}`, 'Accept': 'application/json' }
      });
      const pData = await pRes.json();
      if (pRes.ok && pData.success && pData.data?.id) {
        const customerId = pData.data.id;
        const res = await fetch(`${API_BASE}/customer/${customerId}/addresses`, {
          headers: { 'Authorization': `Bearer ${currentToken}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAddresses(Array.isArray(data.data) ? data.data : []);
        } else if (res.status === 401) {
          showAlertError(formatUserError(401, data, 'load addresses'));
        }
      } else if (pRes.status === 401) {
        showAlertError(formatUserError(401, pData, 'load account profile'));
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchOrders = async () => {
    const currentToken = token || localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!currentToken) return;
    setOrderLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/orders`, {
        headers: { 'Authorization': `Bearer ${currentToken}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const orderList = data.data?.data || data.data;
        setOrders(Array.isArray(orderList) ? orderList : []);
      } else if (res.status === 401) {
        showAlertError(formatUserError(401, data, 'load order history'));
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const currentToken = token || localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!currentToken) {
      showAlertError(formatUserError(401, null, 'update profile'));
      return;
    }
    setDetailsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${currentToken}`, 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          first_name: detailsFirstName,
          last_name: detailsLastName,
          phone: detailsPhone
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Profile details updated successfully!');
        const updatedUser = { ...user, first_name: detailsFirstName, last_name: detailsLastName, phone: detailsPhone };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        const errObj = formatUserError(res.status, data, 'update profile details');
        showAlertError(errObj);
      }
    } catch (err) {
      console.error(err);
      alert('⚠️ Network Error\n\nWhy it happened:\nUnable to connect to the server.\n\nHow to fix:\nPlease check your internet connection and try again.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenAddressForm = (mode, addr = null) => {
    if (mode === 'new') {
      setActiveAddressForm('new');
      setAddressFirstName(user?.first_name || '');
      setAddressLastName(user?.last_name || '');
      setAddressPhone(user?.phone || '');
      setAddressLine1('');
      setAddressLine2('');
      setAddressCity('');
      setAddressState('');
      setAddressPostalCode('');
      setAddressCountry('India');
      setAddressIsDefault(false);
    } else {
      setActiveAddressForm(addr);
      setAddressFirstName(addr.first_name || '');
      setAddressLastName(addr.last_name || '');
      setAddressPhone(addr.phone || '');
      setAddressLine1(addr.address_line1 || '');
      setAddressLine2(addr.address_line2 || '');
      setAddressCity(addr.city || '');
      setAddressState(addr.state || '');
      setAddressPostalCode(addr.postal_code || '');
      setAddressCountry(addr.country || 'India');
      setAddressIsDefault(!!addr.is_default);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const currentToken = token || localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!currentToken) {
      showAlertError(formatUserError(401, null, 'save address'));
      return;
    }
    try {
      const pRes = await fetch(`${API_BASE}/customer/profile`, {
        headers: { 'Authorization': `Bearer ${currentToken}`, 'Accept': 'application/json' }
      });
      const pData = await pRes.json();
      
      if (!pRes.ok) {
        const errObj = formatUserError(pRes.status, pData, 'retrieve customer profile');
        showAlertError(errObj);
        return;
      }

      if (pData.success && pData.data?.id) {
        const customerId = pData.data.id;
        const payload = {
          first_name: addressFirstName || user?.first_name || 'Customer',
          last_name: addressLastName || user?.last_name || '',
          phone: addressPhone || user?.phone || '',
          address_line1: addressLine1,
          address_line2: addressLine2 || '',
          city: addressCity,
          state: addressState,
          postal_code: addressPostalCode,
          pincode: addressPostalCode,
          country: addressCountry || 'India',
          is_default: Boolean(addressIsDefault)
        };

        let res;
        if (activeAddressForm === 'new') {
          res = await fetch(`${API_BASE}/customer/${customerId}/addresses`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${currentToken}`, 
              'Accept': 'application/json' 
            },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch(`${API_BASE}/customer/${customerId}/addresses/${activeAddressForm.id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${currentToken}`, 
              'Accept': 'application/json' 
            },
            body: JSON.stringify(payload)
          });
        }

        const data = await res.json();
        if (res.ok && data.success) {
          alert('Address saved successfully!');
          setActiveAddressForm(null);
          fetchAddresses();
        } else {
          const errObj = formatUserError(res.status, data, 'save address');
          showAlertError(errObj);
        }
      } else {
        showAlertError(formatUserError(pRes.status, pData, 'retrieve customer profile'));
      }
    } catch (err) {
      console.error(err);
      alert('⚠️ Network Error\n\nWhy it happened:\nUnable to connect to the server.\n\nHow to fix:\nPlease check your internet connection and try again.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    const currentToken = token || localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!currentToken) {
      showAlertError(formatUserError(401, null, 'delete address'));
      return;
    }
    try {
      const pRes = await fetch(`${API_BASE}/customer/profile`, {
        headers: { 'Authorization': `Bearer ${currentToken}`, 'Accept': 'application/json' }
      });
      const pData = await pRes.json();
      if (pRes.ok && pData.success && pData.data?.id) {
        const customerId = pData.data.id;
        const res = await fetch(`${API_BASE}/customer/${customerId}/addresses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${currentToken}`, 'Accept': 'application/json' }
        });
        if (res.ok) {
          fetchAddresses();
        } else {
          const data = await res.json();
          const errObj = formatUserError(res.status, data, 'delete address');
          showAlertError(errObj);
        }
      } else {
        const errObj = formatUserError(pRes.status, pData, 'delete address');
        showAlertError(errObj);
      }
    } catch (err) {
      console.error(err);
      alert('⚠️ Network Error\n\nWhy it happened:\nUnable to connect to the server.\n\nHow to fix:\nPlease check your internet connection and try again.');
    }
  };


  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
      <div className="breadcrumb-nav">
        <button onClick={onGoHome} className="back-btn"><ArrowLeft size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Back to Home</button>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current font-bold">My Account</span>
      </div>

      <div className="profile-layout">
        {/* Left Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-user-info">
            <div className="profile-avatar-circle">
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </div>
            <h4 className="profile-user-name">{user?.first_name} {user?.last_name}</h4>
            <p className="profile-user-email">{user?.email}</p>
          </div>

          <nav className="profile-menu">
            <button 
              className={`profile-menu-item ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => { setActiveTab('details'); setActiveAddressForm(null); }}
            >
              <User size={16} /> My Details
            </button>
            <button 
              className={`profile-menu-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => { setActiveTab('addresses'); setActiveAddressForm(null); }}
            >
              <MapPin size={16} /> My Addresses
            </button>
            <button 
              className={`profile-menu-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => { setActiveTab('wishlist'); setActiveAddressForm(null); }}
            >
              <Heart size={16} /> My Wishlist
            </button>
            <button 
              className={`profile-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => { setActiveTab('orders'); setActiveAddressForm(null); }}
            >
              <Package size={16} /> Order History
            </button>
            <button 
              className="profile-menu-item logout-item"
              onClick={onLogout}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Right Content */}
        <main className="profile-content">
          {activeTab === 'details' && (
            <div>
              <h3 className="profile-content-title">Personal Details</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="profile-form-grid">
                  <div className="auth-form-group">
                    <label className="auth-label">First Name</label>
                    <input 
                      type="text" 
                      className="auth-input" 
                      value={detailsFirstName} 
                      onChange={(e) => setDetailsFirstName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Last Name</label>
                    <input 
                      type="text" 
                      className="auth-input" 
                      value={detailsLastName} 
                      onChange={(e) => setDetailsLastName(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="profile-form-grid">
                  <div className="auth-form-group">
                    <label className="auth-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="auth-input" 
                      value={detailsPhone} 
                      onChange={(e) => setDetailsPhone(e.target.value)} 
                    />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Email Address (Read-Only)</label>
                    <input 
                      type="email" 
                      className="auth-input" 
                      value={detailsEmail} 
                      disabled 
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={detailsLoading} style={{ maxWidth: '200px' }}>
                  {detailsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div className="profile-content-title">
                <span>Addresses</span>
                {!activeAddressForm && (
                  <button className="auth-submit-btn" onClick={() => handleOpenAddressForm('new')} style={{ margin: 0, padding: '8px 16px', fontSize: '0.8rem', maxWidth: '150px' }}>
                    Add New
                  </button>
                )}
              </div>

              {activeAddressForm ? (
                <form onSubmit={handleSaveAddress}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', fontSize: '0.9rem' }}>
                    {activeAddressForm === 'new' ? 'Add Address' : 'Edit Address'}
                  </h4>
                  <div className="profile-form-grid">
                    <div className="auth-form-group">
                      <label className="auth-label">First Name</label>
                      <input 
                        type="text" 
                        className="auth-input" 
                        value={addressFirstName} 
                        onChange={(e) => setAddressFirstName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="auth-form-group">
                      <label className="auth-label">Last Name</label>
                      <input 
                        type="text" 
                        className="auth-input" 
                        value={addressLastName} 
                        onChange={(e) => setAddressLastName(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="auth-input" 
                      value={addressPhone} 
                      onChange={(e) => setAddressPhone(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Address Line 1</label>
                    <input 
                      type="text" 
                      className="auth-input" 
                      value={addressLine1} 
                      onChange={(e) => setAddressLine1(e.target.value)} 
                      required 
                      placeholder="Street address, P.O. box, company name"
                    />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Address Line 2 (Optional)</label>
                    <input 
                      type="text" 
                      className="auth-input" 
                      value={addressLine2} 
                      onChange={(e) => setAddressLine2(e.target.value)} 
                      placeholder="Apartment, suite, unit, building, floor"
                    />
                  </div>
                  <div className="profile-form-grid">
                    <div className="auth-form-group">
                      <label className="auth-label">City</label>
                      <input 
                        type="text" 
                        className="auth-input" 
                        value={addressCity} 
                        onChange={(e) => setAddressCity(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="auth-form-group">
                      <label className="auth-label">State</label>
                      <input 
                        type="text" 
                        className="auth-input" 
                        value={addressState} 
                        onChange={(e) => setAddressState(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="profile-form-grid">
                    <div className="auth-form-group">
                      <label className="auth-label">Postal Code</label>
                      <input 
                        type="text" 
                        className="auth-input" 
                        value={addressPostalCode} 
                        onChange={(e) => setAddressPostalCode(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="auth-form-group">
                      <label className="auth-label">Country</label>
                      <input 
                        type="text" 
                        className="auth-input" 
                        value={addressCountry} 
                        onChange={(e) => setAddressCountry(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="auth-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="isDefaultAddress"
                      checked={addressIsDefault} 
                      onChange={(e) => setAddressIsDefault(e.target.checked)} 
                    />
                    <label htmlFor="isDefaultAddress" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', cursor: 'pointer' }}>Set as default address</label>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <button type="submit" className="auth-submit-btn" style={{ maxWidth: '180px' }}>Save Address</button>
                    <button type="button" className="auth-submit-btn" onClick={() => setActiveAddressForm(null)} style={{ maxWidth: '180px', backgroundColor: 'var(--color-text-muted)' }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div>
                  {addressLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading addresses...</div>
                  ) : (Array.isArray(addresses) && addresses.length > 0) ? (
                    <div className="address-grid">
                      {addresses.map(addr => (
                        <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                          <div>
                            {addr.is_default && <span className="address-default-badge">Default</span>}
                            <h5 className="address-name">{addr.first_name} {addr.last_name}</h5>
                            <p className="address-details">
                              {addr.address_line1}<br />
                              {addr.address_line2 && <>{addr.address_line2}<br /></>}
                              {addr.city}, {addr.state} - {addr.postal_code}<br />
                              {addr.country}
                            </p>
                            <p className="address-phone">Phone: {addr.phone}</p>
                          </div>
                          <div className="address-actions">
                            <button className="address-action-btn" onClick={() => handleOpenAddressForm('edit', addr)}>Edit</button>
                            <button className="address-action-btn delete-btn" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                      <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px' }}>You have no saved addresses.</p>
                      <button className="auth-submit-btn" onClick={() => handleOpenAddressForm('new')} style={{ maxWidth: '180px', margin: '0 auto' }}>
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h3 className="profile-content-title">Wishlist</h3>
              {wishlistProducts.length > 0 ? (
                <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {wishlistProducts.map(p => (
                    <div key={p.id} className="product-card" onClick={() => onNavigateProduct(p.id)}>
                      <div className="product-card-img-wrapper">
                        <img src={p.image} alt={p.name} className="product-card-image" />
                        <button 
                          className="product-card-wishlist active"
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                          aria-label="Remove from wishlist"
                        >
                          <Heart fill="currentColor" />
                        </button>
                      </div>
                      <div className="product-card-info" style={{ padding: '15px 0' }}>
                        <span className="product-card-category">{p.category}</span>
                        <h4 className="product-card-title">{p.name}</h4>
                        
                        {/* Rating show on card */}
                        <div className="product-card-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                          <div className="product-card-stars" style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < Math.floor(p.rating || 4.8) ? 'star-filled' : 'star-empty'} />
                            ))}
                          </div>
                          <span className="product-card-rating-num" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{p.rating || '4.8'}</span>
                        </div>

                        <div className="product-price-layout">
                          <span className="price-sale-only">₹{p.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '80px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px' }}>Your wishlist is empty.</p>
                  <button className="auth-submit-btn" onClick={onGoHome} style={{ maxWidth: '180px', margin: '0 auto' }}>
                    Shop Products
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3 className="profile-content-title">Order History</h3>
              {orderLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading your orders...</div>
              ) : (Array.isArray(orders) && orders.length > 0) ? (
                <div className="order-history-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-meta-info">
                          <div className="order-meta-item">
                            <span className="order-meta-label">Order Number</span>
                            <span className="order-meta-value">{order.order_number}</span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Placed At</span>
                            <span className="order-meta-value">
                              {new Date(order.placed_at || order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Total Amount</span>
                            <span className="order-meta-value">₹{parseFloat(order.total || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="order-meta-item">
                            <span className="order-meta-label">Payment Status</span>
                            <span className="order-meta-value" style={{ textTransform: 'uppercase' }}>{order.payment_status || 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`order-status-badge ${(order.status || 'pending').toLowerCase()}`}>{order.status || 'Pending'}</span>
                      </div>

                      <div className="order-card-body">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <div className="order-item-product-details">
                              {item.product_image ? (
                                <img src={item.product_image} alt={item.product_name} className="order-item-img" />
                              ) : (
                                <div className="order-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}><Shirt size={24} /></div>
                              )}
                              <div>
                                <h5 className="order-item-name">{item.product_name}</h5>
                                <p className="order-item-meta">
                                  Size: {item.variant_label || 'L'} | Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="order-item-price">₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '80px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px' }}>You haven't placed any orders yet.</p>
                  <button className="auth-submit-btn" onClick={onGoHome} style={{ maxWidth: '180px', margin: '0 auto' }}>
                    Shop Products
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


/* ==========================================================================
   4.5 DEDICATED AUTH PAGE COMPONENT
   ========================================================================== */
function AuthPage({ 
  authTab, 
  setAuthTab, 
  authFirstName, 
  setAuthFirstName, 
  authLastName, 
  setAuthLastName, 
  authPhone, 
  setAuthPhone, 
  authEmail, 
  setAuthEmail, 
  authPassword, 
  setAuthPassword, 
  authConfirmPassword,
  setAuthConfirmPassword,
  authError, 
  setAuthError, 
  authLoading, 
  handleLogin, 
  handleRegister, 
  onGoHome,
  API_BASE
}) {
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      setAuthError('Please enter your email address');
      return;
    }
    setAuthError('');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: authEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotSuccess(true);
      } else {
        setAuthError(data.message || 'Failed to send password reset link');
      }
    } catch (err) {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 16px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button className="checkout-back-link" onClick={onGoHome} style={{ alignSelf: 'flex-start', marginBottom: '20px' }}><ArrowLeft size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Back to Shopping</button>
      
      <div className="auth-card" style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px 24px', width: '100%', maxWidth: '440px', boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        
        {authTab !== 'forgot_password' && (
          <div className="auth-tab-pill-container">
            <button 
              type="button" 
              className={`auth-tab-pill ${authTab === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`auth-tab-pill ${authTab === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
            >
              Create Account
            </button>
          </div>
        )}

        <h3 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '20px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {authTab === 'login' ? 'Sign In to Your Account' : (authTab === 'forgot_password' ? 'Reset Password' : 'Create Your Account')}
        </h3>
        
        {authError && <div className="auth-error-alert" style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#fff0f3', border: '1px solid #ffccd5', borderRadius: '10px', color: '#e11d48', fontSize: '0.85rem', fontWeight: 600 }}>{authError}</div>}
        
        {authTab === 'forgot_password' ? (
          forgotSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✉️</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px' }}>Reset Link Sent!</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                We have sent a password reset link to <strong>{authEmail}</strong>. Please check your email inbox and follow instructions.
              </p>
              <button 
                className="auth-submit-btn" 
                onClick={() => { setAuthTab('login'); setForgotSuccess(false); setAuthError(''); }}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
                Enter your registered email address and we will send you instructions to reset your password.
              </p>
              <div className="auth-form-group" style={{ marginBottom: '20px' }}>
                <label className="auth-label">Email Address</label>
                <input 
                  type="email" 
                  className="auth-input" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  required 
                  placeholder="john@example.com" 
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={forgotLoading}>
                {forgotLoading ? 'Sending link...' : 'Send Reset Link'}
              </button>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <span 
                  style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setAuthTab('login'); setAuthError(''); }}
                >
                  <ArrowLeft size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Back to Sign In
                </span>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={authTab === 'login' ? handleLogin : handleRegister}>
            {authTab === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '12px', width: '100%', boxSizing: 'border-box' }}>
                  <div className="auth-form-group" style={{ minWidth: 0 }}>
                    <label className="auth-label">First Name</label>
                    <input 
                      type="text" 
                      className="auth-input" 
                      value={authFirstName} 
                      onChange={(e) => setAuthFirstName(e.target.value)} 
                      required 
                      placeholder="John" 
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="auth-form-group" style={{ minWidth: 0 }}>
                    <label className="auth-label">Last Name</label>
                    <input 
                      type="text" 
                      className="auth-input" 
                      value={authLastName} 
                      onChange={(e) => setAuthLastName(e.target.value)} 
                      required 
                      placeholder="Doe" 
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div className="auth-form-group" style={{ marginBottom: '12px' }}>
                  <label className="auth-label">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    className="auth-input" 
                    value={authPhone} 
                    onChange={(e) => setAuthPhone(e.target.value)} 
                    placeholder="9876543210" 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}
            <div className="auth-form-group" style={{ marginBottom: '12px' }}>
              <label className="auth-label">Email Address</label>
              <input 
                type="email" 
                className="auth-input" 
                value={authEmail} 
                onChange={(e) => setAuthEmail(e.target.value)} 
                required 
                placeholder="john@example.com" 
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Password Field with View/Hide Toggle */}
            <div className="auth-form-group" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                {authTab === 'login' && (
                  <span 
                    style={{ color: '#e11d48', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => { setAuthTab('forgot_password'); setAuthError(''); setForgotSuccess(false); }}
                  >
                    Forgot Password?
                  </span>
                )}
              </div>
              <div className="auth-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="auth-input" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field for Register */}
            {authTab === 'register' && (
              <div className="auth-form-group" style={{ marginBottom: '16px' }}>
                <label className="auth-label" style={{ marginBottom: '6px', display: 'block' }}>Confirm Password</label>
                <div className="auth-input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="auth-input" 
                    value={authConfirmPassword} 
                    onChange={(e) => setAuthConfirmPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={authLoading} style={{ marginTop: '10px' }}>
              {authLoading ? 'Please wait...' : (authTab === 'login' ? 'Sign In' : 'Register Account')}
            </button>
          </form>
        )}
        
        {authTab !== 'forgot_password' && (
          <div className="auth-switch-text" style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            {authTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <span className="auth-switch-link" style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setAuthTab('register'); setAuthError(''); }}>
                  Register here
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span className="auth-switch-link" style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setAuthTab('login'); setAuthError(''); }}>
                  Sign In here
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   5. CHECKOUT PAGE COMPONENT
   ========================================================================== */
function CheckoutPage({ user, token, cart, setCart, getCartTotal, API_BASE, products, onGoHome, onBack }) {
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod | razorpay
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shippingRatesLoading, setShippingRatesLoading] = useState(false);
  const [availableShippingRates, setAvailableShippingRates] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [shippingCost, setShippingCost] = useState(0);

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [savedAddresses, setSavedAddresses] = useState([]);

  const subtotal = (cart || []).reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const grandTotal = Math.max(0, subtotal + (Number(shippingCost) || 0) - (Number(couponDiscount) || 0));

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    if (token) {
      fetchSavedAddresses();
    }

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/customer/profile`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const pData = await pRes.json();
      if (pRes.ok && pData.success) {
        const customerId = pData.data.id;
        const res = await fetch(`${API_BASE}/customer/${customerId}/addresses`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSavedAddresses(data.data);
          const defaultAddr = data.data.find(a => a.is_default) || data.data[0];
          if (defaultAddr) {
            handleAutofillAddress(defaultAddr);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load saved addresses for checkout:', err);
    }
  };

  const handleAutofillAddress = (addr) => {
    setFirstName(addr.first_name || '');
    setLastName(addr.last_name || '');
    setPhone(addr.phone || '');
    setAddress1(addr.address_line1 || '');
    setAddress2(addr.address_line2 || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPostalCode(addr.postal_code || '');
    setCountry(addr.country || 'India');
  };

  useEffect(() => {
    if (postalCode.trim().length >= 6 && cart.length > 0) {
      fetchShippingRates();
    }
  }, [postalCode]);

  const fetchShippingRates = async () => {
    setShippingRatesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checkout/shipping-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          items: cart.map(item => {
            const dbProduct = (products || []).find(p => p.id === item.id) || item;
            const variantsList = dbProduct.variants || [];
            const variant = variantsList.find(v => v.attributes?.size?.toLowerCase() === item.size?.toLowerCase()) 
              || variantsList[0]
              || { id: item.variant_id || item.id };
            return {
              product_id: item.id,
              variant_id: variant.id,
              quantity: item.quantity
            };
          }),
          postal_code: postalCode,
          cod: paymentMethod === 'cod'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.data && data.data.length > 0) {
        setAvailableShippingRates(data.data);
        setSelectedShippingMethod(data.data[0].code);
        setShippingCost(parseFloat(data.data[0].rate));
      } else {
        setAvailableShippingRates([]);
        setShippingCost(0);
      }
    } catch (err) {
      console.error(err);
      setAvailableShippingRates([]);
      setShippingCost(0);
    } finally {
      setShippingRatesLoading(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/cart/apply-coupon`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponApplied(true);
        setCouponDiscount(parseFloat(data.data.discount_amount || 150));
        alert('Coupon code applied successfully!');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      console.error(err);
      setCouponError('Failed to apply coupon');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckoutLoading(true);

    try {
      const itemsPayload = cart.map(item => {
        const dbProduct = (products || []).find(p => p.id === item.id) || item;
        const variantsList = dbProduct.variants || [];
        const variant = variantsList.find(v => 
          v.attributes?.size?.toLowerCase() === item.size?.toLowerCase() &&
          (!item.color || v.attributes?.color?.toLowerCase() === item.color?.toLowerCase())
        ) 
          || variantsList.find(v => v.attributes?.size?.toLowerCase() === item.size?.toLowerCase())
          || variantsList[0]
          || { id: item.variant_id || item.id };
        return {
          product_id: item.id,
          variant_id: variant.id,
          quantity: item.quantity,
          meta_data: item.customOptions ? {
            photo_url: item.customOptions.photoUrl,
            embroidery_size: item.customOptions.embroiderySize,
            placement: item.customOptions.placement,
            notes: item.customOptions.notes
          } : null
        };
      });

      const payload = {
        items: itemsPayload,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          email: email,
          address_line1: address1,
          address_line2: address2 || undefined,
          city: city,
          state: state,
          postal_code: postalCode,
          country: country || 'India'
        },
        payment_method: paymentMethod,
        shipping_method_code: selectedShippingMethod || undefined,
        coupon_code: couponApplied ? couponCode : undefined
      };

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/checkout/init`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Checkout initialization failed');
        setCheckoutLoading(false);
        return;
      }

      const orderData = data.data;

      if (paymentMethod === 'cod') {
        alert(`Order placed successfully! Order Number: ${orderData.order_number}`);
        setCart([]);
        onGoHome();
      } else {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount_paise,
          currency: orderData.currency || 'INR',
          name: 'INDIUNA',
          description: `Payment for Order ${orderData.order_number}`,
          order_id: orderData.razorpay_order_id,
          handler: async function (response) {
            try {
              const verifyRes = await fetch(`${API_BASE}/checkout/verify`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  'Accept': 'application/json' 
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: orderData.order_id
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                alert(`Order placed & paid successfully! Order Number: ${orderData.order_number}`);
                setCart([]);
                onGoHome();
              } else {
                alert(verifyData.message || 'Signature verification failed');
              }
            } catch (err) {
              console.error(err);
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: `${firstName} ${lastName}`,
            email: email,
            contact: phone
          },
          theme: {
            color: '#ff2e93'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert(`An error occurred during order submission: ${err.message || err}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
      <button className="checkout-back-link" onClick={onBack || onGoHome}><ArrowLeft size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> Return to Previous Page</button>
      
      <div className="checkout-grid">
        {/* Left Column: Form */}
        <div className="checkout-form-container">
          <form onSubmit={handlePlaceOrder}>
            <h3 className="checkout-section-title">1. Customer Information</h3>
            
            {savedAddresses.length > 0 && (
              <div style={{ marginBottom: '25px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                <label className="auth-label" style={{ marginBottom: '10px', display: 'block' }}>Use a Saved Address</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {savedAddresses.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleAutofillAddress(addr)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {addr.first_name} ({addr.city})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="profile-form-grid">
              <div className="auth-form-group">
                <label className="auth-label">Email Address</label>
                <input 
                  type="email" 
                  className="auth-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="john@example.com"
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="auth-input" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                  placeholder="9876543210"
                />
              </div>
            </div>

            <h3 className="checkout-section-title">2. Shipping Address</h3>
            <div className="profile-form-grid">
              <div className="auth-form-group">
                <label className="auth-label">First Name</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">Last Name</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Address Line 1</label>
              <input 
                type="text" 
                className="auth-input" 
                value={address1} 
                onChange={(e) => setAddress1(e.target.value)} 
                required 
                placeholder="Street address, apartment, suite, unit"
              />
            </div>
            <div className="auth-form-group">
              <label className="auth-label">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                className="auth-input" 
                value={address2} 
                onChange={(e) => setAddress2(e.target.value)} 
                placeholder="Apartment, suite, unit, building, floor"
              />
            </div>

            <div className="profile-form-grid">
              <div className="auth-form-group">
                <label className="auth-label">City</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required 
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">State</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="auth-form-group">
                <label className="auth-label">Postal Code</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  value={postalCode} 
                  onChange={(e) => setPostalCode(e.target.value)} 
                  required 
                  placeholder="6-digit PIN"
                />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">Country</label>
                <input 
                  type="text" 
                  className="auth-input" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {availableShippingRates.length > 0 && (
              <div className="shipping-method-selector-group">
                <h3 className="checkout-section-title">3. Shipping Service</h3>
                {availableShippingRates.map(rate => (
                  <div 
                    key={rate.code}
                    className={`shipping-method-option ${selectedShippingMethod === rate.code ? 'active' : ''}`}
                    onClick={() => { setSelectedShippingMethod(rate.code); setShippingCost(parseFloat(rate.rate)); }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{rate.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rate.description || 'Estimated 3-5 days delivery'}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>₹{parseFloat(rate.rate)}</span>
                  </div>
                ))}
              </div>
            )}

            <h3 className="checkout-section-title">4. Payment Mode</h3>
            <div className="payment-options-grid">
              <div 
                className={`payment-option-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <Truck size={24} /> Cash on Delivery
              </div>
              <div 
                className={`payment-option-card ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('razorpay')}
              >
                <CreditCard size={24} /> Razorpay (Card/UPI)
              </div>
            </div>

            <button 
              type="submit" 
              className="checkout-place-order-btn" 
              disabled={checkoutLoading || cart.length === 0}
            >
              {checkoutLoading ? 'Processing Order...' : `Place Order (₹${grandTotal.toLocaleString('en-IN')})`}
            </button>
          </form>
        </div>

        {/* Right Column: Summary */}
        <div className="checkout-summary-container">
          <h3 className="checkout-summary-title">Order Summary</h3>
          
          <div className="checkout-summary-items-list">
            {cart.map((item, idx) => (
              <div key={idx} className="checkout-summary-item">
                <img src={item.image} alt={item.name} className="checkout-summary-item-img" />
                <div className="checkout-summary-item-details">
                  <h5 className="checkout-summary-item-name">{item.name}</h5>
                  <span className="checkout-summary-item-meta">Size: {item.size} {item.color ? `| Color: ${item.color}` : ''} | Qty: {item.quantity}</span>
                  {item.customOptions && (
                    <div className="checkout-summary-item-custom-details" style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px', borderLeft: '2px solid #e11d48', paddingLeft: '6px' }}>
                      {item.customOptions.photoUrl && (
                        <div style={{ marginBottom: '2px' }}>
                          Photo: <a href={item.customOptions.photoUrl} target="_blank" rel="noreferrer" style={{ color: '#e11d48', textDecoration: 'underline', fontWeight: 600 }}>View Design File</a>
                        </div>
                      )}
                      {item.customOptions.embroiderySize && <div style={{ marginBottom: '2px' }}>Embroidery: {item.customOptions.embroiderySize}</div>}
                      {item.customOptions.placement && <div style={{ marginBottom: '2px' }}>Placement: {item.customOptions.placement}</div>}
                      {item.customOptions.notes && <div>Notes: {item.customOptions.notes}</div>}
                    </div>
                  )}
                </div>
                <span className="checkout-summary-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleApplyCoupon} className="coupon-apply-group">
            <input 
              type="text" 
              className="coupon-input" 
              value={couponCode} 
              onChange={(e) => setCouponCode(e.target.value)} 
              placeholder="Coupon Code"
              disabled={couponApplied}
            />
            <button type="submit" className="coupon-btn" disabled={couponApplied}>Apply</button>
          </form>
          {couponApplied && <p style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600, marginBottom: '15px' }}>Discount of ₹{couponDiscount} applied!</p>}
          {couponError && <p style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600, marginBottom: '15px' }}>{couponError}</p>}

          <div className="checkout-summary-lines">
            <div className="checkout-summary-line">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="checkout-summary-line">
              <span>Shipping Charges</span>
              <span>{shippingCost > 0 ? `₹${shippingCost.toLocaleString('en-IN')}` : 'Enter ZIP above'}</span>
            </div>
            {couponApplied && (
              <div className="checkout-summary-line" style={{ color: '#15803d', fontWeight: 600 }}>
                <span>Discount</span>
                <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="checkout-summary-line grand-total">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
