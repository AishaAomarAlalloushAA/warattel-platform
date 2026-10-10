import { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "../auth/session";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { supervisorService } from "../services/supervisorService";
import "./SupervisorPortal.css";

function SupervisorStudents() {
  const user = getCurrentUser();
  const isFemale = user?.person?.gender === "female";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems((await supervisorService.students()).items || []); }
    catch (err) { setError(err.message || "تعذر تحميل الطلاب."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="supervisor-page">
      <header className="supervisor-page__heading">
        <div><span className="supervisor-kicker">نطاق الإشراف</span><h1>{isFemale ? "طالباتي" : "طلابي"}</h1><p>هذه القائمة للقراءة فقط، وتحتوي على الطلاب المعيّنين لك حالياً.</p></div>
      </header>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : !items.length ? <EmptyState title="لا يوجد طلاب معيّنون لك" /> : (
        <div className="supervisor-table-wrap">
          <table className="supervisor-table">
            <thead><tr><th>#</th><th>الاسم</th><th>الحالة</th><th>المستوى الحالي</th><th>تاريخ الوصول</th><th>رقم التواصل</th></tr></thead>
            <tbody>{items.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.person?.full_name || "—"}</td>
                <td>{student.status_label || "—"}</td>
                <td>{student.current_level?.label || "غير محدد"}</td>
                <td>{student.current_level?.reached_at || "—"}</td>
                <td>{student.person?.contact_number || "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default SupervisorStudents;
