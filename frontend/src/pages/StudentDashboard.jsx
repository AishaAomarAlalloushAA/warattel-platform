import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaClipboardCheck, FaFileAlt, FaGraduationCap, FaLink, FaTrophy, FaUser } from "react-icons/fa";
import { studentService } from "../services";
import { getCurrentUser } from "../auth/session";
import { ErrorState, LoadingState } from "../components/DataState";
import "./StudentDashboard.css";

function StudentDashboard() {
  const sessionUser = getCurrentUser();
  const sessionGender = sessionUser?.person?.gender || "male";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await studentService.dashboard()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const user = data?.student?.user || sessionUser;
  const gender = user?.person?.gender || sessionGender;
  const isFemale = gender === "female";
  const name = user?.full_name || user?.person?.full_name || (isFemale ? "الطالبة" : "الطالب");
  const dashboardTitle = isFemale ? "لوحة الطالبة" : "لوحة الطالب";

  const cards = useMemo(() => {
    const counts = data?.counts || {};
    const currentLevel = data?.current_level;
    return [
      [FaGraduationCap, "المستوى", currentLevel?.name_label || "غير محدد", "/student-level"],
      [FaFileAlt, "التقارير", counts.reports ?? 0, "/student-reports"],
      [FaClipboardCheck, "السبر", (counts.part_exams ?? 0) + (counts.level_exams ?? 0), "/student-tests"],
      [FaCalendarAlt, "الأنشطة", counts.activities ?? 0, "/student-activities"],
      [FaTrophy, "الإنجازات", counts.achievements ?? 0, "/student-achievements"],
      [FaLink, "الروابط التعليمية", "عرض", "/student-links"],
      [FaUser, "الملف الشخصي", "عرض", "/student-profile"],
    ];
  }, [data]);

  if (loading) {
    return <section className="student-section"><div className="student-container"><LoadingState label={`جاري تحميل ${dashboardTitle}...`} /></div></section>;
  }
  if (error) {
    return <section className="student-section"><div className="student-container"><ErrorState message={error} onRetry={load} /></div></section>;
  }

  return (
    <section className="student-section">
      <div className="student-container">
        <div className="student-dashboard-heading">
          <span className="student-dashboard-kicker">نادي ورتل</span>
          <h2 className="student-title">{dashboardTitle}</h2>
          <p className="student-name">{name}</p>
        </div>

        <div className="student-grid">
          {cards.map(([Icon, label, badge, href]) => (
            <button type="button" className="student-card" key={href} onClick={() => { window.location.href = href; }}>
              <Icon className="student-icon" />
              <span className="student-text">{label}</span>
              <span className="student-badge">{badge}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StudentDashboard;
