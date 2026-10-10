import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaPlus, FaSearch, FaTimes, FaUserShield } from "react-icons/fa";
import { fieldErrorsForForm } from "../api/errors";
import { getCurrentUser } from "../auth/session";
import { ErrorState, LoadingState } from "../components/DataState";
import { adminSupervisorService } from "../services/adminSupervisorService";
import { confirmation, email as validateEmail, password as validatePassword, phone as validatePhone, required, validateFields } from "../utils/validation";
import { toast } from "../ui/toast";
import "./AdminSupervisors.css";

const initialForm = {
  fname: "",
  lname: "",
  email: "",
  password: "",
  password_confirmation: "",
  contact_number: "",
  address: "",
};

function AdminSupervisors() {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const isFemale = currentUser?.person?.gender === "female";
  const singular = isFemale ? "مشرفة" : "مشرف";
  const plural = isFemale ? "المشرفات" : "المشرفين";

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminSupervisorService.list({ search, per_page: 100 });
      setItems(result.items || []);
    } catch (requestError) {
      setError(requestError.message || "تعذر تحميل قائمة المشرفين.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(load, 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  const title = useMemo(() => `إدارة ${plural}`, [plural]);

  const openModal = useCallback(() => {
    setForm(initialForm);
    setErrors({});
    setShowModal(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("add") === "1") openModal();
  }, [location.search, openModal]);

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields({
      fname: () => required(form.fname, "الاسم الأول"),
      lname: () => required(form.lname, "اسم العائلة"),
      email: () => validateEmail(form.email),
      contact_number: () => validatePhone(form.contact_number),
      password: () => validatePassword(form.password),
      password_confirmation: () => confirmation(form.password_confirmation, form.password),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.warning("يرجى التحقق من بيانات المشرف قبل الحفظ.");
      return;
    }

    setSaving(true);
    try {
      const result = await adminSupervisorService.create({
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
        contact_number: form.contact_number.trim(),
        address: form.address.trim() || null,
        gender: currentUser?.person?.gender || "male",
      });
      toast.success(result.message || `تمت إضافة ${singular} بنجاح.`);
      setShowModal(false);
      setForm(initialForm);
      await load();
    } catch (requestError) {
      setErrors(fieldErrorsForForm(requestError.fieldErrors));
      toast.error(requestError.message || `تعذر إضافة ${singular}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-supervisors-page">
      <header className="admin-page-heading admin-supervisors-heading">
        <div>
          <span className="admin-page-kicker">إدارة النادي</span>
          <h1>{title}</h1>
          <p>إدارة حسابات الدخول للمشرفين ضمن نفس القسم، مع الحفاظ على الفصل بين الطلاب والطالبات.</p>
        </div>
        <button type="button" className="admin-supervisors-add" onClick={openModal}>
          <FaPlus aria-hidden="true" />
          <span>إضافة {singular}</span>
        </button>
      </header>

      <div className="admin-supervisors-toolbar">
        <div className="admin-supervisors-search">
          <FaSearch aria-hidden="true" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`البحث ضمن ${plural}...`} />
        </div>
        <div className="admin-supervisors-scope">
          <FaUserShield aria-hidden="true" />
          <span>{isFemale ? "قسم الطالبات" : "قسم الطلاب"}</span>
        </div>
      </div>

      {loading ? (
        <LoadingState label={`جاري تحميل ${plural}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="admin-supervisors-table-wrap">
          <table className="admin-supervisors-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>رقم التواصل</th>
                <th>تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="5" className="admin-supervisors-empty">لا توجد حسابات مطابقة حالياً.</td></tr>
              ) : items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><strong>{item.full_name}</strong></td>
                  <td>{item.email}</td>
                  <td>{item.contact_number || "—"}</td>
                  <td>{item.join_date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-supervisors-modal-overlay" onMouseDown={closeModal}>
          <div className="admin-supervisors-modal" role="dialog" aria-modal="true" aria-labelledby="add-supervisor-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="admin-supervisors-modal-close" onClick={closeModal} aria-label="إغلاق"><FaTimes /></button>
            <div className="admin-supervisors-modal-header">
              <span className="admin-supervisors-modal-icon"><FaUserShield /></span>
              <div>
                <span>حساب دخول جديد</span>
                <h2 id="add-supervisor-title">إضافة {singular}</h2>
                <p>سيتم إنشاء الحساب ضمن {isFemale ? "قسم الطالبات" : "قسم الطلاب"} تلقائياً.</p>
              </div>
            </div>

            <form className="admin-supervisors-form" onSubmit={handleSubmit} noValidate>
              <div className="admin-supervisors-form-grid">
                <label>
                  <span>الاسم الأول</span>
                  <input name="fname" value={form.fname} onChange={handleChange} aria-invalid={Boolean(errors.fname)} />
                  {errors.fname && <small>{errors.fname}</small>}
                </label>
                <label>
                  <span>اسم العائلة</span>
                  <input name="lname" value={form.lname} onChange={handleChange} aria-invalid={Boolean(errors.lname)} />
                  {errors.lname && <small>{errors.lname}</small>}
                </label>
                <label className="admin-supervisors-form-wide">
                  <span>البريد الإلكتروني</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" aria-invalid={Boolean(errors.email)} />
                  {errors.email && <small>{errors.email}</small>}
                </label>
                <label>
                  <span>رقم التواصل</span>
                  <input name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="09xxxxxxxx" aria-invalid={Boolean(errors.contact_number)} />
                  {errors.contact_number && <small>{errors.contact_number}</small>}
                </label>
                <label>
                  <span>العنوان <em>(اختياري)</em></span>
                  <input name="address" value={form.address} onChange={handleChange} />
                </label>
                <label>
                  <span>كلمة المرور</span>
                  <input type="password" name="password" value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} />
                  {errors.password && <small>{errors.password}</small>}
                </label>
                <label>
                  <span>تأكيد كلمة المرور</span>
                  <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} aria-invalid={Boolean(errors.password_confirmation)} />
                  {errors.password_confirmation && <small>{errors.password_confirmation}</small>}
                </label>
              </div>

              <div className="admin-supervisors-form-actions">
                <button type="button" className="admin-supervisors-cancel" onClick={closeModal} disabled={saving}>إلغاء</button>
                <button type="submit" className="admin-supervisors-save" disabled={saving}>{saving ? "جاري الحفظ..." : `إضافة ${singular}`}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminSupervisors;
