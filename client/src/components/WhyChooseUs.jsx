import React from "react";

const features = [
  {
    title: "Government Subsidy Assistance",
    description:
      "From documentation to approval, we handle the complete subsidy process so you can enjoy maximum savings without the hassle.",
    icon: "🏛️",
  },
  {
    title: "Experienced Professionals",
    description:
      "Our certified engineers ensure every solar system is designed and installed for maximum efficiency and long-term performance.",
    icon: "👨‍🔧",
  },
  {
    title: "Free Site Inspection",
    description:
      "We visit your location, inspect the rooftop, analyse electricity consumption, and recommend the ideal solar solution.",
    icon: "📍",
  },
  {
    title: "Premium Quality Components",
    description:
      "We use only trusted solar panels, inverters, and mounting structures backed by manufacturer warranties.",
    icon: "☀️",
  },
  {
    title: "End-to-End Installation",
    description:
      "From planning and approvals to installation and commissioning—we take care of everything.",
    icon: "⚡",
  },
  {
    title: "After Sales Support",
    description:
      "Our relationship doesn't end after installation. We provide maintenance guidance and dedicated customer support.",
    icon: "🛡️",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">

        {/* Heading */}

        <div className="text-center max-w-3xl mx-auto">

          <span className="inline-flex items-center rounded-full bg-lime-100 text-lime-700 px-5 py-2 font-semibold text-sm">

            WHY CHOOSE US

          </span>

          <h2 className="mt-6 text-4xl lg:text-5xl font-black text-gray-900">

            Trusted Solar Experts

          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">

            We believe installing solar should be simple, transparent and
            stress-free. From your first consultation to final installation,
            Gyanti Enterprises delivers reliable service with premium quality.

          </p>

        </div>

        {/* Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">

          {features.map((item, index) => (

            <div
              key={index}
              className="group bg-stone-50 rounded-3xl p-8 border border-gray-200 hover:border-lime-300 hover:shadow-2xl hover:-translate-y-2 transition duration-300"
            >

              {/* Number */}

              <div className="flex items-center justify-between">

                <div className="w-16 h-16 rounded-2xl bg-lime-100 flex items-center justify-center text-3xl">

                  {item.icon}

                </div>

                <span className="text-5xl font-black text-gray-100 group-hover:text-lime-100 transition">

                  0{index + 1}

                </span>

              </div>

              {/* Title */}

              <h3 className="mt-8 text-2xl font-bold text-gray-900">

                {item.title}

              </h3>

              {/* Description */}

              <p className="mt-5 leading-7 text-gray-600">

                {item.description}

              </p>

            </div>

          ))}

        </div>

        {/* Bottom Highlight */}

        <div className="mt-24 rounded-3xl bg-lime-500 text-black p-12">

          <div className="grid lg:grid-cols-2 gap-10 items-center">

            <div>

              <h2 className="text-4xl font-black">

                Start Saving on Electricity Bills Today

              </h2>

              <p className="mt-5 text-lg leading-8">

                Join hundreds of satisfied customers who have switched to clean,
                renewable solar energy and significantly reduced their monthly
                electricity expenses.

              </p>

            </div>

            <div className="flex justify-center lg:justify-end">

              <button className="bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-xl font-semibold shadow-lg transition">

                Book Free Consultation →

              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}