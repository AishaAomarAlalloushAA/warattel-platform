import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCircle,
  FaEnvelope,
  FaGraduationCap,
  FaHashtag,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaVenusMars,
} from "react-icons/fa";
import { getToken, saveSession } from "../auth/session";
import { fieldErrorsForForm } from "../api/errors";
import { ErrorState, LoadingState } from "../components/DataState";
import { studentService } from "../services";
import { email as validateEmail, phone as validatePhone, required, validateFields } from "../utils/validation";
import { toast } from "../ui/toast";
import "./StudentProfile.css";

const emptyForm = {
  fname: "",
  lname: "",
  email: "",
  year_of_study: "",
  contact_number: "",
  address: "",
};

function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fillForm = (user) => {
    const person = user?.person || {};
    setForm({
      fname: person.fname || "",
      lname: person.lname || "",
      email: user?.email || "",
      year_of_study: person.year_of_study ?? "",
      contact_number: person.contact_number || "",
      address: person.address || "",
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const user = await studentService.profile();
      setProfile(user);
      fillForm(user);
    } catch (error) {
      setLoadError(error.message || "تعذر تحميل الملف الشخصي.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const status = profile?.role_data?.status_label || profile?.role_data?.status || "غير محدد";
  const isActive = profile?.role_data?.status === "active";
  const genderLabel = profile?.person?.gender_label || (profile?.person?.gender === "female" ? "أنثى" : "ذكر");
  const fullName = profile?.full_name || profile?.person?.full_name || "الطالب";

  const fields = useMemo(() => [
    [FaUser, "الاسم الكامل", fullName],
    [FaGraduationCap, "السنة الدراسية", profile?.person?.year_of_study ? `السنة ${profile.person.year_of_study}` : "غير محددة"],
    [FaCalendarAlt, "تاريخ الانضمام", profile?.person?.join_date || "غير محدد"],
    [FaCircle, "حالة الحساب", status],
    [FaVenusMars, "الجنس", genderLabel],
    [FaPhone, "رقم التواصل", profile?.person?.contact_number || "غير محدد"],
    [FaMapMarkerAlt, "العنوان", profile?.person?.address || "غير محدد"],
    [FaEnvelope, "البريد الإلكتروني", profile?.email || "غير محدد"],
    [FaHashtag, "الرقم التسلسلي", profile?.person?.serial_number || "غير محدد"],
  ], [profile, fullName, status, genderLabel]);

  const change = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const cancel = () => {
    fillForm(profile);
    setErrors({});
    setIsEditing(false);
  };

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields({
      fname: () => required(form.fname, "الاسم الأول"),
      lname: () => required(form.lname, "الاسم الأخير"),
      email: () => validateEmail(form.email),
      contact_number: () => validatePhone(form.contact_number),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.warning("يرجى التحقق من بيانات الملف الشخصي.");
      return;
    }

    setSaving(true);
    try {
      const updated = await studentService.updateProfile({
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        email: form.email.trim(),
        year_of_study: form.year_of_study ? Number(form.year_of_study) : null,
        contact_number: form.contact_number.trim(),
        address: form.address.trim() || null,
      });
      setProfile(updated);
      fillForm(updated);
      saveSession({ token: getToken(), user: updated });
      setIsEditing(false);
      toast.success("تم تحديث الملف الشخصي بنجاح.");
    } catch (error) {
      setErrors(fieldErrorsForForm(error.fieldErrors, {
        fname: "fname",
        lname: "lname",
        email: "email",
        year_of_study: "year_of_study",
        contact_number: "contact_number",
        address: "address",
      }));
      toast.error(error.message || "تعذر تحديث الملف الشخصي.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-page"><div className="profile-container"><LoadingState label="جاري تحميل الملف الشخصي..." /></div></div>;
  if (loadError) return <div className="profile-page"><div className="profile-container"><ErrorState message={loadError} onRetry={load} /></div></div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="sidebar-avatar"><FaUser aria-hidden="true" /></div>
          <h2 className="sidebar-name">{fullName}</h2>
          <p className="sidebar-welcome">أهلاً بك في حسابك</p>
          <nav className="sidebar-nav">
            <button type="button" className="sidebar-link active">البيانات الشخصية</button>
            <button type="button" className="sidebar-link" onClick={() => navigate("/change-password")}>تغيير كلمة السر</button>
          </nav>
        </aside>

        <main className="profile-content">
          <div className="content-header">
            <div>
              <h1 className="content-title">الملف الشخصي</h1>
              <p>الجنس، حالة الحساب، تاريخ الانضمام والرقم التسلسلي معلومات إدارية للعرض فقط.</p>
            </div>
            <div className="header-actions">
              {!isEditing ? (
                <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>تعديل البيانات</button>
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <form className="profile-card" onSubmit={save} noValidate>
              <div className="info-list">
                <div className="info-row"><FaUser className="info-icon" /><span className="info-label">الاسم الأول</span><input className="edit-input" value={form.fname} onChange={(e) => change("fname", e.target.value)} />{errors.fname && <small className="error-text">{errors.fname}</small>}</div>
                <div className="info-row"><FaUser className="info-icon" /><span className="info-label">الاسم الأخير</span><input className="edit-input" value={form.lname} onChange={(e) => change("lname", e.target.value)} />{errors.lname && <small className="error-text">{errors.lname}</small>}</div>
                <div className="info-row"><FaEnvelope className="info-icon" /><span className="info-label">البريد الإلكتروني</span><input type="email" className="edit-input" value={form.email} onChange={(e) => change("email", e.target.value)} />{errors.email && <small className="error-text">{errors.email}</small>}</div>
                <div className="info-row"><FaPhone className="info-icon" /><span className="info-label">رقم التواصل</span><input className="edit-input" value={form.contact_number} onChange={(e) => change("contact_number", e.target.value)} />{errors.contact_number && <small className="error-text">{errors.contact_number}</small>}</div>
                <div className="info-row"><FaGraduationCap className="info-icon" /><span className="info-label">السنة الدراسية</span><input type="number" min="1" max="10" className="edit-input" value={form.year_of_study} onChange={(e) => change("year_of_study", e.target.value)} /></div>
                <div className="info-row"><FaMapMarkerAlt className="info-icon" /><span className="info-label">العنوان</span><input className="edit-input" value={form.address} onChange={(e) => change("address", e.target.value)} /></div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
                <button type="button" className="cancel-btn" onClick={cancel} disabled={saving}>إلغاء</button>
              </div>
            </form>
          ) : (
            <div className="profile-card">
              <div className="info-list">
                {fields.map(([Icon, label, value]) => (
                  <div className="info-row" key={label}>
                    <Icon className="info-icon" style={label === "حالة الحساب" ? { color: isActive ? "#28a745" : "#dc3545" } : undefined} />
                    <span className="info-label">{label}</span>
                    <span className="info-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentProfile;
