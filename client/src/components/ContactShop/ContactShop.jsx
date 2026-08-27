import React from "react";
import { MapPin, Phone, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import "./ContactShop.css";

export default function ContactShop() {
  const phoneNumber = "+919235740155";
  const shopAddress =
    "14521e/1452, Pipal Gaon, IIT Chauraha, Prayagraj, Uttar Pradesh 211015, India.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi%20Gyanti,%20I%20am%20interested%20in%20your%20solar%20services.`;
  const smsUrl = `sms:${phoneNumber}?body=Hi%20Gyanti,%20I%20want%20to%20know%20more%20about%20solar%20installation.`;

  // Fallback to updated Google Maps embed link if environment variable is not defined
  const shoplocation =
    import.meta.env.VITE_LOCATION ||
    "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d225.20353667297107!2d81.76634184309155!3d25.429683871259204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1787825917649!5m2!1sen!2sin";

  return (
    <section id="contactus" className="shop-contact-section">
      <div className="contact-header">
        <h2 className="contact-main-title">Visit Our Experience Center</h2>
        <p className="contact-subtitle">
          Drop by to see our live solar setups or get a quick consultation from
          our team.
        </p>
      </div>

      <div className="contact-grid-container">
        {/* Google Map Card */}
        <div className="map-card-wrapper">
          <iframe
            title="Shop Location Map"
            src={shoplocation}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="embedded-google-map"
          ></iframe>
        </div>

        {/* Contact Information Details Card */}
        <div className="info-details-card">
          <div className="info-inner-content">
            <div className="info-item">
              <div className="info-icon-wrapper accent-primary">
                <MapPin size={16} strokeWidth={2.5} />
              </div>
              <div className="info-text-block">
                <h4>Our Address</h4>
                <p>{shopAddress}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-wrapper accent-secondary">
                <Phone size={16} strokeWidth={2.5} />
              </div>
              <div className="info-text-block">
                <h4>Call Us</h4>
                <p>{phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="contact-actions-wrapper">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-action btn-whatsapp"
            >
              <FaWhatsapp size={18} />
              <span>WhatsApp</span>
            </a>

            <a href={smsUrl} className="btn-action btn-sms">
              <Send size={16} strokeWidth={2.5} />
              <span>Send SMS</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}