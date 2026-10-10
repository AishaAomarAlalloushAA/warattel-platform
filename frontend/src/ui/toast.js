let toastCounter = 0;

function emit(type, message, options = {}) {
  const detail = {
    id: ++toastCounter,
    type,
    message: String(message || ""),
    title: options.title || null,
    duration: options.duration ?? 4500,
  };

  window.dispatchEvent(new CustomEvent("waratel:toast", { detail }));
  return detail.id;
}

export const toast = {
  success: (message, options) => emit("success", message, options),
  error: (message, options) => emit("error", message, { duration: 6000, ...options }),
  warning: (message, options) => emit("warning", message, options),
  info: (message, options) => emit("info", message, options),
};
