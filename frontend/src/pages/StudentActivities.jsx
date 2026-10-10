import { useCallback, useEffect, useState } from "react";
import { studentService } from "../services";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import "./StudentActivities.css";

function StudentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setActivities(await studentService.activities()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="activities-container">
      <h2 className="activities-title">الأنشطة</h2>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : activities.length === 0 ? <EmptyState title="لا توجد أنشطة مسجلة" /> : activities.map((activity) => (
        <div key={activity.id} className="activity-card">
          <div className="activity-row"><span className="activity-label">اسم النشاط:</span><span className="activity-value">{activity.title || "—"}</span></div>
          <div className="activity-row"><span className="activity-label">التاريخ:</span><span className="activity-value">{activity.date || "—"}</span></div>
          <div className="activity-row"><span className="activity-label">النوع:</span><span className="activity-value">{activity.type || "—"}</span></div>
          <div className="activity-row"><span className="activity-label">المقدم:</span><span className="activity-value">{activity.presenter || "—"}</span></div>
          <div className="activity-row"><span className="activity-label">الفئة:</span><span className="activity-value">{activity.gender || "—"}</span></div>
        </div>
      ))}
    </div>
  );
}

export default StudentActivities;
