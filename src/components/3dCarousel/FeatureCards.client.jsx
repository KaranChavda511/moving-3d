"use client"

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    title: "Interactive Experience",
    description: "Engage your audience with a dynamic, rotating gallery",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
    title: "Cylinder-Style Design",
    description: "Images wrap around a 3D cylinder for a cutting-edge look",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Smooth Animations",
    description: "Enjoy seamless and captivating 3D rotation effects",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Engaging Presentation",
    description: "Present your images in an attention-grabbing 3D format",
  },
]

export default function FeatureCards() {
  return (
    <div className="relative z-20 flex w-full flex-col gap-4 px-6 py-8 md:absolute md:bottom-10 md:left-0 md:flex-row md:justify-center md:gap-6 md:px-12 md:py-0">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex flex-row items-start gap-4 rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/6 md:flex-1 md:flex-col md:gap-2"
        >
          <div className="shrink-0 md:mb-1">{feature.icon}</div>
          <div>
            <h2 className="text-sm font-semibold text-white">{feature.title}</h2>
            <p className="text-xs leading-relaxed text-gray-400">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
