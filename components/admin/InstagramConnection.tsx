"use client";
import {useEffect,useState} from "react";
import {designFixture} from "@/lib/cms/design-fixtures";
type State={config:{account_id:string|null;username:string|null;enabled:boolean;health:string;last_success_at:string|null};authorizationConfigured:boolean;connectionAvailable:boolean;token:{state:string;expiresAt:string|null}};
async function call(path:string,data?:unknown){if(process.env.NODE_ENV==='development'&&window.location.pathname==='/admin-design-preview'){if(data!==undefined)throw Error('デザイン確認専用です。送信しません。');return designFixture(path);}const r=await fetch('/api/admin/'+path,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await r.json();if(!r.ok)throw Error(result.error??'同期できませんでした。接続状態を確認してください。');return result;}
export default function InstagramConnection({owner}:{owner:boolean}){
 const [state,setState]=useState<State|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[pending,setPending]=useState(false);
 const load=()=>call('instagram').then(setState);
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 async function action(kind:'connect'|'start'|'sync'|'stop'){
  setPending(true);setError('');setMessage('');try{
   if(kind==='connect'){const result=await call('instagram/oauth',{});window.location.assign(result.url);return;}
   if(kind==='sync'){const result=await call('instagram/sync',{});setMessage(result.status==='skipped'?'次回取得可能時刻まで待機しています。':'同期結果: '+result.status+' / 対象 '+(result.imported??0)+' 件 / 認可状態: '+(result.tokenStatus??'確認中'));}
   else if(state)await call('instagram',{accountId:state.config.account_id,username:state.config.username,enabled:kind==='start',autoPublish:kind==='start'});
   await load();
  }catch(e){setError((e as Error).message);}finally{setPending(false);}
 }
 return <section className="admin-card"><h2>Instagram連携</h2><p>対象は aim_architecture です。独立した #お知らせ タグがある投稿だけをニュースへ取り込みます。名前の入力だけでは接続されません。</p>{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
 <ol><li>プロアカウント・Metaアプリ・安全な保存先を準備</li><li>Instagramで公式認可し、対象アカウントを確認</li><li>自動公開を開始し、初回同期を実行</li></ol>
 {state&&<><p>接続状態: {({unconnected:'未接続',connected:'接続済み',expiring:'期限間近',expired:'期限切れ・再認可が必要',error:'設定エラー'} as Record<string,string>)[state.token.state]??state.token.state}</p><p>取得状態: {state.config.health} / 最終成功: {state.config.last_success_at?new Date(state.config.last_success_at).toLocaleString('ja-JP'):'未実行'}</p>{state.token.expiresAt&&<p>有効期限: {new Date(state.token.expiresAt).toLocaleString('ja-JP')}</p>}
 {owner&&<div className="admin-inline"><button disabled={pending||!state.connectionAvailable} onClick={()=>void action('connect')}>Instagramで認可する・再接続</button><button disabled={pending||!state.authorizationConfigured||state.token.state!=='connected'||state.config.enabled} onClick={()=>void action('start')}>#お知らせの自動取込・公開を開始</button><button disabled={pending||!state.authorizationConfigured||!state.config.enabled} onClick={()=>void action('sync')}>初回同期・今すぐ確認</button><button disabled={pending||!state.config.enabled} onClick={()=>void action('stop')}>連携を停止</button></div>}
 {!state.connectionAvailable&&<p>公式認可の準備待ちです。Metaアプリ・HTTPS戻り先・永続的な秘密情報保存先の設定が必要です。</p>}</>}
 <p className="admin-help">全角＃や #お知らせ一覧 は対象外です。最新50投稿を確認し、重複登録や手動非公開の再公開はしません。後からタグを外しても既存記事は削除しません。Instagramへの投稿は行いません。毎時実行は別途有効化が必要です。</p></section>;
}
