import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Contact", href: "/help#contact" },
  { label: "Shipping", href: "/help#shipping-policy" },
  { label: "Returns", href: "/help#refund-policy" },
  { label: "Privacy", href: "/help#privacy-policy" },
  { label: "Terms", href: "/help#terms-of-service" },
  { label: "FAQ", href: "/help#faq" },
  { label: "Instagram", href: "https://instagram.com/flthymrkt" },
  { label: "TikTok", href: "https://tiktok.com/@flthymrkt" },
];

const Footer = () => {
  return (
    <footer className="w-full pt-24 pb-8 bg-background text-foreground">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 text-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6">
          {footerLinks.map((link) =>
            link.href.startsWith("http") ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link text-[13px]"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.href} className="nav-link text-[13px]">
                {link.label}
              </Link>
            )
          )}
        </nav>
        <p className="text-[12px] font-mono-ui mt-6">
          © {new Date().getFullYear()}, FLTHYMRKT
        </p>
      </div>
    </footer>
  );
};

export default Footer;
