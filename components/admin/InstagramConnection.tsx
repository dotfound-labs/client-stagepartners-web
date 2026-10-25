"use client";
import {useEffect,useRef,useState} from "react";
import {designFixture} from "@/lib/cms/design-fixtures";
import InstagramSetup,{type InstagramSetupState} from './InstagramSetup';
type State={config:{account_id:string|null;username:string|null;enabled:boolean;health:string;last_success_at:string|null};authorizationConfigured:boolean;connectionAvailable:boolean;token:{state:string;expiresAt:string|null};setup?:InstagramSetupState};
async function call(path:string,data?:unknown){if(process.env.NODE_ENV==='development'&&window.location.pathname==='/admin-design-preview'){if(data!==undefined)throw Error('デザイン確認専用です。送信しません。');return designFixture(path);}const r=await fetch('/api/admin/'+path,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await r.json();if(!r.ok)throw Error(result.error??'同期できませんでした。接続状態を確認してください。');return result;}
export default function InstagramConnection({owner}:{owner:boolean}){
 const [state,setState]=useState<State|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[pending,setPending]=useState(false);
 const inFlight=useRef(false);
 const [targetUsername,setTargetUsername]=useState('');
 const targetValid=/^@?[a-z0-9._]{1,30}$/i.test(targetUsername.trim());
 const load=()=>call('instagram').then(setState);
 useEffect(()=>{void load().catch(e=>setError(e.message));},[]);
 async function action(kind:'connect'|'start'|'sync'|'stop'){
  if(inFlight.current)return;inFlight.current=true;
  setPending(true);setError('');setMessage('');try{
   if(kind==='connect'){if(!targetValid)throw Error('接続するInstagramユーザー名を入力してください。');const result=await call('instagram/oauth',{username:targetUsername.trim()});window.location.assign(result.url);return;}
   if(kind==='sync'){const result=await call('instagram/sync',{});setMessage(result.status==='skipped'?'次回取得可能時刻まで待機しています。':result.status==='ok'?'確認が完了しました。対象の投稿は '+(result.imported??0)+' 件です。':'取得を完了できませんでした。接続状態を確認し、必要に応じて再認証してください。');}
   else if(state)await call('instagram',{accountId:state.config.account_id,username:state.config.username,enabled:kind==='start',autoPublish:kind==='start'});
   await load();
  }catch(e){setError((e as Error).message);}finally{inFlight.current=false;setPending(false);}
 }
 return <section className="admin-card"><h2>Instagram連携</h2><p>接続するアカウントを指定し、Instagramで公式認証します。独立した #お知らせ タグがある投稿だけをニュースへ取り込みます。名前の入力だけでは接続されません。</p>{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
 <ol><li>接続するアカウントを指定</li><li>Instagramで公式認可し、対象アカウントを確認</li><li>自動公開を開始し、初回同期を実行</li></ol>
 {owner?<><InstagramSetup available={state?.connectionAvailable}/><button disabled={pending} onClick={()=>{setError('');void load().catch(e=>setError(e.message));}}>設定状態を再確認</button></>:<p>接続設定と公式認証は最高管理者が操作します。</p>}
 <h3>接続するアカウント</h3>
 {owner&&<div className="admin-instagram-setup"><label>接続するInstagramユーザー名<input value={targetUsername} onChange={e=>setTargetUsername(e.target.value)} placeholder="@ユーザー名（プロフィールのURL末尾）" maxLength={31} autoComplete="off"/></label><p>Instagramで認証が完了するまで、入力内容は保存されません。入力したユーザー名と認証したアカウントが一致する場合だけ接続します。</p><p>切り替える場合は新しいユーザー名で再認証してください。成功後は同期が停止した状態になるため、対象を確認して自動取込・公開を開始します。既存の記事は削除しません。失敗した場合は接続状態を再確認してください。</p></div>}
 {state&&<p>認証済みの接続先：{state.config.account_id&&state.config.username?'@'+state.config.username:'未接続'}</p>}
 {state&&<><p>接続状態: {({unconnected:'未接続',connected:'接続済み',expiring:'期限間近',expired:'期限切れ・再認可が必要',error:'設定エラー'} as Record<string,string>)[state.token.state]??state.token.state}</p><p>取得状態: {({"not-configured":"準備中",ok:"正常","token-expired":"再認証が必要","rate-limited":"時間をおいて再試行",error:"確認が必要"} as Record<string,string>)[state.config.health]??"確認中"} / 最終成功: {state.config.last_success_at?new Date(state.config.last_success_at).toLocaleString('ja-JP'):'未実行'}</p>{state.token.expiresAt&&<p>有効期限: {new Date(state.token.expiresAt).toLocaleString('ja-JP')}</p>}
 {owner&&<div className="admin-inline"><button disabled={pending||!state.connectionAvailable||!targetValid} onClick={()=>void action('connect')}>Instagramで認可する・再接続</button><button disabled={pending||!state.authorizationConfigured||state.token.state!=='connected'||state.config.enabled} onClick={()=>void action('start')}>#お知らせの自動取込・公開を開始</button><button disabled={pending||!state.authorizationConfigured||!state.config.enabled} onClick={()=>void action('sync')}>初回同期・今すぐ確認</button><button disabled={pending||!state.config.enabled} onClick={()=>void action('stop')}>連携を停止</button></div>}
 {!state.connectionAvailable&&<p>接続はまだ完了していません。初期設定についてサイト管理担当者にご確認ください。</p>}</>}
 <p className="admin-help">接続後に「自動取込・公開を開始」を押すと、対象の投稿がお知らせとして公開されます。接続の期限が切れた場合は再認証してください。</p>
 <p className="admin-help">全角＃や #お知らせ一覧 は対象外です。最新50投稿を確認し、重複登録や手動非公開の再公開はしません。後からタグを外しても既存記事は削除しません。Instagramへの投稿は行いません。毎時実行は別途有効化が必要です。</p></section>;
}
