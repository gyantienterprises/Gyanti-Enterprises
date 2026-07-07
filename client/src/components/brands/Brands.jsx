import React, { useState } from 'react';
import './Brands.css';

import adaniLogo from '../../assets/brands/adani_logo.png';
import microtekLogo from '../../assets/brands/microtek_logo.png';
import eastmanLogo from '../../assets/brands/eastman_logo.jpeg';
import luminousLogo from '../../assets/brands/luminous_logo.jpg';
import livguardLogo from '../../assets/brands/livguard_logo.png';
import tataLogo from '../../assets/brands/tata_logo.png';
import waareeLogo from '../../assets/brands/waaree_logo.jpg';
import utlLogo from '../../assets/brands/utl_logo.jpg';

const brandsData = [
  { id: 1, name: 'Adani', img: adaniLogo, categories: ['Panels'], tag: 'High Efficiency', detail: 'Mono PERC Panels' },
  { id: 2, name: 'Tata', img: tataLogo, categories: ['Panels', 'Inverters'], tag: 'Tier 1 Quality', detail: '25-Year Warranty' },
  { id: 3, name: 'UTL', img: utlLogo, categories: ['Panels', 'Inverters', 'Batteries'], tag: 'Smart Tech', detail: 'rMPPT Inverters' },
  { id: 4, name: 'Waaree', img: waareeLogo, categories: ['Panels', 'Inverters'], tag: 'Top Exporter', detail: 'Bifacial Modules' },
  { id: 5, name: 'Luminous', img: luminousLogo, categories: ['Panels', 'Inverters', 'Batteries'], tag: 'Household Favorite', detail: 'Sine Wave Systems' },
  { id: 6, name: 'Livguard', img: livguardLogo, categories: ['Panels', 'Inverters', 'Batteries'], tag: 'Smart Storage', detail: 'Long Lifecycle' },
  { id: 7, name: 'Eastman', img: eastmanLogo, categories: ['Panels', 'Inverters', 'Batteries'], tag: 'Tubular Power', detail: 'Carbon Technology' },
  { id: 8, name: 'Microtek', img: microtekLogo, categories: ['Panels', 'Inverters', 'Batteries'], tag: 'Max Performance', detail: 'Digital Inverters' },
];

const categories = ['All', 'Panels', 'Inverters', 'Batteries'];

export default function PartnerBrands() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [flippedId, setFlippedId] = useState(null);

  // Updated filtering condition to handle arrays
  const filteredBrands =
    activeCategory === 'All'
      ? brandsData
      : brandsData.filter((b) => b.categories.includes(activeCategory));

  const handleCardTap = (id) => {
    setFlippedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="brands-container">
      <div className="brands-content">
        <h2 className="brands-title">Our Partnered Brands</h2>
        <p className="brands-subtitle">Trusted names powering our solar & backup solutions</p>

        {/* CATEGORY FILTER TABS */}
        <div className="brands-filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="brands-grid">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className={`brand-card ${flippedId === brand.id ? 'is-active' : ''}`}
              tabIndex="0"
              onClick={() => handleCardTap(brand.id)}
            >
              {/* Render multiple category badges if a brand has more than one */}
              <div className="brand-categories-wrapper">
                {/* {brand.categories.map((cat) => (
                  <span key={cat} className="brand-category-badge">
                    {cat}
                  </span>
                ))} */}
              </div>

              {/* LOGO VIEW */}
              <div className="brand-logo-view">
                <img src={brand.img} alt={`${brand.name} logo`} className="brand-img" />
              </div>

              {/* OVERLAY TEXT */}
              <div className="brand-hover-overlay">
                <span className="overlay-tag">{brand.tag}</span>
                <span className="overlay-detail">{brand.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}