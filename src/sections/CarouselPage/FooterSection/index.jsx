import styles from './footer.module.css'

const navLinks = [
  { label: "Products", href: "#" },
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
]

const socialLinks = [
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export default function FooterSection() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: [
          'radial-gradient(ellipse at 30% 80%, #1a2744 0%, transparent 50%)',
          'radial-gradient(ellipse at 80% 30%, #162033 0%, transparent 40%)',
          'linear-gradient(180deg, #050810 0%, #070b13 50%, #04060a 100%)',
        ].join(', '),
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top separator line */}
      <div
        className="mx-auto h-px"
        style={{
          maxWidth: 1280,
          background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.3) 30%, rgba(99,102,241,0.15) 70%, transparent 100%)',
        }}
      />

      <div className="mx-auto px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-10 md:px-8 md:pt-20 md:pb-12" style={{ maxWidth: 1280 }}>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">

          {/* Brand + description */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight" style={{ color: '#e5e5e5' }}>
                Moving 3D
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: '#a3a3a3' }}>
              Building immersive 3D web experiences with cutting-edge animations and interactions.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 ${styles.socialLink}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-3 lg:col-start-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6366f1' }}>
              Navigation
            </h3>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 sm:flex-col sm:gap-x-0">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={`text-sm transition-colors duration-200 ${styles.navLink}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6366f1' }}>
              Stay updated
            </h3>
            <p className="mt-4 text-sm" style={{ color: '#a3a3a3' }}>
              Get notified about new components and updates.
            </p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className={`h-10 flex-1 rounded-lg border px-3.5 text-sm outline-none transition-colors duration-200 ${styles.emailInput}`}
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-lg px-4 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 flex flex-col items-center gap-4 border-t pt-6 sm:mt-12 sm:flex-row sm:justify-between sm:pt-8 md:mt-16"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: '#525252' }}>
            &copy; 2025 Moving 3D. All rights reserved.
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a key={item} href="#" className={`text-xs transition-colors duration-200 ${styles.bottomLink}`}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
