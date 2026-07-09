import React from "react";
import "./Footer.css";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa"; 
import Logo from "../../../public/logo_new.png";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Company Info Column */}
        <div className="footer-column brand-info">
          <div className="footer-logo">
            <img
              src={Logo}
              alt="Gyanti Enterprises"
              className="h-20 w-auto object-contain"
            />
          </div>
          <p className="company-desc">
            Gyanti Enterprises is a trusted solar energy vendor providing
            high-efficiency solar modules, inverters, and full-service
            installations. We deliver custom, reliable clean energy solutions to
            lower power costs for residential and commercial clients.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="#aboutus">About Us</a>
            </li>
            <li>
              <a href="#brands">Brands Available</a>
            </li>
            <li>
              <a href="#contactus">Contact Us</a>
            </li>
          </ul>
        </div>

        {/* Products Category Column */}
        <div className="footer-column">
          <h3>Solar Systems Category</h3>
          <ul className="footer-links">
            <li>
              <a href="#on-grid">On Grid</a>
            </li>
            <li>
              <a href="#off-grid">Off Grid</a>
            </li>
            <li>
              <a href="#hybrid">Hybrid</a>
            </li>
          </ul>
        </div>

        {/* Connect Column */}
        <div className="footer-column contact-info">
          <h3>Connect</h3>
          <ul className="contact-list">
            <li>
              <FaPhoneAlt className="contact-icon" />
              <a href="tel:+919076640155">+91-90766 40155</a>
            </li>
            <li>
              <FaPhoneAlt className="contact-icon" />
              <a href="tel:+918115621040">+91-81156 21040</a>
            </li>
            <li>
              <FaEnvelope className="contact-icon" />
              <a href="mailto:gyantienterprises534@gmail.com">
                gyantienterprises534@gmail.com
              </a>
            </li>
            <li>
              <FaMapMarkerAlt className="contact-icon alignment-top" />
              <span>
                Gyanti Enterprises, Gautam Buddha Marg, Near Baroda U.P. Bank,
                Rajrooppur, Prayagraj, 211011
              </span>
            </li>
          </ul>

          <div className="social-section">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/profile.php?id=61591462993108"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebookF />
              </a>
              {/* <a href="#linkedin" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a> */}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Strip Component */}
      <div className="footer-bottom">
        <div className="footer-copyright">
          Gyanti Enterprises &copy; 2026 | All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;