import { useCallback, useEffect, useMemo, useState } from "react";
import { FaEdit, FaEye, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { getCurrentUser } from "../auth/session";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { adminService } from "../services";
import { toast } from "../ui/toast";
import "./AdminExamsCount.css";

const emptyPartForm = {
  id: null,
  student_id: "",
  supervisor_id: "",
  exam_date: "",
  part: 1,
  quantity: 1,
  exam_type: "",
  score: "",
  result: "",
  errors: [],
};

const emptyLevelForm = {
  id: null,
  student_id: "",
  supervisor_id: "",
  target_level_id: "",
  exam_date: "",
  makharij_score: "",
  ahkam_score: "",
  fluency_score: "",
  notes: "",
  decision: "",
};

const resultLabel = (value) => value === "passed" ? "ناجح" : value === "failed" ? "راسب" : "غير محدد";
const decisionLabel = (value) => value === "promote" ? "مؤهل للترفيع" : value === "stay" ? "يبقى في المستوى الحالي" : "قيد التقييم";

function AdminExamsCount() {
  const currentUser = getCurrentUser();
  const gender = currentUser?.person?.gender || "male";
  const isFemale = gender === "female";
  const groupWord = isFemale ? "الطالبات" : "الطلاب";

  const [tab, setTab] = useState("parts");
  const [students, setStudents] = useState([]);
  const [options, setOptions] = useState({ supervisors: [], levels: [], errors: [], exam_types: [] });
  const [partExams, setPartExams] = useState([]);
  const [levelExams, setLevelExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("parts");
  const [partForm, setPartForm] = useState(emptyPartForm);
  const [levelForm, setLevelForm] = useState(emptyLevelForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [studentsResult, optionsResult, partResult, levelResult] = await Promise.all([
        adminService.students({ per_page: 100 }),
        adminService.options(),
        adminService.partExams({ per_page: 100 }),
        adminService.levelExams(),
      ]);
      const scopedStudents = (studentsResult.items || []).filter(
        (student) => !student?.person?.gender || student.person.gender === gender
      );
      const allowedIds = new Set(scopedStudents.map((student) => Number(student.id)));
      setStudents(scopedStudents);
      setOptions(optionsResult || {});
      setPartExams((partResult.items || []).filter((exam) => allowedIds.has(Number(exam.student_id))));
      setLevelExams((levelResult.items || []).filter((exam) => allowedIds.has(Number(exam.student_id))));
    } catch (error) {
      setLoadError(error.message || "تعذر تحميل اختبارات السبر.");
    } finally {
      setLoading(false);
    }
  }, [gender]);

  useEffect(() => { load(); }, [load]);

  const studentName = (id) => students.find((item) => Number(item.id) === Number(id))?.person?.full_name || "—";
  const supervisorName = (id) => (options.supervisors || []).find((item) => Number(item.id) === Number(id))?.name || "—";
  const levelLabel = (id) => (options.levels || []).find((item) => Number(item.id) === Number(id))?.label || "—";

  const currentItems = useMemo(() => tab === "parts" ? partExams : levelExams, [tab, partExams, levelExams]);

  const openCreate = (type = tab) => {
    setFormType(type);
    setFormErrors({});
    const date = new Date().toISOString().slice(0, 10);
    if (type === "parts") setPartForm({ ...emptyPartForm, exam_date: date });
    else setLevelForm({ ...emptyLevelForm, exam_date: date });
    setShowForm(true);
  };

  const openEditPart = (exam) => {
    setFormType("parts");
    setPartForm({
      id: exam.id,
      student_id: exam.student_id || "",
      supervisor_id: exam.supervisor_id || "",
      exam_date: exam.exam_date || "",
      part: exam.part ?? 1,
      quantity: exam.quantity ?? 1,
      exam_type: exam.exam_type || "",
      score: exam.score ?? "",
      result: exam.result || "",
      errors: (exam.errors || []).map((item) => ({ error_type: item.error_type || "", word: item.word || "", details: item.details || "" })),
    });
    setFormErrors({});
    setShowForm(true);
  };

  const openEditLevel = (exam) => {
    setFormType("levels");
    setLevelForm({
      id: exam.id,
      student_id: exam.student_id || "",
      supervisor_id: exam.supervisor_id || "",
      target_level_id: exam.target_level_id || "",
      exam_date: exam.exam_date || "",
      makharij_score: exam.makharij_score ?? "",
      ahkam_score: exam.ahkam_score ?? "",
      fluency_score: exam.fluency_score ?? "",
      notes: exam.notes || "",
      decision: exam.decision || "",
    });
    setFormErrors({});
    setShowForm(true);
  };

  const changePart = (field, value) => {
    setPartForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const changeLevel = (field, value) => {
    setLevelForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const addPartError = () => setPartForm((current) => ({ ...current, errors: [...current.errors, { error_type: "", word: "", details: "" }] }));
  const updatePartError = (index, field, value) => setPartForm((current) => ({ ...current, errors: current.errors.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const removePartError = (index) => setPartForm((current) => ({ ...current, errors: current.errors.filter((_, itemIndex) => itemIndex !== index) }));

  const validatePart = () => {
    const errors = {};
    if (!partForm.student_id) errors.student_id = "اختر الطالب.";
    if (!partForm.supervisor_id) errors.supervisor_id = "اختر المشرف.";
    if (!partForm.exam_date) errors.exam_date = "تاريخ السبر مطلوب.";
    if (!partForm.exam_type) errors.exam_type = "نوع السبر مطلوب.";
    if (Number(partForm.part) < 1 || Number(partForm.part) > 30) errors.part = "الجزء يجب أن يكون بين 1 و30.";
    if (Number(partForm.quantity) < 1 || Number(partForm.quantity) > 30) errors.quantity = "كمية الأجزاء غير صحيحة.";
    if (partForm.score !== "" && (Number(partForm.score) < 0 || Number(partForm.score) > 100)) errors.score = "الدرجة يجب أن تكون بين 0 و100.";
    partForm.errors.forEach((item, index) => { if (!item.error_type || !item.word.trim()) errors[`error_${index}`] = "حدد نوع الخطأ وموضعه."; });
    return errors;
  };

  const validateLevel = () => {
    const errors = {};
    if (!levelForm.student_id) errors.student_id = "اختر الطالب.";
    if (!levelForm.supervisor_id) errors.supervisor_id = "اختر المشرف.";
    if (!levelForm.exam_date) errors.exam_date = "تاريخ السبر مطلوب.";
    ["makharij_score", "ahkam_score", "fluency_score"].forEach((field) => {
      if (levelForm[field] !== "" && (Number(levelForm[field]) < 0 || Number(levelForm[field]) > 100)) errors[field] = "القيمة يجب أن تكون بين 0 و100.";
    });
    return errors;
  };

  const save = async (event) => {
    event.preventDefault();
    const errors = formType === "parts" ? validatePart() : validateLevel();
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      toast.warning("تحقق من بيانات السبر قبل الحفظ.");
      return;
    }

    setSaving(true);
    try {
      if (formType === "parts") {
        await adminService.savePartExam({
          id: partForm.id || undefined,
          student_id: Number(partForm.student_id),
          supervisor_id: Number(partForm.supervisor_id),
          exam_date: partForm.exam_date,
          part: Number(partForm.part),
          quantity: Number(partForm.quantity),
          exam_type: partForm.exam_type,
          score: partForm.score === "" ? null : Number(partForm.score),
          result: partForm.result || null,
          errors: partForm.errors.map((item) => ({ error_type: item.error_type, word: item.word.trim(), details: item.details.trim() || null })),
        });
      } else {
        await adminService.saveLevelExam({
          id: levelForm.id || undefined,
          student_id: Number(levelForm.student_id),
          supervisor_id: Number(levelForm.supervisor_id),
          target_level_id: levelForm.target_level_id ? Number(levelForm.target_level_id) : null,
          exam_date: levelForm.exam_date,
          makharij_score: levelForm.makharij_score === "" ? null : Number(levelForm.makharij_score),
          ahkam_score: levelForm.ahkam_score === "" ? null : Number(levelForm.ahkam_score),
          fluency_score: levelForm.fluency_score === "" ? null : Number(levelForm.fluency_score),
          notes: levelForm.notes.trim() || null,
          decision: levelForm.decision || null,
        });
      }
      toast.success("تم حفظ السبر بنجاح.");
      setShowForm(false);
      await load();
    } catch (error) {
      setFormErrors(error.fieldErrors || {});
      toast.error(error.message || "تعذر حفظ السبر.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (exam, type) => {
    const key = `${type}-${exam.id}`;
    if (confirmDelete !== key) {
      setConfirmDelete(key);
      toast.warning("اضغط زر الحذف مرة ثانية لتأكيد العملية.");
      return;
    }
    try {
      if (type === "parts") await adminService.deletePartExam(exam.id);
      else await adminService.deleteLevelExam(exam.id);
      setConfirmDelete("");
      toast.success("تم حذف السبر بنجاح.");
      await load();
    } catch (error) {
      toast.error(error.message || "تعذر حذف السبر.");
    }
  };

  if (loading) return <LoadingState label="جاري تحميل اختبارات السبر..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

  return (
    <section className="admin-exams-page">
      <div className="admin-page-heading admin-exams-heading">
        <div><span className="admin-page-kicker">التقييم</span><h1>اختبارات سبر {groupWord}</h1><p>إدارة سبر الأجزاء والمستويات ونتائج التقييم من مصدر البيانات الفعلي.</p></div>
        <button type="button" className="admin-exams-add" onClick={() => openCreate()}><FaPlus /> إضافة سبر</button>
      </div>

      <div className="admin-exams-tabs">
        <button type="button" className={tab === "parts" ? "is-active" : ""} onClick={() => setTab("parts")}>سبر الأجزاء ({partExams.length})</button>
        <button type="button" className={tab === "levels" ? "is-active" : ""} onClick={() => setTab("levels")}>سبر المستويات ({levelExams.length})</button>
      </div>

      {currentItems.length === 0 ? <EmptyState title={tab === "parts" ? "لا يوجد سبر أجزاء" : "لا يوجد سبر مستويات"} message="يمكنك إضافة أول سبر من الزر أعلاه." /> : (
        <div className="admin-exams-table-wrap">
          {tab === "parts" ? (
            <table className="admin-exams-table"><thead><tr><th>#</th><th>الطالب</th><th>التاريخ</th><th>الجزء</th><th>الكمية</th><th>النوع</th><th>الدرجة</th><th>النتيجة</th><th>الأخطاء</th><th>الإجراءات</th></tr></thead><tbody>
              {partExams.map((exam, index) => <tr key={exam.id}><td>{index + 1}</td><td>{exam.student_name || studentName(exam.student_id)}</td><td>{exam.exam_date || "—"}</td><td>{exam.part}</td><td>{exam.quantity}</td><td>{exam.exam_type_label || exam.exam_type || "—"}</td><td>{exam.score ?? "—"}</td><td><span className={`exam-result ${exam.result || "pending"}`}>{exam.result_label || resultLabel(exam.result)}</span></td><td>{exam.errors?.length ? <button type="button" className="exam-details" onClick={() => setSelectedExam({ ...exam, _type: "parts" })}><FaEye /> {exam.errors.length}</button> : "لا يوجد"}</td><td><div className="exam-actions"><button type="button" onClick={() => openEditPart(exam)}><FaEdit /></button><button type="button" className={confirmDelete === `parts-${exam.id}` ? "is-confirming" : ""} onClick={() => remove(exam, "parts")}><FaTrash /></button></div></td></tr>)}
            </tbody></table>
          ) : (
            <table className="admin-exams-table"><thead><tr><th>#</th><th>الطالب</th><th>التاريخ</th><th>المستوى الحالي</th><th>المستهدف</th><th>المشرف</th><th>القرار</th><th>الإجراءات</th></tr></thead><tbody>
              {levelExams.map((exam, index) => <tr key={exam.id}><td>{index + 1}</td><td>{exam.student_name || studentName(exam.student_id)}</td><td>{exam.exam_date || "—"}</td><td>{exam.current_level_label || "—"}</td><td>{exam.target_level_label || levelLabel(exam.target_level_id)}</td><td>{exam.supervisor_name || supervisorName(exam.supervisor_id)}</td><td><button type="button" className="exam-details" onClick={() => setSelectedExam({ ...exam, _type: "levels" })}>{decisionLabel(exam.decision)}</button></td><td><div className="exam-actions"><button type="button" onClick={() => openEditLevel(exam)}><FaEdit /></button><button type="button" className={confirmDelete === `levels-${exam.id}` ? "is-confirming" : ""} onClick={() => remove(exam, "levels")}><FaTrash /></button></div></td></tr>)}
            </tbody></table>
          )}
        </div>
      )}

      {showForm && (
        <div className="admin-exams-modal-overlay" onMouseDown={() => !saving && setShowForm(false)}><div className="admin-exams-modal" onMouseDown={(e) => e.stopPropagation()}><button type="button" className="admin-exams-modal-close" onClick={() => setShowForm(false)}><FaTimes /></button><h2>{formType === "parts" ? "سبر الأجزاء" : "سبر المستويات"}</h2>
          <form onSubmit={save} noValidate>
            {formType === "parts" ? (
              <>
                <div className="admin-exams-form-grid">
                  <label><span>الطالب</span><select value={partForm.student_id} onChange={(e) => changePart("student_id", e.target.value)}><option value="">اختر الطالب</option>{students.map((student) => <option key={student.id} value={student.id}>{student.person?.full_name}</option>)}</select>{formErrors.student_id && <small>{formErrors.student_id}</small>}</label>
                  <label><span>المشرف</span><select value={partForm.supervisor_id} onChange={(e) => changePart("supervisor_id", e.target.value)}><option value="">اختر المشرف</option>{(options.supervisors || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{formErrors.supervisor_id && <small>{formErrors.supervisor_id}</small>}</label>
                  <label><span>تاريخ السبر</span><input type="date" value={partForm.exam_date} onChange={(e) => changePart("exam_date", e.target.value)} />{formErrors.exam_date && <small>{formErrors.exam_date}</small>}</label>
                  <label><span>نوع السبر</span><select value={partForm.exam_type} onChange={(e) => changePart("exam_type", e.target.value)}><option value="">اختر النوع</option>{(options.exam_types || []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{formErrors.exam_type && <small>{formErrors.exam_type}</small>}</label>
                  <label><span>جزء البداية</span><input type="number" min="1" max="30" value={partForm.part} onChange={(e) => changePart("part", e.target.value)} />{formErrors.part && <small>{formErrors.part}</small>}</label>
                  <label><span>كمية الأجزاء</span><input type="number" min="1" max="30" value={partForm.quantity} onChange={(e) => changePart("quantity", e.target.value)} />{formErrors.quantity && <small>{formErrors.quantity}</small>}</label>
                  <label><span>الدرجة</span><input type="number" min="0" max="100" value={partForm.score} onChange={(e) => changePart("score", e.target.value)} />{formErrors.score && <small>{formErrors.score}</small>}</label>
                  <label><span>النتيجة</span><select value={partForm.result} onChange={(e) => changePart("result", e.target.value)}><option value="">غير محدد</option><option value="passed">ناجح</option><option value="failed">راسب</option></select></label>
                </div>
                <div className="exam-errors-editor"><div className="exam-errors-header"><strong>أخطاء السبر</strong><button type="button" onClick={addPartError}><FaPlus /> إضافة خطأ</button></div>{partForm.errors.map((item, index) => <div className="exam-error-row" key={index}><select value={item.error_type} onChange={(e) => updatePartError(index, "error_type", e.target.value)}><option value="">نوع الخطأ</option>{(options.errors || []).map((error) => <option key={error.id || error.value} value={error.value}>{error.label}</option>)}</select><input value={item.word} onChange={(e) => updatePartError(index, "word", e.target.value)} placeholder="الكلمة / الموضع" /><input value={item.details} onChange={(e) => updatePartError(index, "details", e.target.value)} placeholder="الملاحظات" /><button type="button" onClick={() => removePartError(index)}><FaTrash /></button>{formErrors[`error_${index}`] && <small>{formErrors[`error_${index}`]}</small>}</div>)}</div>
              </>
            ) : (
              <div className="admin-exams-form-grid">
                <label><span>الطالب</span><select value={levelForm.student_id} onChange={(e) => changeLevel("student_id", e.target.value)}><option value="">اختر الطالب</option>{students.map((student) => <option key={student.id} value={student.id}>{student.person?.full_name}</option>)}</select>{formErrors.student_id && <small>{formErrors.student_id}</small>}</label>
                <label><span>المشرف</span><select value={levelForm.supervisor_id} onChange={(e) => changeLevel("supervisor_id", e.target.value)}><option value="">اختر المشرف</option>{(options.supervisors || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{formErrors.supervisor_id && <small>{formErrors.supervisor_id}</small>}</label>
                <label><span>تاريخ السبر</span><input type="date" value={levelForm.exam_date} onChange={(e) => changeLevel("exam_date", e.target.value)} />{formErrors.exam_date && <small>{formErrors.exam_date}</small>}</label>
                <label><span>المستوى المستهدف</span><select value={levelForm.target_level_id} onChange={(e) => changeLevel("target_level_id", e.target.value)}><option value="">غير محدد</option>{(options.levels || []).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <label><span>مخارج الحروف والصفات %</span><input type="number" min="0" max="100" value={levelForm.makharij_score} onChange={(e) => changeLevel("makharij_score", e.target.value)} />{formErrors.makharij_score && <small>{formErrors.makharij_score}</small>}</label>
                <label><span>الأحكام والمدود %</span><input type="number" min="0" max="100" value={levelForm.ahkam_score} onChange={(e) => changeLevel("ahkam_score", e.target.value)} />{formErrors.ahkam_score && <small>{formErrors.ahkam_score}</small>}</label>
                <label><span>الطلاقة وحسن الأداء %</span><input type="number" min="0" max="100" value={levelForm.fluency_score} onChange={(e) => changeLevel("fluency_score", e.target.value)} />{formErrors.fluency_score && <small>{formErrors.fluency_score}</small>}</label>
                <label><span>القرار</span><select value={levelForm.decision} onChange={(e) => changeLevel("decision", e.target.value)}><option value="">قيد التقييم</option><option value="promote">مؤهل للترفيع</option><option value="stay">يبقى في المستوى الحالي</option></select></label>
                <label className="exam-form-wide"><span>الملاحظات</span><textarea rows="3" value={levelForm.notes} onChange={(e) => changeLevel("notes", e.target.value)} /></label>
              </div>
            )}
            <div className="admin-exams-form-actions"><button type="button" onClick={() => setShowForm(false)} disabled={saving}>إلغاء</button><button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ السبر"}</button></div>
          </form>
        </div></div>
      )}

      {selectedExam && <div className="admin-exams-modal-overlay" onMouseDown={() => setSelectedExam(null)}><div className="admin-exams-modal exam-detail-modal" onMouseDown={(e) => e.stopPropagation()}><button type="button" className="admin-exams-modal-close" onClick={() => setSelectedExam(null)}><FaTimes /></button><h2>تفاصيل السبر</h2>{selectedExam._type === "parts" ? <div className="exam-details-list">{selectedExam.errors?.length ? selectedExam.errors.map((item, index) => <div key={item.id || index}><strong>{item.word || "—"}</strong><span>{item.error_type_label || item.error_type || "—"}</span><p>{item.details || "لا توجد ملاحظات."}</p></div>) : <p>لا توجد أخطاء.</p>}</div> : <div className="level-evaluation"><p><strong>الطالب:</strong> {selectedExam.student_name || studentName(selectedExam.student_id)}</p><p><strong>مخارج الحروف:</strong> {selectedExam.makharij_score ?? "—"}%</p><p><strong>الأحكام:</strong> {selectedExam.ahkam_score ?? "—"}%</p><p><strong>الطلاقة:</strong> {selectedExam.fluency_score ?? "—"}%</p><p><strong>القرار:</strong> {decisionLabel(selectedExam.decision)}</p><p><strong>الملاحظات:</strong> {selectedExam.notes || "لا توجد ملاحظات."}</p></div>}</div></div>}
    </section>
  );
}

export default AdminExamsCount;
