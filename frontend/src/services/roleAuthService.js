import { http } from "../api/http";
import { normalizeApiError } from "../api/errors";
import { saveSession } from "../auth/session";
import { isApiMode } from "../config/appConfig";
import { mockDelay, mockOptions } from "../mock/mockDatabase";
import { authService } from "./index";

function mockSupervisorUser(email) {
  const supervisor = mockOptions.supervisors.find((item) => item.gender === "male") || mockOptions.supervisors[0];
  return {
    id: 500,
    email,
    role: "supervisor",
    role_label: "مشرف",
    full_name: supervisor?.name || "المشرف",
    person: {
      id: 500,
      fname: supervisor?.name?.split(" ")?.[0] || "المشرف",
      lname: supervisor?.name?.split(" ")?.slice(1).join(" ") || "",
      full_name: supervisor?.name || "المشرف",
      gender: supervisor?.gender || "male",
      gender_label: supervisor?.gender === "female" ? "أنثى" : "ذكر",
    },
    role_data: {
      supervisor_id: supervisor?.id || 1,
      supervisor_role: "mushrif",
      supervisor_role_label: "مشرف",
    },
  };
}

export const roleAuthService = {
  async login(payload) {
    if (payload.role !== "supervisor") {
      return authService.login(payload);
    }

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
    if (!payload.email || !payload.password) {
      throw { isWaratelError: true, status: 422, message: "يرجى إدخال البريد الإلكتروني وكلمة المرور.", fieldErrors: {} };
    }
    const user = mockSupervisorUser(payload.email);
    const token = `mock-supervisor-${Date.now()}`;
    saveSession({ token, user });
    return { message: "تم تسجيل الدخول بنجاح.", token, user };
  },
};
