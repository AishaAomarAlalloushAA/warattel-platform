const fieldLabels = {
  fname: "الاسم الأول",
  lname: "الاسم الأخير",
  name: "الاسم",
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  contact_number: "رقم التواصل",
  telegram_username: "معرف تيليجرام",
  password: "كلمة المرور",
  password_confirmation: "تأكيد كلمة المرور",
  current_password: "كلمة المرور الحالية",
  gender: "الجنس",
  year_of_study: "السنة الدراسية",
  serial_number: "الرقم التسلسلي",
  address: "العنوان",
  join_date: "تاريخ الانضمام",
  status: "الحالة",
  level_id: "المستوى",
  student_id: "الطالب",
  student_level_id: "مستوى الطالب",
  supervisor_id: "المشرف",
  student_supervisor_id: "إسناد المشرف",
  report_date: "تاريخ التسميع",
  exam_date: "تاريخ السبر",
  start_page: "صفحة البداية",
  part: "جزء البداية",
  quantity: "الكمية",
  score: "الدرجة",
  result: "النتيجة",
  exam_type: "نوع السبر",
  message: "الرسالة",
  form_type: "مجال التطوع",
};

function isArabic(text = "") {
  return /[\u0600-\u06FF]/.test(String(text));
}

function fallbackValidationMessage(field) {
  const root = field.split(".")[0];
  return `يرجى التحقق من حقل ${fieldLabels[root] || "البيانات المدخلة"}.`;
}

export function normalizeApiError(error) {
  if (error?.isWaratelError) return error;

  const status = error?.response?.status ?? 0;
  const payload = error?.response?.data || {};
  const backendErrors = payload?.errors || {};
  const fieldErrors = {};

  Object.entries(backendErrors).forEach(([field, messages]) => {
    const first = Array.isArray(messages) ? messages[0] : messages;
    fieldErrors[field] = isArabic(first) ? String(first) : fallbackValidationMessage(field);
  });

  let message = payload?.message;
  if (!isArabic(message)) {
    if (!error?.response) message = "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت أو عنوان الـ API ثم أعد المحاولة.";
    else if (status === 400) message = "الطلب غير صالح. تحقق من البيانات وحاول مجدداً.";
    else if (status === 401) message = "بيانات الدخول غير صحيحة أو انتهت جلسة الدخول.";
    else if (status === 403) message = "لا تملك صلاحية تنفيذ هذا الإجراء.";
    else if (status === 404) message = "العنصر المطلوب غير موجود.";
    else if (status === 409) message = "تعذر تنفيذ العملية بسبب تعارض في البيانات.";
    else if (status === 422) message = Object.values(fieldErrors)[0] || "بعض البيانات المدخلة غير صحيحة.";
    else if (status === 429) message = "تمت المحاولة مرات كثيرة. انتظر قليلاً ثم أعد المحاولة.";
    else if (status >= 500) message = "حدث خطأ في الخادم. حاول مجدداً بعد قليل.";
    else message = "حدث خطأ غير متوقع. حاول مجدداً.";
  }

  return {
    isWaratelError: true,
    status,
    message,
    fieldErrors,
    original: error,
  };
}

export function fieldErrorsForForm(fieldErrors = {}, aliases = {}) {
  return Object.entries(fieldErrors).reduce((result, [field, message]) => {
    const direct = aliases[field] || aliases[field.split(".")[0]] || field;
    result[direct] = message;
    return result;
  }, {});
}
