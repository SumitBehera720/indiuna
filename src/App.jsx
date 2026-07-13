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
  // Navigation & View States
  const [activeTab, setActiveTab] = useState('customization');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'product'
  const [activeProductId, setActiveProductId] = useState(1);
  
  // Announcement Bar Slider State
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
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

  // Auto-play Announcement Bar & Hero Slide
  useEffect(() => {
    const annTimer = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % 3);
    }, 4000);

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => {
      clearInterval(annTimer);
      clearInterval(slideTimer);
    };
  }, [heroSlides.length]);

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
      tag: "NEW",
      category: "Oversized T-Shirts",
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
      tag: "BEST SELLER",
      category: "Regular Fit T-Shirts",
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
      tag: "TRENDING",
      category: "Oversized T-Shirts",
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
      tag: "LIMITED EDITION",
      category: "Regular Fit T-Shirts",
      image: "/images/products/akatsuki_cloud_tee.png",
      desc: "A sleek, minimalist design featuring a small, clean red embroidered Akatsuki cloud on the left chest. Subtle styling with premium-grade embroidery thread for Naruto fans.",
      rating: 4.6,
      reviewCount: 29,
      thumbnails: [
        "/images/products/akatsuki_cloud_tee.png",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
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
      {currentView === 'home' ? (
        <>
          {/* Sub-navbar Navigation Tabs */}
          <div className="subnav-tabs">
            <div className="subnav-container">
              <button 
                className={`subnav-tab ${activeTab === 'customization' ? 'active' : ''}`}
                onClick={() => setActiveTab('customization')}
              >
                <div className="subnav-icon-wrapper">
                  <Scissors />
                </div>
                <div className="subnav-info">
                  <span className="subnav-label">Customization</span>
                  <span className="subnav-desc">Customize Your Own Style</span>
                </div>
              </button>

              <button 
                className={`subnav-tab ${activeTab === 'apparel' ? 'active' : ''}`}
                onClick={() => setActiveTab('apparel')}
              >
                <div className="subnav-icon-wrapper">
                  <Shirt />
                </div>
                <div className="subnav-info">
                  <span className="subnav-label">Embroidered Apparel</span>
                  <span className="subnav-desc">Premium Quality Embroidery</span>
                </div>
              </button>

              <button 
                className={`subnav-tab ${activeTab === 'patches' ? 'active' : ''}`}
                onClick={() => setActiveTab('patches')}
              >
                <div className="subnav-icon-wrapper">
                  <FolderHeart />
                </div>
                <div className="subnav-info">
                  <span className="subnav-label">Patches</span>
                  <span className="subnav-desc">Premium Patches For Every Style</span>
                </div>
              </button>
            </div>
          </div>

          {/* 4. Hero Section */}
          <section className="hero-section">
            <div className="hero-slider">
              {heroSlides.map((slide, index) => (
                <div key={index} className={`hero-slide ${currentSlide === index ? 'active' : ''}`}>
                  <div className="hero-content">
                    <span className="hero-tag">{slide.tag}</span>
                    <h2 className="hero-title">{slide.title}</h2>
                    <p className="hero-desc">{slide.desc}</p>
                    <div className="hero-buttons">
                      <button className="btn-solid-red" onClick={() => navigateToProduct(1)}>{slide.cta}</button>
                      <button className="btn-outline-white" onClick={() => {
                        const el = document.getElementById('customization-services');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}>{slide.secondaryCta}</button>
                    </div>
                  </div>
                  <div 
                    className="hero-bg-image" 
                    style={{ backgroundImage: `url('${slide.image}')` }}
                  ></div>
                </div>
              ))}
            </div>

            {/* Play trigger button */}
            <button className="watch-craft-btn" aria-label="Watch the craft video">
              <div className="watch-craft-play">
                <Play />
              </div>
              <span className="watch-craft-text">Watch The Craft</span>
            </button>

            {/* Carousel indicator dots */}
            <div className="hero-indicators">
              {heroSlides.map((_, index) => (
                <button 
                  key={index} 
                  className={`hero-indicator ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </section>

          {/* 5. Trust Badges Bar */}
          <div className="trust-badges-bar">
            <div className="container trust-badges-grid">
              <div className="trust-badge-card">
                <div className="trust-badge-icon"><Percent /></div>
                <div className="trust-badge-info">
                  <span className="trust-badge-title">10% Cashback</span>
                  <span className="trust-badge-desc">on all App orders</span>
                </div>
              </div>
              <div className="trust-badge-card">
                <div className="trust-badge-icon"><RotateCcw /></div>
                <div className="trust-badge-info">
                  <span className="trust-badge-title">30 days Easy Returns</span>
                  <span className="trust-badge-desc">& Exchanges</span>
                </div>
              </div>
              <div className="trust-badge-card">
                <div className="trust-badge-icon"><Truck /></div>
                <div className="trust-badge-info">
                  <span className="trust-badge-title">Free & Fast Shipping</span>
                  <span className="trust-badge-desc">Pan India Delivery</span>
                </div>
              </div>
              <div className="trust-badge-card">
                <div className="trust-badge-icon"><ShieldCheck /></div>
                <div className="trust-badge-info">
                  <span className="trust-badge-title">Premium Quality</span>
                  <span className="trust-badge-desc">Guaranteed Craftsmanship</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Main Category Showcase Grid */}
          <section className="category-showcase container">
            <div className="category-grid">
              <div className="category-card">
                <div 
                  className="category-card-bg" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=600&auto=format&fit=crop')` }}
                ></div>
                <div className="category-card-overlay">
                  <h3 className="category-card-title">Customize Your Style</h3>
                  <a href="#customization-services" className="category-card-cta">
                    Explore <ChevronRight />
                  </a>
                </div>
              </div>
              <div className="category-card">
                <div 
                  className="category-card-bg" 
                  style={{ backgroundImage: `url('/images/products/demon_mask_tee.png')` }}
                ></div>
                <div className="category-card-overlay">
                  <h3 className="category-card-title">Embroidered Apparel</h3>
                  <a href="#best-sellers" className="category-card-cta">
                    Explore <ChevronRight />
                  </a>
                </div>
              </div>
              <div className="category-card">
                <div 
                  className="category-card-bg" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop')` }}
                ></div>
                <div className="category-card-overlay">
                  <h3 className="category-card-title">Patches & Accessories</h3>
                  <a href="#best-sellers" className="category-card-cta">
                    Explore <ChevronRight />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Promo Banner (Fearless Collection) */}
          <section className="promo-banner container">
            <div className="promo-banner-card">
              <div className="promo-banner-content">
                <span className="promo-badge-red">Limited Drop</span>
                <h3 className="promo-banner-title">Fearless Collection</h3>
                <p className="promo-banner-desc">Bold designs. Unstoppable energy. Detailed heavyweight custom threadwork embroidery.</p>
                <button className="btn-outline-white" onClick={() => navigateToProduct(1)}>Explore The Collection</button>
              </div>
              <div 
                className="promo-banner-bg" 
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop')` }}
              ></div>
              <div className="promo-drop-label">
                <span className="promo-drop-tag">New Drop</span>
                <div className="promo-drop-date">07.07.24</div>
              </div>
            </div>
          </section>

          {/* 8. Best Sellers Section */}
          <section id="best-sellers" className="container" style={{ padding: '20px 0' }}>
            <div className="section-header">
              <h2 className="section-title">Best Sellers</h2>
              <a href="#best-sellers" className="section-link" onClick={() => navigateToProduct(1)}>
                View All <ChevronRight />
              </a>
            </div>

            <div className="product-grid">
              {products.map((product) => (
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
                    <span className="product-card-price">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 9. Shop by Fit & Style */}
          <section className="shop-fit-style container">
            <div className="section-header">
              <h2 className="section-title">Shop by Fit & Style</h2>
            </div>

            <div className="fit-style-grid">
              <div className="fit-style-card">
                <div className="fit-style-icon"><Sparkles /></div>
                <div className="fit-style-info">
                  <h3 className="fit-style-title">Oversized T-Shirts</h3>
                  <a href="#best-sellers" className="fit-style-cta">Shop Now <ArrowRight /></a>
                </div>
              </div>
              <div className="fit-style-card">
                <div className="fit-style-icon"><Shirt /></div>
                <div className="fit-style-info">
                  <h3 className="fit-style-title">Regular Fit T-Shirts</h3>
                  <a href="#best-sellers" className="fit-style-cta">Shop Now <ArrowRight /></a>
                </div>
              </div>
              <div className="fit-style-card">
                <div className="fit-style-icon"><Compass /></div>
                <div className="fit-style-info">
                  <h3 className="fit-style-title">Shirts</h3>
                  <a href="#best-sellers" className="fit-style-cta">Shop Now <ArrowRight /></a>
                </div>
              </div>
              <div className="fit-style-card">
                <div className="fit-style-icon"><Smile /></div>
                <div className="fit-style-info">
                  <h3 className="fit-style-title">Sweatshirts</h3>
                  <a href="#best-sellers" className="fit-style-cta">Shop Now <ArrowRight /></a>
                </div>
              </div>
            </div>
          </section>

          {/* 10. Custom Embroidery Services */}
          <section id="customization-services" className="custom-services container">
            <div className="section-header">
              <h2 className="section-title">Custom Embroidery Services</h2>
            </div>

            <div className="services-grid">
              <div className="service-card">
                <div 
                  className="service-card-bg" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop')` }}
                ></div>
                <div className="service-card-overlay"></div>
                <div className="service-card-content">
                  <div className="service-icon"><Scissors /></div>
                  <h3 className="service-title">Logo Embroidery</h3>
                  <a href="#customize-form" className="service-cta">Create Now <ArrowRight /></a>
                </div>
              </div>

              <div className="service-card">
                <div 
                  className="service-card-bg" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop')` }}
                ></div>
                <div className="service-card-overlay"></div>
                <div className="service-card-content">
                  <div className="service-icon"><Dog /></div>
                  <h3 className="service-title">Pet Embroidery</h3>
                  <a href="#customize-form" className="service-cta">Create Now <ArrowRight /></a>
                </div>
              </div>

              <div className="service-card">
                <div 
                  className="service-card-bg" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop')` }}
                ></div>
                <div className="service-card-overlay"></div>
                <div className="service-card-content">
                  <div className="service-icon"><User /></div>
                  <h3 className="service-title">Portrait Embroidery</h3>
                  <a href="#customize-form" className="service-cta">Create Now <ArrowRight /></a>
                </div>
              </div>

              <div className="service-card">
                <div 
                  className="service-card-bg" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop')` }}
                ></div>
                <div className="service-card-overlay"></div>
                <div className="service-card-content">
                  <div className="service-icon"><Car /></div>
                  <h3 className="service-title">Vehicle Embroidery</h3>
                  <a href="#customize-form" className="service-cta">Create Now <ArrowRight /></a>
                </div>
              </div>
            </div>
          </section>

          {/* 11. How It Works Section */}
          <section className="how-it-works">
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

          {/* 12. Instagram Showcase */}
          <section className="instagram-section container">
            <div className="insta-header">
              <h2 className="section-title">Follow @Indiuna</h2>
              <p className="insta-subtitle">For Daily Style Inspo</p>
            </div>

            <div className="insta-grid">
              {[
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop"
              ].map((url, i) => (
                <div className="insta-item" key={i}>
                  <img src={url} alt={`Insta style ${i+1}`} className="insta-item-img" />
                  <div className="insta-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </div>
                </div>
              ))}
            </div>

            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="btn-insta-follow">
              View On Instagram
            </a>
          </section>
        </>
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
