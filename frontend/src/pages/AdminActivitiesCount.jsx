import { useCallback, useEffect, useState } from "react";
import { ErrorState, LoadingState } from "../components/DataState";
import { adminService } from "../services";
import "./AdminActivitiesCount.css";

function AdminActivitiesCount() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const dashboard = await adminService.dashboard();
      setStats(dashboard.activities || { total: 0, this_month: 0, this_week: 0, today: 0 });
    } catch (requestError) {
      setError(requestError.message || "تعذر تحميل إحصائيات الأنشطة.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="activitiescount-section">
      <div className="activitiescount-container">
        <div className="admin-page-heading">
          <div>
            <span className="admin-page-kicker">الإحصائيات</span>
            <h1>إحصائيات الأنشطة</h1>
            <p>متابعة حجم الأنشطة الفعلي خلال اليوم والأسبوع والشهر.</p>
          </div>
        </div>

        {loading ? <LoadingState label="جاري تحميل إحصائيات الأنشطة..." /> : error ? <ErrorState message={error} onRetry={load} /> : (
          <div className="activitiescount-card">
            <div className="activitiescount-row"><span className="activitiescount-label">عدد الأنشطة الكلي:</span><span className="activitiescount-value">{stats?.total ?? 0}</span></div>
            <div className="activitiescount-row"><span className="activitiescount-label">أنشطة هذا الشهر:</span><span className="activitiescount-value">{stats?.this_month ?? 0}</span></div>
            <div className="activitiescount-row"><span className="activitiescount-label">أنشطة هذا الأسبوع:</span><span className="activitiescount-value">{stats?.this_week ?? 0}</span></div>
            <div className="activitiescount-row"><span className="activitiescount-label">أنشطة اليوم:</span><span className="activitiescount-value">{stats?.today ?? 0}</span></div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminActivitiesCount;
