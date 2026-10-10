<?php

namespace App\Http\Controllers\Api;

use App\Enums\ErrorType;
use App\Enums\ExamType;
use App\Http\Controllers\Controller;
use App\Models\Error;
use App\Models\Exam;
use App\Models\ExamError;
use App\Models\Student;
use App\Support\EnforcesGenderScope;
use App\Support\RestrictsSupervisorScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminPartExamController extends Controller
{
    use EnforcesGenderScope;
    use RestrictsSupervisorScope;

    public function index(Request $request)
    {
        $query = Exam::with(['studentLevel.student.person','studentLevel.level','supervisor.person','examErrors.error'])
            ->orderByDesc('exam_date')->orderByDesc('id');
        $this->scopeStudentRelationByActorGender($query, $request, 'studentLevel.student.person');
        if ($this->isSupervisorActor($request)) $query->where('supervisor_id', $this->actorSupervisorId($request));
        if ($request->filled('student_id')) {
            $student = Student::findOrFail($request->integer('student_id'));
            $this->ensureStudentGender($student, $request);
            $this->ensureAssignedStudent($student, $request);
            $query->whereHas('studentLevel', fn ($q) => $q->where('student_id', $student->id));
        }
        if ($request->filled('exam_type')) $query->where('exam_type', $request->string('exam_type'));
        $exams = $query->paginate(min(max($request->integer('per_page', 30), 1), 100));
        return response()->json([
            'data' => collect($exams->items())->map(fn (Exam $exam) => $this->payload($exam))->values(),
            'meta' => ['current_page'=>$exams->currentPage(),'last_page'=>$exams->lastPage(),'per_page'=>$exams->perPage(),'total'=>$exams->total()],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $student = Student::findOrFail($data['student_id']);
        $this->ensureStudentGender($student, $request);
        $this->ensureAssignedStudent($student, $request);
        $data['supervisor_id'] = $this->resolvedSupervisorId($data['supervisor_id'] ?? null, $request);
        $this->ensureSupervisorGender($data['supervisor_id'], $request);
        $exam = DB::transaction(function () use ($data) {
            $exam = Exam::create([
                'part'=>$data['part'],'quantity'=>$data['quantity'],'exam_type'=>$data['exam_type'],'exam_date'=>$data['exam_date'],
                'score'=>$data['score']??null,'result'=>$data['result']??null,'supervisor_id'=>$data['supervisor_id'],
                'student_level_id'=>$this->currentStudentLevelId($data['student_id']),
            ]);
            $this->syncErrors($exam, $data['errors'] ?? []);
            return $exam;
        });
        return response()->json(['message'=>'تمت إضافة سبر الأجزاء بنجاح.','data'=>$this->payload($this->load($exam))], 201);
    }

    public function update(Request $request, Exam $partExam)
    {
        $this->ensureExamAccess($partExam, $request);
        $data = $this->validated($request, true);
        if (!empty($data['student_id'])) {
            $student = Student::findOrFail($data['student_id']);
            $this->ensureStudentGender($student, $request);
            $this->ensureAssignedStudent($student, $request);
        }
        if ($this->isSupervisorActor($request)) $data['supervisor_id'] = $this->actorSupervisorId($request);
        $this->ensureSupervisorGender($data['supervisor_id'] ?? null, $request);
        DB::transaction(function () use ($data, $partExam) {
            $update = collect($data)->only(['part','quantity','exam_type','exam_date','score','result','supervisor_id'])->all();
            if (array_key_exists('student_id',$data)) $update['student_level_id']=$this->currentStudentLevelId($data['student_id']);
            if ($update !== []) $partExam->update($update);
            if (array_key_exists('errors',$data)) $this->syncErrors($partExam,$data['errors']??[]);
        });
        return response()->json(['message'=>'تم تحديث سبر الأجزاء بنجاح.','data'=>$this->payload($this->load($partExam->fresh()))]);
    }

    public function destroy(Request $request, Exam $partExam)
    {
        $this->ensureExamAccess($partExam,$request);
        DB::transaction(function () use ($partExam) { $partExam->examErrors()->delete(); $partExam->delete(); });
        return response()->json(['message'=>'تم حذف سبر الأجزاء بنجاح.']);
    }

    private function validated(Request $request, bool $partial=false): array
    {
        $required=$partial?'sometimes':'required';
        return $request->validate([
            'student_id'=>[$required,'integer','exists:students,id'],
            'supervisor_id'=>[$partial?'sometimes':'required','nullable','integer','exists:supervisors,id'],
            'part'=>[$required,'integer','min:1','max:30'],'quantity'=>[$required,'integer','min:1','max:30'],
            'exam_type'=>[$required,Rule::in(array_column(ExamType::cases(),'value'))],'exam_date'=>[$required,'date'],
            'score'=>['sometimes','nullable','integer','min:0','max:100'],'result'=>['sometimes','nullable',Rule::in(['passed','failed'])],
            'errors'=>['sometimes','array'],'errors.*.error_id'=>['sometimes','nullable','integer','exists:errors,id'],
            'errors.*.error_type'=>['sometimes','nullable',Rule::in(array_column(ErrorType::cases(),'value'))],
            'errors.*.word'=>['required_with:errors','string','max:255'],'errors.*.details'=>['sometimes','nullable','string','max:2000'],
        ]);
    }

    private function ensureExamAccess(Exam $exam, Request $request): void
    {
        $exam->loadMissing('studentLevel.student.person');
        $student=$exam->studentLevel?->student;
        abort_unless($student,404,'الطالب المرتبط بالسبر غير موجود.');
        $this->ensureStudentGender($student,$request);
        $this->ensureAssignedStudent($student,$request);
        if ($this->isSupervisorActor($request)) abort_unless((int)$exam->supervisor_id===$this->actorSupervisorId($request),403,'غير مسموح لك بتعديل سبر لمشرف آخر.');
    }

    private function currentStudentLevelId(int $studentId): int
    {
        $student=Student::with('studentLevels')->findOrFail($studentId);
        $level=$student->studentLevels->sortByDesc('id')->first();
        if(!$level) throw ValidationException::withMessages(['student_id'=>['لا يوجد مستوى مسجل لهذا الطالب بعد.']]);
        return $level->id;
    }

    private function syncErrors(Exam $exam,array $errors): void
    {
        $exam->examErrors()->delete();
        foreach($errors as $item){
            $errorId=$item['error_id']??null;
            if(!$errorId&&!empty($item['error_type'])) $errorId=Error::firstOrCreate(['error_type'=>$item['error_type']],['score'=>0])->id;
            if(!$errorId) continue;
            ExamError::create(['exam_id'=>$exam->id,'error_id'=>$errorId,'error_word'=>$item['word']??'','details'=>$item['details']??null]);
        }
    }

    private function load(Exam $exam): Exam
    {
        return $exam->load(['studentLevel.student.person','studentLevel.level','supervisor.person','examErrors.error']);
    }

    private function payload(Exam $exam): array
    {
        $student=$exam->studentLevel?->student; $person=$student?->person; $supervisorPerson=$exam->supervisor?->person;
        return [
            'id'=>$exam->id,'student_id'=>$student?->id,'student_name'=>$person?trim($person->fname.' '.$person->lname):null,
            'student_level_id'=>$exam->student_level_id,'level'=>$exam->studentLevel?->level?->name?->value,'level_label'=>$exam->studentLevel?->level?->name?->label(),
            'supervisor_id'=>$exam->supervisor_id,'supervisor_name'=>$supervisorPerson?trim($supervisorPerson->fname.' '.$supervisorPerson->lname):null,
            'exam_date'=>optional($exam->exam_date)->toDateString(),'part'=>$exam->part,'quantity'=>$exam->quantity,
            'exam_type'=>$exam->exam_type?->value,'exam_type_label'=>$exam->exam_type?->label(),'score'=>$exam->score,'result'=>$exam->result,
            'result_label'=>match($exam->result){'passed'=>'ناجح','failed'=>'راسب',default=>null},
            'errors'=>$exam->examErrors->map(fn(ExamError $error)=>['id'=>$error->id,'error_id'=>$error->error_id,'error_type'=>$error->error?->error_type?->value,'error_type_label'=>$error->error?->error_type?->label(),'word'=>$error->error_word,'details'=>$error->details])->values(),
        ];
    }
}
