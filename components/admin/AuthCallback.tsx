"use client";
import {useEffect,useRef,useState} from "react";
import "./admin.css";
export default function AuthCallback(){
  const initialized=useRef(false);
  const credentials=useRef<Record<string,string>|null>(null);
  const [ready,setReady]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState("");
  useEffect(()=>{
    if(initialized.current)return;initialized.current=true;
    const hash=new URLSearchParams(window.location.hash.slice(1));
    const query=new URLSearchParams(window.location.search);
    // Clear credentials before any request; never persist them in localStorage.
    window.history.replaceState(null,"","/auth/callback");
    const access_token=hash.get("access_token"),refresh_token=hash.get("refresh_token"),code=query.get("code");
    if(access_token&&refresh_token&&["invite","recovery"].includes(hash.get("type")??""))credentials.current={access_token,refresh_token};
    else if(code)credentials.current={code};
    else {queueMicrotask(()=>setError("確認リンクが無効か期限切れです。管理者に再発行を依頼してください。"));return;}
    queueMicrotask(()=>setReady(true));
  },[]);
  async function confirm(){
    if(pending||!credentials.current)return;setPending(true);setError("");
    try{
      const response=await fetch("/api/auth/callback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(credentials.current)});
      if(!response.ok)throw new Error("確認できませんでした。リンクの期限と接続設定を確認してください。");
      credentials.current=null;window.location.replace("/auth/set-password");
    }catch(e){setError((e as Error).message);}finally{setPending(false);}
  }
  return <main id="main" className="admin-login"><section className="admin-login-card"><h1>メールアドレスを確認</h1><p>この招待・再設定メールの受信者ご本人であることを確認して進んでください。</p>{error&&<p role="alert">{error}</p>}<button disabled={!ready||pending} onClick={confirm}>{pending?"確認中…":"確認してパスワード設定へ"}</button></section></main>;
}
