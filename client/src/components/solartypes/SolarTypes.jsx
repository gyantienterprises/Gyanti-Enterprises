import React, { useState, useEffect } from 'react';
import './SolarTypes.css';

import onGridImg from '../../assets/solar system types/on gird.png';
import offGridImg from '../../assets/solar system types/off gird.png';
import hybridImg from '../../assets/solar system types/hybrid.png';

const solarData = [
  {
    id: 'on-grid',
    tag: 'Cost-Effective & High Savings',
    title: 'On-Grid Solar System',
    img: onGridImg,
    shortDesc: 'This system connects directly to the <strong>Utility Grid</strong> without using batteries.',
    bullets: [
      'Any excess electricity generated during the day is exported to the utility grid.',
      'Reduces your electricity bill by up to 90%.',
      'The most affordable type of solar system.'
    ],
    verdict: 'Best for locations with a reliable power supply where the main goal is to reduce electricity bills.'
  },
  {
    id: 'off-grid',
    tag: 'Complete Energy Independence',
    title: 'Off-Grid Solar System',
    img: offGridImg,
    shortDesc: 'This system operates independently of the utility grid and relies on <strong>batteries</strong>.',
    bullets: [
      'During the day, solar panels power your home while charging the batteries.',
      'At night or during power outages, the batteries supply electricity to your home.',
      'Your home remains powered even when the grid is unavailable.'
    ],
    verdict: 'Ideal for villages, farmhouses, or areas with frequent power outages.'
  },
  {
    id: 'hybrid',
    tag: 'Advanced All-in-One Solution',
    title: 'Hybrid Solar System',
    img: hybridImg,
    shortDesc: 'A combination of <strong>On-Grid and Off-Grid</strong> systems, offering both bill savings and battery backup.',
    bullets: [
      'Powers your home, charges the batteries, and exports surplus electricity to the utility grid.',
      'Automatically switches to battery backup within milliseconds during a power outage.',
      'A modern solution that combines maximum savings with uninterrupted power.'
    ],
    verdict: 'Perfect for homeowners who want lower electricity bills along with reliable backup power.'
  }
];

export default function SolarSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Synchronize active slide with incoming window hash URLs (e.g., #on-grid)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const targetIndex = solarData.findIndex((item) => item.id === hash);
      
      if (targetIndex !== -1) {
        setCurrentIndex(targetIndex);
        
        // Smoothly scroll the user to this slider section
        const element = document.querySelector('.solar-slider-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Run on initial mounting if user arrives with a trailing hash identifier
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === solarData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? solarData.length - 1 : prev - 1));
  };

  return (
    <section id='solar-system-types' className="solar-slider-section">
      
      {/* BRAND NEW MAIN SECTION HEADING */}
      <div className="solar-slider-header">
        <h2 className="main-section-title">Types of Solar Systems</h2>
        <p className="main-section-subtitle">अपने घर के लिए सही और सस्ता सोलर सेटअप चुनें</p>
      </div>

      <div className="slider-container">
        <div className="slider-stage-wrapper">
          
          {/* LEFT SWIPE BUTTON */}
          <button className="nav-arrow-btn left" onClick={prevSlide} aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* ALL 3 CARDS RENDERED SIMULTANEOUSLY FOR 3D CENTER MECHANISM */}
          {solarData.map((card, index) => {
            let cardPositionClass = 'card-next';
            
            if (index === currentIndex) {
              cardPositionClass = 'card-active';
            } else if (index === (currentIndex - 1 + solarData.length) % solarData.length) {
              cardPositionClass = 'card-prev';
            }

            return (
              <div 
                key={card.id} 
                className={`solar-big-card ${cardPositionClass}`}
                onClick={() => {
                  if (cardPositionClass !== 'card-active') {
                    setCurrentIndex(index);
                  }
                }}
              >
                {/* LEFT IMAGE BOX */}
                <div className="card-left-panel">
                  <img src={card.img} alt={card.title} className="solar-illustrator-img" />
                </div>

                {/* RIGHT DETAILED EXPLANATION */}
                <div className="card-right-panel">
                  <span className="system-tag">{card.tag}</span>
                  <h3 className="system-heading">{card.title}</h3>
                  
                  <p className="system-desc-short" dangerouslySetInnerHTML={{ __html: card.shortDesc }} />

                  <div className="bullet-points-box">
                    {card.bullets.map((bullet, idx) => (
                      <div className="bullet-item" key={idx}>
                        <div className="bullet-dot" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  <div className="premium-verdict-tag">
                    <strong>Best For:</strong> {card.verdict}
                  </div>
                </div>
              </div>
            );
          })}

          {/* RIGHT SWIPE BUTTON */}
          <button className="nav-arrow-btn right" onClick={nextSlide} aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

        </div>
      </div>

      {/* LOWER INDICATOR DOTS */}
      <div className="slider-dots-indicator">
        {solarData.map((_, idx) => (
          <div 
            key={idx} 
            className={`dot ${currentIndex === idx ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </section>
  );
}