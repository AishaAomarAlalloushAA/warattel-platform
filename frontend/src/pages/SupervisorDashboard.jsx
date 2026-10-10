import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../auth/session";
import { ErrorState, LoadingState } from "../components/DataState";
import { supervisorService } from "../services/supervisorService";
import "./SupervisorPortal.css";

function SupervisorDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isFemale = user?.person?.gender === "female";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setStats(await supervisorService.dashboard()); }
    catch (err) { setError(err.message || "تعذر تحميل لوحة المشرف."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState label="جاري تحميل لوحة المشرف..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="supervisor-page">
      <header className="supervisor-page__heading">
        <div><span className="supervisor-kicker">مساحة الإشراف</span><h1>{isFemale ? "لوحة المشرفة" : "لوحة المشرف"}</h1><p>{user?.full_name || ""} — تظهر لك فقط البيانات المرتبطة بالطلاب المعيّنين لك.</p></div>
        <span className="supervisor-scope">صلاحيات إشراف محدودة</span>
      </header>

      <div className="supervisor-grid">
        <div className="supervisor-stat"><strong>{stats?.students ?? 0}</strong><span>{isFemale ? "طالباتي" : "طلابي"}</span></div>
        <div className="supervisor-stat"><strong>{stats?.reports ?? 0}</strong><span>تقارير التسميع</span></div>
        <div className="supervisor-stat"><strong>{stats?.part_exams ?? 0}</strong><span>سبر الأجزاء</span></div>
        <div className="supervisor-stat"><strong>{stats?.level_exams ?? 0}</strong><span>سبر المستويات</span></div>
      </div>

      <div className="supervisor-card">
        <h2>الوصول السريع</h2>
        <div className="supervisor-actions">
          <button className="supervisor-primary" onClick={() => navigate("/supervisor-students")}>{isFemale ? "عرض طالباتي" : "عرض طلابي"}</button>
          <button className="supervisor-secondary" onClick={() => navigate("/supervisor-reports")}>تقارير التسميع</button>
          <button className="supervisor-secondary" onClick={() => navigate("/supervisor-exams")}>اختبارات السبر</button>
        </div>
      </div>
    </section>
  );
}

export default SupervisorDashboard;
