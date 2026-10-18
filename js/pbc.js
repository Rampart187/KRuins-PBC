import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const KRPBC_STYLE_ID = "kruins-pbc-style";
if (!document.getElementById(KRPBC_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = KRPBC_STYLE_ID;
  style.textContent = '.kp{font-family:Arial,sans-serif;color:#dbeafe;background:#07131f;box-sizing:border-box;width:100%;height:100%;min-height:0;padding:8px;display:flex;flex-direction:column;overflow:hidden}\n.kp *{box-sizing:border-box}\n.kp-status{flex:0 0 auto;text-align:center;font-weight:800;padding:7px;border:1px solid #35d07f;color:#35d07f;border-radius:5px;margin-bottom:7px}\n.kp-status.edit{border-color:#ef4444;color:#ef4444}\n.kp-tabs{flex:0 0 auto;display:flex;gap:6px;margin:0 0 6px}\n.kp-tabs button{flex:1;background:#526779;color:#ffffff}\n.kp-tabs button.kp-btn.green,.kp-tabs button.kp-btn.selected,.kp-tabs button.kp-btn.primary{color:#ffffff}\n.kp-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding-right:2px}\n.kp-foot{flex:0 0 auto;display:flex;gap:6px;align-items:center;flex-wrap:nowrap;margin-top:6px;padding-top:4px;background:#07131f}\n.kp-foot button{white-space:nowrap;flex-shrink:0}\n.kp-foot button:first-child{min-width:0;flex:1 1 auto}\n.kp-foot button:last-child{margin-left:auto}\n.kp-edit-slot{flex:0 0 70px;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;min-height:70px;gap:5px}\n.kp-edit-slot .kp-help{display:block;flex:0 0 auto;white-space:nowrap}\n.kp-edit-slot .kp-row{width:100%;margin:0}\n.kp-edit-slot .kp-row button{white-space:nowrap}\n.kp-btn{background:#102838;color:#dbeafe;border:1px solid #31546a;border-radius:5px;padding:6px 8px;cursor:pointer}\n.kp-btn:hover{filter:brightness(1.18)}\n.kp-btn.green,.kp-btn.selected,.kp-btn.primary{border-color:#35d07f;color:#b8ffd5}\n.kp-btn.red,.kp-btn.danger{border-color:#ef4444;color:#fecaca}\n.kp-btn.folder{border-color:#d6a72d}\n.kp-grid{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 10px}\n.kp-title{font-weight:700;margin-top:8px;color:#bfe9ff}\n.kp-help,.kp-path{font-size:11px;color:#91a9ba}\n.kp-row{display:flex;gap:6px;align-items:center;margin:6px 0}\n.kp-row input{min-width:0;flex:1;background:#0b1f2e;color:#dbeafe;border:1px solid #31546a;padding:6px}\n.kp-card{display:flex;flex-direction:column;gap:6px;border:1px solid #24465c;padding:7px;border-radius:6px;margin:8px 0}\n.kp-card input,.kp-card textarea,.kp-editor{background:#0b1f2e;color:#dbeafe;border:1px solid #31546a;padding:6px}\n.kp-card textarea,.kp-editor{min-height:180px;resize:vertical}\n.kp-body.kp-editor-view{display:flex;flex-direction:column;overflow:hidden}\n.kp-body.kp-editor-view .kp-title{flex:0 0 auto}\n.kp-body.kp-editor-view textarea.kp-editor{display:block;width:100%;max-width:100%;min-width:0;min-height:0;height:auto;flex:1 1 auto;resize:none;overflow-y:auto;font:inherit;line-height:1.5}\n.kp-preset-list{display:flex;flex-direction:column;gap:5px}\n.kp-target-hint{display:block;font-size:9px;line-height:10px;font-weight:400;opacity:.75;margin-top:1px;white-space:nowrap}\n.kp-body::-webkit-scrollbar{width:8px}\n.kp-body::-webkit-scrollbar-thumb{background:#6b7280;border-radius:6px}\n.kp-body::-webkit-scrollbar-track{background:transparent}\n';
  style.textContent += "\n.kp-refresh-changes{display:flex;justify-content:space-between;gap:10px;width:100%;font-size:10px;line-height:1.35;margin:1px 0 5px;padding:0 2px}\n.kp-refresh-removed{color:#ff7777;text-align:left;flex:1;min-width:0;padding-left:35%}\n.kp-refresh-added{color:#60e79a;text-align:right;flex:1;min-width:0}\n";
  style.textContent += "\n.kp-search-results{font-size:11px;color:#91a9ba;max-height:140px;overflow-y:auto;overflow-wrap:anywhere}\n.kp-search-result{padding:4px 6px;margin:3px 0;border:1px solid #24465c;border-radius:4px;color:#dbeafe}\n";
  style.textContent += "\n.kp-refresh-nochanges{color:#ffffff;text-align:center;width:100%;font-size:10px}\n";
  document.head.appendChild(style);
}
const G="#35d07f",R="#ef4444",N="#07131f";
const post=async(u,o)=>{let r=await api.fetchApi(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(!r.ok)throw Error(await r.text());return r.json()};
const get=async u=>(await api.fetchApi(u)).json();
const E=(t,c,s)=>{let x=document.createElement(t);if(c)x.className=c;if(s!=null)x.textContent=s;return x};
const B=(s,f,c="")=>{let x=E("button","kp-btn "+c,s);x.onclick=f;return x};

app.registerExtension({name:"KRuins.PBC",async beforeRegisterNodeDef(T,D){
 if(D.name!=="KRuinsPBC")return;
 const old=T.prototype.onNodeCreated;
 T.prototype.onNodeCreated=function(){old?.apply(this,arguments);let n=this;n.size=[Math.max(555,n.size?.[0]||0),Math.max(600,n.size?.[1]||0)]; n.min_size=[555,600];
  const priorResize=n.onResize;
  n.onResize=function(size){if(size){size[0]=Math.max(555,size[0]);size[1]=Math.max(600,size[1]);}if(this.size){this.size[0]=Math.max(555,this.size[0]);this.size[1]=Math.max(600,this.size[1]);}return priorResize?.call(this,size)};
  n.color=N;n.bgcolor=N;
  let pw=n.widgets?.find(w=>w.name==="prompt");if(pw){
    pw.type="hidden";pw.hidden=true;pw.computeSize=()=>[0,0];pw.draw=()=>{};
    if(pw.inputEl){pw.inputEl.style.display="none";pw.inputEl.style.height="0";pw.inputEl.style.minHeight="0";}
  }
  let ui=E("div","kp"),head=E("div","kp-status","PROMPT READY"),tabs=E("div","kp-tabs"),body=E("div","kp-body"),editSlot=E("div","kp-edit-slot"),foot=E("div","kp-foot");
  ui.append(head,tabs,body,editSlot,foot);
  const dom=n.addDOMWidget("pbc","div",ui,{
    serialize:false,
    hideOnZoom:false,
    margin:8,
    getMinHeight:()=>480,
    getMaxHeight:()=>10000,
    getHeight:()=>"100%",
    afterResize:()=>requestAnimationFrame(()=>n.setDirtyCanvas(true,true))
  });
  dom.options.minNodeSize=[555,600];
  const measurePBC=()=>requestAnimationFrame(()=>n.setDirtyCanvas(true,true));
  let s={tab:"keywords",edit:false,root:"",cur:"",keywords:[],presets:[],scan:{folders:[],files:[],folder_presets:[]},del:new Set(),hist:[],last:"",refreshChanges:null,refreshSnapshot:null,presetSelected:-1,presetActive:-1};
  let noChangesTimer=null;
  const cancelNoChangesTimer=()=>{if(noChangesTimer!==null){clearTimeout(noChangesTimer);noChangesTimer=null;}};
  const scheduleNoChangesHide=()=>{cancelNoChangesTimer();noChangesTimer=setTimeout(()=>{noChangesTimer=null;if(s.refreshChanges && Object.values(s.refreshChanges).every(v=>v===0)){s.refreshChanges=null;const message=body.querySelector(".kp-refresh-nochanges");if(message)message.remove();}},15000);};
  const prompt=()=>currentText();
  let targetNode=null,targetWidget=null,targetInput=null,lastSelStart=null,lastSelEnd=null;
  const findTextWidget=t=>t?.widgets?.find(w=>typeof w.value==="string"&&(w.type==="text"||w.type==="customtext"||/positive|text|prompt/i.test(w.name||"")));
  const findTextInput=w=>{
    const c=w?.inputEl||w?.element||w?.input||w?.textarea;
    if(c && ("selectionStart" in c)) return c;
    return null;
  };
  const rememberCaret=()=>{
    if(targetInput && typeof targetInput.selectionStart==="number"){
      lastSelStart=targetInput.selectionStart;lastSelEnd=targetInput.selectionEnd;
    }
  };
  const chooseTarget=()=>{
    const sel=app.canvas?.selected_nodes||{};
    const nodes=Object.values(sel).filter(x=>x&&x!==n);
    if(nodes.length!==1){alert("Select exactly one target text node, then click Target Selected.");return}
    const t=nodes[0],w=findTextWidget(t);
    if(!w){alert("That node does not expose a compatible editable text widget.");return}
    targetNode=t;targetWidget=w;targetInput=findTextInput(w);
    if(targetInput){
      targetInput.addEventListener("click",rememberCaret);
      targetInput.addEventListener("keyup",rememberCaret);
      targetInput.addEventListener("select",rememberCaret);
      targetInput.addEventListener("input",rememberCaret);
      rememberCaret();
    }
    render();
  };
  const currentText=()=>targetWidget?String(targetWidget.value??""):String(pw?.value??"");
  const setPrompt=(v,h=true)=>{
    if(h)s.hist.push(currentText());
    if(pw){pw.value=v;pw.callback?.(v)}
    if(targetWidget){targetWidget.value=v;targetWidget.callback?.(v);targetNode?.setDirtyCanvas?.(true,true)}
    n.setDirtyCanvas(true,true)
  };
  const ins=x=>{
    const old=currentText();
    let a=lastSelStart,b=lastSelEnd;
    if(targetInput && document.activeElement===targetInput){a=targetInput.selectionStart;b=targetInput.selectionEnd}
    if(typeof a!=="number"||typeof b!=="number"){a=b=old.length}
    a=Math.max(0,Math.min(a,old.length));b=Math.max(a,Math.min(b,old.length));
    const before=old.slice(0,a),after=old.slice(b);
    const left=(before && !/[\s,]$/.test(before))?", ":"";
    const right=(after && !/^[\s,.!?;:]/.test(after))?", ":"";
    const inserted=left+x+right;
    setPrompt(before+inserted+after);
    const pos=before.length+inserted.length;
    lastSelStart=lastSelEnd=pos;
    requestAnimationFrame(()=>{
      if(targetInput){
        targetInput.value=targetWidget.value;
        targetInput.focus();
        targetInput.setSelectionRange(pos,pos);
      }
    });
  };
  const refreshCounts=async()=>{cancelNoChangesTimer();const d=await post("/kruins/pbc/inventory",{root:s.root});const old=s.refreshSnapshot;const now=d.inventory;s.refreshSnapshot=now;if(!old){s.refreshChanges=null;return;}const difference=(a,b)=>a.filter(x=>!b.includes(x)).length;s.refreshChanges={foldersAdded:difference(now.folders,old.folders),foldersRemoved:difference(old.folders,now.folders),filesAdded:difference(now.files,old.files),filesRemoved:difference(old.files,now.files)};};
  const folder=async p=>{let d=await post("/kruins/pbc/scan",{root:s.root,current:p});s.scan=d.scan;s.cur=d.scan.current;render()};
  const savekw=()=>post("/kruins/pbc/keywords",{root:s.root,keywords:s.keywords});
  const savepr=()=>post("/kruins/pbc/presets",{presets:s.presets});

  function nav(){tabs.innerHTML="";[["keywords","Keywords"],["wildcards","Wild Cards"],["prompting","Prompting"]].forEach(([k,l])=>{
    let b=B(l,()=>{s.tab=k;if(k==="wildcards")folder("");else render()},"kp-tab");if(s.tab===k)b.classList.add(s.edit?"red":"green");tabs.append(b)})}
  function keywords(){
    body.append(E("div","kp-title",`Keywords (${s.keywords.length})`));let g=E("div","kp-grid");
    s.keywords.forEach((x,i)=>{let b=B(x,()=>{if(s.edit){s.del.has(i)?s.del.delete(i):s.del.add(i);render()}else{ins(x);s.last=x;render()}},"kp-chip");
      if(s.edit&&s.del.has(i))b.classList.add("danger");else if(!s.edit&&s.last===x)b.classList.add("selected");g.append(b)});body.append(g);
    editSlot.append(E("div","kp-help","Click Edit to add or delete keywords."));
    if(s.edit){let r=E("div","kp-row"),i=document.createElement("input");i.placeholder="Add Keyword";i.maxLength=30;i.title="Maximum 30 characters";r.append(i,B("Add",async()=>{let v=i.value.trim();if(v.length>30){alert("Keywords are limited to 30 characters. Use Prompting for longer text.");return}if(v){s.keywords.push(v);await savekw();render();requestAnimationFrame(()=>{body.scrollTop=body.scrollHeight})}} ,"primary"),
      B(`Delete Selected (${s.del.size})`,async()=>{if(!s.del.size||!confirm(`Delete ${s.del.size} keyword(s)?`))return;s.keywords=s.keywords.filter((_,i)=>!s.del.has(i));s.del.clear();await savekw();render()},"danger"));editSlot.append(r)}
  }
  function wildcards(){
    let r=E("div","kp-row"),i=document.createElement("input");i.value=s.root;i.title=s.root;r.append(B("📁",async()=>{try{const d=await post("/kruins/pbc/choose-folder",{root:s.root});if(d.cancelled)return;i.value=d.root;const chosen=await post("/kruins/pbc/root",{root:d.root});s.root=chosen.root;s.cur="";s.scan=chosen.scan;s.refreshSnapshot=null;s.refreshChanges=null;await refreshCounts();render()}catch(e){alert("Folder selection failed: "+e.message)}},"folder"),i,
      B("Set",async()=>{let d=await post("/kruins/pbc/root",{root:i.value});s.root=d.root;s.cur="";s.scan=d.scan;s.refreshSnapshot=null;s.refreshChanges=null;await refreshCounts();render()},"primary"),B("Refresh",async()=>{await refreshCounts();await folder(s.cur)},"primary"));body.append(r);
    if(s.refreshChanges){let changes=E("div","kp-refresh-changes"),removed=E("div","kp-refresh-removed"),added=E("div","kp-refresh-added");for(const [key,label,side] of [["foldersRemoved","subdirectories removed",removed],["filesRemoved","wildcards removed",removed],["foldersAdded","subdirectories added",added],["filesAdded","wildcards added",added]]){const count=s.refreshChanges[key];if(count){side.append(E("div","",`${count} ${label}`))}}if(removed.childNodes.length||added.childNodes.length){changes.append(removed,added);body.append(changes)}else{body.append(E("div","kp-refresh-nochanges","No changes"));if(noChangesTimer===null)scheduleNoChangesHide();}}
    // Global wildcard filename locator: search, show relative paths, never navigate.
    let searchRow=E("div","kp-row"),searchInput=document.createElement("input");
    searchInput.placeholder="Find wildcard filename (e.g. Camaro)";
    searchInput.setAttribute("aria-label","Search all wildcard filenames");
    let results=E("div","kp-search-results");
    const runSearch=async()=>{
      const term=searchInput.value.trim().toLocaleLowerCase();results.innerHTML="";
      if(!term){results.textContent="Enter a wildcard name to find its location.";return;}
      try{
        const data=await post("/kruins/pbc/inventory",{root:s.root});
        const matches=(data.inventory?.files||[]).filter(path=>path.split("/").pop().replace(/\.txt$/i,"").toLocaleLowerCase().includes(term));
        results.append(E("div","kp-help",`${matches.length} matching wildcard(s)`));
        for(const path of matches){
          const display=path.replace(/\.txt$/i,"");
          results.append(E("div","kp-search-result",display));
        }
      }catch(e){results.textContent="Search failed: "+e.message;}
    };
    searchInput.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runSearch();}});
    searchRow.append(searchInput,B("Search",runSearch,"primary"));
    body.append(E("div","kp-title","Find Wildcard"),searchRow,results);
    if(s.cur){let q=E("div","kp-row");q.append(B("← Root",()=>folder(""),"folder"),E("span","kp-path",s.cur));body.append(q)}
    if(s.edit){let tools=E("div","kp-row");tools.append(B("Manage Subdirectories",()=>folderManager(),"primary"));body.append(tools)}
    body.append(E("div","kp-title","Subfolders"));let fg=E("div","kp-grid");s.scan.folders.forEach(f=>fg.append(B("📁 "+f.name,()=>folder(f.path),"folder")));body.append(fg);
    body.append(E("div","kp-title","Wildcards"));let wg=E("div","kp-grid");s.scan.files.forEach(f=>{let b=B(f.name.replace(/^KR_/,""),async()=>{if(s.edit){let d=await post("/kruins/pbc/read",{root:s.root,path:f.path});editor(f,d.text)}else{ins(`__${f.path.replace(/\.txt$/i,"")}__`);s.last=f.path;render()}},"kp-chip");if(!s.edit&&s.last===f.path)b.classList.add("selected");wg.append(b)});body.append(wg);
    if(s.scan.folder_presets?.length){body.append(E("div","kp-title","Folder Prompt Presets"));let pg=E("div","kp-grid");s.scan.folder_presets.forEach(p=>pg.append(B(p.name,async()=>{let d=await post("/kruins/pbc/read",{root:s.root,path:p.path});ins(d.text)},"preset")));body.append(pg)}
    if(s.edit){let a=E("div","kp-row");let fi=document.createElement("input");fi.type="file";fi.multiple=true;fi.accept=".zip,.txt,.md";a.append(fi,B("Import",async()=>{if(!fi.files.length)return;let fd=new FormData();fd.append("root",s.root);fd.append("current",s.cur);[...fi.files].forEach(f=>fd.append("file",f));let rr=await api.fetchApi("/kruins/pbc/import",{method:"POST",body:fd});let d=await rr.json();s.scan=d.scan;alert(`${d.imported} file(s) imported`);render()},"primary"));body.append(a);
      let nw=E("div","kp-card"),nm=document.createElement("input"),tx=document.createElement("textarea");nm.placeholder="New wildcard filename";tx.placeholder="One value per line";nw.append(nm,tx,B("Create Wildcard",async()=>{let d=await post("/kruins/pbc/save-wildcard",{root:s.root,current:s.cur,name:nm.value,text:tx.value});s.scan=d.scan;render()},"primary"));body.append(nw)}
  }
  function folderManager(){
    body.innerHTML="";editSlot.innerHTML="";
    body.append(E("div","kp-title","Subdirectory Manager"));
    body.append(E("div","kp-help","Create folders, or select a folder to rename or delete. Deleting a folder also deletes its contents after confirmation."));
    let row=E("div","kp-row"),name=document.createElement("input");name.placeholder="New subdirectory name";
    row.append(name,B("Create",async()=>{try{await post("/kruins/pbc/folders/create",{root:s.root,current:s.cur,name:name.value});await folder(s.cur)}catch(e){alert(/409|already exists|Destination already exists/i.test(e.message)?"Folder Already Exists":e.message)}} ,"primary"));body.append(row);
    let list=E("div","kp-grid");
    for(const f of s.scan.folders){list.append(B("📁 "+f.name,()=>folderAction(f),"folder"))}
    body.append(E("div","kp-title","Select subdirectory to rename or delete"),list,B("Back",()=>render()));
  }
  function folderAction(f){
    body.innerHTML="";editSlot.innerHTML="";
    body.append(E("div","kp-title","Manage: "+f.name));
    let row=E("div","kp-row"),nm=document.createElement("input");nm.value=f.name;
    row.append(nm,B("Rename",async()=>{
      try{
        const payload={root:s.root,path:f.path,name:nm.value};
        const preview=await post("/kruins/pbc/folders/preview",payload);
        body.innerHTML="";
        body.append(E("div","kp-title",`Rename ${preview.old} → ${preview.new}`));
        body.append(E("div","kp-help",`${preview.files.length} wildcard file(s), ${preview.references} reference(s) point to the old folder path.`));
        if(preview.files.length){let details=E("div","kp-card");preview.files.forEach(x=>details.append(E("div","kp-help",`${x.path} (${x.count})`)));body.append(details)}
        body.append(E("div","kp-help","Update only matching __folder/file__ wildcard references? No leaves all other files untouched."));
        let actions=E("div","kp-row");
        const finish=async(update)=>{try{await post("/kruins/pbc/folders/rename",{...payload,update_references:update});await folder(s.cur)}catch(e){alert(/409|already exists|Destination already exists/i.test(e.message)?"Folder Already Exists":e.message)}};
        actions.append(B("Yes, update references",()=>finish(true),"primary"),B("No, rename only",()=>{if(confirm("Rename folder without updating references? Existing wildcard references may stop working."))finish(false)}),B("Cancel",()=>folderManager()));body.append(actions);
      }catch(e){alert(/409|already exists|Destination already exists/i.test(e.message)?"Folder Already Exists":e.message)}
    },"primary"),B("Delete",async()=>{
      try{
        const payload={root:s.root,current:s.cur,path:f.path};
        const info=await post("/kruins/pbc/folders/delete-preview",payload);
        if(!confirm(`Permanently delete "${f.name}" and everything inside it?\n${info.files} files and ${info.folders} subfolders will be deleted.\nThis cannot be undone.`))return;
        await post("/kruins/pbc/folders/delete",payload);await folder(s.cur);
      }catch(e){alert(/403|forbidden|access is denied|permissionerror|winerror 5/i.test(e.message)?"Access Denied: Windows prevented deletion of this folder. Check folder permissions or OneDrive protection.":/409|already exists|Destination already exists/i.test(e.message)?"Folder Already Exists":e.message)}
    },"danger"));
    body.append(row,B("Back",()=>folderManager()));
  }
  function editor(f,text){
    body.innerHTML="";body.classList.add("kp-editor-view");
    editSlot.innerHTML="";editSlot.classList.add("kp-editor-actions");
    body.append(E("div","kp-title","Edit "+f.name));
    let ta=document.createElement("textarea");ta.className="kp-editor";ta.value=text;body.append(ta);
    let r=E("div","kp-row");r.append(B("Save Changes",async()=>{await post("/kruins/pbc/save-wildcard",{root:s.root,current:s.cur,name:f.path.split("/").pop(),text:ta.value});await folder(s.cur)},"primary"),
      B("Delete File",async()=>{if(confirm(`Delete ${f.name}.txt?`)){let d=await post("/kruins/pbc/delete-wildcards",{root:s.root,current:s.cur,paths:[f.path]});s.scan=d.scan;render()}},"danger"),B("Cancel",()=>render()));
    editSlot.append(r);measurePBC();
  }
  function prompting(){
    const all=s.presets;
    body.append(E("div","kp-title",`Prompt Presets (${all.length})`));
    const g=E("div","kp-grid");
    all.forEach((p,i)=>{
      const b=B(p.name,()=>{
        if(s.edit){s.presetSelected=i;render();}
        else {ins(p.body);s.presetActive=i;render();}
      },"preset");
      if((s.edit?s.presetSelected:s.presetActive)===i)b.classList.add("selected");
      g.append(b);
    });
    body.append(g);
    if(s.edit){
      const selected=s.presetSelected>=0&&s.presetSelected<all.length?s.presetSelected:-1;
      const r=E("div","kp-row");
      r.append(B("Add New Preset",()=>{s.presetSelected=-1;render()},selected<0?"primary":""));
      body.append(r);
      presetForm(selected,selected>=0?all[selected]:{name:"",body:""});
    }
  }
  function presetForm(idx,p){
    const c=E("div","kp-card"),nm=document.createElement("input"),ta=document.createElement("textarea");
    c.append(E("div","kp-title",idx>=0?"Edit Prompt Preset":"New Prompt Preset"));
    nm.placeholder="Preset button name (25 characters max)";
    nm.maxLength=25;nm.value=p.name||"";
    ta.placeholder="Paste or type your full prompt here (no character limit)";
    ta.value=p.body||"";ta.style.width="100%";ta.style.minHeight="210px";
    c.append(nm,ta);
    const controls=E("div","kp-row");
    controls.append(B("Save Prompt",async()=>{
      const name=nm.value.trim();
      if(!name){alert("Enter a preset button name.");return;}
      if(name.length>25){alert("Preset names must be 25 characters or fewer.");return;}
      const duplicate=s.presets.some((x,i)=>i!==idx&&x.name.toLowerCase()===name.toLowerCase());
      if(duplicate){alert("A preset with that name already exists.");return;}
      const updated=s.presets.map(x=>({...x}));
      const entry={name,body:ta.value};
      if(idx>=0)updated[idx]=entry;else updated.push(entry);
      try{const result=await post("/kruins/pbc/presets",{presets:updated});s.presets=result.presets||updated;s.presetSelected=idx>=0?idx:s.presets.length-1;render();}
      catch(e){alert("Could not save prompt: "+e.message)}
    },"primary"));
    // Import a local UTF-8 TXT prompt and save it as a new preset.
    const importFile=document.createElement("input");
    importFile.type="file";importFile.accept=".txt,text/plain";importFile.style.display="none";
    importFile.addEventListener("change",async()=>{
      const file=importFile.files?.[0];if(!file)return;
      try{
        if(!/\.txt$/i.test(file.name)){alert("Choose a .txt prompt file.");return;}
        const name=file.name.replace(/\.txt$/i,"").trim().slice(0,25);
        if(!name){alert("The TXT filename must contain a preset name.");return;}
        if(s.presets.some(x=>x.name.toLowerCase()===name.toLowerCase())){
          alert(`A preset named "${name}" already exists. Rename the TXT file or preset first.`);return;
        }
        const bodyText=await file.text();
        const updated=[...s.presets.map(x=>({...x})),{name,body:bodyText}];
        const result=await post("/kruins/pbc/presets",{presets:updated});
        s.presets=result.presets||updated;s.presetSelected=s.presets.length-1;render();
      }catch(e){alert("Could not import TXT prompt: "+e.message)}
      finally{importFile.value="";}
    });
    controls.append(B("Import TXT",()=>importFile.click()),importFile);
    if(idx>=0)controls.append(B("Delete Selected",async()=>{
      if(!confirm(`Delete prompt preset "${p.name}"?`))return;
      const updated=s.presets.filter((_,i)=>i!==idx);
      try{const result=await post("/kruins/pbc/presets",{presets:updated});s.presets=result.presets||updated;s.presetSelected=-1;s.presetActive=-1;render();}
      catch(e){alert("Could not delete preset: "+e.message)}
    },"danger"));
    body.append(c);
    // Keep preset actions in the non-scrolling action slot, like Wild Cards editing.
    editSlot.classList.add("kp-editor-actions");
    editSlot.append(controls);
  }
  function render(){body.classList.remove("kp-editor-view");editSlot.classList.remove("kp-editor-actions");body.innerHTML="";editSlot.innerHTML="";foot.innerHTML="";head.textContent=s.edit?"EDIT MODE":"PROMPT READY";head.className="kp-status "+(s.edit?"edit":"");nav();if(s.tab==="keywords")keywords();else if(s.tab==="wildcards")wildcards();else prompting();
    foot.append(
      (()=>{const b=B(targetNode?`Target: ${targetNode.title||targetNode.type}`:"Target Selected",chooseTarget,targetNode?"primary":"");if(!targetNode){const h=document.createElement("span");h.className="kp-target-hint";h.textContent="(Select Text Encoder first)";b.appendChild(h)}return b})(),
      B("Clear Target",()=>{targetNode=null;targetWidget=null;targetInput=null;lastSelStart=lastSelEnd=null;render()}),
      B("Undo",()=>{if(s.hist.length)setPrompt(s.hist.pop(),false)}),
      B("Copy",()=>navigator.clipboard?.writeText(currentText())),
      B(s.edit?"Save":"Edit",()=>{s.edit=!s.edit;s.del.clear();s.presetSelected=-1;render()},s.edit?"primary":"")
    );measurePBC()}
  get("/kruins/pbc/state").then(d=>{s.root=d.root;s.keywords=d.keywords;s.presets=d.presets;s.scan=d.scan;refreshCounts().then(()=>render()).catch(()=>render())}).catch(e=>{body.textContent="PBC load error: "+e.message});
 }}});
