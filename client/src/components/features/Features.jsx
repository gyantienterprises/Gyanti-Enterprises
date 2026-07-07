import React from "react";
import "./Features.css";

// Import PNG icons (assuming assets/icons directory structure)
import walletIcon from "../../assets/icons/wallet.png";
import savingIcon from "../../assets/icons/saving.png";
import warrantyIcon from "../../assets/icons/warrenty.png";
import siteVisitIcon from "../../assets/icons/site-visit.png";

const Features = () => {
  const highlights = [
    {
      title: "₹0 Down Payment",
      description: "100% financing with easy EMIs.",
      icon: walletIcon,
    },
    {
      title: "Save ₹30,000+ Every Year",
      description: "Lower electricity bills from day one.",
      icon: savingIcon,
    },
    {
      title: "25-Year Warranty",
      description: "Long-term performance assurance.",
      icon: warrantyIcon,
    },
    {
      title: "Free Site Visit",
      description: "Expert evaluation at zero cost.",
      icon: siteVisitIcon,
    },
  ];

  const subsidyTiers = [
    { kw: "1 kW System", amount: "₹45,000" },
    { kw: "2 kW System", amount: "₹90,000" },
    { kw: "3 kW or More", amount: "₹1,08,000" },
  ];

  return (
    <section className="features-section">
      {/* Special Highlight: PM Surya Ghar Yojana Banner */}
      <div className="banner-card">
        <div className="banner-glow"></div>
        <div className="banner-content">
          <div className="banner-text">
            <span className="banner-badge">Govt Scheme Benefit</span>
            <h2 className="banner-title">PM Surya Ghar Muft Bijli Yojana</h2>
            <p className="banner-description">
              Get massive government backing to secure your future. Clean energy
              is now officially subsidized for your home.
            </p>
          </div>
          
          {/* Detailed Subsidy Breakdown Tiers */}
          <div className="subsidy-container">
            <span className="subsidy-header">Direct Subsidy Structure</span>
            <div className="subsidy-tiers-grid">
              {subsidyTiers.map((tier, index) => (
                <div key={index} className="subsidy-tier-card">
                  <span className="subsidy-tier-kw">{tier.kw}</span>
                  <span className="subsidy-tier-amount">{tier.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Other Core Features */}
      <div className="features-grid">
        {highlights.map((item, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon-container">
              <img
                src={item.icon}
                alt={`${item.title} icon`}
                className="feature-png-icon"
              />
            </div>
            <div className="feature-text-group">
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;