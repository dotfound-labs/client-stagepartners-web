export type InstagramSetupState={checks:Record<string,boolean>;storageMode:string};
export default function InstagramSetup({available}:{available?:boolean}){
 return <div className="admin-instagram-setup">
  <h3>接続の準備</h3>
  <p>{available===undefined?'接続の準備状態を確認しています。':available?'接続の準備ができています。下にユーザー名を入力し、「Instagramで認可する・再接続」へ進んでください。':'初期設定が必要です。サイト管理担当者にご連絡ください。設定が完了するまで接続できません。'}</p>
  <p>ビジネスまたはクリエイターのプロアカウントで認証してください。ユーザー名を入力するだけでは接続されません。</p>
 </div>;
}
