import {
  FaArrowLeft,
  FaChartLine,
  FaClipboardCheck,
  FaEnvelopeOpenText,
  FaFileAlt,
  FaUsers,
  FaUsersCog,
  FaUserPlus,
  FaUserShield,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../auth/session";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isFemale = user?.person?.gender === "female";
  const adminName = user?.full_name || (isFemale ? "المشرفة" : "المشرف");
  const supervisorLabel = isFemale ? "مشرفة" : "مشرف";

  const dashboardItems = [
    {
      title: "طلبات الزوار",
      description: "مراجعة طلبات التطوع والاقتراحات الواردة من الموقع العام.",
      path: "/admin-inbox",
      icon: FaEnvelopeOpenText,
    },
    {
      title: isFemale ? "إدارة الطالبات" : "إدارة الطلاب",
      description: isFemale ? "إضافة الطالبات وتعديل بياناتهن ومستوياتهن وحالتهن." : "إضافة الطلاب وتعديل بياناتهم ومستوياتهم وحالتهم.",
      path: "/admin-students",
      icon: FaUsersCog,
    },
    {
      title: isFemale ? "إدارة المشرفات" : "إدارة المشرفين",
      description: isFemale ? "إضافة حسابات دخول للمشرفات ضمن قسم الطالبات." : "إضافة حسابات دخول للمشرفين ضمن قسم الطلاب.",
      path: "/admin-supervisors",
      icon: FaUserShield,
    },
    {
      title: "تقارير التسميع",
      description: "متابعة التقارير والأخطاء وتفاصيل جلسات التسميع.",
      path: "/admin-reports-count",
      icon: FaFileAlt,
    },
    {
      title: "اختبارات السبر",
      description: "إدارة سبر الأجزاء والمستويات ونتائج التقييم.",
      path: "/admin-exams-count",
      icon: FaClipboardCheck,
    },
    {
      title: isFemale ? "إحصائيات الطالبات" : "إحصائيات الطلاب",
      description: "عرض الأعداد والحالات والتوزيع بشكل سريع.",
      path: "/admin-students-count",
      icon: FaUsers,
    },
    {
      title: "إحصائيات الأنشطة",
      description: "متابعة مؤشرات النشاط اليومية والأسبوعية والشهرية.",
      path: "/admin-activities-count",
      icon: FaChartLine,
    },
  ];

  return (
    <section className="admin-section">
      <div className="admin-container">
        <header className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-eyebrow">مساحة الإدارة</span>
            <h1>مرحباً، {adminName}</h1>
            <p>إدارة عمليات نادي ورتل من مكان واحد بشكل واضح ومنظم.</p>
          </div>
          <div className="admin-dashboard-status">
            <span className="admin-dashboard-status__dot" />
            <div>
              <strong>النظام جاهز</strong>
              <span>البيانات والصلاحيات مرتبطة حسب إعداد مصدر البيانات</span>
            </div>
          </div>
        </header>

        <div className="admin-dashboard-section-heading">
          <div>
            <h2>أقسام الإدارة</h2>
            <p>اختر القسم الذي تريد العمل عليه.</p>
          </div>
          <button type="button" className="admin-dashboard-add-supervisor" onClick={() => navigate("/admin-supervisors?add=1")}>
            <FaUserPlus aria-hidden="true" />
            <span>إضافة {supervisorLabel}</span>
          </button>
        </div>

        <div className="admin-grid">
          {dashboardItems.map(({ title, description, path, icon: Icon }) => (
            <button className="admin-card" type="button" key={path} onClick={() => navigate(path)}>
              <span className="admin-card__icon"><Icon /></span>
              <span className="admin-card__body">
                <strong>{title}</strong>
                <span>{description}</span>
              </span>
              <span className="admin-card__arrow" aria-hidden="true"><FaArrowLeft /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
