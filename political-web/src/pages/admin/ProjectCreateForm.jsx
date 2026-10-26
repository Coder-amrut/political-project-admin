import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../../api/axios';
import { translateTree } from '../../i18n/adminTranslations';
import InteractiveGeographicMap from '../../components/InteractiveGeographicMap';

const electionCategories = [
  { id: 'ALL', labelMr: 'सर्व निवडणुका', labelEn: 'All Elections', icon: '🗳️' },
  { id: 'LOCAL_BODY', labelMr: 'स्थानिक स्वराज्य संस्था', labelEn: 'Municipal & Local', icon: '🏢' },
  { id: 'RURAL', labelMr: 'जि.प., पं.स. व ग्रामपंचायत', labelEn: 'Rural & Panchayats', icon: '🚜' },
  { id: 'STATE', labelMr: 'राज्य विधानमंडळ', labelEn: 'State Legislature', icon: '🏛️' },
  { id: 'PARLIAMENTARY', labelMr: 'संसदीय व राष्ट्रीय', labelEn: 'Parliamentary & National', icon: '🇮🇳' },
  { id: 'ADMIN', labelMr: 'बूथ व जिल्हा स्तर', labelEn: 'Booth & District', icon: '📍' },
];

const scopes = [
  // १. लोकसभा
  {
    value: 'LOK_SABHA',
    numberMr: '१',
    numberEn: '1',
    titleMr: '१. लोकसभा निवडणूक',
    titleEn: '1. Lok Sabha Election',
    levelMr: 'संसदीय मतदारसंघ स्तर (Parliamentary Constituency Level)',
    levelEn: 'Parliamentary Constituency Level',
    levelBadgeMr: 'संसदीय स्तर',
    levelBadgeEn: 'Parliamentary',
    votersMr: 'मतदारसंघातील १८ वर्षांवरील सर्व नागरिक (थेट मतदान)',
    votersEn: 'All registered citizens 18+ years (Direct Vote)',
    repMr: 'लोकसभा खासदार (MP)',
    repEn: 'Member of Parliament (MP)',
    category: 'PARLIAMENTARY',
    categoryNameMr: 'संसदीय व राष्ट्रीय',
    categoryNameEn: 'Parliamentary & National',
    icon: '🏛️',
  },
  // २. विधानसभा
  {
    value: 'ASSEMBLY',
    numberMr: '२',
    numberEn: '2',
    titleMr: '२. विधानसभा निवडणूक',
    titleEn: '2. Legislative Assembly Election',
    levelMr: 'विधानसभा मतदारसंघ स्तर (Assembly Constituency Level)',
    levelEn: 'Assembly Constituency Level',
    levelBadgeMr: 'विधानसभा स्तर',
    levelBadgeEn: 'Assembly',
    votersMr: 'मतदारसंघातील १८ वर्षांवरील सर्व नागरिक (थेट मतदान)',
    votersEn: 'All registered citizens 18+ years (Direct Vote)',
    repMr: 'विधानसभा आमदार (MLA)',
    repEn: 'Member of Legislative Assembly (MLA)',
    category: 'STATE',
    categoryNameMr: 'राज्य विधानमंडळ',
    categoryNameEn: 'State Legislature',
    icon: '🏛️',
  },
  // ३. पदवीधर मतदारसंघ
  {
    value: 'GRADUATE_CONSTITUENCY',
    numberMr: '३',
    numberEn: '3',
    titleMr: '३. पदवीधर मतदारसंघ निवडणूक',
    titleEn: '3. Graduate Constituency Election',
    levelMr: 'पदवीधर मतदारसंघ स्तर (Graduate Constituency Level)',
    levelEn: 'Graduate Constituency Level',
    levelBadgeMr: 'पदवीधर',
    levelBadgeEn: 'Graduate',
    votersMr: 'नोंदणीकृत पदवीधर नागरिक (३ वर्षे पदवी पूर्ण)',
    votersEn: 'Registered Graduates (3+ years post degree)',
    repMr: 'विधान परिषद आमदार (MLC)',
    repEn: 'Member of Legislative Council (MLC)',
    category: 'STATE',
    categoryNameMr: 'राज्य विधानमंडळ',
    categoryNameEn: 'State Legislature',
    icon: '🎓',
  },
  // ४. शिक्षक मतदारसंघ
  {
    value: 'TEACHER_CONSTITUENCY',
    numberMr: '४',
    numberEn: '4',
    titleMr: '४. शिक्षक मतदारसंघ निवडणूक',
    titleEn: '4. Teacher Constituency Election',
    levelMr: 'शिक्षक मतदारसंघ स्तर (Teacher Constituency Level)',
    levelEn: 'Teacher Constituency Level',
    levelBadgeMr: 'शिक्षक',
    levelBadgeEn: 'Teacher',
    votersMr: 'नोंदणीकृत माध्यमिक व उच्च माध्यमिक शिक्षक',
    votersEn: 'Registered Secondary & Higher Secondary Teachers',
    repMr: 'विधान परिषद आमदार (MLC)',
    repEn: 'Member of Legislative Council (MLC)',
    category: 'STATE',
    categoryNameMr: 'राज्य विधानमंडळ',
    categoryNameEn: 'State Legislature',
    icon: '📚',
  },
  // ५. स्थानिक स्वराज्य संस्था निवडणूक
  {
    value: 'LOCAL_AUTHORITIES',
    numberMr: '५',
    numberEn: '5',
    titleMr: '५. स्थानिक स्वराज्य संस्था निवडणूक',
    titleEn: '5. Local Authorities\' Election',
    levelMr: 'स्थानिक प्राधिकारी मतदारसंघ स्तर (Local Authorities Level)',
    levelEn: 'Local Authorities Level',
    levelBadgeMr: 'स्थानिक संस्था',
    levelBadgeEn: 'Local Bodies',
    votersMr: 'नगरसेवक, जिल्हा परिषद सदस्य, नगरपंचायत सदस्य (अप्रत्यक्ष मतदान)',
    votersEn: 'Corporators, ZP Members, Nagar Panchayat Members (Indirect Vote)',
    repMr: 'विधान परिषद आमदार (MLC)',
    repEn: 'Member of Legislative Council (MLC)',
    category: 'STATE',
    categoryNameMr: 'राज्य विधानमंडळ',
    categoryNameEn: 'State Legislature',
    icon: '🏢',
  },
  // ६. विधानसभा आमदार कोटा निवडणूक
  {
    value: 'MLA_QUOTA',
    numberMr: '६',
    numberEn: '6',
    titleMr: '६. विधानसभा आमदार कोटा निवडणूक',
    titleEn: '6. MLA Quota Election',
    levelMr: 'विधानसभा आमदार कोटा स्तर (State Assembly MLA Quota Level)',
    levelEn: 'State Assembly MLA Quota Level',
    levelBadgeMr: 'आमदार कोटा',
    levelBadgeEn: 'MLA Quota',
    votersMr: 'राज्याचे निवडून आलेले विधानसभा आमदार (MLAs)',
    votersEn: 'Elected Members of Legislative Assembly (MLAs)',
    repMr: 'विधान परिषद आमदार (MLC)',
    repEn: 'Member of Legislative Council (MLC)',
    category: 'STATE',
    categoryNameMr: 'राज्य विधानमंडळ',
    categoryNameEn: 'State Legislature',
    icon: '🗳️',
  },
  // ७. राष्ट्रपती निवडणूक
  {
    value: 'PRESIDENTIAL',
    numberMr: '७',
    numberEn: '7',
    titleMr: '७. राष्ट्रपती निवडणूक',
    titleEn: '7. Presidential Election',
    levelMr: 'राष्ट्रीय / देश पातळी स्तर (National / All-India Level)',
    levelEn: 'National / All-India Level',
    levelBadgeMr: 'राष्ट्रीय स्तर',
    levelBadgeEn: 'National',
    votersMr: 'सर्व राज्यातील विधानसभा आमदार (MLAs) आणि संसदेचे खासदार (MPs)',
    votersEn: 'Elected MLAs of all States & MPs of Parliament',
    repMr: 'भारताचे राष्ट्रपती',
    repEn: 'President of India',
    category: 'PARLIAMENTARY',
    categoryNameMr: 'संसदीय व राष्ट्रीय',
    categoryNameEn: 'Parliamentary & National',
    icon: '🇮🇳',
  },
  // ८. उपराष्ट्रपती निवडणूक
  {
    value: 'VICE_PRESIDENTIAL',
    numberMr: '८',
    numberEn: '8',
    titleMr: '८. उपराष्ट्रपती निवडणूक',
    titleEn: '8. Vice-Presidential Election',
    levelMr: 'संसदीय / राष्ट्रीय स्तर (Parliamentary / National Level)',
    levelEn: 'Parliamentary / National Level',
    levelBadgeMr: 'राष्ट्रीय स्तर',
    levelBadgeEn: 'National',
    votersMr: 'लोकसभेचे आणि राज्यसभेचे सर्व खासदार (MPs)',
    votersEn: 'All Members of Parliament (Lok Sabha & Rajya Sabha MPs)',
    repMr: 'भारताचे उपराष्ट्रपती',
    repEn: 'Vice-President of India',
    category: 'PARLIAMENTARY',
    categoryNameMr: 'संसदीय व राष्ट्रीय',
    categoryNameEn: 'Parliamentary & National',
    icon: '🇮🇳',
  },
  // ९. राज्यसभा निवडणूक
  {
    value: 'RAJYA_SABHA',
    numberMr: '९',
    numberEn: '9',
    titleMr: '९. राज्यसभा निवडणूक',
    titleEn: '9. Rajya Sabha Election',
    levelMr: 'राज्य स्तर (State Legislative Assembly Level)',
    levelEn: 'State Legislative Assembly Level',
    levelBadgeMr: 'राज्य स्तर',
    levelBadgeEn: 'State Level',
    votersMr: 'राज्याचे विधानसभा आमदार (MLAs)',
    votersEn: 'Elected State MLAs',
    repMr: 'राज्यसभा खासदार (MP)',
    repEn: 'Member of Rajya Sabha (MP)',
    category: 'PARLIAMENTARY',
    categoryNameMr: 'संसदीय व राष्ट्रीय',
    categoryNameEn: 'Parliamentary & National',
    icon: '🏛️',
  },
  // १०. महानगरपालिका निवडणूक
  {
    value: 'MUNICIPAL_CORPORATION',
    numberMr: '१०',
    numberEn: '10',
    titleMr: '१०. महानगरपालिका निवडणूक',
    titleEn: '10. Municipal Corporation Election',
    levelMr: 'महानगरपालिका / शहर स्तर (Municipal Corporation City Level)',
    levelEn: 'Municipal Corporation City Level',
    levelBadgeMr: 'महानगरपालिका',
    levelBadgeEn: 'M Corp',
    votersMr: 'शहरातील १८ वर्षांवरील सर्व नागरिक',
    votersEn: 'All City Citizens 18+ years',
    repMr: 'नगरसेवक (Corporator / Councillor)',
    repEn: 'Corporator / Municipal Councillor',
    category: 'LOCAL_BODY',
    categoryNameMr: 'स्थानिक स्वराज्य संस्था',
    categoryNameEn: 'Municipal & Local Bodies',
    icon: '🏙️',
  },
  // ११. नगरपालिका / नगरपरिषद निवडणूक
  {
    value: 'MUNICIPAL_COUNCIL',
    numberMr: '११',
    numberEn: '11',
    titleMr: '११. नगरपालिका / नगरपरिषद निवडणूक',
    titleEn: '11. Municipal Council Election',
    levelMr: 'नगरपालिका / नगरपरिषद / शहर स्तर (Municipal Council Town Level)',
    levelEn: 'Municipal Council Town Level',
    levelBadgeMr: 'नगरपरिषद',
    levelBadgeEn: 'Municipal',
    votersMr: 'संबंधित शहरातील नागरिक',
    votersEn: 'Citizens of the Town / Municipal Area',
    repMr: 'नगरसेवक आणि नगराध्यक्ष',
    repEn: 'Municipal President & Councillors',
    category: 'LOCAL_BODY',
    categoryNameMr: 'स्थानिक स्वराज्य संस्था',
    categoryNameEn: 'Municipal & Local Bodies',
    icon: '🏘️',
  },
  // १२. जिल्हा परिषद निवडणूक
  {
    value: 'ZILLA_PARISHAD',
    numberMr: '१२',
    numberEn: '12',
    titleMr: '१२. जिल्हा परिषद निवडणूक',
    titleEn: '12. Zilla Parishad Election',
    levelMr: 'जिल्हा परिषद ग्रामीण स्तर (District Rural / ZP Level)',
    levelEn: 'District Rural / Zilla Parishad Level',
    levelBadgeMr: 'जि.प. ग्रामीण',
    levelBadgeEn: 'ZP Rural',
    votersMr: 'ग्रामीण भागातील संबंधित गटातील नागरिक',
    votersEn: 'Rural Citizens of the Electoral ZP Gat',
    repMr: 'जिल्हा परिषद सदस्य (ZP Member)',
    repEn: 'Zilla Parishad Member',
    category: 'RURAL',
    categoryNameMr: 'जि.प., पं.स. व ग्रामपंचायत',
    categoryNameEn: 'Rural & Panchayats',
    icon: '🚜',
  },
  // १३. पंचायत समिती निवडणूक
  {
    value: 'PANCHAYAT_SAMITI',
    numberMr: '१३',
    numberEn: '13',
    titleMr: '१३. पंचायत समिती निवडणूक',
    titleEn: '13. Panchayat Samiti Election',
    levelMr: 'पंचायत समिती तालुका ग्रामीण स्तर (Taluka Block Rural Level)',
    levelEn: 'Taluka Block Rural Level',
    levelBadgeMr: 'पं.स. तालुका',
    levelBadgeEn: 'Panchayat Samiti',
    votersMr: 'ग्रामीण भागातील संबंधित गणातील नागरिक',
    votersEn: 'Rural Citizens of the Electoral PS Gan',
    repMr: 'पंचायत समिती सदस्य',
    repEn: 'Panchayat Samiti Member',
    category: 'RURAL',
    categoryNameMr: 'जि.प., पं.स. व ग्रामपंचायत',
    categoryNameEn: 'Rural & Panchayats',
    icon: '🌾',
  },
  // १४. ग्रामपंचायत निवडणूक
  {
    value: 'GRAM_PANCHAYAT',
    numberMr: '१४',
    numberEn: '14',
    titleMr: '१४. ग्रामपंचायत निवडणूक',
    titleEn: '14. Gram Panchayat Election',
    levelMr: 'ग्रामपंचायत / गाव स्तर (Village / Gram Panchayat Level)',
    levelEn: 'Village / Gram Panchayat Level',
    levelBadgeMr: 'गाव स्तर',
    levelBadgeEn: 'Village',
    votersMr: 'गावातील १८ वर्षांवरील सर्व नागरिक',
    votersEn: 'All Village Citizens 18+ years',
    repMr: 'ग्रामपंचायत सदस्य आणि सरपंच',
    repEn: 'Sarpanch & Gram Panchayat Members',
    category: 'RURAL',
    categoryNameMr: 'जि.प., पं.स. व ग्रामपंचायत',
    categoryNameEn: 'Rural & Panchayats',
    icon: '🏡',
  },
  // १५. मतदान केंद्र / बूथ स्तर
  {
    value: 'POLLING_STATION',
    numberMr: '१५',
    numberEn: '15',
    titleMr: '१५. मतदान केंद्र / बूथ स्तर',
    titleEn: '15. Polling Station / Booth Level',
    levelMr: 'मतदान केंद्र / बूथ स्तर (Polling Station / Booth Level)',
    levelEn: 'Polling Station / Booth Level',
    levelBadgeMr: 'बूथ स्तर',
    levelBadgeEn: 'Booth',
    votersMr: 'संबंधित मतदान केंद्रातील सर्व मतदार',
    votersEn: 'All Voters Registered at Polling Booth',
    repMr: 'बूथ प्रमुख / बीएलओ / यादी प्रमुख',
    repEn: 'Booth Head / BLO / Station Coordinator',
    category: 'ADMIN',
    categoryNameMr: 'बूथ व जिल्हा स्तर',
    categoryNameEn: 'Booth & District',
    icon: '▦',
  },
  // १६. जिल्हा प्रशासकीय स्तर
  {
    value: 'DISTRICT',
    numberMr: '१६',
    numberEn: '16',
    titleMr: '१६. जिल्हा प्रशासकीय स्तर',
    titleEn: '16. District Administrative Level',
    levelMr: 'जिल्हा प्रशासकीय स्तर (District Administrative Level)',
    levelEn: 'District Administrative Level',
    levelBadgeMr: 'जिल्हा स्तर',
    levelBadgeEn: 'District',
    votersMr: 'संपूर्ण जिल्ह्यातील सर्व नागरिक व मतदार',
    votersEn: 'All Citizens and Voters in the District',
    repMr: 'जिल्हा प्रशासन / मुख्य समन्वयक',
    repEn: 'District Coordinator / Administration',
    category: 'ADMIN',
    categoryNameMr: 'बूथ व जिल्हा स्तर',
    categoryNameEn: 'Booth & District',
    icon: '▤',
  },
];

const style = {
  card: { background: '#fff', border: '1px solid #e3e8ef', borderRadius: 12, padding: 22, boxSizing: 'border-box', width: '100%', maxWidth: '100%', minWidth: 0 },
  label: { display: 'block', marginBottom: 14, color: '#334155', fontWeight: 650, fontSize: 13, width: '100%', maxWidth: '100%', boxSizing: 'border-box' },
  input: { display: 'block', boxSizing: 'border-box', width: '100%', maxWidth: '100%', minWidth: 0, marginTop: 6, padding: '10px 12px', border: '1px solid #cfd8e3', borderRadius: 8, font: 'inherit', color: '#142033' },
  muted: { color: '#64748b', fontSize: 13 },
  button: { border: 0, borderRadius: 8, padding: '11px 17px', background: '#2457d6', color: '#fff', cursor: 'pointer', fontWeight: 700 },
};

const stateNameMrMap = {
  '01': 'जम्मू आणि काश्मीर',
  '02': 'हिमाचल प्रदेश',
  '03': 'पंजाब',
  '04': 'चंदिगढ',
  '05': 'उत्तराखंड',
  '06': 'हरियाणा',
  '07': 'दिल्ली (NCT)',
  '08': 'राजस्थान',
  '09': 'उत्तर प्रदेश',
  '10': 'बिहार',
  '11': 'सिक्कीम',
  '12': 'अरुणाचल प्रदेश',
  '13': 'नागालँड',
  '14': 'मणिपूर',
  '15': 'मिझोरम',
  '16': 'त्रिपुरा',
  '17': 'मेघालय',
  '18': 'आसाम',
  '19': 'पश्चिम बंगाल',
  '20': 'झारखंड',
  '21': 'ओडिशा',
  '22': 'छत्तीसगड',
  '23': 'मध्य प्रदेश',
  '24': 'गुजरात',
  '27': 'महाराष्ट्र',
  '28': 'आंध्र प्रदेश',
  '29': 'कर्नाटक',
  '30': 'गोवा',
  '32': 'केरळ',
  '33': 'तामिळनाडू',
  '34': 'पुडुचेरी',
  '36': 'तेलंगणा',
  '37': 'लडाख',
};

function SearchPicker({ label, endpoint, params = {}, value, onSelect, onClear, disabled = false, placeholder, noResultsText = 'No matching records found.', language = 'en', onViewMap = null }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const paramsKey = JSON.stringify(params);

  const itemTitle = (item) => {
    if (!item) return '';
    if (item.part_no) return `Part No. ${item.part_no}`;
    if (item.state_name) {
      if (language === 'mr' && (stateNameMrMap[item.state_code] || item.name_mr)) {
        return stateNameMrMap[item.state_code] || item.name_mr;
      }
      return item.state_name;
    }
    if (item.local_body_name) return item.local_body_name;
    if (item.village_name) return item.village_name;
    if (item.taluka_name) return item.taluka_name;
    if (item.district_name) return language === 'mr' && item.district_name_mr ? item.district_name_mr : (item.district_name || item.name_en || item.name);
    if (item.name_mr && language === 'mr') return item.name_mr;
    if (item.code) return `${item.code} — ${item.name_en || item.name || item.name_mr || ''}`;
    return item.name_en || item.name || item.name_mr || '';
  };

  const itemSub = (item) => {
    if (!item) return null;
    if (item.state_code) return `${language === 'mr' ? 'राज्य कोड' : 'State Code'}: ${item.state_code}`;
    if (item.village_name && item.population) return `${language === 'mr' ? 'लोकसंख्या' : 'Population'}: ${Number(item.population).toLocaleString()} | ${language === 'mr' ? 'एकूण मतदार' : 'Voters'}: ${Number(item.total_voters || 0).toLocaleString()}`;
    if (item.local_body_type) {
      const typeMap = {
        M: language === 'mr' ? 'महानगरपालिका' : 'Municipal Corporation',
        C: language === 'mr' ? 'नगरपरिषद / नगरपालिका' : 'Municipal Council',
        N: language === 'mr' ? 'नगरपंचायत' : 'Nagar Panchayat',
        G: language === 'mr' ? 'ग्रामपंचायत' : 'Gram Panchayat',
        B: language === 'mr' ? 'कॅन्टोन्मेंट बोर्ड' : 'Cantonment Board'
      };
      return typeMap[item.local_body_type] || item.local_body_type;
    }
    if (item.district_name && item.district_name !== item.name_en) return item.district_name;
    if (item.name_mr && language !== 'mr') return item.name_mr;
    return null;
  };

  useEffect(() => {
    if (disabled || !endpoint) {
      setResults([]);
      setError('');
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = {
          ...JSON.parse(paramsKey),
          ...(search.trim() ? { search: search.trim() } : {}),
        };
        const { data } = await apiClient.get(endpoint, { params: queryParams });
        if (!cancelled) setResults(data.data || []);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || 'Could not load options.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search.trim() ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [endpoint, paramsKey, search, disabled]);

  return translateTree(<div style={{ marginBottom: 18 }}>
    <label style={style.label}>{label}</label>
    {value ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', border: '1px solid #8da9e8', borderRadius: 9, background: '#f7f9ff', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#17253c', fontSize: 14, wordBreak: 'break-word' }}>{itemTitle(value)}</div>
          {itemSub(value) && <div style={{ ...style.muted, marginTop: 3 }}>{itemSub(value)}</div>}
          {value.part_no && <div style={style.muted}>{value.name_en}{value.election_year ? ` · Election ${value.election_year}` : ''}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          {onViewMap && (
            <button
              type="button"
              onClick={() => onViewMap(value)}
              title={language === 'mr' ? 'हा भाग नकाशावर पहा' : 'View on Map'}
              style={{
                border: '1px solid #93c5fd',
                background: '#eff6ff',
                borderRadius: 6,
                padding: '6px 12px',
                color: '#1d4ed8',
                fontSize: 12.5,
                cursor: 'pointer',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 1px 2px rgba(29, 78, 216, 0.1)'
              }}
            >
              <span>🗺️</span>
              <span>{language === 'mr' ? 'नकाशा पहा' : 'View Map'}</span>
            </button>
          )}
          <button type="button" onClick={() => { onClear?.(); setSearch(''); }} aria-label={`Clear ${label}`} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, padding: '6px 12px', color: '#334155', fontSize: 13, cursor: 'pointer', fontWeight: 650 }}>
            {language === 'mr' ? 'बदला' : 'Change'}
          </button>
        </div>
      </div>
    ) : (
      <div style={{ border: '1px solid #d7deea', borderRadius: 9, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #edf0f5', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>🔍</span>
          <input
            disabled={disabled}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={disabled ? (language === 'mr' ? 'आधी आवश्यक पर्याय निवडा' : 'Choose the required filters first') : (placeholder || (language === 'mr' ? 'शोधा...' : 'Search or filter options...'))}
            style={{ ...style.input, margin: 0, padding: '7px 9px', background: disabled ? '#f1f5f9' : '#fff', border: '1px solid #cfd8e3', flex: 1, fontSize: 13 }}
            autoComplete="off"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: '0 4px' }} title="Clear filter">×</button>
          )}
        </div>
        <div role="listbox" style={{ maxHeight: 230, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 14, ...style.muted, textAlign: 'center' }}>{language === 'mr' ? 'माहिती लोड होत आहे…' : 'Loading options…'}</div>
          ) : error ? (
            <div role="alert" style={{ padding: 14, color: '#b42318', fontSize: 13 }}>{error}</div>
          ) : results.length ? (
            results.map((item) => (
              <button
                key={`${item.code || item.id || item.state_code || item.local_body_code || item.village_code}-${item.election_year || ''}`}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => { onSelect(item); setSearch(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  border: 0,
                  borderBottom: '1px solid #edf0f5',
                  background: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f8ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                <div>
                  <span style={{ display: 'block', fontWeight: 650, color: '#17253c', fontSize: 13 }}>{itemTitle(item)}</span>
                  {itemSub(item) && <span style={{ display: 'block', color: '#64748b', fontSize: 12, marginTop: 2 }}>{itemSub(item)}</span>}
                  {item.part_no && <span style={{ display: 'block', color: '#64748b', fontSize: 12, marginTop: 2 }}>{item.name_en}</span>}
                </div>
                <span style={{ color: '#2457d6', fontSize: 12, fontWeight: 700 }}>{language === 'mr' ? 'निवडा →' : 'Select →'}</span>
              </button>
            ))
          ) : (
            <div style={{ padding: 16, ...style.muted, textAlign: 'center' }}>{noResultsText}</div>
          )}
        </div>
        <div style={{ padding: '6px 12px', background: '#f8fafc', borderTop: '1px solid #edf0f5', fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>{results.length} {language === 'mr' ? 'पर्याय उपलब्ध' : `option${results.length === 1 ? '' : 's'} available`}</span>
          <span>{language === 'mr' ? 'निवडण्यासाठी क्लिक करा' : 'Click any option to select'}</span>
        </div>
      </div>
    )}
  </div>, language);
}

function MultiSearchPicker({ label, endpoint, params = {}, value = [], onChange, disabled = false, placeholder, noResultsText = 'No matching records found.', language = 'en', onViewMap = null, pickerType = '' }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const paramsKey = JSON.stringify(params);
  const normalize = (item) => {
    const code = String(item.local_body_code ?? item.village_code ?? item.taluka_code ?? item.code ?? item.district_code ?? item.part_no ?? item.id ?? '');
    const name_en = item.local_body_name || item.village_name || item.taluka_name || item.district_name || item.name_en || item.name || (item.part_no ? `Part No. ${item.part_no}` : code);
    return { ...item, code, name_en };
  };

  useEffect(() => {
    if (disabled || !endpoint) {
      setResults([]);
      setError('');
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(endpoint, { params: { ...JSON.parse(paramsKey), per_page: 2000, ...(search.trim() ? { search: search.trim() } : {}) } });
        if (!cancelled) setResults((data.data || []).map(normalize));
        if (!cancelled) setError('');
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || 'Could not load records.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search.trim() ? 250 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [endpoint, paramsKey, search, disabled]);

  const toggle = (item) => {
    if (value.some((selected) => selected.code === item.code)) {
      onChange(value.filter((selected) => selected.code !== item.code));
    } else {
      onChange([...value, item]);
    }
  };

  return translateTree(<div style={{ marginBottom: 18 }}>
    <label style={style.label}>{label}</label>
    {value.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 8, alignItems: 'center' }}>
      {value.map((item, idx) => <span key={item.code || item.id || `sel_${idx}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 20, background: '#eaf0ff', color: '#24469a', fontSize: 12.5, fontWeight: 600 }}>
        <span>{item.part_no ? `Part No. ${item.part_no}` : item.name_en}</span>
        {item.type_label ? <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>({item.type_label})</span> : null}
        {onViewMap && (
          <button
            type="button"
            onClick={() => onViewMap(item, pickerType)}
            title={language === 'mr' ? 'हा भाग नकाशावर पहा' : 'View on Map'}
            style={{
              border: '1px solid #bfdbfe',
              background: '#ffffff',
              color: '#1d4ed8',
              borderRadius: '50%',
              width: 19,
              height: 19,
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            🗺️
          </button>
        )}
        <button type="button" onClick={() => onChange(value.filter((selected) => selected.code !== item.code))} aria-label={`Remove ${item.name_en}`} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', fontSize: 15, lineHeight: 1 }}>×</button>
      </span>)}
      {onViewMap && value.length > 0 && (
        <button
          type="button"
          onClick={() => onViewMap(value[value.length - 1], pickerType)}
          title={language === 'mr' ? 'नकाशावर पहा' : 'View on Map'}
          style={{
            border: '1px solid #93c5fd',
            background: '#f0fdf4',
            color: '#15803d',
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>🗺️</span>
          <span>{language === 'mr' ? 'नकाशा पहा' : 'View Map'}</span>
        </button>
      )}
      {value.length > 1 && (
        <button
          type="button"
          onClick={() => onChange([])}
          style={{ border: 0, background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '2px 6px', textDecoration: 'underline' }}
        >
          Clear All
        </button>
      )}
    </div>}
    <div style={{ border: '1px solid #d7deea', borderRadius: 9, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #edf0f5', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>🔍</span>
        <input
          disabled={disabled}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={disabled ? 'Choose the required filters first' : (placeholder || 'Filter options...')}
          style={{ ...style.input, margin: 0, padding: '7px 9px', background: disabled ? '#f1f5f9' : '#fff', border: '1px solid #cfd8e3', flex: 1, fontSize: 13 }}
          autoComplete="off"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: '0 4px' }} title="Clear filter">×</button>
        )}
      </div>
      <div role="listbox" aria-multiselectable="true" style={{ maxHeight: 200, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 13, ...style.muted, textAlign: 'center' }}>Loading…</div>
        ) : error ? (
          <div role="alert" style={{ padding: 13, color: '#b42318', fontSize: 13 }}>{error}</div>
        ) : results.length ? (
          results.map((item, idx) => {
            const selected = value.some((existing) => existing.code === item.code);
            return (
              <button
                key={item.code || item.id || `opt_${idx}`}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggle(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                  width: '100%',
                  padding: '9px 12px',
                  border: 0,
                  borderBottom: '1px solid #edf0f5',
                  background: selected ? '#f3f6ff' : '#fff',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = '#fff'; }}
              >
                <span aria-hidden="true" style={{ width: 16, height: 16, flex: '0 0 16px', display: 'grid', placeItems: 'center', borderRadius: 4, border: selected ? '1px solid #315fce' : '1px solid #9aa8bb', background: selected ? '#315fce' : '#fff', color: '#fff', fontSize: 11, fontWeight: 700 }}>{selected ? '✓' : ''}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <b style={{ color: '#17253c', fontSize: 13 }}>{item.part_no ? `Part No. ${item.part_no} — ${item.name_en || ''}` : `${item.code} — ${item.name_en}`}</b>
                    {item.type_label && (
                      <span style={{ fontSize: 11, fontWeight: 650, padding: '1px 6px', borderRadius: 4, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                        {item.type_label}
                      </span>
                    )}
                  </span>
                  {item.name_mr && <span lang="mr" style={{ color: '#64748b', fontSize: 12 }}>{item.name_mr}</span>}
                </span>
              </button>
            );
          })
        ) : (
          <div style={{ padding: 13, ...style.muted, textAlign: 'center' }}>{noResultsText}</div>
        )}
      </div>
      <div style={{ padding: '6px 12px', background: '#f8fafc', borderTop: '1px solid #edf0f5', fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{results.length} available · {value.length} selected</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {results.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const map = new Map(value.map((v) => [v.code, v]));
                results.forEach((r) => map.set(r.code, r));
                onChange(Array.from(map.values()));
              }}
              style={{ border: 0, background: 'transparent', color: '#2457d6', cursor: 'pointer', fontSize: 12, fontWeight: 650, padding: 0 }}
            >
              Select All
            </button>
          )}
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              style={{ border: 0, background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 650, padding: 0 }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  </div>, language);
}

function ProjectCreateForm({ onCreated, language = 'en' }) {
  const isMr = language === 'mr';
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [scope, setScope] = useState('');
  const [target, setTarget] = useState(null);
  const [selectedState, setSelectedState] = useState({ state_code: '27', state_name: 'Maharashtra', name_en: 'Maharashtra', name_mr: 'महाराष्ट्र' });
  const [filterDistrict, setFilterDistrict] = useState(null);
  const [filterTaluka, setFilterTaluka] = useState(null);
  const [filterAssembly, setFilterAssembly] = useState(null);
  const [selectedLocalBody, setSelectedLocalBody] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [relatedAssemblies, setRelatedAssemblies] = useState([]);
  const [selectedAssemblies, setSelectedAssemblies] = useState([]);
  const [selectedTalukas, setSelectedTalukas] = useState([]);
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);
  const [relatedAssembliesLoading, setRelatedAssembliesLoading] = useState(false);
  const [relatedAssembliesError, setRelatedAssembliesError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [localUnitName, setLocalUnitName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Election Candidates State & Management
  const [electionCandidates, setElectionCandidates] = useState([]);
  const [showCandModal, setShowCandModal] = useState(false);
  const [editingCandIdx, setEditingCandIdx] = useState(null);
  const [candForm, setCandForm] = useState({
    candidate_name: '',
    party_name: '',
    party_symbol: '',
    candidate_photo: '',
    serial_number: 1,
    position: '',
    contact_phone: '',
    ward_village: '',
    voice_message: '',
    highlighted: false,
  });

  const QUICK_SYMBOLS = [
    { label: 'घड्याळ (Clock)', emoji: '⏰' },
    { label: 'कमळ (Lotus)', emoji: '🪷' },
    { label: 'धनुष्यबाण (Bow & Arrow)', emoji: '🏹' },
    { label: 'हात (Hand)', emoji: '✋' },
    { label: 'मशाल (Torch)', emoji: '🔥' },
    { label: 'ट्रॅक्टर (Tractor)', emoji: '🚜' },
    { label: 'सिंह (Lion)', emoji: '🦁' },
    { label: 'तराजू (Scale)', emoji: '⚖️' },
    { label: 'सूर्य (Sun)', emoji: '☀️' },
    { label: 'सायकल (Bicycle)', emoji: '🚲' },
    { label: 'विद्युत दिवा (Bulb)', emoji: '💡' },
    { label: 'रेल्वे इंजिन (Engine)', emoji: '🚂' },
    { label: 'विमान (Airplane)', emoji: '✈️' },
    { label: 'पतंग (Kite)', emoji: '🪁' },
  ];

  const handleCandFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCandForm((prev) => ({ ...prev, [field]: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const openAddCandModal = () => {
    setEditingCandIdx(null);
    setCandForm({
      candidate_name: '',
      party_name: '',
      party_symbol: '',
      candidate_photo: '',
      serial_number: electionCandidates.length + 1,
      position: '',
      contact_phone: '',
      ward_village: '',
      voice_message: '',
      highlighted: false,
    });
    setShowCandModal(true);
  };

  const openEditCandModal = (cand, idx) => {
    setEditingCandIdx(idx);
    setCandForm({
      candidate_name: cand.candidate_name || '',
      party_name: cand.party_name || '',
      party_symbol: cand.party_symbol || '',
      candidate_photo: cand.candidate_photo || '',
      serial_number: cand.serial_number || idx + 1,
      position: cand.position || '',
      contact_phone: cand.contact_phone || '',
      ward_village: cand.ward_village || '',
      voice_message: cand.voice_message || '',
      highlighted: Boolean(cand.highlighted),
    });
    setShowCandModal(true);
  };

  const handleSaveCandidate = (e) => {
    e.preventDefault();
    if (!candForm.candidate_name.trim()) {
      alert(isMr ? 'कृपया उमेदवाराचे नाव प्रविष्ट करा.' : 'Please enter candidate name.');
      return;
    }
    const cleanCand = {
      ...candForm,
      candidate_name: candForm.candidate_name.trim(),
      party_name: candForm.party_name.trim() || (isMr ? 'अपक्ष' : 'Independent'),
      party_symbol: candForm.party_symbol.trim() || '🗳️',
      serial_number: Number(candForm.serial_number) || (editingCandIdx !== null ? editingCandIdx + 1 : electionCandidates.length + 1),
    };
    if (editingCandIdx !== null) {
      setElectionCandidates((prev) => prev.map((item, i) => (i === editingCandIdx ? cleanCand : item)));
    } else {
      setElectionCandidates((prev) => [...prev, cleanCand]);
    }
    setShowCandModal(false);
  };

  const handleDeleteCandidate = (idx) => {
    if (window.confirm(isMr ? 'तुम्हाला हा उमेदवार हटवायचा आहे का?' : 'Are you sure you want to remove this candidate?')) {
      setElectionCandidates((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  // Map Feature States & Helpers
  const [activeMapTarget, setActiveMapTarget] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapMode, setMapMode] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [mapZoom, setMapZoom] = useState(13); // Zoom level: 6 (State) to 19 (Street)
  const [debouncedZoom, setDebouncedZoom] = useState(13);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapProvider, setMapProvider] = useState('google'); // 'google' | 'osm'
  const lastWheelTimeRef = useRef(0);

  useEffect(() => {
    setMapLoading(true);
    const t = setTimeout(() => {
      setDebouncedZoom(mapZoom);
    }, 250);
    return () => clearTimeout(t);
  }, [mapZoom]);

  const getTargetDefaultZoom = (mTarget) => {
    if (!mTarget) return 13;
    if (mTarget.type === 'STATE') return 7;
    if (mTarget.type === 'DISTRICT') return 11;
    if (mTarget.type === 'ASSEMBLY' || mTarget.type === 'LOK_SABHA') return 12;
    if (mTarget.type === 'TALUKA') return 13;
    if (mTarget.type === 'VILLAGE') return 15;
    if (mTarget.type === 'POLLING_STATION') return 17;
    return 13;
  };

  const handleZoomIn = () => setMapZoom((prev) => Math.min(19, prev + 1));
  const handleZoomOut = () => setMapZoom((prev) => Math.max(6, prev - 1));
  const handleWheelZoom = (e) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 180) return;
    lastWheelTimeRef.current = now;
    if (e.deltaY < 0) {
      handleZoomIn();
    } else if (e.deltaY > 0) {
      handleZoomOut();
    }
  };

  const activeDistrictName = (
    selectedDistricts[0]?.name_mr ||
    selectedDistricts[0]?.name_en ||
    selectedDistricts[0]?.name ||
    filterDistrict?.name_mr ||
    filterDistrict?.name_en ||
    filterDistrict?.name ||
    ''
  );

  const getMapQuery = (mTarget) => {
    if (!mTarget) return activeDistrictName ? `${activeDistrictName}, Maharashtra, India` : 'Maharashtra, India';
    const nameEn = mTarget.name_en || mTarget.name || '';
    const nameMr = mTarget.name_mr || '';
    const place = nameEn || nameMr || activeDistrictName || 'Maharashtra';
    const dist = mTarget.district_name || activeDistrictName || 'Maharashtra';

    if (mTarget.type === 'STATE') return `${place}, India`;
    if (mTarget.type === 'TALUKA') return `${place} Taluka, ${dist}, Maharashtra, India`;
    if (mTarget.type === 'DISTRICT') return `${place} District, Maharashtra, India`;
    if (mTarget.type === 'ASSEMBLY' || mTarget.type === 'LOK_SABHA') return `${place} Constituency, Maharashtra, India`;
    if (mTarget.type === 'VILLAGE') return `${place}, ${dist}, Maharashtra, India`;
    if (mTarget.type === 'POLLING_STATION') return `${place}, ${dist}, Maharashtra, India`;
    return `${place}, ${dist}, Maharashtra, India`;
  };

  const handleOpenMap = (item, openModal = false) => {
    setActiveMapTarget(item);
    setMapLoading(true);
    if (item) {
      setMapZoom(getTargetDefaultZoom(item));
    }
    if (openModal) {
      setShowMapModal(true);
    }
  };

  const resetScope = (nextScope) => {
    setScope(nextScope);
    setTarget(null);
    setSelectedState({ state_code: '27', state_name: 'Maharashtra', name_en: 'Maharashtra', name_mr: 'महाराष्ट्र' });
    setFilterDistrict(null);
    setFilterTaluka(null);
    setFilterAssembly(null);
    setSelectedLocalBody(null);
    setSelectedVillage(null);
    setSelectedDistricts([]);
    setDistrictOptions([]);
    setSelectedAssemblies([]);
    setSelectedTalukas([]);
    setSelectedVillages([]);
    setSelectedStations([]);
    setLocalUnitName('');
    setError('');
    setRelatedAssemblies([]);
    setRelatedAssembliesError('');
    setActiveMapTarget(null);
    setShowMapModal(false);
  };

  const changeSelectedState = (st) => {
    setSelectedState(st);
    setFilterDistrict(null);
    setFilterTaluka(null);
    setSelectedLocalBody(null);
    setSelectedVillage(null);
    setTarget(null);
    setSelectedDistricts([]);
    setSelectedAssemblies([]);
    setSelectedTalukas([]);
    setSelectedVillages([]);
    setSelectedStations([]);
    if (st) {
      setActiveMapTarget({
        type: 'STATE',
        name_en: st.state_name || st.name_en,
        name_mr: stateNameMrMap[st.state_code] || st.name_mr,
      });
    }
  };

  const selectRootTarget = (item) => {
    setTarget(item);
    setSelectedDistricts([]);
    setDistrictOptions([]);
    setSelectedAssemblies([]);
    setSelectedTalukas([]);
    setSelectedVillages([]);
    setSelectedStations([]);
    if (item) {
      setActiveMapTarget({
        type: scope,
        name_en: item.name_en || item.name,
        name_mr: item.name_mr,
      });
    } else {
      setActiveMapTarget(null);
    }
  };

  useEffect(() => {
    if (!target?.code) {
      setRelatedAssemblies([]);
      setRelatedAssembliesError('');
      setDistrictOptions([]);
      setSelectedDistricts([]);
      setRelatedAssembliesLoading(false);
      return undefined;
    }
    if (!['LOK_SABHA', 'ASSEMBLY', 'GRADUATE_CONSTITUENCY', 'TEACHER_CONSTITUENCY', 'LOCAL_AUTHORITIES'].includes(scope)) {
      setRelatedAssemblies([]);
      setDistrictOptions([]);
      setSelectedDistricts([]);
      setRelatedAssembliesError('');
      setRelatedAssembliesLoading(false);
      return undefined;
    }

    let cancelled = false;
    const loadRelated = async () => {
      try {
        if (scope === 'LOK_SABHA') {
          setRelatedAssembliesLoading(true);
          setRelatedAssembliesError('');
          const { data } = await apiClient.get(`/admin/project-geography/lok-sabha/${encodeURIComponent(target.code)}/assemblies`);
          if (!cancelled) {
            const assemblies = data.data || [];
            setRelatedAssemblies(assemblies);
            setSelectedAssemblies(assemblies);
          }
        } else {
          let districtUrl = null;
          if (scope === 'ASSEMBLY') {
            districtUrl = `/admin/project-geography/assemblies/${encodeURIComponent(target.code)}/districts`;
          } else if (scope === 'GRADUATE_CONSTITUENCY') {
            districtUrl = `/admin/project-geography/graduate-constituencies/${encodeURIComponent(target.code)}/districts`;
          } else if (scope === 'TEACHER_CONSTITUENCY') {
            districtUrl = `/admin/project-geography/teacher-constituencies/${encodeURIComponent(target.code)}/districts`;
          } else if (scope === 'LOCAL_AUTHORITIES') {
            districtUrl = `/admin/project-geography/local-authorities/${encodeURIComponent(target.code)}/districts`;
          }
          if (districtUrl) {
            const { data: districtData } = await apiClient.get(districtUrl);
            if (!cancelled) {
              const options = districtData.data || [];
              setDistrictOptions(options);
              setSelectedDistricts(options);
            }
          }
        }
      } catch (requestError) {
        if (!cancelled && scope === 'LOK_SABHA') setRelatedAssembliesError(requestError.message || 'Could not load related constituencies.');
      } finally {
        if (!cancelled) setRelatedAssembliesLoading(false);
      }
    };
    loadRelated();

    return () => { cancelled = true; };
  }, [scope, target?.code]);

  // Dynamically update districts for Lok Sabha based on selected Vidhan Sabha constituencies
  useEffect(() => {
    if (scope !== 'LOK_SABHA' || !target?.code) return;

    if (!selectedAssemblies.length) {
      setDistrictOptions([]);
      setSelectedDistricts([]);
      setSelectedTalukas([]);
      setSelectedVillages([]);
      setSelectedStations([]);
      return;
    }

    const districtMap = new Map();
    selectedAssemblies.forEach((assembly) => {
      const code = String(assembly.district_code || '');
      if (!code) return;
      if (!districtMap.has(code)) {
        districtMap.set(code, {
          code,
          name_en: assembly.district_name || `District ${code}`,
          name_mr: assembly.district_name_mr || '',
          assembly_count: 1,
        });
      } else {
        const item = districtMap.get(code);
        item.assembly_count += 1;
      }
    });

    if (districtMap.size > 0) {
      const options = Array.from(districtMap.values()).sort((a, b) => a.name_en.localeCompare(b.name_en));
      setDistrictOptions(options);
      setSelectedDistricts((prev) => {
        const stillValid = prev.filter((d) => options.some((opt) => opt.code === d.code));
        return stillValid.length > 0 ? stillValid : options;
      });
    } else {
      let cancelled = false;
      const asmNos = selectedAssemblies.map((a) => a.code).join(',');
      apiClient.get(`/admin/project-geography/lok-sabha/${encodeURIComponent(target.code)}/districts?assembly_nos=${asmNos}`)
        .then(({ data }) => {
          if (cancelled) return;
          const options = data.data || [];
          setDistrictOptions(options);
          setSelectedDistricts((prev) => {
            const stillValid = prev.filter((d) => options.some((opt) => opt.code === d.code));
            return stillValid.length > 0 ? stillValid : options;
          });
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }
  }, [scope, target?.code, selectedAssemblies]);

  const activeDistrictCodes = scope === 'POLLING_STATION'
    ? (filterDistrict?.code ? [String(filterDistrict.code)] : [])
    : filterDistrict?.code
      ? [String(filterDistrict.code)]
      : selectedDistricts.map((item) => String(item.code));

  const effectiveDistCodes = activeDistrictCodes.length ? activeDistrictCodes : (filterDistrict?.code ? [String(filterDistrict.code)] : []);

  const isTargetBasedScope = ['LOK_SABHA', 'ASSEMBLY', 'GRADUATE_CONSTITUENCY', 'TEACHER_CONSTITUENCY', 'LOCAL_AUTHORITIES'].includes(scope);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) return setError(isMr ? 'कृपया प्रकल्पाचे नाव प्रविष्ट करा.' : 'Please enter a project name.');
    if (!scope) return setError(isMr ? 'कृपया निवडणुकीचा प्रकार किंवा कार्यक्षेत्र निवडा.' : 'Select a geographic scope to continue.');

    const assemblyContext = scope === 'LOK_SABHA'
      ? selectedAssemblies.map((item) => Number(item.code)).filter((n) => !isNaN(n) && n > 0)
      : scope === 'ASSEMBLY' ? (target?.code && !isNaN(Number(target.code)) ? [Number(target.code)] : [])
        : scope === 'POLLING_STATION' ? (filterAssembly?.code && !isNaN(Number(filterAssembly.code)) ? [Number(filterAssembly.code)] : []) : [];

    const context = {
      state_code: selectedState?.state_code || '27',
      state_name: selectedState?.state_name || selectedState?.name_en || 'Maharashtra',
      district_code: filterDistrict?.code || effectiveDistCodes[0] || null,
      district_codes: effectiveDistCodes,
      taluka_code: filterTaluka?.code || filterTaluka?.taluka_code || selectedTalukas[0]?.code || null,
      taluka_codes: selectedTalukas.map((item) => String(item.code || item.taluka_code)),
      local_body_code: selectedLocalBody?.code || selectedLocalBody?.local_body_code || null,
      local_body_name: selectedLocalBody?.name_en || selectedLocalBody?.name || null,
      village_code: selectedVillage?.code || selectedVillage?.village_code || selectedVillages[0]?.code || null,
      village_codes: selectedVillages.map((item) => String(item.code || item.village_code)),
      local_unit_name: localUnitName.trim() || null,
      election_type: scope,
      ...(scope === 'POLLING_STATION' ? {
        assembly_no: filterAssembly?.code && !isNaN(Number(filterAssembly.code)) ? Number(filterAssembly.code) : null,
        election_year: selectedStations[0]?.election_year ? Number(selectedStations[0].election_year) : null,
      } : {}),
      assembly_codes: assemblyContext,
      polling_stations: selectedStations.map((item) => ({
        code: String(item.code || item.part_no || ''),
        name: item.name_en || item.name || '',
        name_en: item.name_en || item.name || '',
        local_body_type: item.local_body_type || null,
        type_label: item.type_label || null,
        taluka_code: item.taluka_code ? String(item.taluka_code) : null,
        district_code: item.district_code ? String(item.district_code) : null,
        part_no: item.part_no ? String(item.part_no) : null,
        election_year: item.election_year ? Number(item.election_year) : null,
      })),
    };

    let geoCode = '';
    let geoNameEn = '';
    let geoNameMr = null;

    if (scope === 'GRAM_PANCHAYAT') {
      geoCode = selectedVillage?.code || selectedVillage?.village_code || (selectedVillages[0]?.code) || filterDistrict?.code || 'GP';
      const villEn = selectedVillage?.name_en || selectedVillage?.village_name || selectedVillages.map(v => v.name_en || v.village_name).join(', ') || localUnitName.trim();
      const villMr = selectedVillage?.name_mr || selectedVillages.map(v => v.name_mr).filter(Boolean).join(', ') || localUnitName.trim();
      const talEn = filterTaluka?.name_en || filterTaluka?.taluka_name || selectedTalukas.map(t => t.name_en || t.taluka_name).join(', ');
      const talMr = filterTaluka?.name_mr || selectedTalukas.map(t => t.name_mr).filter(Boolean).join(', ');
      const distEn = filterDistrict?.name_en || filterDistrict?.district_name || selectedDistricts[0]?.name_en || '';
      const distMr = filterDistrict?.name_mr || selectedDistricts[0]?.name_mr || '';

      geoNameEn = [villEn, talEn ? `Tal. ${talEn}` : '', distEn ? `Dist. ${distEn}` : ''].filter(Boolean).join(', ') || form.name.trim();
      geoNameMr = [villMr || villEn, talMr ? `ता. ${talMr}` : '', distMr ? `जि. ${distMr}` : ''].filter(Boolean).join(', ') || null;
    } else if (scope === 'MUNICIPAL_CORPORATION') {
      geoCode = selectedLocalBody?.code || filterDistrict?.code || 'MUNICIPAL_CORP';
      const corpEn = selectedLocalBody?.name_en || selectedLocalBody?.name || localUnitName.trim();
      const corpMr = selectedLocalBody?.name_mr || localUnitName.trim();
      geoNameEn = [corpEn, localUnitName.trim() && localUnitName !== corpEn ? localUnitName.trim() : ''].filter(Boolean).join(' - ') || form.name.trim();
      geoNameMr = [corpMr || corpEn, localUnitName.trim() && localUnitName !== corpMr ? localUnitName.trim() : ''].filter(Boolean).join(' - ') || null;
    } else if (scope === 'MUNICIPAL_COUNCIL') {
      geoCode = selectedLocalBody?.code || filterDistrict?.code || 'MUNICIPAL_COUNCIL';
      const cnEn = selectedLocalBody?.name_en || selectedLocalBody?.name || localUnitName.trim();
      const cnMr = selectedLocalBody?.name_mr || localUnitName.trim();
      geoNameEn = [cnEn, localUnitName.trim() && localUnitName !== cnEn ? localUnitName.trim() : ''].filter(Boolean).join(' - ') || form.name.trim();
      geoNameMr = [cnMr || cnEn, localUnitName.trim() && localUnitName !== cnMr ? localUnitName.trim() : ''].filter(Boolean).join(' - ') || null;
    } else if (scope === 'ZILLA_PARISHAD' || scope === 'PANCHAYAT_SAMITI') {
      geoCode = filterDistrict?.code || 'ZP_PS';
      const talEn = filterTaluka?.name_en || selectedTalukas.map(t => t.name_en).join(', ');
      const talMr = filterTaluka?.name_mr || selectedTalukas.map(t => t.name_mr).filter(Boolean).join(', ');
      const distEn = filterDistrict?.name_en || selectedDistricts[0]?.name_en || '';
      const distMr = filterDistrict?.name_mr || selectedDistricts[0]?.name_mr || '';
      geoNameEn = [localUnitName.trim(), talEn ? `Tal. ${talEn}` : '', distEn ? `Dist. ${distEn}` : ''].filter(Boolean).join(', ') || form.name.trim();
      geoNameMr = [localUnitName.trim(), talMr ? `ता. ${talMr}` : '', distMr ? `जि. ${distMr}` : ''].filter(Boolean).join(', ') || null;
    } else if (scope === 'POLLING_STATION') {
      geoCode = selectedStations.map((s) => s.part_no || s.code).filter(Boolean).join(',');
      geoNameEn = selectedStations.map((s) => s.part_no ? `Part No. ${s.part_no}` : (s.name_en || s.name || s.code)).filter(Boolean).join(', ');
      geoNameMr = selectedStations.map((s) => s.name_mr || s.name_en || s.name).filter(Boolean).join(', ') || null;
    } else if (isTargetBasedScope && target) {
      geoCode = target?.code ? String(target.code) : (scope || 'GENERAL');
      geoNameEn = target?.name_en || target?.name || form.name.trim();
      geoNameMr = target?.name_mr || null;
    } else {
      const distCodes = selectedDistricts.map((d) => d.code).filter(Boolean);
      const distNamesEn = selectedDistricts.map((d) => d.name_en || d.name).filter(Boolean).join(', ');
      const distNamesMr = selectedDistricts.map((d) => d.name_mr || d.name_en || d.name).filter(Boolean).join(', ');

      geoCode = distCodes.length ? distCodes.join(',') : (scope || 'GENERAL');
      const unitPrefix = localUnitName.trim() ? `${localUnitName.trim()} · ` : '';
      geoNameEn = unitPrefix + (distNamesEn || form.name.trim());
      geoNameMr = unitPrefix + (distNamesMr || form.name.trim());
    }

    if (!geoCode) geoCode = scope || 'GENERAL';
    if (!geoNameEn) geoNameEn = form.name.trim();

    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/admin/projects', {
        name: form.name.trim(),
        description: form.description.trim() || null,
        project_type: scope || 'GENERAL',
        status: 'DRAFT',
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        geographic_scope: scope || null,
        geographic_code: geoCode,
        geographic_name_en: geoNameEn,
        geographic_name_mr: geoNameMr,
        geographic_context: {
          ...context,
          candidates: electionCandidates,
        },
        candidates: electionCandidates,
      });
      setForm({ name: '', description: '', start_date: '', end_date: '' });
      setElectionCandidates([]);
      resetScope('');
      onCreated?.(data.project);
    } catch (requestError) {
      let errorMsg = isMr ? 'प्रकल्प तयार करता आला नाही.' : 'Project could not be created.';
      if (requestError.errors && typeof requestError.errors === 'object') {
        const errorList = Object.values(requestError.errors).flat();
        if (errorList.length > 0) {
          errorMsg = errorList.join(' ');
        }
      } else if (requestError.message) {
        errorMsg = requestError.message;
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const targetEndpoint = {
    DISTRICT: '/admin/project-geography/districts',
    LOK_SABHA: '/admin/project-geography/lok-sabha',
    ASSEMBLY: '/admin/project-geography/assemblies',
    POLLING_STATION: '/admin/project-geography/polling-stations',
    GRADUATE_CONSTITUENCY: '/admin/project-geography/graduate-constituencies',
    TEACHER_CONSTITUENCY: '/admin/project-geography/teacher-constituencies',
    LOCAL_AUTHORITIES: '/admin/project-geography/local-authorities',
  }[scope];

  const stationParams = {
    ...(effectiveDistCodes.length ? { district_codes: effectiveDistCodes.join(',') } : {}),
    ...(scope === 'LOK_SABHA' && selectedAssemblies.length ? { assembly_nos: selectedAssemblies.map((item) => item.code).join(',') } : {}),
    ...(scope === 'ASSEMBLY' && target?.code ? { assembly_no: target.code } : {}),
    ...(scope === 'POLLING_STATION' && filterAssembly?.code ? { assembly_no: filterAssembly.code } : {}),
    ...(selectedTalukas.length ? { taluka_codes: selectedTalukas.map((item) => item.code).join(',') } : {}),
    ...(selectedVillages.length ? { village_codes: selectedVillages.map((item) => item.code).join(',') } : {}),
  };

  const talukaEndpoint = scope === 'ASSEMBLY' && target?.code
    ? `/admin/project-geography/assemblies/${encodeURIComponent(target.code)}/talukas`
    : '/master-data/talukas';

  const talukaParams = scope === 'ASSEMBLY'
    ? { load_all: true }
    : { district_codes: effectiveDistCodes.join(','), load_all: true };

  const villageParams = {
    district_codes: effectiveDistCodes.join(','),
    taluka_codes: selectedTalukas.map((item) => item.taluka_code || item.code),
    taluka_code: selectedTalukas.map((item) => item.taluka_code || item.code).join(','),
  };

  const isFormReady = Boolean(form.name.trim()) && Boolean(scope) && (
    scope === 'POLLING_STATION'
      ? selectedStations.length > 0
      : scope === 'GRAM_PANCHAYAT'
        ? Boolean(filterDistrict || selectedDistricts.length > 0) && Boolean(selectedVillage || localUnitName.trim() || selectedVillages.length > 0)
        : (scope === 'MUNICIPAL_CORPORATION' || scope === 'MUNICIPAL_COUNCIL')
          ? Boolean(selectedLocalBody || filterDistrict || selectedDistricts.length > 0 || localUnitName.trim())
          : (scope === 'ZILLA_PARISHAD' || scope === 'PANCHAYAT_SAMITI')
            ? Boolean(filterDistrict || selectedDistricts.length > 0 || localUnitName.trim())
            : isTargetBasedScope
              ? Boolean(target)
              : (['PRESIDENTIAL', 'VICE_PRESIDENTIAL', 'RAJYA_SABHA', 'MLA_QUOTA'].includes(scope))
                ? Boolean(selectedState || selectedDistricts.length > 0)
                : (selectedDistricts.length > 0 || filterDistrict)
  );

  return translateTree(<form onSubmit={submit} className="project-create-card" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden', margin: 0 }}>
    <div className="project-create-header" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(16px, 4vw, 19px)', fontWeight: 800, color: '#0f172a' }}>
          {isMr ? 'नवीन प्रकल्प जोडा' : 'Add New Project'}
        </h2>
        <p style={{ ...style.muted, margin: 0, fontSize: 12.5 }}>
          {isMr ? 'या प्रकल्पासाठी अचूक निवडणूक स्तर व कार्यक्षेत्र थेट डेटाबेसमधून निवडा.' : 'Select election level and configure geographical jurisdiction directly from database.'}
        </p>
      </div>

      {/* Quick Map Access Button */}
      <button
        type="button"
        onClick={() => setShowMapModal(true)}
        className="project-header-map-btn"
        title={isMr ? 'नकाशा पहा (सांगली / निवडलेले क्षेत्र)' : 'Watch Map (Sangli / Selected Area)'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          padding: '9px 14px',
          fontSize: 13.5,
          fontWeight: 700,
          cursor: 'pointer',
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        <span style={{ fontSize: 16 }}>🗺️</span>
        <span style={{ fontWeight: 800 }}>{isMr ? 'नकाशा पहा' : 'Watch Map'}</span>
        {activeDistrictName && (
          <span className="project-header-map-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
            {activeDistrictName}
          </span>
        )}
      </button>
    </div>

    <div style={{ maxWidth: '100%', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <label style={style.label}>
        {isMr ? 'प्रकल्पाचे नाव *' : 'Project Name *'}
        <input
          required
          maxLength={200}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ ...style.input, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          placeholder={isMr ? 'उदा. सांगली मतदार नोंदणी मोहीम' : 'e.g. Sangli Voter Outreach Campaign'}
        />
      </label>
      <label style={style.label}>
        {isMr ? 'प्रकल्पाचे वर्णन (ऐच्छिक)' : 'Description (Optional)'}
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          style={{ ...style.input, resize: 'vertical', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          placeholder={isMr ? 'प्रकल्पाचे थोडक्यात वर्णन लिहा...' : 'Brief project description...'}
        />
      </label>
    </div>

    <section aria-labelledby="scope-heading" style={{ marginTop: 20, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div id="scope-heading" style={{ fontSize: 14, fontWeight: 800, marginBottom: 6, letterSpacing: '0.2px', color: '#0f172a' }}>
        {isMr ? 'निवडणूक स्तर व कार्यक्षेत्र' : 'ELECTION TYPE & GEOGRAPHY'} <span style={{ color: '#d92d20' }}>*</span>
      </div>
      <p style={{ ...style.muted, marginTop: 0, marginBottom: 12, fontSize: 12.5 }}>
        {isMr ? 'हा प्रकल्प कोणत्या निवडणुकीसाठी आहे? खालील योग्य पर्याय निवडा:' : 'Which election or territory does this project cover? Select from below:'}
      </p>

      {/* Category Filter Pills */}
      <div className="project-election-categories">
        {electionCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`project-election-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{isMr ? cat.labelMr : cat.labelEn}</span>
          </button>
        ))}
      </div>

      {/* 16 Clean Election Containers (WITHOUT DESCRIPTIONS, STRICTLY SINGLE LANGUAGE) */}
      <div role="radiogroup" aria-label="Geographic scope" className="project-geo-grid" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {scopes
          .filter((option) => selectedCategory === 'ALL' || option.category === selectedCategory)
          .map((option) => {
            const isSelected = scope === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => resetScope(option.value)}
                className={`project-geo-card ${isSelected ? 'selected' : ''}`}
              >
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    aria-hidden="true"
                    className={`project-geo-radio ${isSelected ? 'selected' : ''}`}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                      <span style={{ fontSize: 16 }}>{option.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: isSelected ? '#dbeafe' : '#f1f5f9', color: isSelected ? '#1d4ed8' : '#475569' }}>
                        {isMr ? `क्र. ${option.numberMr}` : `#${option.numberEn}`}
                      </span>
                      <span style={{ fontSize: 10.5, fontWeight: 650, padding: '1px 6px', borderRadius: 10, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        {isMr ? option.levelBadgeMr : option.levelBadgeEn}
                      </span>
                    </div>
                    <div className="project-geo-title" style={{ fontSize: 13.5, fontWeight: 750, color: isSelected ? '#1e40af' : '#0f172a' }}>
                      {isMr ? option.titleMr : option.titleEn}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </section>

    {scope && <div style={{ maxWidth: 780, marginTop: 22 }}>
      {/* Active Election Details Banner */}
      {(() => {
        const activeOpt = scopes.find((s) => s.value === scope);
        if (!activeOpt) return null;
        return (
          <div style={{
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: 10,
            marginBottom: 18,
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span>{activeOpt.icon}</span>
              <span>{isMr ? activeOpt.titleMr : activeOpt.titleEn}</span>
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '1px 7px', borderRadius: 6, fontWeight: 700 }}>
                {isMr ? 'निवडलेली निवडणूक ✓' : 'Selected Election ✓'}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: '#15803d', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span>📍 <strong>{isMr ? 'स्तर:' : 'Level:'}</strong> {isMr ? activeOpt.levelMr : activeOpt.levelEn}</span>
              <span>👥 <strong>{isMr ? 'मतदार:' : 'Voters:'}</strong> {isMr ? activeOpt.votersMr : activeOpt.votersEn}</span>
              <span>🎖️ <strong>{isMr ? 'प्रतिनिधी:' : 'Representative:'}</strong> {isMr ? activeOpt.repMr : activeOpt.repEn}</span>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* UNIVERSAL STATE SELECTOR & SWITCHER (राज्य निवड व बदल)          */}
      {/* ============================================================== */}
      <div style={{
        padding: '14px 16px',
        background: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: 10,
        marginBottom: 18,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🇮🇳</span>
            <div>
              <span style={{ fontSize: 13.5, fontWeight: 750, color: '#0f172a' }}>
                {isMr ? 'निवडणूक राज्य (Election State) *' : 'Election State *'}
              </span>
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#dbeafe', color: '#1d4ed8' }}>
                {isMr
                  ? (stateNameMrMap[selectedState?.state_code] || selectedState?.state_name || 'राज्य निवडा')
                  : (selectedState?.state_name || selectedState?.name_en || 'Select State')}
              </span>
              {selectedState?.state_code && (
                <span style={{ marginLeft: 6, fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: 4, fontWeight: 650 }}>
                  {isMr ? `कोड: ${selectedState.state_code}` : `Code: ${selectedState.state_code}`}
                </span>
              )}
            </div>
          </div>
          {selectedState && (
            <button
              type="button"
              onClick={() => changeSelectedState(null)}
              style={{
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                borderRadius: 6,
                padding: '4px 11px',
                fontSize: 12,
                fontWeight: 650,
                color: '#2563eb',
                cursor: 'pointer'
              }}
            >
              {isMr ? '🔄 राज्य बदला' : '🔄 Change State'}
            </button>
          )}
        </div>

        {/* Quick State Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>
            {isMr ? 'त्वरित राज्य निवडा:' : 'Quick Select:'}
          </span>
          {[
            { code: '27', nameEn: 'Maharashtra', nameMr: 'महाराष्ट्र' },
            { code: '30', nameEn: 'Goa', nameMr: 'गोवा' },
            { code: '29', nameEn: 'Karnataka', nameMr: 'कर्नाटक' },
            { code: '24', nameEn: 'Gujarat', nameMr: 'गुजरात' },
            { code: '23', nameEn: 'Madhya Pradesh', nameMr: 'मध्य प्रदेश' },
            { code: '07', nameEn: 'Delhi (NCT)', nameMr: 'दिल्ली' },
          ].map((stItem) => {
            const isCur = selectedState?.state_code === stItem.code;
            return (
              <button
                key={stItem.code}
                type="button"
                onClick={() => changeSelectedState({ state_code: stItem.code, state_name: stItem.nameEn, name_en: stItem.nameEn, name_mr: stItem.nameMr })}
                style={{
                  border: isCur ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  background: isCur ? '#dbeafe' : '#f8fafc',
                  color: isCur ? '#1d4ed8' : '#334155',
                  borderRadius: 14,
                  padding: '3px 10px',
                  fontSize: 11.5,
                  fontWeight: isCur ? 750 : 600,
                  cursor: 'pointer'
                }}
              >
                {isMr ? stItem.nameMr : stItem.nameEn}
              </button>
            );
          })}
        </div>

        <SearchPicker
          language={language}
          label={isMr ? 'किंवा इतर सर्व ३३ राज्यांमधून शोधा व निवडा:' : 'Or search from all 33 Indian States / UTs:'}
          endpoint="/master-data/states"
          value={selectedState}
          onSelect={(st) => changeSelectedState(st)}
          onClear={() => changeSelectedState(null)}
          placeholder={isMr ? 'राज्य शोधा (उदा. महाराष्ट्र, गोवा, गुजरात, कर्नाटक, दिल्ली, राजस्थान)...' : 'Search state (e.g. Maharashtra, Goa, Gujarat, Karnataka, Delhi, Rajasthan)...'}
        />
      </div>

      {/* ============================================================== */}
      {/* SCOPE 1: GRAM PANCHAYAT (गाव / ग्रामीण स्तर)                      */}
      {/* ============================================================== */}
      {scope === 'GRAM_PANCHAYAT' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: '#17253c', fontSize: 14, marginBottom: 4 }}>
            {isMr ? '🏡 ग्रामपंचायत कार्यक्षेत्र निवड (डेटाबेसमधून)' : '🏡 Gram Panchayat Jurisdiction Selection (From DB)'}
          </div>
          <p style={{ ...style.muted, marginTop: 0, marginBottom: 14, fontSize: 12.5 }}>
            {isMr ? 'प्रथम जिल्हा, नंतर तालुका व त्यानंतर संबंधित गाव / ग्रामपंचायत निवडा:' : 'First select district, then taluka, and select the specific village/gram panchayat:'}
          </p>

          <SearchPicker
            language={language}
            label={isMr ? '१. जिल्हा निवडा *' : '1. Select District *'}
            endpoint="/master-data/districts"
            value={filterDistrict}
            onViewMap={(item) => handleOpenMap({ type: 'DISTRICT', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onSelect={(item) => {
              setFilterDistrict(item);
              setFilterTaluka(null);
              setSelectedVillage(null);
              setSelectedVillages([]);
              setActiveMapTarget({ type: 'DISTRICT', name_en: item.name_en || item.name, name_mr: item.name_mr });
            }}
            onClear={() => {
              setFilterDistrict(null);
              setFilterTaluka(null);
              setSelectedVillage(null);
              setSelectedVillages([]);
              setActiveMapTarget(null);
            }}
            placeholder={isMr ? 'जिल्हा शोधा (उदा. सांगली / Sangli)...' : 'Search district (e.g. Sangli)...'}
          />

          <SearchPicker
            language={language}
            disabled={!filterDistrict}
            label={isMr ? '२. तालुका निवडा *' : '2. Select Taluka *'}
            endpoint="/master-data/talukas"
            params={{ district_code: filterDistrict?.code }}
            value={filterTaluka}
            onViewMap={(item) => handleOpenMap({ type: 'TALUKA', name_en: item.name_en || item.taluka_name, name_mr: item.name_mr, district_name: activeDistrictName }, true)}
            onSelect={(item) => {
              setFilterTaluka(item);
              setSelectedVillage(null);
              setSelectedVillages([]);
              setActiveMapTarget({ type: 'TALUKA', name_en: item.name_en || item.taluka_name, name_mr: item.name_mr, district_name: activeDistrictName });
            }}
            onClear={() => {
              setFilterTaluka(null);
              setSelectedVillage(null);
              setSelectedVillages([]);
            }}
            placeholder={filterDistrict ? (isMr ? 'तालुका शोधा...' : 'Search taluka...') : (isMr ? 'आधी जिल्हा निवडा' : 'Select district first')}
          />

          <SearchPicker
            language={language}
            disabled={!filterTaluka}
            label={isMr ? '३. गाव / ग्रामपंचायत निवडा *' : '3. Select Village / Gram Panchayat *'}
            endpoint="/master-data/villages"
            params={{ district_code: filterDistrict?.code, taluka_code: filterTaluka?.code }}
            value={selectedVillage}
            onViewMap={(item) => handleOpenMap({ type: 'VILLAGE', name_en: item.name_en || item.village_name, name_mr: item.name_mr, district_name: activeDistrictName }, true)}
            onSelect={(item) => {
              setSelectedVillage(item);
              setActiveMapTarget({ type: 'VILLAGE', name_en: item.name_en || item.village_name, name_mr: item.name_mr, district_name: activeDistrictName });
            }}
            onClear={() => setSelectedVillage(null)}
            placeholder={filterTaluka ? (isMr ? 'गाव / ग्रामपंचायत शोधा...' : 'Search village / gram panchayat...') : (isMr ? 'आधी तालुका निवडा' : 'Select taluka first')}
          />

          <div style={{ marginTop: 12 }}>
            <label style={style.label}>
              {isMr ? 'वॉर्ड / प्रभाग क्रमांक व परिसर (ऐच्छिक)' : 'Ward / Prabhag No. & Area (Optional)'}
              <input
                value={localUnitName}
                onChange={(e) => setLocalUnitName(e.target.value)}
                style={{ ...style.input, width: '100%', boxSizing: 'border-box' }}
                placeholder={isMr ? 'उदा. वॉर्ड क्र. १, २ किंवा मुख्य गाव' : 'e.g. Ward No. 1, 2 or Main Village'}
              />
            </label>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 5: MUNICIPAL CORPORATION (महानगरपालिका)                    */}
      {/* ============================================================== */}
      {scope === 'MUNICIPAL_CORPORATION' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: '#17253c', fontSize: 14, marginBottom: 4 }}>
            {isMr ? '🏢 महानगरपालिका निवड (डेटाबेसमधून)' : '🏢 Municipal Corporation Selection (From DB)'}
          </div>
          <p style={{ ...style.muted, marginTop: 0, marginBottom: 14, fontSize: 12.5 }}>
            {isMr ? 'जिल्हा निवडून त्याअंतर्गत अधिकृत महानगरपालिका निवडा:' : 'Select district and then choose the official Municipal Corporation:'}
          </p>

          <SearchPicker
            language={language}
            label={isMr ? '१. जिल्हा निवडा *' : '1. Select District *'}
            endpoint="/master-data/districts"
            value={filterDistrict}
            onSelect={(item) => {
              setFilterDistrict(item);
              setSelectedLocalBody(null);
            }}
            onClear={() => {
              setFilterDistrict(null);
              setSelectedLocalBody(null);
            }}
            placeholder={isMr ? 'जिल्हा शोधा (उदा. सांगली / Sangli, पुणे / Pune)...' : 'Search district...'}
          />

          <SearchPicker
            language={language}
            disabled={!filterDistrict}
            label={isMr ? '२. महानगरपालिका निवडा *' : '2. Select Municipal Corporation *'}
            endpoint="/master-data/local-bodies"
            params={{ type: 'M', district_code: filterDistrict?.code }}
            value={selectedLocalBody}
            onSelect={(item) => setSelectedLocalBody(item)}
            onClear={() => setSelectedLocalBody(null)}
            placeholder={filterDistrict ? (isMr ? 'महानगरपालिका निवडा (उदा. सांगली मिरज कुपवाड)...' : 'Select Municipal Corporation...') : (isMr ? 'आधी जिल्हा निवडा' : 'Select district first')}
          />

          <div style={{ marginTop: 12 }}>
            <label style={style.label}>
              {isMr ? 'प्रभाग क्रमांक व परिसर नाव (ऐच्छिक)' : 'Prabhag / Ward No. & Area Name (Optional)'}
              <input
                value={localUnitName}
                onChange={(e) => setLocalUnitName(e.target.value)}
                style={{ ...style.input, width: '100%', boxSizing: 'border-box' }}
                placeholder={isMr ? 'उदा. प्रभाग क्र. १२ (विश्रामबाग / कुपवाड)' : 'e.g. Prabhag No. 12'}
              />
            </label>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 4: MUNICIPAL COUNCIL (नगरपरिषद / नगरपंचायत)               */}
      {/* ============================================================== */}
      {scope === 'MUNICIPAL_COUNCIL' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: '#17253c', fontSize: 14, marginBottom: 4 }}>
            {isMr ? '🏙️ नगरपरिषद / नगरपंचायत निवड (डेटाबेसमधून)' : '🏙️ Municipal Council / Nagar Panchayat (From DB)'}
          </div>
          <p style={{ ...style.muted, marginTop: 0, marginBottom: 14, fontSize: 12.5 }}>
            {isMr ? 'जिल्हा निवडून त्याअंतर्गत नगरपरिषद / नगरपंचायत निवडा:' : 'Select district and then choose the Municipal Council / Nagar Panchayat:'}
          </p>

          <SearchPicker
            language={language}
            label={isMr ? '१. जिल्हा निवडा *' : '1. Select District *'}
            endpoint="/master-data/districts"
            value={filterDistrict}
            onSelect={(item) => {
              setFilterDistrict(item);
              setFilterTaluka(null);
              setSelectedLocalBody(null);
            }}
            onClear={() => {
              setFilterDistrict(null);
              setFilterTaluka(null);
              setSelectedLocalBody(null);
            }}
            placeholder={isMr ? 'जिल्हा शोधा (उदा. सांगली / Sangli)...' : 'Search district...'}
          />

          <SearchPicker
            language={language}
            disabled={!filterDistrict}
            label={isMr ? '२. तालुका निवडा (ऐच्छिक)' : '2. Select Taluka (Optional)'}
            endpoint="/master-data/talukas"
            params={{ district_code: filterDistrict?.code }}
            value={filterTaluka}
            onSelect={(item) => {
              setFilterTaluka(item);
              setSelectedLocalBody(null);
            }}
            onClear={() => {
              setFilterTaluka(null);
              setSelectedLocalBody(null);
            }}
            placeholder={isMr ? 'तालुका निवडा...' : 'Select taluka...'}
          />

          <SearchPicker
            language={language}
            disabled={!filterDistrict}
            label={isMr ? '३. नगरपरिषद / नगरपंचायत निवडा *' : '3. Select Municipal Council / Nagar Panchayat *'}
            endpoint="/master-data/local-bodies"
            params={{ types: 'C,N', district_code: filterDistrict?.code, ...(filterTaluka ? { taluka_code: filterTaluka.code } : {}) }}
            value={selectedLocalBody}
            onSelect={(item) => setSelectedLocalBody(item)}
            onClear={() => setSelectedLocalBody(null)}
            placeholder={filterDistrict ? (isMr ? 'नगरपरिषद / नगरपंचायत निवडा (उदा. आष्टा, इस्लामपूर, विटा, शिराळा)...' : 'Select Municipal Council...') : (isMr ? 'आधी जिल्हा निवडा' : 'Select district first')}
          />

          <div style={{ marginTop: 12 }}>
            <label style={style.label}>
              {isMr ? 'प्रभाग क्रमांक व परिसर (ऐच्छिक)' : 'Prabhag / Ward No. & Area (Optional)'}
              <input
                value={localUnitName}
                onChange={(e) => setLocalUnitName(e.target.value)}
                style={{ ...style.input, width: '100%', boxSizing: 'border-box' }}
                placeholder={isMr ? 'उदा. प्रभाग क्र. ५' : 'e.g. Prabhag No. 5'}
              />
            </label>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 3: ZILLA PARISHAD (जिल्हा परिषद)                          */}
      {/* ============================================================== */}
      {scope === 'ZILLA_PARISHAD' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: '#17253c', fontSize: 14, marginBottom: 4 }}>
            {isMr ? '🏛️ जिल्हा परिषद निवडणूक गट कार्यक्षेत्र' : '🏛️ Zilla Parishad Electoral Gat'}
          </div>

          <SearchPicker
            language={language}
            label={isMr ? '१. जिल्हा निवडा *' : '1. Select District *'}
            endpoint="/master-data/districts"
            value={filterDistrict}
            onSelect={(item) => {
              setFilterDistrict(item);
              setFilterTaluka(null);
              setSelectedVillages([]);
            }}
            onClear={() => {
              setFilterDistrict(null);
              setFilterTaluka(null);
              setSelectedVillages([]);
            }}
            placeholder={isMr ? 'जिल्हा शोधा...' : 'Search district...'}
          />

          <SearchPicker
            language={language}
            disabled={!filterDistrict}
            label={isMr ? '२. तालुका निवडा *' : '2. Select Taluka *'}
            endpoint="/master-data/talukas"
            params={{ district_code: filterDistrict?.code }}
            value={filterTaluka}
            onSelect={(item) => {
              setFilterTaluka(item);
              setSelectedVillages([]);
            }}
            onClear={() => {
              setFilterTaluka(null);
              setSelectedVillages([]);
            }}
            placeholder={isMr ? 'तालुका निवडा...' : 'Select taluka...'}
          />

          <div style={{ marginTop: 12 }}>
            <label style={style.label}>
              {isMr ? '३. जिल्हा परिषद निवडणूक गट नाव *' : '3. ZP Electoral Gat Name *'}
              <input
                value={localUnitName}
                onChange={(e) => setLocalUnitName(e.target.value)}
                style={{ ...style.input, width: '100%', boxSizing: 'border-box' }}
                placeholder={isMr ? 'उदा. कसबे डिग्रज ZP गट' : 'e.g. Kasabe Digraj ZP Gat'}
              />
            </label>
          </div>

          {filterTaluka && (
            <div style={{ marginTop: 12 }}>
              <MultiSearchPicker
                language={language}
                label={isMr ? 'या गटामधील गावे निवडा (ऐच्छिक)' : 'Select Villages under this Gat (Optional)'}
                endpoint="/master-data/villages"
                params={{ district_code: filterDistrict?.code, taluka_code: filterTaluka?.code }}
                value={selectedVillages}
                onChange={(items) => setSelectedVillages(items)}
                placeholder={isMr ? 'गावे शोधा...' : 'Search villages...'}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 2: PANCHAYAT SAMITI (पंचायत समिती)                         */}
      {/* ============================================================== */}
      {scope === 'PANCHAYAT_SAMITI' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: '#17253c', fontSize: 14, marginBottom: 4 }}>
            {isMr ? '🌾 पंचायत समिती निवडणूक गण कार्यक्षेत्र' : '🌾 Panchayat Samiti Electoral Gan'}
          </div>

          <SearchPicker
            language={language}
            label={isMr ? '१. जिल्हा निवडा *' : '1. Select District *'}
            endpoint="/master-data/districts"
            value={filterDistrict}
            onSelect={(item) => {
              setFilterDistrict(item);
              setFilterTaluka(null);
              setSelectedVillages([]);
            }}
            onClear={() => {
              setFilterDistrict(null);
              setFilterTaluka(null);
              setSelectedVillages([]);
            }}
            placeholder={isMr ? 'जिल्हा शोधा...' : 'Search district...'}
          />

          <SearchPicker
            language={language}
            disabled={!filterDistrict}
            label={isMr ? '२. तालुका निवडा *' : '2. Select Taluka *'}
            endpoint="/master-data/talukas"
            params={{ district_code: filterDistrict?.code }}
            value={filterTaluka}
            onSelect={(item) => {
              setFilterTaluka(item);
              setSelectedVillages([]);
            }}
            onClear={() => {
              setFilterTaluka(null);
              setSelectedVillages([]);
            }}
            placeholder={isMr ? 'तालुका निवडा...' : 'Select taluka...'}
          />

          <div style={{ marginTop: 12 }}>
            <label style={style.label}>
              {isMr ? '३. पंचायत समिती निवडणूक गण नाव *' : '3. PS Electoral Gan Name *'}
              <input
                value={localUnitName}
                onChange={(e) => setLocalUnitName(e.target.value)}
                style={{ ...style.input, width: '100%', boxSizing: 'border-box' }}
                placeholder={isMr ? 'उदा. कुपवाड गण' : 'e.g. Kupwad Gan'}
              />
            </label>
          </div>

          {filterTaluka && (
            <div style={{ marginTop: 12 }}>
              <MultiSearchPicker
                language={language}
                label={isMr ? 'या गणातील गावे निवडा (ऐच्छिक)' : 'Select Villages under this Gan (Optional)'}
                endpoint="/master-data/villages"
                params={{ district_code: filterDistrict?.code, taluka_code: filterTaluka?.code }}
                value={selectedVillages}
                onChange={(items) => setSelectedVillages(items)}
                placeholder={isMr ? 'गावे शोधा...' : 'Search villages...'}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 11: LOK SABHA (लोकसभा निवडणूक - राष्ट्रीय/राज्य स्तर)    */}
      {/* ============================================================== */}
      {scope === 'LOK_SABHA' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: '#17253c', fontSize: 14, marginBottom: 4 }}>
            {isMr ? '🇮🇳 लोकसभा मतदारसंघ कार्यक्षेत्र (राष्ट्रीय / राज्य स्तर)' : '🇮🇳 Lok Sabha Constituency (National / State Level)'}
          </div>
          <p style={{ ...style.muted, marginTop: 0, marginBottom: 14, fontSize: 12.5 }}>
            {isMr ? 'राज्य निवडून त्यातील लोकसभा मतदारसंघ, त्यानंतर संबंधित विधानसभा, जिल्हे व तालुके निवडा:' : 'Select State, Lok Sabha Constituency, and linked Vidhan Sabha constituencies, districts, and talukas:'}
          </p>

          <SearchPicker
            language={language}
            label={isMr ? '१. राज्य निवडा *' : '1. Select State *'}
            endpoint="/master-data/states"
            value={selectedState}
            onSelect={(st) => changeSelectedState(st)}
            onClear={() => changeSelectedState(null)}
            placeholder={isMr ? 'राज्य निवडा...' : 'Select state...'}
          />

          <SearchPicker
            language={language}
            label={isMr ? '२. लोकसभा मतदारसंघ निवडा *' : '2. Select Lok Sabha Constituency *'}
            endpoint="/admin/project-geography/lok-sabha"
            value={target}
            onViewMap={(item) => handleOpenMap({ type: 'LOK_SABHA', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onSelect={selectRootTarget}
            onClear={() => selectRootTarget(null)}
            placeholder={isMr ? 'लोकसभा मतदारसंघ शोधा (उदा. सांगली / Sangli, पुणे / Pune)...' : 'Search Lok Sabha constituency...'}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 7: ASSEMBLY (विधानसभा निवडणूक)                            */}
      {/* ============================================================== */}
      {scope === 'ASSEMBLY' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: '#17253c', fontSize: 14, marginBottom: 4 }}>
            {isMr ? '🗳️ विधानसभा मतदारसंघ कार्यक्षेत्र (राज्य स्तर)' : '🗳️ Legislative Assembly Constituency (State Level)'}
          </div>

          <SearchPicker
            language={language}
            label={isMr ? '१. जिल्हा निवडा (ऐच्छिक)' : '1. Select District (Optional)'}
            endpoint="/master-data/districts"
            value={filterDistrict}
            onSelect={(item) => {
              setFilterDistrict(item);
              setTarget(null);
            }}
            onClear={() => {
              setFilterDistrict(null);
              setTarget(null);
            }}
            placeholder={isMr ? 'जिल्हा निवडा...' : 'Select district...'}
          />

          <SearchPicker
            language={language}
            label={isMr ? '२. विधानसभा मतदारसंघ निवडा *' : '2. Select Vidhan Sabha Constituency *'}
            endpoint="/admin/project-geography/assemblies"
            params={{ ...(filterDistrict?.code ? { district_code: filterDistrict.code } : {}) }}
            value={target}
            onViewMap={(item) => handleOpenMap({ type: 'ASSEMBLY', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onSelect={selectRootTarget}
            onClear={() => selectRootTarget(null)}
            placeholder={isMr ? 'विधानसभा मतदारसंघ शोधा (उदा. सांगली, मिरज, इस्लामपूर)...' : 'Search Assembly constituency...'}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 6, 9, 10: MLC CONSTITUENCIES (स्थानिक प्राधिकारी / पदवीधर / शिक्षक) */}
      {/* ============================================================== */}
      {['LOCAL_AUTHORITIES', 'GRADUATE_CONSTITUENCY', 'TEACHER_CONSTITUENCY'].includes(scope) && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <SearchPicker
            language={language}
            key={scope}
            label={isMr ? `१. ${scopes.find((item) => item.value === scope)?.titleMr} निवडा *` : `1. Select ${scopes.find((item) => item.value === scope)?.titleEn} *`}
            endpoint={targetEndpoint}
            value={target}
            onViewMap={(item) => handleOpenMap({ type: scope, name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onSelect={selectRootTarget}
            onClear={() => selectRootTarget(null)}
            placeholder={isMr ? 'मतदारसंघ शोधा...' : 'Search constituency...'}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPES 8, 12, 13, 14: STATE-LEVEL & NATIONAL (राष्ट्रपती, उपराष्ट्रपती, राज्यसभा, आमदार कोटा) */}
      {/* ============================================================== */}
      {['PRESIDENTIAL', 'VICE_PRESIDENTIAL', 'RAJYA_SABHA', 'MLA_QUOTA'].includes(scope) && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, color: '#17253c', fontSize: 14, marginBottom: 4 }}>
            {isMr ? '🏛️ राज्य व राष्ट्रीय स्तर कार्यक्षेत्र' : '🏛️ State & National Level Jurisdiction'}
          </div>

          <SearchPicker
            language={language}
            label={isMr ? '१. राज्य निवडा *' : '1. Select State *'}
            endpoint="/master-data/states"
            value={selectedState}
            onSelect={(st) => changeSelectedState(st)}
            onClear={() => changeSelectedState(null)}
            placeholder={isMr ? 'राज्य निवडा (उदा. महाराष्ट्र)...' : 'Select state...'}
          />

          <div style={{ marginTop: 12 }}>
            <MultiSearchPicker
              language={language}
              label={isMr ? '२. संबंधित जिल्हे निवडा (ऐच्छिक)' : '2. Relevant Districts (Optional)'}
              endpoint="/admin/project-geography/districts"
              value={selectedDistricts}
              onChange={(items) => setSelectedDistricts(items)}
              placeholder={isMr ? 'जिल्हे शोधा...' : 'Search districts...'}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 16: DISTRICT (जिल्हा स्तर)                                */}
      {/* ============================================================== */}
      {scope === 'DISTRICT' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <MultiSearchPicker
            language={language}
            pickerType="DISTRICT"
            label={isMr ? 'जिल्हे निवडा * (एक किंवा अनेक)' : 'Select Districts * (One or Multiple)'}
            endpoint="/admin/project-geography/districts"
            value={selectedDistricts}
            onViewMap={(item) => handleOpenMap({ type: 'DISTRICT', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onChange={(items) => {
              setSelectedDistricts(items);
              setSelectedTalukas([]);
              setSelectedVillages([]);
              setSelectedStations([]);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({ type: 'DISTRICT', name_en: latest.name_en || latest.name, name_mr: latest.name_mr });
              }
            }}
            placeholder={isMr ? 'जिल्हा शोधा (उदा. सांगली / Sangli)...' : 'Search districts...'}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* SCOPE 15: POLLING STATION (मतदान केंद्र / बूथ)                   */}
      {/* ============================================================== */}
      {scope === 'POLLING_STATION' && (
        <div style={{ padding: 16, background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10, marginBottom: 18 }}>
          <SearchPicker
            language={language}
            label={isMr ? '१. जिल्हा निवडा *' : '1. District *'}
            endpoint="/admin/project-geography/districts"
            value={filterDistrict}
            onViewMap={(item) => handleOpenMap({ type: 'DISTRICT', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onSelect={(item) => {
              setFilterDistrict(item);
              setFilterAssembly(null);
              setSelectedStations([]);
              setSelectedTalukas([]);
              setSelectedVillages([]);
              setActiveMapTarget({ type: 'DISTRICT', name_en: item.name_en || item.name, name_mr: item.name_mr });
            }}
            onClear={() => {
              setFilterDistrict(null);
              setFilterAssembly(null);
              setSelectedStations([]);
              setSelectedTalukas([]);
              setSelectedVillages([]);
              setActiveMapTarget(null);
            }}
            placeholder={isMr ? 'जिल्हा शोधा...' : 'Search district...'}
          />

          <SearchPicker
            language={language}
            label={isMr ? '२. विधानसभा मतदारसंघ निवडा *' : '2. Assembly Constituency *'}
            endpoint="/admin/project-geography/assemblies"
            params={{ ...(filterDistrict?.code ? { district_code: filterDistrict.code } : {}) }}
            value={filterAssembly}
            onViewMap={(item) => handleOpenMap({ type: 'ASSEMBLY', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onSelect={(item) => {
              setFilterAssembly(item);
              setSelectedStations([]);
              setActiveMapTarget({ type: 'ASSEMBLY', name_en: item.name_en || item.name, name_mr: item.name_mr });
            }}
            onClear={() => {
              setFilterAssembly(null);
              setSelectedStations([]);
            }}
            placeholder={isMr ? 'विधानसभा शोधा...' : 'Search assembly...'}
          />
        </div>
      )}

      {/* LOK SABHA RELATED VIDHAN SABHA SECTION */}
      {scope === 'LOK_SABHA' && target && (
        <section aria-label="Related Assembly constituencies" style={{ marginBottom: 17, padding: 15, border: '1px solid #dbe4f0', borderRadius: 9, background: '#f8faff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontWeight: 750, color: '#17253c', fontSize: 14 }}>
              {isMr
                ? `${target.name_mr || target.name_en} अंतर्गत विधानसभा मतदारसंघ (${relatedAssemblies.length} मतदारसंघ)`
                : `Vidhan Sabha Constituencies under ${target.name_en || target.name} (${relatedAssemblies.length} assemblies)`}
            </div>
            {relatedAssemblies.length > 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => { setSelectedAssemblies(relatedAssemblies); setSelectedStations([]); }}
                  style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 5, padding: '4px 9px', fontSize: 12, fontWeight: 600, color: '#2457d6', cursor: 'pointer' }}
                >
                  {isMr ? `सर्व निवडा (${relatedAssemblies.length})` : `Select All (${relatedAssemblies.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedAssemblies([]); setSelectedStations([]); }}
                  style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 5, padding: '4px 9px', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  {isMr ? 'रीसेट' : 'Clear'}
                </button>
              </div>
            )}
          </div>
          <p style={{ ...style.muted, margin: '0 0 11px' }}>
            {isMr
              ? 'या लोकसभेतील संबंधित जिल्हे व तालुके लोड करण्यासाठी खालील विधानसभा निवडा.'
              : 'Select one or more Vidhan Sabha constituencies to show the district(s) and talukas under them.'}
          </p>
          {relatedAssembliesLoading ? (
            <div style={style.muted}>{isMr ? 'विधानसभा लोड होत आहेत…' : 'Loading related constituencies…'}</div>
          ) : relatedAssembliesError ? (
            <div role="alert" style={{ color: '#b42318', fontSize: 13 }}>{relatedAssembliesError}</div>
          ) : relatedAssemblies.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
              {relatedAssemblies.map((assembly) => {
                const isChecked = selectedAssemblies.some((item) => String(item.code) === String(assembly.code));
                return (
                  <div
                    key={assembly.code}
                    onClick={() => {
                      setSelectedAssemblies((items) =>
                        isChecked ? items.filter((item) => String(item.code) !== String(assembly.code)) : [...items, assembly]
                      );
                      setSelectedStations([]);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: isChecked ? '#eff6ff' : '#fff',
                      border: isChecked ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      boxShadow: isChecked ? '0 1px 3px rgba(59, 130, 246, 0.12)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', margin: 0, flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                      <div>
                        <span style={{ fontWeight: isChecked ? 700 : 550, fontSize: 13, color: isChecked ? '#1e40af' : '#1e293b' }}>
                          {assembly.code ? `${assembly.code} — ` : ''}{isMr ? (assembly.name_mr || assembly.name_en) : assembly.name_en}
                        </span>
                      </div>
                    </label>
                    {assembly.district_name && (
                      <span style={{ fontSize: 11, fontWeight: 650, padding: '2px 8px', borderRadius: 999, background: isChecked ? '#dbeafe' : '#f1f5f9', color: isChecked ? '#1d4ed8' : '#475569', border: isChecked ? '1px solid #bfdbfe' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        📍 {isMr ? (assembly.district_name_mr || assembly.district_name) : assembly.district_name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={style.muted}>{isMr ? 'या लोकसभेसाठी जोडलेल्या विधानसभा उपलब्ध नाहीत.' : 'No linked assembly constituencies are available for this Lok Sabha.'}</div>
          )}
        </section>
      )}

      {/* LOK SABHA DISTRICT SELECTION */}
      {['LOK_SABHA', 'ASSEMBLY', 'GRADUATE_CONSTITUENCY', 'TEACHER_CONSTITUENCY'].includes(scope) && target && (
        <>
          {districtOptions.length > 0 ? (
            <div style={{ marginBottom: 18, padding: '14px 16px', background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 750, color: '#17253c', fontSize: 14 }}>
                    {isMr
                      ? `निवडलेल्या क्षेत्राअंतर्गत जिल्हे (${districtOptions.length} जिल्हे)`
                      : `Districts under selected area (${districtOptions.length} districts)`}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 650, padding: '2px 8px', borderRadius: 12, background: selectedDistricts.length ? '#e0f2fe' : '#fee2e2', color: selectedDistricts.length ? '#0369a1' : '#b91c1c' }}>
                    {selectedDistricts.length} / {districtOptions.length} {isMr ? 'निवडले' : 'selected'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistricts(districtOptions);
                      setSelectedTalukas([]);
                      setSelectedVillages([]);
                      setSelectedStations([]);
                    }}
                    style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 5, padding: '4px 9px', fontSize: 12, fontWeight: 600, color: '#2457d6', cursor: 'pointer' }}
                  >
                    {isMr ? 'सर्व निवडा' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistricts([]);
                      setSelectedTalukas([]);
                      setSelectedVillages([]);
                      setSelectedStations([]);
                    }}
                    style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 5, padding: '4px 9px', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                  >
                    {isMr ? 'रीसेट' : 'Clear'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 9 }}>
                {districtOptions.map((district) => {
                  const isSelected = selectedDistricts.some((d) => String(d.code) === String(district.code));
                  return (
                    <div
                      key={district.code}
                      onClick={() => {
                        const next = isSelected
                          ? selectedDistricts.filter((d) => String(d.code) !== String(district.code))
                          : [...selectedDistricts, district];
                        setSelectedDistricts(next);
                        setSelectedTalukas([]);
                        setSelectedVillages([]);
                        setSelectedStations([]);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '10px 13px',
                        borderRadius: 8,
                        border: isSelected ? '1.5px solid #2563eb' : '1px solid #cfd8e3',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        color: isSelected ? '#1e3a8a' : '#334155',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.12)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <label style={{ display: 'flex', gap: 9, alignItems: 'center', cursor: 'pointer', margin: 0, flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#2563eb' }}
                        />
                        <div>
                          <span style={{ display: 'block', fontWeight: isSelected ? 700 : 600, fontSize: 13 }}>
                            📍 {isMr ? (district.name_mr || district.name_en) : district.name_en}
                          </span>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* CASCADE: TALUKAS & VILLAGES FOR DISTRICTS / CONSTITUENCIES */}
      {effectiveDistCodes.length > 0 && !['GRAM_PANCHAYAT', 'MUNICIPAL_CORPORATION', 'MUNICIPAL_COUNCIL', 'ZILLA_PARISHAD', 'PANCHAYAT_SAMITI', 'POLLING_STATION'].includes(scope) && (
        <>
          <MultiSearchPicker
            language={language}
            pickerType="TALUKA"
            label={isMr ? 'तालुके निवडा (ऐच्छिक)' : 'Select Talukas (Optional)'}
            endpoint={talukaEndpoint}
            params={talukaParams}
            value={selectedTalukas}
            onViewMap={(item) => handleOpenMap({
              type: 'TALUKA',
              name_en: item.name_en || item.taluka_name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedTalukas(items);
              setSelectedVillages([]);
              setSelectedStations([]);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'TALUKA',
                  name_en: latest.name_en || latest.taluka_name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            placeholder={isMr ? 'तालुके शोधा...' : 'Select Taluka'}
          />

          <MultiSearchPicker
            language={language}
            pickerType="VILLAGE"
            label={isMr ? 'गावे निवडा (ऐच्छिक)' : 'Select Villages (Optional)'}
            endpoint="/master-data/villages"
            params={villageParams}
            value={selectedVillages}
            onViewMap={(item) => handleOpenMap({
              type: 'VILLAGE',
              name_en: item.name_en || item.village_name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedVillages(items);
              setSelectedStations([]);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'VILLAGE',
                  name_en: latest.name_en || latest.village_name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            disabled={!selectedTalukas.length}
            placeholder={isMr ? 'गावे शोधा...' : 'Search Village'}
          />

          <MultiSearchPicker
            language={language}
            pickerType="POLLING_STATION"
            label={isMr ? 'मतदान केंद्रे निवडा (ऐच्छिक)' : 'Select Polling Stations (Optional)'}
            endpoint="/admin/project-geography/polling-stations"
            params={stationParams}
            value={selectedStations}
            onViewMap={(item) => handleOpenMap({
              type: 'POLLING_STATION',
              name_en: item.name_en || item.name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedStations(items);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'POLLING_STATION',
                  name_en: latest.name_en || latest.name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            placeholder={isMr ? 'मतदान केंद्र शोधा...' : 'Search Polling Station'}
            noResultsText={isMr ? 'या फिल्टरनुसार कोणतीही केंद्रे आढळली नाहीत.' : 'No local body or polling station records match these selected filters.'}
          />
        </>
      )}

      {/* CASCADE FOR POLLING STATION SPECIFIC SCOPE */}
      {scope === 'POLLING_STATION' && filterDistrict && (
        <>
          <MultiSearchPicker
            language={language}
            pickerType="TALUKA"
            label={isMr ? 'तालुका (ऐच्छिक)' : 'Taluka (Optional)'}
            endpoint={talukaEndpoint}
            params={talukaParams}
            value={selectedTalukas}
            onViewMap={(item) => handleOpenMap({
              type: 'TALUKA',
              name_en: item.name_en || item.taluka_name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedTalukas(items);
              setSelectedVillages([]);
              setSelectedStations([]);
            }}
            placeholder={isMr ? 'तालुका निवडा...' : 'Select Taluka'}
          />

          <MultiSearchPicker
            language={language}
            pickerType="POLLING_STATION"
            label={isMr ? 'मतदान केंद्रे * (एक किंवा अनेक)' : 'Polling Stations * (Select multiple)'}
            endpoint="/admin/project-geography/polling-stations"
            params={stationParams}
            value={selectedStations}
            onViewMap={(item) => handleOpenMap({
              type: 'POLLING_STATION',
              name_en: item.name_en || item.name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedStations(items);
            }}
            disabled={!filterAssembly}
            placeholder={isMr ? 'मतदान केंद्र शोधा...' : 'Search Polling Station'}
            noResultsText={isMr ? 'या फिल्टरनुसार मतदान केंद्र आढळले नाही.' : 'No polling station records match these selected filters.'}
          />
        </>
      )}
    </div>}
    {!scope && <p style={{ ...style.muted, marginTop: 19 }}>{isMr ? 'प्रकल्प सुरू करण्यासाठी वरीलपैकी एक निवडणूक स्तर निवडा.' : 'Select a geographic scope to continue.'}</p>}

    {/* ============================================================== */}
    {/* GEOGRAPHIC LIVE MAP PREVIEW SECTION                            */}
    {/* ============================================================== */}
    {scope && (activeMapTarget || selectedDistricts.length > 0 || selectedTalukas.length > 0 || target || filterDistrict) && (() => {
      const currentTarget = activeMapTarget || (
        selectedTalukas.length > 0
          ? { type: 'TALUKA', name_en: selectedTalukas[selectedTalukas.length - 1].name_en || selectedTalukas[selectedTalukas.length - 1].taluka_name, name_mr: selectedTalukas[selectedTalukas.length - 1].name_mr, district_name: activeDistrictName }
          : selectedDistricts.length > 0
            ? { type: 'DISTRICT', name_en: selectedDistricts[0].name_en, name_mr: selectedDistricts[0].name_mr }
            : filterDistrict
              ? { type: 'DISTRICT', name_en: filterDistrict.name_en, name_mr: filterDistrict.name_mr }
              : target
                ? { type: scope, name_en: target.name_en || target.name, name_mr: target.name_mr }
                : null
      );

      if (!currentTarget) return null;
      const query = getMapQuery(currentTarget);
      const embedUrl = mapProvider === 'osm'
        ? `https://www.openstreetmap.org/export/embed.html?bbox=74.1,16.65,74.9,17.25&layer=mapnik&marker=16.8524,74.5815`
        : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${mapMode === 'satellite' ? 'k' : ''}&z=${debouncedZoom}&ie=UTF8&iwloc=&output=embed`;
      const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

      return (
        <div style={{ marginTop: 26, marginBottom: 20, maxWidth: 780 }}>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🗺️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc' }}>
                    {language === 'mr' ? 'भौगोलिक नकाशा थेट पूर्वावलोकन' : 'Geographic Map Live Preview'}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                    📍 {currentTarget.name_mr || currentTarget.name_en} ({currentTarget.type === 'TALUKA' ? (language === 'mr' ? 'तालुका' : 'Taluka') : currentTarget.type === 'DISTRICT' ? (language === 'mr' ? 'जिल्हा' : 'District') : currentTarget.type === 'VILLAGE' ? (language === 'mr' ? 'गाव' : 'Village') : currentTarget.type === 'POLLING_STATION' ? (language === 'mr' ? 'मतदान केंद्र' : 'Polling Station') : (language === 'mr' ? 'मतदारसंघ' : 'Constituency')})
                  </div>
                </div>
              </div>

              {/* Action Buttons & Zoom Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Header Zoom In/Out Toolbar */}
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#334155', borderRadius: 8, padding: '2px 4px', gap: 4 }}>
                  <button
                    type="button"
                    title={language === 'mr' ? 'झूम कमी करा (-)' : 'Zoom Out (-)'}
                    onClick={handleZoomOut}
                    disabled={mapZoom <= 6}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: mapZoom <= 6 ? '#64748b' : '#ffffff',
                      fontSize: 15,
                      fontWeight: 800,
                      width: 26,
                      height: 26,
                      borderRadius: 4,
                      cursor: mapZoom <= 6 ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#38bdf8', minWidth: 28, textAlign: 'center' }}>
                    {mapZoom}x
                  </span>
                  <button
                    type="button"
                    title={language === 'mr' ? 'झूम वाढवा (+)' : 'Zoom In (+)'}
                    onClick={handleZoomIn}
                    disabled={mapZoom >= 19}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: mapZoom >= 19 ? '#64748b' : '#ffffff',
                      fontSize: 15,
                      fontWeight: 800,
                      width: 26,
                      height: 26,
                      borderRadius: 4,
                      cursor: mapZoom >= 19 ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Mode Switcher */}
                <div style={{ display: 'inline-flex', background: '#334155', borderRadius: 8, padding: 2 }}>
                  <button
                    type="button"
                    onClick={() => setMapMode('roadmap')}
                    style={{
                      border: 0,
                      background: mapMode === 'roadmap' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 650,
                      padding: '5px 9px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'mr' ? 'रस्ता' : 'Map'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('satellite')}
                    style={{
                      border: 0,
                      background: mapMode === 'satellite' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 650,
                      padding: '5px 9px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'mr' ? 'उपग्रह' : 'Satellite'}
                  </button>
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  style={{
                    border: '1px solid #475569',
                    background: '#1e293b',
                    color: '#38bdf8',
                    borderRadius: 8,
                    padding: '5px 11px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <span>⛶</span>
                  <span>{language === 'mr' ? 'पूर्ण पडदा' : 'Fullscreen'}</span>
                </button>

                {/* Open in Google Maps */}
                <a
                  href={googleMapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: '1px solid #475569',
                    background: '#1e293b',
                    color: '#e2e8f0',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: 12,
                    fontWeight: 650,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>Google Maps ↗</span>
                </a>
              </div>
            </div>

            {/* Zoom Presets & Location Switcher Row */}
            <div style={{
              padding: '7px 12px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              {/* Zoom Preset Shortcuts */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, overflowX: 'auto' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {language === 'mr' ? 'झूम स्तर:' : 'Zoom Level:'}
                </span>
                {[
                  { lvl: 10, labelMr: 'जिल्हा', labelEn: 'District', icon: '🏛️' },
                  { lvl: 13, labelMr: 'तालुका', labelEn: 'Taluka', icon: '📍' },
                  { lvl: 15, labelMr: 'गाव', labelEn: 'Village', icon: '🏡' },
                  { lvl: 17, labelMr: 'रस्ता/बूथ', labelEn: 'Street', icon: '🎯' },
                ].map((p) => (
                  <button
                    key={p.lvl}
                    type="button"
                    onClick={() => setMapZoom(p.lvl)}
                    style={{
                      border: mapZoom === p.lvl ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: mapZoom === p.lvl ? '#dbeafe' : '#ffffff',
                      color: mapZoom === p.lvl ? '#1d4ed8' : '#475569',
                      borderRadius: 14,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: mapZoom === p.lvl ? 750 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {p.icon} {language === 'mr' ? p.labelMr : p.labelEn} ({p.lvl}x)
                  </button>
                ))}
              </div>

              {/* Quick Area Switchers */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {language === 'mr' ? 'क्षेत्र:' : 'Area:'}
                </span>

                {/* District pill */}
                {selectedDistricts.length > 0 && selectedDistricts.map((d) => (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => {
                      setActiveMapTarget({ type: 'DISTRICT', name_en: d.name_en, name_mr: d.name_mr });
                      setMapZoom(11);
                    }}
                    style={{
                      border: currentTarget.type === 'DISTRICT' && (currentTarget.name_en === d.name_en || currentTarget.name_mr === d.name_mr) ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: currentTarget.type === 'DISTRICT' && (currentTarget.name_en === d.name_en || currentTarget.name_mr === d.name_mr) ? '#dbeafe' : '#ffffff',
                      color: currentTarget.type === 'DISTRICT' && (currentTarget.name_en === d.name_en || currentTarget.name_mr === d.name_mr) ? '#1d4ed8' : '#334155',
                      borderRadius: 20,
                      padding: '3px 9px',
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    🏢 {d.name_mr || d.name_en}
                  </button>
                ))}

                {/* Target / Assembly / Lok Sabha pill */}
                {target && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMapTarget({ type: scope, name_en: target.name_en || target.name, name_mr: target.name_mr });
                      setMapZoom(scope === 'ASSEMBLY' ? 12 : 11);
                    }}
                    style={{
                      border: currentTarget.type === scope ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: currentTarget.type === scope ? '#dbeafe' : '#ffffff',
                      color: currentTarget.type === scope ? '#1d4ed8' : '#334155',
                      borderRadius: 20,
                      padding: '3px 9px',
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    🏛️ {target.name_mr || target.name_en}
                  </button>
                )}

                {/* Talukas pills */}
                {selectedTalukas.length > 0 && selectedTalukas.map((t) => (
                  <button
                    key={t.code || t.id}
                    type="button"
                    onClick={() => {
                      setActiveMapTarget({ type: 'TALUKA', name_en: t.name_en || t.taluka_name, name_mr: t.name_mr, district_name: activeDistrictName });
                      setMapZoom(13);
                    }}
                    style={{
                      border: currentTarget.type === 'TALUKA' && (currentTarget.name_en === (t.name_en || t.taluka_name) || currentTarget.name_mr === t.name_mr) ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                      background: currentTarget.type === 'TALUKA' && (currentTarget.name_en === (t.name_en || t.taluka_name) || currentTarget.name_mr === t.name_mr) ? '#dcfce7' : '#ffffff',
                      color: currentTarget.type === 'TALUKA' && (currentTarget.name_en === (t.name_en || t.taluka_name) || currentTarget.name_mr === t.name_mr) ? '#15803d' : '#334155',
                      borderRadius: 20,
                      padding: '3px 9px',
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    📍 {t.name_mr || t.name_en || t.taluka_name}
                  </button>
                ))}

                {/* Villages pills */}
                {selectedVillages.length > 0 && selectedVillages.map((v) => (
                  <button
                    key={v.code || v.id}
                    type="button"
                    onClick={() => {
                      setActiveMapTarget({ type: 'VILLAGE', name_en: v.name_en || v.village_name, name_mr: v.name_mr, district_name: activeDistrictName });
                      setMapZoom(15);
                    }}
                    style={{
                      border: currentTarget.type === 'VILLAGE' && (currentTarget.name_en === (v.name_en || v.village_name) || currentTarget.name_mr === v.name_mr) ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                      background: currentTarget.type === 'VILLAGE' && (currentTarget.name_en === (v.name_en || v.village_name) || currentTarget.name_mr === v.name_mr) ? '#f3e8ff' : '#ffffff',
                      color: currentTarget.type === 'VILLAGE' && (currentTarget.name_en === (v.name_en || v.village_name) || currentTarget.name_mr === v.name_mr) ? '#6d28d9' : '#334155',
                      borderRadius: 20,
                      padding: '3px 9px',
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    🏡 {v.name_mr || v.name_en || v.village_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Iframe Container with onWheel zoom and floating on-map controls */}
            <div
              onWheel={handleWheelZoom}
              style={{ position: 'relative', width: '100%', height: 350, background: '#e2e8f0', overflow: 'hidden' }}
            >
              {/* Floating on-map zoom widget */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 9,
                  padding: '5px 4px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <button
                  type="button"
                  title={language === 'mr' ? 'झूम इन करा (+)' : 'Zoom In (+)'}
                  onClick={handleZoomIn}
                  disabled={mapZoom >= 19}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    border: 0,
                    background: mapZoom >= 19 ? '#334155' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 17,
                    fontWeight: 800,
                    cursor: mapZoom >= 19 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  +
                </button>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', padding: '2px 0', userSelect: 'none' }}>
                  {mapZoom}x
                </div>
                <button
                  type="button"
                  title={language === 'mr' ? 'झूम आउट करा (-)' : 'Zoom Out (-)'}
                  onClick={handleZoomOut}
                  disabled={mapZoom <= 6}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    border: 0,
                    background: mapZoom <= 6 ? '#334155' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 17,
                    fontWeight: 800,
                    cursor: mapZoom <= 6 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  −
                </button>
                <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.15)', margin: '2px 0' }} />
                <button
                  type="button"
                  title={language === 'mr' ? 'मूळ झूम रीसेट करा' : 'Reset Default Zoom'}
                  onClick={() => setMapZoom(getTargetDefaultZoom(currentTarget))}
                  style={{
                    width: 28,
                    height: 22,
                    borderRadius: 5,
                    border: 0,
                    background: 'rgba(255,255,255,0.12)',
                    color: '#94a3b8',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  ⟲
                </button>
              </div>

              <InteractiveGeographicMap
                target={currentTarget}
                zoom={mapZoom}
                onZoomChange={(newZoom) => setMapZoom(newZoom)}
                mapMode={mapMode}
                language={language}
                height="100%"
              />
            </div>

            {/* Scroll / Pan & Zoom Helper Bar */}
            <div style={{
              padding: '7px 14px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 11.5,
              color: '#64748b'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>👆</span>
                <span>
                  {language === 'mr'
                    ? 'नकाशा हलवण्यासाठी ड्रॅग (Scroll/Pan) करा • झूमसाठी [ + ] / [ − ] बटणे किंवा Mouse Wheel वापरा'
                    : 'Click & drag to scroll/pan map • Use [ + ] / [ − ] buttons or mouse wheel to zoom'}
                </span>
              </span>
              <span style={{ fontWeight: 650, color: '#1e40af', background: '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>
                {language === 'mr'
                  ? `झूम: ${mapZoom}x (${mapZoom >= 16 ? 'तपशीलवार/रस्ता' : mapZoom >= 14 ? 'गाव/शहर' : mapZoom >= 12 ? 'तालुका' : 'जिल्हा स्तर'})`
                  : `Zoom: ${mapZoom}x (${mapZoom >= 16 ? 'Street Level' : mapZoom >= 14 ? 'Village' : mapZoom >= 12 ? 'Taluka' : 'District Level'})`}
              </span>
            </div>
          </div>
        </div>
      );
    })()}

    <hr style={{ border: 0, borderTop: '1px solid #e8edf3', margin: '20px 0', width: '100%' }} />
    <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 13, fontWeight: 750, marginBottom: 12 }}>
        {isMr ? 'प्रकल्प कालावधी (ऐच्छिक)' : 'PROJECT PERIOD (OPTIONAL)'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <label style={style.label}>
          {isMr ? 'प्रारंभ तारीख' : 'Start Date'}
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} style={{ ...style.input, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} />
        </label>
        <label style={style.label}>
          {isMr ? 'समाप्ती तारीख' : 'End Date'}
          <input type="date" min={form.start_date || undefined} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={{ ...style.input, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} />
        </label>
      </div>
    </div>

    {/* ============================================================== */}
    {/* ELECTION CANDIDATES SECTION (उमेदवार व्यवस्थापन)               */}
    {/* ============================================================== */}
    <hr style={{ border: 0, borderTop: '1px solid #e8edf3', margin: '22px 0 18px 0', width: '100%' }} />
    <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 20 }}>🗳️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 750, color: '#0f172a' }}>
              {isMr ? 'या निवडणुकीतील उमेदवार (Election Candidates) - ऐच्छिक' : 'Election Candidates (Optional)'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {isMr
                ? 'निवडणुकीसाठी उमेदवार, पक्षाचे चिन्ह व फोटो आधीच जोडा किंवा नंतर जोडा.'
                : 'Pre-configure candidates, party symbols and photos for EVM voting.'}
            </div>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: 999,
            background: electionCandidates.length > 0 ? '#eff6ff' : '#f1f5f9',
            color: electionCandidates.length > 0 ? '#1d4ed8' : '#64748b',
            border: `1px solid ${electionCandidates.length > 0 ? '#bfdbfe' : '#e2e8f0'}`
          }}>
            {electionCandidates.length} {isMr ? 'उमेदवार' : `Candidate${electionCandidates.length === 1 ? '' : 's'}`}
          </span>
        </div>

        <button
          type="button"
          onClick={openAddCandModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            background: '#2563eb',
            color: '#fff',
            border: 0,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; }}
        >
          <span>➕</span>
          <span>{isMr ? 'नवीन उमेदवार जोडा' : 'Add Candidate'}</span>
        </button>
      </div>

      {electionCandidates.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: 12,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {electionCandidates.map((cand, idx) => (
            <div
              key={idx}
              style={{
                background: cand.highlighted ? '#fffbeb' : '#ffffff',
                border: cand.highlighted ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Top row: Serial badge & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: '#1e293b',
                    color: '#f8fafc'
                  }}>
                    #{cand.serial_number || idx + 1}
                  </span>
                  {cand.highlighted && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 6,
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a'
                    }}>
                      ⭐ {isMr ? 'प्रमुख उमेदवार' : 'Star'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => openEditCandModal(cand, idx)}
                    style={{
                      border: 0,
                      background: '#f1f5f9',
                      color: '#334155',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 650
                    }}
                    title={isMr ? 'संपादित करा' : 'Edit'}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCandidate(idx)}
                    style={{
                      border: 0,
                      background: '#fee2e2',
                      color: '#dc2626',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 650
                    }}
                    title={isMr ? 'हटवा' : 'Delete'}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Main Candidate Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Candidate Photo */}
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  border: '2px solid #e2e8f0',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  {cand.candidate_photo ? (
                    <img
                      src={cand.candidate_photo}
                      alt={cand.candidate_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: 24, color: '#94a3b8' }}>👤</span>
                  )}
                </div>

                {/* Candidate Name & Party */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 750,
                    fontSize: 14,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cand.candidate_name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: '#eff6ff',
                      color: '#1d4ed8'
                    }}>
                      {cand.party_name || (isMr ? 'अपक्ष' : 'Independent')}
                    </span>
                    {cand.position && (
                      <span style={{
                        fontSize: 11,
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        • {cand.position}
                      </span>
                    )}
                  </div>
                </div>

                {/* Party Symbol Preview */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden'
                }} title={`${isMr ? 'पक्ष चिन्ह' : 'Symbol'}: ${cand.party_symbol || '🗳️'}`}>
                  {cand.party_symbol && (cand.party_symbol.startsWith('http') || cand.party_symbol.startsWith('data:')) ? (
                    <img
                      src={cand.party_symbol}
                      alt="symbol"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: 24 }}>{cand.party_symbol || '🗳️'}</span>
                  )}
                </div>
              </div>

              {/* Extra details (Ward, Phone, Voice) */}
              {(cand.ward_village || cand.contact_phone || cand.voice_message) && (
                <div style={{
                  paddingTop: 8,
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 6,
                  fontSize: 11,
                  color: '#64748b'
                }}>
                  {cand.ward_village && (
                    <span>📍 {cand.ward_village}</span>
                  )}
                  {cand.contact_phone && (
                    <span>📞 {cand.contact_phone}</span>
                  )}
                  {cand.voice_message && (
                    <span title={cand.voice_message} style={{ color: '#059669', fontWeight: 600 }}>
                      🎙️ {isMr ? 'धन्यवाद संदेश' : 'Voice Note'}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '24px 16px',
          background: '#f8fafc',
          borderRadius: 12,
          border: '1.5px dashed #cbd5e1',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ fontSize: 32 }}>👥</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              {isMr ? 'या निवडणुकीसाठी अद्याप उमेदवार जोडलेले नाहीत' : 'No candidates configured for this election yet'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
              {isMr
                ? 'तुम्ही आताच उमेदवार जोडू शकता किंवा प्रकल्प तयार झाल्यानंतर EVM स्क्रीनवर देखील उमेदवार जोडता येतील.'
                : 'You can add candidates now or configure them later in the EVM Voting screen.'}
            </div>
          </div>
          <button
            type="button"
            onClick={openAddCandModal}
            style={{
              marginTop: 4,
              padding: '7px 14px',
              borderRadius: 6,
              background: '#ffffff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            ➕ {isMr ? 'पहिला उमेदवार जोडा' : 'Add First Candidate'}
          </button>
        </div>
      )}
    </div>

    {/* ============================================================== */}
    {/* CANDIDATE CREATION / EDIT MODAL                                */}
    {/* ============================================================== */}
    {showCandModal && (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          boxSizing: 'border-box'
        }}
        onClick={() => setShowCandModal(false)}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            width: '100%',
            maxWidth: 620,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            boxSizing: 'border-box'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🗳️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 750, color: '#ffffff' }}>
                  {editingCandIdx !== null
                    ? (isMr ? 'उमेदवार माहिती संपादित करा' : 'Edit Candidate Details')
                    : (isMr ? 'नवीन उमेदवार तयार करा' : 'Add New Candidate')}
                </h3>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {isMr ? 'नाव, पक्षाचे नाव, चिन्ह, फोटो व पद प्रविष्ट करा' : 'Enter name, party, symbol, photo and position'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCandModal(false)}
              style={{
                border: 0,
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              ✕
            </button>
          </div>

          {/* Modal Form Content */}
          <form
            onSubmit={handleSaveCandidate}
            style={{
              padding: '18px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxSizing: 'border-box'
            }}
          >
            {/* Row 1: Serial No & Star Checkbox */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  {isMr ? 'अनुक्रमांक (Serial)' : 'Serial No.'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={candForm.serial_number}
                  onChange={(e) => setCandForm({ ...candForm, serial_number: e.target.value })}
                  style={{ ...style.input, margin: 0, padding: '8px 10px', fontSize: 13 }}
                />
              </div>

              <div style={{ paddingTop: 18 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 650, color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={candForm.highlighted}
                    onChange={(e) => setCandForm({ ...candForm, highlighted: e.target.checked })}
                    style={{ width: 17, height: 17, cursor: 'pointer' }}
                  />
                  <span>⭐ {isMr ? 'प्रमुख / स्टार उमेदवार (Highlight on EVM)' : 'Star Candidate (Highlight on EVM)'}</span>
                </label>
              </div>
            </div>

            {/* Row 2: Candidate Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                {isMr ? 'उमेदवाराचे पूर्ण नाव *' : 'Candidate Full Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={isMr ? 'उदा. राजेश रामचंद्र पाटील' : 'e.g. Rajesh Ramchandra Patil'}
                value={candForm.candidate_name}
                onChange={(e) => setCandForm({ ...candForm, candidate_name: e.target.value })}
                style={{ ...style.input, margin: 0, padding: '9px 12px', fontSize: 14 }}
              />
            </div>

            {/* Row 3: Party Name & Quick Chips */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  {isMr ? 'राजकीय पक्ष / आघाडी' : 'Political Party / Alliance'}
                </label>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {isMr ? 'किंवा अपक्ष' : 'or Independent'}
                </span>
              </div>
              <input
                type="text"
                placeholder={isMr ? 'उदा. शिवसेना, भाजप, काँग्रेस, राष्ट्रवादी, आप, अपक्ष' : 'e.g. BJP, Shiv Sena, Congress, NCP, Independent'}
                value={candForm.party_name}
                onChange={(e) => setCandForm({ ...candForm, party_name: e.target.value })}
                style={{ ...style.input, margin: 0, padding: '8px 12px', fontSize: 13 }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {['भाजप', 'शिवसेना', 'काँग्रेस', 'राष्ट्रवादी', 'मनसे', 'आप', 'वंचित', 'अपक्ष'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCandForm({ ...candForm, party_name: p })}
                    style={{
                      border: '1px solid #e2e8f0',
                      background: candForm.party_name === p ? '#2563eb' : '#f8fafc',
                      color: candForm.party_name === p ? '#ffffff' : '#334155',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Party Symbol with Quick Pills and Upload */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                {isMr ? 'निवडणूक चिन्ह (Party Symbol)' : 'Election Symbol'}
              </label>

              {/* Quick symbol picker */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {QUICK_SYMBOLS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setCandForm({ ...candForm, party_symbol: s.emoji })}
                    style={{
                      border: candForm.party_symbol === s.emoji ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: candForm.party_symbol === s.emoji ? '#eff6ff' : '#ffffff',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                    title={s.label}
                  >
                    <span>{s.emoji}</span>
                  </button>
                ))}
              </div>

              {/* Symbol Custom inputs & Live Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    type="text"
                    placeholder={isMr ? 'चिन्ह इमोजी किंवा इमेज URL प्रविष्ट करा' : 'Symbol emoji or image URL'}
                    value={candForm.party_symbol}
                    onChange={(e) => setCandForm({ ...candForm, party_symbol: e.target.value })}
                    style={{ ...style.input, margin: 0, padding: '7px 10px', fontSize: 13 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label style={{
                      fontSize: 11,
                      fontWeight: 650,
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      border: '1px solid #bfdbfe'
                    }}>
                      📁 {isMr ? 'चिन्ह इमेज फाइल निवडा' : 'Upload Symbol File'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleCandFileUpload(e, 'party_symbol')}
                      />
                    </label>
                  </div>
                </div>

                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: 8,
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden'
                }}>
                  {candForm.party_symbol && (candForm.party_symbol.startsWith('http') || candForm.party_symbol.startsWith('data:')) ? (
                    <img src={candForm.party_symbol} alt="Symbol" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: 28 }}>{candForm.party_symbol || '🗳️'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 5: Candidate Photo with Upload and Live Preview */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                {isMr ? 'उमेदवाराचा फोटो (Candidate Photo)' : 'Candidate Photo'}
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    type="text"
                    placeholder={isMr ? 'फोटो URL प्रविष्ट करा किंवा खालील बटणाने फाइल निवडा' : 'Photo URL or choose file below'}
                    value={candForm.candidate_photo}
                    onChange={(e) => setCandForm({ ...candForm, candidate_photo: e.target.value })}
                    style={{ ...style.input, margin: 0, padding: '7px 10px', fontSize: 13 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label style={{
                      fontSize: 11,
                      fontWeight: 650,
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      border: '1px solid #bfdbfe'
                    }}>
                      📷 {isMr ? 'फोटो फाइल निवडा (Upload Photo)' : 'Upload Photo File'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleCandFileUpload(e, 'candidate_photo')}
                      />
                    </label>
                  </div>
                </div>

                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  border: '2px solid #cbd5e1',
                  background: '#f8fafc',
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden'
                }}>
                  {candForm.candidate_photo ? (
                    <img src={candForm.candidate_photo} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24, color: '#94a3b8' }}>👤</span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 6: Position & Ward/Village */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  {isMr ? 'निवडणूक पद (Position)' : 'Electoral Position'}
                </label>
                <input
                  type="text"
                  placeholder={isMr ? 'उदा. नगराध्यक्ष, सरपंच, नगरसेवक, आमदार' : 'e.g. Mayor, Sarpanch, MLA, Corporator'}
                  value={candForm.position}
                  onChange={(e) => setCandForm({ ...candForm, position: e.target.value })}
                  style={{ ...style.input, margin: 0, padding: '8px 10px', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  {isMr ? 'प्रभाग क्र. / गाव (Ward / Village)' : 'Ward / Village'}
                </label>
                <input
                  type="text"
                  placeholder={isMr ? 'उदा. प्रभाग क्र. १२ / सांगली गाव' : 'e.g. Ward No. 12 / Sangli'}
                  value={candForm.ward_village}
                  onChange={(e) => setCandForm({ ...candForm, ward_village: e.target.value })}
                  style={{ ...style.input, margin: 0, padding: '8px 10px', fontSize: 13 }}
                />
              </div>
            </div>

            {/* Row 7: Contact Phone & Voice Message */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  {isMr ? 'संपर्क मोबाईल क्र.' : 'Contact Phone'}
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={candForm.contact_phone}
                  onChange={(e) => setCandForm({ ...candForm, contact_phone: e.target.value })}
                  style={{ ...style.input, margin: 0, padding: '8px 10px', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  {isMr ? 'मतदारांसाठी संदेश (Thank-You Message)' : 'Voter Voice Message'}
                </label>
                <input
                  type="text"
                  placeholder={isMr ? 'मतदान केल्याबद्दल धन्यवाद!' : 'Thank you for your valuable vote!'}
                  value={candForm.voice_message}
                  onChange={(e) => setCandForm({ ...candForm, voice_message: e.target.value })}
                  style={{ ...style.input, margin: 0, padding: '8px 10px', fontSize: 13 }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setShowCandModal(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 0,
                  fontWeight: 650,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="submit"
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 0,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                }}
              >
                {editingCandIdx !== null
                  ? (isMr ? '✓ बदल जतन करा' : 'Save Changes')
                  : (isMr ? '➕ उमेदवार जोडा' : 'Add Candidate')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {error && <div role="alert" style={{ marginTop: 8, marginBottom: 14, padding: 12, background: '#fff2f0', color: '#b42318', border: '1px solid #fecdca', borderRadius: 8, width: '100%', boxSizing: 'border-box' }}>{error}</div>}
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, flexWrap: 'wrap', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <button type="button" onClick={() => { setForm({ name: '', description: '', start_date: '', end_date: '' }); resetScope(''); }} style={{ ...style.button, background: '#eef2f8', color: '#334155' }}>
        {isMr ? 'रीसेट करा' : 'Clear'}
      </button>
      <button type="submit" disabled={submitting || !scope || !isFormReady} style={{ ...style.button, opacity: submitting || !scope || !isFormReady ? .55 : 1, cursor: submitting || !scope || !isFormReady ? 'not-allowed' : 'pointer' }}>
        {submitting ? (isMr ? 'प्रकल्प जोडत आहे…' : 'Adding Project…') : (isMr ? '➕ नवीन प्रकल्प जोडा' : '➕ Add Project')}
      </button>
    </div>

    {/* ============================================================== */}
    {/* FULLSCREEN GEOGRAPHIC MAP MODAL                                */}
    {/* ============================================================== */}
    {showMapModal && (() => {
      const currentTarget = activeMapTarget || (
        selectedTalukas.length > 0
          ? { type: 'TALUKA', name_en: selectedTalukas[selectedTalukas.length - 1].name_en || selectedTalukas[selectedTalukas.length - 1].taluka_name, name_mr: selectedTalukas[selectedTalukas.length - 1].name_mr, district_name: activeDistrictName }
          : selectedDistricts.length > 0
            ? { type: 'DISTRICT', name_en: selectedDistricts[0].name_en || selectedDistricts[0].name, name_mr: selectedDistricts[0].name_mr }
            : filterDistrict
              ? { type: 'DISTRICT', name_en: filterDistrict.name_en || filterDistrict.name, name_mr: filterDistrict.name_mr }
              : target
                ? { type: scope, name_en: target.name_en || target.name, name_mr: target.name_mr }
                : { type: 'DISTRICT', name_en: 'Sangli', name_mr: 'सांगली' }
      );
      const query = getMapQuery(currentTarget);
      const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${mapMode === 'satellite' ? 'k' : ''}&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
      const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

      return (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'min(14px, 2.5vw)',
            boxSizing: 'border-box'
          }}
          onClick={() => setShowMapModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              width: '100%',
              maxWidth: 'min(1040px, 96vw)',
              height: 'min(720px, 94vh)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              gap: 10,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🗺️</span>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentTarget.name_mr || currentTarget.name_en} {language === 'mr' ? 'भौगोलिक नकाशा' : 'Geographic Map'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {query}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Modal Zoom Toolbar */}
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#334155', borderRadius: 8, padding: '2px 4px', gap: 4 }}>
                  <button
                    type="button"
                    title={language === 'mr' ? 'झूम कमी करा (-)' : 'Zoom Out (-)'}
                    onClick={handleZoomOut}
                    disabled={mapZoom <= 6}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: mapZoom <= 6 ? '#64748b' : '#ffffff',
                      fontSize: 16,
                      fontWeight: 800,
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: mapZoom <= 6 ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 12, fontWeight: 750, color: '#38bdf8', minWidth: 32, textAlign: 'center' }}>
                    {mapZoom}x
                  </span>
                  <button
                    type="button"
                    title={language === 'mr' ? 'झूम वाढवा (+)' : 'Zoom In (+)'}
                    onClick={handleZoomIn}
                    disabled={mapZoom >= 19}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: mapZoom >= 19 ? '#64748b' : '#ffffff',
                      fontSize: 16,
                      fontWeight: 800,
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: mapZoom >= 19 ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Mode Switcher */}
                <div style={{ display: 'inline-flex', background: '#334155', borderRadius: 8, padding: 2 }}>
                  <button
                    type="button"
                    onClick={() => setMapMode('roadmap')}
                    style={{
                      border: 0,
                      background: mapMode === 'roadmap' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 650,
                      padding: '5px 10px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'mr' ? 'रस्ता' : 'Map'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('satellite')}
                    style={{
                      border: 0,
                      background: mapMode === 'satellite' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 650,
                      padding: '5px 10px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'mr' ? 'उपग्रह' : 'Satellite'}
                  </button>
                </div>

                <a
                  href={googleMapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: '1px solid #475569',
                    background: '#1e293b',
                    color: '#38bdf8',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 650,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  Google Maps ↗
                </a>

                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  style={{
                    border: 0,
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Zoom Presets Sub-bar */}
            <div style={{
              padding: '6px 14px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {language === 'mr' ? 'त्वरित झूम निवडा:' : 'Quick Zoom:'}
                </span>
                {[
                  { lvl: 10, labelMr: 'जिल्हा स्तर', labelEn: 'District', icon: '🏛️' },
                  { lvl: 13, labelMr: 'तालुका स्तर', labelEn: 'Taluka', icon: '📍' },
                  { lvl: 15, labelMr: 'गाव/शहर', labelEn: 'Village', icon: '🏡' },
                  { lvl: 17, labelMr: 'रस्ता/बूथ स्तर', labelEn: 'Street/Booth', icon: '🎯' },
                ].map((p) => (
                  <button
                    key={p.lvl}
                    type="button"
                    onClick={() => setMapZoom(p.lvl)}
                    style={{
                      border: mapZoom === p.lvl ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: mapZoom === p.lvl ? '#dbeafe' : '#ffffff',
                      color: mapZoom === p.lvl ? '#1d4ed8' : '#475569',
                      borderRadius: 14,
                      padding: '3px 9px',
                      fontSize: 11,
                      fontWeight: mapZoom === p.lvl ? 750 : 600,
                      cursor: 'pointer'
                    }}
                  >
                    {p.icon} {language === 'mr' ? p.labelMr : p.labelEn} ({p.lvl}x)
                  </button>
                ))}
              </div>

              <span style={{ fontSize: 11.5, color: '#64748b' }}>
                {language === 'mr' ? `सध्याचे क्षेत्र: ${currentTarget.name_mr || currentTarget.name_en}` : `Current target: ${currentTarget.name_en}`}
              </span>
            </div>

            {/* Map Iframe with onWheel zoom and floating on-map controls */}
            <div
              onWheel={handleWheelZoom}
              style={{ flex: 1, position: 'relative', width: '100%', background: '#e2e8f0', overflow: 'hidden' }}
            >
              {/* Floating on-map zoom widget */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  zIndex: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 10,
                  padding: '6px 5px',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <button
                  type="button"
                  title={language === 'mr' ? 'झूम इन करा (+)' : 'Zoom In (+)'}
                  onClick={handleZoomIn}
                  disabled={mapZoom >= 19}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: 0,
                    background: mapZoom >= 19 ? '#334155' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: mapZoom >= 19 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  +
                </button>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', padding: '2px 0', userSelect: 'none' }}>
                  {mapZoom}x
                </div>
                <button
                  type="button"
                  title={language === 'mr' ? 'झूम आउट करा (-)' : 'Zoom Out (-)'}
                  onClick={handleZoomOut}
                  disabled={mapZoom <= 6}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: 0,
                    background: mapZoom <= 6 ? '#334155' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: mapZoom <= 6 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  −
                </button>
                <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.15)', margin: '2px 0' }} />
                <button
                  type="button"
                  title={language === 'mr' ? 'मूळ झूम रीसेट करा' : 'Reset Default Zoom'}
                  onClick={() => setMapZoom(getTargetDefaultZoom(currentTarget))}
                  style={{
                    width: 30,
                    height: 24,
                    borderRadius: 5,
                    border: 0,
                    background: 'rgba(255,255,255,0.12)',
                    color: '#94a3b8',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  ⟲
                </button>
              </div>

              <InteractiveGeographicMap
                target={currentTarget}
                zoom={mapZoom}
                onZoomChange={(newZoom) => setMapZoom(newZoom)}
                mapMode={mapMode}
                language={language}
                height="100%"
              />
            </div>

            {/* Scroll / Pan & Zoom Helper Bar */}
            <div style={{
              padding: '8px 16px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 12,
              color: '#64748b'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>👆</span>
                <span>
                  {language === 'mr'
                    ? 'नकाशा हलवण्यासाठी ड्रॅग (Scroll/Pan) करा • झूमसाठी [ + ] / [ − ] किंवा Mouse Wheel वापरा'
                    : 'Click & drag to scroll/pan map • Use [ + ] / [ − ] buttons or mouse wheel to zoom'}
                </span>
              </span>
              <span style={{ fontWeight: 650, color: '#1e40af', background: '#eff6ff', padding: '3px 10px', borderRadius: 6 }}>
                {language === 'mr'
                  ? `सध्याचा झूम स्तर: ${mapZoom}x (${mapZoom >= 16 ? 'तपशीलवार/रस्ता स्तर' : mapZoom >= 14 ? 'गाव/शहर स्तर' : mapZoom >= 12 ? 'तालुका स्तर' : 'जिल्हा स्तर'})`
                  : `Current Zoom: ${mapZoom}x (${mapZoom >= 16 ? 'Street Level' : mapZoom >= 14 ? 'Village Level' : mapZoom >= 12 ? 'Taluka Level' : 'District Level'})`}
              </span>
            </div>
          </div>
        </div>
      );
    })()}
  </form>, language);
}

export default ProjectCreateForm;
