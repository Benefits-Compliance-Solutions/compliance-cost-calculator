import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { BCS_WHITE_LOGO_BASE64 } from "@/lib/logoBase64";

type NavChild = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
};

const SITE_ROOT = "https://www.benefitscompliancesolutions.com";

const navItems: NavItem[] = [
  {
    label: "Home",
    href: SITE_ROOT,
  },
  {
    label: "About",
    children: [
      { label: "About BCS", href: `${SITE_ROOT}/about-bcs` },
      { label: "Our Team", href: `${SITE_ROOT}/who-we/are` },
    ],
  },
  {
    label: "Our Solutions",
    children: [
      { label: "Compliance Advisory Program", href: `${SITE_ROOT}/compliance-advisory-program` },
      { label: "Compliance Management Platform", href: `${SITE_ROOT}/bcspro` },
      { label: "Course: BCS Transform", href: `${SITE_ROOT}/bcs-transform-course` },
      { label: "Wrap and Pop Documents", href: `${SITE_ROOT}/wrap-pop-documents` },
    ],
  },
  {
    label: "Blog & Resources",
    children: [
      { label: "Blog", href: `${SITE_ROOT}/blog` },
      { label: "Benefits Compliance Glossary", href: `${SITE_ROOT}/bcs-glossary` },
      { label: "Agency Roi Calculator", href: `${SITE_ROOT}/roi-calculator` },
    ],
  },
];

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null);
  const [activeMobileDropdowns, setActiveMobileDropdowns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  const mobileDropdownState = useMemo(() => activeMobileDropdowns, [activeMobileDropdowns]);

  const toggleMobileDropdown = (label: string) => {
    setActiveMobileDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="site-header__bar">
            <a
              href={SITE_ROOT}
              target="_top"
              className="site-header__brand"
              aria-label="Benefits Compliance Solutions home"
            >
              <span className="site-header__logo-frame">
                <img
                  src={BCS_WHITE_LOGO_BASE64}
                  alt="Benefits Compliance Solutions"
                  className="site-header__logo"
                />
              </span>
            </a>

            <nav className="site-header__nav" aria-label="Primary navigation">
              {navItems.map((item) => {
                const hasChildren = Boolean(item.children?.length);

                if (!hasChildren && item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_top"
                      className="site-header__link"
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="site-header__dropdown"
                    onMouseEnter={() => setActiveDesktopDropdown(item.label)}
                    onMouseLeave={() => setActiveDesktopDropdown((current) => (current === item.label ? null : current))}
                  >
                    <button
                      type="button"
                      className="site-header__link site-header__link--button"
                      aria-expanded={activeDesktopDropdown === item.label}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="site-header__chevron" aria-hidden="true" />
                    </button>

                    <div
                      className={`site-header__dropdown-menu ${activeDesktopDropdown === item.label ? "site-header__dropdown-menu--open" : ""}`}
                    >
                      {item.children?.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          target="_top"
                          className="site-header__dropdown-link"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}

            </nav>

            <button
              type="button"
              className="site-header__menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="site-header__mobile-overlay" role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
          <div className="site-header__mobile-shell">
            <div className="site-header__mobile-topbar">
              <a
                href={SITE_ROOT}
                target="_top"
                className="site-header__brand site-header__brand--mobile"
                aria-label="Benefits Compliance Solutions home"
              >
                <span className="site-header__logo-frame site-header__logo-frame--mobile">
                  <img
                    src={BCS_WHITE_LOGO_BASE64}
                    alt="Benefits Compliance Solutions"
                    className="site-header__logo site-header__logo--mobile"
                  />
                </span>
              </a>

              <button
                type="button"
                className="site-header__mobile-close"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
              >
                <X className="h-8 w-8" aria-hidden="true" />
              </button>
            </div>

            <div className="site-header__mobile-nav">
              {navItems.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isOpen = Boolean(mobileDropdownState[item.label]);

                if (!hasChildren && item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_top"
                      className="site-header__mobile-link"
                    >
                      <span className="site-header__mobile-side" aria-hidden="true" />
                      <span className="site-header__mobile-label">{item.label}</span>
                      <span className="site-header__mobile-side" aria-hidden="true" />
                    </a>
                  );
                }

                return (
                  <div key={item.label} className="site-header__mobile-group">
                    <button
                      type="button"
                      className="site-header__mobile-trigger"
                      onClick={() => toggleMobileDropdown(item.label)}
                      aria-expanded={isOpen}
                    >
                      <span className="site-header__mobile-side" aria-hidden="true" />
                      <span className="site-header__mobile-label">{item.label}</span>
                      <ChevronDown
                        className={`site-header__mobile-chevron ${isOpen ? "site-header__mobile-chevron--open" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen ? (
                      <div className="site-header__mobile-submenu">
                        {item.children?.map((child) => (
                          <a
                            key={child.label}
                            href={child.href}
                            target="_top"
                            className="site-header__mobile-sublink"
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
