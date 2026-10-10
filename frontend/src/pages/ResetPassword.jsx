import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import { authService } from "../services";
import { confirmation, password as validatePassword } from "../utils/validation";
import { toast } from "../ui/toast";
import "./ForgotPassword.css";

function ResetPassword() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const next = {
      password: validatePassword(password, { min: 8 }),
      confirmPassword: confirmation(confirmPassword, password),
    };
    Object.keys(next).forEach((key) => { if (!next[key]) delete next[key]; });
    if (!token || !email) next.general = "رابط استعادة كلمة المرور غير صالح أو ناقص.";
    setErrors(next);
    if (Object.keys(next).length) { toast.warning(next.general || "تحقق من كلمة المرور وتأكيدها."); return; }

    setLoading(true);
    try {
      const result = await authService.resetPassword({ token, email, password, password_confirmation: confirmPassword });
      toast.success(result.message || "تم تغيير كلمة المرور بنجاح.");
      window.setTimeout(() => { window.location.href = "/login?role=student"; }, 900);
    } catch (error) {
      setErrors((current) => ({ ...current, password: error.fieldErrors?.password || current.password, general: error.message }));
      toast.error(error.message);
    } finally { setLoading(false); }
  };

  return (
    <main className="forgot-page forgot-page--student">
      <section className="forgot-box" aria-labelledby="reset-title">
        <div className="forgot-logo-wrap"><img src="/w.png" className="forgot-logo" alt="نادي ورتل" /></div>
        <div className="forgot-role-badge student"><FaKey /><span>إعادة تعيين كلمة المرور</span></div>
        <h1 id="reset-title">اختر كلمة مرور جديدة</h1>
        <p className="forgot-text">استخدم كلمة مرور لا تقل عن 8 محارف ولا تشاركها مع أي شخص.</p>
        {errors.general && <p className="error-text">{errors.general}</p>}
        <form className="forgot-form" onSubmit={submit} noValidate>
          <label className="forgot-field"><span>كلمة المرور الجديدة</span><input type="password" className="forgot-input" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((c) => ({ ...c, password: "", general: "" })); }} autoComplete="new-password" /></label>
          {errors.password && <p className="error-text">{errors.password}</p>}
          <label className="forgot-field"><span>تأكيد كلمة المرور</span><input type="password" className="forgot-input" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((c) => ({ ...c, confirmPassword: "", general: "" })); }} autoComplete="new-password" /></label>
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          <button className="send-reset" type="submit" disabled={loading || !token || !email}>{loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}</button>
        </form>
      </section>
    </main>
  );
}

export default ResetPassword;
