import React from 'react';
import { Search, Compass, FileText, Wrench, Zap, Check } from 'lucide-react';
import './SolarTimeline.css';

const timelineSteps = [
  {
    id: 1,
    time: "30–60 MIN",
    title: "Site Visit & Survey",
    description: "Our expert visits your rooftop, checks orientation, shading, and existing load.",
    icon: <Search size={20} strokeWidth={2.5} />,
    colorClass: "accent-primary"
  },
  {
    id: 2,
    time: "2–4 HRS",
    title: "Design & Proposal",
    description: "Custom solar layout designed; subsidy and net-metering paperwork prepared.",
    icon: <Compass size={20} strokeWidth={2.5} />,
    colorClass: "accent-secondary"
  },
  {
    id: 3,
    time: "1–3 DAYS",
    title: "Permits & Subsidy",
    description: "Government portal filing and DISCOM approval — we handle everything end-to-end.",
    icon: <FileText size={20} strokeWidth={2.5} />,
    colorClass: "accent-primary"
  },
  {
    id: 4,
    time: "1 DAY",
    title: "Installation",
    description: "Panels, inverter, and wiring installed by certified technicians on your roof.",
    icon: <Wrench size={20} strokeWidth={2.5} />,
    colorClass: "accent-secondary"
  },
  {
    id: 5,
    time: "3–7 DAYS",
    title: "Grid Connection",
    description: "Net metering activated. Start generating — and saving — from day one.",
    icon: <Zap size={20} strokeWidth={2.5} />,
    colorClass: "accent-green",
    isLive: true
  }
];

export default function SolarTimeline() {
  return (
    <section className="solar-timeline-section">
      <div className="timeline-header">
        <h2 className="timeline-main-title">Our Seamless Process</h2>
        <p className="timeline-subtitle">Go solar in five simple, hassle-free steps managed entirely by our experts.</p>
      </div>

      <div className="timeline-container">
        {/* Progress Line Tracker */}
        <div className="timeline-progress-line"></div>

        {timelineSteps.map((step) => (
          <div key={step.id} className={`timeline-card-wrapper step-${step.id}`}>
            {/* The Orb Marker with Lucide Icon */}
            <div className={`timeline-orb ${step.colorClass}`}>
              <span className="orb-number">{step.id}</span>
              <div className="orb-icon-inner">
                {step.icon}
              </div>
            </div>

            {/* The Content Card */}
            <div className="timeline-card">
              <span className={`time-tag ${step.isLive ? 'tag-live' : ''}`}>{step.time}</span>
              <h3 className="card-title">{step.title}</h3>
              <p className="card-description">{step.description}</p>
              {step.isLive && (
                <div className="live-status">
                  <Check size={14} strokeWidth={3} className="checkmark" /> You're live!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}