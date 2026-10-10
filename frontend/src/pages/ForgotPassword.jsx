import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaArrowRight, FaShieldAlt, FaUserGraduate } from "react-icons/fa";
import { authService } from "../services";
import { email as validateEmail } from "../utils/validation";
import { toast } from "../ui/toast";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const location = useLocation();

  const role = useMemo(() => new URLSearchParams(location.search).get("role") === "admin" ? "admin" : "student", [location.search]);
  const isAdmin = role === "admin";

  const handleSend = async (event) => {
    event.preventDefault();
    const message = validateEmail(email);
    setError(message);
    if (message) { toast.warning(message); return; }

    setLoading(true);
    try {
      const result = await authService.forgotPassword(email.trim());
      setSent(true);
      toast.success(result.message || "تم إرسال رابط إعادة تعيين كلمة المرور.");
    } catch (apiError) {
      setError(apiError.fieldErrors?.email || "");
      toast.error(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`forgot-page ${isAdmin ? "forgot-page--admin" : "forgot-page--student"}`}>
      <a href={`/login?role=${role}`} className="forgot-back-link"><FaArrowRight /><span>العودة لتسجيل الدخول</span></a>
      <section className="forgot-box" aria-labelledby="forgot-title">
        <div className="forgot-logo-wrap"><img src="/w.png" className="forgot-logo" alt="نادي ورتل" /></div>
        <div className={`forgot-role-badge ${isAdmin ? "admin" : "student"}`}>{isAdmin ? <FaShieldAlt /> : <FaUserGraduate />}<span>{isAdmin ? "حساب مشرف" : "حساب طالب"}</span></div>
        <h1 id="forgot-title">استعادة كلمة المرور</h1>
        <p className="forgot-text">أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل لك رابط إعادة تعيين كلمة المرور.</p>

        <form className="forgot-form" onSubmit={handleSend} noValidate>
          <label className="forgot-field"><span>البريد الإلكتروني</span><input type="email" placeholder="name@example.com" className="forgot-input" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); setSent(false); }} autoComplete="email" aria-invalid={Boolean(error)} /></label>
          {error && <p className="error-text">{error}</p>}
          {sent && <p className="forgot-help-text">إذا كان البريد مسجلاً، سيصلك رابط الاستعادة. تحقق أيضاً من مجلد الرسائل غير المرغوب فيها.</p>}
          <button className="send-reset" type="submit" disabled={loading}>{loading ? "جاري الإرسال..." : sent ? "إعادة إرسال الرابط" : "إرسال رابط إعادة التعيين"}</button>
        </form>

        <p className="forgot-help-text">{isAdmin ? "إذا لم تعد تملك صلاحية الوصول إلى بريد حساب المشرف، تواصل مع إدارة النادي." : "حافظ على رابط الاستعادة خاصاً بك ولا تشاركه مع أي شخص."}</p>
      </section>
    </main>
  );
}

export default ForgotPassword;
