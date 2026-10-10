import { useCallback, useEffect, useState } from "react";
import { studentService } from "../services";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import "./StudentLevel.css";

const formatDate = (value) => {
  if (!value) return "غير محدد";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ar", { year: "numeric", month: "long", day: "numeric" }).format(date);
};

function StudentLevel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await studentService.level()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="student-level-page">
      <div className="student-level-container">
        <div className="level-header"><h1 className="level-title">المستوى</h1></div>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : !data?.current ? (
          <EmptyState title="لم يتم تحديد المستوى بعد" message="سيظهر مستواك وخطتك هنا بعد اعتماد المستوى من إدارة النادي." />
        ) : (
          <div className="level-grid">
            <div className="level-card card-highlight"><div className="card-body"><span className="card-label">المستوى الحالي</span><span className="card-value">{data.current.name_label || data.current.label || "غير محدد"}</span><span className="card-hint">المستوى المعتمد حالياً</span></div></div>
            <div className="level-card card-soft"><div className="card-body"><span className="card-label">تاريخ الانتقال</span><span className="card-value">{formatDate(data.current.reached_at)}</span><span className="card-hint">تاريخ الوصول إلى هذا المستوى</span></div></div>
            <div className="level-card card-wide"><div className="card-body"><span className="card-label">الخطة والمنهج</span><span className="card-value plan-text">{data.current.plan || "لم تتم إضافة خطة لهذا المستوى بعد."}</span></div></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentLevel;
