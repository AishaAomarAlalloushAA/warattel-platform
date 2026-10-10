import Navbar from "./Navbar";
import Footer from "./Footer";
import "./SiteLayout.css";

function SiteLayout({ children, theme, toggleTheme, showFooter = false }) {
  return (
    <div className="site-layout">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="site-layout__content">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

export default SiteLayout;
