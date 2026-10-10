<?php

namespace Database\Seeders;

use App\Models\Lecture;
use Illuminate\Database\Seeder;

class LectureSeeder extends Seeder
{
    public function run(): void
    {
        $lectures = [
            [
                'title' => 'قبل أن يهل الهلال',
                'description' => 'التحضير لشهر رمضان خلال الأيام المتبقية من شهر شعبان.',
                'display_date' => '4/2/2026',
                'type' => 'video',
                'url' => 'https://youtu.be/q_jGe-paLcU?si=eRHDbFuiBHjoO9Lu',
                'thumbnail' => 'https://img.youtube.com/vi/q_jGe-paLcU/0.jpg',
                'registration_status' => 'closed',
                'category' => 'للذكور فقط',
            ],
            [
                'title' => 'بعد أن هل الهلال',
                'description' => 'للمحافظة على العبادة بعد رمضان',
                'display_date' => '22/4/2026',
                'type' => 'video',
                'url' => 'https://www.youtube.com/watch?v=svA-x21r1Yg',
                'thumbnail' => 'https://img.youtube.com/vi/svA-x21r1Yg/0.jpg',
                'registration_status' => 'closed',
                'category' => 'للذكور فقط',
            ],
            [
                'title' => 'قبل العشر من ذي الحجة',
                'description' => 'الاستعداد لأفضل أيام الدنيا',
                'display_date' => '18/5/2026',
                'type' => 'video',
                'url' => 'https://youtu.be/ntAolNp3j68?is=5VDT_USK7f-Zp5jR',
                'thumbnail' => 'https://img.youtube.com/vi/ntAolNp3j68/0.jpg',
                'registration_status' => 'closed',
                'category' => 'للذكور فقط',
            ],
            [
                'title' => 'ولادة مسلم',
                'description' => 'سلسلة فيديوهات تتحدث عن الرحلة لاكتشاف المعنى والهوية وبناء حياة أقرب إلى الله.',
                'display_date' => null,
                'type' => 'playlist',
                'url' => 'https://youtube.com/playlist?list=PL38keZKifrmEyWdYXcDMNWlL37w-mUYP0&si=P5cKd-H5zo1zWg2W',
                'thumbnail' => '/33.jpg',
                'registration_status' => 'closed',
                'category' => 'للذكور فقط',
            ],
            [
                'title' => 'قبل أن يهل الهلال',
                'description' => null,
                'display_date' => '5/2/2026',
                'type' => 'image',
                'url' => null,
                'thumbnail' => '/A.jpg',
                'registration_status' => 'closed',
                'category' => 'للإناث فقط',
            ],
            [
                'title' => 'فقه الصيام',
                'description' => 'درس يوضح أحكام الصيام وما يتعلق به من مسائل فقهية مهمة.',
                'display_date' => '12/2/2026',
                'type' => 'image',
                'url' => null,
                'thumbnail' => '/B.jpg',
                'registration_status' => 'closed',
                'category' => 'للإناث فقط',
            ],
            [
                'title' => 'ليطمئن قلبي',
                'description' => 'سلسلة جلسات تدبر لسورة النور',
                'display_date' => 'كل خميس',
                'type' => 'image',
                'url' => null,
                'thumbnail' => '/C.jpg',
                'registration_status' => 'closed',
                'category' => 'للإناث فقط',
            ],
            [
                'title' => 'سلسلة جلسات كوني صحابية',
                'description' => null,
                'display_date' => 'غير معلن عنها بعد',
                'type' => 'image',
                'url' => null,
                'thumbnail' => '/E.png',
                'registration_status' => 'soon',
                'category' => 'للإناث فقط',
            ],
            [
                'title' => 'مسابقة إلى الجنة زمراً',
                'description' => 'مسابقة لحفظ سورة الزمر كاملة وقراءة ملف التفسير وفهمه',
                'display_date' => '24/12/2025',
                'type' => 'image',
                'url' => null,
                'thumbnail' => '/F.png',
                'registration_status' => 'closed',
                'category' => 'للإناث والذكور',
            ],
        ];

        foreach ($lectures as $index => $lecture) {
            Lecture::updateOrCreate(
                [
                    'title' => $lecture['title'],
                    'display_date' => $lecture['display_date'],
                    'type' => $lecture['type'],
                ],
                array_merge($lecture, [
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ])
            );
        }
    }
}
