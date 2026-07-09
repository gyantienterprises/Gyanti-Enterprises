import React, { useState, useEffect, useRef } from 'react';
import './StatsSection.css';
import { Users, LayoutGrid, Clock, Sun } from 'lucide-react';

// Sub-component to handle individual counting logic
function CountUp({ targetString }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);

  // Extract the raw numeric digits (e.g., "250+" -> 250)
  const targetNumber = parseInt(targetString.replace(/[^\d]/g, ''), 10) || 0;
  // Extract trailing characters/symbols (e.g., "100+" -> "+", "100%" -> "%")
  const suffix = targetString.replace(/[\d]/g, '');

  useEffect(() => {
    let animationStarted = false;

    // Use Intersection Observer to detect when the element enters the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animationStarted) {
          animationStarted = true;
          animateCount();
        }
      },
      { threshold: 0.1 } // Starts when 10% of the element is visible
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    const animateCount = () => {
      let start = 0;
      const duration = 1500; // Animation duration in milliseconds
      const startTime = performance.now();

      const updateNumber = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function (easeOutQuad) for smooth deceleration near the end
        const easeProgress = progress * (2 - progress);
        const currentCount = Math.floor(easeProgress * targetNumber);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          setCount(targetNumber); // Fallback to ensure it ends exactly on the target
        }
      };

      requestAnimationFrame(updateNumber);
    };

    return () => {
      if (elementRef.current) observer.disconnect();
    };
  }, [targetNumber]);

  return <h2 ref={elementRef} className="stat-number">{count}{suffix}</h2>;
}

const statsData = [
  {
    id: 1,
    icon: <Users className="stat-icon" />,
    number: "100+",
    title: "Happy Families",
    subtitle: "Across UP",
  },
  {
    id: 2,
    icon: <LayoutGrid className="stat-icon" />,
    number: "250+",
    title: "KW Installed",
    subtitle: "& counting",
  },
  {
    id: 3,
    icon: <Clock className="stat-icon" />,
    number: "5+",
    title: "Years Experience",
    subtitle: "In solar energy",
  },
  {
    id: 4,
    icon: <Sun className="stat-icon" />,
    number: "100%",
    title: "Clean & Renewable",
    subtitle: "Green energy",
  },
];

export default function StatsSection() {
  return (
    <section id='aboutus' className="stats-container">
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={stat.id} className="stat-card-wrapper">
            <div className="stat-card">
              <div className="icon-container">
                {stat.icon}
              </div>
              {/* Swapped static <h2> with our new dynamic CountUp component */}
              <CountUp targetString={stat.number} />
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-subtitle">{stat.subtitle}</p>
            </div>
            {index < statsData.length - 1 && <div className="stat-divider" />}
          </div>
        ))}
      </div>
    </section>
  );
}