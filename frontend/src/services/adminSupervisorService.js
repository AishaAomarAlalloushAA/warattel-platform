import { http } from "../api/http";
import { normalizeApiError } from "../api/errors";
import { getCurrentUser } from "../auth/session";
import { isApiMode } from "../config/appConfig";
import { mockDelay, mockOptions } from "../mock/mockDatabase";

const MOCK_KEY = "waratel_mock_admin_accounts_v1";

function syncAssignableSupervisors(accounts) {
  accounts.forEach((account) => {
    if (!account.supervisor_id) return;
    const existing = mockOptions.supervisors.find((item) => Number(item.id) === Number(account.supervisor_id));
    if (existing) return;
    mockOptions.supervisors.push({
      id: Number(account.supervisor_id),
      name: account.full_name,
      role: "mushrif",
      role_label: account.gender === "female" ? "مشرفة" : "مشرف",
      gender: account.gender,
    });
  });
}

function getMockAccounts() {
  const current = getCurrentUser();
  try {
    const stored = JSON.parse(localStorage.getItem(MOCK_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) {
      syncAssignableSupervisors(stored);
      return stored;
    }
  } catch {
    // Seed below.
  }

  const seed = current
    ? [{
        id: Number(current.id) || 1,
        supervisor_id: null,
        email: current.email || "admin@waratel.test",
        full_name: current.full_name || "المشرف",
        gender: current.person?.gender || "male",
        gender_label: current.person?.gender === "female" ? "أنثى" : "ذكر",
        contact_number: current.person?.contact_number || "",
        join_date: current.person?.join_date || new Date().toISOString().slice(0, 10),
        address: current.person?.address || "",
      }]
    : [];
  localStorage.setItem(MOCK_KEY, JSON.stringify(seed));
  return seed;
}

function saveMockAccounts(items) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(items));
  syncAssignableSupervisors(items);
}

export const adminSupervisorService = {
  async list(params = {}) {
    if (isApiMode) {
      try {
        const response = await http.get("/admin/supervisor-accounts", { params });
        return {
          items: response.data?.data || [],
          meta: response.data?.meta || {},
        };
      } catch (error) {
        throw normalizeApiError(error);
      }
    }

    await mockDelay();
    const current = getCurrentUser();
    const gender = current?.person?.gender || "male";
    const search = String(params.search || "").trim().toLowerCase();
    let items = getMockAccounts().filter((item) => item.gender === gender);
    if (search) {
      items = items.filter((item) => `${item.full_name} ${item.email} ${item.contact_number}`.toLowerCase().includes(search));
    }
    return { items, meta: { total: items.length, current_page: 1, last_page: 1 } };
  },

  async create(payload) {
    if (isApiMode) {
      try {
        const response = await http.post("/admin/supervisor-accounts", payload);
        return response.data;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }

    await mockDelay();
    const current = getCurrentUser();
    const gender = current?.person?.gender || "male";
    const items = getMockAccounts();
    const email = String(payload.email || "").trim().toLowerCase();
    const phone = String(payload.contact_number || "").trim();

    if (items.some((item) => String(item.email).toLowerCase() === email)) {
      throw { isWaratelError: true, status: 422, message: "البريد الإلكتروني مستخدم مسبقاً.", fieldErrors: { email: "البريد الإلكتروني مستخدم مسبقاً." } };
    }
    if (items.some((item) => item.contact_number === phone)) {
      throw { isWaratelError: true, status: 422, message: "رقم التواصل مستخدم مسبقاً.", fieldErrors: { contact_number: "رقم التواصل مستخدم مسبقاً." } };
    }

    const nextId = items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1;
    const maxSupervisorId = mockOptions.supervisors.length
      ? Math.max(...mockOptions.supervisors.map((item) => Number(item.id) || 0))
      : 0;
    const item = {
      id: nextId,
      supervisor_id: maxSupervisorId + 1,
      email,
      full_name: `${payload.fname} ${payload.lname}`.trim(),
      gender,
      gender_label: gender === "female" ? "أنثى" : "ذكر",
      contact_number: phone,
      join_date: payload.join_date || new Date().toISOString().slice(0, 10),
      address: payload.address || "",
    };
    items.unshift(item);
    saveMockAccounts(items);
    return {
      data: item,
      message: gender === "female" ? "تمت إضافة المشرفة بنجاح." : "تمت إضافة المشرف بنجاح.",
    };
  },
};
