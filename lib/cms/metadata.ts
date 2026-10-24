import "server-only";
import type {Metadata} from "next";
import {getPageFields} from "./public";
import {resolvePageMetadata} from "./page-values";
export async function pageMetadata(slug:string,defaults:Metadata):Promise<Metadata>{
  const fields=await getPageFields(slug);
  return resolvePageMetadata(slug,fields,defaults);
}
