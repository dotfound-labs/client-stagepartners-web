export type PublicationDates = { firstPublishedAt?: string | null; contentUpdatedAt?: string | null };
export function publicationDate(value: string, withTime=false) {
  const date=new Date(value);
  if(!Number.isFinite(date.getTime()))return "不明";
  return new Intl.DateTimeFormat("ja-JP",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit",...(withTime?{hour:"2-digit",minute:"2-digit"} as const:{})}).format(date);
}
