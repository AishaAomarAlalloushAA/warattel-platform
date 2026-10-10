import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../auth/session";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { adminService } from "../services";
import "./AdminStudentsCount.css";

function AdminStudentsCount() {
  const user = getCurrentUser();
  const gender = user?.person?.gender || "male";
  const isFemale = gender === "female";
  const group = isFemale ? "الطالبات" : "الطلاب";
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminService.students({ per_page: 100 });
      setStudents((result.items || []).filter((item) => !item?.person?.gender || item.person.gender === gender));
    } catch (requestError) {
      setError(requestError.message || `تعذر تحميل إحصائيات ${group}.`);
    } finally {
      setLoading(false);
    }
  }, [gender, group]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: students.length,
      active: students.filter((item) => item.status === "active").length,
      inactive: students.filter((item) => item.status === "inactive").length,
      graduated: students.filter((item) => item.status === "graduated").length,
      newThisMonth: students.filter((item) => {
        if (!item.person?.join_date) return false;
        const date = new Date(`${item.person.join_date}T00:00:00`);
        return !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      }).length,
    };
  }, [students]);

  return (
    <section className="studentscount-section">
      <div className="studentscount-container">
        <div className="admin-page-heading">
          <div>
            <span className="admin-page-kicker">الإحصائيات</span>
            <h1>إحصائيات {group}</h1>
            <p>الأرقام محسوبة من البيانات الحالية ضمن قسم {isFemale ? "الطالبات" : "الطلاب"} فقط.</p>
          </div>
        </div>

        {loading ? <LoadingState label={`جاري تحميل إحصائيات ${group}...`} /> : error ? <ErrorState message={error} onRetry={load} /> : students.length === 0 ? <EmptyState title={`لا يوجد ${group} مسجلون حالياً`} /> : (
          <div className="studentscount-wrapper">
            <div className="studentscount-card">
              <div className="studentscount-row"><span className="studentscount-label">العدد الكلي:</span><span className="studentscount-value">{stats.total}</span></div>
              <div className="studentscount-row"><span className="studentscount-label">النشطون:</span><span className="studentscount-value">{stats.active}</span></div>
              <div className="studentscount-row"><span className="studentscount-label">المنقطعون:</span><span className="studentscount-value">{stats.inactive}</span></div>
              <div className="studentscount-row"><span className="studentscount-label">المتخرجون:</span><span className="studentscount-value">{stats.graduated}</span></div>
              <div className="studentscount-row"><span className="studentscount-label">الجدد هذا الشهر:</span><span className="studentscount-value">{stats.newThisMonth}</span></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminStudentsCount;
