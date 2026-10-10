import { useCallback, useEffect, useState } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import { getCurrentUser } from "../auth/session";
import { studentService } from "../services";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import "./StudentReports.css";

const iconLabelStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" };

function StudentReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const studentName = getCurrentUser()?.full_name || "الطالب";

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setReports(await studentService.reports()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="student-reports-page">
      <div className="student-reports-container">
        <h1 className="student-reports-title">تقارير التسميع</h1>
        <p className="student-reports-subtitle">تقارير التسميع الخاصة بـ {studentName}</p>

        {loading ? <LoadingState label="جاري تحميل التقارير..." /> : error ? <ErrorState message={error} onRetry={load} /> : reports.length === 0 ? (
          <EmptyState title="لا توجد تقارير بعد" message="ستظهر تقارير التسميع هنا بعد تسجيلها من المشرف." />
        ) : (
          <div className="table-wrapper">
            <table className="reports-table">
              <thead><tr><th>#</th><th>اسم المسمع</th><th>تاريخ التسميع</th><th>المستوى</th><th>صفحة البداية</th><th>عدد الصفحات</th><th>الأخطاء</th></tr></thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={report.id}>
                    <td>{index + 1}</td>
                    <td>{report.supervisor?.name || "—"}</td>
                    <td>{report.date || "—"}</td>
                    <td>{report.level_label || "—"}</td>
                    <td>{report.start_page ?? "—"}</td>
                    <td>{report.quantity ?? "—"}</td>
                    <td>{!report.errors?.length ? <span className="no-errors">لا يوجد خطأ</span> : <button className="details-btn" onClick={() => setSelectedReport(report)} style={iconLabelStyle}><FaEye /><span>عرض التفاصيل</span></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReport(null)} aria-label="إغلاق"><FaTimes /></button>
            <h3 className="modal-title">تفاصيل الأخطاء</h3>
            <p className="modal-student"><strong>الطالب:</strong> {studentName}</p>
            <table className="errors-table">
              <thead><tr><th>الكلمة / موضع الخطأ</th><th>نوع الخطأ</th><th>الملاحظات</th></tr></thead>
              <tbody>{selectedReport.errors.map((item, index) => <tr key={item.id ?? index}><td>{item.word || "—"}</td><td>{item.type_label || item.type || "—"}</td><td>{item.details || "—"}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentReports;
