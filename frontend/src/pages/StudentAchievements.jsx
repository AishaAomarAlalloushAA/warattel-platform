import { useCallback, useEffect, useState } from "react";
import { FaTrophy } from "react-icons/fa";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { studentService } from "../services";
import "./StudentAchievements.css";

function StudentAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAchievements(await studentService.achievements());
    } catch (requestError) {
      setError(requestError.message || "تعذر تحميل الإنجازات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="achievements-container">
      <h2 className="achievements-title">الإنجازات</h2>
      {loading ? (
        <LoadingState label="جاري تحميل الإنجازات..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : achievements.length === 0 ? (
        <EmptyState title="لا توجد إنجازات مسجلة" message="ستظهر إنجازاتك هنا بعد اعتمادها من إدارة النادي." />
      ) : achievements.map((achievement) => (
        <div key={achievement.id} className="achievement-card">
          <div className="achievement-row">
            <FaTrophy aria-hidden="true" />
            <span className="achievement-label">عنوان الإنجاز:</span>
            <span className="achievement-value">{achievement.title || "—"}</span>
          </div>
          <div className="achievement-row">
            <span className="achievement-label">النوع:</span>
            <span className="achievement-value">{achievement.type_label || achievement.type || "—"}</span>
          </div>
          <div className="achievement-row">
            <span className="achievement-label">التاريخ:</span>
            <span className="achievement-value">{achievement.date || "—"}</span>
          </div>
          <div className="achievement-row">
            <span className="achievement-label">الوصف:</span>
            <span className="achievement-value">{achievement.description || "لا يوجد وصف إضافي."}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentAchievements;
