import React, { useState } from "react";
import "./SolarCalculator.css";
import { CheckCircle2, X, AlertTriangle } from "lucide-react"; 

const SolarCalculator = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    monthlyBill: "",
  });

  const [results, setResults] = useState(null);
  
  // Modal & Error States
  const [showModal, setShowModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear warnings as the user types
    if (name === "contact") setWarningMessage("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Restricts input strictly to 10 numbers max
  const handleContactInput = (e) => {
    if (e.target.value.length > 10) {
      e.target.value = e.target.value.slice(0, 10);
    }
  };

  const calculateSolarRequirements = (e) => {
    e.preventDefault();
    
    const bill = parseFloat(formData.monthlyBill);
    if (isNaN(bill) || bill <= 0) return;

    const estimatedMonthlyUnits = bill / 7;
    const requiredKw = estimatedMonthlyUnits / 120;
    const annualSavings = estimatedMonthlyUnits * 8 * 12;

    setResults({
      kwNeeded: requiredKw.toFixed(1),
      moneySaved: Math.round(annualSavings).toLocaleString("en-IN"),
    });
  };

  // Connects directly to your updated Express + Neon Find-or-Update API
  const handleContactSubmit = async () => {
    setWarningMessage("");
    setSuccessMessage(""); 

    const payload = {
      name: formData.name,
      contact: formData.contact,
      monthlyBill: formData.monthlyBill,
      kwNeeded: results.kwNeeded,
      moneySaved: results.moneySaved,
    };

    try {
      const response = await fetch("http://localhost:5000/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setWarningMessage(data.error || "An unexpected error occurred.");
        return;
      }

      // Capture the dynamic message generated from your backend environment
      setSuccessMessage(data.message);
      setShowModal(true);

    } catch (error) {
      console.error("Connection Error:", error);
      alert("Unable to reach the server. Make sure your backend server is running.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    // Reset fields smoothly
    setFormData({ name: "", contact: "", monthlyBill: "" });
    setResults(null);
    setSuccessMessage("");
  };

  return (
    <section className="calculator-section">
      <div className="calculator-container">
        
        {/* LEFT SIDE: Calculator Card */}
        <div className="calculator-card">
          <form onSubmit={calculateSolarRequirements} className="calculator-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact Number</label>
              <input
                type="number"
                id="contact"
                name="contact"
                required
                placeholder="10-digit mobile number"
                value={formData.contact}
                onInput={handleContactInput}
                onChange={handleInputChange}
                className={warningMessage ? "input-error" : ""}
              />
              {warningMessage && (
                <p className="error-text">
                  <AlertTriangle size={14} /> {warningMessage}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="monthlyBill">Average Monthly Bill (₹)</label>
              <input
                type="number"
                id="monthlyBill"
                name="monthlyBill"
                required
                min="1"
                placeholder="e.g. 3000"
                value={formData.monthlyBill}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="calculate-btn">
              Calculate Savings
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: Layout Info Display */}
        <div className="calculator-info">
          <span className="calc-badge">Instant Estimate</span>
          <h2 className="calc-heading">Calculate Your Solar Potential</h2>
          <p className="calc-subtext">
            Find out the exact solar plant capacity your home needs and see how much money you can stop throwing away on electricity bills.
          </p>

          {results && (
            <div className="calculator-results animate-fade-in">
              <h3 className="results-title">Your Custom Solar Blueprint</h3>
              <div className="results-grid">
                <div className="result-item">
                  <span className="result-label">Recommended System</span>
                  <span className="result-value">{results.kwNeeded} kW</span>
                </div>
                <div className="result-item highlight">
                  <span className="result-label">Estimated Yearly Savings</span>
                  <span className="result-value">₹{results.moneySaved}</span>
                </div>
              </div>

              <button 
                type="button" 
                className="contact-expert-btn"
                onClick={handleContactSubmit}
              >
                Book Free Consultation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PROFESSIONAL SUCCESS MODAL OVERLAY */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              <X size={20} />
            </button>
            <div className="modal-body">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={48} className="success-icon" />
              </div>
              <h3 className="modal-title">Consultation Updated!</h3>
              <p className="modal-message">
                {successMessage || `Thank you ${formData.name}. Your customized solar layout blueprint has been saved successfully.`}
              </p>
              <div className="modal-info-box">
                <p>Our senior grid consultant will contact you at <strong>+91 {formData.contact}</strong> within 24 hours to schedule your physical site audit.</p>
              </div>
              <button className="modal-action-btn" onClick={closeModal}>
                Back to Calculator
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SolarCalculator;