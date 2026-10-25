"use client";
import {useState} from 'react';

export type InstagramSetupState={checks:Record<string,boolean>;storageMode:string};
const items=[
 ['environment','接続する環境','Vercel Previewでは認証・同期を停止します。承認済みHTTPS環境で接続します。'],
 ['appId','InstagramアプリID','MetaのInstagram「API setup with Instagram login」で確認 → INSTAGRAM_APP_ID'],
 ['appSecret','Instagram App Secret','サーバー専用の INSTAGRAM_APP_SECRET に保存します。ブラウザやこの入力欄には貼りません。'],
 ['redirect','認証後の戻り先','Metaの有効なOAuthリダイレクトURIと INSTAGRAM_REDIRECT_URI を完全一致させます。HTTPSが必要です。'],
 ['origin','現在の画面の接続先','登録したHTTPS戻り先と同じドメインの管理画面を開きます。HTTPのlocalhostからは認証できません。'],
 ['version','Meta APIバージョン','Metaアプリで利用可能なバージョンを INSTAGRAM_API_VERSION に設定します。'],
 ['storage','トークン保存先','本番は INSTAGRAM_TOKEN_STORE=encrypted-db と INSTAGRAM_TOKEN_ENCRYPTION_KEY（64桁の16進数）をサーバー専用設定へ。'],
 ['serverKey','データベースのサーバー接続','対象プロジェクト専用の SUPABASE_SECRET_KEY。ブラウザ公開用変数には設定しません。'],
 ['oauthEnabled','公式認証の有効化','準備・承認後、INSTAGRAM_OAUTH_ENABLED=true にします。'],
 ['syncEnabled','同期処理の有効化','認証とは別に INSTAGRAM_SYNC_ENABLED=true が必要です。画面で自動公開を開始するまで取り込みません。'],
 ['jobSecret','同期ジョブの認証','サーバー専用 CRON_SECRET を設定。定期実行の登録・有効化は別の操作です。'],
] as const;

export default function InstagramSetup({setup}:{setup?:InstagramSetupState}){
 const [appId,setAppId]=useState(''),[redirect,setRedirect]=useState(''),[version,setVersion]=useState(''),[result,setResult]=useState(''),[error,setError]=useState('');
 function prepare(e:React.FormEvent){
  e.preventDefault();setResult('');setError('');
  try{
   const u=new URL(redirect);
   if(!/^\d+$/.test(appId)||!/^v\d+\.0$/.test(version)||u.protocol!=='https:'||u.pathname!=='/api/admin/instagram/oauth'||u.search||u.hash||u.username||u.password)throw Error();
   setResult(`INSTAGRAM_APP_ID=${appId}\nINSTAGRAM_REDIRECT_URI=${u.href}\nINSTAGRAM_API_VERSION=${version}\nINSTAGRAM_TOKEN_STORE=encrypted-db`);
  }catch{setError('アプリIDは数字、APIバージョンは v数字.0、戻り先は HTTPS の /api/admin/instagram/oauth を指定してください。');}
 }
 return <div className="admin-instagram-setup">
  <h3>1. 接続の準備</h3>
  <p>ビジネスまたはクリエイターのプロアカウントが必要です。対象は下のユーザー名欄で指定します。APIキーやユーザー名だけでは接続されません。</p>
  <p>Metaで Instagram API with Instagram Login を設定し、読み取り用の instagram_business_basic を準備してください。アプリの役割がない利用者を接続する場合は、Metaの審査・必要なアクセスレベルを確認します。Instagramへの投稿権限は要求しません。</p>
  <form onSubmit={prepare}>
   <fieldset><legend>設定担当者に渡す内容を準備（秘密情報は入力しません）</legend>
    <label>InstagramアプリID<input inputMode="numeric" value={appId} onChange={e=>{setAppId(e.target.value);setResult('');}} placeholder="Metaに表示される数字" required maxLength={40}/></label>
    <label>HTTPSの認証戻り先<input type="url" value={redirect} onChange={e=>{setRedirect(e.target.value);setResult('');}} placeholder="https://サイトのドメイン/api/admin/instagram/oauth" required maxLength={2048}/></label>
    <label>APIバージョン<input value={version} onChange={e=>{setVersion(e.target.value);setResult('');}} placeholder="Metaアプリで確認した v数字.0" required maxLength={12}/></label>
    <button type="submit">設定用の内容を確認</button>
   </fieldset>
  </form>
  <p className="admin-help">この入力は準備用で、保存・認証・接続は行いません。再読み込みすると消えます。以下のサーバー設定を反映後、「設定状態を再確認」で読み込み直してください。</p>
  {error&&<p role="alert">{error}</p>}
  {result&&<div role="status"><p>入力形式を確認しました。まだサーバーには保存されていません。</p><label>サーバー設定に転記する内容<textarea readOnly rows={5} value={result}/></label></div>}
  <p>ローカル：Git対象外の .env.local。本番：対象Vercelプロジェクトの Settings → Environment Variables（Production）。本番への保存・再デプロイは別途承認が必要です。App Secret・暗号化キー・サーバーキーはサーバー専用で設定し、NEXT_PUBLIC_ を付けません。</p>
  <ul>{items.map(([key,label,help])=><li key={key}><strong>{label}：{setup?(setup.checks[key]?'準備済み':'未設定・条件未達'):'状態未取得'}</strong><p>{help}</p></li>)}</ul>
  {setup?.storageMode==='local-file'&&<p>現在は単一PC向けファイル保存です。本番では暗号化DB保存へ切り替えてください。</p>}
  <p>設定済み表示はサーバー設定の形式確認です。Meta側の許可、実認証、定期実行の成功を保証するものではありません。</p>
  <a href="https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login" target="_blank" rel="noreferrer">Meta公式の接続手順</a>
 </div>;
}
