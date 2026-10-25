<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('neta_booth_progress', function (Blueprint $table) {
            $table->string('ward_mr')->nullable()->after('village_en');
            $table->string('ward_en')->nullable()->after('ward_mr');
        });

        // Initialize ward data for existing rows
        $booths = DB::table('neta_booth_progress')->get();
        foreach ($booths as $b) {
            $wardMr = 'प्रभाग क्र. ' . ($b->id ?? '१');
            $wardEn = 'Ward No. ' . ($b->id ?? '1');
            if (!empty($b->village_mr) && preg_match('/प्रभाग\s*([०-९\d]+)/u', $b->village_mr, $matches)) {
                $wardMr = 'प्रभाग क्र. ' . $matches[1];
                $wardEn = 'Ward No. ' . $matches[1];
            }
            DB::table('neta_booth_progress')->where('id', $b->id)->update([
                'ward_mr' => $wardMr,
                'ward_en' => $wardEn,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('neta_booth_progress', function (Blueprint $table) {
            $table->dropColumn(['ward_mr', 'ward_en']);
        });
    }
};
