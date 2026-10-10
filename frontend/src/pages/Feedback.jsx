import React, { useState } from "react";
import { fieldErrorsForForm } from "../api/errors";
import { publicFormsService } from "../services/publicFormsService";
import { email as validateEmail, phone as validatePhone, required, validateFields } from "../utils/validation";
import { toast } from "../ui/toast";
import "./Feedback.css";

const initialForm = { name: "", email: "", phone: "", message: "" };

function Feedback() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateFields({
      name: () => required(formData.name, "الاسم الكامل"),
      email: () => validateEmail(formData.email),
      phone: () => validatePhone(formData.phone, { optional: true }),
      message: () => required(formData.message, "الرأي أو الاقتراح"),
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.warning("يرجى التحقق من البيانات المدخلة قبل إرسال رأيك.");
      return;
    }

    setLoading(true);
    try {
      await publicFormsService.submitSuggestion({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        message: formData.message.trim(),
      });
      toast.success("تم استلام رأيك بنجاح، شكراً لمشاركتنا اقتراحك.", {
        title: "آراؤكم تهمنا",
        duration: 4500,
      });
      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      setErrors(fieldErrorsForForm(error.fieldErrors));
      toast.error(error.message || "تعذر إرسال الاقتراح. حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <span className="feedback-kicker">شاركنا رأيك</span>
        <h1 className="feedback-title">آراؤكم تهمّنا</h1>
        <p className="feedback-subtitle">نرحب بملاحظاتكم واقتراحاتكم لتطوير النادي. يمكن لأي زائر إرسال رأيه دون تسجيل الدخول.</p>

        <form className="feedback-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">الاسم الكامل</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="أدخل اسمك الكامل" aria-invalid={Boolean(errors.name)} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@domain.com" aria-invalid={Boolean(errors.email)} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">رقم الهاتف <small>(اختياري)</small></label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxxxxxx" aria-invalid={Boolean(errors.phone)} />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="message">رأيك أو اقتراحك</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="اكتب رأيك أو اقتراحك هنا..." rows="5" aria-invalid={Boolean(errors.message)} />
            {errors.message && <span className="form-error">{errors.message}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "جاري الإرسال..." : "إرسال الرأي"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;
