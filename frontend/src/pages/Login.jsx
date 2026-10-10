import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaArrowRight, FaShieldAlt, FaUserGraduate, FaUserTie } from "react-icons/fa";
import { roleAuthService } from "../services/roleAuthService";
import { email as validateEmail, required } from "../utils/validation";
import { fieldErrorsForForm } from "../api/errors";
import { toast } from "../ui/toast";
import "./Login.css";

function Login() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = new URLSearchParams(location.search).get("role");
    if (["admin", "supervisor", "student"].includes(roleParam)) setRole(roleParam);
  }, [location.search]);

  const isAdmin = role === "admin";
  const isSupervisor = role === "supervisor";
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirect = params.get("redirect");
  const safeRedirect = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
  const registerHref = safeRedirect ? `/register?redirect=${encodeURIComponent(safeRedirect)}` : "/register";

  const roleInfo = isAdmin
    ? { title: "تسجيل دخول الإدارة", badge: "حساب إدارة", note: "الدخول مخصص لإدارة النظام", button: "الدخول إلى لوحة الإدارة", Icon: FaShieldAlt }
    : isSupervisor
      ? { title: "تسجيل دخول المشرف", badge: "حساب مشرف", note: "حساب المشرف يعرض فقط الطلاب المعيّنين له", button: "الدخول إلى لوحة المشرف", Icon: FaUserTie }
      : { title: "تسجيل دخول الطالب", badge: "حساب طالب", note: "حساب الطالب يتيح متابعة التقدم داخل النادي", button: "الدخول إلى لوحة الطالب", Icon: FaUserGraduate };

  const handleLogin = async (event) => {
    event.preventDefault();
    const nextErrors = { email: validateEmail(email), password: required(password, "كلمة المرور") };
    Object.keys(nextErrors).forEach((key) => { if (!nextErrors[key]) delete nextErrors[key]; });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { toast.warning("تحقق من بيانات تسجيل الدخول ثم أعد المحاولة."); return; }

    setLoading(true);
    try {
      const result = await roleAuthService.login({ email: email.trim(), password, role });
      toast.success(result.message || "تم تسجيل الدخول بنجاح.");
      const defaultTarget = role === "admin" ? "/admin-dashboard" : role === "supervisor" ? "/supervisor-dashboard" : "/student-dashboard";
      const allowedRedirect = safeRedirect && (
        role === "admin" ? safeRedirect.startsWith("/admin-") :
        role === "supervisor" ? safeRedirect.startsWith("/supervisor-") :
        !safeRedirect.startsWith("/admin-") && !safeRedirect.startsWith("/supervisor-")
      );
      window.location.href = allowedRedirect ? safeRedirect : defaultTarget;
    } catch (error) {
      const formErrors = fieldErrorsForForm(error.fieldErrors, { email: "email", password: "password" });
      setErrors((current) => ({ ...current, ...formErrors }));
      toast.error(error.message);
    } finally { setLoading(false); }
  };

  const RoleIcon = roleInfo.Icon;

  return (
    <main className={`login-page ${isAdmin ? "login-page--admin" : "login-page--student"}`}>
      <a href="/" className="auth-home-link" aria-label="العودة إلى الرئيسية"><FaArrowRight /><span>الرئيسية</span></a>
      <div className="login-shell">
        <aside className="login-brand-panel" aria-label="نادي ورتل">
          <div className="login-brand-logo-wrap"><img src="/w.png" className="login-brand-logo" alt="نادي ورتل" /></div>
          <span className="login-brand-kicker">نادي ورتل</span>
          <h1>{isAdmin ? "مساحة إدارة واضحة وآمنة" : isSupervisor ? "مساحة إشراف محددة وواضحة" : "مرحباً بعودتك إلى رحلتك مع القرآن"}</h1>
          <p>{isAdmin ? "إدارة الطلاب والمشرفين والمحتوى والطلبات من مكان واحد." : isSupervisor ? "تابع طلابك المعيّنين لك وسجّل تقارير التسميع والسبر دون صلاحيات الإدارة." : "تابع مستواك، أنشطتك ومحاضرات النادي ضمن تجربة بسيطة ومريحة."}</p>
          <div className="login-brand-note"><RoleIcon /><span>{roleInfo.note}</span></div>
        </aside>

        <section className="login-box" aria-labelledby="login-title">
          <div className={`login-role-badge ${isAdmin ? "admin" : "student"}`}><RoleIcon /><span>{roleInfo.badge}</span></div>
          <div className="login-heading"><h2 id="login-title">{roleInfo.title}</h2><p>أدخل البريد الإلكتروني وكلمة المرور المرتبطين بحسابك.</p></div>
          <form className="login-form" onSubmit={handleLogin} noValidate>
            <label className="login-field"><span>البريد الإلكتروني</span><input type="email" placeholder="name@example.com" className="login-input" value={email} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: "" })); }} autoComplete="email" aria-invalid={Boolean(errors.email)} /></label>
            {errors.email && <p className="error-text">{errors.email}</p>}
            <label className="login-field"><span>كلمة المرور</span><input type="password" placeholder="أدخل كلمة المرور" className="login-input" value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: "" })); }} autoComplete="current-password" aria-invalid={Boolean(errors.password)} /></label>
            {errors.password && <p className="error-text">{errors.password}</p>}
            <a href={`/forgot-password?role=${role}`} className="forgot-link">نسيت كلمة المرور؟</a>
            <button className="login-submit" type="submit" disabled={loading}>{loading ? "جاري تسجيل الدخول..." : roleInfo.button}</button>
          </form>

          {role === "student" ? (
            <div className="login-signup-card"><span>ليس لديك حساب؟</span><a href={registerHref} className="signup-link">إنشاء حساب طالب</a></div>
          ) : (
            <p className="admin-account-note">هذا النوع من الحسابات يُنشأ من إدارة النظام ولا يتوفر له تسجيل ذاتي.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default Login;
