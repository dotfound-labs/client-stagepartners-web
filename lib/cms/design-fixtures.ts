// Synthetic local design data only. Never used by an API or authorization check.
export function designFixture(path:string){
 if(path==="publication-status")return {updatedAt:null,available:true};
 const document={id:"00000000-0000-4000-8000-000000000001",module:"news",slug:"design-example",draft:{title:"春の住まい相談会のお知らせ（デモ）",category:"info",date:"2026-10-25",excerpt:"ここはデザイン確認用の架空のお知らせです。",body:["本文の入力欄や公開までの流れを確認できます。実際の保存・公開は行いません。"]},version:1,archived:false,source:"manual",source_url:null,updated_at:"2026-10-25T00:00:00Z",published:null};
 if(path.startsWith("documents"))return {documents:path.includes("module=news")?[document]:[]};
 if(path.startsWith("revisions"))return {revisions:[]};
 if(path.startsWith("media"))return {media:[]};
 if(path.startsWith("users"))return {members:[],invitations:[],deliveryEnabled:false};
 if(path.startsWith("inquiries"))return {inquiries:[],intakeEnabled:false};
 if(path==="instagram")return {config:{account_id:null,username:"aim_architecture",enabled:false,auto_publish:false,health:"not-configured",last_success_at:null},authorizationConfigured:false,connectionAvailable:false,token:{state:"unconnected",expiresAt:null}};
 return {};
}
