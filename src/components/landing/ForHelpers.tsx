import ScrollReveal from "./ScrollReveal";

const benefits = [
  "Set your own prices, hours, and service area",
  "Get discovered by clients in your neighborhood",
  "Build your reputation with verified reviews",
  "Get paid fast — direct deposit after each job",
  "Free background check badge to boost trust",
  "No subscription fees — only pay when you earn",
];

export default function ForHelpers() {
  return (
    <section id="for-helpers" className="py-20 bg-forest text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Earn money helping your neighbors
              </h2>
              <p className="mt-6 text-lg text-white/80">
                Whether you&apos;re a licensed pro or just handy around the
                house, SwapSpot connects you with people nearby who need your
                skills.
              </p>

              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-white/90">{benefit}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="mt-10 inline-flex items-center justify-center rounded-full bg-white text-forest px-8 py-4 font-semibold text-lg hover:bg-cream transition-colors shadow-lg"
              >
                Start earning today
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative">
              <svg
                viewBox="0 0 400 350"
                className="w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="400"
                  height="350"
                  rx="20"
                  fill="white"
                  opacity="0.1"
                />
                {/* Phone mockup */}
                <rect
                  x="120"
                  y="30"
                  width="160"
                  height="290"
                  rx="20"
                  fill="white"
                  opacity="0.15"
                  stroke="white"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                />
                <rect
                  x="135"
                  y="60"
                  width="130"
                  height="235"
                  rx="4"
                  fill="white"
                  opacity="0.05"
                />
                {/* Earning indicator */}
                <text
                  x="200"
                  y="120"
                  textAnchor="middle"
                  fill="white"
                  fontSize="14"
                  opacity="0.7"
                >
                  This week
                </text>
                <text
                  x="200"
                  y="160"
                  textAnchor="middle"
                  fill="white"
                  fontSize="36"
                  fontWeight="bold"
                >
                  $1,240
                </text>
                <text
                  x="200"
                  y="190"
                  textAnchor="middle"
                  fill="#86efac"
                  fontSize="14"
                >
                  +23% from last week
                </text>
                {/* Job cards */}
                <rect
                  x="145"
                  y="210"
                  width="110"
                  height="30"
                  rx="6"
                  fill="white"
                  opacity="0.15"
                />
                <text
                  x="200"
                  y="230"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  opacity="0.8"
                >
                  5 jobs completed
                </text>
                <rect
                  x="145"
                  y="250"
                  width="110"
                  height="30"
                  rx="6"
                  fill="white"
                  opacity="0.15"
                />
                <text
                  x="200"
                  y="270"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  opacity="0.8"
                >
                  4.9 ★ avg rating
                </text>
              </svg>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
