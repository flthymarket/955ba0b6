import { Link } from "react-router-dom";

const columns = [
  {
    title: "Services",
    links: [
      { label: "Search", href: "/collection" },
      { label: "Brands", href: "/brands" },
      { label: "Shop All", href: "/collection" },
      { label: "Shipping", href: "/help#shipping-policy" },
      { label: "Returns", href: "/help#refund-policy" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/help#terms-of-service" },
      { label: "Privacy", href: "/help#privacy-policy" },
      { label: "FAQ", href: "/help#faq" },
    ],
  },
  {
    title: "FLTHYMRKT",
    links: [
      { label: "About", href: "/help#about" },
      { label: "Contact", href: "/help#contact" },
      { label: "@flthymrkt", href: "https://instagram.com/flthymrkt", external: true },
      { label: "TikTok @flthymrkt", href: "https://tiktok.com/@flthymrkt", external: true },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-[hsl(0_0%_5%)] text-white mt-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 md:gap-8">
          <p className="text-[14px] leading-relaxed text-white/80 max-w-[380px]">
            A carefully curated collection of rare streetwear, archive pieces and accessories — limited edition
            collaborations and exceptional vintage.
          </p>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="editorial-heading text-[10px] text-white/60 mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] text-white/90 hover:text-white hover:underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-[14px] text-white/90 hover:text-white hover:underline">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="editorial-heading text-[10px] text-white/50 mt-16">
          © {new Date().getFullYear()} FLTHYMRKT
        </p>
      </div>
    </footer>
  );
};

export default Footer;
