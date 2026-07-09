import React, { useState, useEffect, useRef } from "react";
import Logo from "../../../public/logo_new.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Use a ref to track the previous scroll position across renders without re-triggering effects
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Handle background styling (transparency/shadow)
      setScrolled(currentScrollY > 20);

      // 2. Handle scroll direction logic
      // Always show navbar when near the very top of the page
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling Down -> Hide Navbar
        setIsVisible(false);
        setIsOpen(false); // Auto-close mobile menu on scroll down
      } else {
        // Scrolling Up -> Show Navbar
        setIsVisible(true);
      }

      // Update the previous scroll reference
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Calculator", href: "#solar-calculator" },
    { name: "Systems", href: "#solar-system-types" },
    { name: "Contact", href: "#contactus" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        // Toggles visibility on scroll up/down using standard CSS translation
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${
        scrolled
          ? "bg-brand-dark/95 backdrop-blur-lg shadow-lg border-b border-white/10"
          : "bg-brand-dark/90 backdrop-blur"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-18 flex items-center justify-between">
        
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            src={Logo}
            alt="Gyanti Enterprises"
            className="h-20 w-auto object-contain"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-white/70 hover:text-accent-primary font-medium transition"
            >
              {item.name}
            </a>
          ))}
          {/* REMOVED: "Get Free Quote" button has been completely removed from desktop view */}
        </nav>

        {/* Mobile Button (Hamburger Menu) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1.5"
        >
          <span
            className={`w-6 h-0.5 bg-white transition ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-white transition ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-white transition ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="bg-brand-dark border-t border-white/10 px-6 py-6 flex flex-col gap-5">
          
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-accent-primary transition"
            >
              {item.name}
            </a>
          ))}

          {/* Mobile Only: WhatsApp Integration */}
          {/* <a
            href="https://wa.me/919076640155?text=Hello%20Gyanti%20Enterprises,%20I'm%20interested%20in%20a%20free%20quote."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-center py-3 rounded-xl font-semibold transition"
          >
            WhatsApp Us
          </a> */}
        </div>
      </div>
    </header>
  );
}