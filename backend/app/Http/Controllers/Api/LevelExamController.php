<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LevelExam;
use App\Models\StudentLevel;
use App\Support\EnforcesGenderScope;
use App\Support\RestrictsSupervisorScope;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LevelExamController extends Controller
{
    use EnforcesGenderScope;
    use RestrictsSupervisorScope;

    public function index(Request $request)
    {
        $query = LevelExam::with(['studentLevel.student.person','studentLevel.level','targetLevel','supervisor.person'])
            ->orderByDesc('exam_date')->orderByDesc('id');
        $this->scopeStudentRelationByActorGender($query,$request,'studentLevel.student.person');
        if($this->isSupervisorActor($request)) $query->where('supervisor_id',$this->actorSupervisorId($request));
        if($request->filled('student_id')){
            $studentId=$request->integer('student_id');
            $studentLevel=StudentLevel::with('student')->where('student_id',$studentId)->latest('id')->firstOrFail();
            $this->ensureStudentLevelAccess($studentLevel->id,$request);
            $query->whereHas('studentLevel',fn($q)=>$q->where('student_id',$studentId));
        }
        if($request->filled('supervisor_id')){
            $requested=$this->resolvedSupervisorId($request->integer('supervisor_id'),$request);
            $query->where('supervisor_id',$requested);
        }
        $items=$query->paginate(min(max($request->integer('per_page',20),1),100));
        return response()->json(['data'=>collect($items->items())->values(),'meta'=>[
            'current_page'=>$items->currentPage(),'last_page'=>$items->lastPage(),'per_page'=>$items->perPage(),'total'=>$items->total(),
        ]]);
    }

    public function store(Request $request)
    {
        $data=$this->validated($request);
        $this->ensureStudentLevelAccess($data['student_level_id'],$request);
        $data['supervisor_id']=$this->resolvedSupervisorId($data['supervisor_id']??null,$request);
        $this->ensureSupervisorGender($data['supervisor_id'],$request);
        $exam=LevelExam::create($data);
        return response()->json(['message'=>'تمت إضافة سبر المستوى بنجاح.','data'=>$this->load($exam)],201);
    }

    public function show(Request $request, LevelExam $levelExam)
    {
        $this->ensureExamAccess($levelExam,$request);
        return response()->json(['data'=>$this->load($levelExam)]);
    }

    public function update(Request $request, LevelExam $levelExam)
    {
        $this->ensureExamAccess($levelExam,$request);
        $data=$this->validated($request,true);
        if(!empty($data['student_level_id'])) $this->ensureStudentLevelAccess($data['student_level_id'],$request);
        if($this->isSupervisorActor($request)) $data['supervisor_id']=$this->actorSupervisorId($request);
        $this->ensureSupervisorGender($data['supervisor_id']??null,$request);
        $levelExam->update($data);
        return response()->json(['message'=>'تم تحديث سبر المستوى بنجاح.','data'=>$this->load($levelExam->fresh())]);
    }

    public function destroy(Request $request, LevelExam $levelExam)
    {
        $this->ensureExamAccess($levelExam,$request);
        $levelExam->delete();
        return response()->json(['message'=>'تم حذف سبر المستوى بنجاح.']);
    }

    private function ensureStudentLevelAccess(int $studentLevelId, Request $request): void
    {
        $studentLevel=StudentLevel::with('student.person')->findOrFail($studentLevelId);
        abort_unless($studentLevel->student,404,'الطالب المرتبط بالمستوى غير موجود.');
        $this->ensureStudentGender($studentLevel->student,$request);
        $this->ensureAssignedStudent($studentLevel->student,$request);
    }

    private function ensureExamAccess(LevelExam $levelExam, Request $request): void
    {
        $levelExam->loadMissing('studentLevel.student.person');
        abort_unless($levelExam->studentLevel?->student,404,'الطالب المرتبط بالسبر غير موجود.');
        $this->ensureStudentGender($levelExam->studentLevel->student,$request);
        $this->ensureAssignedStudent($levelExam->studentLevel->student,$request);
        if($this->isSupervisorActor($request)) abort_unless((int)$levelExam->supervisor_id===$this->actorSupervisorId($request),403,'غير مسموح لك بتعديل سبر لمشرف آخر.');
    }

    private function load(LevelExam $levelExam): LevelExam
    {
        return $levelExam->load(['studentLevel.student.person','studentLevel.level','targetLevel','supervisor.person']);
    }

    private function validated(Request $request,bool $partial=false): array
    {
        $required=$partial?'sometimes':'required';
        return $request->validate([
            'student_level_id'=>[$required,'integer','exists:student_levels,id'],'target_level_id'=>['sometimes','nullable','integer','exists:levels,id'],
            'supervisor_id'=>[$partial?'sometimes':'required','nullable','integer','exists:supervisors,id'],'exam_date'=>[$required,'date'],
            'makharij_score'=>['sometimes','nullable','integer','min:0','max:100'],'ahkam_score'=>['sometimes','nullable','integer','min:0','max:100'],
            'fluency_score'=>['sometimes','nullable','integer','min:0','max:100'],'notes'=>['sometimes','nullable','string'],
            'decision'=>['sometimes','nullable',Rule::in(['promote','stay'])],
        ]);
    }
}
