"use client";
import { createContext, useContext, type ReactNode } from "react";
import { textKey } from "@/lib/cms/text-key";
import { COMPANY_NAME, HEAD_OFFICE, OFFICES, BUSINESS_HOURS } from "@/content/company";
const commonParts = [COMPANY_NAME, HEAD_OFFICE.postalCode, HEAD_OFFICE.address, BUSINESS_HOURS, ...OFFICES.flatMap(o => [o.label, o.address, o.tel])].sort((a,b)=>b.length-a.length);
const Fields = createContext<Record<string, string>>({});
export function PageFieldsProvider({ fields, children }: { fields: Record<string, string>; children: ReactNode }) {
  return <Fields.Provider value={fields}>{children}</Fields.Provider>;
}
export default function CmsText({ children }: { children: ReactNode }) {
  const fields = useContext(Fields);
  if (typeof children !== "string") return children;
  const exact = fields[textKey(children)];
  if (exact !== undefined) return exact;
  // Composed address/telephone labels retain their surrounding punctuation.
  const pattern = new RegExp(commonParts.map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  return children.replace(pattern, part => fields[textKey(part)] ?? part);
}
