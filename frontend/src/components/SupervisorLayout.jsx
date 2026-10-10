import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FaBars, FaClipboardCheck, FaFileAlt, FaHome, FaMoon, FaSignOutAlt, FaSun, FaTachometerAlt, FaTimes, FaUserCircle, FaUsers } from "react-icons/fa";
import { getCurrentUser } from "../auth/session";
import { authService } from "../services";
import { toast } from "../ui/toast";
import "./AdminLayout.css";
import "./AdminShellPolish.css";

function SupervisorLayout({ children, theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const user = getCurrentUser();
  const isFemale = user?.person?.gender === "female";
  const name = user?.full_name || (isFemale ? "المشرفة" : "المشرف");

  const navigation = useMemo(() => [
    { to: "/supervisor-dashboard", label: "نظرة عامة", icon: FaTachometerAlt },
    { to: "/supervisor-students", label: isFemale ? "طالباتي" : "طلابي", icon: FaUsers },
    { to: "/supervisor-reports", label: "تقارير التسميع", icon: FaFileAlt },
    { to: "/supervisor-exams", label: "اختبارات السبر", icon: FaClipboardCheck },
  ], [isFemale]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authService.logout();
      toast.success("تم تسجيل الخروج بنجاح.");
      navigate("/login?role=supervisor", { replace: true });
    } finally { setLoggingOut(false); }
  };

  return (
    <div className="admin-shell supervisor-shell">
      {mobileOpen && <button type="button" className="admin-shell__overlay" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)} />}
      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo-wrap"><img src="/w.png" alt="شعار نادي ورتل" /></div>
          <div className="admin-sidebar__brand-copy"><strong>نادي ورتل</strong><span>لوحة المشرف</span></div>
          <button className="admin-sidebar__mobile-close" type="button" onClick={() => setMobileOpen(false)} aria-label="إغلاق"><FaTimes /></button>
        </div>
        <div className="admin-sidebar__profile">
          <span className="admin-sidebar__avatar"><FaUserCircle /></span>
          <div><strong>{name}</strong><span>{isFemale ? "مشرفة" : "مشرف"}</span></div>
        </div>
        <nav className="admin-sidebar__nav" aria-label="تنقل لوحة المشرف">
          <span className="admin-sidebar__section-title">عملي</span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `admin-sidebar__link ${isActive ? "is-active" : ""}`}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__bottom">
          <button type="button" className="admin-sidebar__utility" onClick={toggleTheme}>{theme === "light" ? <FaMoon /> : <FaSun />}<span>{theme === "light" ? "الوضع الداكن" : "الوضع الفاتح"}</span></button>
          <button type="button" className="admin-sidebar__utility" onClick={() => navigate("/")}><FaHome /><span>العودة للرئيسية</span></button>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout} disabled={loggingOut}><FaSignOutAlt /><span>{loggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</span></button>
        </div>
      </aside>
      <div className="admin-workspace">
        <div className="admin-mobilebar">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة"><FaBars /></button>
          <div><span>لوحة المشرف</span><strong>{navigation.find((item) => item.to === location.pathname)?.label || "نادي ورتل"}</strong></div>
          <img src="/w.png" alt="" />
        </div>
        <main className="admin-workspace__content">{children}</main>
      </div>
    </div>
  );
}

export default SupervisorLayout;
