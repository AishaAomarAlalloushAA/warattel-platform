import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";
import { confirmation, password as validatePassword, required } from "../utils/validation";
import { toast } from "../ui/toast";
import "./ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {
      currentPassword: required(currentPassword, "كلمة المرور الحالية"),
      newPassword: validatePassword(newPassword, { min: 8 }),
      confirmPassword: confirmation(confirmPassword, newPassword),
    };
    Object.keys(next).forEach((key) => { if (!next[key]) delete next[key]; });
    setErrors(next);
    if (Object.keys(next).length) { toast.warning("تحقق من كلمات المرور المدخلة."); return; }

    setLoading(true);
    try {
      const result = await authService.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success(result.message || "تم تغيير كلمة المرور بنجاح.");
      navigate("/student-profile");
    } catch (error) {
      setErrors((current) => ({
        ...current,
        currentPassword: error.fieldErrors?.current_password || current.currentPassword,
        newPassword: error.fieldErrors?.password || current.newPassword,
        confirmPassword: error.fieldErrors?.password_confirmation || current.confirmPassword,
      }));
      toast.error(error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <h2 className="change-password-title">تغيير كلمة المرور</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group"><label>كلمة المرور الحالية</label><input type="password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setErrors((c) => ({ ...c, currentPassword: "" })); }} autoComplete="current-password" />{errors.currentPassword && <p className="error-text">{errors.currentPassword}</p>}</div>
          <div className="form-group"><label>كلمة المرور الجديدة</label><input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setErrors((c) => ({ ...c, newPassword: "" })); }} autoComplete="new-password" />{errors.newPassword && <p className="error-text">{errors.newPassword}</p>}</div>
          <div className="form-group"><label>تأكيد كلمة المرور</label><input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((c) => ({ ...c, confirmPassword: "" })); }} autoComplete="new-password" />{errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}</div>
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ التحديث"}</button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/student-profile")} disabled={loading}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
