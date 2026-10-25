import {siteMetadata} from "./site-metadata";
import "server-only";
import type {Metadata} from "next";
import {getPageFields} from "./public";
import {resolvePageMetadata} from "./page-values";
export async function pageMetadata(slug:string,defaults:Metadata):Promise<Metadata>{
  const fields=await getPageFields(slug);
  const resolved=resolvePageMetadata(slug,fields,defaults),site=await siteMetadata();
  return {...resolved,openGraph:{...site.openGraph,...resolved.openGraph},twitter:{...site.twitter,title:resolved.title as string,description:resolved.description??undefined}};
}
