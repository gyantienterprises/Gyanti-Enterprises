// src/components/home/Home.jsx
import React from "react";
import Hero from "../hero/Hero.jsx";
import Features from "../features/Features.jsx";
import StatsSection from "../statssection/StatsSection.jsx";
import PartnerBrands from "../brands/Brands.jsx";
import SolarTypes from "../solartypes/SolarTypes.jsx";
import SolarCalculator from "../SolarCalculator/SolarCalculator.jsx";

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <StatsSection />
      <PartnerBrands />
      <SolarTypes />
      <SolarCalculator />
    </>
  );
}

export default Home;