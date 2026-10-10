import React, { Component } from "react";
import {
  FaBars,
  FaMoon,
  FaShieldAlt,
  FaSun,
  FaTimes,
  FaUserGraduate,
  FaUserTie,
} from "react-icons/fa";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = { menuOpen: false, showRoleModal: false };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", this.handleResize);
  }

  componentDidUpdate() {
    const { menuOpen, showRoleModal } = this.state;
    document.body.style.overflow = menuOpen || showRoleModal ? "hidden" : "";
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);
    document.body.style.overflow = "";
  }

  handleKeyDown = (event) => {
    if (event.key === "Escape") this.setState({ menuOpen: false, showRoleModal: false });
  };

  handleResize = () => {
    if (window.innerWidth > 980 && this.state.menuOpen) this.setState({ menuOpen: false });
  };

  toggleMenu = () => this.setState((prev) => ({ menuOpen: !prev.menuOpen }));
  closeMenu = () => this.setState({ menuOpen: false });
  openRoleModal = () => this.setState({ menuOpen: false, showRoleModal: true });
  closeRoleModal = () => this.setState({ showRoleModal: false });

  handleRoleSelect = (role) => {
    this.closeRoleModal();
    window.location.href = `/login?role=${role}`;
  };

  goToSection = (sectionId) => {
    this.closeMenu();
    if (window.location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.location.href = `/#${sectionId}`;
  };

  renderNavigation = (mobile = false) => (
    <ul className={mobile ? "mobile-drawer__links" : "nav-links"}>
      <li><button className="nav-link" type="button" onClick={() => this.goToSection("home-section")}>الرئيسية</button></li>
      <li><button className="nav-link" type="button" onClick={() => this.goToSection("about-section")}>عن النادي</button></li>
      <li><button className="nav-link" type="button" onClick={() => this.goToSection("programs-section")}>ماذا نقدم</button></li>
      <li><a className="nav-link-anchor" href="/lectures" onClick={this.closeMenu}>المحاضرات والأنشطة</a></li>
      <li><button className="nav-link" type="button" onClick={() => this.goToSection("contact-section")}>انضم إلينا</button></li>
      <li><a className="nav-link-anchor" href="/feedback" onClick={this.closeMenu}>آراؤكم تهمّنا</a></li>
    </ul>
  );

  render() {
    const { toggleTheme, theme } = this.props;
    const { menuOpen, showRoleModal } = this.state;

    return (
      <>
        <nav className="navbar" aria-label="التنقل الرئيسي">
          <div className="logo">
            <button type="button" className="logo-button" aria-label="العودة إلى بداية الصفحة" onClick={() => this.goToSection("home-section")}>
              <img src="/w.png" alt="نادي ورتل" className="logo-img" />
            </button>
          </div>

          {this.renderNavigation(false)}

          <div className="nav-actions">
            <button className="login-btn desktop-nav-action" type="button" onClick={this.openRoleModal}>تسجيل الدخول</button>
            <button className="theme-icon-btn desktop-nav-action" type="button" onClick={toggleTheme} aria-label={theme === "light" ? "تفعيل الوضع الداكن" : "تفعيل الوضع الفاتح"} title={theme === "light" ? "الوضع الداكن" : "الوضع الفاتح"}>
              {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>
            <button className="hamburger-btn" type="button" onClick={this.toggleMenu} aria-expanded={menuOpen} aria-controls="mobile-navigation-drawer" aria-label="فتح قائمة التنقل"><FaBars /></button>
          </div>
        </nav>

        {menuOpen && (
          <div className="mobile-drawer-layer">
            <button type="button" className="mobile-drawer-overlay" aria-label="إغلاق قائمة التنقل" onClick={this.closeMenu} />
            <aside className="mobile-drawer" id="mobile-navigation-drawer" role="dialog" aria-modal="true" aria-label="قائمة التنقل">
              <div className="mobile-drawer__header">
                <button type="button" className="mobile-drawer__brand" onClick={() => this.goToSection("home-section")}>
                  <img src="/w.png" alt="" /><span><strong>نادي ورتل</strong><small>نقرأ القرآن كما أُنزل</small></span>
                </button>
                <button type="button" className="mobile-drawer__close" aria-label="إغلاق القائمة" onClick={this.closeMenu}><FaTimes /></button>
              </div>
              <nav className="mobile-drawer__nav" aria-label="التنقل على الهاتف">{this.renderNavigation(true)}</nav>
              <div className="mobile-drawer__footer">
                <button className="mobile-drawer__login" type="button" onClick={this.openRoleModal}>تسجيل الدخول</button>
                <button className="mobile-drawer__theme" type="button" onClick={toggleTheme}>{theme === "light" ? <FaMoon /> : <FaSun />}<span>{theme === "light" ? "الوضع الداكن" : "الوضع الفاتح"}</span></button>
              </div>
            </aside>
          </div>
        )}

        {showRoleModal && (
          <div className="role-modal-overlay" onClick={this.closeRoleModal}>
            <div className="role-modal" role="dialog" aria-modal="true" aria-labelledby="role-modal-title" onClick={(event) => event.stopPropagation()}>
              <button className="role-modal-close" type="button" onClick={this.closeRoleModal} aria-label="إغلاق"><FaTimes /></button>
              <h2 className="role-modal-title" id="role-modal-title">اختر نوع الحساب</h2>
              <div className="role-options">
                <button className="role-option" type="button" onClick={() => this.handleRoleSelect("student")}><FaUserGraduate className="role-icon" /><span>طالب/ة</span></button>
                <button className="role-option" type="button" onClick={() => this.handleRoleSelect("supervisor")}><FaUserTie className="role-icon" /><span>مشرف/ة</span></button>
                <button className="role-option" type="button" onClick={() => this.handleRoleSelect("admin")}><FaShieldAlt className="role-icon" /><span>الإدارة</span></button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default Navbar;
