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
  Compass
} from 'lucide-react';
import Lenis from 'lenis';

export default function App() {
  // Navigation & Tabs State
  const [activeTab, setActiveTab] = useState('customization');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  // Auto-play Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
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

  // Quick View Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('L');

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Smooth Scroll Initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Products Data
  const products = [
    {
      id: 1,
      name: "Demon Mask Embroidered Oversized Tee",
      price: 1299,
      tag: "NEW",
      category: "Oversized T-Shirts",
      image: "/images/products/demon_mask_tee.png",
      desc: "This oversized streetwear tee features a premium, thick embroidered Japanese Oni demon mask on the back. Made from heavy-weight 240 GSM organic cotton fabric to ensure both longevity and comfort."
    },
    {
      id: 2,
      name: "Chaos Anime Embroidered T-Shirt",
      price: 1199,
      tag: "BEST SELLER",
      category: "Regular Fit T-Shirts",
      image: "/images/products/chaos_anime_tee.png",
      desc: "Inspired by raw urban cyberpunk street style, this high-contrast white t-shirt boasts a fine-line black embroidered anime-style illustration on the back. Perfect for layering."
    },
    {
      id: 3,
      name: "Itachi Uchiha Embroidered T-Shirt",
      price: 1249,
      tag: "TRENDING",
      category: "Oversized T-Shirts",
      image: "/images/products/itachi_uchiha_tee.png",
      desc: "Featuring the legendary red sharingan eyes and symbolic red clouds embroidered meticulously on the back. Heavy-weight black cotton streetwear fit with premium reinforcement stitches."
    },
    {
      id: 4,
      name: "Akatsuki Cloud Embroidered T-Shirt",
      price: 1099,
      tag: "LIMITED EDITION",
      category: "Regular Fit T-Shirts",
      image: "/images/products/akatsuki_cloud_tee.png",
      desc: "A sleek, minimalist design featuring a small, clean red embroidered Akatsuki cloud on the left chest. Subtle styling with premium-grade embroidery thread for Naruto fans."
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

  return (
    <>
      {/* 1. Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="container announcement-bar-content">
          <div className="announcement-bar-item">
            <Percent /> 10% CASHBACK ON ALL APP ORDERS
          </div>
          <div className="announcement-bar-divider"></div>
          <div className="announcement-bar-item">
            <RotateCcw /> 30 DAYS EASY RETURNS & EXCHANGES
          </div>
          <div className="announcement-bar-divider"></div>
          <div className="announcement-bar-item">
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
          
          <div className="logo-container">
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

      {/* 3. Sub-navbar Navigation Tabs */}
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
                  <button className="btn-solid-red">{slide.cta}</button>
                  <button className="btn-outline-white">{slide.secondaryCta}</button>
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
            <button className="btn-outline-white">Explore The Collection</button>
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
          <a href="#catalog" className="section-link">
            View All <ChevronRight />
          </a>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => setSelectedProduct(product)}
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
            <div className="logo-container" style={{ alignItems: 'flex-start' }}>
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
              <li><a href="#new">New In</a></li>
              <li><a href="#t-shirts">T-Shirts</a></li>
              <li><a href="#shirts">Shirts</a></li>
              <li><a href="#sweatshirts">Hoodies &amp; Sweatshirts</a></li>
              <li><a href="#patches">Patches</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Customization</h4>
            <ul className="footer-links">
              <li><a href="#logo">Logo Embroidery</a></li>
              <li><a href="#pet">Pet Embroidery</a></li>
              <li><a href="#portrait">Portrait Embroidery</a></li>
              <li><a href="#vehicle">Vehicle Embroidery</a></li>
              <li><a href="#patches">Custom Patches</a></li>
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

      {/* 16. Quick View Product Modal */}
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
            <div className="logo-container" style={{ alignItems: 'flex-start' }}>
              <span className="logo-text">INDIUNA</span>
              <span className="logo-subtext">Embroidery & Customs</span>
            </div>
            <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
              <X />
            </button>
          </div>
          <div className="mobile-menu-body">
            <nav className="mobile-nav-links">
              <a href="#best-sellers" onClick={() => setIsMobileMenuOpen(false)}>New In</a>
              <a href="#best-sellers" onClick={() => setIsMobileMenuOpen(false)}>T-Shirts</a>
              <a href="#best-sellers" onClick={() => setIsMobileMenuOpen(false)}>Shirts</a>
              <a href="#best-sellers" onClick={() => setIsMobileMenuOpen(false)}>Sweatshirts</a>
              <a href="#best-sellers" onClick={() => setIsMobileMenuOpen(false)}>Patches</a>
              <a href="#customization-services" onClick={() => setIsMobileMenuOpen(false)}>Custom Embroidery</a>
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
