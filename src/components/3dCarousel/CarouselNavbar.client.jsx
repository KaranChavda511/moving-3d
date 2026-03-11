"use client"

const navLinks = ["Home", "Services", "Portfolio", "Contact"]

export default function CarouselNavbar() {
  return (
    <nav className="absolute top-0 left-0 z-20 flex w-full items-center justify-between px-8 py-5">
      <div className="flex items-center gap-2">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="text-lg font-semibold text-white">Logo</span>
      </div>

      <div className="hidden items-center gap-8 md:flex">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-sm text-gray-300 transition-colors hover:text-white"
          >
            {link}
          </a>
        ))}
      </div>

      <button className="rounded-lg bg-linear-to-br from-[#4f8cff] to-[#2563eb] px-5 py-2 text-sm font-medium text-white shadow-[0_8px_24px_rgba(79,140,255,0.35)] transition-all hover:shadow-[0_12px_32px_rgba(79,140,255,0.5)]">
        Get Started
      </button>
    </nav>
  )
}
