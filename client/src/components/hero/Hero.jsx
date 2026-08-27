import React from "react";
import HeroImage from "../../assets/Hero.jpg";

const Hero = () => {
  // Smooth scroll handler helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="relative h-screen w-full flex items-center justify-center bg-cover bg-[right_35%_center] md:bg-center"
      style={{
        backgroundImage: `url(${HeroImage})`,
      }}
    >
      {/* Darker overlay for significantly better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-5 md:px-8 max-w-4xl mx-auto">
        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-[1.15] md:leading-[1.15]">
          सूरज की रोशनी से पाएं <br />
          <span className="text-accent-primary">100% ज़ीरो बिजली बिल</span>
        </h1>

        {/* Subtext */}
        <p className="text-base md:text-xl text-gray-200 mb-8 max-w-xl mx-auto">
          Gyan Badhaen, Solar Lagwaen
        </p>

        {/* Button Container */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => scrollToSection("contactus")}
            className="w-full sm:w-auto bg-accent-primary hover:bg-accent-secondary text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg tracking-wide transform hover:scale-105 cursor-pointer"
          >
            Contact Now
          </button>

          <button
            onClick={() => scrollToSection("solar-calculator")}
            className="w-full sm:w-auto bg-transparent border-2 border-accent-primary hover:bg-accent-primary text-accent-primary hover:text-black font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg tracking-wide transform hover:scale-105 cursor-pointer"
          >
            Calculate your capacity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
