import { http } from "../api/http";
import { normalizeApiError } from "../api/errors";
import { clearSession, getCurrentUser, saveSession } from "../auth/session";
import { isApiMode } from "../config/appConfig";
import { getMockDb, mockDelay, mockOptions, saveMockDb } from "../mock/mockDatabase";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const listData = (response) => {
  const body = response?.data ?? response ?? {};
  const data = body?.data;

  if (Array.isArray(data)) {
    return { items: data, meta: body?.meta ?? {} };
  }

  // Also support Laravel's paginator shape when it is nested under `data`.
  if (data && Array.isArray(data.data)) {
    return {
      items: data.data,
      meta: {
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      },
    };
  }

  return { items: [], meta: body?.meta ?? {} };
};
const nextId = (items = []) => (items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1);

function mockError(message, status = 422, fieldErrors = {}) {
  throw { isWaratelError: true, status, message, fieldErrors };
}

function actorGender() {
  return getCurrentUser()?.person?.gender || "male";
}

function scopedMockStudents(db = getMockDb()) {
  const gender = actorGender();
  return db.students.filter((item) => !item?.person?.gender || item.person.gender === gender);
}

function scopedMockSupervisors() {
  const gender = actorGender();
  return mockOptions.supervisors.filter((item) => !item.gender || item.gender === gender);
}

function mockStudentUser(student) {
  return {
    id: student?.id || 1,
    email: student?.person?.email || "student@waratel.test",
    role: "student",
    role_label: "طالب",
    full_name: student?.person?.full_name || "طالب ورتل",
    person: student?.person || null,
    role_data: {
      student_id: student?.id || 1,
      status: student?.status || "active",
      status_label: student?.status_label || "نشط",
    },
  };
}

function mockAdminUser(email = "admin@waratel.test") {
  return {
    id: 999,
    email,
    role: "admin",
    role_label: "مشرف النظام",
    full_name: "المشرف",
    person: { id: 999, fname: "المشرف", lname: "", full_name: "المشرف", gender: "male", gender_label: "ذكر" },
    role_data: null,
  };
}

export const authService = {
  async login(payload) {
    if (isApiMode) {
      try {
        const response = await http.post("/login", payload);
        const body = response.data;
        saveSession({ token: body.token, user: body.user });
        return body;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }

    await mockDelay();
    const role = payload.role === "admin" ? "admin" : "student";
    if (!payload.email || !payload.password) mockError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
    const db = getMockDb();
    const user = role === "admin" ? mockAdminUser(payload.email) : mockStudentUser(db.students[0]);
    const token = `mock-${role}-${Date.now()}`;
    saveSession({ token, user });
    return { message: "تم تسجيل الدخول بنجاح.", token, user };
  },

  async register(payload) {
    if (isApiMode) {
      try {
        const response = await http.post("/register", payload);
        const body = response.data;
        saveSession({ token: body.token, user: body.user });
        return body;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }

    await mockDelay();
    const db = getMockDb();
    const duplicate = db.students.some((item) => item.person?.email?.toLowerCase() === payload.email?.toLowerCase());
    if (duplicate) mockError("هذا البريد الإلكتروني مسجل مسبقاً.", 422, { email: "هذا البريد الإلكتروني مسجل مسبقاً." });
    const id = nextId(db.students);
    const student = {
      id,
      status: "active",
      status_label: "نشط",
      person: {
        id,
        fname: payload.fname,
        lname: payload.lname,
        full_name: `${payload.fname} ${payload.lname}`.trim(),
        email: payload.email,
        gender: payload.gender,
        gender_label: payload.gender === "female" ? "أنثى" : "ذكر",
        year_of_study: payload.year_of_study || null,
        contact_number: payload.contact_number,
        serial_number: payload.serial_number || null,
        address: payload.address || null,
        join_date: new Date().toISOString().slice(0, 10),
      },
      current_level: null,
      current_supervisor: null,
    };
    db.students.push(student);
    saveMockDb(db);
    const user = mockStudentUser(student);
    const token = `mock-student-${Date.now()}`;
    saveSession({ token, user });
    return { message: "تم إنشاء الحساب بنجاح.", token, user };
  },

  async logout() {
    if (isApiMode) {
      try { await http.post("/logout"); } catch { /* clear locally even if the server is unavailable */ }
    } else {
      await mockDelay();
    }
    clearSession();
  },

  async me() {
    if (isApiMode) return unwrap(await http.get("/me"));
    await mockDelay();
    return getCurrentUser();
  },

  async forgotPassword(email) {
    if (isApiMode) return http.post("/forgot-password", { email }).then((r) => r.data);
    await mockDelay();
    return { message: "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني." };
  },

  async resetPassword(payload) {
    if (isApiMode) return http.post("/reset-password", payload).then((r) => r.data);
    await mockDelay();
    return { message: "تم تغيير كلمة المرور بنجاح." };
  },

  async changePassword(payload) {
    if (isApiMode) return http.put("/change-password", payload).then((r) => r.data);
    await mockDelay();
    return { message: "تم تغيير كلمة المرور بنجاح." };
  },
};

function studentFromSession(db) {
  const studentId = Number(getCurrentUser()?.role_data?.student_id || 1);
  return db.students.find((item) => Number(item.id) === studentId) || db.students[0];
}

export const studentService = {
  async dashboard() {
    if (isApiMode) return unwrap(await http.get("/student/dashboard"));
    await mockDelay();
    const db = getMockDb();
    const student = studentFromSession(db);
    return {
      student: { id: student.id, status: student.status, status_label: student.status_label, user: mockStudentUser(student) },
      current_level: student.current_level ? { student_level_id: student.current_level.student_level_id, level_id: student.current_level.level_id, name: student.current_level.value, name_label: student.current_level.label, plan: student.current_level.plan, reached_at: student.current_level.reached_at } : null,
      counts: {
        reports: db.reports.filter((item) => item.student_id === student.id).length,
        part_exams: db.partExams.filter((item) => item.student_id === student.id).length,
        level_exams: db.levelExams.filter((item) => Number(item.student_level_id) === Number(student.current_level?.student_level_id)).length,
        activities: db.activities.length,
        achievements: db.achievements.length,
      },
    };
  },

  async profile() {
    if (isApiMode) return unwrap(await http.get("/student/profile"));
    await mockDelay();
    return mockStudentUser(studentFromSession(getMockDb()));
  },

  async updateProfile(payload) {
    if (isApiMode) return unwrap(await http.patch("/me/profile", payload));
    await mockDelay();
    const db = getMockDb();
    const student = studentFromSession(db);
    const person = student.person;
    Object.assign(person, payload, {
      full_name: `${payload.fname ?? person.fname} ${payload.lname ?? person.lname}`.trim(),
      gender_label: person.gender === "female" ? "أنثى" : "ذكر",
    });
    saveMockDb(db);
    const user = mockStudentUser(student);
    const current = getCurrentUser();
    saveSession({ token: localStorage.getItem("token"), user: { ...current, ...user } });
    return user;
  },

  async level() {
    if (isApiMode) return unwrap(await http.get("/student/level"));
    await mockDelay();
    const student = studentFromSession(getMockDb());
    const current = student.current_level ? {
      student_level_id: student.current_level.student_level_id,
      level_id: student.current_level.level_id,
      name: student.current_level.value,
      name_label: student.current_level.label,
      plan: student.current_level.plan,
      reached_at: student.current_level.reached_at,
    } : null;
    return { current, history: current ? [current] : [] };
  },

  async reports() {
    if (isApiMode) return unwrap(await http.get("/student/reports"));
    await mockDelay();
    const db = getMockDb();
    const student = studentFromSession(db);
    return db.reports.filter((item) => item.student_id === student.id).map((item) => ({
      id: item.id, date: item.report_date, level: item.level, level_label: item.level_label,
      start_page: item.start_page, quantity: item.quantity,
      supervisor: { id: item.supervisor_id, name: item.supervisor_name },
      errors: item.errors.map((error) => ({ id: error.id, word: error.word, details: error.details, type: error.error_type, type_label: error.error_type_label })),
    }));
  },

  async exams() {
    if (isApiMode) return unwrap(await http.get("/student/exams"));
    await mockDelay();
    const db = getMockDb();
    const student = studentFromSession(db);
    return {
      part_exams: db.partExams.filter((item) => item.student_id === student.id).map((item) => ({
        id: item.id, date: item.exam_date, part: item.part, quantity: item.quantity,
        exam_type: item.exam_type, exam_type_label: item.exam_type_label, score: item.score, result: item.result,
        level: item.level, level_label: item.level_label, supervisor: { id: item.supervisor_id, name: item.supervisor_name },
        errors: item.errors.map((error) => ({ id: error.id, word: error.word, details: error.details, type: error.error_type, type_label: error.error_type_label })),
      })),
      level_exams: db.levelExams.filter((item) => Number(item.student_level_id) === Number(student.current_level?.student_level_id)).map((item) => ({
        id: item.id, date: item.exam_date,
        current_level: student.current_level?.value, current_level_label: student.current_level?.label,
        target_level: mockOptions.levels.find((level) => level.id === item.target_level_id)?.value,
        target_level_label: mockOptions.levels.find((level) => level.id === item.target_level_id)?.label,
        supervisor: { id: item.supervisor_id, name: mockOptions.supervisors.find((s) => s.id === item.supervisor_id)?.name },
        evaluation: { makharij: item.makharij_score, ahkam: item.ahkam_score, fluency: item.fluency_score },
        notes: item.notes, decision: item.decision,
      })),
    };
  },

  async activities() {
    if (isApiMode) return unwrap(await http.get("/student/activities"));
    await mockDelay();
    return getMockDb().activities;
  },
  async achievements() {
    if (isApiMode) return unwrap(await http.get("/student/achievements"));
    await mockDelay();
    return getMockDb().achievements;
  },
  async links() {
    if (isApiMode) return unwrap(await http.get("/student/links"));
    await mockDelay();
    return getMockDb().links.filter((item) => item.is_active);
  },
};

export const publicService = {
  async lectures() {
    if (isApiMode) return unwrap(await http.get("/lectures"));
    await mockDelay();
    return getMockDb().lectures.filter((item) => item.is_active);
  },
  async submitSuggestion(payload) {
    if (isApiMode) return unwrap(await http.post("/suggestions", payload));
    await mockDelay();
    const db = getMockDb();
    const item = { id: nextId(db.suggestions), ...payload, created_at: new Date().toISOString() };
    db.suggestions.unshift(item); saveMockDb(db); return item;
  },
  async submitVolunteer(payload) {
    if (isApiMode) return unwrap(await http.post("/volunteer-forms", payload));
    await mockDelay();
    const db = getMockDb();
    const item = { id: nextId(db.volunteerForms), ...payload, form_type: { value: payload.form_type, label: ({ design: "تصميم", photography: "تصوير", media: "إعلام", organization: "تنظيم" })[payload.form_type] || payload.form_type }, status: { value: "pending", label: "قيد المراجعة" }, created_at: new Date().toISOString() };
    db.volunteerForms.unshift(item); saveMockDb(db); return item;
  },
};

function normalizeAdminLevelExam(item, students) {
  const studentLevel = item.student_level || item.studentLevel;
  const studentId = item.student_id ?? studentLevel?.student_id ?? studentLevel?.student?.id;
  const student = students?.find((s) => Number(s.id) === Number(studentId));
  const currentLevelRaw = studentLevel?.level?.name;
  const currentLevelValue = typeof currentLevelRaw === "object" ? currentLevelRaw.value : currentLevelRaw;
  const currentLevel = mockOptions.levels.find((level) => level.value === currentLevelValue);
  const targetRaw = item.target_level || item.targetLevel;
  const targetValueRaw = targetRaw?.name;
  const targetValue = typeof targetValueRaw === "object" ? targetValueRaw.value : targetValueRaw;
  const target = mockOptions.levels.find((level) => level.value === targetValue);
  const supervisorPerson = item.supervisor?.person;
  const relatedPerson = studentLevel?.student?.person;
  return {
    id: item.id,
    student_id: studentId,
    student_name: student?.person?.full_name || (relatedPerson ? `${relatedPerson.fname || ""} ${relatedPerson.lname || ""}`.trim() : null),
    student_level_id: item.student_level_id,
    current_level: currentLevelValue || student?.current_level?.value,
    current_level_label: currentLevel?.label || currentLevelValue || student?.current_level?.label,
    target_level_id: item.target_level_id,
    target_level: targetValue,
    target_level_label: target?.label || targetValue,
    supervisor_id: item.supervisor_id,
    supervisor_name: supervisorPerson ? `${supervisorPerson.fname} ${supervisorPerson.lname}`.trim() : item.supervisor_name,
    exam_date: item.exam_date,
    makharij_score: item.makharij_score,
    ahkam_score: item.ahkam_score,
    fluency_score: item.fluency_score,
    notes: item.notes,
    decision: item.decision,
  };
}

export const adminService = {
  async dashboard() {
    if (isApiMode) return unwrap(await http.get("/admin/dashboard"));
    await mockDelay();
    const db = getMockDb();
    const students = scopedMockStudents(db);
    const allowedIds = new Set(students.map((item) => Number(item.id)));
    const reports = db.reports.filter((item) => allowedIds.has(Number(item.student_id)));
    const partExams = db.partExams.filter((item) => allowedIds.has(Number(item.student_id)));
    const allowedLevelIds = new Set(students.map((item) => Number(item.current_level?.student_level_id)).filter(Boolean));
    const levelExams = db.levelExams.filter((item) => allowedLevelIds.has(Number(item.student_level_id)));
    const active = students.filter((item) => item.status === "active").length;
    return {
      students: { total: students.length, active, inactive: students.filter((i) => i.status === "inactive").length, graduated: students.filter((i) => i.status === "graduated").length, new_this_month: 0 },
      reports: { total: reports.length, this_month: reports.length },
      exams: { total: partExams.length + levelExams.length, part_exams: partExams.length, level_exams: levelExams.length, this_month: partExams.length + levelExams.length },
      activities: { total: db.activities.length, today: 0, this_week: db.activities.length, this_month: db.activities.length },
      volunteer_requests: { total: db.volunteerForms.length, pending: db.volunteerForms.filter((item) => (item.status?.value || item.status) === "pending").length },
      suggestions: { total: db.suggestions.length, this_month: db.suggestions.length },
    };
  },

  async options() {
    if (isApiMode) {
      const data = unwrap(await http.get("/admin/options"));
      return { ...data, exam_types: data.exam_types || mockOptions.exam_types };
    }
    await mockDelay();
    return { ...mockOptions, supervisors: scopedMockSupervisors() };
  },

  async students(params = {}) {
    if (isApiMode) return listData(await http.get("/admin/students", { params }));
    await mockDelay();
    let items = [...scopedMockStudents()];
    if (params.search) {
      const q = String(params.search).toLowerCase();
      items = items.filter((item) => `${item.person.full_name} ${item.person.email} ${item.person.contact_number}`.toLowerCase().includes(q));
    }
    if (params.status) items = items.filter((item) => item.status === params.status);
    if (params.level) items = items.filter((item) => item.current_level?.value === params.level);
    return { items, meta: { current_page: 1, last_page: 1, per_page: items.length, total: items.length } };
  },

  async createStudent(payload) {
    if (isApiMode) return unwrap(await http.post("/admin/students", payload));
    await mockDelay();
    const db = getMockDb();
    const gender = actorGender();
    if (payload.gender && payload.gender !== gender) mockError("لا يمكنك إضافة طالب من الجنس الآخر.", 422, { gender: "لا يمكنك إضافة طالب من الجنس الآخر." });
    if (db.students.some((s) => s.person.email?.toLowerCase() === payload.email?.toLowerCase())) mockError("هذا البريد الإلكتروني مستخدم مسبقاً.", 422, { email: "هذا البريد الإلكتروني مستخدم مسبقاً." });
    const id = nextId(db.students);
    const level = mockOptions.levels.find((item) => item.id === Number(payload.level_id));
    const supervisor = scopedMockSupervisors().find((item) => item.id === Number(payload.supervisor_id));
    if (payload.supervisor_id && !supervisor) mockError("يجب أن يكون المشرف من نفس الجنس.", 422, { supervisor_id: "يجب أن يكون المشرف من نفس الجنس." });
    const item = {
      id, status: payload.status || "active", status_label: payload.status === "graduated" ? "متخرج" : payload.status === "inactive" ? "منقطع" : "نشط",
      person: { id, fname: payload.fname, lname: payload.lname, full_name: `${payload.fname} ${payload.lname}`.trim(), email: payload.email, gender, gender_label: gender === "female" ? "أنثى" : "ذكر", year_of_study: payload.year_of_study || null, contact_number: payload.contact_number, serial_number: payload.serial_number || null, address: payload.address || null, join_date: payload.join_date || new Date().toISOString().slice(0, 10) },
      current_level: level ? { student_level_id: id, level_id: level.id, value: level.value, label: level.label, plan: level.plan, reached_at: payload.reached_at || new Date().toISOString().slice(0, 10) } : null,
      current_supervisor: supervisor ? { student_supervisor_id: id, supervisor_id: supervisor.id, name: supervisor.name } : null,
    };
    db.students.unshift(item); saveMockDb(db); return item;
  },

  async updateStudent(id, payload) {
    if (isApiMode) return unwrap(await http.patch(`/admin/students/${id}`, payload));
    await mockDelay();
    const db = getMockDb(); const student = scopedMockStudents(db).find((item) => Number(item.id) === Number(id));
    if (!student) mockError("الطالب المطلوب غير موجود.", 404);
    if (payload.gender && payload.gender !== actorGender()) mockError("لا يمكنك نقل الطالب إلى قسم الجنس الآخر.", 422, { gender: "لا يمكنك نقل الطالب إلى قسم الجنس الآخر." });
    const p = student.person;
    ["fname", "lname", "year_of_study", "contact_number", "serial_number", "address", "join_date"].forEach((key) => { if (key in payload) p[key] = payload[key]; });
    if (payload.email !== undefined) p.email = payload.email;
    p.full_name = `${p.fname} ${p.lname}`.trim();
    if (payload.status) { student.status = payload.status; student.status_label = payload.status === "active" ? "نشط" : payload.status === "graduated" ? "متخرج" : "منقطع"; }
    if (payload.level_id) { const level = mockOptions.levels.find((l) => l.id === Number(payload.level_id)); if (level) student.current_level = { student_level_id: student.current_level?.student_level_id || student.id, level_id: level.id, value: level.value, label: level.label, plan: level.plan, reached_at: payload.reached_at || new Date().toISOString().slice(0, 10) }; }
    if (payload.supervisor_id !== undefined) { const supervisor = scopedMockSupervisors().find((s) => s.id === Number(payload.supervisor_id)); if (payload.supervisor_id && !supervisor) mockError("يجب أن يكون المشرف من نفس الجنس.", 422, { supervisor_id: "يجب أن يكون المشرف من نفس الجنس." }); student.current_supervisor = supervisor ? { student_supervisor_id: student.current_supervisor?.student_supervisor_id || student.id, supervisor_id: supervisor.id, name: supervisor.name } : null; }
    saveMockDb(db); return student;
  },

  async reports(params = {}) {
    if (isApiMode) return listData(await http.get("/admin/reports", { params }));
    await mockDelay();
    const db = getMockDb();
    const allowedIds = new Set(scopedMockStudents(db).map((item) => Number(item.id)));
    const items = db.reports.filter((item) => allowedIds.has(Number(item.student_id)));
    return { items, meta: { total: items.length } };
  },
  async saveReport(payload) {
    if (isApiMode) return unwrap(payload.id ? await http.patch(`/admin/reports/${payload.id}`, payload) : await http.post("/admin/reports", payload));
    await mockDelay(); const db = getMockDb(); const student = scopedMockStudents(db).find((s) => s.id === Number(payload.student_id)); const supervisor = scopedMockSupervisors().find((s) => s.id === Number(payload.supervisor_id));
    if (!student) mockError("لا يمكنك الوصول إلى طالب من الجنس الآخر.", 403);
    if (!supervisor) mockError("يجب أن يكون المشرف من نفس الجنس.", 422, { supervisor_id: "يجب أن يكون المشرف من نفس الجنس." });
    const base = { student_id: Number(payload.student_id), student_name: student?.person?.full_name, student_level_id: student?.current_level?.student_level_id, level: student?.current_level?.value, level_label: student?.current_level?.label, supervisor_id: Number(payload.supervisor_id), supervisor_name: supervisor?.name, report_date: payload.report_date, start_page: Number(payload.start_page), quantity: Number(payload.quantity), errors: payload.errors || [] };
    if (payload.id) { const i = db.reports.findIndex((r) => r.id === Number(payload.id)); if (i < 0) mockError("التقرير غير موجود.", 404); db.reports[i] = { ...db.reports[i], ...base }; saveMockDb(db); return db.reports[i]; }
    const item = { id: nextId(db.reports), ...base }; db.reports.unshift(item); saveMockDb(db); return item;
  },
  async deleteReport(id) { if (isApiMode) return http.delete(`/admin/reports/${id}`).then((r) => r.data); await mockDelay(); const db = getMockDb(); const allowedIds = new Set(scopedMockStudents(db).map((item) => Number(item.id))); const report = db.reports.find((r) => r.id === Number(id)); if (!report || !allowedIds.has(Number(report.student_id))) mockError("التقرير غير موجود أو غير مسموح الوصول إليه.", 404); db.reports = db.reports.filter((r) => r.id !== Number(id)); saveMockDb(db); return { message: "تم حذف تقرير التسميع بنجاح." }; },

  async partExams(params = {}) { if (isApiMode) return listData(await http.get("/admin/part-exams", { params })); await mockDelay(); const db = getMockDb(); const allowedIds = new Set(scopedMockStudents(db).map((item) => Number(item.id))); const items = db.partExams.filter((item) => allowedIds.has(Number(item.student_id))); return { items, meta: { total: items.length } }; },
  async savePartExam(payload) {
    if (isApiMode) return unwrap(payload.id ? await http.patch(`/admin/part-exams/${payload.id}`, payload) : await http.post("/admin/part-exams", payload));
    await mockDelay(); const db = getMockDb(); const student = scopedMockStudents(db).find((s) => s.id === Number(payload.student_id)); const supervisor = scopedMockSupervisors().find((s) => s.id === Number(payload.supervisor_id)); const type = mockOptions.exam_types.find((t) => t.value === payload.exam_type);
    if (!student) mockError("لا يمكنك الوصول إلى طالب من الجنس الآخر.", 403);
    if (!supervisor) mockError("يجب أن يكون المشرف من نفس الجنس.", 422, { supervisor_id: "يجب أن يكون المشرف من نفس الجنس." });
    const base = { student_id: Number(payload.student_id), student_name: student?.person?.full_name, student_level_id: student?.current_level?.student_level_id, level: student?.current_level?.value, level_label: student?.current_level?.label, supervisor_id: Number(payload.supervisor_id), supervisor_name: supervisor?.name, exam_date: payload.exam_date, part: Number(payload.part), quantity: Number(payload.quantity), exam_type: payload.exam_type, exam_type_label: type?.label, score: payload.score == null ? null : Number(payload.score), result: payload.result || null, result_label: payload.result === "passed" ? "ناجح" : payload.result === "failed" ? "راسب" : null, errors: payload.errors || [] };
    if (payload.id) { const i = db.partExams.findIndex((e) => e.id === Number(payload.id)); if (i < 0) mockError("السبر غير موجود.", 404); db.partExams[i] = { ...db.partExams[i], ...base }; saveMockDb(db); return db.partExams[i]; }
    const item = { id: nextId(db.partExams), ...base }; db.partExams.unshift(item); saveMockDb(db); return item;
  },
  async deletePartExam(id) { if (isApiMode) return http.delete(`/admin/part-exams/${id}`).then((r) => r.data); await mockDelay(); const db = getMockDb(); const allowedIds = new Set(scopedMockStudents(db).map((item) => Number(item.id))); const exam = db.partExams.find((e) => e.id === Number(id)); if (!exam || !allowedIds.has(Number(exam.student_id))) mockError("السبر غير موجود أو غير مسموح الوصول إليه.", 404); db.partExams = db.partExams.filter((e) => e.id !== Number(id)); saveMockDb(db); return { message: "تم حذف السبر بنجاح." }; },

  async levelExams() {
    if (isApiMode) {
      const students = (await this.students({ per_page: 100 })).items;
      const result = listData(await http.get("/admin/level-exams", { params: { per_page: 100 } }));
      return { items: result.items.map((item) => normalizeAdminLevelExam(item, students)), meta: result.meta };
    }
    await mockDelay();
    const db = getMockDb();
    const students = scopedMockStudents(db);
    const allowedLevelIds = new Set(students.map((student) => Number(student.current_level?.student_level_id)).filter(Boolean));
    const items = db.levelExams.filter((item) => allowedLevelIds.has(Number(item.student_level_id))).map((item) => normalizeAdminLevelExam(item, students));
    return { items, meta: { total: items.length } };
  },
  async saveLevelExam(payload) {
    const students = (await this.students({ per_page: 100 })).items;
    const student = students.find((s) => Number(s.id) === Number(payload.student_id));
    const supervisor = scopedMockSupervisors().find((s) => Number(s.id) === Number(payload.supervisor_id));
    if (!student) mockError("لا يمكنك الوصول إلى طالب من الجنس الآخر.", 403);
    if (!supervisor && !isApiMode) mockError("يجب أن يكون المشرف من نفس الجنس.", 422, { supervisor_id: "يجب أن يكون المشرف من نفس الجنس." });
    const apiPayload = { student_level_id: student?.current_level?.student_level_id, target_level_id: payload.target_level_id || null, supervisor_id: Number(payload.supervisor_id), exam_date: payload.exam_date, makharij_score: payload.makharij_score ?? null, ahkam_score: payload.ahkam_score ?? null, fluency_score: payload.fluency_score ?? null, notes: payload.notes || null, decision: payload.decision || null };
    if (!apiPayload.student_level_id) mockError("يجب أن يكون للطالب مستوى حالي قبل إضافة سبر مستوى.", 422, { student_id: "يجب أن يكون للطالب مستوى حالي." });
    if (isApiMode) return unwrap(payload.id ? await http.patch(`/admin/level-exams/${payload.id}`, apiPayload) : await http.post("/admin/level-exams", apiPayload));
    await mockDelay(); const db = getMockDb(); const base = { ...apiPayload }; if (payload.id) { const i = db.levelExams.findIndex((e) => e.id === Number(payload.id)); if (i < 0) mockError("سبر المستوى غير موجود.", 404); db.levelExams[i] = { ...db.levelExams[i], ...base }; saveMockDb(db); return normalizeAdminLevelExam(db.levelExams[i], db.students); } const item = { id: nextId(db.levelExams), ...base }; db.levelExams.unshift(item); saveMockDb(db); return normalizeAdminLevelExam(item, db.students);
  },
  async deleteLevelExam(id) { if (isApiMode) return http.delete(`/admin/level-exams/${id}`).then((r) => r.data); await mockDelay(); const db = getMockDb(); const students = scopedMockStudents(db); const allowedLevelIds = new Set(students.map((student) => Number(student.current_level?.student_level_id)).filter(Boolean)); const exam = db.levelExams.find((e) => e.id === Number(id)); if (!exam || !allowedLevelIds.has(Number(exam.student_level_id))) mockError("سبر المستوى غير موجود أو غير مسموح الوصول إليه.", 404); db.levelExams = db.levelExams.filter((e) => e.id !== Number(id)); saveMockDb(db); return { message: "تم حذف سبر المستوى بنجاح." }; },

  async volunteerForms() { if (isApiMode) return listData(await http.get("/volunteer-forms")); await mockDelay(); const db = getMockDb(); return { items: db.volunteerForms, meta: { total: db.volunteerForms.length } }; },
  async updateVolunteer(id, payload) { if (isApiMode) return unwrap(await http.patch(`/volunteer-forms/${id}`, payload)); await mockDelay(); const db = getMockDb(); const item = db.volunteerForms.find((v) => v.id === Number(id)); if (!item) mockError("طلب التطوع غير موجود.", 404); if (payload.status) item.status = { value: payload.status, label: payload.status === "accepted" ? "مقبول" : payload.status === "rejected" ? "مرفوض" : "قيد المراجعة" }; if (payload.admin_response !== undefined) item.admin_response = payload.admin_response; saveMockDb(db); return item; },
  async suggestions() { if (isApiMode) return listData(await http.get("/suggestions")); await mockDelay(); const db = getMockDb(); return { items: db.suggestions, meta: { total: db.suggestions.length } }; },
  async deleteSuggestion(id) { if (isApiMode) return http.delete(`/suggestions/${id}`).then((r) => r.data); await mockDelay(); const db = getMockDb(); db.suggestions = db.suggestions.filter((s) => s.id !== Number(id)); saveMockDb(db); return { message: "تم حذف الاقتراح." }; },

  async lectures() { if (isApiMode) return listData(await http.get("/admin/lectures", { params: { per_page: 100 } })); await mockDelay(); const db = getMockDb(); return { items: db.lectures, meta: { total: db.lectures.length } }; },
  async saveLecture(payload) { if (isApiMode) return unwrap(payload.id ? await http.patch(`/admin/lectures/${payload.id}`, payload) : await http.post("/admin/lectures", payload)); await mockDelay(); const db = getMockDb(); if (payload.id) { const i = db.lectures.findIndex((l) => l.id === Number(payload.id)); db.lectures[i] = { ...db.lectures[i], ...payload }; saveMockDb(db); return db.lectures[i]; } const item = { id: nextId(db.lectures), is_active: true, sort_order: db.lectures.length + 1, registration_status: "soon", ...payload }; db.lectures.push(item); saveMockDb(db); return item; },
  async deleteLecture(id) { if (isApiMode) return http.delete(`/admin/lectures/${id}`).then((r) => r.data); await mockDelay(); const db = getMockDb(); db.lectures = db.lectures.filter((l) => l.id !== Number(id)); saveMockDb(db); return { message: "تم حذف المحاضرة." }; },
};
