export type NoticeTone = "info" | "success" | "error";
export function notify(message: string, tone: NoticeTone = "info") {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("lmsound:notify", { detail: { message, tone } }));
}
