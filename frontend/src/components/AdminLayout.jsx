import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars, FaCalendarAlt, FaClipboardCheck, FaEnvelopeOpenText, FaFileAlt, FaHome, FaMoon,
  FaSignOutAlt, FaSun, FaTachometerAlt, FaTimes, FaUserCircle, FaUsers, FaUsersCog, FaUserShield,
} from "react-icons/fa";
import { getCurrentUser } from "../auth/session";
import { authService } from "../services";
import { toast } from "../ui/toast";
import "./AdminLayout.css";
import "./AdminShellPolish.css";

export const adminNavigation = [
  { to: "/admin-dashboard", label: "نظرة عامة", icon: FaTachometerAlt },
  { to: "/admin-inbox", label: "طلبات الزوار", icon: FaEnvelopeOpenText },
  { to: "/admin-students", label: "إدارة الطلاب", icon: FaUsersCog },
  { to: "/admin-supervisors", label: "إدارة المشرفين", icon: FaUserShield },
  { to: "/admin-reports-count", label: "تقارير التسميع", icon: FaFileAlt },
  { to: "/admin-exams-count", label: "اختبارات السبر", icon: FaClipboardCheck },
  { to: "/admin-students-count", label: "إحصائيات الطلاب", icon: FaUsers },
  { to: "/admin-activities-count", label: "إحصائيات الأنشطة", icon: FaCalendarAlt },
];

function AdminLayout({ children, theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const user = getCurrentUser();
  const isFemale = user?.person?.gender === "female";
  const adminName = user?.full_name || (isFemale ? "المشرفة" : "المشرف");
  const roleLabel = isFemale ? "مشرفة النظام" : "مشرف النظام";

  const navigation = useMemo(() => adminNavigation.map((item) => {
    if (!isFemale) return item;
    if (item.to === "/admin-students") return { ...item, label: "إدارة الطالبات" };
    if (item.to === "/admin-supervisors") return { ...item, label: "إدارة المشرفات" };
    if (item.to === "/admin-students-count") return { ...item, label: "إحصائيات الطالبات" };
    return item;
  }), [isFemale]);

  const pageTitles = useMemo(() => Object.fromEntries(navigation.map((item) => [item.to, item.label])), [navigation]);

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
      navigate("/login?role=admin", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="admin-shell">
      {mobileOpen && <button type="button" className="admin-shell__overlay" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)} />}

      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo-wrap"><img src="/w.png" alt="شعار نادي ورتل" /></div>
          <div className="admin-sidebar__brand-copy"><strong>نادي ورتل</strong><span>لوحة الإدارة</span></div>
          <button className="admin-sidebar__mobile-close" type="button" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة"><FaTimes /></button>
        </div>

        <div className="admin-sidebar__profile">
          <span className="admin-sidebar__avatar"><FaUserCircle /></span>
          <div><strong>{adminName}</strong><span>{roleLabel}</span></div>
        </div>

        <nav className="admin-sidebar__nav" aria-label="تنقل لوحة الإدارة">
          <span className="admin-sidebar__section-title">الإدارة</span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `admin-sidebar__link ${isActive ? "is-active" : ""}`}>
              <Icon aria-hidden="true" /><span>{label}</span>
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
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="فتح قائمة الإدارة"><FaBars /></button>
          <div><span>لوحة الإدارة</span><strong>{pageTitles[location.pathname] || "نادي ورتل"}</strong></div>
          <img src="/w.png" alt="" />
        </div>
        <main className="admin-workspace__content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
