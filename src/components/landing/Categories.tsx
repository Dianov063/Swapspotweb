import ScrollReveal from "./ScrollReveal";

const categories = [
  { icon: "🧹", title: "Cleaning", description: "Home, office, deep clean, move-out" },
  { icon: "🔧", title: "Handyman", description: "Plumbing, electrical, assembly, repairs" },
  { icon: "🌿", title: "Lawn & Garden", description: "Mowing, trimming, landscaping, leaf removal" },
  { icon: "🚚", title: "Moving", description: "Loading, unloading, packing, furniture" },
  { icon: "💅", title: "Beauty", description: "Nails, hair, lashes, makeup at your door" },
];

export default function Categories() {
  return (
    <section className="py-20 bg-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-forest">
              Popular categories
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Whatever you need done, there&apos;s a helper nearby.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.title}>
              <div
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="text-5xl block mb-4">{cat.icon}</span>
                <h3 className="text-lg font-semibold text-forest mb-2">
                  {cat.title}
                </h3>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
