import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaHandsHelping } from "react-icons/fa";
import { fieldErrorsForForm } from "../api/errors";
import { publicFormsService } from "../services/publicFormsService";
import { email as validateEmail, phone as validatePhone, positiveNumber, required, validateFields } from "../utils/validation";
import { toast } from "../ui/toast";
import "./Volunteer.css";

const initialForm = {
  name: "",
  phone: "",
  telegram: "",
  email: "",
  year: "",
  role: "",
  skills: "",
  confirm: false,
};

function Volunteer() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateStepOne = () => validateFields({
    name: () => required(formData.name, "الاسم الكامل"),
    phone: () => validatePhone(formData.phone),
    email: () => validateEmail(formData.email),
    year: () => positiveNumber(formData.year, "السنة الدراسية", { max: 10, optional: true }),
    role: () => required(formData.role, "مجال التطوع"),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (step === 1) {
      const nextErrors = validateStepOne();
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        toast.warning("يرجى التحقق من البيانات المطلوبة قبل المتابعة.");
        return;
      }
      setStep(2);
      return;
    }

    if (!formData.confirm) {
      setErrors((current) => ({ ...current, confirm: "يرجى تأكيد رغبتك في التطوع." }));
      toast.warning("يرجى تأكيد رغبتك في التطوع قبل إرسال الطلب.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      contact_number: formData.phone.trim(),
      telegram_username: formData.telegram.trim() || null,
      email: formData.email.trim(),
      year_of_study: formData.year ? Number(formData.year) : null,
      additional_skills: formData.skills.trim() || null,
      form_type: formData.role,
      form_data: { volunteer_confirmed: true },
    };

    setLoading(true);
    setErrors({});
    try {
      const result = await publicFormsService.submitVolunteer(payload);
      toast.success(result?.message || "تم استلام طلبك وهو قيد المراجعة، وسيتم التواصل معك قريباً.", {
        title: "تم إرسال طلب التطوع",
        duration: 5000,
      });
      setFormData(initialForm);
      setStep(1);
    } catch (error) {
      setErrors(fieldErrorsForForm(error.fieldErrors, {
        contact_number: "phone",
        telegram_username: "telegram",
        year_of_study: "year",
        form_type: "role",
        additional_skills: "skills",
      }));
      toast.error(error.message || "تعذر إرسال طلب التطوع. حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="volunteer-page">
      <div className="volunteer-container">
        <div className="volunteer-public-intro">
          <span className="volunteer-public-icon"><FaHandsHelping /></span>
          <div>
            <span className="volunteer-auth-kicker">التطوع في نادي ورتل</span>
            <h1>ساهم بمهارتك في خدمة كتاب الله</h1>
            <p>يمكن لأي زائر تقديم طلب تطوع مباشرة، ولا تحتاج إلى إنشاء حساب أو تسجيل الدخول.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="volunteer-form" noValidate>
          {step === 1 && (
            <div className="step step-1">
              <div className="form-group">
                <label htmlFor="name">الاسم الكامل</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="أدخل اسمك الكامل" aria-invalid={Boolean(errors.name)} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">رقم واتساب للتواصل</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxxxxxx" aria-invalid={Boolean(errors.phone)} />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="telegram">معرف تيليجرام <small>(اختياري)</small></label>
                <input id="telegram" name="telegram" value={formData.telegram} onChange={handleChange} placeholder="@username" aria-invalid={Boolean(errors.telegram)} />
                {errors.telegram && <span className="form-error">{errors.telegram}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@domain.com" aria-invalid={Boolean(errors.email)} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="year">السنة الدراسية <small>(اختياري)</small></label>
                <input type="number" min="1" max="10" id="year" name="year" value={formData.year} onChange={handleChange} aria-invalid={Boolean(errors.year)} />
                {errors.year && <span className="form-error">{errors.year}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="role">مجال التطوع</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} aria-invalid={Boolean(errors.role)}>
                  <option value="">اختر مجال التطوع</option>
                  <option value="design">تصميم</option>
                  <option value="photography">تصوير</option>
                  <option value="media">إعلام</option>
                  <option value="organization">تنظيم</option>
                </select>
                {errors.role && <span className="form-error">{errors.role}</span>}
              </div>

              <button type="submit" className="next-btn">
                <span>التالي</span><FaArrowLeft aria-hidden="true" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step step-2">
              <div className="form-group">
                <label htmlFor="skills">هل لديك مهارات إضافية تستطيع توظيفها في خدمة كتاب الله؟</label>
                <textarea id="skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="اكتب مهاراتك هنا..." rows="4" aria-invalid={Boolean(errors.skills)} />
                {errors.skills && <span className="form-error">{errors.skills}</span>}
              </div>

              <div className="form-group confirm-group">
                <label className="confirm-label">يسرّنا تأكيدك بأن مشاركتك ستكون تطوعية لخدمة القرآن، وبالقدر الذي تستطيعه بكل محبة.</label>
                <div className="checkbox-wrapper">
                  <input type="checkbox" id="confirm" name="confirm" checked={formData.confirm} onChange={handleChange} />
                  <label htmlFor="confirm">نعم بكل سرور</label>
                </div>
                {errors.confirm && <span className="form-error">{errors.confirm}</span>}
              </div>

              <div className="step-actions">
                <button type="button" className="back-btn" onClick={() => setStep(1)} disabled={loading}>
                  <FaArrowRight aria-hidden="true" /><span>السابق</span>
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "جاري إرسال الطلب..." : "إرسال طلب التطوع"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Volunteer;
