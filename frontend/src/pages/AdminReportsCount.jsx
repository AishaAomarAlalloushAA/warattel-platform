import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaEdit, FaEye, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { getCurrentUser } from "../auth/session";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { adminService } from "../services";
import { toast } from "../ui/toast";
import "./AdminReportsCount.css";

const emptyForm = {
  id: null,
  student_id: "",
  supervisor_id: "",
  report_date: "",
  start_page: 1,
  quantity: 1,
  errors: [],
};

function AdminReportsCount() {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const gender = currentUser?.person?.gender || "male";
  const isFemale = gender === "female";
  const groupWord = isFemale ? "الطالبات" : "الطلاب";

  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [options, setOptions] = useState({ supervisors: [], errors: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const requestedStudentId = new URLSearchParams(location.search).get("student_id");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [studentsResult, optionsResult, reportsResult] = await Promise.all([
        adminService.students({ per_page: 100 }),
        adminService.options(),
        adminService.reports({ per_page: 100 }),
      ]);
      const scopedStudents = (studentsResult.items || []).filter(
        (student) => !student?.person?.gender || student.person.gender === gender
      );
      const allowedIds = new Set(scopedStudents.map((student) => Number(student.id)));
      setStudents(scopedStudents);
      setOptions(optionsResult || {});
      setReports((reportsResult.items || []).filter((report) => allowedIds.has(Number(report.student_id))));
    } catch (error) {
      setLoadError(error.message || "تعذر تحميل تقارير التسميع.");
    } finally {
      setLoading(false);
    }
  }, [gender]);

  useEffect(() => { load(); }, [load]);

  const visibleReports = useMemo(() => {
    if (!requestedStudentId) return reports;
    return reports.filter((report) => Number(report.student_id) === Number(requestedStudentId));
  }, [reports, requestedStudentId]);

  const studentName = (id) => students.find((item) => Number(item.id) === Number(id))?.person?.full_name || "—";
  const supervisorName = (id) => (options.supervisors || []).find((item) => Number(item.id) === Number(id))?.name || "—";

  const openCreate = () => {
    const preselected = requestedStudentId && students.some((item) => Number(item.id) === Number(requestedStudentId)) ? requestedStudentId : "";
    const student = students.find((item) => Number(item.id) === Number(preselected));
    setForm({
      ...emptyForm,
      student_id: preselected,
      supervisor_id: student?.current_supervisor?.supervisor_id || "",
      report_date: new Date().toISOString().slice(0, 10),
    });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (report) => {
    setForm({
      id: report.id,
      student_id: report.student_id || "",
      supervisor_id: report.supervisor_id || "",
      report_date: report.report_date || "",
      start_page: report.start_page ?? 1,
      quantity: report.quantity ?? 1,
      errors: (report.errors || []).map((item) => ({
        error_type: item.error_type || "",
        word: item.word || "",
        details: item.details || "",
      })),
    });
    setFormErrors({});
    setShowForm(true);
  };

  const change = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "student_id") {
        const student = students.find((item) => Number(item.id) === Number(value));
        next.supervisor_id = student?.current_supervisor?.supervisor_id || current.supervisor_id || "";
      }
      return next;
    });
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const addError = () => {
    setForm((current) => ({
      ...current,
      errors: [...current.errors, { error_type: "", word: "", details: "" }],
    }));
  };

  const updateError = (index, field, value) => {
    setForm((current) => ({
      ...current,
      errors: current.errors.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

  const removeError = (index) => {
    setForm((current) => ({ ...current, errors: current.errors.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const validate = () => {
    const errors = {};
    if (!form.student_id) errors.student_id = "اختر الطالب.";
    if (!form.supervisor_id) errors.supervisor_id = isFemale ? "اختاري المشرفة." : "اختر المشرف.";
    if (!form.report_date) errors.report_date = "تاريخ التسميع مطلوب.";
    if (Number(form.start_page) < 1 || Number(form.start_page) > 604) errors.start_page = "صفحة البداية يجب أن تكون بين 1 و604.";
    if (Number(form.quantity) < 1 || Number(form.quantity) > 604) errors.quantity = "عدد الصفحات غير صحيح.";
    form.errors.forEach((item, index) => {
      if (!item.error_type || !item.word.trim()) errors[`error_${index}`] = "حدد نوع الخطأ وموضعه.";
    });
    return errors;
  };

  const save = async (event) => {
    event.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      toast.warning("تحقق من بيانات تقرير التسميع قبل الحفظ.");
      return;
    }

    setSaving(true);
    try {
      await adminService.saveReport({
        id: form.id || undefined,
        student_id: Number(form.student_id),
        supervisor_id: Number(form.supervisor_id),
        report_date: form.report_date,
        start_page: Number(form.start_page),
        quantity: Number(form.quantity),
        errors: form.errors.map((item) => ({
          error_type: item.error_type,
          word: item.word.trim(),
          details: item.details.trim() || null,
        })),
      });
      toast.success(form.id ? "تم تحديث تقرير التسميع بنجاح." : "تمت إضافة تقرير التسميع بنجاح.");
      setShowForm(false);
      await load();
    } catch (error) {
      setFormErrors(error.fieldErrors || {});
      toast.error(error.message || "تعذر حفظ تقرير التسميع.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (report) => {
    if (confirmDelete !== report.id) {
      setConfirmDelete(report.id);
      toast.warning("اضغط زر الحذف مرة ثانية لتأكيد حذف التقرير.");
      return;
    }
    try {
      await adminService.deleteReport(report.id);
      setConfirmDelete(null);
      toast.success("تم حذف تقرير التسميع بنجاح.");
      await load();
    } catch (error) {
      toast.error(error.message || "تعذر حذف التقرير.");
    }
  };

  if (loading) return <LoadingState label="جاري تحميل تقارير التسميع..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

  return (
    <section className="admin-reports-page">
      <div className="admin-reports-container">
        <div className="admin-page-heading admin-reports-heading">
          <div>
            <span className="admin-page-kicker">متابعة التسميع</span>
            <h1>تقارير {groupWord}</h1>
            <p>إضافة وتعديل تقارير التسميع والأخطاء من نفس مصدر البيانات المختار للمشروع.</p>
          </div>
          <button type="button" className="add-row-btn" onClick={openCreate}><FaPlus /><span>إضافة تقرير</span></button>
        </div>

        {requestedStudentId && (
          <div className="reports-filter-note">عرض تقارير: <strong>{studentName(requestedStudentId)}</strong></div>
        )}

        {visibleReports.length === 0 ? <EmptyState title="لا توجد تقارير تسميع" message="يمكنك إضافة أول تقرير من الزر أعلاه." /> : (
          <div className="table-wrapper">
            <table className="reports-table">
              <thead><tr><th>#</th><th>الطالب</th><th>المشرف</th><th>التاريخ</th><th>صفحة البداية</th><th>الكمية</th><th>الأخطاء</th><th>الإجراءات</th></tr></thead>
              <tbody>
                {visibleReports.map((report, index) => (
                  <tr key={report.id}>
                    <td>{index + 1}</td>
                    <td>{report.student_name || studentName(report.student_id)}</td>
                    <td>{report.supervisor_name || supervisorName(report.supervisor_id)}</td>
                    <td>{report.report_date || "—"}</td>
                    <td>{report.start_page ?? "—"}</td>
                    <td>{report.quantity ?? "—"}</td>
                    <td>{report.errors?.length ? <button type="button" className="details-btn" onClick={() => setSelectedReport(report)}><FaEye /><span>{report.errors.length} أخطاء</span></button> : <span className="no-errors">لا يوجد</span>}</td>
                    <td><div className="reports-row-actions"><button type="button" onClick={() => openEdit(report)} title="تعديل"><FaEdit /></button><button type="button" className={confirmDelete === report.id ? "is-confirming" : ""} onClick={() => remove(report)} title="حذف"><FaTrash /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="reports-modal-overlay" onMouseDown={() => !saving && setShowForm(false)}>
          <div className="reports-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="reports-modal-close" onClick={() => setShowForm(false)} disabled={saving}><FaTimes /></button>
            <h2>{form.id ? "تعديل تقرير التسميع" : "إضافة تقرير تسميع"}</h2>
            <form onSubmit={save} noValidate>
              <div className="reports-form-grid">
                <label><span>الطالب</span><select value={form.student_id} onChange={(e) => change("student_id", e.target.value)}><option value="">اختر الطالب</option>{students.map((student) => <option key={student.id} value={student.id}>{student.person?.full_name}</option>)}</select>{formErrors.student_id && <small>{Array.isArray(formErrors.student_id) ? formErrors.student_id[0] : formErrors.student_id}</small>}</label>
                <label><span>{isFemale ? "المشرفة" : "المشرف"}</span><select value={form.supervisor_id} onChange={(e) => change("supervisor_id", e.target.value)}><option value="">اختر</option>{(options.supervisors || []).map((supervisor) => <option key={supervisor.id} value={supervisor.id}>{supervisor.name}</option>)}</select>{formErrors.supervisor_id && <small>{Array.isArray(formErrors.supervisor_id) ? formErrors.supervisor_id[0] : formErrors.supervisor_id}</small>}</label>
                <label><span>تاريخ التسميع</span><input type="date" value={form.report_date} onChange={(e) => change("report_date", e.target.value)} />{formErrors.report_date && <small>{formErrors.report_date}</small>}</label>
                <label><span>صفحة البداية</span><input type="number" min="1" max="604" value={form.start_page} onChange={(e) => change("start_page", e.target.value)} />{formErrors.start_page && <small>{formErrors.start_page}</small>}</label>
                <label><span>عدد الصفحات</span><input type="number" min="1" max="604" value={form.quantity} onChange={(e) => change("quantity", e.target.value)} />{formErrors.quantity && <small>{formErrors.quantity}</small>}</label>
              </div>

              <div className="reports-errors-editor">
                <div className="reports-errors-header"><div><strong>أخطاء التسميع</strong><span>اتركها فارغة إذا لم يوجد أخطاء.</span></div><button type="button" onClick={addError}><FaPlus /> إضافة خطأ</button></div>
                {form.errors.map((item, index) => (
                  <div className="reports-error-row" key={index}>
                    <select value={item.error_type} onChange={(e) => updateError(index, "error_type", e.target.value)}><option value="">نوع الخطأ</option>{(options.errors || []).map((error) => <option key={error.id || error.value} value={error.value}>{error.label}</option>)}</select>
                    <input value={item.word} onChange={(e) => updateError(index, "word", e.target.value)} placeholder="الكلمة / الموضع" />
                    <input value={item.details} onChange={(e) => updateError(index, "details", e.target.value)} placeholder="ملاحظات" />
                    <button type="button" className="delete-btn" onClick={() => removeError(index)}><FaTrash /></button>
                    {formErrors[`error_${index}`] && <small>{formErrors[`error_${index}`]}</small>}
                  </div>
                ))}
              </div>

              <div className="reports-form-actions"><button type="button" onClick={() => setShowForm(false)} disabled={saving}>إلغاء</button><button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ التقرير"}</button></div>
            </form>
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="reports-modal-overlay" onMouseDown={() => setSelectedReport(null)}>
          <div className="reports-modal reports-details-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="reports-modal-close" onClick={() => setSelectedReport(null)}><FaTimes /></button>
            <h2>تفاصيل أخطاء التسميع</h2>
            <p>{selectedReport.student_name || studentName(selectedReport.student_id)}</p>
            <div className="reports-errors-list">{selectedReport.errors.map((item, index) => <div key={item.id || index}><strong>{item.word || "—"}</strong><span>{item.error_type_label || item.error_type || "—"}</span><p>{item.details || "لا توجد ملاحظات."}</p></div>)}</div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminReportsCount;
