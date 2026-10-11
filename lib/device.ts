export function describeDevice(userAgent: string | null | undefined) {
  const ua = (userAgent || "").trim();
  if (!ua) return "N/A";

  let device = "";
  if (/iPhone/.test(ua)) device = "iPhone";
  else if (/iPad/.test(ua)) device = "iPad";
  else if (/Android/.test(ua) && /Mobile/.test(ua)) device = "Android Phone";
  else if (/Android/.test(ua)) device = "Android Tablet";
  else if (/Macintosh|Mac OS X/.test(ua)) device = "Mac";
  else if (/Windows/.test(ua)) device = "PC";
  else if (/Linux/.test(ua)) device = "Linux";

  let os = "";
  const android = ua.match(/Android ([0-9.]+)/);
  const ios = ua.match(/OS ([0-9_]+)/);
  const mac = ua.match(/Mac OS X ([0-9_]+)/);
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (android) os = `Android ${android[1]}`;
  else if (/iPhone|iPad|iPod/.test(ua)) {
    const version = ios ? ios[1].replace(/_/g, ".") : "";
    os = `${/iPad/.test(ua) ? "iPadOS" : "iOS"}${version ? ` ${version}` : ""}`;
  } else if (mac) os = `macOS ${mac[1].replace(/_/g, ".")}`;
  else if (/Linux/.test(ua)) os = "Linux";

  let browser = "";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
  else if (/CriOS|Chrome\//.test(ua)) browser = "Chrome";
  else if (/FxiOS|Firefox/.test(ua)) browser = "Firefox";
  else if (/Safari/.test(ua)) browser = "Safari";

  const parts = [device, os, browser].filter(
    (part, index, list) => part && list.indexOf(part) === index
  );
  return parts.join(" · ") || "Unknown";
}
