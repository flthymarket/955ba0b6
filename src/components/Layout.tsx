import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import NewsletterPopup from "./NewsletterPopup";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <NewsletterPopup />
    </>
  );
};

export default Layout;
