import { useState, useEffect, useRef } from 'react';
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
  Dog,
  Car,
  Smile,
  Compass,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import Lenis from 'lenis';

export default function App() {
  // Loading & View States
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customization');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'product'
  const [activeProductId, setActiveProductId] = useState(1);
  
  // Announcement Bar Slider State
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  // Carousel & Filtering States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [freshDropsSlide, setFreshDropsSlide] = useState(0);
  const [newArrivalsIndex, setNewArrivalsIndex] = useState(10); // continuous, middle copy starts at 10
  const [newArrivalsNoAnim, setNewArrivalsNoAnim] = useState(false);
  const [activeGenderTab, setActiveGenderTab] = useState('ALL');
  const [activeSubCategory, setActiveSubCategory] = useState('ALL');

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
    } else {
      window.scrollTo(0, 0);
    }
  };

  // Products Data
  const products = [
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
  ];

  // Cart Handlers
  const addToCart = (product, size) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.size === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const buyNow = (product, size) => {
    addToCart(product, size);
    setIsCartOpen(true);
  };

  const updateQty = (id, size, delta) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === id && item.size === size) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const removeFromCart = (id, size) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
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
    setActiveProductId(id);
    setCurrentView('product');
    scrollToTop();
  };

  const activeProduct = products.find(p => p.id === activeProductId) || products[0];

  return (
    <>
      {/* 0. Page Loader */}
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

      {/* 1. Top Announcement Bar */}
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

      {/* 2. Header / Navbar */}
      <header className="header">
        <div className="container navbar">
          <button className="menu-toggle" aria-label="Open Menu" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu />
          </button>
          
          <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => { setCurrentView('home'); scrollToTop(); }}>
            <h1 className="logo-text">INDIUNA</h1>
            <span className="logo-subtext">Embroidery & Customs</span>
          </div>

          <div className="nav-actions">
            <button className="nav-action-btn" aria-label="Search">
              <Search />
            </button>
            <button className="nav-action-btn" aria-label="Wishlist">
              <Heart />
              {wishlist.length > 0 && <span className="cart-badge">{wishlist.length}</span>}
            </button>
            <button className="nav-action-btn" aria-label="Profile">
              <User />
            </button>
            <button className="nav-action-btn" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag />
              {cart.length > 0 && <span className="cart-badge">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Render Views dynamically */}
      
      {/* Sleek Sub-Navbar Navigation Tabs */}
      {['home', 'customization', 'embroidered', 'patches'].includes(currentView) && (
        <nav className="sub-navbar">
          <div className="container sub-navbar-container">
            <button 
              className={`sub-navbar-tab ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => { setCurrentView('home'); scrollToTop(); }}
            >
              HOME
            </button>
            <span className="sub-navbar-divider">|</span>
            <button 
              className={`sub-navbar-tab ${currentView === 'customization' ? 'active' : ''}`}
              onClick={() => { setCurrentView('customization'); scrollToTop(); }}
            >
              CUSTOMIZATION
            </button>
            <span className="sub-navbar-divider">|</span>
            <button 
              className={`sub-navbar-tab ${currentView === 'embroidered' ? 'active' : ''}`}
              onClick={() => { setCurrentView('embroidered'); scrollToTop(); }}
            >
              EMBROIDERED APPAREL
            </button>
            <span className="sub-navbar-divider">|</span>
            <button 
              className={`sub-navbar-tab ${currentView === 'patches' ? 'active' : ''}`}
              onClick={() => { setCurrentView('patches'); scrollToTop(); }}
            >
              PATCHES
            </button>
          </div>
        </nav>
      ) /* Premium Top Navigation Cards removed in favor of sleek tabs */}

      {currentView === 'home' ? (
        <>
          {/* Hero Banner — 3 auto-sliding images */}
          <section className="custom-hero-section">
            {[
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
            ].map((slide, idx) => (
              <div
                key={idx}
                className={`hero-slide ${currentSlide === idx ? 'active' : ''}`}
              >
                <div
                  className="hero-slide-bg"
                  style={{ backgroundImage: `url('${slide.image}')` }}
                />
                <div className="hero-slide-overlay" />
                <div className="hero-slide-content container">
                  <span className="hero-slide-tag">{slide.tag}</span>
                  <h1 className="hero-slide-title">
                    {slide.title.split('\n').map((line, li) => (
                      <span key={li}>{line}<br /></span>
                    ))}
                  </h1>
                  <button className="hero-slide-cta">{slide.cta}</button>
                </div>
              </div>
            ))}
            {/* Slide dots */}
            <div className="hero-dots">
              {[0,1,2].map(i => (
                <button
                  key={i}
                  className={`hero-dot ${currentSlide === i ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Slide ${i+1}`}
                />
              ))}
            </div>
          </section>

          {/* Trust Badges Bar (Compact Row) */}
          <section className="trust-badges-bar-section container">
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

          {/* Categories Section */}
          <section className="categories-section container reveal-section">
            <h2 className="categories-main-title">CATEGORIES</h2>
            <div className="categories-grid-new">
              {[
                { name: "Logo Embroidery", img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop" },
                { name: "Pet Embroidery", img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop" },
                { name: "Vehicle Embroidery", img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop" },
                { name: "Customize Embroidery", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop" },
                { name: "Portrait Embroidery", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop" },
                { name: "Artwork Embroidery", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" }
              ].map((cat, i) => (
                <div key={i} className="category-item-card-new">
                  <div className="category-image-wrapper-new">
                    <img src={cat.img} alt={cat.name} className="category-image-new" />
                  </div>
                  <h4 className="category-item-title-new">{cat.name}</h4>
                </div>
              ))}
            </div>
          </section>

          {/* Fresh Drops Section */}
          <section className="fresh-drops-section container reveal-section">
            <h2 className="section-title-new">Fresh Drops</h2>
            <div className="fresh-drops-slider-container">
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
                  
                  {/* Dots pagination instead of numbers */}
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
              
              {/* Slider Control Arrows */}
              <button 
                className="slider-arrow-btn left"
                onClick={(e) => { e.stopPropagation(); setFreshDropsSlide(prev => (prev - 1 + 3) % 3); }}
                aria-label="Previous Slide"
              >
                &larr;
              </button>
              <button 
                className="slider-arrow-btn right"
                onClick={(e) => { e.stopPropagation(); setFreshDropsSlide(prev => (prev + 1) % 3); }}
                aria-label="Next Slide"
              >
                &rarr;
              </button>
            </div>
          </section>

          {/* New Arrivals Section */}
          <section className="new-arrivals-section reveal-section">
            <div className="container">
              <h2 className="section-title-new">New Arrivals</h2>
            </div>
            
            <div className="new-arrivals-carousel-outer">
              <div className="new-arrivals-carousel-viewport">
                <div 
                  className="new-arrivals-carousel-track-pop"
                  style={{ 
                    '--active-index': newArrivalsIndex,
                    ...(newArrivalsNoAnim ? { transition: 'none' } : {})
                  }}
                >
                  {[
                    ...products.slice(0, 10), 
                    ...products.slice(0, 10), 
                    ...products.slice(0, 10)
                  ].map((targetProduct, idx) => {
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

              {/* Navigation Arrows */}
              <button 
                className="carousel-arrow-btn left" 
                onClick={() => setNewArrivalsIndex(prev => prev - 1)}
                aria-label="Previous product"
              >
                &larr;
              </button>
              <button 
                className="carousel-arrow-btn right" 
                onClick={() => setNewArrivalsIndex(prev => prev + 1)}
                aria-label="Next product"
              >
                &rarr;
              </button>
            </div>

            {/* Dot Pagination */}
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

          {/* Product Catalog tab section */}
          <section className="catalog-section container reveal-section">
            {/* Gender Tabs */}
            <div className="catalog-gender-tabs">
              {['ALL', 'MEN', 'WOMEN'].map((gender) => (
                <button 
                  key={gender} 
                  className={`catalog-gender-tab ${activeGenderTab === gender ? 'active' : ''}`}
                  onClick={() => { setActiveGenderTab(gender); }}
                >
                  {gender}
                </button>
              ))}
            </div>

            {/* Sub-category Filter Pills */}
            <div className="catalog-filter-pills">
              {['ALL', 'TRENDING', 'NEW COLLECTIONS', 'OVERSIZED T-SHIRTS', 'REGULAR FIT T-SHIRTS', 'SHIRTS', 'SWEATSHIRTS', 'T-SHIRTS'].map((sub) => (
                <button 
                  key={sub} 
                  className={`catalog-filter-pill ${activeSubCategory === sub ? 'active' : ''}`}
                  onClick={() => { setActiveSubCategory(sub); }}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Product Grid - Key bound to filters to trigger smooth entry animations */}
            <div className="product-grid" key={`${activeGenderTab}-${activeSubCategory}`}>
              {products
                .filter(p => {
                  const matchesGender = activeGenderTab === 'ALL' || p.gender === activeGenderTab || p.gender === 'UNISEX';
                  const matchesSub = activeSubCategory === 'ALL' || p.subCategories.includes(activeSubCategory);
                  return matchesGender && matchesSub;
                })
                .map((product) => (
                  <div 
                    key={product.id} 
                    className="product-card" 
                    onClick={() => navigateToProduct(product.id)}
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
                      <span className="product-card-tag">{product.tag}</span>
                    </div>
                    <div className="product-card-info">
                      <span className="product-card-category">{product.category}</span>
                      <h4 className="product-card-title">{product.name}</h4>
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
          </section>

          {/* How It Works Section */}
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

          {/* Instagram Showcase */}
          <section className="instagram-section container reveal-section">
            <div className="insta-header">
              <h2 className="section-title">Follow @Indiuna</h2>
              <p className="insta-subtitle">For Daily Style Inspo</p>
            </div>

            {/* Symmetrical Polaroidsnapshot Collage Grid (6 Items) */}
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
          onNavigateProduct={navigateToProduct}
          onGoHome={() => { setCurrentView('home'); scrollToTop(); }}
        />
      ) : currentView === 'embroidered' ? (
        <EmbroideredLandingPage 
          products={products}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onNavigateProduct={navigateToProduct}
          onGoHome={() => { setCurrentView('home'); scrollToTop(); }}
        />
      ) : currentView === 'patches' ? (
        <PatchesLandingPage 
          products={products}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          onNavigateProduct={navigateToProduct}
          onGoHome={() => { setCurrentView('home'); scrollToTop(); }}
        />
      ) : (
        /* DEDICATED PRODUCT VIEW PAGE */
        <ProductDetailPage 
          product={activeProduct} 
          products={products}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          buyNow={buyNow}
          onBack={() => { setCurrentView('home'); scrollToTop(); }}
          onNavigateProduct={navigateToProduct}
        />
      )}

      {/* 13. Newsletter Signup Bar */}
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

      {/* 14. Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand-column">
            <div className="logo-container" style={{ alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => { setCurrentView('home'); scrollToTop(); }}>
              <span className="logo-text">INDIUNA</span>
              <span className="logo-subtext">Embroidery & Customs</span>
            </div>
            <p className="footer-desc">Premium custom embroidery & structured streetwear styles. Crafted in-house, designed for the bold.</p>
            <div className="footer-socials">
              <a href="https://instagram.com" className="footer-social-link" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
              <a href="https://facebook.com" className="footer-social-link" aria-label="Facebook"><Smile /></a>
              <a href="https://youtube.com" className="footer-social-link" aria-label="Youtube"><Play /></a>
            </div>
          </div>

          <div>
            <h4 className="footer-column-title">Shop</h4>
            <ul className="footer-links">
              <li><a href="#new" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>New In</a></li>
              <li><a href="#t-shirts" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>T-Shirts</a></li>
              <li><a href="#shirts" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Shirts</a></li>
              <li><a href="#sweatshirts" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Hoodies &amp; Sweatshirts</a></li>
              <li><a href="#patches" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Patches</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Customization</h4>
            <ul className="footer-links">
              <li><a href="#logo" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Logo Embroidery</a></li>
              <li><a href="#pet" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Pet Embroidery</a></li>
              <li><a href="#portrait" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Portrait Embroidery</a></li>
              <li><a href="#vehicle" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Vehicle Embroidery</a></li>
              <li><a href="#patches" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}>Custom Patches</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Help</h4>
            <ul className="footer-links">
              <li><a href="#track">Track Order</a></li>
              <li><a href="#returns">Returns &amp; Exchanges</a></li>
              <li><a href="#shipping">Shipping Policy</a></li>
              <li><a href="#size">Size Guide</a></li>
              <li><a href="#faqs">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">About</h4>
            <ul className="footer-links">
              <li><a href="#story">Our Story</a></li>
              <li><a href="#quality">Quality</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#careers">Careers</a></li>
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
            <a href="#terms">Terms &amp; Conditions</a>
            <a href="#privacy">Privacy Policy</a>
          </div>
        </div>
      </footer>

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
                <div className="cart-item" key={`${item.id}-${item.size}-${idx}`}>
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.name}</h4>
                    <span className="cart-item-meta">Size: {item.size}</span>
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.size, -1)}><Minus size={12} /></button>
                      <span>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.size, 1)}><Plus size={12} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id, item.size)}><X size={16} /></button>
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
              <button className="checkout-btn">Checkout Via Razorpay</button>
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
            <div className="logo-container" style={{ alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); scrollToTop(); }}>
              <span className="logo-text">INDIUNA</span>
              <span className="logo-subtext">Embroidery & Customs</span>
            </div>
            <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
              <X />
            </button>
          </div>
          <div className="mobile-menu-body">
            <nav className="mobile-nav-links">
              <a href="#best-sellers" onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); }}>New In</a>
              <a href="#best-sellers" onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); }}>T-Shirts</a>
              <a href="#best-sellers" onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); }}>Shirts</a>
              <a href="#best-sellers" onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); }}>Sweatshirts</a>
              <a href="#best-sellers" onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); }}>Patches</a>
              <a href="#customization-services" onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); }}>Custom Embroidery</a>
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

/* DEDICATED PRODUCT DETAIL PAGE COMPONENT */
function ProductDetailPage({ 
  product, 
  products, 
  wishlist, 
  toggleWishlist, 
  addToCart, 
  buyNow, 
  onBack, 
  onNavigateProduct 
}) {
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState('L');
  const [shareTooltip, setShareTooltip] = useState(false);
  
  // Accordions State
  const [openAccordion, setOpenAccordion] = useState('shipping'); // 'shipping' | 'returns' | 'fabric' | null
  const [openQA, setOpenQA] = useState(0); // active QA index

  // Reset active image when product changes
  useEffect(() => {
    setActiveImage(product.image);
  }, [product]);

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

  return (
    <div className="product-detail-page container animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <button onClick={onBack} className="back-btn">
          &larr; Back to Home
        </button>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">{product.category}</span>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current font-bold">{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div className="product-detail-grid">
        {/* Left Column: Image Gallery */}
        <div className="product-gallery-container">
          <div className="product-main-preview">
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
            <div className="info-rating-row">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} />
                ))}
              </div>
              <span className="rating-text">{product.rating} ({product.reviewCount} Reviews)</span>
            </div>
            <div className="product-info-price">₹{product.price.toLocaleString('en-IN')}</div>
          </div>

          <p className="product-info-desc">{product.desc}</p>

          {/* Size Selectors */}
          <div className="size-selector-block">
            <div className="option-header-row">
              <span className="option-title">Select Size</span>
              <a href="#size-guide" className="size-guide-link">Size Guide</a>
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

          {/* Action Buttons */}
          <div className="action-buttons-stack">
            <div className="primary-actions-row">
              <button className="btn-buy-now" onClick={() => buyNow(product, selectedSize)}>Buy Now</button>
              <button className="btn-add-cart" onClick={() => addToCart(product, selectedSize)}>Add To Cart</button>
            </div>
            
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

      {/* Customer Reviews Section */}
      <section className="product-reviews-section">
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
            <span className="reviews-total-text">Based on {product.reviewCount} verified reviews</span>
            
            <div className="progress-bars-stack">
              <div className="progress-bar-row">
                <span className="bar-label">5 Star</span>
                <div className="bar-container"><div className="bar-fill" style={{ width: '85%' }}></div></div>
                <span className="bar-percent">85%</span>
              </div>
              <div className="progress-bar-row">
                <span className="bar-label">4 Star</span>
                <div className="bar-container"><div className="bar-fill" style={{ width: '10%' }}></div></div>
                <span className="bar-percent">10%</span>
              </div>
              <div className="progress-bar-row">
                <span className="bar-label">3 Star</span>
                <div className="bar-container"><div className="bar-fill" style={{ width: '5%' }}></div></div>
                <span className="bar-percent">5%</span>
              </div>
              <div className="progress-bar-row">
                <span className="bar-label">2 Star</span>
                <div className="bar-container"><div className="bar-fill" style={{ width: '0%' }}></div></div>
                <span className="bar-percent">0%</span>
              </div>
              <div className="progress-bar-row">
                <span className="bar-label">1 Star</span>
                <div className="bar-container"><div className="bar-fill" style={{ width: '0%' }}></div></div>
                <span className="bar-percent">0%</span>
              </div>
            </div>
          </div>

          {/* Right Review Panel: Reviews List */}
          <div className="reviews-list-container">
            {mockReviews.map((rev, idx) => (
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
                <p className="review-text">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Q&A Section */}
      <section className="product-qna-section">
        <h3 className="section-title">Customer Questions &amp; Answers</h3>
        
        <div className="qna-stack">
          {qnaList.map((qna, idx) => (
            <div className="qna-item-card" key={idx}>
              <button 
                className="qna-header-btn"
                onClick={() => setOpenQA(openQA === idx ? -1 : idx)}
              >
                <span className="qna-question-text">Q: {qna.q}</span>
                {openQA === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className={`qna-body-panel ${openQA === idx ? 'open' : ''}`}>
                <p className="qna-answer-text"><strong>A:</strong> {qna.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                <span className="product-card-price">₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ==========================================================================
   SHARED LANDING PAGE HERO COMPONENT
   ========================================================================== */
function LandingPageHero({ tag, title, desc, image, ctaText, onGoHome }) {
  return (
    <section className="landing-hero-section">
      <div className="landing-hero-bg" style={{ backgroundImage: `url('${image}')` }} />
      <div className="landing-hero-overlay" />
      <div className="landing-hero-content container">
        {onGoHome && (
          <button className="landing-hero-home-btn" onClick={onGoHome}>
            &larr; Back to Home
          </button>
        )}
        <span className="landing-hero-tag" style={{ marginTop: onGoHome ? '10px' : '0' }}>{tag}</span>
        <h1 className="landing-hero-title">{title}</h1>
        <p className="landing-hero-desc">{desc}</p>
        <button className="landing-hero-cta">{ctaText}</button>
      </div>
    </section>
  );
}

/* ==========================================================================
   SHARED CATEGORIES GRID COMPONENT
   ========================================================================== */
function LandingCategories({ categories }) {
  return (
    <section className="categories-section container">
      <h2 className="categories-main-title">Categories</h2>
      <div className="categories-grid-new">
        {categories.map((cat, i) => (
          <div key={i} className="category-item-card-new">
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
      
      <div className="new-arrivals-carousel-outer">
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
                  onClick={() => onNavigateProduct(targetProduct.id)}
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

        {/* Navigation Arrows */}
        <button 
          className="carousel-arrow-btn left" 
          onClick={() => setCarouselIndex(prev => prev - 1)}
          aria-label="Previous product"
        >
          &larr;
        </button>
        <button 
          className="carousel-arrow-btn right" 
          onClick={() => setCarouselIndex(prev => prev + 1)}
          aria-label="Next product"
        >
          &rarr;
        </button>
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
function FilterableProductsBlock({ products, wishlist, toggleWishlist, onNavigateProduct }) {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    { label: 'All', value: 'All' },
    { label: 'Regular Fit', value: 'Regular Fit T-Shirts' },
    { label: 'Polo', value: 'Polo' },
    { label: 'Oversized T-Shirt', value: 'Oversized T-Shirts' },
    { label: 'Sweatshirt', value: 'Sweatshirts' },
    { label: 'Hoodie', value: 'Hoodies' }
  ];

  const filteredProducts = products.filter(p => {
    // Filter to Unisex focus and categories matches tabs
    if (activeTab === 'All') {
      return true; // we show all unisex products or similar
    }
    return p.category === activeTab;
  });

  return (
    <section className="catalog-section container">
      <h2 className="section-title-new" style={{ textAlign: 'center' }}>Unisex Products</h2>
      
      {/* Category Tabs */}
      <div className="catalog-filter-pills" style={{ marginBottom: '35px' }}>
        {tabs.map((tab) => (
          <button 
            key={tab.value} 
            className={`catalog-filter-pill ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="product-grid" key={activeTab}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
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
                <span className="product-card-tag">{product.tag}</span>
              </div>
              <div className="product-card-info">
                <span className="product-card-category">{product.category}</span>
                <h4 className="product-card-title">{product.name}</h4>
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
   1. CUSTOMIZATION LANDING PAGE
   ========================================================================== */
function CustomizationLandingPage({ products, wishlist, toggleWishlist, onNavigateProduct, onGoHome }) {
  const categories = [
    { name: "Logo Embroidery", img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop" },
    { name: "Customize Embroidery", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop" },
    { name: "Portrait Embroidery", img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop" }
  ];

  const trendingProducts = products.slice(0, 4);

  return (
    <div className="landing-page animate-fade-in">
      <LandingPageHero 
        tag="Custom Customs"
        title="Your design, our premium craftsmanship."
        desc="Upload custom logos, sketches or text, and our embroidery specialists will recreate them on high-weight cotton styles."
        image="https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=1200&auto=format&fit=crop"
        ctaText="Start Customizing"
        onGoHome={onGoHome}
      />
      <LandingCategories categories={categories} />
      <LandingProductGrid 
        title="Trending Now" 
        products={trendingProducts}
        onNavigateProduct={onNavigateProduct}
      />
      <FilterableProductsBlock 
        products={products}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onNavigateProduct={onNavigateProduct}
      />
    </div>
  );
}

/* ==========================================================================
   2. EMBROIDERED APPAREL LANDING PAGE
   ========================================================================== */
function EmbroideredLandingPage({ products, wishlist, toggleWishlist, onNavigateProduct, onGoHome }) {
  const categories = [
    { name: "Streetwear Embroidery", img: "/images/products/demon_mask_tee.png" },
    { name: "Artwork Embroidery", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" },
    { name: "Anime Embroidery", img: "/images/products/chaos_anime_tee.png" }
  ];

  const newArrivals = products.slice(2, 6);

  return (
    <div className="landing-page animate-fade-in">
      <LandingPageHero 
        tag="Premium Embroidered"
        title="Heavyweight fabrics, high-density stitches."
        desc="Explore our collection of custom anime graphics, cyberpunk typography, and classic streetwear art embroidered to perfection."
        image="/images/hero_banner.png"
        ctaText="Shop New Collection"
        onGoHome={onGoHome}
      />
      <LandingCategories categories={categories} />

      {/* Campaign Section */}
      <section className="campaign-banner-section container">
        <div className="campaign-banner-card">
          <div className="campaign-banner-content">
            <span className="campaign-badge-red">CAMPAIGN 2026</span>
            <h2 className="campaign-banner-title">Fearless Stitches</h2>
            <p className="campaign-banner-desc">Built for durability, designed to stand out. Our latest collection challenges standard embroidery styles with thick, multi-layered 3D stitches.</p>
            <button className="btn-solid-red">Explore Campaign</button>
          </div>
          <div className="campaign-banner-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1000&auto=format&fit=crop')` }} />
        </div>
      </section>

      <LandingProductGrid 
        title="New Arrivals" 
        products={newArrivals}
        onNavigateProduct={onNavigateProduct}
      />
      <FilterableProductsBlock 
        products={products}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onNavigateProduct={onNavigateProduct}
      />
    </div>
  );
}

/* ==========================================================================
   3. PATCHES LANDING PAGE
   ========================================================================== */
function PatchesLandingPage({ products, wishlist, toggleWishlist, onNavigateProduct, onGoHome }) {
  const categories = [
    { name: "Velcro Patches", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop" },
    { name: "Iron-On Patches", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" },
    { name: "Sew-On Patches", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop" }
  ];

  const trendingPatches = products.slice(1, 5);

  return (
    <div className="landing-page animate-fade-in">
      <LandingPageHero 
        tag="Premium Stitched Patches"
        title="Personalize anything instantly."
        desc="High-density collectible thread art patches with premium merrowed borders. Designed to be sewn or ironed onto bags, jackets, or denim."
        image="https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1200&auto=format&fit=crop"
        ctaText="View All Patches"
        onGoHome={onGoHome}
      />
      <LandingCategories categories={categories} />
      <LandingProductGrid 
        title="Trending Now" 
        products={trendingPatches}
        onNavigateProduct={onNavigateProduct}
      />
      <FilterableProductsBlock 
        products={products}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onNavigateProduct={onNavigateProduct}
      />
    </div>
  );
}
