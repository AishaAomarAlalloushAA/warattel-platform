import { useCallback, useEffect, useState } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import { getCurrentUser } from "../auth/session";
import { studentService } from "../services";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import "./StudentTests.css";

const iconLabelStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" };
const decisionLabel = (value) => value === "promote" ? "مؤهل للترفيع إلى المستوى الجديد" : value === "stay" ? "يبقى في المستوى الحالي" : "قيد التقييم";
const resultLabel = (value) => value === "passed" ? "ناجح" : value === "failed" ? "راسب" : "غير محدد";

function StudentTests() {
  const [data, setData] = useState({ part_exams: [], level_exams: [] });
  const [selectedExam, setSelectedExam] = useState(null);
  const [modalType, setModalType] = useState("parts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const studentName = getCurrentUser()?.full_name || "الطالب";

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await studentService.exams()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openModal = (exam, type) => { setSelectedExam(exam); setModalType(type); };
  const closeModal = () => setSelectedExam(null);

  return (
    <section className="student-tests-section">
      <div className="student-tests-container">
        <h2 className="student-tests-title">سبر الأجزاء والمستويات</h2>
        <p className="student-tests-subtitle">نتائج السبر الخاصة بـ {studentName}</p>
        {loading ? <LoadingState label="جاري تحميل نتائج السبر..." /> : error ? <ErrorState message={error} onRetry={load} /> : (
          <>
            <div className="tests-section">
              <h3 className="tests-section-title">سبر الأجزاء</h3>
              {!data.part_exams?.length ? <EmptyState title="لا يوجد سبر أجزاء" message="ستظهر النتائج هنا بعد تسجيل السبر." /> : (
                <div className="table-wrapper"><table className="tests-table"><thead><tr><th>#</th><th>تاريخ السبر</th><th>جزء البداية</th><th>كمية الأجزاء</th><th>النوع</th><th>الأخطاء</th><th>الدرجة</th><th>النتيجة</th></tr></thead><tbody>
                  {data.part_exams.map((exam, index) => <tr key={exam.id}><td>{index + 1}</td><td>{exam.date}</td><td>{exam.part}</td><td>{exam.quantity}</td><td>{exam.exam_type_label || "—"}</td><td>{!exam.errors?.length ? <span className="no-errors">لا يوجد أخطاء</span> : <button className="details-btn" onClick={() => openModal(exam, "parts")} style={iconLabelStyle}><FaEye /><span>عرض التفاصيل ({exam.errors.length})</span></button>}</td><td>{exam.score ?? "—"}</td><td><span className={`result-badge ${exam.result === "passed" ? "pass" : exam.result === "failed" ? "fail" : ""}`}>{resultLabel(exam.result)}</span></td></tr>)}
                </tbody></table></div>
              )}
            </div>

            <div className="tests-section">
              <h3 className="tests-section-title">سبر المستويات</h3>
              {!data.level_exams?.length ? <EmptyState title="لا يوجد سبر مستويات" message="ستظهر نتائج تقييم المستوى هنا بعد تسجيلها." /> : (
                <div className="table-wrapper"><table className="tests-table"><thead><tr><th>#</th><th>تاريخ السبر</th><th>المستوى الحالي</th><th>المستوى المستهدف</th><th>المشرف</th><th>القرار</th><th>التفاصيل</th></tr></thead><tbody>
                  {data.level_exams.map((exam, index) => <tr key={exam.id}><td>{index + 1}</td><td>{exam.date}</td><td>{exam.current_level_label || "—"}</td><td>{exam.target_level_label || "—"}</td><td>{exam.supervisor?.name || "—"}</td><td><span className={`result-badge ${exam.decision === "promote" ? "pass" : exam.decision === "stay" ? "fail" : ""}`}>{decisionLabel(exam.decision)}</span></td><td><button className="details-btn" onClick={() => openModal(exam, "levels")} style={iconLabelStyle}><FaEye /><span>عرض التفاصيل</span></button></td></tr>)}
                </tbody></table></div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedExam && (
        <div className="modal-overlay" onClick={closeModal}><div className="modal-content" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={closeModal} aria-label="إغلاق"><FaTimes /></button>
          {modalType === "parts" ? <><h3 className="modal-title">تفاصيل الأخطاء</h3><p className="modal-student"><strong>الطالب:</strong> {studentName}</p>{!selectedExam.errors?.length ? <p className="no-errors-modal">لا توجد أخطاء</p> : <table className="errors-table"><thead><tr><th>الكلمة / موضع الخطأ</th><th>نوع الخطأ</th><th>الملاحظات</th></tr></thead><tbody>{selectedExam.errors.map((item, index) => <tr key={item.id ?? index}><td>{item.word || "—"}</td><td>{item.type_label || item.type || "—"}</td><td>{item.details || "—"}</td></tr>)}</tbody></table>}</> : <><h3 className="modal-title">تفاصيل سبر المستوى</h3><p className="modal-student"><strong>الطالب:</strong> {studentName}</p><div className="level-details"><div className="level-row"><span className="level-label">المستوى الحالي:</span><span className="level-value">{selectedExam.current_level_label || "—"}</span></div><div className="level-row"><span className="level-label">المستوى المستهدف:</span><span className="level-value">{selectedExam.target_level_label || "—"}</span></div><div className="level-row"><span className="level-label">المشرف:</span><span className="level-value">{selectedExam.supervisor?.name || "—"}</span></div></div><h4 className="evaluation-title">محاور التقييم</h4><div className="evaluation-grid"><div className="eval-item"><span className="eval-label">مخارج الحروف والصفات:</span><span className="eval-value">{selectedExam.evaluation?.makharij ?? "—"}%</span></div><div className="eval-item"><span className="eval-label">الأحكام والمدود:</span><span className="eval-value">{selectedExam.evaluation?.ahkam ?? "—"}%</span></div><div className="eval-item"><span className="eval-label">الطلاقة وحسن الأداء:</span><span className="eval-value">{selectedExam.evaluation?.fluency ?? "—"}%</span></div></div><div className="level-notes"><strong>الملاحظات:</strong><p>{selectedExam.notes || "لا توجد ملاحظات."}</p></div><div className="level-decision"><strong>القرار النهائي:</strong><span className={`decision-badge ${selectedExam.decision === "promote" ? "pass" : "fail"}`}>{decisionLabel(selectedExam.decision)}</span></div></>}
        </div></div>
      )}
    </section>
  );
}

export default StudentTests;
