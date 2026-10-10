import { appConfig } from "../config/appConfig";

const MOCK_KEY = "waratel_mock_db_v2";

const initialLectures = [
  { id: 1, title: "قبل أن يهل الهلال", description: "التحضير لشهر رمضان خلال الأيام المتبقية من شهر شعبان.", display_date: "4/2/2026", type: "video", url: "https://youtu.be/q_jGe-paLcU?si=eRHDbFuiBHjoO9Lu", thumbnail: "https://img.youtube.com/vi/q_jGe-paLcU/0.jpg", registration_status: "closed", category: "للذكور فقط", is_active: true, sort_order: 1 },
  { id: 2, title: "بعد أن هل الهلال", description: "للمحافظة على العبادة بعد رمضان", display_date: "22/4/2026", type: "video", url: "https://www.youtube.com/watch?v=svA-x21r1Yg", thumbnail: "https://img.youtube.com/vi/svA-x21r1Yg/0.jpg", registration_status: "closed", category: "للذكور فقط", is_active: true, sort_order: 2 },
  { id: 3, title: "قبل العشر من ذي الحجة", description: "الاستعداد لأفضل أيام الدنيا", display_date: "18/5/2026", type: "video", url: "https://youtu.be/ntAolNp3j68?is=5VDT_USK7f-Zp5jR", thumbnail: "https://img.youtube.com/vi/ntAolNp3j68/0.jpg", registration_status: "closed", category: "للذكور فقط", is_active: true, sort_order: 3 },
  { id: 4, title: "ولادة مسلم", description: "سلسلة فيديوهات تتحدث عن الرحلة لاكتشاف المعنى والهوية وبناء حياة أقرب إلى الله.", display_date: "", type: "playlist", url: "https://youtube.com/playlist?list=PL38keZKifrmEyWdYXcDMNWlL37w-mUYP0&si=P5cKd-H5zo1zWg2W", thumbnail: "/33.jpg", registration_status: "closed", category: "للذكور فقط", is_active: true, sort_order: 4 },
  { id: 5, title: "قبل أن يهل الهلال", description: "", display_date: "5/2/2026", type: "image", url: "", thumbnail: "/A.jpg", registration_status: "closed", category: "للإناث فقط", is_active: true, sort_order: 5 },
  { id: 6, title: "فقه الصيام", description: "درس يوضح أحكام الصيام وما يتعلق به من مسائل فقهية مهمة.", display_date: "12/2/2026", type: "image", url: "", thumbnail: "/B.jpg", registration_status: "closed", category: "للإناث فقط", is_active: true, sort_order: 6 },
  { id: 7, title: "ليطمئن قلبي", description: "سلسلة جلسات تدبر لسورة النور", display_date: "كل خميس", type: "image", url: "", thumbnail: "/C.jpg", registration_status: "closed", category: "للإناث فقط", is_active: true, sort_order: 7 },
  { id: 8, title: "سلسلة جلسات كوني صحابية", description: "", display_date: "غير معلن عنها بعد", type: "image", url: "", thumbnail: "/E.png", registration_status: "soon", category: "للإناث فقط", is_active: true, sort_order: 8 },
  { id: 9, title: "مسابقة إلى الجنة زمراً", description: "مسابقة لحفظ سورة الزمر كاملة وقراءة ملف التفسير وفهمه", display_date: "24/12/2025", type: "image", url: "", thumbnail: "/F.png", registration_status: "closed", category: "للإناث والذكور", is_active: true, sort_order: 9 },
];

const levels = [
  { id: 1, value: "tilawa", label: "تلاوة", plan: "حفظ صفحة يومياً مع مراجعة السابق", description: "مرحلة ضبط التلاوة." },
  { id: 2, value: "intiqali", label: "انتقالي", plan: "خطة انتقالية حسب تقييم المشرف", description: "مرحلة الانتقال بين التلاوة والحفظ." },
  { id: 3, value: "ghaybi", label: "غيبي", plan: "حفظ ومراجعة أسبوعية", description: "مرحلة الحفظ غيباً." },
];

const supervisors = [
  { id: 1, name: "خالد أحمد", role: "supervisor", role_label: "مسمّع", gender: "male" },
  { id: 2, name: "محمد نور", role: "supervisor", role_label: "مسمّع", gender: "male" },
  { id: 3, name: "سارة محمود", role: "supervisor", role_label: "مسمّعة", gender: "female" },
  { id: 4, name: "هناء علي", role: "supervisor", role_label: "مسمّعة", gender: "female" },
];

const errorTypes = [
  { id: 1, value: "tajwidi", label: "تجويدي", score: 0 },
  { id: 2, value: "tashkili", label: "تشكيلي", score: 0 },
  { id: 3, value: "hifzi", label: "حفظي", score: 0 },
];

const studentSeeds = [
  [1, "أحمد", "محمد", "student@waratel.test", "male", 3, "0991111111", "حلب", "2025-01-15", "active", 1, 1],
  [2, "عمر", "يوسف", "omar@waratel.test", "male", 2, "0992222222", "حلب", "2024-03-20", "active", 2, 1],
  [3, "خالد", "علي", "khaled@waratel.test", "male", 4, "0993333333", "حلب", "2023-10-01", "inactive", 3, 2],
  [4, "سارة", "حسن", "sara@waratel.test", "female", 2, "0994444444", "حلب", "2025-06-10", "active", 1, 3],
  [5, "نورا", "إبراهيم", "nora@waratel.test", "female", 3, "0995555555", "حلب", "2024-11-01", "inactive", 2, 4],
  [6, "يوسف", "خالد", "yousef@waratel.test", "male", 1, "0996666666", "حلب", "2024-09-15", "active", 3, 1],
  [7, "ليلى", "محمد", "layla@waratel.test", "female", 2, "0997777777", "حلب", "2025-02-20", "active", 1, 3],
];

function makeStudents() {
  return studentSeeds.map(([id, fname, lname, email, gender, year, phone, address, joinDate, status, levelId, supervisorId]) => ({
    id,
    status,
    status_label: status === "active" ? "نشط" : status === "graduated" ? "متخرج" : "منقطع",
    person: { id, fname, lname, full_name: `${fname} ${lname}`, email, gender, gender_label: gender === "female" ? "أنثى" : "ذكر", year_of_study: year, contact_number: phone, serial_number: 1000 + id, address, join_date: joinDate },
    current_level: { student_level_id: id, level_id: levelId, value: levels.find((item) => item.id === levelId)?.value, label: levels.find((item) => item.id === levelId)?.label, plan: levels.find((item) => item.id === levelId)?.plan, reached_at: joinDate },
    current_supervisor: { student_supervisor_id: id, supervisor_id: supervisorId, name: supervisors.find((item) => item.id === supervisorId)?.name },
  }));
}

function initialDb() {
  return {
    students: makeStudents(),
    reports: [
      { id: 1, student_id: 1, student_name: "أحمد محمد", student_level_id: 1, level: "tilawa", level_label: "تلاوة", supervisor_id: 1, supervisor_name: "خالد أحمد", report_date: "2026-09-03", start_page: 1, quantity: 5, errors: [] },
      { id: 2, student_id: 1, student_name: "أحمد محمد", student_level_id: 1, level: "tilawa", level_label: "تلاوة", supervisor_id: 2, supervisor_name: "محمد نور", report_date: "2026-09-01", start_page: 5, quantity: 2, errors: [{ id: 1, error_id: 3, error_type: "hifzi", error_type_label: "حفظي", word: "آية الكرسي", details: "أخطأ في الحفظ" }] },
    ],
    partExams: [
      { id: 1, student_id: 1, student_name: "أحمد محمد", student_level_id: 1, level: "tilawa", level_label: "تلاوة", supervisor_id: 1, supervisor_name: "خالد أحمد", exam_date: "2026-09-02", part: 1, quantity: 5, exam_type: "intiqali", exam_type_label: "انتقالي", score: 85, result: "failed", result_label: "راسب", errors: [{ id: 1, error_id: 3, error_type: "hifzi", error_type_label: "حفظي", word: "آية الكرسي", details: "أخطأ في لفظ الجلالة" }] },
      { id: 2, student_id: 2, student_name: "عمر يوسف", student_level_id: 2, level: "intiqali", level_label: "انتقالي", supervisor_id: 1, supervisor_name: "خالد أحمد", exam_date: "2026-09-01", part: 10, quantity: 3, exam_type: "marhali", exam_type_label: "مرحلي", score: 95, result: "passed", result_label: "ناجح", errors: [] },
    ],
    levelExams: [
      { id: 1, student_level_id: 1, target_level_id: 2, supervisor_id: 1, exam_date: "2026-09-02", makharij_score: 100, ahkam_score: 85, fluency_score: 70, notes: "أداء ممتاز في مخارج الحروف، يحتاج إلى تحسين في المدود.", decision: "promote" },
    ],
    activities: [
      { id: 1, title: "مجلس تلاوة أسبوعي", date: "2026-09-06", gender: "للجميع", type: "مجلس", presenter: "خالد أحمد", coordinator: "إدارة النادي" },
      { id: 2, title: "مراجعة أحكام التجويد", date: "2026-09-12", gender: "للذكور", type: "دورة", presenter: "محمد نور", coordinator: "إدارة النادي" },
    ],
    achievements: [
      { id: 1, type: "memorization", type_label: "حفظ", title: "إتمام الجزء الأول", description: "إتمام حفظ ومراجعة الجزء الأول.", date: "2026-08-20" },
      { id: 2, type: "attendance", type_label: "مواظبة", title: "مواظبة شهرية", description: "حضور جميع جلسات الشهر.", date: "2026-08-31" },
    ],
    links: [
      { id: 1, title: "المصحف الإلكتروني", url: "https://quran.com", description: "قراءة القرآن ومراجعة الآيات.", level_id: null, is_active: true },
      { id: 2, title: "دروس التجويد", url: "https://www.youtube.com", description: "مواد مساندة للتجويد.", level_id: 1, is_active: true },
    ],
    lectures: initialLectures,
    suggestions: [],
    volunteerForms: [],
    educationalLinks: [],
    counters: { student: 7, report: 2, partExam: 2, levelExam: 1, suggestion: 0, volunteer: 0 },
  };
}

export function getMockDb() {
  try {
    const stored = localStorage.getItem(MOCK_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // reset below
  }
  const db = initialDb();
  saveMockDb(db);
  return db;
}

export function saveMockDb(db) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(db));
  return db;
}

export function resetMockDb() {
  const db = initialDb();
  return saveMockDb(db);
}

export async function mockDelay() {
  if (appConfig.mockLatency > 0) await new Promise((resolve) => setTimeout(resolve, appConfig.mockLatency));
}

export const mockOptions = {
  levels,
  supervisors,
  errors: errorTypes,
  level_types: levels.map(({ value, label }) => ({ value, label })),
  error_types: errorTypes.map(({ value, label }) => ({ value, label })),
  student_statuses: [
    { value: "active", label: "نشط" },
    { value: "inactive", label: "منقطع" },
    { value: "graduated", label: "متخرج" },
  ],
  genders: [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ],
  exam_types: [
    { value: "intiqali", label: "انتقالي" },
    { value: "marhali", label: "مرحلي" },
  ],
};
