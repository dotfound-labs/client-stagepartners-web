export const CONTACT_SUBJECT="【STAGE PARTNERS】ホームページにお問い合わせがありました";
export type InquiryFields={name:string;company?:string;email:string;phone:string;inquiry_type:string;message:string};
export function notificationFields(fields:InquiryFields,id:string){return {"氏名":fields.name,"会社名":fields.company?.trim()||"記載なし","メールアドレス":fields.email,"電話番号":fields.phone||"記載なし","ご相談の種別":fields.inquiry_type,"お問い合わせ内容":fields.message,"受付番号":id};}
export function storedInquiryMessage(fields:InquiryFields){return fields.company?.trim()?"会社名："+fields.company.trim()+"\n\n"+fields.message:fields.message;}
