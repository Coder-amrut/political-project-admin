<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class AdminChatbotController extends Controller
{
    /**
     * Get categorized quick-prompt suggestion chips.
     */
    public function getSuggestions(Request $request)
    {
        $isMr = $request->query('lang', 'mr') === 'mr';

        $suggestions = [
            [
                'id' => 'voters_summary',
                'category' => $isMr ? 'मतदार सारांश' : 'Voters',
                'label' => $isMr ? '📊 एकूण मतदार व राजकीय कल सारांश' : '📊 Total Voters & Sentiment Summary',
                'query' => $isMr ? 'एकूण मतदार संख्या आणि राजकीय कल दाखवा' : 'Show total voters and political sentiment summary',
            ],
            [
                'id' => 'booth_status',
                'category' => $isMr ? 'बूथ कामगिरी' : 'Booths',
                'label' => $isMr ? '🗳️ बूथनिहाय प्रगती व मतदार कव्हरेज' : '🗳️ Booth Progress & Coverage',
                'query' => $isMr ? 'बूथनिहाय प्रगती आणि आघाडीवरील बूथ दाखवा' : 'Show booth progress and top covered booths',
            ],
            [
                'id' => 'civic_issues',
                'category' => $isMr ? 'नागरी समस्या' : 'Issues',
                'label' => $isMr ? '⚠️ प्रलंबित नागरी समस्या व तक्रारी' : '⚠️ Pending Civic Grievances',
                'query' => $isMr ? 'सध्याच्या प्रलंबित नागरी समस्या कोणत्या आहेत?' : 'What are the current pending civic issues?',
            ],
            [
                'id' => 'karyakarta_list',
                'category' => $isMr ? 'कार्यकर्ते' : 'Karyakartas',
                'label' => $isMr ? '👥 सक्रिय कार्यकर्ते व सर्व्हे कामगिरी' : '👥 Active Karyakartas & Performance',
                'query' => $isMr ? 'सक्रिय कार्यकर्ते आणि त्यांची कामगिरी दाखवा' : 'Show active field workers and survey performance',
            ],
            [
                'id' => 'pending_approvals',
                'category' => $isMr ? 'मंजुरी कक्ष' : 'Approvals',
                'label' => $isMr ? '📋 प्रलंबित सर्व्हे नोंदणी मंजुरी' : '📋 Pending Field Survey Submissions',
                'query' => $isMr ? 'तपासणीसाठी प्रलंबित सर्व्हे नोंदी किती आहेत?' : 'How many survey submissions are pending approval?',
            ],
            [
                'id' => 'official_docs',
                'category' => $isMr ? 'दस्तऐवज' : 'Documents',
                'label' => $isMr ? '📁 अधिकृत शासकीय दस्तऐवज भांडार' : '📁 Official Document Repository',
                'query' => $isMr ? 'भांडारात कोणते शासकीय दस्तऐवज उपलब्ध आहेत?' : 'What official documents are stored in repository?',
            ],
            [
                'id' => 'scheme_benefits',
                'category' => $isMr ? 'योजना' : 'Schemes',
                'label' => $isMr ? '🏛️ शासकीय योजना व लाडकी बहीण लाभार्थी' : '🏛️ Government Scheme Beneficiaries',
                'query' => $isMr ? 'शासकीय योजनांचे लाभार्थी आणि लाडकी बहीण योजनेची माहिती द्या' : 'Show government scheme beneficiaries data',
            ],
        ];

        return response()->json([
            'success' => true,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Handle user chat query and return grounded database response.
     */
    public function handleQuery(Request $request)
    {
        $message = trim((string)$request->input('message', ''));
        $lang = $request->input('lang', 'mr');
        $isMr = $lang === 'mr';

        if (empty($message)) {
            return response()->json([
                'success' => false,
                'message' => $isMr ? 'कृपया प्रश्न विचारा.' : 'Please provide a query message.',
            ], 422);
        }

        // 1. Gather live database facts and detect intent
        $contextData = $this->gatherDatabaseContext($message, $isMr);

        // 1. GREETING check - instant friendly response
        if ($contextData['intent'] === 'GREETING') {
            return response()->json([
                'success' => true,
                'reply' => $this->formatSmartResponse($message, $contextData, $isMr),
                'intent' => 'GREETING',
                'related_data' => [],
                'suggested_actions' => $contextData['suggested_actions'] ?? [],
                'source' => 'quick_greeting',
            ]);
        }

        // 2. Specific NOT FOUND records in DB - immediate honest notice
        if (in_array($contextData['intent'], ['NOT_FOUND_CITIZEN', 'NOT_FOUND_BOOTH'])) {
            return response()->json([
                'success' => true,
                'reply' => $this->formatSmartResponse($message, $contextData, $isMr),
                'intent' => $contextData['intent'],
                'related_data' => [],
                'suggested_actions' => $this->getDefaultSuggestions($isMr),
                'source' => 'db_record_not_found',
            ]);
        }

        $hasDbMatch = in_array($contextData['intent'], [
            'CITIZEN_LOOKUP', 'BOOTH_INFO', 'CIVIC_ISSUES', 'KARYAKARTAS',
            'SUBMISSIONS_APPROVAL', 'OFFICIAL_DOCUMENTS', 'SCHEMES_INFO', 'GENERAL_OVERVIEW'
        ]);

        // 3. Query Gemini:
        // - 1st check on DB: Grounded in verified DB facts.
        // - Then check other side: General campaign strategy, slogans, advice, speeches.
        $apiKey = env('GEMINI_API_KEY') ?: env('OPENAI_API_KEY');
        if (!empty($apiKey)) {
            $llmResponse = $this->queryGeminiApi($message, $contextData, $isMr, $hasDbMatch);
            if (!empty($llmResponse)) {
                return response()->json([
                    'success' => true,
                    'reply' => trim($llmResponse),
                    'intent' => $contextData['intent'],
                    'related_data' => $contextData['structured_items'] ?? [],
                    'suggested_actions' => $contextData['suggested_actions'] ?? [],
                    'source' => $hasDbMatch ? 'gemini_db_grounded' : 'gemini_other_side',
                ]);
            }
        }

        // 4. Built-in Smart Query Engine Response (Grounding & Fallback)
        $smartReply = $this->formatSmartResponse($message, $contextData, $isMr);

        return response()->json([
            'success' => true,
            'reply' => $smartReply,
            'intent' => $contextData['intent'],
            'related_data' => $contextData['structured_items'] ?? [],
            'suggested_actions' => $contextData['suggested_actions'] ?? [],
            'source' => $hasDbMatch ? 'mysql_live_database' : 'system_fallback',
        ]);
    }

    /**
     * Default suggestion chips for general navigation and fallback.
     */
    private function getDefaultSuggestions(bool $isMr): array
    {
        return $isMr ? [
            ['label' => '📊 एकूण मतदार सारांश', 'query' => 'एकूण मतदार संख्या आणि राजकीय कल दाखवा'],
            ['label' => '🗳️ बूथनिहाय प्रगती', 'query' => 'बूथनिहाय प्रगती आणि आघाडीवरील बूथ दाखवा'],
            ['label' => '⚠️ प्रलंबित नागरी समस्या', 'query' => 'सध्याच्या प्रलंबित नागरी समस्या कोणत्या आहेत?'],
            ['label' => '👥 सक्रिय कार्यकर्ते', 'query' => 'सक्रिय कार्यकर्ते आणि त्यांची कामगिरी दाखवा'],
        ] : [
            ['label' => '📊 Total Voters Summary', 'query' => 'Show total voters and political sentiment summary'],
            ['label' => '🗳️ Booth Progress', 'query' => 'Show booth progress and top covered booths'],
            ['label' => '⚠️ Pending Issues', 'query' => 'What are the current pending civic issues?'],
            ['label' => '👥 Active Workers', 'query' => 'Show active field workers and survey performance'],
        ];
    }

    /**
     * Parse intent and query real MySQL tables.
     */
    private function gatherDatabaseContext(string $message, bool $isMr): array
    {
        $lower = mb_strtolower($message);
        $context = [
            'intent' => 'UNKNOWN_QUERY',
            'structured_items' => [],
            'suggested_actions' => $this->getDefaultSuggestions($isMr),
            'data' => [],
        ];

        // 1. Greetings check
        $greetings = [
            'hi', 'hello', 'hey', 'namaskar', 'namaste', 'नमस्कार', 'नमस्ते', 'सुप्रभात',
            'गुड मॉर्निंग', 'good morning', 'good afternoon', 'good evening',
            'राम राम', 'जय महाराष्ट्र', 'हाय', 'हॅलो', 'सस्नेह नमस्कार'
        ];
        $trimmedMsg = trim($lower, "!?. \t\n\r\0\x0B");
        if (in_array($trimmedMsg, $greetings) || in_array($lower, $greetings)) {
            $context['intent'] = 'GREETING';
            return $context;
        }

        // 1.5 Check for Campaign Strategy / Slogans / Speech / Creative / Tips queries first ("Other side")
        $isCampaignStrategyQuery = preg_match('/(?:घोषणा|slogan|भाषण|speech|सल्ला|advice|टिप्स|tips|नियोजन|planning|आचारसंहिता|code of conduct|रणनीती|strategy|कसे करावे|कसे बोलावे|काय बोलावे|सोशल मीडिया|social media|पोस्ट|post|कॅम्पेन|campaign idea|प्रचार आयडिया|मार्गदर्शन)/iu', $message);
        if ($isCampaignStrategyQuery) {
            $context['intent'] = 'CAMPAIGN_STRATEGY';
            $context['suggested_actions'] = [
                ['label' => $isMr ? '📢 प्रचार घोषणा' : 'Campaign Slogans', 'query' => $isMr ? 'प्रभावी प्रचार घोषणा सांगा' : 'Give effective campaign slogans'],
                ['label' => $isMr ? '🎤 भाषण मुद्दे' : 'Speech Points', 'query' => $isMr ? 'सभेसाठी भाषणाचे मुद्दे सांगा' : 'Give rally speech points'],
                ['label' => $isMr ? '📊 मतदार सारांश' : 'Voters Summary', 'query' => $isMr ? 'एकूण मतदार सारांश दाखवा' : 'Show total voters summary'],
            ];
            return $context;
        }

        // 2. Specific Citizen Lookup (Search by name or voter ID or phone)
        $cleanPhone = preg_replace('/[^0-9]/', '', $message);
        $matchedCitizens = [];

        if (strlen($cleanPhone) >= 7) {
            $matchedCitizens = DB::table('neta_citizens')
                ->where('phone', 'like', "%{$cleanPhone}%")
                ->orWhere('alternate_phone', 'like', "%{$cleanPhone}%")
                ->get();

            if ($matchedCitizens->isEmpty() && strlen($cleanPhone) >= 10) {
                $context['intent'] = 'NOT_FOUND_CITIZEN';
                $context['data']['query'] = $cleanPhone;
                return $context;
            }
        }

        if (empty($matchedCitizens) && preg_match('/(?:vtr|mh|epic)[a-zA-Z0-9\/_-]{3,}/i', $message, $epicMatch)) {
            $matchedCitizens = DB::table('neta_citizens')
                ->where('voter_id_number', 'like', "%{$epicMatch[0]}%")
                ->get();

            if ($matchedCitizens->isEmpty()) {
                $context['intent'] = 'NOT_FOUND_CITIZEN';
                $context['data']['query'] = $epicMatch[0];
                return $context;
            }
        }

        // Name search (extract keywords)
        $isVoterExplicitWord = str_contains($lower, 'मतदार') || str_contains($lower, 'voter') ||
                               str_contains($lower, 'नागरिक') || str_contains($lower, 'citizen') ||
                               str_contains($lower, 'शोधा') || str_contains($lower, 'search');

        $words = preg_split('/\s+/', trim($message));
        $isShortNameQuery = count($words) <= 3 && !preg_match('/[?!=]/', $message);

        if (empty($matchedCitizens) && ($isVoterExplicitWord || $isShortNameQuery)) {
            foreach ($words as $w) {
                $w = trim($w, ",.?! ");
                if (mb_strlen($w) >= 3 && !in_array(mb_strtolower($w), [
                    'माहिती', 'दाखवा', 'द्या', 'आहे', 'काय', 'शोधा', 'show', 'voter', 'details', 'info',
                    'मतदार', 'नागरिक', 'citizen', 'please', 'give', 'list', 'status', 'summary', 'about',
                    'सांगा', 'तपशील', 'कोण', 'कशी', 'कोणते', 'पाहिजे', 'पाहिजेत', 'एकूण', 'नंबर'
                ])) {
                    $citizens = DB::table('neta_citizens')
                        ->where('full_name_mr', 'like', "%{$w}%")
                        ->orWhere('full_name_en', 'like', "%{$w}%")
                        ->get();
                    if ($citizens->isNotEmpty()) {
                        $matchedCitizens = $citizens;
                        break;
                    }
                }
            }
        }

        if (!empty($matchedCitizens) && count($matchedCitizens) > 0) {
            $context['intent'] = 'CITIZEN_LOOKUP';
            $context['data']['citizens'] = $matchedCitizens;
            foreach ($matchedCitizens as $c) {
                $context['structured_items'][] = [
                    'type' => 'citizen',
                    'id' => $c->id,
                    'title' => $c->full_name_mr,
                    'subtitle' => "EPIC: {$c->voter_id_number} • {$c->booth_no}",
                    'sentiment' => $c->sentiment_label_mr ?? $c->sentiment,
                    'phone' => $c->phone,
                    'address' => $c->address_mr,
                ];
            }
            $context['suggested_actions'] = [
                ['label' => $isMr ? 'या मतदाराच्या कुटुंबातील सदस्य' : 'Family Members', 'query' => "{$matchedCitizens[0]->full_name_mr} यांच्या कुटुंबातील मतदार"],
                ['label' => $isMr ? 'यांचे बूथ तपशील' : 'Booth Details', 'query' => "{$matchedCitizens[0]->booth_no} चे तपशील दाखवा"],
            ];
            return $context;
        }

        // 3. Booth Lookup / Status
        if (str_contains($lower, 'booth') || str_contains($lower, 'बूथ') || str_contains($lower, 'प्रभाग') || str_contains($lower, 'ward')) {
            $context['intent'] = 'BOOTH_INFO';
            // Check if specific booth number is mentioned
            if (preg_match('/(?:बूथ|booth|ward|प्रभाग)\s*(?:क्र\.|no\.?|क्रमांक)?\s*([०-९0-9]+)/iu', $message, $bMatch)) {
                $bNum = $bMatch[1];
                $marathiDigits = ['०'=>'0','१'=>'1','२'=>'2','३'=>'3','४'=>'4','५'=>'5','६'=>'6','७'=>'7','८'=>'8','९'=>'9'];
                $cleanBNum = strtr($bNum, $marathiDigits);

                $specificBooth = DB::table('neta_booth_progress')
                    ->where('booth_no', 'like', "%{$cleanBNum}%")
                    ->orWhere('booth_no', 'like', "%{$bNum}%")
                    ->first();

                if ($specificBooth) {
                    $context['data']['specific_booth'] = $specificBooth;
                    $context['data']['booth_citizens'] = DB::table('neta_citizens')
                        ->where('booth_no', 'like', "%{$cleanBNum}%")
                        ->orWhere('booth_no', 'like', "%{$bNum}%")
                        ->limit(5)->get();
                    $context['structured_items'][] = [
                        'type' => 'booth',
                        'title' => $specificBooth->booth_no . ' - ' . $specificBooth->booth_name_mr,
                        'subtitle' => "मतदार: {$specificBooth->total_voters} | पाहणी: {$specificBooth->surveyed_voters} ({$specificBooth->coverage_pct}%)",
                        'incharge' => "प्रभारी: {$specificBooth->incharge_name} ({$specificBooth->incharge_phone})",
                    ];
                    $context['suggested_actions'] = [
                        ['label' => $isMr ? 'या बूथवरील मतदार यादी' : 'Voters in this Booth', 'query' => "{$specificBooth->booth_no} मधील मतदार दाखवा"],
                        ['label' => $isMr ? 'या बूथवरील नागरी समस्या' : 'Issues in this Booth', 'query' => "{$specificBooth->booth_no} वरील समस्या"],
                    ];
                    return $context;
                } else {
                    $context['intent'] = 'NOT_FOUND_BOOTH';
                    $context['data']['booth_no'] = $cleanBNum;
                    return $context;
                }
            }

            // General booth summary
            $context['data']['total_booths'] = DB::table('neta_booth_progress')->count();
            $context['data']['top_booths'] = DB::table('neta_booth_progress')->orderBy('coverage_pct', 'desc')->limit(5)->get();
            $context['data']['all_booths_summary'] = DB::table('neta_booth_progress')
                ->selectRaw('SUM(total_voters) as total_voters, SUM(surveyed_voters) as total_surveyed, AVG(coverage_pct) as avg_coverage')
                ->first();

            foreach ($context['data']['top_booths'] as $tb) {
                $context['structured_items'][] = [
                    'type' => 'booth',
                    'title' => $tb->booth_no . ' (' . $tb->village_mr . ')',
                    'subtitle' => "पाहणी कव्हरेज: {$tb->coverage_pct}% • मतदार: {$tb->surveyed_voters}/{$tb->total_voters}",
                ];
            }
            return $context;
        }

        // 4. Civic Issues / Grievances
        if (str_contains($lower, 'issue') || str_contains($lower, 'problem') || str_contains($lower, 'complaint') ||
            str_contains($lower, 'grievance') || str_contains($lower, 'समस्या') || str_contains($lower, 'तक्रार') ||
            str_contains($lower, 'पाणी') || str_contains($lower, 'रस्ता') || str_contains($lower, 'ड्रेनेज') ||
            str_contains($lower, 'खड्डे') || str_contains($lower, 'लाईट') || str_contains($lower, 'विद्युत') ||
            str_contains($lower, 'कचरा')) {
            $context['intent'] = 'CIVIC_ISSUES';
            $context['data']['total_issues'] = DB::table('neta_crm_issues')->count();
            $context['data']['pending_issues'] = DB::table('neta_crm_issues')->where('status', 'PENDING')->count();
            $context['data']['resolved_issues'] = DB::table('neta_crm_issues')->where('status', 'RESOLVED')->count();
            $context['data']['issues_list'] = DB::table('neta_crm_issues')->orderBy('id', 'desc')->limit(6)->get();

            foreach ($context['data']['issues_list'] as $iss) {
                $context['structured_items'][] = [
                    'type' => 'issue',
                    'title' => $iss->title_mr,
                    'subtitle' => "ट्रॅकिंग क्र: {$iss->tracking_no} • प्राधान्य: {$iss->priority}",
                    'status' => $iss->status,
                    'assigned_worker' => $iss->assigned_worker,
                ];
            }
            $context['suggested_actions'] = [
                ['label' => $isMr ? 'रस्त्यांच्या समस्या' : 'Road Issues', 'query' => 'रस्ते व डांबरीकरण संबंधित तक्रारी'],
                ['label' => $isMr ? 'ड्रेनेज व पाणीपुरवठा' : 'Water & Drainage', 'query' => 'ड्रेनेज व पाणी समस्या'],
            ];
            return $context;
        }

        // 5. Karyakartas / Field Workers
        if (str_contains($lower, 'karyakarta') || str_contains($lower, 'worker') || str_contains($lower, 'कार्यकर्त') ||
            str_contains($lower, 'सहकारी') || str_contains($lower, 'टीम') || str_contains($lower, 'स्वयंसेवक')) {
            $context['intent'] = 'KARYAKARTAS';
            $context['data']['total_karyakartas'] = DB::table('neta_karyakartas')->count();
            $context['data']['active_karyakartas'] = DB::table('neta_karyakartas')->where('status', 'active')->count();
            $context['data']['top_karyakartas'] = DB::table('neta_karyakartas')->orderBy('total_surveys', 'desc')->limit(6)->get();

            foreach ($context['data']['top_karyakartas'] as $k) {
                $context['structured_items'][] = [
                    'type' => 'worker',
                    'title' => $k->name,
                    'subtitle' => "क्षेत्र: {$k->assigned_area_mr} • सर्व्हे: {$k->total_surveys}",
                    'phone' => $k->phone,
                    'rating' => $k->rating,
                ];
            }
            return $context;
        }

        // 6. Submissions & Data Approvals
        if (str_contains($lower, 'submission') || str_contains($lower, 'approval') || str_contains($lower, 'मंजूर') ||
            str_contains($lower, 'अर्ज') || str_contains($lower, 'पाहणी नोंद')) {
            $context['intent'] = 'SUBMISSIONS_APPROVAL';
            $context['data']['total_submissions'] = DB::table('admin_field_submissions')->count();
            $context['data']['pending_approvals'] = DB::table('admin_field_submissions')->where('status', 'PENDING_APPROVAL')->count();
            $context['data']['approved_count'] = DB::table('admin_field_submissions')->where('status', 'APPROVED')->count();
            $context['data']['rejected_count'] = DB::table('admin_field_submissions')->where('status', 'REJECTED')->count();
            $context['data']['recent_submissions'] = DB::table('admin_field_submissions')->orderBy('id', 'desc')->limit(4)->get();

            foreach ($context['data']['recent_submissions'] as $sub) {
                $context['structured_items'][] = [
                    'type' => 'submission',
                    'title' => $sub->submission_code . ' - ' . $sub->citizen_name_mr,
                    'subtitle' => "बूथ: {$sub->booth_no} • सादरकर्ता: {$sub->submitted_by_name}",
                    'status' => $sub->status,
                ];
            }
            return $context;
        }

        // 7. Official Documents
        if (str_contains($lower, 'doc') || str_contains($lower, 'दस्तऐवज') || str_contains($lower, 'कागदपत्र') ||
            str_contains($lower, 'pdf') || str_contains($lower, 'परिपत्रक') || str_contains($lower, 'अहवाल')) {
            $context['intent'] = 'OFFICIAL_DOCUMENTS';
            $context['data']['total_documents'] = DB::table('admin_media_documents')->count();
            $context['data']['docs'] = DB::table('admin_media_documents')->orderBy('id', 'desc')->limit(6)->get();

            foreach ($context['data']['docs'] as $d) {
                $context['structured_items'][] = [
                    'type' => 'document',
                    'title' => $d->title_mr,
                    'subtitle' => "फाइल: {$d->file_name} ({$d->file_size_formatted}) • प्रवर्ग: {$d->category}",
                    'booth' => $d->booth_ref,
                ];
            }
            return $context;
        }

        // 8. Government Schemes
        if (str_contains($lower, 'scheme') || str_contains($lower, 'योजना') || str_contains($lower, 'लाडकी बहीण') ||
            str_contains($lower, 'लाभार्थी') || str_contains($lower, 'beneficiar')) {
            $context['intent'] = 'SCHEMES_INFO';
            $context['data']['citizens_with_schemes'] = DB::table('neta_citizens')
                ->whereNotNull('schemes_benefitted')
                ->where('schemes_benefitted', '!=', '[]')
                ->where('schemes_benefitted', '!=', '')
                ->count();
            return $context;
        }

        // 9. General Overview / Campaign Summary (Explicit statistics, totals, or dashboard summaries)
        $overviewKeywords = [
            'overview', 'summary', 'dashboard', 'report', 'stats', 'statistics', 'briefing',
            'एकूण सारांश', 'सद्यस्थिती', 'डॅशबोर्ड', 'अहवाल', 'आकडेवारी', 'एकूण मतदार संख्या', 'एकूण आकडेवारी',
            'मोहीम सारांश', 'प्रगती अहवाल', 'constituency report', 'campaign stats'
        ];
        $isOverview = false;
        foreach ($overviewKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                $isOverview = true;
                break;
            }
        }

        if (str_contains($lower, 'एकूण मतदार') || str_contains($lower, 'total voters') || str_contains($lower, 'मतदार संख्या')) {
            $isOverview = true;
        }

        if ($isOverview) {
            $context['intent'] = 'GENERAL_OVERVIEW';
            $context['data']['citizens_total'] = DB::table('neta_citizens')->count();
            $context['data']['sentiment_anukul'] = DB::table('neta_citizens')->where('sentiment', 'anukul')->count();
            $context['data']['sentiment_neutral'] = DB::table('neta_citizens')->where('sentiment', 'neutral')->count();
            $context['data']['sentiment_pratikul'] = DB::table('neta_citizens')->where('sentiment', 'pratikul')->count();
            $context['data']['total_booths'] = DB::table('neta_booth_progress')->count();
            $context['data']['total_karyakartas'] = DB::table('neta_karyakartas')->count();
            $context['data']['pending_issues'] = DB::table('neta_crm_issues')->where('status', 'PENDING')->count();
            $context['data']['pending_submissions'] = DB::table('admin_field_submissions')->where('status', 'PENDING_APPROVAL')->count();
            $context['data']['total_documents'] = DB::table('admin_media_documents')->count();
            $context['data']['total_projects'] = DB::table('projects')->count();
            return $context;
        }

        // 10. Fallback: UNKNOWN_QUERY (The query was not understood)
        $context['intent'] = 'UNKNOWN_QUERY';
        $context['data']['original_query'] = $message;
        return $context;
    }

    /**
     * Formats an executive response based on verified real-world database metrics.
     */
    private function formatSmartResponse(string $message, array $context, bool $isMr): string
    {
        $intent = $context['intent'];
        $d = $context['data'];

        // 1. Unrecognized / Misunderstood Query
        if ($intent === 'UNKNOWN_QUERY') {
            if ($isMr) {
                return "⚠️ क्षमस्व, मला आपला प्रश्न समजला नाही. कृपया पुन्हा विचारा किंवा खालील बटणावर क्लिक करा.";
            } else {
                return "⚠️ Sorry, I didn't understand that. Please ask again or tap a suggestion below.";
            }
        }

        // 2. Greetings
        if ($intent === 'GREETING') {
            if ($isMr) {
                return "👋 नमस्कार! मी आपला निवडणूक व प्रचार सहाय्यक आहे. मी आपल्याला कशी मदत करू?";
            } else {
                return "👋 Hello! I am your Campaign & Field Operations Assistant. How can I help you today?";
            }
        }

        // 3. Citizen Not Found
        if ($intent === 'NOT_FOUND_CITIZEN') {
            $q = htmlspecialchars($d['query'] ?? '');
            if ($isMr) {
                return "⚠️ '{$q}' या नावाची किंवा क्रमांकाची नोंद सापडली नाही. कृपया तपासून पुन्हा मेसेज पाठवा.";
            } else {
                return "⚠️ No voter found for '{$q}'. Please check and send again.";
            }
        }

        // 4. Booth Not Found
        if ($intent === 'NOT_FOUND_BOOTH') {
            $b = htmlspecialchars($d['booth_no'] ?? '');
            if ($isMr) {
                return "⚠️ बूथ क्र. {$b} ची माहिती आढळली नाही. कृपया योग्य बूथ क्रमांक पाठवा.";
            } else {
                return "⚠️ Booth {$b} not found. Please check and send again.";
            }
        }

        // 5. Schemes Information
        if ($intent === 'SCHEMES_INFO') {
            $count = $d['citizens_with_schemes'] ?? 0;
            if ($isMr) {
                return "🏛️ **शासकीय योजना:** एकूण **{$count} लाभार्थी मतदार** नोंदणीकृत आहेत.";
            } else {
                return "🏛️ **Schemes:** Total **{$count} voter beneficiaries** registered.";
            }
        }

        // 6. Citizen Details
        if ($intent === 'CITIZEN_LOOKUP') {
            $c = $d['citizens'][0];
            $phone = $c->phone ?: ($isMr ? 'नाही' : 'N/A');
            $epic = $c->voter_id_number ?: '-';
            $sentiment = $c->sentiment_label_mr ?? $c->sentiment ?? '-';

            if ($isMr) {
                return "👤 **{$c->full_name_mr}**\n• मतदार क्र: `{$epic}`\n• मोबाईल: {$phone}\n• बूथ: {$c->booth_no}\n• राजकीय कल: 🟢 {$sentiment}";
            } else {
                return "👤 **{$c->full_name_mr}**\n• Voter ID: `{$epic}`\n• Phone: {$phone}\n• Booth: {$c->booth_no}\n• Sentiment: {$sentiment}";
            }
        }

        // 7. Booth Info
        if ($intent === 'BOOTH_INFO') {
            if (!empty($d['specific_booth'])) {
                $sb = $d['specific_booth'];
                if ($isMr) {
                    return "🗳️ **बूथ क्र. {$sb->booth_no} ({$sb->booth_name_mr})**\n• एकूण मतदार: **{$sb->total_voters}**\n• पाहणी: **{$sb->surveyed_voters}** ({$sb->coverage_pct}%)\n• प्रभारी: {$sb->incharge_name} ({$sb->incharge_phone})";
                } else {
                    return "🗳️ **Booth {$sb->booth_no} ({$sb->booth_name_en})**\n• Total Voters: **{$sb->total_voters}**\n• Surveyed: **{$sb->surveyed_voters}** ({$sb->coverage_pct}%)\n• Incharge: {$sb->incharge_name} ({$sb->incharge_phone})";
                }
            }

            $totalBooths = $d['total_booths'];
            $topList = "";
            $count = 0;
            foreach ($d['top_booths'] as $tb) {
                if (++$count > 3) break;
                $topList .= "• {$tb->booth_no} ({$tb->village_mr}): {$tb->coverage_pct}% पाहणी\n";
            }

            if ($isMr) {
                return "🗳️ एकूण **{$totalBooths} बूथ** सक्रिय आहेत.\nआघाडीवरील बूथ:\n" . rtrim($topList);
            } else {
                $enTopList = "";
                $count = 0;
                foreach ($d['top_booths'] as $tb) {
                    if (++$count > 3) break;
                    $enTopList .= "• Booth {$tb->booth_no}: {$tb->coverage_pct}% coverage\n";
                }
                return "🗳️ Total **{$totalBooths} booths** active.\nTop performing booths:\n" . rtrim($enTopList);
            }
        }

        // 8. Civic Issues
        if ($intent === 'CIVIC_ISSUES') {
            $tot = $d['total_issues'];
            $pend = $d['pending_issues'];
            $res = $d['resolved_issues'];

            if ($isMr) {
                return "⚠️ **नागरी समस्या:**\n• एकूण: **{$tot}** (प्रलंबित: 🔴 **{$pend}**, निवारण: 🟢 **{$res}**)";
            } else {
                return "⚠️ **Civic Issues:**\n• Total: **{$tot}** (Pending: 🔴 **{$pend}**, Resolved: 🟢 **{$res}**)";
            }
        }

        // 9. Karyakartas
        if ($intent === 'KARYAKARTAS') {
            $tot = $d['total_karyakartas'];
            $act = $d['active_karyakartas'];

            $kList = "";
            $count = 0;
            foreach ($d['top_karyakartas'] as $k) {
                if (++$count > 3) break;
                $kList .= "• {$k->name} ({$k->total_surveys} सर्व्हे)\n";
            }

            if ($isMr) {
                return "👥 **कार्यकर्ते:** एकूण **{$tot}** (सक्रिय: **{$act}**)\nआघाडीचे कार्यकर्ते:\n" . rtrim($kList);
            } else {
                $enKList = "";
                $count = 0;
                foreach ($d['top_karyakartas'] as $k) {
                    if (++$count > 3) break;
                    $enKList .= "• {$k->name} ({$k->total_surveys} surveys)\n";
                }
                return "👥 **Field Workers:** Total **{$tot}** (Active: **{$act}**)\nTop performers:\n" . rtrim($enKList);
            }
        }

        // 10. Submissions & Approvals
        if ($intent === 'SUBMISSIONS_APPROVAL') {
            $tot = $d['total_submissions'];
            $pend = $d['pending_approvals'];
            $app = $d['approved_count'];

            if ($isMr) {
                return "📋 **सर्व्हे नोंदी:** एकूण **{$tot}** (प्रलंबित: 🟠 **{$pend}**, मंजूर: 🟢 **{$app}**)";
            } else {
                return "📋 **Survey Submissions:** Total **{$tot}** (Pending: 🟠 **{$pend}**, Approved: 🟢 **{$app}**)";
            }
        }

        // 11. Official Documents
        if ($intent === 'OFFICIAL_DOCUMENTS') {
            $tot = $d['total_documents'];
            if ($isMr) {
                return "📁 **दस्तऐवज:** केंद्रीय भांडारात एकूण **{$tot} अधिकृत फाइल्स** उपलब्ध आहेत.";
            } else {
                return "📁 **Documents:** Total **{$tot} official files** available in repository.";
            }
        }

        // 12. General Overview
        if ($isMr) {
            return "📊 **मोहीम सद्यस्थिती:**\n• एकूण मतदार: **{$d['citizens_total']}** (अनुकूल: **{$d['sentiment_anukul']}**)\n• सक्रिय बूथ: **{$d['total_booths']}**\n• कार्यकर्ते: **{$d['total_karyakartas']}**\n• नागरी समस्या: **{$d['pending_issues']}** प्रलंबित\n• चालू प्रकल्प: **{$d['total_projects']}**";
        } else {
            return "📊 **Campaign Summary:**\n• Voters: **{$d['citizens_total']}** ({$d['sentiment_anukul']} favorable)\n• Booths: **{$d['total_booths']}**\n• Workers: **{$d['total_karyakartas']}**\n• Pending Issues: **{$d['pending_issues']}**\n• Projects: **{$d['total_projects']}**";
        }
    }

    /**
     * Calls Gemini API (Model: gemini-2.5-flash).
     * 1st check DB facts when matched, then check other side (general political/campaign help) if outside DB.
     */
    private function queryGeminiApi(string $userPrompt, array $contextData, bool $isMr, bool $hasDbMatch): ?string
    {
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) return null;

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";
            $langInstruction = $isMr 
                ? "Reply strictly in simple, natural Marathi (मराठी)." 
                : "Reply strictly in simple, natural English.";

            if ($hasDbMatch) {
                // Priority 1: Grounded in verified MySQL database facts
                $factsJson = json_encode($contextData['data'], JSON_UNESCAPED_UNICODE);
                $systemPrompt = "You are the AI Campaign Assistant for a Maharashtra election management system.\n" .
                    "VERIFIED DATABASE FACTS:\n{$factsJson}\n\n" .
                    "{$langInstruction}\n\n" .
                    "STRICT RULES FOR SMS-STYLE RESPONSE (NON-TECHNICAL USER):\n" .
                    "1. Answer using ONLY the verified database facts above.\n" .
                    "2. Keep your response VERY SIMPLE, SHORT, and CRISP (maximum 2 to 4 bullet points or short lines, SMS-style).\n" .
                    "3. NEVER mention technical jargon like 'MySQL', 'database table', 'records', 'JSON', or 'HQ'.\n" .
                    "4. Use simple emojis at line beginnings (e.g. 📊, 🗳️, 👥, ⚠️, 👤).\n" .
                    "5. No long introductions or conclusions. Give the exact numbers directly.";
            } else {
                // Priority 2: Outside database ("Check other side" - Campaign strategy, slogans, speeches, advice)
                $systemPrompt = "You are the expert AI Political Campaign & Strategy Advisor for Maharashtra elections.\n" .
                    "The user is asking for campaign strategy, slogans, speech points, rally planning, door-to-door tips, code of conduct, or general advice (outside the local database records).\n\n" .
                    "{$langInstruction}\n\n" .
                    "STRICT RULES FOR SMS-STYLE RESPONSE (NON-TECHNICAL USER):\n" .
                    "1. Provide practical, high-impact, actionable guidance directly.\n" .
                    "2. Keep your response VERY SIMPLE, SHORT, and CRISP (maximum 2 to 4 short bullet points, SMS-style).\n" .
                    "3. Absolutely NO long essays, NO markdown headers (# or ##), and NO heavy academic words.\n" .
                    "4. Use motivating, field-friendly tone with emojis (e.g. 📢, 🎯, 💡, 🤝).\n" .
                    "5. Easy to read in 5 seconds on a mobile screen.";
            }

            $res = Http::withoutVerifying()->timeout(15)->post($url, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $systemPrompt . "\n\nUser Question: " . $userPrompt],
                        ],
                    ],
                ],
            ]);

            if ($res->successful()) {
                $candidates = $res->json('candidates');
                if (!empty($candidates[0]['content']['parts'][0]['text'])) {
                    return $candidates[0]['content']['parts'][0]['text'];
                }
            }
        } catch (\Throwable $e) {
            // Silently fallback to internal smart query engine
        }

        return null;
    }
}
