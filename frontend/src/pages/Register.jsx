import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaArrowRight, FaUserGraduate } from "react-icons/fa";
import { authService } from "../services";
import { fieldErrorsForForm } from "../api/errors";
import { confirmation, email as validateEmail, password as validatePassword, phone as validatePhone, positiveNumber, required } from "../utils/validation";
import { toast } from "../ui/toast";
import "./Register.css";

function Register() {
  const location = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [universityYear, setUniversityYear] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [residence, setResidence] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");
  const safeRedirect = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
  const loginHref = safeRedirect ? `/login?role=student&redirect=${encodeURIComponent(safeRedirect)}` : "/login?role=student";

  const clearError = (field) => setErrors((current) => ({ ...current, [field]: "" }));

  const handleRegister = async (event) => {
    event.preventDefault();
    const nextErrors = {
      firstName: required(firstName, "الاسم الأول"),
      lastName: required(lastName, "الاسم الأخير"),
      phone: validatePhone(phone),
      email: validateEmail(email),
      universityYear: positiveNumber(universityYear, "السنة الجامعية", { max: 10 }),
      residence: required(residence, "مكان الإقامة"),
      gender: required(gender, "الجنس"),
      password: validatePassword(password, { min: 8 }),
      confirmPassword: confirmation(confirmPassword, password),
      serialNumber: serialNumber ? positiveNumber(serialNumber, "الرقم التسلسلي") : "",
    };
    Object.keys(nextErrors).forEach((key) => { if (!nextErrors[key]) delete nextErrors[key]; });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.warning("تحقق من الحقول المطلوبة قبل إنشاء الحساب.");
      return;
    }

    const payload = {
      fname: firstName.trim(),
      lname: lastName.trim(),
      contact_number: phone.trim(),
      email: email.trim(),
      year_of_study: Number(universityYear),
      serial_number: serialNumber ? Number(serialNumber) : null,
      address: residence.trim(),
      gender,
      password,
      password_confirmation: confirmPassword,
    };

    setLoading(true);
    try {
      const result = await authService.register(payload);
      toast.success(result.message || "تم إنشاء حساب الطالب بنجاح.");
      window.location.href = safeRedirect || "/student-dashboard";
    } catch (error) {
      const backend = fieldErrorsForForm(error.fieldErrors, {
        fname: "firstName", lname: "lastName", contact_number: "phone", email: "email",
        year_of_study: "universityYear", serial_number: "serialNumber", address: "residence",
        gender: "gender", password: "password", password_confirmation: "confirmPassword",
      });
      setErrors((current) => ({ ...current, ...backend }));
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <a href={loginHref} className="register-back-link"><FaArrowRight /><span>العودة لتسجيل الدخول</span></a>

      <section className="register-box" aria-labelledby="register-title">
        <header className="register-header">
          <div className="register-logo-wrap"><img src="/w.png" className="register-logo" alt="نادي ورتل" /></div>
          <div className="register-role-badge"><FaUserGraduate /><span>تسجيل الطلاب</span></div>
          <h1 id="register-title">إنشاء حساب طالب جديد</h1>
          <p>أدخل بياناتك للانضمام إلى نادي ورتل ومتابعة تقدمك وأنشطتك.</p>
        </header>

        <form onSubmit={handleRegister} className="register-form" noValidate>
          <div className="register-row">
            <div className="input-group"><label>الاسم الأول</label><input type="text" placeholder="الاسم الأول" className="register-input" value={firstName} onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }} aria-invalid={Boolean(errors.firstName)} />{errors.firstName && <p className="error-text">{errors.firstName}</p>}</div>
            <div className="input-group"><label>الاسم الأخير</label><input type="text" placeholder="الاسم الأخير" className="register-input" value={lastName} onChange={(e) => { setLastName(e.target.value); clearError("lastName"); }} aria-invalid={Boolean(errors.lastName)} />{errors.lastName && <p className="error-text">{errors.lastName}</p>}</div>
          </div>

          <div className="register-row">
            <div className="input-group"><label>رقم التواصل</label><input type="tel" placeholder="مثال: +9639xxxxxxxx" className="register-input" value={phone} onChange={(e) => { setPhone(e.target.value); clearError("phone"); }} aria-invalid={Boolean(errors.phone)} />{errors.phone && <p className="error-text">{errors.phone}</p>}</div>
            <div className="input-group"><label>البريد الإلكتروني</label><input type="email" placeholder="name@example.com" className="register-input" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} aria-invalid={Boolean(errors.email)} />{errors.email && <p className="error-text">{errors.email}</p>}</div>
          </div>

          <div className="register-row">
            <div className="input-group"><label>السنة الجامعية</label><input type="number" min="1" max="10" placeholder="السنة الجامعية" className="register-input" value={universityYear} onChange={(e) => { setUniversityYear(e.target.value); clearError("universityYear"); }} aria-invalid={Boolean(errors.universityYear)} />{errors.universityYear && <p className="error-text">{errors.universityYear}</p>}</div>
            <div className="input-group"><label>الرقم التسلسلي <span className="optional-label">اختياري</span></label><input type="number" min="1" placeholder="الرقم التسلسلي" className="register-input" value={serialNumber} onChange={(e) => { setSerialNumber(e.target.value); clearError("serialNumber"); }} />{errors.serialNumber && <p className="error-text">{errors.serialNumber}</p>}</div>
          </div>

          <div className="register-row">
            <div className="input-group"><label>مكان الإقامة</label><input type="text" placeholder="مكان الإقامة" className="register-input" value={residence} onChange={(e) => { setResidence(e.target.value); clearError("residence"); }} aria-invalid={Boolean(errors.residence)} />{errors.residence && <p className="error-text">{errors.residence}</p>}</div>
            <div className="input-group"><label>الجنس</label><select className="register-input register-select" value={gender} onChange={(e) => { setGender(e.target.value); clearError("gender"); }} aria-invalid={Boolean(errors.gender)}><option value="">اختر الجنس</option><option value="male">ذكر</option><option value="female">أنثى</option></select>{errors.gender && <p className="error-text">{errors.gender}</p>}</div>
          </div>

          <div className="register-row">
            <div className="input-group"><label>كلمة المرور</label><input type="password" placeholder="8 محارف على الأقل" className="register-input" value={password} onChange={(e) => { setPassword(e.target.value); clearError("password"); }} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />{errors.password && <p className="error-text">{errors.password}</p>}</div>
            <div className="input-group"><label>تأكيد كلمة المرور</label><input type="password" placeholder="أعد كتابة كلمة المرور" className="register-input" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }} autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} />{errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}</div>
          </div>

          <button type="submit" className="register-submit" disabled={loading}>{loading ? "جاري إنشاء الحساب..." : "إنشاء حساب الطالب"}</button>
        </form>

        <div className="register-links-row"><p className="login-redirect-text">لديك حساب بالفعل؟ <a href={loginHref} className="login-redirect-link">تسجيل الدخول</a></p></div>
      </section>
    </main>
  );
}

export default Register;
