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
  const [billErrorMessage, setBillErrorMessage] = useState(""); // Track bill specific validation
  const [successMessage, setSuccessMessage] = useState("");

  const backend = import.meta.env.VITE_BACKEND;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear warnings as the user types
    if (name === "contact") setWarningMessage("");
    if (name === "monthlyBill") setBillErrorMessage("");

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
    if (isNaN(bill)) return;

    // 1. Minimum bill restriction
    if (bill < 1500) {
      setBillErrorMessage(
        "Minimum monthly bill requirement for solar setup is ₹1,500.",
      );
      setResults(null);
      return;
    }

    // 2. Market Standard Coefficients
    const BLENDED_TARIFF = 7; // Average cost per unit in ₹
    const DAILY_GEN_PER_KW = 4; // Real-world adjusted generation (Accounting for dust/weather losses)
    const DAYS_IN_MONTH = 30;

    // Step A: Find monthly unit consumption
    const estimatedMonthlyUnits = bill / BLENDED_TARIFF;

    // Step B: Calculate monthly gen per 1kW (4 units * 30 days = 120 units)
    const monthlyGenPerKw = DAILY_GEN_PER_KW * DAYS_IN_MONTH;

    // Step C: Find raw kW capacity needed, and round UP to nearest whole integer
    const requiredKw = Math.ceil(estimatedMonthlyUnits / monthlyGenPerKw);

    // Step D: Calculate potential vs max allowable financial savings
    const potentialAnnualSavings =
      requiredKw * DAILY_GEN_PER_KW * DAYS_IN_MONTH * 12 * BLENDED_TARIFF;
    const maxAnnualBill = bill * 12; // Cap savings to what they actually spend

    const annualSavings = Math.min(potentialAnnualSavings, maxAnnualBill);

    setResults({
      kwNeeded: requiredKw,
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
      const response = await fetch(backend, {
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

      setSuccessMessage(data.message);
      setShowModal(true);
    } catch (error) {
      console.error("Connection Error:", error);
      alert(
        "Unable to reach the server. Make sure your backend server is running.",
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", contact: "", monthlyBill: "" });
    setResults(null);
    setSuccessMessage("");
  };

  return (
    <section id="solar-calculator" className="calculator-section">
      <div className="calculator-container">
        {/* LEFT SIDE: Calculator Card */}
        <div className="calculator-card">
          <form
            onSubmit={calculateSolarRequirements}
            className="calculator-form"
          >
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
                placeholder="e.g. 3000"
                value={formData.monthlyBill}
                onChange={handleInputChange}
                className={billErrorMessage ? "input-error" : ""}
              />
              {billErrorMessage && (
                <p className="error-text">
                  <AlertTriangle size={14} /> {billErrorMessage}
                </p>
              )}
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
            Find out the exact solar plant capacity your home needs and see how
            much money you can stop throwing away on electricity bills.
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
          <div
            className="modal-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={closeModal}>
              <X size={20} />
            </button>
            <div className="modal-body">
              <div className="success-icon-wrapper">
                <CheckCircle2 size={48} className="success-icon" />
              </div>
              <h3 className="modal-title">Consultation Updated!</h3>
              <p className="modal-message">
                {successMessage ||
                  `Thank you ${formData.name}. Your customized solar layout blueprint has been saved successfully.`}
              </p>
              <div className="modal-info-box">
                <p>
                  Our senior grid consultant will contact you at{" "}
                  <strong>+91 {formData.contact}</strong> within 24 hours to
                  schedule your physical site audit.
                </p>
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
