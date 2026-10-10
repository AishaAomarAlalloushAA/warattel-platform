import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaFileAlt, FaPlus, FaTimes } from "react-icons/fa";
import { adminService } from "../services";
import { getCurrentUser } from "../auth/session";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { toast } from "../ui/toast";
import "./AdminStudents.css";

const emptyForm = (gender) => ({
  fname: "",
  lname: "",
  email: "",
  password: "",
  gender,
  contact_number: "",
  year_of_study: "",
  serial_number: "",
  address: "",
  status: "active",
  level_id: "",
  supervisor_id: "",
});

function AdminStudents() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const gender = user?.person?.gender || localStorage.getItem("gender") || "male";
  const isFemale = gender === "female";
  const personWord = isFemale ? "الطالبة" : "الطالب";
  const groupWord = isFemale ? "الطالبات" : "الطلاب";

  const [students, setStudents] = useState([]);
  const [options, setOptions] = useState({ levels: [], supervisors: [], student_statuses: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => emptyForm(gender));
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 6;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [optionsResult, studentsResult] = await Promise.all([
        adminService.options(),
        adminService.students({ per_page: 100 }),
      ]);

      const scopedStudents = (studentsResult.items || []).filter(
        (student) => !student?.person?.gender || student.person.gender === gender
      );

      setOptions(optionsResult || {});
      setStudents(scopedStudents);
    } catch (err) {
      setError(err.message || "تعذر تحميل بيانات الطلاب.");
    } finally {
      setLoading(false);
    }
  }, [gender]);

  useEffect(() => { load(); }, [load]);

  const filteredStudents = useMemo(() => students.filter((student) => {
    const name = student?.person?.full_name || "";
    const matchesSearch = name.includes(searchTerm.trim());
    const matchesLevel = filterLevel === "all" || student?.current_level?.value === filterLevel;
    const matchesStatus = filterStatus === "all" || student?.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  }), [students, searchTerm, filterLevel, filterStatus]);

  const levelCounts = useMemo(() => ({
    all: students.length,
    tilawa: students.filter((item) => item?.current_level?.value === "tilawa").length,
    intiqali: students.filter((item) => item?.current_level?.value === "intiqali").length,
    ghaybi: students.filter((item) => item?.current_level?.value === "ghaybi").length,
  }), [students]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const currentStudents = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(gender));
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      fname: student.person?.fname || "",
      lname: student.person?.lname || "",
      email: student.person?.email || "",
      password: "",
      gender,
      contact_number: student.person?.contact_number || "",
      year_of_study: student.person?.year_of_study || "",
      serial_number: student.person?.serial_number || "",
      address: student.person?.address || "",
      status: student.status || "active",
      level_id: student.current_level?.level_id || "",
      supervisor_id: student.current_supervisor?.supervisor_id || "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.fname.trim()) errors.fname = `اسم ${personWord} الأول مطلوب.`;
    if (!form.lname.trim()) errors.lname = `اسم ${personWord} الأخير مطلوب.`;
    if (!form.email.trim()) errors.email = "البريد الإلكتروني مطلوب.";
    if (!form.contact_number.trim()) errors.contact_number = "رقم التواصل مطلوب.";
    if (!editing && form.password.length < 8) errors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    if (editing && form.password && form.password.length < 8) errors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    return errors;
  };

  const save = async (event) => {
    event.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      toast.warning("تحقق من الحقول المطلوبة ثم أعد المحاولة.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        gender,
        year_of_study: form.year_of_study ? Number(form.year_of_study) : null,
        serial_number: form.serial_number ? Number(form.serial_number) : null,
        level_id: form.level_id ? Number(form.level_id) : null,
        supervisor_id: form.supervisor_id ? Number(form.supervisor_id) : null,
      };
      if (editing && !payload.password) delete payload.password;

      if (editing) {
        await adminService.updateStudent(editing.id, payload);
        toast.success(`تم تحديث بيانات ${personWord} بنجاح.`);
      } else {
        await adminService.createStudent(payload);
        toast.success(`تمت إضافة ${personWord} بنجاح.`);
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      setFormErrors(err.fieldErrors || {});
      toast.error(err.message || "تعذر حفظ البيانات.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label={`جاري تحميل ${groupWord}...`} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="admin-students-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-page-kicker">إدارة النادي</span>
          <h1>إدارة {groupWord}</h1>
          <p>تظهر هنا بيانات {groupWord} فقط وفق جنس حساب المشرف، ولا يمكن الوصول إلى بيانات الجنس الآخر.</p>
        </div>
        <span className="gender-scope-badge">{isFemale ? "قسم الإناث" : "قسم الذكور"}</span>
      </div>

      <div className="filter-tabs">
        {[
          ["all", "الكل", levelCounts.all],
          ["tilawa", "تلاوة", levelCounts.tilawa],
          ["intiqali", "انتقالي", levelCounts.intiqali],
          ["ghaybi", "غيبي", levelCounts.ghaybi],
        ].map(([value, label, count]) => (
          <button key={value} type="button" className={`filter-tab ${filterLevel === value ? "active" : ""}`} onClick={() => { setFilterLevel(value); setCurrentPage(1); }}>
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="action-bar">
        <div className="search-wrapper">
          <input className="search-input" type="search" placeholder={`البحث باسم ${personWord}...`} value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} />
        </div>
        <div className="filter-wrapper">
          <select className="filter-select" value={filterStatus} onChange={(event) => { setFilterStatus(event.target.value); setCurrentPage(1); }}>
            <option value="all">جميع الحالات</option>
            {(options.student_statuses || []).map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </div>
        <button className="add-btn" type="button" onClick={openCreate}><FaPlus /><span>إضافة {personWord}</span></button>
      </div>

      {currentStudents.length === 0 ? (
        <EmptyState title={`لا يوجد ${groupWord}`} message="لا توجد نتائج مطابقة للبحث أو الفلاتر الحالية." />
      ) : (
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>المستوى</th>
                <th>الحالة</th>
                <th>تاريخ الانضمام</th>
                <th>{isFemale ? "المشرفة" : "المشرف"}</th>
                <th>الخطة / المنهج</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => (
                <tr key={student.id}>
                  <td>{(page - 1) * itemsPerPage + index + 1}</td>
                  <td><strong>{student.person?.full_name || "—"}</strong></td>
                  <td><span className={`level-badge level-${student.current_level?.value || "none"}`}>{student.current_level?.label || "غير محدد"}</span></td>
                  <td><span className={`status-badge status-${student.status || "inactive"}`}>{student.status_label || "غير محدد"}</span></td>
                  <td>{student.person?.join_date || "—"}</td>
                  <td>{student.current_supervisor?.name || "غير معيّن"}</td>
                  <td className="plan-cell">{student.current_level?.plan || "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="row-action" onClick={() => openEdit(student)} title="تعديل البيانات"><FaEdit /></button>
                      <button type="button" className="row-action" onClick={() => navigate(`/admin-reports-count?student_id=${student.id}`)} title="تقارير التسميع"><FaFileAlt /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredStudents.length > itemsPerPage && (
        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}>السابق</button>
          <span>صفحة {page} من {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}>التالي</button>
        </div>
      )}

      {modalOpen && (
        <div className="student-modal-overlay" onMouseDown={() => setModalOpen(false)}>
          <div className="student-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="student-modal__header">
              <div>
                <span>{isFemale ? "قسم الإناث" : "قسم الذكور"}</span>
                <h2>{editing ? `تعديل بيانات ${personWord}` : `إضافة ${personWord} جديد${isFemale ? "ة" : ""}`}</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="إغلاق"><FaTimes /></button>
            </div>

            <form className="student-form" onSubmit={save}>
              <div className="student-form-grid">
                <label><span>الاسم الأول</span><input value={form.fname} onChange={(e) => updateForm("fname", e.target.value)} />{formErrors.fname && <small>{Array.isArray(formErrors.fname) ? formErrors.fname[0] : formErrors.fname}</small>}</label>
                <label><span>الاسم الأخير</span><input value={form.lname} onChange={(e) => updateForm("lname", e.target.value)} />{formErrors.lname && <small>{Array.isArray(formErrors.lname) ? formErrors.lname[0] : formErrors.lname}</small>}</label>
                <label><span>البريد الإلكتروني</span><input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />{formErrors.email && <small>{Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}</small>}</label>
                <label><span>{editing ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}</span><input type="password" value={form.password} onChange={(e) => updateForm("password", e.target.value)} />{formErrors.password && <small>{Array.isArray(formErrors.password) ? formErrors.password[0] : formErrors.password}</small>}</label>
                <label><span>رقم التواصل</span><input value={form.contact_number} onChange={(e) => updateForm("contact_number", e.target.value)} />{formErrors.contact_number && <small>{Array.isArray(formErrors.contact_number) ? formErrors.contact_number[0] : formErrors.contact_number}</small>}</label>
                <label><span>السنة الجامعية</span><input type="number" min="1" value={form.year_of_study} onChange={(e) => updateForm("year_of_study", e.target.value)} /></label>
                <label><span>الرقم التسلسلي</span><input type="number" min="1" value={form.serial_number} onChange={(e) => updateForm("serial_number", e.target.value)} /></label>
                <label><span>مكان الإقامة</span><input value={form.address} onChange={(e) => updateForm("address", e.target.value)} /></label>
                <label><span>الحالة</span><select value={form.status} onChange={(e) => updateForm("status", e.target.value)}>{(options.student_statuses || []).map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
                <label><span>المستوى</span><select value={form.level_id} onChange={(e) => updateForm("level_id", e.target.value)}><option value="">غير محدد</option>{(options.levels || []).map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}</select></label>
                <label><span>{isFemale ? "المشرفة" : "المشرف"}</span><select value={form.supervisor_id} onChange={(e) => updateForm("supervisor_id", e.target.value)}><option value="">غير معيّن</option>{(options.supervisors || []).filter((item) => !item.gender || item.gender === gender).map((supervisor) => <option key={supervisor.id} value={supervisor.id}>{supervisor.name}</option>)}</select></label>
                <label className="student-form__scope"><span>القسم</span><input value={isFemale ? "الإناث" : "الذكور"} disabled /></label>
              </div>

              <div className="student-modal__actions">
                <button type="button" className="cancel-btn" onClick={() => setModalOpen(false)}>إلغاء</button>
                <button type="submit" className="save-btn" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ البيانات"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStudents;
