import React from 'react';
import Hero from './Hero';
import WhyChooseUs from './WhyChooseUs';

export default function GyantiHome() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased">
      {/* 5-Second Rule Hero Section (Answers: What we do, Why trust us, How to start) */}
      <Hero />
      
      {/* Deep-dive Trust Section */}
      <WhyChooseUs />
    </main>
  );
}