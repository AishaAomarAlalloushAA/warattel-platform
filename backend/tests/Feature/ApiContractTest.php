<?php

namespace Tests\Feature;

use App\Enums\GenderType;
use App\Enums\StudentStatus;
use App\Enums\UserRole;
use App\Models\Lecture;
use App\Models\Person;
use App\Models\Student;
use App\Models\User;
use App\Models\VolunteerForm;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_login_returns_the_stable_frontend_contract(): void
    {
        [$user, $student] = $this->createStudentAccount();
        $this->postJson('/api/login', ['email'=>$user->email,'password'=>'password123','role'=>'student'])
            ->assertOk()->assertJsonPath('user.role','student')->assertJsonPath('user.role_data.student_id',$student->id)
            ->assertJsonPath('user.person.fname','أحمد')->assertJsonStructure(['message','token','user'=>['id','email','role','full_name','person','role_data']]);
    }

    public function test_student_portal_uses_the_authenticated_student(): void
    {
        [$user,$student]=$this->createStudentAccount(); Sanctum::actingAs($user);
        $this->getJson('/api/student/dashboard')->assertOk()->assertJsonPath('data.student.id',$student->id)
            ->assertJsonPath('data.counts.reports',0)->assertJsonPath('data.counts.part_exams',0)->assertJsonPath('data.counts.level_exams',0);
    }

    public function test_student_cannot_access_admin_dashboard(): void
    {
        [$user]=$this->createStudentAccount(); Sanctum::actingAs($user);
        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_public_lectures_only_return_active_content(): void
    {
        Lecture::create(['title'=>'محاضرة ظاهرة','type'=>'video','registration_status'=>'open','is_active'=>true,'sort_order'=>1]);
        Lecture::create(['title'=>'محاضرة مخفية','type'=>'video','registration_status'=>'closed','is_active'=>false,'sort_order'=>2]);
        $this->getJson('/api/lectures')->assertOk()->assertJsonCount(1,'data')->assertJsonPath('data.0.title','محاضرة ظاهرة');
    }

    public function test_visitor_can_submit_volunteer_request_and_admin_can_review_it(): void
    {
        $this->postJson('/api/volunteer-forms',[
            'name'=>'متطوع زائر','contact_number'=>'0999999911','email'=>'visitor@example.com','form_type'=>'design','form_data'=>['volunteer_confirmed'=>true],
        ])->assertSuccessful();
        $form=VolunteerForm::firstOrFail(); $this->assertNull($form->user_id);
        $admin=$this->createAdminAccount(GenderType::Male,'admin-volunteer@example.com','0999999912'); Sanctum::actingAs($admin);
        $this->getJson('/api/volunteer-forms')->assertOk()->assertJsonPath('data.0.email','visitor@example.com');
    }

    public function test_admin_student_list_is_scoped_to_admin_gender(): void
    {
        $this->createStudentAccount(GenderType::Male,'male@example.com','0999999921');
        $this->createStudentAccount(GenderType::Female,'female@example.com','0999999922');
        $admin=$this->createAdminAccount(GenderType::Male,'admin-scope@example.com','0999999923'); Sanctum::actingAs($admin);
        $this->getJson('/api/admin/students?per_page=100')->assertOk()->assertJsonCount(1,'data')->assertJsonPath('data.0.person.gender','male');
    }

    public function test_account_cannot_change_its_gender_through_self_profile(): void
    {
        [$user]=$this->createStudentAccount(GenderType::Male,'immutable@example.com','0999999931'); Sanctum::actingAs($user);
        $this->patchJson('/api/me/profile',['gender'=>'female'])->assertOk();
        $this->assertSame(GenderType::Male,$user->fresh()->person->gender);
    }

    public function test_adding_supervisor_creates_restricted_login_and_assignable_supervisor_entity(): void
    {
        $admin=$this->createAdminAccount(GenderType::Male,'admin-create@example.com','0999999941'); Sanctum::actingAs($admin);
        $this->postJson('/api/admin/supervisor-accounts',[
            'fname'=>'خالد','lname'=>'المشرف','email'=>'new-supervisor@example.com','password'=>'password123','password_confirmation'=>'password123','contact_number'=>'0999999942',
        ])->assertCreated()->assertJsonPath('data.gender','male');

        $createdUser=User::where('email','new-supervisor@example.com')->firstOrFail();
        $this->assertSame(UserRole::Supervisor,$createdUser->role);
        $this->assertNotNull($createdUser->person?->supervisor);
        $this->assertDatabaseHas('supervisors',['person_id'=>$createdUser->person->id]);

        Sanctum::actingAs($createdUser);
        $this->getJson('/api/admin/dashboard')->assertForbidden();
        $this->getJson('/api/supervisor/students')->assertOk();
    }

    public function test_supervisor_can_login_with_supervisor_role(): void
    {
        $admin=$this->createAdminAccount(GenderType::Male,'admin-login@example.com','0999999951'); Sanctum::actingAs($admin);
        $this->postJson('/api/admin/supervisor-accounts',[
            'fname'=>'أحمد','lname'=>'المسمع','email'=>'supervisor-login@example.com','password'=>'password123','password_confirmation'=>'password123','contact_number'=>'0999999952',
        ])->assertCreated();

        Auth::shouldUse('web');
        Auth::guard('web')->logout();
        $this->postJson('/api/login',['email'=>'supervisor-login@example.com','password'=>'password123','role'=>'supervisor'])
            ->assertOk()->assertJsonPath('user.role','supervisor');
    }

    private function createStudentAccount(GenderType $gender=GenderType::Male,string $email='student@example.com',string $phone='0999999999'): array
    {
        $user=User::create(['email'=>$email,'password'=>'password123','role'=>UserRole::Student]);
        $person=Person::create([
            'user_id'=>$user->id,'fname'=>$gender===GenderType::Female?'سارة':'أحمد','lname'=>'محمد','gender'=>$gender,'year_of_study'=>3,
            'contact_number'=>$phone,'join_date'=>now()->toDateString(),'address'=>'حلب',
        ]);
        $student=Student::create(['person_id'=>$person->id,'status'=>StudentStatus::Active]);
        return [$user,$student];
    }

    private function createAdminAccount(GenderType $gender,string $email,string $phone): User
    {
        $user=User::create(['email'=>$email,'password'=>'password123','role'=>UserRole::Admin]);
        Person::create([
            'user_id'=>$user->id,'fname'=>$gender===GenderType::Female?'المشرفة':'المشرف','lname'=>'ورتل','gender'=>$gender,
            'contact_number'=>$phone,'join_date'=>now()->toDateString(),
        ]);
        return $user->fresh()->load('person');
    }
}
