// ============================================================
// AI Project Tracker — Dark Hi-fi (Direction C dark + A cards)
// Ready for Next.js port
// ============================================================

const PROJECTS = [
  { id: '258321t2', name: 'Schaeffler 1 — Detectie rulmenti', desc: 'Detectia rulmentilor mici, medii. Automatizarea cu presa.', status: 'progress', owner: 'Liviu', progress: 60 },
  { id: '251219s3', name: 'Schaeffler 4 — Camere inspectie OCR', desc: 'Trebuie identificate 2 marcaje pe piese.', status: 'progress', owner: 'Alex', progress: 35 },
  { id: '260233r4', name: 'Benchmark AI Lara6 & Acumen', desc: 'Solutie pentru detectie automata a defectelor. Folosim Lara 5 Neura si ASH Acumen.', status: 'progress', owner: 'Liviu', progress: 50 },
  { id: '250515t1', name: 'Sistem Inspectie Automata — Schaeffler 2', desc: 'Automatizarea unei linii de productie. 2 camere la 45°, dozator, piston si clapeta NOK.', status: 'bottleneck', owner: 'Liviu', progress: 25, bottleneck: 'Trebuie scazut timpul pe care il petrec piesele pe banda — se aduna prea multe si cad.' },
  { id: '260401p1', name: 'Planning AI Vision — client nou', desc: 'Evaluare fezabilitate pentru cerere de oferta Schaeffler 5.', status: 'planning', owner: 'Zoltan', progress: 10 },
  { id: '260310w2', name: 'Integrare Acumen — linia 3', desc: 'Asteptam hardware de la furnizor.', status: 'waiting', owner: 'Alex', progress: 45 },
];

const USERS = [
  { email: 'liviu@globalsource.ro', name: 'Liviu', role: 'admin', seen: '2h ago' },
  { email: 'z.marko@globalsource.ro', name: 'Zoltan', role: 'editor', seen: '10m ago' },
  { email: 'a.udrea@globalsource.ro', name: 'Alex', role: 'editor', seen: '1d ago' },
  { email: 'morossri@schaeffler.com', name: 'Sorin', role: 'viewer', seen: '3h ago' },
];

const STATUS = {
  planning: 'Planning', progress: 'In Progress', waiting: 'Waiting', done: 'Completed', bottleneck: 'Bottleneck',
};

const Icon = ({ id, style }) => <svg style={{ width: 16, height: 16, ...style }}><use href={`#i-${id}`}/></svg>;

function Logo({ size = 28 }) {
  return <img src="logo.png" alt="Global Source" style={{ width: size, height: size, objectFit: 'contain' }}/>;
}

function Pill({ s }) {
  return <span className={`chip st-${s}`}><span className="dot"/>{STATUS[s]}</span>;
}

function RolePill({ r }) {
  return <span className={`chip role-${r}`}>{r}</span>;
}

// ============================================================
// LOGIN
// ============================================================
function Login() {
  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="login-badge"><span style={{width:6,height:6,borderRadius:'50%',background:'#8dd13a',boxShadow:'0 0 8px #8dd13a'}}/>AI_TRACKER · V1.2</div>
        <h1 className="login-h">Ship AI,<br/><span className="grad">unblock the line.</span></h1>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', maxWidth: 440, lineHeight: 1.6, marginTop: 20 }}>Every Schaeffler integration, benchmark și bottleneck tracked în one place. Built by Global Source.</p>
        <div style={{ display: 'flex', gap: 28, marginTop: 32 }}>
          {[['14','active','#8dd13a'],['8','shipped','#2ba8d9'],['2','blocked','#e8863a']].map(([n,l,c])=>(
            <div key={l}>
              <div className="display" style={{ fontSize: 30, fontWeight: 700, color: c }}>{n}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="login-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 34 }}>
          <Logo size={32}/>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Global Source</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Project Tracker</div>
          </div>
        </div>
        <div className="display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Sign in</div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 26 }}>Use your @globalsource.ro account.</div>
        <label className="label">Email</label>
        <input className="input" placeholder="you@globalsource.ro" defaultValue="liviu@globalsource.ro" style={{ marginBottom: 14 }}/>
        <label className="label">Password</label>
        <input className="input" type="password" placeholder="••••••••" defaultValue="••••••••" style={{ marginBottom: 22 }}/>
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 14 }}>Sign in →</button>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 16, textAlign: 'center' }}>Need access? Contact your admin.</div>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
function Sidebar({ view, setView, role = 'admin' }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Logo size={30}/>
        <div>
          <div className="name">AI Tracker</div>
          <div className="sub">Global Source</div>
        </div>
      </div>
      <div className="nav-label">Workspace</div>
      <div className={`nav-item ${view==='projects'?'active':''}`} onClick={()=>setView('projects')}><Icon id="board"/>Projects <span className="nav-count">6</span></div>
      <div className="nav-item"><Icon id="chart"/>Dashboard</div>
      {role!=='viewer' && <div className={`nav-item ${view==='users'?'active':''}`} onClick={()=>setView('users')}><Icon id="users"/>Users <span className="nav-count">4</span></div>}

      <div className="nav-label">Filters</div>
      {[['In progress','progress',4],['Bottleneck','bottleneck',1],['Waiting','waiting',1],['Planning','planning',1]].map(([l,s,n])=>(
        <div key={s} className="nav-item" style={{fontSize:12}}>
          <span className={`chip st-${s}`} style={{padding:'1px 6px',fontSize:9}}><span className="dot"/></span>
          {l} <span className="nav-count">{n}</span>
        </div>
      ))}

      <div className="footer">
        <div className="user-chip">
          <div className="avatar">L</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="who">Liviu Marinescu</div>
            <div className="role">admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// PROJECTS — kanban + cards + table
// ============================================================
function Projects({ onOpen }) {
  const [view, setView] = React.useState('kanban');
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.status === filter);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Projects</h1>
          <div className="crumb">workspace / projects</div>
        </div>
        <div className="search">
          <Icon id="search"/>
          <input placeholder="Search projects, IDs, owners…"/>
          <kbd>⌘K</kbd>
        </div>
        <button className="btn"><Icon id="bell"/></button>
        <button className="btn primary"><Icon id="plus"/>New project</button>
      </div>

      <div className="stats">
        {[
          ['Active', '4', false, '#8dd13a'],
          ['Bottleneck', '1', false, '#e8863a'],
          ['Waiting', '1', false, '#e8a73a'],
          ['Completion', '42%', true, null],
        ].map(([l,n,grad,c],i)=>(
          <div key={i} className={`stat ${grad?'grad':''}`}>
            <div className="l">{l}</div>
            <div className="n" style={!grad?{color:c}:{}}>{n}</div>
            <div className="spark"/>
          </div>
        ))}
      </div>

      <div className="filter-row">
        {[['all','All',6],['progress','In progress',4],['bottleneck','Bottleneck',1],['waiting','Waiting',1],['planning','Planning',1]].map(([k,l,n])=>(
          <span key={k} className={`filter-chip ${filter===k?'on':''}`} onClick={()=>setFilter(k)}>{l} · {n}</span>
        ))}
        <div className="viewtoggle">
          <button className={view==='kanban'?'on':''} onClick={()=>setView('kanban')}><Icon id="board"/>Kanban</button>
          <button className={view==='cards'?'on':''} onClick={()=>setView('cards')}><Icon id="grid"/>Cards</button>
          <button className={view==='table'?'on':''} onClick={()=>setView('table')}><Icon id="list"/>Table</button>
        </div>
      </div>

      {view === 'kanban' && (
        <div className="kanban">
          {['planning','progress','waiting','bottleneck','done'].map(s => {
            const items = filtered.filter(p => p.status === s);
            return (
              <div key={s} className="kanban-col">
                <div className={`kanban-head st-${s}`}>
                  <span className="hc" style={{background:`var(--${s==='progress'?'gs-green':s==='bottleneck'?'warn':s==='done'?'gs-blue':s==='waiting'?'warn':'ink-3'})`}}/>
                  <span className="ttl">{STATUS[s]}</span>
                  <span className="cnt">{items.length}</span>
                </div>
                {items.map(p => (
                  <div key={p.id} className={`card bold proj-card st-${p.status}`} onClick={()=>onOpen(p)}>
                    <div className="rail"/>
                    <div className="body">
                      <div className="id mono">#{p.id}</div>
                      <div className="title">{p.name}</div>
                      {p.bottleneck && <div className="alert"><Icon id="alert"/>{p.bottleneck.slice(0,42)}…</div>}
                      <div className="progress segmented">
                        {Array.from({length:10}).map((_,i)=><i key={i} className={i<Math.round(p.progress/10)?'on':''}/>)}
                      </div>
                      <div className="btm">
                        <div className="avatar" style={{width:22,height:22,fontSize:10}}>{p.owner[0]}</div>
                        <span className="owner">{p.owner}</span>
                        <span style={{marginLeft:'auto',fontSize:11,color:'var(--ink-3)'}} className="mono">{p.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="kanban-add">+ add card</div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, padding: '0 24px 24px' }}>
          {filtered.map(p => (
            <div key={p.id} className={`card bold proj-card st-${p.status}`} onClick={()=>onOpen(p)}>
              <div className="rail"/>
              <div className="body">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                  <div style={{display:'flex',flexDirection:'column',gap:4}}>
                    <div className="id mono">#{p.id}</div>
                    <div className="title">{p.name}</div>
                  </div>
                  <Pill s={p.status}/>
                </div>
                <div className="desc">{p.desc}</div>
                {p.bottleneck && <div className="alert"><Icon id="alert"/>{p.bottleneck.slice(0,50)}…</div>}
                <div className="progress"><span style={{width:`${p.progress}%`}}/></div>
                <div className="btm">
                  <div className="avatar" style={{width:24,height:24,fontSize:11}}>{p.owner[0]}</div>
                  <span className="owner">{p.owner}</span>
                  <span style={{marginLeft:'auto',fontSize:12,color:'var(--ink-2)',fontWeight:600}} className="mono">{p.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'table' && (
        <div style={{ padding: '0 24px 24px' }}>
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'100px 2.5fr 140px 110px 180px 120px',gap:12,padding:'12px 20px',borderBottom:'1px solid var(--line)',fontSize:10,color:'var(--ink-3)',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'JetBrains Mono', monospace",fontWeight:600}}>
              <div>ID</div><div>Name</div><div>Status</div><div>Progress</div><div></div><div>Owner</div>
            </div>
            {filtered.map(p=>(
              <div key={p.id} onClick={()=>onOpen(p)} style={{display:'grid',gridTemplateColumns:'100px 2.5fr 140px 110px 180px 120px',gap:12,padding:'14px 20px',borderBottom:'1px solid var(--line)',alignItems:'center',cursor:'pointer'}}>
                <div className="mono" style={{fontSize:11,color:'var(--gs-blue)'}}>#{p.id}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:500}}>{p.name}</div>
                  <div style={{fontSize:12,color:'var(--ink-3)',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.desc}</div>
                </div>
                <Pill s={p.status}/>
                <div className="mono" style={{fontSize:12,fontWeight:600,color:p.status==='bottleneck'?'#e8863a':'var(--gs-green)'}}>{p.progress}%</div>
                <div className="progress"><span style={{width:`${p.progress}%`}}/></div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="avatar" style={{width:24,height:24,fontSize:11}}>{p.owner[0]}</div>
                  <span style={{fontSize:13}}>{p.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// PROJECT DETAIL MODAL
// ============================================================
function ProjectModal({ p, onClose }) {
  if (!p) return null;
  const tasks = [
    { t: 'Schimbat banda - Gigi', done: false },
    { t: 'Schimbat piston - Gigi', done: false },
    { t: 'Schimbat automatizare (dozatorul da drumul la urmatoarea piesa dupa detectie) - Global Source', done: false },
    { t: 'Schimbat banda pe care coboara piesele - Gigi', done: true },
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <span className="mono" style={{fontSize:11,color:'var(--gs-blue)',letterSpacing:'0.05em'}}>#{p.id}</span>
            <Pill s={p.status}/>
            <div style={{flex:1}}/>
            <button className="btn sm"><Icon id="edit"/>Edit</button>
            <button className="btn sm danger"><Icon id="trash"/>Delete</button>
            <button className="btn sm ghost" onClick={onClose}><Icon id="close"/></button>
          </div>
          <div className="display" style={{fontSize:28,fontWeight:700,lineHeight:1.15,letterSpacing:'-0.015em'}}>{p.name}</div>
          <div style={{display:'flex',alignItems:'center',gap:20,marginTop:14,fontSize:12,color:'var(--ink-3)'}} className="mono">
            <span>owner · {p.owner}</span>
            <span>created · 22.04.2026</span>
            <span>updated · 2h ago</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginTop:16}}>
            <div style={{fontSize:11,color:'var(--ink-3)',letterSpacing:'0.1em',textTransform:'uppercase'}} className="mono">Progress</div>
            <div className="progress" style={{flex:1,height:8}}><span style={{width:`${p.progress}%`}}/></div>
            <div style={{fontSize:13,fontWeight:700}} className="mono">{p.progress}% · 1/4</div>
          </div>
        </div>

        <div className="modal-body">
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <div>
              <div className="label">Description</div>
              <div style={{fontSize:14,lineHeight:1.65,color:'var(--ink-2)'}}>{p.desc}</div>
            </div>

            {p.bottleneck && (
              <div className="bottleneck">
                <div className="lbl"><Icon id="alert" style={{width:13,height:13}}/>Bottleneck</div>
                <div className="txt">{p.bottleneck}</div>
              </div>
            )}

            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div className="label" style={{marginBottom:0}}>Pași / Tasks</div>
                <span className="chip st-progress" style={{fontSize:10}}>1/4</span>
                <div style={{flex:1}}/>
                <button className="btn sm primary"><Icon id="plus"/>Add</button>
              </div>
              <div className="task-list">
                {tasks.map((tk,i)=>(
                  <div key={i} className={`task ${tk.done?'done':''}`}>
                    <div className={`checkbox ${tk.done?'on':''}`}/>
                    <span>{tk.t}</span>
                  </div>
                ))}
              </div>
              <input className="input" placeholder="Adaugă un pas nou…" style={{marginTop:10,fontSize:13}}/>
            </div>
          </div>

          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <div className="label" style={{marginBottom:0}}>Timeline</div>
              <div style={{flex:1}}/>
              <button className="btn sm primary"><Icon id="plus"/>Update</button>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="dot"/>
                <div className="when">22.04.2026 · Liviu</div>
                <div className="row"><span className="k st-done">DONE</span><span>A fost schimbata banda pe care coboara piesele, merge bine acum.</span></div>
                <div className="row"><span className="k st-waiting">WAIT</span><span>S-a comandat o noua banda si trebuie schimbat si pistonul.</span></div>
                <div className="row"><span className="k" style={{background:'var(--blue-bg)',color:'var(--gs-blue)'}}>NEXT</span><span>Ma suna domnul Gigi cand este totul gata la ei.</span></div>
              </div>
              <div className="timeline-item older">
                <div className="dot"/>
                <div className="when">20.04.2026 · Alex</div>
                <div className="row" style={{color:'var(--ink-2)'}}>Initial setup — camere montate, calibrare în curs.</div>
              </div>
              <div className="timeline-item older">
                <div className="dot"/>
                <div className="when">15.04.2026 · Liviu</div>
                <div className="row" style={{color:'var(--ink-2)'}}>Project created.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// USERS
// ============================================================
function Users() {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>User management</h1>
          <div className="crumb">admin / users · 4 accounts</div>
        </div>
        <div style={{flex:1}}/>
        <button className="btn"><Icon id="filter"/>Filter</button>
        <button className="btn primary"><Icon id="plus"/>Invite user</button>
      </div>

      <div className="stats">
        {[['Total','4','#e7ecf5'],['Admins','1','#e64b4b'],['Editors','2','#2ba8d9'],['Viewers','1','#aab3c5']].map(([l,n,c],i)=>(
          <div key={i} className="stat">
            <div className="l">{l}</div>
            <div className="n" style={{color:c}}>{n}</div>
          </div>
        ))}
      </div>

      <div style={{padding:'20px 28px'}}>
        <div className="utable">
          <div className="head"><div>#</div><div>User</div><div>Role</div><div>Last seen</div><div></div></div>
          {USERS.map((u,i)=>(
            <div key={u.email} className="row">
              <div className="mono" style={{color:'var(--ink-3)',fontSize:11}}>{String(i+1).padStart(2,'0')}</div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className="u-avatar">{u.name[0]}</div>
                <div>
                  <div className="u-name">{u.name}</div>
                  <div className="u-email">{u.email}</div>
                </div>
              </div>
              <RolePill r={u.role}/>
              <div className="mono" style={{fontSize:11,color:'var(--ink-3)'}}>{u.seen}</div>
              <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                <button className="btn sm"><Icon id="edit"/></button>
                <button className="btn sm danger"><Icon id="trash"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============================================================
// MOBILE
// ============================================================
function MobileLogin() {
  return (
    <div className="phone"><div className="notch"/><div className="screen">
      <div style={{padding:24,flex:1,display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:30}}>
          <Logo size={32}/>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>Global Source</div>
            <div className="mono" style={{fontSize:9,color:'var(--ink-3)',letterSpacing:'0.15em',textTransform:'uppercase'}}>Project Tracker</div>
          </div>
        </div>
        <div className="display" style={{fontSize:36,fontWeight:700,lineHeight:1.05,marginTop:48,letterSpacing:'-0.02em'}}>Ship AI,<br/><span style={{background:'var(--grad)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>unblock the line.</span></div>
        <div style={{fontSize:13,color:'var(--ink-2)',marginTop:14}}>Sign in with your Global Source account.</div>
        <div style={{marginTop:32}}>
          <label className="label">Email</label>
          <input className="input" defaultValue="liviu@globalsource.ro" style={{marginBottom:12,fontSize:13}}/>
          <label className="label">Password</label>
          <input className="input" type="password" defaultValue="••••••••" style={{marginBottom:18,fontSize:13}}/>
          <button className="btn primary" style={{width:'100%',justifyContent:'center',padding:12,fontSize:14}}>Sign in →</button>
        </div>
        <div style={{flex:1}}/>
        <div style={{textAlign:'center',fontSize:10,color:'var(--ink-3)'}} className="mono">v1.2 · GLOBAL SOURCE</div>
      </div>
    </div></div>
  );
}

function MobileProjects({ onOpen }) {
  return (
    <div className="phone"><div className="notch"/><div className="screen">
      <div style={{padding:'12px 16px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:10}}>
        <Logo size={22}/>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>Projects</div>
          <div className="mono" style={{fontSize:9,color:'var(--ink-3)',letterSpacing:'0.12em',textTransform:'uppercase'}}>6 active</div>
        </div>
        <div style={{flex:1}}/>
        <button className="btn sm ghost" style={{padding:6}}><Icon id="search"/></button>
      </div>
      <div style={{padding:'10px 16px'}}>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4}}>
          {['All 6','Progress 4','Block 1','Wait 1','Plan 1'].map((f,i)=>(
            <span key={i} className={`filter-chip ${i===0?'on':''}`} style={{whiteSpace:'nowrap',fontSize:11}}>{f}</span>
          ))}
        </div>
      </div>
      <div style={{padding:'6px 16px 16px',flex:1,overflow:'auto',display:'flex',flexDirection:'column',gap:10}}>
        {PROJECTS.slice(0,5).map(p=>(
          <div key={p.id} className={`card bold proj-card st-${p.status}`} onClick={()=>onOpen(p)} style={{cursor:'pointer'}}>
            <div className="rail"/>
            <div className="body" style={{padding:12,gap:8}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                <div>
                  <div className="mono" style={{fontSize:9,color:'var(--gs-blue)'}}>#{p.id}</div>
                  <div style={{fontSize:14,fontWeight:600,lineHeight:1.25,marginTop:2}}>{p.name}</div>
                </div>
                <Pill s={p.status}/>
              </div>
              {p.bottleneck && <div className="alert" style={{fontSize:10}}><Icon id="alert" style={{width:11,height:11}}/>Bottleneck</div>}
              <div className="progress segmented">
                {Array.from({length:10}).map((_,i)=><i key={i} className={i<Math.round(p.progress/10)?'on':''}/>)}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:'var(--ink-3)'}} className="mono">
                <div className="avatar" style={{width:18,height:18,fontSize:9}}>{p.owner[0]}</div>
                <span>{p.owner}</span>
                <span style={{marginLeft:'auto'}}>{p.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="fab" onClick={()=>onOpen(PROJECTS[0])}>+</div>
      <div className="tabbar">
        <div className="tab on"><Icon id="board" style={{width:20,height:20}}/>Projects</div>
        <div className="tab"><Icon id="chart" style={{width:20,height:20}}/>Stats</div>
        <div className="tab"><Icon id="users" style={{width:20,height:20}}/>Team</div>
        <div className="tab"><Icon id="bell" style={{width:20,height:20}}/>Inbox</div>
      </div>
    </div></div>
  );
}

function MobileDetail() {
  const p = PROJECTS[3];
  return (
    <div className="phone"><div className="notch"/><div className="screen">
      <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid var(--line)'}}>
        <button className="btn sm ghost" style={{padding:6}}><Icon id="back"/></button>
        <span className="mono" style={{fontSize:11,color:'var(--gs-blue)'}}>#{p.id}</span>
        <div style={{flex:1}}/>
        <button className="btn sm ghost" style={{padding:6}}><Icon id="edit"/></button>
      </div>
      <div style={{padding:'14px 16px',borderBottom:'1px solid var(--line)'}}>
        <div className="display" style={{fontSize:18,fontWeight:700,lineHeight:1.25,letterSpacing:'-0.01em'}}>{p.name}</div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10}}>
          <Pill s={p.status}/>
          <span className="mono" style={{fontSize:10,color:'var(--ink-3)'}}>Liviu · 22.04</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:12}}>
          <div className="progress" style={{flex:1,height:6}}><span style={{width:`${p.progress}%`}}/></div>
          <div className="mono" style={{fontSize:11,fontWeight:700}}>{p.progress}%</div>
        </div>
      </div>
      <div style={{display:'flex',borderBottom:'1px solid var(--line)',padding:'0 16px'}}>
        {['Tasks','Timeline','Info'].map((t,i)=>(
          <div key={t} style={{padding:'10px 12px',fontSize:12,fontWeight:i===0?700:500,color:i===0?'var(--ink)':'var(--ink-3)',borderBottom:i===0?'2px solid var(--gs-green)':'2px solid transparent'}}>{t}</div>
        ))}
      </div>
      <div style={{padding:14,flex:1,overflow:'auto'}}>
        <div className="bottleneck" style={{marginBottom:14}}>
          <div className="lbl" style={{fontSize:9}}><Icon id="alert" style={{width:11,height:11}}/>Bottleneck</div>
          <div className="txt" style={{fontSize:12}}>{p.bottleneck}</div>
        </div>
        <div className="label" style={{fontSize:10}}>Pași · 1/4</div>
        <div className="task-list">
          {['Schimbat banda - Gigi','Schimbat piston - Gigi','Schimbat automatizare'].map(t=>(
            <div key={t} className="task" style={{fontSize:12,padding:'10px 2px'}}>
              <div className="checkbox" style={{width:16,height:16}}/>
              <span>{t}</span>
            </div>
          ))}
          <div className="task done" style={{fontSize:12,padding:'10px 2px'}}>
            <div className="checkbox on" style={{width:16,height:16}}/>
            <span>Schimbat banda de coborare</span>
          </div>
        </div>
      </div>
      <div style={{padding:10,borderTop:'1px solid var(--line)',display:'flex',gap:6}}>
        <input className="input" placeholder="Adaugă un pas…" style={{padding:'8px 10px',fontSize:12}}/>
        <button className="btn primary sm" style={{padding:'8px 12px'}}><Icon id="plus"/></button>
      </div>
    </div></div>
  );
}

function MobileUsers() {
  return (
    <div className="phone"><div className="notch"/><div className="screen">
      <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid var(--line)'}}>
        <button className="btn sm ghost" style={{padding:6}}><Icon id="back"/></button>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>Users</div>
          <div className="mono" style={{fontSize:9,color:'var(--ink-3)',letterSpacing:'0.12em',textTransform:'uppercase'}}>4 accounts</div>
        </div>
        <div style={{flex:1}}/>
        <button className="btn primary sm"><Icon id="plus"/>Invite</button>
      </div>
      <div style={{padding:'12px 14px',display:'flex',gap:8}}>
        {[['Admin','1','role-admin'],['Editor','2','role-editor'],['Viewer','1','role-viewer']].map(([l,n,c])=>(
          <div key={l} className="card" style={{padding:'8px 10px',flex:1,textAlign:'center'}}>
            <div className="mono" style={{fontSize:9,color:'var(--ink-3)',letterSpacing:'0.1em',textTransform:'uppercase'}}>{l}</div>
            <div className="display" style={{fontSize:18,fontWeight:700,marginTop:2}}>{n}</div>
          </div>
        ))}
      </div>
      <div style={{padding:'0 14px 14px',flex:1,overflow:'auto'}}>
        {USERS.map(u=>(
          <div key={u.email} className="card bold" style={{padding:10,marginBottom:8,display:'flex',gap:10,alignItems:'center'}}>
            <div className="avatar">{u.name[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600}}>{u.name}</div>
              <div className="mono" style={{fontSize:10,color:'var(--ink-3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{u.email}</div>
            </div>
            <RolePill r={u.role}/>
          </div>
        ))}
      </div>
    </div></div>
  );
}

// ============================================================
// APP
// ============================================================
function App() {
  const [view, setView] = React.useState('projects');
  const [open, setOpen] = React.useState(null);

  return (
    <>
      {/* LOGIN */}
      <div className="section">
        <h2>// Login · Web</h2>
        <Login/>
      </div>

      {/* APP */}
      <div className="section">
        <h2>// Projects + Detail · Web ({view})</h2>
        <div className="app">
          <Sidebar view={view} setView={setView}/>
          <main className="main">
            {view === 'projects' && <Projects onOpen={setOpen}/>}
            {view === 'users' && <Users/>}
          </main>
        </div>
        {open && <ProjectModal p={open} onClose={()=>setOpen(null)}/>}
      </div>

      {/* MOBILE */}
      <div className="section">
        <h2>// Mobile · iOS / Android</h2>
        <div className="phone-grid">
          <div><MobileLogin/><div className="phone-label">Login</div></div>
          <div><MobileProjects onOpen={setOpen}/><div className="phone-label">Projects</div></div>
          <div><MobileDetail/><div className="phone-label">Detail</div></div>
          <div><MobileUsers/><div className="phone-label">Users (admin)</div></div>
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
