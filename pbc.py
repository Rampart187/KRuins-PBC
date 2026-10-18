import json, os, re, shutil, subprocess, sys, zipfile, stat
from pathlib import Path
import folder_paths
from aiohttp import web
from server import PromptServer

HERE=Path(__file__).parent
DATA=HERE/"data"; DATA.mkdir(exist_ok=True)
CFG=DATA/"settings.json"; PRESETS=DATA/"prompt_presets.json"
COMFY=Path(folder_paths.base_path)
DEFAULT=["photorealistic","DSLR photo","cinematic","portrait","landscape","close-up","medium shot","full body","three-quarter angle","eye-level","low angle","high angle","shallow depth of field","sharp focus","natural lighting","dramatic lighting","soft lighting","golden hour","high detail","realistic skin texture","35mm lens","50mm lens","85mm lens","studio lighting","volumetric lighting"]

def readj(p,d):
    try:return json.loads(p.read_text("utf-8")) if p.exists() else d
    except:return d
def writej(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,ensure_ascii=False),"utf-8")
def root(v=None):
    c=readj(CFG,{})
    return Path(v or c.get("wildcard_root") or COMFY/"wildcards").expanduser().resolve()
def safe(rt,rel=""):
    rt=root(rt);p=(rt/rel).resolve()
    try:p.relative_to(rt)
    except:raise ValueError("Path outside wildcard root")
    return p
def kwfile(rt):return root(rt)/"KR_keywords.json"
def kws(rt):
    f=kwfile(rt);v=readj(f,None)
    if isinstance(v,list):return v
    f.parent.mkdir(parents=True,exist_ok=True);writej(f,DEFAULT);return DEFAULT[:]
def scan(rt,cur=""):
    rt=root(rt);rt.mkdir(parents=True,exist_ok=True);p=safe(rt,cur);p.mkdir(parents=True,exist_ok=True)
    rel=lambda x:x.relative_to(rt).as_posix()
    folders=sorted([{"name":x.name,"path":rel(x)} for x in p.iterdir() if x.is_dir()],key=lambda x:x["name"].lower())
    files=sorted([{"name":x.stem,"path":rel(x)} for x in p.iterdir() if x.is_file() and x.suffix.lower()==".txt"],key=lambda x:x["name"].lower())
    pp=[]
    for x in p.iterdir():
        if x.is_file() and x.suffix.lower()==".md":
            pp.append({"name":re.sub(r"^PP[_ -]*","",x.stem,flags=re.I) or x.stem,"path":rel(x)})
    return {"root":str(rt),"current":"" if p==rt else rel(p),"folders":folders,"files":files,"folder_presets":sorted(pp,key=lambda x:x["name"].lower())}

class KRuinsPBC:
    @classmethod
    def INPUT_TYPES(cls):return {"required":{"prompt":("STRING",{"multiline":True,"default":""})}}
    RETURN_TYPES=(); FUNCTION="run"; CATEGORY="KRuins"; OUTPUT_NODE=True
    def run(self,prompt): return {}
NODE_CLASS_MAPPINGS={"KRuinsPBC":KRuinsPBC}
NODE_DISPLAY_NAME_MAPPINGS={"KRuinsPBC":"KRuins - Prompt Building Companion"}

R=PromptServer.instance.routes
@R.get("/kruins/pbc/state")
async def state(q):
    rt=root();rt.mkdir(parents=True,exist_ok=True)
    return web.json_response({"root":str(rt),"keywords":kws(rt),"presets":readj(PRESETS,[]),"scan":scan(rt)})
@R.post("/kruins/pbc/root")
async def setroot(q):
    d=await q.json();rt=root(d["root"]);rt.mkdir(parents=True,exist_ok=True);writej(CFG,{"wildcard_root":str(rt)})
    return web.json_response({"root":str(rt),"scan":scan(rt)})
@R.post("/kruins/pbc/inventory")
async def inventory(q):
    d=await q.json();rt=root(d.get("root"));rt.mkdir(parents=True,exist_ok=True)
    folders=[];files=[]
    for base, dirs, names in os.walk(rt):
        dirs[:]=[x for x in dirs if not (Path(base)/x).is_symlink()]
        for name in dirs:folders.append((Path(base)/name).relative_to(rt).as_posix())
        for name in names:
            if name.lower().endswith(".txt"):
                files.append((Path(base)/name).relative_to(rt).as_posix())
    return web.json_response({"inventory":{"folders":sorted(folders),"files":sorted(files)}})

@R.post("/kruins/pbc/scan")
async def rescan(q):
    d=await q.json();return web.json_response({"scan":scan(d.get("root"),d.get("current",""))})
@R.post("/kruins/pbc/keywords")
async def savekw(q):
    d=await q.json();vals=[];seen=set()
    for x in d.get("keywords",[]):
        x=str(x).strip()
        if x and x.lower() not in seen:vals.append(x);seen.add(x.lower())
    writej(kwfile(d.get("root")),vals);return web.json_response({"keywords":vals})
@R.post("/kruins/pbc/read")
async def readfile(q):
    d=await q.json();p=safe(d.get("root"),d["path"])
    return web.json_response({"text":p.read_text("utf-8",errors="replace")})
@R.post("/kruins/pbc/save-wildcard")
async def savewc(q):
    d=await q.json();rt=root(d.get("root"));name=str(d.get("name","")).strip()
    if not name.lower().endswith(".txt"):name+=".txt"
    if not re.fullmatch(r"[A-Za-z0-9_. -]+\.txt",name,re.I):raise web.HTTPBadRequest(text="Invalid filename")
    p=safe(rt,str(Path(d.get("current",""))/name));p.parent.mkdir(parents=True,exist_ok=True);p.write_text(str(d.get("text","")),"utf-8")
    return web.json_response({"scan":scan(rt,d.get("current",""))})
@R.post("/kruins/pbc/delete-wildcards")
async def deletewc(q):
    d=await q.json();rt=root(d.get("root"))
    for r in d.get("paths",[]):
        p=safe(rt,r)
        if p.is_file() and p.suffix.lower()==".txt":p.unlink()
    return web.json_response({"scan":scan(rt,d.get("current",""))})
@R.post("/kruins/pbc/presets")
async def savepr(q):
    d=await q.json();v=[{"name":str(x.get("name","")).strip(),"body":str(x.get("body",""))} for x in d.get("presets",[]) if 0<len(str(x.get("name","")).strip())<=25]
    writej(PRESETS,v);return web.json_response({"presets":v})
@R.post("/kruins/pbc/choose-folder")
async def choose_folder(q):
    # A native Windows folder-selection dialog, not an Explorer browsing window.
    import asyncio
    d=await q.json()
    current=str(root(d.get("root")))
    if not sys.platform.startswith("win"):
        return web.json_response({"error":"Native folder selection requires Windows"},status=400)
    # Modern Vista/Windows 11 Common Item Dialog using IFileOpenDialog + FOS_PICKFOLDERS.
    # No legacy FolderBrowserDialog and no plain Explorer window.
    script=r'''
Add-Type -AssemblyName System.Windows.Forms
$source = @"
using System;
using System.Runtime.InteropServices;
[ComImport, Guid("DC1C5A9C-E88A-4DDE-A5A1-60F82A20AEF7")]
public class FileOpenDialogRCW { }
[ComImport, Guid("42F85136-DB7E-439C-85F1-E4075D135FC8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IFileDialog {
 [PreserveSig] int Show(IntPtr parent);
 void SetFileTypes(uint count, IntPtr filters);
 void SetFileTypeIndex(uint index);
 void GetFileTypeIndex(out uint index);
 void Advise(IntPtr events, out uint cookie);
 void Unadvise(uint cookie);
 void SetOptions(uint options);
 void GetOptions(out uint options);
 void SetDefaultFolder(IShellItem folder);
 void SetFolder(IShellItem folder);
 void GetFolder(out IShellItem folder);
 void GetCurrentSelection(out IShellItem item);
 void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string name);
 void GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string name);
 void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string title);
 void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string label);
 void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string label);
 void GetResult(out IShellItem item);
 void AddPlace(IShellItem item, int location);
 void SetDefaultExtension([MarshalAs(UnmanagedType.LPWStr)] string extension);
 void Close(int hr);
 void SetClientGuid(ref Guid guid);
 void ClearClientData();
 void SetFilter(IntPtr filter);
}
[ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IShellItem {
 void BindToHandler(IntPtr pbc, ref Guid bhid, ref Guid riid, out IntPtr ppv);
 void GetParent(out IShellItem parent);
 void GetDisplayName(uint sigdnName, [MarshalAs(UnmanagedType.LPWStr)] out string name);
 void GetAttributes(uint mask, out uint attributes);
 void Compare(IShellItem other, uint hint, out int order);
}
public static class ModernFolderPicker {
 [DllImport("shell32.dll", CharSet=CharSet.Unicode, PreserveSig=true)]
 static extern int SHCreateItemFromParsingName(string path, IntPtr binding, ref Guid riid, out IShellItem item);
 public static string Pick(string initial) {
  var dialog=(IFileDialog)new FileOpenDialogRCW();
  try {
   uint options; dialog.GetOptions(out options);
   dialog.SetOptions(options | 0x20u | 0x40u); // PICKFOLDERS + FORCEFILESYSTEM
   dialog.SetTitle("Select PBC wildcard root folder");
   dialog.SetOkButtonLabel("Select Folder");
   if (System.IO.Directory.Exists(initial)) {
    var iid=new Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE");
    IShellItem folder;
    if (SHCreateItemFromParsingName(initial,IntPtr.Zero,ref iid,out folder)==0) {
     try { dialog.SetFolder(folder); } finally { Marshal.ReleaseComObject(folder); }
    }
   }
   // Dialog is a foreground top-level native window (not an Explorer browser).
   using (var owner = new System.Windows.Forms.Form()) {
     owner.Text = "K Ruins PBC Folder Picker";
     owner.ShowInTaskbar = false;
     owner.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
     owner.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
     owner.Size = new System.Drawing.Size(1, 1);
     owner.Opacity = 0.01;
     owner.TopMost = true;
     owner.Show();
     owner.Activate();
     int hr=dialog.Show(owner.Handle);
     if (hr==unchecked((int)0x800704C7)) return "";
     if (hr!=0) Marshal.ThrowExceptionForHR(hr);
    }
   IShellItem result; dialog.GetResult(out result);
   try { string path; result.GetDisplayName(0x80058000u,out path); return path; }
   finally { Marshal.ReleaseComObject(result); }
  } finally { Marshal.ReleaseComObject(dialog); }
 }
}
"@
Add-Type -TypeDefinition $source -ReferencedAssemblies "System.Windows.Forms", "System.Drawing" -ErrorAction Stop
[Console]::Write([ModernFolderPicker]::Pick($env:KR_PBC_INITIAL))
'''
    def run_picker():
        env=os.environ.copy();env["KR_PBC_INITIAL"]=current
        return subprocess.run(["powershell.exe","-NoProfile","-STA","-Command",script],env=env,capture_output=True,text=True,timeout=120)
    try:
        result=await asyncio.to_thread(run_picker)
        if result.returncode:raise RuntimeError(result.stderr.strip() or "Picker failed")
        selected=result.stdout.strip()
        if not selected:return web.json_response({"cancelled":True})
        path=Path(selected)
        if not path.is_dir():raise ValueError("Selected folder does not exist")
        return web.json_response({"root":str(path),"cancelled":False})
    except Exception as e:
        return web.json_response({"error":str(e)},status=500)

@R.post("/kruins/pbc/open-folder")
async def openfolder(q):
    d=await q.json();p=safe(d.get("root"),d.get("current",""))
    if sys.platform.startswith("win"):
        os.startfile(str(p))
        # Best-effort Windows foreground activation, targeting Explorer windows
        # by their process ID and folder title. Windows may still deny focus.
        import threading, time, ctypes
        def bring_forward():
            try:
                from ctypes import wintypes
                user32=ctypes.windll.user32
                kernel32=ctypes.windll.kernel32
                user32.EnumWindows.argtypes=[ctypes.c_void_p, wintypes.LPARAM]
                user32.GetWindowThreadProcessId.argtypes=[wintypes.HWND,ctypes.POINTER(wintypes.DWORD)]
                user32.GetWindowThreadProcessId.restype=wintypes.DWORD
                user32.SetForegroundWindow.argtypes=[wintypes.HWND]
                user32.SetForegroundWindow.restype=wintypes.BOOL
                user32.AttachThreadInput.argtypes=[wintypes.DWORD,wintypes.DWORD,wintypes.BOOL]
                user32.AttachThreadInput.restype=wintypes.BOOL
                user32.GetForegroundWindow.restype=wintypes.HWND
                user32.GetWindowTextW.argtypes=[wintypes.HWND,wintypes.LPWSTR,ctypes.c_int]
                CALLBACK=ctypes.WINFUNCTYPE(wintypes.BOOL,wintypes.HWND,wintypes.LPARAM)
                title=p.name.lower()
                for delay in (0.15,0.3,0.5,0.8,1.2):
                    time.sleep(delay)
                    found=[]
                    def inspect(hwnd,unused):
                        if not user32.IsWindowVisible(hwnd):return True
                        buf=ctypes.create_unicode_buffer(512)
                        user32.GetWindowTextW(hwnd,buf,512)
                        name=buf.value.lower()
                        if name==title or name.startswith(title+" - ") or name.endswith(" - "+title):
                            found.append(hwnd)
                        return True
                    user32.EnumWindows(CALLBACK(inspect),0)
                    if not found:continue
                    hwnd=found[-1]
                    foreground=user32.GetForegroundWindow()
                    current_tid=kernel32.GetCurrentThreadId()
                    foreground_tid=user32.GetWindowThreadProcessId(foreground,None) if foreground else 0
                    attached=False
                    try:
                        if foreground_tid and foreground_tid!=current_tid:
                            attached=bool(user32.AttachThreadInput(current_tid,foreground_tid,True))
                        user32.ShowWindow(hwnd,9)
                        user32.BringWindowToTop(hwnd)
                        user32.SetForegroundWindow(hwnd)
                    finally:
                        if attached:user32.AttachThreadInput(current_tid,foreground_tid,False)
                    if user32.GetForegroundWindow()==hwnd:break
            except Exception:
                pass
        threading.Thread(target=bring_forward,daemon=True).start()
    elif sys.platform=="darwin":subprocess.Popen(["open",str(p)])
    else:subprocess.Popen(["xdg-open",str(p)])
    return web.json_response({"ok":True})
@R.post("/kruins/pbc/import")
async def importpack(q):
    rd=await q.multipart();rt=root();cur="";uploads=[]
    async for part in rd:
        if part.name=="root":rt=root((await part.text()).strip())
        elif part.name=="current":cur=(await part.text()).strip()
        elif part.name=="file":
            name=Path(part.filename or "upload").name;tmp=DATA/("upload_"+name)
            with open(tmp,"wb") as f:
                while True:
                    c=await part.read_chunk()
                    if not c:break
                    f.write(c)
            uploads.append((tmp,name))
    count=0
    for tmp,name in uploads:
        dest=safe(rt,cur);dest.mkdir(parents=True,exist_ok=True)
        try:
            if tmp.suffix.lower()==".zip":
                with zipfile.ZipFile(tmp) as z:
                    infos=z.infolist()
                    if len(infos)>5000 or sum(max(0,i.file_size) for i in infos)>250*1024*1024:raise web.HTTPBadRequest(text="ZIP too large")
                    for i in infos:
                        n=i.filename.replace("\\","/")
                        if i.is_dir() or Path(n).suffix.lower() not in {".txt",".md",".json"}:continue
                        if n.startswith("/") or ".." in Path(n).parts:raise web.HTTPBadRequest(text="Unsafe ZIP path")
                        parts=list(Path(n).parts)
                        if parts and parts[0].lower()=="wildcards":parts=parts[1:]
                        if not parts:continue
                        out=safe(rt,str(Path(cur).joinpath(*parts)));out.parent.mkdir(parents=True,exist_ok=True)
                        if out.exists():continue
                        with z.open(i) as a,open(out,"wb") as b:shutil.copyfileobj(a,b)
                        count+=1
            elif tmp.suffix.lower() in {".txt",".md"}:
                out=safe(rt,str(Path(cur)/name))
                if not out.exists():shutil.copy2(tmp,out);count+=1
        finally:tmp.unlink(missing_ok=True)
    return web.json_response({"imported":count,"scan":scan(rt,cur)})


# Subdirectory manager: operate only inside the configured wildcard root.
def valid_folder_name(name):
    name=str(name).strip()
    if not name or name in (".","..") or not re.fullmatch(r"[A-Za-z0-9 _.-]{1,100}",name) or name.endswith((" ",".")):
        raise web.HTTPBadRequest(text="Invalid folder name")
    return name

def folder_path(rt, rel):
    if not rel or rel in (".","/"):
        raise web.HTTPBadRequest(text="Cannot modify wildcard root")
    p=safe(rt,rel)
    if p==root(rt) or p.is_symlink():
        raise web.HTTPBadRequest(text="Cannot modify root or symbolic links")
    return p

def references_to_folder(rt, old_rel):
    # Only replace wildcard tokens of the form __folder/name__ or __folder/sub/name__.
    # Avoid arbitrary prose and avoid partial prefix matches.
    pattern=re.compile(r"__("+re.escape(old_rel)+r")(?=/|__)",re.I)
    found=[]
    for f in rt.rglob("*.txt"):
        if f.is_symlink():continue
        try:
            content=f.read_text("utf-8")
        except (OSError,UnicodeError):continue
        n=len(pattern.findall(content))
        if n:found.append({"path":f.relative_to(rt).as_posix(),"count":n})
    return found

@R.post("/kruins/pbc/folders/preview")
async def preview_folder_rename(q):
    d=await q.json();rt=root(d.get("root"));old=folder_path(rt,d.get("path",""))
    if not old.is_dir():raise web.HTTPBadRequest(text="Folder not found")
    newname=valid_folder_name(d.get("name",""));new=old.with_name(newname)
    if new.exists() and new!=old:raise web.HTTPConflict(text="Destination already exists")
    oldrel=old.relative_to(rt).as_posix();newrel=new.relative_to(rt).as_posix()
    refs=references_to_folder(rt,oldrel)
    return web.json_response({"old":oldrel,"new":newrel,"files":refs,"references":sum(x["count"] for x in refs)})

@R.post("/kruins/pbc/folders/create")
async def create_folder(q):
    d=await q.json();rt=root(d.get("root"));parent=safe(rt,d.get("current",""));name=valid_folder_name(d.get("name",""))
    if not parent.is_dir():raise web.HTTPBadRequest(text="Parent folder missing")
    dest=safe(rt,(parent/name).relative_to(rt).as_posix())
    if dest.exists():raise web.HTTPConflict(text="Folder already exists")
    dest.mkdir();return web.json_response({"scan":scan(rt,d.get("current",""))})

@R.post("/kruins/pbc/folders/delete-preview")
async def delete_folder_preview(q):
    d=await q.json();rt=root(d.get("root"));p=folder_path(rt,d.get("path",""))
    if not p.is_dir():raise web.HTTPBadRequest(text="Folder not found")
    if any(x.is_symlink() for x in p.rglob("*")):
        raise web.HTTPBadRequest(text="Folder contains symbolic links; delete cancelled")
    children=list(p.rglob("*"))
    return web.json_response({"files":sum(x.is_file() for x in children),"folders":sum(x.is_dir() for x in children)})

@R.post("/kruins/pbc/folders/delete")
async def delete_folder(q):
    d=await q.json();rt=root(d.get("root"));p=folder_path(rt,d.get("path",""))
    if not p.is_dir():raise web.HTTPBadRequest(text="Folder not found")
    # Explicit recursive deletion, restricted to a selected non-root folder.
    # Refuse symlinks anywhere in the subtree rather than following external targets.
    if any(x.is_symlink() for x in p.rglob("*")):
        raise web.HTTPBadRequest(text="Folder contains symbolic links; delete cancelled")
    def retry_readonly(func, failed_path, exc):
        # Windows read-only attributes can prevent shutil.rmtree from deleting
        # folders/files, particularly in synced Desktop directories. Retry only
        # the exact failed operation, without following symlinks.
        if not isinstance(exc, PermissionError):
            raise exc
        target=Path(failed_path)
        if target.is_symlink():
            raise exc
        try:
            mode=target.stat(follow_symlinks=False).st_mode
            target.chmod(mode | stat.S_IWRITE)
            func(failed_path)
        except OSError:
            raise exc
    try:
        shutil.rmtree(p, onexc=retry_readonly)
    except PermissionError:
        raise web.HTTPForbidden(text="Access denied. Windows or OneDrive is preventing PBC from deleting this folder. Close any files using it and check OneDrive protection.")
    return web.json_response({"scan":scan(rt,d.get("current",""))})

@R.post("/kruins/pbc/folders/rename")
async def rename_folder(q):
    d=await q.json();rt=root(d.get("root"));old=folder_path(rt,d.get("path",""))
    if not old.is_dir():raise web.HTTPBadRequest(text="Folder not found")
    newname=valid_folder_name(d.get("name",""));new=old.with_name(newname)
    if new.exists() and new!=old:raise web.HTTPConflict(text="Destination already exists")
    oldrel=old.relative_to(rt).as_posix();newrel=new.relative_to(rt).as_posix()
    update=d.get("update_references") is True
    refs=references_to_folder(rt,oldrel) if update else []
    # Snapshot affected files before writing. No unrelated text is replaced.
    pattern=re.compile(r"__("+re.escape(oldrel)+r")(?=/|__)",re.I)
    staged=[]
    for entry in refs:
        f=safe(rt,entry["path"]);before=f.read_text("utf-8")
        after=pattern.sub(lambda m:"__"+newrel,before)
        staged.append((f,before,after))
    if new!=old:old.rename(new)
    written=[]
    try:
        for f,before,after in staged:
            target=(new/f.relative_to(old)) if f.is_relative_to(old) else f
            target.write_text(after,"utf-8");written.append((target,before))
    except Exception:
        for f,before in reversed(written):f.write_text(before,"utf-8")
        if new!=old:new.rename(old)
        raise
    return web.json_response({"scan":scan(rt,d.get("current","")),"updated_files":len(staged),"updated_references":sum(x["count"] for x in refs)})
