import { http } from "../api/http";
import { normalizeApiError } from "../api/errors";
import { isApiMode } from "../config/appConfig";
import { getMockDb, mockDelay, saveMockDb } from "../mock/mockDatabase";

const nextId = (items = []) => (items.length ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1);

export const publicFormsService = {
  async submitSuggestion(payload) {
    if (isApiMode) {
      try {
        const response = await http.post("/suggestions", payload);
        return response.data;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }

    await mockDelay();
    const db = getMockDb();
    const item = {
      id: nextId(db.suggestions),
      ...payload,
      created_at: new Date().toISOString(),
    };
    db.suggestions.unshift(item);
    saveMockDb(db);
    return { data: item };
  },

  async submitVolunteer(payload) {
    if (isApiMode) {
      try {
        const response = await http.post("/volunteer-forms", payload);
        return response.data;
      } catch (error) {
        throw normalizeApiError(error);
      }
    }

    await mockDelay();
    const db = getMockDb();
    const labels = {
      design: "تصميم",
      photography: "تصوير",
      media: "إعلام",
      organization: "تنظيم",
    };
    const item = {
      id: nextId(db.volunteerForms),
      ...payload,
      user_id: null,
      form_type: { value: payload.form_type, label: labels[payload.form_type] || payload.form_type },
      status: { value: "pending", label: "قيد المراجعة" },
      created_at: new Date().toISOString(),
    };
    db.volunteerForms.unshift(item);
    saveMockDb(db);
    return {
      data: item,
      message: "تم استلام طلب التطوع وهو قيد المراجعة، وسيتم التواصل معك قريباً.",
    };
  },
};
