export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9]{7,20}$/,
};

export function required(value, label = "الحقل") {
  return String(value ?? "").trim() ? "" : `${label} مطلوب.`;
}

export function email(value) {
  if (!String(value ?? "").trim()) return "البريد الإلكتروني مطلوب.";
  return patterns.email.test(String(value).trim()) ? "" : "صيغة البريد الإلكتروني غير صحيحة.";
}

export function phone(value, { optional = false } = {}) {
  const normalized = String(value ?? "").trim();
  if (!normalized && optional) return "";
  if (!normalized) return "رقم التواصل مطلوب.";
  return patterns.phone.test(normalized) ? "" : "أدخل رقم تواصل صحيحاً باستخدام الأرقام الإنجليزية فقط.";
}

export function password(value, { min = 8, optional = false } = {}) {
  const text = String(value ?? "");
  if (!text && optional) return "";
  if (!text) return "كلمة المرور مطلوبة.";
  return text.length >= min ? "" : `يجب ألا تقل كلمة المرور عن ${min} محارف.`;
}

export function confirmation(value, other) {
  if (!value) return "تأكيد كلمة المرور مطلوب.";
  return value === other ? "" : "تأكيد كلمة المرور غير متطابق.";
}

export function positiveNumber(value, label = "القيمة", { max = Infinity, optional = false } = {}) {
  if ((value === "" || value == null) && optional) return "";
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1) return `${label} يجب أن تكون رقماً أكبر من صفر.`;
  if (number > max) return `${label} يجب ألا تتجاوز ${max}.`;
  return "";
}

export function validateFields(rules) {
  return Object.entries(rules).reduce((errors, [field, rule]) => {
    const message = typeof rule === "function" ? rule() : rule;
    if (message) errors[field] = message;
    return errors;
  }, {});
}

export const hasErrors = (errors) => Object.keys(errors || {}).length > 0;
