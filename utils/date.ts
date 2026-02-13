export function formatDateDisplay(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const normalizeDate = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const dateNormalized = normalizeDate(date);
  const todayNormalized = normalizeDate(today);
  const yesterdayNormalized = normalizeDate(yesterday);

  if (dateNormalized.getTime() === todayNormalized.getTime()) {
    return "Aujourd'hui";
  }

  if (dateNormalized.getTime() === yesterdayNormalized.getTime()) {
    return "Hier";
  }

  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
