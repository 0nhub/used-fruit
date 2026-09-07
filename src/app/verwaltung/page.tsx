"use client";
import {useEffect,useState} from 'react';
import {SiteHeader} from '@/components/SiteHeader';
import {api} from '@/lib/apiClient';
type Report={id:string;reporterId:string;listingId:string|null;reportedUserId:string|null;reason:string;status:string;createdAt:string};
export default function ModerationPage(){
  const [reports,setReports]=useState<Report[]>([]),[error,setError]=useState(''),[ready,setReady]=useState(false);
  async function refresh(){try{setReports((await api<{items:Report[]}>('/admin/reports')).items);setError('');}catch(e){setError(e instanceof Error?e.message:'Laden fehlgeschlagen.');}finally{setReady(true);}}
  useEffect(()=>{void refresh();},[]);
  async function action(report:Report,type:'ban'|'unban'|'resolve'){
    const reason=window.prompt(type==='resolve'?'Begründung für den Abschluss:':'Begründung für die Maßnahme:');if(!reason?.trim())return;
    try {
      let userId=report.reportedUserId;
      if(!userId&&report.listingId&&type!=='resolve')userId=(await api<{sellerId:string}>('/listings/'+report.listingId)).sellerId;
      await api('/admin/actions',{method:'POST',body:{action:type,reportId:report.id,userId,reason}});await refresh();
    }catch(e){setError(e instanceof Error?e.message:'Maßnahme fehlgeschlagen.');}
  }
  return <><SiteHeader/><main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-2xl font-semibold">Verwaltung</h1><p className="mt-2 text-uf-text-secondary">Meldungen und Maßnahmen</p>{error&&<p role="alert" className="mt-4">{error}</p>}{!ready&&<p>Laden…</p>}{reports.map(report=><article key={report.id} className="mt-6 rounded-2xl border border-uf-border p-5"><p className="whitespace-pre-wrap">{report.reason}</p><p className="mt-2 text-sm text-uf-text-secondary">{new Date(report.createdAt).toLocaleString('de-DE')} · {report.status}</p>{report.listingId&&<a className="text-uf-link" href={'/listing/'+report.listingId}>Inserat öffnen</a>}<div className="mt-4 flex flex-wrap gap-3">{(['resolve','ban','unban'] as const).map(type=><button key={type} className="rounded-full bg-uf-bg-subtle px-4 py-2 text-sm" onClick={()=>action(report,type)}>{type==='resolve'?'Abschließen':type==='ban'?'Konto sperren':'Konto entsperren'}</button>)}</div></article>)}{ready&&!error&&!reports.length&&<p className="mt-6">Keine Meldungen vorhanden.</p>}</main></>;
}
