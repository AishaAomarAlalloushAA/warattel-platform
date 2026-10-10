<?php

namespace App\Http\Controllers\Api;

use App\Enums\ErrorType;
use App\Enums\GenderType;
use App\Enums\LevelType;
use App\Enums\StudentStatus;
use App\Http\Controllers\Controller;
use App\Models\Error;
use App\Models\Level;
use App\Models\Supervisor;
use App\Support\EnforcesGenderScope;
use App\Support\RestrictsSupervisorScope;
use Illuminate\Http\Request;

class AdminOptionsController extends Controller
{
    use EnforcesGenderScope;
    use RestrictsSupervisorScope;

    public function __invoke(Request $request)
    {
        $gender = $this->actorGender($request);
        $genderEnum = GenderType::from($gender);

        $supervisors = Supervisor::query()
            ->with('person')
            ->whereNull('retired_at')
            ->whereHas('person', fn ($q) => $q->where('gender', $gender));

        if ($this->isSupervisorActor($request)) {
            $supervisors->whereKey($this->actorSupervisorId($request));
        }

        $errors = Error::query()->orderBy('id')->get()->map(fn (Error $error) => [
            'id' => $error->id,
            'value' => $error->error_type?->value,
            'label' => $error->error_type?->label(),
            'score' => $error->score,
        ])->values();

        // Keep report/exam forms usable even before reference-data migrations are
        // applied on an existing installation. Saving by error_type is supported
        // by the report/exam endpoints, so enum values are a safe fallback.
        if ($errors->isEmpty()) {
            $errors = collect(ErrorType::options())->map(fn (array $option) => [
                'id' => null,
                'value' => $option['value'],
                'label' => $option['label'],
                'score' => 0,
            ]);
        }

        return response()->json([
            'data' => [
                'actor_gender' => $gender,
                'actor_gender_label' => $genderEnum->label(),
                'levels' => Level::query()->orderBy('id')->get()->map(fn (Level $level) => [
                    'id' => $level->id,
                    'value' => $level->name?->value,
                    'label' => $level->name?->label(),
                    'description' => $level->description,
                    'plan' => $level->plan,
                ])->values(),
                'supervisors' => $supervisors->orderBy('id')->get()->map(fn (Supervisor $supervisor) => [
                    'id' => $supervisor->id,
                    'name' => $supervisor->person
                        ? trim($supervisor->person->fname . ' ' . $supervisor->person->lname)
                        : 'مشرف #' . $supervisor->id,
                    'role' => $supervisor->role?->value,
                    'role_label' => $supervisor->role?->label(),
                    'gender' => $supervisor->person?->gender?->value,
                ])->values(),
                'errors' => $errors,
                'level_types' => LevelType::options(),
                'error_types' => ErrorType::options(),
                'student_statuses' => StudentStatus::options(),
                'genders' => [[
                    'value' => $gender,
                    'label' => $genderEnum->label(),
                ]],
            ],
        ]);
    }
}
