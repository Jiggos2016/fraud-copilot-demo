import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, BookOpen, Bot, CheckCircle2, ChevronDown, ClipboardList, FileText, LayoutDashboard, Search, ShieldCheck, Sparkles } from 'lucide-react';
import claimantsData from './data/claimants.json';
import employersData from './data/employers.json';
import claimsData from './data/claims.json';
import casesData from './data/cases.json';
import investigatorsData from './data/investigators.json';
import policiesData from './data/policy_snippets.json';
import scriptsData from './data/copilotScripts.json';

type Citation = { type: 'case' | 'policy'; id: string; label: string };
type Script = { match: string; answer: string; citations: Citation[] };
type AuditEntry = { at: string; action: string; detail: string };
const claimants = claimantsData;
const employers = employersData;
const claims = claimsData;
const cases = casesData;
const investigators = investigatorsData;
const policies = policiesData;
const scripts = scriptsData as Record<string, Script[]>;

const riskBand = (score: number) => score < 40 ? 'Low' : score < 70 ? 'Medium' : 'High';
const riskClass = (score: number) => score < 40 ? 'bg-emerald-100 text-emerald-800' : score < 70 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const stamp = () => new Date().toLocaleString();
const splitSignals = (s: string) => s.split(';').filter(x => x && x !== 'none');

function App() {
  return <Shell><Routes><Route path="/" element={<RiskQueue />} /><Route path="/case/:claimId" element={<CaseDetail />} /><Route path="/policy" element={<PolicySearch />} /><Route path="/admin" element={<Admin />} /></Routes></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const nav = [
    ['/', 'Risk Queue', LayoutDashboard],
    ['/policy', 'Policy Search', BookOpen],
    ['/admin', 'Admin', ShieldCheck],
  ] as const;
  return <div className="min-h-screen bg-slate-100">
    <header className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3"><div className="rounded-lg bg-slate-800 p-2"><ShieldCheck size={20}/></div><div><div className="font-bold tracking-tight">Fraud Copilot</div><div className="text-xs text-slate-400">UI Investigation Demo · Synthetic Data</div></div></div>
        <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">Human decision required</div>
      </div>
    </header>
    <div className="mx-auto flex max-w-[1500px]">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <nav className="space-y-1">{nav.map(([to,label,Icon]) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Icon size={17}/>{label}</NavLink>)}</nav>
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-900"><strong>Demo guardrail</strong><br/>Risk scores prioritize work. They do not represent probability of fraud and never trigger a disposition.</div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  </div>;
}

function RiskQueue() {
  const [band, setBand] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('risk');
  const rows = useMemo(() => claims.map(c => ({
    ...c,
    claimant: claimants.find(x => x.claimant_id === c.claimant_id)!,
    employer: employers.find(x => x.employer_id === c.employer_id)!,
  })).filter(r => band === 'All' || riskBand(r.risk_score) === band).filter(r => status === 'All' || r.status === status).sort((a,b) => sort === 'risk' ? b.risk_score-a.risk_score : b.filed_date.localeCompare(a.filed_date)), [band,status,sort]);
  return <div>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Risk Queue</h1><p className="mt-1 text-sm text-slate-600">Review claims by investigation priority. Ranking is a triage aid, not a fraud determination.</p></div><div className="text-sm text-slate-500">{rows.length} of {claims.length} claims</div></div>
    <div className="card mb-4 flex flex-wrap gap-3 p-3">
      <Filter label="Risk band" value={band} onChange={setBand} options={['All','Low','Medium','High']} />
      <Filter label="Status" value={status} onChange={setStatus} options={['All','Open','Under Investigation']} />
      <Filter label="Sort" value={sort} onChange={setSort} options={[['risk','Risk score'],['date','Filed date']]} />
    </div>
    <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><Th>Claimant</Th><Th>Employer</Th><Th>Filed</Th><Th>Weekly benefit</Th><Th>Risk</Th><Th>Signals</Th><Th>Status</Th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(r => <tr key={r.claim_id} className="cursor-pointer hover:bg-slate-50" onClick={() => location.hash = `#/case/${r.claim_id}`}><Td><div className="font-semibold text-slate-900">{r.claimant.name}</div><div className="text-xs text-slate-500">{r.claim_id}</div></Td><Td>{r.employer.name}</Td><Td>{r.filed_date}</Td><Td>{money(r.weekly_benefit_amount)}</Td><Td><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${riskClass(r.risk_score)}`}>{r.risk_score} · {riskBand(r.risk_score)}</span></Td><Td><div className="flex max-w-md flex-wrap gap-1">{splitSignals(r.top_signals).length ? splitSignals(r.top_signals).map(s => <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{s}</span>) : <span className="text-xs text-slate-400">No active signals</span>}</div></Td><Td><span className="whitespace-nowrap rounded-full border border-slate-200 px-2 py-1 text-xs">{r.status}</span></Td></tr>)}</tbody></table></div></div>
  </div>;
}

function CaseDetail() {
  const { claimId = '' } = useParams();
  const navigate = useNavigate();
  const claim = claims.find(c => c.claim_id === claimId);
  const claimant = claimants.find(c => c.claimant_id === claim?.claimant_id);
  const employer = employers.find(e => e.employer_id === claim?.employer_id);
  const caseItem = cases.find(c => c.claim_id === claimId);
  const investigator = investigators.find(i => i.investigator_id === caseItem?.assigned_investigator);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{q:string;a:string;citations:Citation[]}[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>(() => caseItem ? [{at: caseItem.opened_date, action:'Case opened', detail:caseItem.notes_summary}] : []);
  const initialMemo = claim ? `Claim ${claim.claim_id} was prioritized for review based on ${splitSignals(claim.top_signals).join(', ') || 'no active automated risk signals'}. Current evidence should be corroborated before disposition. Recommend review of available network, identity, employer, related-claim, and policy evidence before submitting a determination.` : '';
  const [memo, setMemo] = useState(initialMemo);
  const [memoEdited, setMemoEdited] = useState(false);
  const [pendingDisposition, setPendingDisposition] = useState<string | null>(null);
  const [submittedDisposition, setSubmittedDisposition] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  useEffect(() => { setAudit(a => a.some(x => x.action === 'Workspace viewed') ? a : [...a,{at:stamp(),action:'Workspace viewed',detail:`Opened ${claimId}`}]); }, [claimId]);
  if (!claim || !claimant || !employer) return <div className="card p-6">Claim not found. <Link className="underline" to="/">Return to queue</Link>.</div>;
  const relatedByIp = claimants.filter(c => c.filing_ip === claimant.filing_ip && c.claimant_id !== claimant.claimant_id).map(c => c.claimant_id);
  const relatedByDevice = claimants.filter(c => c.device_fingerprint === claimant.device_fingerprint && c.claimant_id !== claimant.claimant_id).map(c => c.claimant_id);
  const signals = splitSignals(claim.top_signals);
  const evidence = [
    ['Network / IP', signals.some(s => s.includes('ip')) ? 'Available' : 'Pending', claimant.filing_ip],
    ['Identity', signals.includes('cross_country_ip_mismatch') || signals.includes('blocklisted_ip_range') ? 'Pending' : 'Available', `Device ${claimant.device_fingerprint}`],
    ['Employer verification', caseItem?.notes_summary.toLowerCase().includes('awaiting employer') ? 'Pending' : 'Available', employer.name],
    ['Payment evidence', 'Not Available', 'Not included in demo dataset'],
    ['Related claims', relatedByIp.length || relatedByDevice.length ? 'Available' : 'Not Available', [...new Set([...relatedByIp,...relatedByDevice])].join(', ') || 'No direct link'],
    ['Policy evidence', 'Available', 'Grounded local policy corpus'],
  ];
  const ask = (e: FormEvent) => { e.preventDefault(); const q=query.trim(); if(!q) return; const list=scripts[claimId] || []; const hit=list.find(s => q.toLowerCase().includes(s.match.toLowerCase()) || s.match.toLowerCase().includes(q.toLowerCase())); const result=hit || {answer:'No grounded answer found for this query',citations:[]}; setChat(c => [...c,{q,a:result.answer,citations:result.citations}]); setAudit(a => [...a,{at:stamp(),action:'Copilot query',detail:`${q} → ${result.citations.map(c=>c.id).join(', ') || 'no citation returned'}`}]); setQuery(''); };
  const confirmDisposition = () => { if(!pendingDisposition) return; setSubmittedDisposition(pendingDisposition); setAudit(a => [...a,{at:stamp(),action:'Disposition submitted',detail:pendingDisposition}]); setPendingDisposition(null); };
  const closed = caseItem && caseItem.disposition !== 'Open';
  return <div>
    <button className="mb-3 text-sm font-semibold text-slate-600 hover:text-slate-900" onClick={() => navigate('/')}>← Back to risk queue</button>
    <div className="card mb-4 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold">{claimant.name}</h1><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${riskClass(claim.risk_score)}`}>{claim.risk_score} · {riskBand(claim.risk_score)}</span></div><p className="mt-1 text-sm text-slate-500">{claim.claim_id} · {employer.name} · Filed {claim.filed_date}</p></div><div className="text-right text-sm"><div className="font-semibold">{money(claim.weekly_benefit_amount)} / week</div><div className="mt-1 text-slate-500">{claim.status}{investigator ? ` · ${investigator.name}` : ''}</div></div></div></div>
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <Panel title="Signals" icon={<AlertTriangle size={18}/>} subtitle="Investigative leads only — corroboration required."><div className="space-y-2">{signals.length ? signals.map(s => <div key={s} className="rounded-lg border border-slate-200 p-3"><div className="font-semibold text-slate-900">{s}</div><div className="mt-1 text-sm text-slate-600">{signalExplanation(s, claimant.claimant_id, relatedByIp, relatedByDevice)}</div></div>) : <div className="text-sm text-slate-500">No active risk signals in the seed data.</div>}</div></Panel>
        <Panel title="Evidence" icon={<ClipboardList size={18}/>} subtitle="Neutral evidence availability, not a fraud verdict."><div className="grid gap-2 sm:grid-cols-2">{evidence.map(([name,state,detail]) => <div key={name} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{name}</span><EvidenceState state={state}/></div><div className="mt-2 text-xs text-slate-500">{detail}</div></div>)}</div></Panel>
        <Panel title="Draft memo" icon={<FileText size={18}/>} subtitle={memoEdited ? 'Edited by investigator' : 'AI draft — review before submitting'}><textarea className={`min-h-40 w-full rounded-lg border p-3 text-sm leading-6 outline-none ${memoEdited ? 'border-slate-300 bg-white' : 'border-violet-200 bg-violet-50'}`} value={memo} onChange={e => {setMemo(e.target.value);setMemoEdited(true);}}/><div className="mt-2 text-xs text-slate-500">The draft is never submitted automatically and is not a disposition.</div></Panel>
        <Panel title="Disposition" icon={<CheckCircle2 size={18}/>} subtitle="No default selection. Confirmation is required.">{closed ? <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">Historical case disposition: <strong>{caseItem.disposition}</strong> on {caseItem.closed_date}.</div> : submittedDisposition ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Demo disposition submitted: <strong>{submittedDisposition}</strong>. This updates local state only.</div> : <div><div className="grid gap-2 sm:grid-cols-3">{['Confirmed Fraud','False Positive','Inconclusive'].map(d => <button key={d} className="btn-secondary" onClick={() => setPendingDisposition(d)}>{d}</button>)}</div>{pendingDisposition && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3"><div className="text-sm font-semibold">Confirm disposition: {pendingDisposition}?</div><div className="mt-2 flex gap-2"><button className="btn-primary" onClick={confirmDisposition}>Confirm</button><button className="btn-secondary" onClick={() => setPendingDisposition(null)}>Cancel</button></div></div>}</div>}</Panel>
      </div>
      <div className="space-y-4">
        <Panel title="Grounded Copilot" icon={<Bot size={18}/>} subtitle="Scripted demo. Answers require case or policy grounding."><div className="mb-3 flex flex-wrap gap-2">{(scripts[claimId] || []).slice(0,3).map(s => <button key={s.match} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800" onClick={() => setQuery(s.match)}>{s.match}</button>)}</div><div className="max-h-[540px] space-y-3 overflow-y-auto pr-1">{chat.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Ask about signals, similar closed cases, earnings, or relevant policy.</div>}{chat.map((m,i) => <div key={i}><div className="ml-auto max-w-[90%] rounded-xl bg-slate-900 p-3 text-sm text-white">{m.q}</div><div className="mt-2 max-w-[95%] rounded-xl border border-violet-200 bg-violet-50 p-3"><div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-700"><Sparkles size={13}/> AI grounded answer</div><div className="text-sm leading-6 text-slate-800">{m.a}</div>{m.citations.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{m.citations.map(c => <CitationChip key={`${c.type}-${c.id}`} citation={c}/>)}</div>}</div></div>)}</div><form className="mt-3 flex gap-2" onSubmit={ask}><input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ask a grounded question…"/><button className="btn-primary" type="submit">Ask</button></form></Panel>
        <div className="card"><button className="flex w-full items-center justify-between p-4 text-left" onClick={() => setAuditOpen(!auditOpen)}><span><span className="font-semibold">Audit Trail</span><span className="ml-2 text-xs text-slate-500">{audit.length} events</span></span><ChevronDown size={18} className={auditOpen ? 'rotate-180' : ''}/></button>{auditOpen && <div className="border-t border-slate-200 p-4"><div className="space-y-3">{audit.map((a,i) => <div key={i} className="border-l-2 border-slate-200 pl-3"><div className="text-xs text-slate-400">{a.at}</div><div className="text-sm font-semibold">{a.action}</div><div className="text-sm text-slate-600">{a.detail}</div></div>)}</div></div>}</div>
      </div>
    </div>
  </div>;
}

function PolicySearch() {
  const location = useLocation();
  const initial = new URLSearchParams(location.search).get('search') || '';
  const [q,setQ] = useState(initial);
  const results = policies.filter(p => !q.trim() || `${p.snippet_id} ${p.section} ${p.text} ${p.source_doc}`.toLowerCase().includes(q.toLowerCase()));
  return <div><div className="mb-5"><h1 className="text-2xl font-bold">Policy Search</h1><p className="mt-1 text-sm text-slate-600">Keyword search across the synthetic policy corpus. Every result retains source and section attribution.</p></div><div className="card mb-4 p-4"><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={18}/><input autoFocus className="input pl-10" value={q} onChange={e=>setQ(e.target.value)} placeholder="Try: shared IP, earnings, appeal, interstate…"/></div></div><div className="space-y-3">{results.map(p => <div key={p.snippet_id} id={p.snippet_id} className="card p-4"><div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><span>{p.snippet_id}</span><span>•</span><span>{p.source_doc}</span><span>•</span><span>{p.section}</span></div><p className="mt-2 text-sm leading-6 text-slate-800">{p.text}</p></div>)}{!results.length && <div className="card p-6 text-center text-sm text-slate-500">No policy snippet matched this keyword search.</div>}</div></div>;
}

function Admin() { return <div><h1 className="text-2xl font-bold">Demo Administration</h1><p className="mt-1 text-sm text-slate-600">Read-only MVP metadata. Thresholds and metrics are placeholders for UX demonstration.</p><div className="mt-5 grid gap-4 md:grid-cols-3"><Metric title="Model version" value="demo-v1" note="Static risk scores from seed data"/><Metric title="Precision" value="—" note="Placeholder — no model evaluation run"/><Metric title="Recall" value="—" note="Placeholder — no model evaluation run"/></div><div className="card mt-4 p-4 text-sm leading-6 text-slate-700"><strong>Fixed demo thresholds:</strong> Low &lt; 40, Medium 40–69, High 70+. Thresholds only change work-queue presentation. They do not determine eligibility or fraud.</div></div>; }

function Filter({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:(string|[string,string])[]}) { return <label className="min-w-40"><span className="label mb-1 block">{label}</span><select className="input" value={value} onChange={e=>onChange(e.target.value)}>{options.map(o => {const [v,l]=Array.isArray(o)?o:[o,o];return <option key={v} value={v}>{l}</option>})}</select></label>; }
function Panel({title,subtitle,icon,children}:{title:string;subtitle?:string;icon:React.ReactNode;children:React.ReactNode}) { return <section className="card p-4"><div className="mb-3 flex items-start gap-2"><div className="mt-0.5 text-slate-500">{icon}</div><div><h2 className="font-bold text-slate-900">{title}</h2>{subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}</div></div>{children}</section>; }
function EvidenceState({state}:{state:string}) { const c=state==='Available'?'bg-emerald-100 text-emerald-800':state==='Pending'?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-500'; return <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${c}`}>{state}</span>; }
function CitationChip({citation}:{citation:Citation}) { const caseItem = citation.type === 'case' ? cases.find(c => c.case_id === citation.id) : undefined; return citation.type === 'case' && caseItem ? <Link className="rounded-full border border-violet-300 bg-white px-2.5 py-1 text-xs font-semibold text-violet-800 hover:bg-violet-100" to={`/case/${caseItem.claim_id}`}>{citation.label}</Link> : <Link className="rounded-full border border-violet-300 bg-white px-2.5 py-1 text-xs font-semibold text-violet-800 hover:bg-violet-100" to={`/policy?search=${encodeURIComponent(citation.id)}`}>{citation.label}</Link>; }
function Metric({title,value,note}:{title:string;value:string;note:string}) { return <div className="card p-4"><div className="label">{title}</div><div className="mt-2 text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-slate-500">{note}</div></div>; }
function Th({children}:{children:React.ReactNode}) { return <th className="px-4 py-3 font-semibold">{children}</th>; }
function Td({children}:{children:React.ReactNode}) { return <td className="px-4 py-3 align-top text-slate-700">{children}</td>; }
function signalExplanation(signal:string, claimantId:string, ipRelated:string[], deviceRelated:string[]) {
  const map:Record<string,string> = {
    same_ip_multi_claimant: `The filing IP is also used by ${ipRelated.join(', ') || 'another claimant'}. Shared infrastructure requires corroboration.`,
    device_fingerprint_reuse: `The device fingerprint is also associated with ${deviceRelated.join(', ') || 'another claimant'}. Shared household devices can create legitimate matches.`,
    cross_state_ip_mismatch: 'Filing network geography differs from the claimant residence state. VPN, travel, relocation, or authorized assistance may explain the mismatch.',
    cross_country_ip_mismatch: 'The source data flags a cross-country network mismatch. Validate identity and network context before drawing conclusions.',
    blocklisted_ip_range: 'The filing network is tagged as a higher-risk range in the demo data. This remains an investigative lead only.',
    sequential_ip_cluster: 'The filing IP appears within a sequential cluster linked to another claim. Review related cases and independent evidence.',
    undeclared_wage_match: 'Wage data appears to overlap a claimed benefit period. Reconcile reported earnings, wage records, and claimant response.',
    new_hire_registry_lag: 'A new-hire registry signal may reflect timing differences. Verify employment dates before using it in adjudication.',
  };
  return map[signal] || `Signal ${signal} requires investigator review and corroboration.`;
}

export default App;
