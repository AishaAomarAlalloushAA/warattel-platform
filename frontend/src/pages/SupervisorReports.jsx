import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { supervisorService } from "../services/supervisorService";
import { toast } from "../ui/toast";
import "./SupervisorPortal.css";

const emptyForm = { id:null, student_id:"", report_date:"", start_page:1, quantity:1, errors:[] };

function SupervisorReports() {
  const [students,setStudents]=useState([]); const [options,setOptions]=useState({errors:[],supervisors:[]}); const [reports,setReports]=useState([]);
  const [form,setForm]=useState(emptyForm); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [saving,setSaving]=useState(false); const [showForm,setShowForm]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true); setError("");
    try{
      const [studentResult,optionResult,reportResult]=await Promise.all([supervisorService.students(),supervisorService.options(),supervisorService.reports({per_page:100})]);
      setStudents(studentResult.items||[]); setOptions(optionResult||{}); setReports(reportResult.items||[]);
    }catch(err){setError(err.message||"تعذر تحميل التقارير.");}finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const edit=(report)=>{ setForm({id:report.id,student_id:String(report.student_id||""),report_date:report.report_date||"",start_page:report.start_page||1,quantity:report.quantity||1,errors:(report.errors||[]).map((item)=>({error_id:item.error_id||"",word:item.word||"",details:item.details||""}))}); setShowForm(true); };
  const addError=()=>setForm((current)=>({...current,errors:[...current.errors,{error_id:"",word:"",details:""}]}));
  const updateError=(index,key,value)=>setForm((current)=>({...current,errors:current.errors.map((item,i)=>i===index?{...item,[key]:value}:item)}));
  const removeError=(index)=>setForm((current)=>({...current,errors:current.errors.filter((_,i)=>i!==index)}));

  const save=async(event)=>{
    event.preventDefault();
    if(!form.student_id||!form.report_date||!form.start_page||!form.quantity){toast.warning("يرجى تعبئة الحقول المطلوبة.");return;}
    setSaving(true);
    try{
      const ownSupervisor=options.supervisors?.[0]?.id;
      await supervisorService.saveReport({...form,student_id:Number(form.student_id),supervisor_id:ownSupervisor,start_page:Number(form.start_page),quantity:Number(form.quantity),errors:form.errors.map((item)=>({...item,error_id:item.error_id?Number(item.error_id):null}))});
      toast.success(form.id?"تم تحديث التقرير بنجاح.":"تمت إضافة التقرير بنجاح."); setForm(emptyForm); setShowForm(false); await load();
    }catch(err){toast.error(err.message||"تعذر حفظ التقرير.");}finally{setSaving(false);}
  };

  const remove=async(id)=>{ if(!window.confirm("هل تريد حذف التقرير؟"))return; try{await supervisorService.deleteReport(id);toast.success("تم حذف التقرير.");await load();}catch(err){toast.error(err.message);} };

  if(loading)return <LoadingState label="جاري تحميل التقارير..."/>;
  if(error)return <ErrorState message={error} onRetry={load}/>;

  return <section className="supervisor-page">
    <header className="supervisor-page__heading"><div><span className="supervisor-kicker">التسميع</span><h1>تقارير التسميع</h1><p>يمكنك إضافة وتعديل تقارير طلابك المعيّنين لك فقط.</p></div><button className="supervisor-primary" onClick={()=>{setForm(emptyForm);setShowForm((v)=>!v);}}><FaPlus/> إضافة تقرير</button></header>
    {showForm&&<div className="supervisor-card"><form className="supervisor-form" onSubmit={save}><div className="supervisor-form-grid">
      <label className="supervisor-field"><span>الطالب</span><select value={form.student_id} onChange={(e)=>setForm({...form,student_id:e.target.value})}><option value="">اختر الطالب</option>{students.map((student)=><option key={student.id} value={student.id}>{student.person?.full_name}</option>)}</select></label>
      <label className="supervisor-field"><span>التاريخ</span><input type="date" value={form.report_date} onChange={(e)=>setForm({...form,report_date:e.target.value})}/></label>
      <label className="supervisor-field"><span>صفحة البداية</span><input type="number" min="1" max="604" value={form.start_page} onChange={(e)=>setForm({...form,start_page:e.target.value})}/></label>
      <label className="supervisor-field"><span>عدد الصفحات</span><input type="number" min="1" max="604" value={form.quantity} onChange={(e)=>setForm({...form,quantity:e.target.value})}/></label>
    </div>
    <div className="supervisor-actions"><button type="button" className="supervisor-secondary" onClick={addError}>إضافة خطأ</button></div>
    {form.errors.map((item,index)=><div className="supervisor-form-grid" key={index}>
      <label className="supervisor-field"><span>نوع الخطأ</span><select value={item.error_id} onChange={(e)=>updateError(index,"error_id",e.target.value)}><option value="">اختر النوع</option>{(options.errors||[]).map((error)=><option key={error.id} value={error.id}>{error.label}</option>)}</select></label>
      <label className="supervisor-field"><span>الكلمة / الموضع</span><input value={item.word} onChange={(e)=>updateError(index,"word",e.target.value)}/></label>
      <label className="supervisor-field"><span>ملاحظات</span><input value={item.details} onChange={(e)=>updateError(index,"details",e.target.value)}/></label>
      <div className="supervisor-actions"><button type="button" className="supervisor-danger" onClick={()=>removeError(index)}>حذف الخطأ</button></div>
    </div>)}
    <div className="supervisor-actions"><button className="supervisor-primary" disabled={saving}>{saving?"جاري الحفظ...":"حفظ"}</button><button type="button" className="supervisor-secondary" onClick={()=>setShowForm(false)}>إلغاء</button></div>
    </form></div>}
    {!reports.length?<EmptyState title="لا توجد تقارير بعد"/>:<div className="supervisor-table-wrap"><table className="supervisor-table"><thead><tr><th>#</th><th>الطالب</th><th>التاريخ</th><th>المستوى</th><th>صفحة البداية</th><th>الكمية</th><th>الأخطاء</th><th>الإجراءات</th></tr></thead><tbody>{reports.map((report,index)=><tr key={report.id}><td>{index+1}</td><td>{report.student_name||"—"}</td><td>{report.report_date||"—"}</td><td>{report.level_label||"—"}</td><td>{report.start_page}</td><td>{report.quantity}</td><td>{report.errors?.length||0}</td><td><div className="supervisor-actions"><button className="supervisor-secondary" onClick={()=>edit(report)}><FaEdit/></button><button className="supervisor-danger" onClick={()=>remove(report.id)}><FaTrash/></button></div></td></tr>)}</tbody></table></div>}
  </section>;
}
export default SupervisorReports;
