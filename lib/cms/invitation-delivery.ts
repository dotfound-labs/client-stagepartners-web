import "server-only";
import {invitationDeliveryConfig} from "./invitation-readiness";
import {trustedServerClient} from "./trusted-server";
import {requireIdentity,requirePermission} from "./server";
export async function deliverInvitation(id:string){
 const config=invitationDeliveryConfig();
 if(!config)return "招待を予約しました。メール送信は無効のため、まだ送信していません。";
 const redirect=config.redirect;
 const {identity}=await requireIdentity();requirePermission(identity,"users","manage");
 const db=trustedServerClient();const claim=await db.rpc("cms_claim_invitation_delivery",{p_id:id,p_actor:identity.id});
 if(claim.error)throw new Error("INVITE_CLAIM_FAILED");
 if(!claim.data)return "送信処理は実行済みです。再送前に配送状況を確認してください。";
 // A timeout may still have sent mail. The durable claim prevents automatic retry.
 const sent=await db.auth.admin.inviteUserByEmail(claim.data,{redirectTo:redirect});
 if(sent.error)return "招待は予約済みですが、メール配送は確認できません。管理者が配送状況を確認してください。";
 await db.rpc("cms_mark_invitation_sent",{p_id:id});
 return "招待メールを送信しました。受信者によるメール確認とパスワード設定をお待ちください。";
}
