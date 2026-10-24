"use client";
import { createContext, useContext, type ReactNode } from "react";
import { textKey } from "@/lib/cms/text-key";
import type { PageValues } from "@/lib/cms/page-values";
import { COMPANY_NAME, HEAD_OFFICE, OFFICES, BUSINESS_HOURS } from "@/content/company";
const commonParts = [COMPANY_NAME, HEAD_OFFICE.postalCode, HEAD_OFFICE.address, BUSINESS_HOURS, ...OFFICES.flatMap(o => [o.label, o.address, o.tel])].sort((a,b)=>b.length-a.length);
const empty:PageValues={title:"",fields:{}};
const Content=createContext({scope:"common",page:empty,common:empty});
const Scope=createContext<"page"|"common">("page");
export function PageFieldsProvider({scope="common",page,common,children}:{scope?:string;page:PageValues;common:PageValues;children:ReactNode}) {
  return <Content.Provider value={{scope,page,common}}>{children}</Content.Provider>;
}
export function CommonFields({children}:{children:ReactNode}) { return <Scope.Provider value="common">{children}</Scope.Provider>; }
export function useCmsValues() {
  const content=useContext(Content);const common=useContext(Scope)==="common";
  return {scope:common?"common":content.scope,data:common?content.common:content.page,common:content.common};
}
export function useCmsText() {
  const {scope,data,common}=useCmsValues();
  return (value:string,fieldId?:string)=> {
    const exact=data.fields[`${scope}.${fieldId??textKey(value)}`];
    if(exact!==undefined)return exact;
    const pattern=new RegExp(commonParts.map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|"),"g");
    return value.replace(pattern,part=>common.fields[`common.${textKey(part)}`]??part);
  };
}
export default function CmsText({children,fieldId}:{children:ReactNode;fieldId?:string}) {
  const text=useCmsText();return typeof children==="string"?text(children,fieldId):children;
}
