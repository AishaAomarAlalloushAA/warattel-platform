import { http } from "../api/http";
import { getCurrentUser } from "../auth/session";
import { isApiMode } from "../config/appConfig";
import { getMockDb, mockDelay, mockOptions, saveMockDb } from "../mock/mockDatabase";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const listData = (response) => {
  const body = response?.data ?? response ?? {};
  if (Array.isArray(body?.data)) return { items: body.data, meta: body.meta || {} };
  if (body?.data && Array.isArray(body.data.data)) return { items: body.data.data, meta: body.data };
  return { items: [], meta: {} };
};
const nextId = (items = []) => (items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1);

function supervisorId() {
  return Number(getCurrentUser()?.role_data?.supervisor_id || 1);
}

function mockStudents(db = getMockDb()) {
  const id = supervisorId();
  return db.students.filter((student) => Number(student.current_supervisor?.supervisor_id) === id);
}

function normalizeStudent(item) {
  const levels = item.levels || [];
  const current = [...levels].sort((a, b) => Number(b.id) - Number(a.id))[0];
  const levelName = current?.level?.name;
  return {
    id: item.id,
    status: item.status?.value || item.status,
    status_label: item.status?.label || item.status_label,
    person: {
      ...(item.person || {}),
      full_name: item.person?.full_name || `${item.person?.fname || ""} ${item.person?.lname || ""}`.trim(),
    },
    current_level: current ? {
      student_level_id: current.id,
      level_id: current.level?.id,
      value: levelName?.value,
      label: levelName?.label,
      plan: current.level?.plan,
      reached_at: current.reached_at,
    } : null,
  };
}

function normalizeLevelExam(item, students) {
  const studentLevel = item.student_level || item.studentLevel;
  const studentId = item.student_id ?? studentLevel?.student_id ?? studentLevel?.student?.id;
  const student = students.find((value) => Number(value.id) === Number(studentId));
  const targetRaw = item.target_level || item.targetLevel;
  const targetValue = typeof targetRaw?.name === "object" ? targetRaw.name.value : targetRaw?.name;
  const target = mockOptions.levels.find((level) => level.value === targetValue || Number(level.id) === Number(item.target_level_id));
  return {
    id: item.id,
    student_id: studentId,
    student_name: student?.person?.full_name,
    student_level_id: item.student_level_id,
    current_level: student?.current_level?.value,
    current_level_label: student?.current_level?.label,
    target_level_id: item.target_level_id,
    target_level: target?.value || targetValue,
    target_level_label: target?.label || targetValue,
    supervisor_id: item.supervisor_id,
    supervisor_name: getCurrentUser()?.full_name,
    exam_date: item.exam_date,
    makharij_score: item.makharij_score,
    ahkam_score: item.ahkam_score,
    fluency_score: item.fluency_score,
    notes: item.notes,
    decision: item.decision,
  };
}

export const supervisorService = {
  async options() {
    if (isApiMode) {
      const data = unwrap(await http.get("/supervisor/options"));
      return { ...data, exam_types: data.exam_types || mockOptions.exam_types };
    }
    await mockDelay();
    const own = mockOptions.supervisors.filter((item) => Number(item.id) === supervisorId());
    return { ...mockOptions, supervisors: own.length ? own : mockOptions.supervisors.slice(0, 1) };
  },

  async students() {
    if (isApiMode) {
      const result = listData(await http.get("/supervisor/students"));
      return { items: result.items.map(normalizeStudent), meta: result.meta };
    }
    await mockDelay();
    const items = mockStudents();
    return { items, meta: { total: items.length } };
  },

  async dashboard() {
    const [students, reports, partExams, levelExams] = await Promise.all([
      this.students(), this.reports(), this.partExams(), this.levelExams(),
    ]);
    return {
      students: students.items.length,
      reports: reports.items.length,
      part_exams: partExams.items.length,
      level_exams: levelExams.items.length,
    };
  },

  async reports(params = {}) {
    if (isApiMode) return listData(await http.get("/supervisor/reports", { params }));
    await mockDelay();
    let items = getMockDb().reports.filter((item) => Number(item.supervisor_id) === supervisorId());
    if (params.student_id) items = items.filter((item) => Number(item.student_id) === Number(params.student_id));
    return { items, meta: { total: items.length } };
  },

  async saveReport(payload) {
    if (isApiMode) {
      const body = { ...payload, supervisor_id: supervisorId() };
      return unwrap(payload.id ? await http.patch(`/supervisor/reports/${payload.id}`, body) : await http.post("/supervisor/reports", body));
    }
    await mockDelay();
    const db = getMockDb();
    const student = mockStudents(db).find((item) => Number(item.id) === Number(payload.student_id));
    if (!student) throw new Error("هذا الطالب غير معيّن لك.");
    const base = {
      student_id: Number(payload.student_id), student_name: student.person?.full_name,
      student_level_id: student.current_level?.student_level_id, level: student.current_level?.value, level_label: student.current_level?.label,
      supervisor_id: supervisorId(), supervisor_name: getCurrentUser()?.full_name,
      report_date: payload.report_date, start_page: Number(payload.start_page), quantity: Number(payload.quantity), errors: payload.errors || [],
    };
    if (payload.id) {
      const index = db.reports.findIndex((item) => Number(item.id) === Number(payload.id) && Number(item.supervisor_id) === supervisorId());
      if (index < 0) throw new Error("التقرير غير موجود أو غير مسموح لك بتعديله.");
      db.reports[index] = { ...db.reports[index], ...base }; saveMockDb(db); return db.reports[index];
    }
    const item = { id: nextId(db.reports), ...base }; db.reports.unshift(item); saveMockDb(db); return item;
  },

  async deleteReport(id) {
    if (isApiMode) return http.delete(`/supervisor/reports/${id}`).then((response) => response.data);
    await mockDelay(); const db = getMockDb();
    const found = db.reports.find((item) => Number(item.id) === Number(id) && Number(item.supervisor_id) === supervisorId());
    if (!found) throw new Error("التقرير غير موجود أو غير مسموح لك بحذفه.");
    db.reports = db.reports.filter((item) => Number(item.id) !== Number(id)); saveMockDb(db); return { message: "تم حذف التقرير." };
  },

  async partExams(params = {}) {
    if (isApiMode) return listData(await http.get("/supervisor/part-exams", { params }));
    await mockDelay();
    let items = getMockDb().partExams.filter((item) => Number(item.supervisor_id) === supervisorId());
    if (params.student_id) items = items.filter((item) => Number(item.student_id) === Number(params.student_id));
    return { items, meta: { total: items.length } };
  },

  async savePartExam(payload) {
    if (isApiMode) {
      const body = { ...payload, supervisor_id: supervisorId() };
      return unwrap(payload.id ? await http.patch(`/supervisor/part-exams/${payload.id}`, body) : await http.post("/supervisor/part-exams", body));
    }
    await mockDelay(); const db = getMockDb(); const student = mockStudents(db).find((item) => Number(item.id) === Number(payload.student_id));
    if (!student) throw new Error("هذا الطالب غير معيّن لك.");
    const type = mockOptions.exam_types.find((item) => item.value === payload.exam_type);
    const base = {
      student_id:Number(payload.student_id), student_name:student.person?.full_name, student_level_id:student.current_level?.student_level_id,
      level:student.current_level?.value, level_label:student.current_level?.label, supervisor_id:supervisorId(), supervisor_name:getCurrentUser()?.full_name,
      exam_date:payload.exam_date, part:Number(payload.part), quantity:Number(payload.quantity), exam_type:payload.exam_type, exam_type_label:type?.label,
      score:payload.score === "" ? null : Number(payload.score), result:payload.result || null, errors:payload.errors || [],
    };
    if(payload.id){ const index=db.partExams.findIndex((item)=>Number(item.id)===Number(payload.id)&&Number(item.supervisor_id)===supervisorId()); if(index<0) throw new Error("السبر غير موجود أو غير مسموح لك بتعديله."); db.partExams[index]={...db.partExams[index],...base}; saveMockDb(db); return db.partExams[index]; }
    const item={id:nextId(db.partExams),...base}; db.partExams.unshift(item); saveMockDb(db); return item;
  },

  async deletePartExam(id) {
    if (isApiMode) return http.delete(`/supervisor/part-exams/${id}`).then((response) => response.data);
    await mockDelay(); const db=getMockDb(); const found=db.partExams.find((item)=>Number(item.id)===Number(id)&&Number(item.supervisor_id)===supervisorId()); if(!found) throw new Error("السبر غير موجود أو غير مسموح لك بحذفه."); db.partExams=db.partExams.filter((item)=>Number(item.id)!==Number(id)); saveMockDb(db); return {message:"تم حذف السبر."};
  },

  async levelExams() {
    const students=(await this.students()).items;
    if(isApiMode){ const result=listData(await http.get("/supervisor/level-exams",{params:{per_page:100}})); return {items:result.items.map((item)=>normalizeLevelExam(item,students)),meta:result.meta}; }
    await mockDelay(); const items=getMockDb().levelExams.filter((item)=>Number(item.supervisor_id)===supervisorId()).map((item)=>normalizeLevelExam(item,students)); return {items,meta:{total:items.length}};
  },

  async saveLevelExam(payload) {
    const students=(await this.students()).items; const student=students.find((item)=>Number(item.id)===Number(payload.student_id));
    if(!student?.current_level?.student_level_id) throw new Error("يجب أن يكون للطالب مستوى حالي قبل إضافة السبر.");
    const body={student_level_id:student.current_level.student_level_id,target_level_id:payload.target_level_id||null,supervisor_id:supervisorId(),exam_date:payload.exam_date,makharij_score:payload.makharij_score??null,ahkam_score:payload.ahkam_score??null,fluency_score:payload.fluency_score??null,notes:payload.notes||null,decision:payload.decision||null};
    if(isApiMode) return unwrap(payload.id?await http.patch(`/supervisor/level-exams/${payload.id}`,body):await http.post("/supervisor/level-exams",body));
    await mockDelay(); const db=getMockDb(); if(payload.id){const index=db.levelExams.findIndex((item)=>Number(item.id)===Number(payload.id)&&Number(item.supervisor_id)===supervisorId()); if(index<0) throw new Error("سبر المستوى غير موجود أو غير مسموح لك بتعديله."); db.levelExams[index]={...db.levelExams[index],...body}; saveMockDb(db); return normalizeLevelExam(db.levelExams[index],students);} const item={id:nextId(db.levelExams),...body}; db.levelExams.unshift(item); saveMockDb(db); return normalizeLevelExam(item,students);
  },

  async deleteLevelExam(id) {
    if(isApiMode) return http.delete(`/supervisor/level-exams/${id}`).then((response)=>response.data);
    await mockDelay(); const db=getMockDb(); const found=db.levelExams.find((item)=>Number(item.id)===Number(id)&&Number(item.supervisor_id)===supervisorId()); if(!found) throw new Error("سبر المستوى غير موجود أو غير مسموح لك بحذفه."); db.levelExams=db.levelExams.filter((item)=>Number(item.id)!==Number(id)); saveMockDb(db); return {message:"تم حذف سبر المستوى."};
  },
};
