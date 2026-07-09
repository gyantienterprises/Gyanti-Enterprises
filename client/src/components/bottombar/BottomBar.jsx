import React, { useState, useEffect } from 'react';
import { Phone, Calculator, MessageSquare } from 'lucide-react';
import './BottomBar.css';

const BottomBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const phoneNumber = "9076640155";
  const whatsappMessage = encodeURIComponent("Hello! I am interested in your solar services.");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scrolling Down
      } else {
        setIsVisible(true); // Scrolling Up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToCalculator = (e) => {
    e.preventDefault();
    const element = document.getElementById('solar-calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`mobile-bottom-bar ${isVisible ? 'visible' : 'hidden'}`}>
      <a href={`tel:${phoneNumber}`} className="bottom-bar-item standard-item" aria-label="Call Now">
        <Phone size={30} />
      </a>
      
      <a href="#solar-calculator" onClick={scrollToCalculator} className="bottom-bar-item accent-item" aria-label="Solar Calculator">
        <Calculator size={32} />
      </a>
      
      <a 
        href={`https://wa.me/${phoneNumber}?text=${whatsappMessage}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="bottom-bar-item standard-item"
        aria-label="WhatsApp"
      >
        <MessageSquare size={30} />
      </a>
    </div>
  );
};

export default BottomBar;