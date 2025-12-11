import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, FileText, Plus, Users, LogOut, Search, 
  PenTool, CheckCircle, Save, Printer, ArrowLeft, Mail, 
  MapPin, Trash2, Eye, RotateCw, X, Table, DownloadCloud, Settings, CheckSquare, ChevronRight, UserCheck, Map as MapIcon, Sliders, Loader2
} from 'lucide-react';
import logoImage from './assets/division.png';

// --- CONFIG ---
// *** ใส่ลิงก์ GAS ของคุณที่นี่ ***
const API_URL = 'https://script.google.com/macros/s/AKfycbwAL1ISDOIC_0TVh4RZniHn34vP0O7x5yBHlyxGZ1-u8ctgEg9OtG9dNMAZwxH7sNww/exec'; 

// --- Constants ---
const CONTRACT_TYPES = {
  contract_page_1: "สัญญาจ้างงาน",
  probation_contract_page: "สัญญาจ้างทดลองงาน",
  secret_contract_page: "หนังสือสัญญาไม่เปิดเผยข้อมูลทางธุรกิจ"
};

const WORK_SET_LABELS = {
  A: "07.00-16.00 น. (กะ/shift)",
  B: "07.00-16.00 น.",
  C: "08.00-17.10 น.",
  D: "08.30-17.40 น."
};

const WORK_SETS_FULL = {
  A: [
    "(ก) วันทํางาน สัปดาห์ละ 6 วัน (ข) เวลาทํางาน 07.00-16.00 น. เวลาพัก 11.30-12.30 น., เวลาทํางาน 16.00-01.00 น.",
    "เวลาพัก 20.00-21.00น. เวลาทํางาน 19.00-04.00น. เวลาพัก 23.00-24.00น. มีการเปลี่ยนแปลงวันและเวลาทํางาน",
    "พนักงานตกลงยินยอมด้วยโดยจะเซ็นรับทราบร่วมกันเพื่อเปลี่ยนแปลง(หยุดวันอาทิตย์และวันหยุดตามประเพณีตามที่บริษัทประกาศ)"
  ],
  B: [
    "(ก) วันทํางาน สัปดาห์ละ 6 วัน (ข) เวลาทํางาน 07.00-16.00 น. เวลาพัก 11.30-12.30 น. ถ้ามีการเปลี่ยนแปลงวันและเวลาทํางาน",
    "พนักงานตกลงยินยอมโดยเซ็นรับทราบร่วมกันเพื่อเปลี่ยนแปลง (หยุดวันอาทิตย์และวันหยุดตามประเพณีตามที่บริษัทประกาศ)"
  ],
  C: [
    "(ก) วันทํางาน สัปดาห์ละ 6 วัน (ข) เวลาทํางาน 08.00-17.10 น. เวลาพัก 11.30-12.30 น. เวลาพักเบรก 10.30-10.40 น.",
    "และ 15.30-15.40น. ถ้ามีการเปลี่ยนแปลงวันและเวลาทํางาน พนักงานตกลงยินยอมด้วยโดยจะเซ็นรับทราบร่วมกัน",
    "เพื่อเปลี่ยนแปลง (หยุดวันอาทิตย์และวันหยุดตามประเพณีตามที่บริษัทประกาศ)"
  ],
  D: [
    "(ก) วันทํางาน สัปดาห์ละ 6 วัน (ข) เวลาทํางาน 08.30-17.40 น. เวลาพัก 12.00-13.00 น. เวลาพักเบรก 10.30-10.40 น.",
    "และ 15.30-15.40น. ถ้ามีการเปลี่ยนแปลงวันและเวลาทํางาน พนักงานตกลงยินยอมด้วยโดยจะเซ็นรับทราบร่วมกัน",
    "เพื่อเปลี่ยนแปลง (หยุดวันอาทิตย์และวันหยุดตามประเพณีตามที่บริษัทประกาศ)"
  ]
};

const COMPANIES = [
  "บริษัท คาร์เปท เมกเกอร์ (ประเทศไทย) จำกัด",
  "บริษัท คาร์เปท เมกเกอร์ พี2ดับบลิว (ประเทศไทย) จำกัด",
  "บริษัท ไอเค รีเสิร์จ จำกัด",
  "บริษัท อินเตอร์ ไกร จำกัด"
];

const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

// --- COMPONENTS ---

const LoadingOverlay = ({ message = "กำลังประมวลผล..." }) => (
  <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center backdrop-blur-sm animate-fade-in">
     <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-gray-100 transform scale-110 transition-all">
         <div className="relative">
             <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-navy rounded-full animate-spin"></div>
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img src={logoImage} alt="Loading" className="mx-auto h-8 w-auto opacity-50" />
             </div>
         </div>
         <p className="text-primary-navy font-bold mt-6 text-lg tracking-wide">{message}</p>
         <p className="text-gray-400 text-xs mt-1 animate-pulse">กรุณารอสักครู่...</p>
     </div>
  </div>
);

const Input = ({ label, name, val, onChange, type="text", required=false, placeholder="" }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type} 
      name={name} 
      value={val} 
      onChange={onChange} 
      required={required} 
      placeholder={placeholder} 
      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-primary-gold outline-none transition-all" 
    />
  </div>
);

const SettingsModal = ({ onClose, currentSettings, onSave, setGlobalLoading }) => {
  const [formData, setFormData] = useState({
    sender_name: currentSettings.sender_name || 'HR System', // Default Name
    sender_email: currentSettings.sender_email || '',        // Reply-To Email
    email_hr: currentSettings.email_hr || '',
    email_approver: currentSettings.email_approver || ''
  });

  const handleSave = async () => {
    setGlobalLoading(true);
    try {
      await apiCall({
        action: 'saveSettings',
        settings: formData
      });
      alert('✅ บันทึกการตั้งค่าเรียบร้อย');
      onSave(formData);
    } catch (e) {
      alert('❌ บันทึกไม่สำเร็จ');
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-neutral-dark/60 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-secondary-silver/50">
        <div className="p-5 border-b border-secondary-silver bg-white flex justify-between items-center">
           <h3 className="font-bold text-xl text-primary-navy flex items-center gap-2">
             <Settings className="text-primary-gold" size={24}/> ตั้งค่าระบบ (Settings)
           </h3>
           <button onClick={onClose}><X size={24} className="text-secondary-silver hover:text-red-500"/></button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
           {/* --- ส่วนตั้งค่าผู้ส่ง (Sender Config) --- */}
           <div className="bg-secondary-cream/30 p-4 rounded-xl border border-secondary-silver/50 space-y-4">
               <h4 className="text-sm font-bold text-primary-navy border-b border-secondary-silver/30 pb-2 mb-2">ข้อมูลผู้ส่ง (Sender Info)</h4>
               <div>
                  <label className="block text-xs font-bold text-neutral-medium mb-1">ชื่อผู้ส่งที่แสดง (Display Name)</label>
                  <input 
                    type="text" 
                    value={formData.sender_name} 
                    onChange={e => setFormData({...formData, sender_name: e.target.value})}
                    className="w-full border border-secondary-silver rounded-lg p-2 text-sm focus:border-primary-gold outline-none"
                    placeholder="เช่น HR Department"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-neutral-medium mb-1">อีเมลสำหรับตอบกลับ (Reply-To Email)</label>
                  <input 
                    type="email" 
                    value={formData.sender_email} 
                    onChange={e => setFormData({...formData, sender_email: e.target.value})}
                    className="w-full border border-secondary-silver rounded-lg p-2 text-sm focus:border-primary-gold outline-none"
                    placeholder="hr-admin@company.com"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">*อีเมลผู้ส่งจริงจะเป็นบัญชี Google ที่รัน Script แตชื่อที่แสดงจะเป็นตามที่กำหนด</p>
               </div>
           </div>

           {/* --- ส่วนตั้งค่าผู้รับ (Receiver Config) --- */}
           <div className="space-y-4">
               <h4 className="text-sm font-bold text-primary-navy border-b border-secondary-silver/30 pb-2 mb-2">อีเมลผู้รับแจ้งเตือน (Notifications)</h4>
               <div>
                  <label className="block text-sm font-bold text-primary-navy mb-2 flex items-center gap-2">
                    <Mail size={16}/> อีเมลฝ่ายบุคคล (HR Email)
                  </label>
                  <input 
                    type="email" 
                    value={formData.email_hr} 
                    onChange={e => setFormData({...formData, email_hr: e.target.value})}
                    className="w-full border-2 border-secondary-silver/50 rounded-xl p-3 focus:border-primary-gold outline-none"
                    placeholder="hr@example.com"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-primary-navy mb-2 flex items-center gap-2">
                    <Mail size={16}/> อีเมลผู้อนุมัติ/CEO (Approver Email)
                  </label>
                  <input 
                    type="email" 
                    value={formData.email_approver} 
                    onChange={e => setFormData({...formData, email_approver: e.target.value})}
                    className="w-full border-2 border-secondary-silver/50 rounded-xl p-3 focus:border-primary-gold outline-none"
                    placeholder="ceo@example.com"
                  />
               </div>
           </div>
        </div>

        <div className="p-5 border-t border-secondary-silver bg-gray-50 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg">ยกเลิก</button>
           <button onClick={handleSave} className="px-6 py-2 bg-primary-navy text-white font-bold rounded-lg hover:bg-accent-royalblue shadow-lg">บันทึก</button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Functions ---
const bahtText = (num) => {
    if (!num) return "";
    num = parseFloat(num.toString().replace(/[,]/g, "")); 
    if (isNaN(num)) return "";
    const suffix = "บาทถ้วน";
    const textNum = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const textPlace = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
    let sNumber = num.toFixed(0);
    let sText = "";
    let len = sNumber.length;
    if (len > 7) return num + " " + suffix; 
    for (let i = 0; i < len; i++) {
        let n = parseInt(sNumber.charAt(i));
        if (n !== 0) {
            if (i === (len - 1) && n === 1 && len !== 1) sText += "เอ็ด";
            else if (i === (len - 2) && n === 2) sText += "ยี่";
            else if (i === (len - 2) && n === 1) sText += "";
            else sText += textNum[n];
            sText += textPlace[len - i - 1];
        }
    }
    return sText + suffix;
};

const convertToInputDate = (str) => {
    if (!str) return "";
    const parts = str.split('/');
    if (parts.length === 3) {
        let d = parts[0].padStart(2, '0');
        let m = parts[1].padStart(2, '0');
        let y = parseInt(parts[2]);
        if (y > 2400) y -= 543;
        return `${y}-${m}-${d}`;
    }
    return str;
};

const parseDateToThaiObj = (isoDateStr) => {
    if (!isoDateStr) return { d: '', m: '', y: '' };
    try {
        const d = new Date(isoDateStr);
        if (isNaN(d.getTime())) return { d: '', m: '', y: '' };
        return { d: d.getDate(), m: THAI_MONTHS[d.getMonth()], y: d.getFullYear() + 543 };
    } catch (e) { return { d: '', m: '', y: '' }; }
};

// --- Map Component ---
const LeafletMap = ({ id, lat, lng, onSelect, readonly, label }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        if (!document.getElementById('leaflet-js')) {
            const script = document.createElement('script');
            script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = initMap;
            document.body.appendChild(script);
        } else {
            if (window.L) initMap(); else setTimeout(initMap, 500); 
        }
        return () => {
            if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; markerRef.current = null; }
        };
    }, []);

    useEffect(() => {
        if(mapInstanceRef.current && lat && lng) {
            const newLatLng = [parseFloat(lat), parseFloat(lng)];
            if(markerRef.current) markerRef.current.setLatLng(newLatLng);
            else addMarker(newLatLng[0], newLatLng[1]);
            mapInstanceRef.current.setView(newLatLng, 13);
        }
    }, [lat, lng]);

    const addMarker = (mLat, mLng) => {
        if (!mapInstanceRef.current) return;
        if (markerRef.current) markerRef.current.remove();
        const marker = window.L.marker([mLat, mLng], { draggable: !readonly }).addTo(mapInstanceRef.current);
        markerRef.current = marker;
        marker.on('dragend', function (e) { const position = marker.getLatLng(); onSelect(position.lat, position.lng); });
    };

    const initMap = () => {
        if (!window.L || mapInstanceRef.current || !mapContainerRef.current) return;
        const initialLat = lat || 16.4322; 
        const initialLng = lng || 102.8236;
        const map = window.L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        mapInstanceRef.current = map;
        if (lat && lng) addMarker(lat, lng);
        if (!readonly) {
            map.on('click', (e) => { const { lat, lng } = e.latlng; addMarker(lat, lng); onSelect(lat, lng); });
        }
        setTimeout(() => { map.invalidateSize(); }, 200);
    };

    const handleSearch = async () => {
        if(!search) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
            const data = await res.json();
            if(data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);
                if(mapInstanceRef.current) {
                    mapInstanceRef.current.setView([newLat, newLng], 15);
                    if(!readonly) { addMarker(newLat, newLng); onSelect(newLat, newLng); }
                }
            } else alert("ไม่พบสถานที่");
        } catch(e) { console.error(e); }
    };

    return (
        <div className="w-full border border-gray-300 rounded overflow-hidden">
            <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
                <span className="font-bold text-xs text-gray-600">{label} {readonly && "(View Only)"}</span>
                {!readonly && (
                    <div className="flex gap-2">
                        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="ค้นหาสถานที่..." className="px-2 py-1 text-xs border rounded w-40" />
                        <button onClick={handleSearch} className="px-2 py-1 bg-blue-600 text-white rounded text-xs"><Search size={12}/></button>
                    </div>
                )}
            </div>
            <div ref={mapContainerRef} style={{ height: '250px', width: '100%' }} className="z-0"></div>
            <div className="bg-gray-50 p-1 text-[10px] text-gray-400 text-center">
                {lat && lng ? `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}` : "ยังไม่ได้ระบุพิกัด (คลิก/ลากหมุด)"}
            </div>
        </div>
    );
};

// --- Step Tracker Component ---
const StepTracker = ({ currentStep, status }) => {
    const steps = [
        { num: 1, label: "พยาน 2", desc: "ตรวจสอบ/ลงนาม" },
        { num: 2, label: "พยาน 1", desc: "ตรวจสอบ/ลงนาม" },
        { num: 3, label: "ผู้บริหาร", desc: "อนุมัติ" },
        { num: 4, label: "พนักงาน", desc: "ลงนาม/แผนที่" }
    ];
    const isComplete = status === 'Complete';

    return (
        <div className="w-full py-6 no-print">
            <div className="flex justify-between items-center relative px-8">
                <div className="absolute left-8 right-8 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 -z-0"></div>
                <div className="absolute left-8 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-0" 
                     style={{ width: isComplete ? 'calc(100% - 4rem)' : `${((currentStep - 1) / 3) * 100}%` }}></div>

                {steps.map((s) => {
                    const active = isComplete || currentStep > s.num || (currentStep === s.num);
                    const isCurrent = !isComplete && currentStep === s.num;
                    
                    return (
                        <div key={s.num} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-300 
                                ${active ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}
                                ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}
                            `}>
                                {isComplete || currentStep > s.num ? <CheckCircle size={20}/> : s.num}
                            </div>
                            <div className={`mt-2 text-xs font-bold ${active ? 'text-primary-navy' : 'text-gray-400'}`}>{s.label}</div>
                            {isCurrent && <div className="absolute -bottom-6 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full whitespace-nowrap animate-pulse">รอการดำเนินการ</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Settings Page Component ---
const SettingsPage = ({ onBack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState({
        sender_name: "HR System",
        sender_email: "",
        signer1_name: "", signer1_email: "",
        signer3_name: "", signer3_email: "",
        signer4_name: "", signer4_email: ""
    });

    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_URL}?system=contract&action=getSettings`)
            .then(r => r.json())
            .then(data => {
               if(data && !data.error) setConfig(prev => ({...prev, ...data}));
            })
            .catch(e => console.log("Default settings not found"))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    system: 'contract',
                    action: 'saveSettings',
                    config: config 
                })
            });
            alert("บันทึกการตั้งค่าเรียบร้อย");
            onBack();
        } catch(e) { 
            alert("Error saving settings"); 
        } finally { 
            // 5. ตั้งค่า isLoading เป็น false เมื่อบันทึกเสร็จสิ้น
            setIsLoading(false); 
        }
    };

    return (
        <div className="animate-fade-in-up">
            {isLoading && <LoadingOverlay message="กำลังดึง/บันทึกการตั้งค่า..." />}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft/></button>
                <h1 className="text-2xl font-bold text-primary-navy">ตั้งค่าระบบ (Settings)</h1>
            </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl border border-gray-200">
                    <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-lg text-primary-navy mb-4 flex items-center gap-2">
                        <Mail size={20}/> ข้อมูลผู้ส่งอีเมล (Sender Info)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="ชื่อผู้ส่งที่แสดง (Display Name)" 
                            val={config.sender_name} 
                            onChange={e=>setConfig({...config, sender_name:e.target.value})} 
                            placeholder="เช่น HR Department"
                        />
                        <Input 
                            label="อีเมลสำหรับตอบกลับ (Reply-To)" 
                            val={config.sender_email} 
                            onChange={e=>setConfig({...config, sender_email:e.target.value})} 
                            placeholder="hr@company.com"
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                        * หมายเหตุ: อีเมลขาออกจริงจะเป็นบัญชี Google ที่รัน Script แต่ผู้รับจะเห็นชื่อผู้ส่งตามที่ระบุในช่องนี้
                    </p>
                </div>
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Mail size={20}/> กำหนดอีเมลผู้รับรองเริ่มต้น</h3>
                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl border">
                        <h4 className="font-bold text-gray-700 mb-2">ผู้บริหาร / HR Manager (Step 3)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="ชื่อ-นามสกุล" val={config.signer1_name} onChange={e=>setConfig({...config, signer1_name:e.target.value})} />
                            <Input label="Email" val={config.signer1_email} onChange={e=>setConfig({...config, signer1_email:e.target.value})} />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border">
                        <h4 className="font-bold text-gray-700 mb-2">พยานคนที่ 1 (Step 2)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="ชื่อ-นามสกุล" val={config.signer3_name} onChange={e=>setConfig({...config, signer3_name:e.target.value})} />
                            <Input label="Email" val={config.signer3_email} onChange={e=>setConfig({...config, signer3_email:e.target.value})} />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border">
                        <h4 className="font-bold text-gray-700 mb-2">พยานคนที่ 2 (Step 1)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="ชื่อ-นามสกุล" val={config.signer4_name} onChange={e=>setConfig({...config, signer4_name:e.target.value})} />
                            <Input label="Email" val={config.signer4_email} onChange={e=>setConfig({...config, signer4_email:e.target.value})} />
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-right">
                    <button 
                        onClick={handleSave} 
                        // 7. ป้องกันการกดซ้ำขณะกำลังโหลด และแสดงสถานะบนปุ่ม
                        disabled={isLoading}
                        className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ml-auto 
                           ${isLoading 
                               ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                               : 'bg-primary-navy text-white hover:bg-blue-900'}`}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                        {isLoading ? " กำลังบันทึก..." : " บันทึกการตั้งค่า"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CREATE FORM ---
const CreateContract = ({ onCancel, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    empId: '', name: '', surname: '', position: '', salary: '20000', 
    department: '', sub_dept: '', project: '', contractType: 'contract_page_1', company: COMPANIES[0], workSet: 'D',
    witness1_name: 'พยานคนที่ 1', witness1_email: '', witness2_name: 'พยานคนที่ 2', witness2_email: '',
    signer1_name: 'ดร.กฤษณา สุขบุญญสถิตย์', signer1_email: '', 
    startDate: '', probationDate: '', comment: '',
    email: '',
    age: '', personalId: '', issueDate: '', addressFull: '',
    houseNo: '', moo: '', soi: '', road: '', subdistrict: '', district: '', province: '',
    phoneHome: '', phoneMobile: '', nearHome: '',
    contactName: '', contactSurname: '', contactPhone: '', contactRel: ''
  });
  
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => { 
    // Load Employees
    fetch(`${API_URL}?system=contract&action=getEmployees`)
        .then(r => r.json())
        .then(data => {
            if (Array.isArray(data)) setEmployees(data);
        })
        .catch(e => console.error("Error loading employees:", e));

    // Load Settings
    fetch(`${API_URL}?system=contract&action=getSettings`)
            .then(r => r.json())
            .then(settings => {
                if(settings && !settings.error) {
                    setForm(prev => ({
                        ...prev,
                        signer1_name: settings.signer1_name || prev.signer1_name,
                        signer1_email: settings.signer1_email || prev.signer1_email,
                        witness1_name: settings.signer3_name || prev.witness1_name, 
                        witness1_email: settings.signer3_email || prev.witness1_email,
                        witness2_name: settings.signer4_name || prev.witness2_name,
                        witness2_email: settings.signer4_email || prev.witness2_email
                    }));
                }
            })
            .catch(e => console.error("Error loading settings:", e));
    }, []);

  const handleSearch = (e) => {
      setSearch(e.target.value);
      setForm({...form, name: e.target.value});
      setShowDropdown(true);
  };

  const selectEmp = (emp) => {
      const isoStart = convertToInputDate(emp.startDate); 
      const isoProbation = convertToInputDate(emp.probationDate);
      
      setForm(prev => ({
          ...prev,
          empId: emp.empId || "", 
          name: emp.name || "", 
          surname: emp.surname || "", 
          position: emp.position || "", 
          department: emp.department || "", 
          sub_dept: emp.sub_dept || "", 
          project: emp.project || "",
          salary: prev.salary, 
          email: emp.email || "",
          age: emp.age || "",
          personalId: emp.personalId || "",
          issueDate: emp.issueDate || "",
          addressFull: emp.addressFull || "",
          houseNo: emp.houseNo || "",
          moo: emp.moo || "",
          soi: emp.soi || "",
          road: emp.road || "",
          subdistrict: emp.subdistrict || "",
          district: emp.district || "",
          province: emp.province || "",
          phoneHome: emp.phoneHome || "",
          phoneMobile: emp.phoneMobile || "",
          nearHome: emp.nearHome || "",
          contactName: emp.contactName || "",
          contactSurname: emp.contactSurname || "",
          contactPhone: emp.contactPhone || "",
          contactRel: emp.contactRel || "",
          startDate: isoStart, 
          probationDate: isoProbation
      }));
      setSearch(emp.name);
      setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const now = new Date();
    const thaiYear = now.getFullYear() + 543;
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${thaiYear}`;
    const startObj = parseDateToThaiObj(form.startDate);
    const probObj = parseDateToThaiObj(form.probationDate);

    const companyPrefixes = {
        "บริษัท คาร์เปท เมกเกอร์ (ประเทศไทย) จำกัด": "CMT",
        "บริษัท คาร์เปท เมกเกอร์ พี2ดับบลิว (ประเทศไทย) จำกัด": "P2W",
        "บริษัท ไอเค รีเสิร์จ จำกัด": "IKR",
        "บริษัท อินเตอร์ ไกร จำกัด": "IKK"
    };
    const prefix = companyPrefixes[form.company] || "CMT";

    const contractData = {
      Fields: {
        empId: form.empId, 
        "DD/MM/YYYY": dateStr, 
        Name: form.name, 
        Surname: form.surname, 
        Position: form.position,
        Salary: parseInt(form.salary).toLocaleString(), 
        Thai_salary: bahtText(form.salary),
        Department: form.department, 
        Subdepartment: form.sub_dept, 
        project: form.project,
        Address: form.addressFull, 
        Age: form.age, 
        PersonalID: form.personalId, 
        PersonalID_validdate: form.issueDate,
        ContractNO: `${prefix}/${form.empId}`,
        Day_st: startObj.d || now.getDate(), Month_st: startObj.m || THAI_MONTHS[now.getMonth()], Year_st: startObj.y || (now.getFullYear()+543),
        Day_en: probObj.d || "", Month_en: probObj.m || "", Year_en: probObj.y || "",
        Comment: form.comment,
        House_id: form.houseNo, Moo: form.moo, Street: form.soi, Road: form.road,
        Subdistrict: form.subdistrict, District: form.district, Province: form.province,
        Hounse_phone_number: form.phoneHome, Mobile_phone_number: form.phoneMobile,
        Place_near_home: form.nearHome,
        Person_contact_name: form.contactName, Person_contact_surname: form.contactSurname,
        Person_contact_phone: form.contactPhone, Person_contact_relationship: form.contactRel
      },
      SelectedWorkSet: form.workSet,
      SignatureNames: { Name1: form.signer1_name, Name2: `${form.name} ${form.surname}`, Name3: form.witness1_name, Name4: form.witness2_name },
      SignatureImages: {}
    };

    const payload = {
      system: 'contract',
      action: 'createContract',
      contract_type: form.contractType, company_name: form.company, status: 'Pending Signer 1', current_step: 1, data: contractData,
      signer1_name: form.signer1_name, signer1_email: form.signer1_email,
      signer2_name: `${form.name} ${form.surname}`, signer2_email: form.email || "carpetmaker05@gmail.com", 
      signer3_name: form.witness1_name, signer3_email: form.witness1_email,
      signer4_name: form.witness2_name, signer4_email: form.witness2_email,
      sig1: null, sig2: null, sig3: null, sig4: null
    };

    try {
      await fetch(API_URL, { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      });
      onSuccess();
    } catch (err) { 
        alert("Error connecting to server"); 
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredEmp = employees.filter(e => {
      const fullName = (e.name || "") + (e.surname || "");
      return fullName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-secondary-silver/30 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
            <h2 className="text-3xl font-extrabold text-primary-navy flex items-center gap-3">
                <div className="bg-primary-navy p-2 rounded-xl text-white"><FileText size={24}/></div>
                สร้างสัญญาใหม่
            </h2>
            <p className="text-gray-500 mt-1 ml-14">กรอกข้อมูลเพื่อสร้างเอกสารสัญญา</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400"/></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-lg text-primary-navy mb-4 flex items-center gap-2"><Settings size={18}/> ข้อมูลทั่วไป</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">บริษัท</label><select name="company" value={form.company} onChange={e=>setForm({...form, company: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-gold outline-none transition-all">{COMPANIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">ประเภทสัญญา</label><select name="contractType" value={form.contractType} onChange={e=>setForm({...form, contractType: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-gold outline-none transition-all">{Object.entries(CONTRACT_TYPES).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg text-primary-navy mb-4 flex items-center gap-2"><Users size={18}/> ข้อมูลพนักงาน (Employee)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ค้นหาชื่อพนักงาน</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                        <input value={search} onChange={handleSearch} onFocus={()=>setShowDropdown(true)} onBlur={()=>setTimeout(()=>setShowDropdown(false),200)} className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-gold outline-none" required placeholder="พิมพ์ชื่อเพื่อค้นหา..." />
                    </div>
                    {showDropdown && filteredEmp.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border shadow-xl max-h-60 overflow-auto rounded-xl mt-2 p-2">
                            {filteredEmp.map(e => <div key={e.empId} onClick={()=>selectEmp(e)} className="p-3 hover:bg-blue-50 cursor-pointer text-sm rounded-lg flex justify-between items-center group"><span className="font-bold text-gray-700">{e.name} {e.surname}</span> <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-white">{e.position}</span></div>)}
                        </div>
                    )}
                </div>
                <Input label="ชื่อ" name="name" val={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
                <Input label="นามสกุล" name="surname" val={form.surname} onChange={e=>setForm({...form, surname:e.target.value})} required />
                <Input label="รหัสพนักงาน" name="empId" val={form.empId} onChange={e=>setForm({...form, empId:e.target.value})} required />
                <Input label="ตำแหน่ง" name="position" val={form.position} onChange={e=>setForm({...form, position:e.target.value})} required />
                <Input label="อีเมลพนักงาน" name="email" val={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
                <Input label="แผนก" name="department" val={form.department} onChange={e=>setForm({...form, department:e.target.value})} />
                <Input label="ฝ่าย (Sub-dept)" name="sub_dept" val={form.sub_dept} onChange={e=>setForm({...form, sub_dept:e.target.value})} />
                <Input label="เงินเดือน (บาท)" name="salary" type="number" val={form.salary} onChange={e=>setForm({...form, salary:e.target.value})} required />
                <Input label="หมายเหตุ (Comment)" name="comment" val={form.comment} onChange={e=>setForm({...form, comment:e.target.value})} placeholder="ระบุเงื่อนไขเพิ่มเติม (ถ้ามี)" />
                <h4 className="col-span-2 font-bold text-gray-600 border-b pb-2 mt-4">ข้อมูลส่วนตัวและที่อยู่</h4>
                <Input label="อายุ (ปี)" name="age" val={form.age} onChange={e=>setForm({...form, age:e.target.value})} />
                <Input label="เลขบัตรประชาชน" name="personalId" val={form.personalId} onChange={e=>setForm({...form, personalId:e.target.value})} />
                <Input label="วันที่ออกบัตร" name="issueDate" val={form.issueDate} onChange={e=>setForm({...form, issueDate:e.target.value})} />
                <div className="col-span-2"><Input label="ที่อยู่ตามทะเบียนบ้าน (เต็ม)" name="addressFull" val={form.addressFull} onChange={e=>setForm({...form, addressFull:e.target.value})} /></div>
                <div className="col-span-2 grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                   <Input label="บ้านเลขที่" name="houseNo" val={form.houseNo} onChange={e=>setForm({...form, houseNo:e.target.value})} />
                   <Input label="หมู่ที่" name="moo" val={form.moo} onChange={e=>setForm({...form, moo:e.target.value})} />
                   <Input label="ตรอก/ซอย" name="soi" val={form.soi} onChange={e=>setForm({...form, soi:e.target.value})} />
                   <Input label="ถนน" name="road" val={form.road} onChange={e=>setForm({...form, road:e.target.value})} />
                   <Input label="ตำบล/แขวง" name="subdistrict" val={form.subdistrict} onChange={e=>setForm({...form, subdistrict:e.target.value})} />
                   <Input label="อำเภอ/เขต" name="district" val={form.district} onChange={e=>setForm({...form, district:e.target.value})} />
                   <Input label="จังหวัด" name="province" val={form.province} onChange={e=>setForm({...form, province:e.target.value})} />
                </div>
                <Input label="เบอร์โทรบ้าน" name="phoneHome" val={form.phoneHome} onChange={e=>setForm({...form, phoneHome:e.target.value})} />
                <Input label="เบอร์มือถือ" name="phoneMobile" val={form.phoneMobile} onChange={e=>setForm({...form, phoneMobile:e.target.value})} />
                <div className="col-span-2"><Input label="สถานที่ใกล้เคียง" name="nearHome" val={form.nearHome} onChange={e=>setForm({...form, nearHome:e.target.value})} /></div>
                <h4 className="col-span-2 font-bold text-gray-600 border-b pb-2 mt-4">บุคคลติดต่อฉุกเฉิน</h4>
                <Input label="ชื่อผู้ติดต่อ" name="contactName" val={form.contactName} onChange={e=>setForm({...form, contactName:e.target.value})} />
                <Input label="นามสกุล" name="contactSurname" val={form.contactSurname} onChange={e=>setForm({...form, contactSurname:e.target.value})} />
                <Input label="เบอร์ผู้ติดต่อ" name="contactPhone" val={form.contactPhone} onChange={e=>setForm({...form, contactPhone:e.target.value})} />
                <Input label="ความสัมพันธ์" name="contactRel" val={form.contactRel} onChange={e=>setForm({...form, contactRel:e.target.value})} />
                <div className={`col-span-2 grid gap-4 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 mt-4 ${form.contractType === 'probation_contract_page' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <Input label="วันเริ่มงาน (วว/ดด/ปปปป)" name="startDate" type="text" placeholder="วว/ดด/ปปปป" val={form.startDate} onChange={e=>setForm({...form, startDate:e.target.value})} />
                    {form.contractType === 'probation_contract_page' && (
                        <Input label="วันครบกำหนดทดลองงาน (วว/ดด/ปปปป)" name="probationDate" type="text" placeholder="วว/ดด/ปปปป" val={form.probationDate} onChange={e=>setForm({...form, probationDate:e.target.value})} />
                    )}
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">กะเวลาทำงาน</label>
                        <select name="workSet" value={form.workSet} onChange={e=>setForm({...form, workSet:e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-gold outline-none">
                            {Object.entries(WORK_SET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg text-primary-navy mb-4 flex items-center gap-2"><PenTool size={18}/> กำหนดผู้รับรอง (Signers)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="พยาน 2 (Step 1)" name="witness2_name" val={form.witness2_name} onChange={e=>setForm({...form, witness2_name:e.target.value})} />
                <Input label="Email พยาน 2" name="witness2_email" val={form.witness2_email} onChange={e=>setForm({...form, witness2_email:e.target.value})} />
                <Input label="พยาน 1 (Step 2)" name="witness1_name" val={form.witness1_name} onChange={e=>setForm({...form, witness1_name:e.target.value})} />
                <Input label="Email พยาน 1" name="witness1_email" val={form.witness1_email} onChange={e=>setForm({...form, witness1_email:e.target.value})} />
                <Input label="ผู้บริหาร (Step 3)" name="signer1_name" val={form.signer1_name} onChange={e=>setForm({...form, signer1_name:e.target.value})} />
                <Input label="Email ผู้บริหาร" name="signer1_email" val={form.signer1_email} onChange={e=>setForm({...form, signer1_email:e.target.value})} />
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
           <button type="button" onClick={onCancel} className="px-8 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">ยกเลิก</button>
           <button type="submit" className="px-8 py-3 bg-primary-navy text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18}/>} 
                {isSubmitting ? " กำลังบันทึก..." : " บันทึกและส่งเมล"}
           </button>
        </div>
        {isSubmitting && <LoadingOverlay message="กำลังสร้างสัญญาและส่งอีเมล..." />}
      </form>
    </div>
  );
};

// --- EmployeeManager ---
const EmployeeManager = ({ onBack }) => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [showImport, setShowImport] = useState(false);
    const [sheetId, setSheetId] = useState("");
    const [sheetName, setSheetName] = useState("");
    const [sheetData, setSheetData] = useState([]); 
    const [sheetHeaders, setSheetHeaders] = useState([]); 
    const [step, setStep] = useState(1); 
    const [showRawPreview, setShowRawPreview] = useState(false);
    const [loading, setLoading] = useState(false); // Used for import process
    const [isLoading, setIsLoading] = useState(false); // Used for general fetching
    const [mapping, setMapping] = useState({});

    const FIELD_GROUPS = [
        { title: "ข้อมูลงาน (Work Info)", fields: [{ k: 'empId', label: 'รหัสพนักงาน *' }, { k: 'name', label: 'ชื่อจริง *' }, { k: 'surname', label: 'นามสกุล' }, { k: 'position', label: 'ตำแหน่ง' }, { k: 'department', label: 'แผนก' }, { k: 'sub_dept', label: 'ฝ่าย (Sub-Dept)' }, { k: 'project', label: 'โครงการ (Project)' }, { k: 'salary', label: 'เงินเดือน' }, { k: 'workSet', label: 'กะงาน (A, B, C, D)' }, { k: 'startDate', label: 'วันเริ่มงาน (วว/ดด/ปปปป)' }, { k: 'probationDate', label: 'วันผ่านโปร (วว/ดด/ปปปป)' }] },
        { title: "ข้อมูลส่วนตัว (Personal)", fields: [{ k: 'age', label: 'อายุ' }, { k: 'personalId', label: 'เลขบัตรประชาชน' }, { k: 'issueDate', label: 'วันที่ออกบัตร' }, { k: 'phoneMobile', label: 'เบอร์มือถือ' }, { k: 'phoneHome', label: 'เบอร์บ้าน' }, { k: 'email', label: 'อีเมลพนักงาน *' }] },
        { title: "ที่อยู่ (Address)", fields: [{ k: 'addressFull', label: 'ที่อยู่ตามทะเบียนบ้าน (เต็ม)' }, { k: 'houseNo', label: 'บ้านเลขที่' }, { k: 'moo', label: 'หมู่' }, { k: 'soi', label: 'ซอย' }, { k: 'road', label: 'ถนน' }, { k: 'subdistrict', label: 'ตำบล/แขวง' }, { k: 'district', label: 'อำเภอ/เขต' }, { k: 'province', label: 'จังหวัด' }, { k: 'nearHome', label: 'สถานที่ใกล้เคียง' }] },
        { title: "ผู้ติดต่อฉุกเฉิน (Emergency Contact)", fields: [{ k: 'contactName', label: 'ชื่อผู้ติดต่อ' }, { k: 'contactSurname', label: 'นามสกุลผู้ติดต่อ' }, { k: 'contactPhone', label: 'เบอร์โทรผู้ติดต่อ' }, { k: 'contactRel', label: 'ความสัมพันธ์' }] }
    ];

    useEffect(() => { fetchEmp(); }, []);
    
    const fetchEmp = async () => { 
        setIsLoading(true);
        try { 
            const res = await fetch(`${API_URL}?system=contract&action=getEmployees`); 
            if(res.ok) setEmployees(await res.json()); 
        } catch(e){} 
        finally { setIsLoading(false); }
    };

    const handleDelete = async (id) => {
        if(!confirm(`ลบพนักงาน ID: ${id}?`)) return;
        setIsLoading(true);
        try {
            await fetch(API_URL, { 
                method: 'POST',
                body: JSON.stringify({ 
                    system: 'contract',
                    action: 'deleteEmployee', 
                    id: id })
            });
            await fetchEmp();
        } finally { setIsLoading(false); }
    };

    const handleBulkDelete = async () => {
        if(selectedIds.length === 0) return;
        if(!confirm(`ยืนยันการลบ ${selectedIds.length} รายการที่เลือก?`)) return;
        setIsLoading(true);
        
        try {
            for (const id of selectedIds) {
                await fetch(API_URL, { 
                    method: 'POST',
                    body: JSON.stringify({ 
                        system: 'contract',
                        action: 'deleteEmployee',
                        id: id })
                });
            }
            setSelectedIds([]); await fetchEmp();
        } finally { setIsLoading(false); }
    };

    const handleFetchSheet = async () => {
        if(!sheetId) return alert("กรุณาใส่ Google Sheet ID");
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    system: 'contract',
                    action: 'fetchSheet',
                    sheetId, 
                    sheetName })
            });
            if(!res.ok) throw new Error("ไม่สามารถดึงข้อมูลได้");
            const csvText = await res.text();
            const { headers, data } = csvToJSON(csvText);
            if(data.length === 0) throw new Error("ไม่พบข้อมูล");
            
            localStorage.setItem('cmt_last_sheet_id', sheetId);
            localStorage.setItem('cmt_last_sheet_name', sheetName);
            setSheetHeaders(headers); setSheetData(data); setStep(2); 
            
            const savedMapping = JSON.parse(localStorage.getItem('cmt_last_mapping') || '{}');
            const newMap = { ...savedMapping };
            const allKeys = FIELD_GROUPS.flatMap(g => g.fields.map(f => f.k));
            allKeys.forEach(key => {
                if (!newMap[key]) {
                    const match = headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g,'') === key.toLowerCase() || h.includes(key));
                    if(match) newMap[key] = match;
                }
            });
            setMapping(newMap);
        } catch(e) { alert(e.message); } finally { setLoading(false); }
    };

    const handleImportSubmit = async () => {
        if(!mapping.empId || !mapping.name || !mapping.email) return alert("กรุณาจับคู่ 'รหัสพนักงาน', 'ชื่อจริง' และ 'อีเมลพนักงาน' ให้ครบถ้วน");
        localStorage.setItem('cmt_last_mapping', JSON.stringify(mapping));
        setLoading(true);
        try {
            let count = 0;
            for(const row of sheetData) {
                const newEmp = {};
                FIELD_GROUPS.forEach(group => {
                    group.fields.forEach(field => {
                        const headerName = mapping[field.k];
                        let val = headerName ? row[headerName] : "";
                        if(field.k === 'salary' && val) val = val.replace(/,/g, '');
                        newEmp[field.k] = val ? val.trim() : "";
                    });
                });
                if(newEmp.empId && newEmp.name && newEmp.email) {
                    await fetch(API_URL, {
                        method: 'POST',
                        body: JSON.stringify({
                            system: 'contract',
                            action: 'saveEmployee',
                            newEmp: newEmp })
                    });
                    count++;
                }
            }
            alert(`นำเข้าข้อมูลสำเร็จ ${count} รายการ`);
            setShowImport(false); setSheetData([]); setStep(1); 
            await fetchEmp();
        } catch(e) { alert("Error: " + e.message); } finally { setLoading(false); }
    };

    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    const toggleSelectAll = (filtered) => setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(e => e.empId));
    const filtered = employees.filter(e => (e.name+e.surname+e.empId).toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="animate-fade-in-up relative">
            {isLoading && <LoadingOverlay message="กำลังโหลดข้อมูลพนักงาน..." />}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={24} className="text-gray-600"/></button>
                    <div><h1 className="text-2xl font-extrabold text-primary-navy">จัดการข้อมูลพนักงาน</h1><p className="text-gray-500 text-sm">Employee Data Management</p></div>
                </div>
                <div className="flex gap-3">
                    {selectedIds.length > 0 && <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl font-bold"><Trash2 size={18}/> ลบที่เลือก ({selectedIds.length})</button>}
                    <button onClick={()=>{ setShowImport(true); setStep(1); }} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold"><DownloadCloud size={18}/> Import Google Sheet</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-white flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                        <input value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary-gold outline-none" placeholder="ค้นหาชื่อ หรือ รหัสพนักงาน..."/>
                    </div>
                    <div className="text-sm text-gray-500 font-bold ml-auto">{filtered.length} Employees</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary-navy text-white text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-10 text-center"><input type="checkbox" onChange={()=>toggleSelectAll(filtered)} checked={filtered.length > 0 && selectedIds.length === filtered.length} className="w-4 h-4 rounded cursor-pointer accent-primary-gold"/></th>
                                <th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Position</th><th className="p-4">Department / Sub-Dept</th><th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? <tr><td colSpan="6" className="p-10 text-center text-gray-400">ไม่พบข้อมูลพนักงาน</td></tr> : filtered.map(e => (
                                <tr key={e.empId} className={`hover:bg-yellow-50/30 transition-colors ${selectedIds.includes(e.empId) ? "bg-blue-50/50" : ""}`}>
                                    <td className="p-4 text-center"><input type="checkbox" checked={selectedIds.includes(e.empId)} onChange={()=>toggleSelect(e.empId)} className="w-4 h-4 rounded cursor-pointer accent-primary-navy"/></td>
                                    <td className="p-4"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-600">{e.empId}</span></td>
                                    <td className="p-4 font-bold text-gray-800">{e.name} {e.surname}</td>
                                    <td className="p-4 text-sm text-gray-600"><span className="bg-gray-50 px-2 py-1 rounded">{e.position}</span></td>
                                    <td className="p-4 text-sm text-gray-500">{e.department} {e.subDept ? `/ ${e.subDept}` : ''}</td>
                                    <td className="p-4 text-right"><button onClick={()=>handleDelete(e.empId)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={18}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* IMPORT MODAL */}
            {showImport && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    {loading && <LoadingOverlay message="กำลังเชื่อมต่อ Google Sheet..." />}
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-primary-navy flex items-center gap-2"><span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{step}</span>นำเข้าข้อมูล Google Sheet</h3>
                            <button onClick={()=>!loading && setShowImport(false)} disabled={loading} className={`${loading ? 'opacity-30' : ''}`}><X size={20}/></button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
                            {step === 1 && (
                                <div className="space-y-4 max-w-lg mx-auto py-10">
                                    <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><b>วิธีใช้งาน:</b><ol className="list-decimal ml-5 mt-2 space-y-1"><li>เปิด Google Sheet</li><li>Share {'>'} Anyone with the link</li><li>คัดลอก ID จาก URL</li></ol></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-1">Sheet ID</label><input disabled={loading} value={sheetId} onChange={e=>setSheetId(e.target.value)} className="w-full p-3 border rounded-xl text-sm font-mono"/></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-1">Sheet Name</label><input disabled={loading} value={sheetName} onChange={e=>setSheetName(e.target.value)} className="w-full p-3 border rounded-xl text-sm"/></div>
                                </div>
                            )}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="bg-gray-100 p-3 flex justify-between cursor-pointer" onClick={() => setShowRawPreview(!showRawPreview)}>
                                            <div className="flex items-center gap-2"><Eye size={16}/><span className="font-bold text-sm">ตัวอย่างข้อมูลดิบ</span><span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{sheetData.length} Records</span></div><ChevronRight size={16}/>
                                        </div>
                                        {showRawPreview && <div className="overflow-x-auto p-4 border-t border-gray-200 max-h-60 bg-white"><table className="w-full text-xs text-left border-collapse"><thead><tr className="bg-gray-50">{sheetHeaders.map((h, i) => <th key={i} className="p-2 border">{h}</th>)}</tr></thead><tbody>{sheetData.slice(0, 5).map((row, i) => <tr key={i}>{sheetHeaders.map((h, j) => <td key={j} className="p-2 border">{row[h] || "-"}</td>)}</tr>)}</tbody></table></div>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{FIELD_GROUPS.map((group, idx) => (<div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><h4 className="font-bold text-primary-navy border-b pb-2 mb-3 text-sm">{group.title}</h4><div className="space-y-3">{group.fields.map(f => (<div key={f.k} className="grid grid-cols-3 items-center gap-2"><label className="text-xs text-gray-500 col-span-1 text-right pr-2">{f.label}</label><div className="col-span-2"><select disabled={loading} value={mapping[f.k] || ""} onChange={e=>setMapping({...mapping, [f.k]: e.target.value})} className={`w-full p-1.5 border rounded text-xs ${mapping[f.k]?'bg-green-50 border-green-300':'bg-gray-50'}`}><option value="">(ไม่ระบุ)</option>{sheetHeaders.map((h,i) => <option key={i} value={h}>{h}</option>)}</select></div></div>))}</div></div>))}</div>
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 z-10">
                            {step === 2 && <button onClick={()=>setStep(1)} disabled={loading} className="px-5 py-2.5 text-gray-500 hover:bg-gray-200 rounded-xl text-sm font-bold">ย้อนกลับ</button>}
                            {step === 1 ? <button onClick={handleFetchSheet} disabled={loading} className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">{loading ? "กำลังดึงข้อมูล..." : "ดึงข้อมูล"}</button> : <button onClick={handleImportSubmit} disabled={loading} className="px-8 py-2.5 bg-primary-navy text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">{loading ? "กำลังนำเข้า..." : "ยืนยันนำเข้าข้อมูล"}</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App ---
export default function App() {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading'); 
  const [activeDocId, setActiveDocId] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const directDocId = params.get('docId');
    if (directDocId) { setActiveDocId(directDocId); setView('sign'); } 
    else {
      const savedUser = localStorage.getItem('cmt_user');
      if (savedUser) { setUser(JSON.parse(savedUser)); setView('dashboard'); }
      else { setView('login'); }
    }
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?system=contract&action=getContracts`);
      if (!res.ok) throw new Error("Err");
      const data = await res.json();
      setContracts(Array.isArray(data) ? data : []);
    } catch (e) { alert("เชื่อมต่อ Server ไม่ได้"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (view === 'dashboard') loadContracts(); }, [view]);

  const handleLogin = (u, p) => {
    if (u === 'CMT' && p === 'CMT') {
      const userData = { username: 'CMT', role: 'admin' };
      setUser(userData); localStorage.setItem('cmt_user', JSON.stringify(userData));
      setView('dashboard');
    } else alert("รหัสผ่านผิด (CMT/CMT)");
  };

  return (
    <div className="min-h-screen font-sans text-neutral-dark bg-[#F9F5F0]">
      <Navbar user={user} onLogout={() => { localStorage.removeItem('cmt_user'); setUser(null); setView('login'); }} onSettings={() => setView('settings')} />
      
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        {view === 'loading' && <LoadingOverlay message="กำลังเชื่อมต่อฐานข้อมูล..." />}
        {view === 'login' && <LoginView onLogin={handleLogin} />}
        {view === 'dashboard' && (
          <Dashboard 
            contracts={contracts} loading={loading}
            onCreate={() => setView('create')} 
            onManageEmployees={() => setView('employees')}
            onRefresh={loadContracts}
            onDelete={async (id) => { 
                if(confirm("ยืนยันการลบสัญญา?")) { 
                    setGlobalLoading(true);
                    await fetch(API_URL, { 
                        method: 'POST', 
                        body: JSON.stringify({
                            action: 'deleteContract',
                            system: 'contract',
                            id: id }) 
                    }); 
                    await loadContracts(); 
                    setGlobalLoading(false); 
                }
            }}
            onOpenSign={(id) => { setActiveDocId(id); setView('sign'); }}
          />
        )}
        {view === 'create' && <CreateContract onCancel={() => setView('dashboard')} onSuccess={() => { setView('dashboard'); loadContracts(); }} />}
        {view === 'settings' && <SettingsPage onBack={() => setView('dashboard')} />}
        {view === 'employees' && <EmployeeManager onBack={() => setView('dashboard')} />}
        {view === 'sign' && <SignPage docId={activeDocId} onBack={() => { window.history.pushState({}, '', '/'); setView(user ? 'dashboard' : 'login'); }} isAdmin={!!user} />}
      </div>

      {globalLoading && <LoadingOverlay message="กำลังประมวลผล..." />}
    </div>
  );
}

// --- Sub Components ---
const Navbar = ({ onLogout, onSettings, user }) => (
<nav className="bg-primary-navy text-white px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
    <div className="w-full px-6 md:px-10 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
               <img src={logoImage} alt="Company Logo" className="mx-auto mb-4 h-10 w-10" />
            </div>
            <div>
                <h1 className="font-bold text-xl leading-tight tracking-tight text-[#ffde91]">Contract System</h1>
                <p className="text-[10px] text-gray-400 tracking-wider font-medium">HR DEPARTMENT</p>
            </div>
        </div>

        {user && (
          <div className="flex items-center gap-5">
              <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-[#ffde91]">Administrator</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">System Admin</p>
              </div>
              <div className="h-10 w-10 bg-gradient-to-br from-[#ffde91] to-yellow-600 rounded-full flex items-center justify-center text-primary-navy font-black text-lg shadow-lg border-2 border-primary-navy">A</div>
              <div className="h-8 w-px bg-gray-700 mx-1"></div>
              <button onClick={onSettings} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white" title="Settings"><Sliders size={20}/></button>
              <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400" title="Logout"><LogOut size={20}/></button>
          </div>
      )}
    </div>
  </nav>
);

const LoginView = ({ onLogin }) => {
  const [u, setU] = useState(''), [p, setP] = useState('');
  return (
    <div className="flex justify-center pt-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border text-center">
       <img src={logoImage} alt="Company Logo" className="mx-auto h-20 w-auto" />
        <h2 className="text-2xl font-bold text-primary-navy mb-6">เข้าสู่ระบบ</h2>
        <input className="w-full p-3 border rounded-xl mb-4" value={u} onChange={e=>setU(e.target.value)} placeholder="Username (CMT)" />
        <input type="password" className="w-full p-3 border rounded-xl mb-6" value={p} onChange={e=>setP(e.target.value)} placeholder="Password (CMT)" />
        <button onClick={()=>onLogin(u,p)} className="w-full bg-primary-navy text-white py-3 rounded-xl font-bold">Login</button>
      </div>
    </div>
  );
};

const Dashboard = ({ contracts, loading, onCreate, onManageEmployees, onRefresh, onDelete, onOpenSign }) => {
  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const total = contracts.length;
  const step1_2 = contracts.filter(c => (c.current_step === 1 || c.current_step === 2) && c.status !== 'Complete').length;
  const step3 = contracts.filter(c => c.current_step === 3 && c.status !== 'Complete').length;
  const completed = contracts.filter(c => c.status === 'Complete').length;

  return (
    <div className="animate-fade-in-up relative">
      {loading && <LoadingOverlay message="กำลังโหลดข้อมูลสัญญา..." />}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div className="flex items-center gap-4">
           <div className="bg-yellow-100 p-4 rounded-2xl shadow-sm border border-yellow-200/50"><FileText size={40} className="text-yellow-600 drop-shadow-sm" /></div>
           <div><h1 className="text-3xl font-extrabold text-primary-navy">Dashboard</h1><p className="text-gray-500 mt-1">ภาพรวมการจัดการสัญญาจ้างงาน</p></div>
        </div>
        <div className="flex gap-3">
           <button onClick={onManageEmployees} className="flex items-center gap-2 bg-white border-2 border-secondary-darkgold text-secondary-darkgold hover:bg-secondary-darkgold hover:text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md"><Users size={20}/> จัดการพนักงาน</button>
           <button onClick={onCreate} className="flex items-center gap-2 bg-primary-navy hover:bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"><Plus size={20}/> สร้างสัญญาใหม่</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <StatsCard label="สัญญาทั้งหมด" value={total} sub="ALL RECORDS" icon={<FileText size={24}/>} bg="bg-primary-navy text-white" />
         <StatsCard label="รอพยานเซ็น" value={step1_2} sub="PENDING WITNESS" icon={<Users size={28}/>} bg="bg-white text-gray-800" iconBg="bg-gray-50 text-blue-500" />
         <StatsCard label="รอผู้บริหารอนุมัติ" value={step3} sub="PENDING MANAGER" icon={<UserCheck size={28}/>} bg="bg-white text-gray-800" iconBg="bg-gray-50 text-yellow-600" />
         <StatsCard label="เสร็จสมบูรณ์" value={completed} sub="COMPLETED" icon={<CheckCircle size={28}/>} bg="bg-white text-gray-800" iconBg="bg-gray-50 text-green-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-xl text-primary-navy flex items-center gap-2"><Table size={20} className="text-primary-gold"/> รายการสัญญา (All Contracts)</h3>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">{total} Records Found</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-primary-navy text-white text-xs uppercase tracking-wider">
                     <th className="p-5 font-bold">พนักงาน (Employee)</th>
                     <th className="p-5 font-bold">แผนก (Dept)</th>
                     <th className="p-5 font-bold text-center">ประเภทสัญญา</th>
                     <th className="p-5 font-bold text-center">สถานะ (Status)</th>
                     <th className="p-5 font-bold text-center">อัปเดตล่าสุด</th>
                     <th className="p-5 font-bold text-right">จัดการ</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {contracts.length === 0 ? (
                    <tr><td colSpan="6" className="p-16 text-center text-gray-400">ไม่พบข้อมูลสัญญา</td></tr>
                  ) : (
                    contracts.map(c => (
                       <tr key={c.id} className="hover:bg-yellow-50/30 transition-all duration-200 group bg-white">
                          <td className="p-5">
                             <div className="font-bold text-primary-navy text-base">{c.data?.Fields?.Name} {c.data?.Fields?.Surname}</div>
                             <div className="text-xs text-secondary-darkgold font-mono mt-1 bg-yellow-50 inline-block px-1.5 rounded border border-yellow-200">{c.data?.Fields?.empId || "-"}</div>
                          </td>
                          <td className="p-5">
                             <div className="text-sm font-medium text-gray-700">{c.data?.Fields?.Position || "-"}</div>
                             <div className="text-xs text-gray-400">{c.data?.Fields?.Department || "-"}</div>
                          </td>
                          <td className="p-5 text-center"><span className="bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{CONTRACT_TYPES[c.contract_type]}</span></td>
                          <td className="p-5 text-center"><StatusBadge status={c.status} step={c.current_step} /></td>
                          <td className="p-5 text-center text-xs text-gray-500">
                             <div className="font-medium">{new Date(c.created_at).toLocaleDateString('th-TH')}</div>
                             <div className="text-[10px] opacity-60 uppercase mt-0.5">ADMIN</div>
                          </td>
                          <td className="p-5 text-right">
                             <div className="flex justify-end gap-2 items-center">
                                <button onClick={() => onOpenSign(c.id)} className="p-2 rounded-full bg-gray-100 hover:bg-primary-navy hover:text-white transition-all shadow-sm"><ChevronRight size={18} /></button>
                                <button onClick={() => onDelete(c.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all ml-1"><Trash2 size={18}/></button>
                             </div>
                          </td>
                       </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, sub, icon, bg, iconBg }) => (
    <div className={`${bg} p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform flex justify-between items-center border border-gray-100`}>
        <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">{label}</p>
            <div className="text-4xl font-black">{value}</div>
            <p className="text-[10px] opacity-60 mt-2 uppercase">{sub}</p>
        </div>
        <div className={`${iconBg || 'bg-white/10'} p-3 rounded-xl backdrop-blur-sm`}>{icon}</div>
    </div>
);

const StatusBadge = ({ status, step }) => {
    if (status === 'Complete') return <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">COMPLETED</span>;
    return <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 shadow-sm">STEP {step} PENDING</span>;
};

const csvToJSON = (csv) => {
    const lines = csv.split(/\r\n|\n/);
    const result = [];
    const splitCSV = (str) => {
        const matches = str.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        return matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"'));
    };
    const headers = splitCSV(lines[0]);
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentline = splitCSV(lines[i]);
        if (currentline.length > 0) {
            headers.forEach((header, index) => {
                let key = header.trim().replace(/^"|"$/g, ''); 
                let val = currentline[index] ? currentline[index].trim() : "";
                obj[key] = val;
            });
            result.push(obj);
        }
    }
    return { headers, data: result }; 
};

// --- SIGNING PAGE ---
const SignPage = ({ docId, onBack, isAdmin }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [contract, setContract] = useState(null);
  const [signing, setSigning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const params = new URLSearchParams(window.location.search);
  const linkStep = params.get('step') ? parseInt(params.get('step')) : null;

  const [alreadySignedStep, setAlreadySignedStep] = useState(false);
  const sigRef = useRef(null);

  const refreshContract = () => {
      fetch(`${API_URL}?system=contract&action=getContractById&id=${docId}`) 
        .then(r=>r.json())
        .then(data => {
            if(data.error) { alert("ไม่พบเอกสาร"); return; }
            setContract(data);
          
          const storageKey = `cmt_signed_steps_${docId}`;
          const signedSteps = JSON.parse(localStorage.getItem(storageKey) || '[]');
          
          if (signedSteps.includes(data.current_step)) {
              setAlreadySignedStep(true);
          } else {
              setAlreadySignedStep(false);
          }
      }).catch(()=>alert("ไม่พบเอกสาร"));
  };

  useEffect(() => { refreshContract(); }, [docId]);

  const handleMapUpdate = async (key, lat, lng) => {
      const newData = { ...contract.data };
      if (!newData[key]) newData[key] = {};
      newData[key] = { lat, lng };
      setContract({...contract, data: newData});
      await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                system: 'contract',
                action: 'updateContract', 
                id: contract.id, 
                data: newData 
            })
        });
  };

  const saveSignature = async () => {
    setIsSaving(true);
    const dataUrl = sigRef.current.toDataURL();
    const step = contract.current_step;
    const jsonKey = step === 1 ? "Sig4" : step === 2 ? "Sig3" : step === 3 ? "Sig1" : "Sig2";
    
    const newData = { ...contract.data };
    if(!newData.SignatureImages) newData.SignatureImages = {};
    newData.SignatureImages[jsonKey] = dataUrl;

    const nextStep = step === 4 ? 4 : step + 1;
    const status = step === 4 ? "Complete" : `Pending Signer ${nextStep}`;

    const payload = {
        action: 'updateContract',
        id: contract.id,
        status: status,
        current_step: nextStep,
        data: newData
    };

    try {
      await fetch(API_URL, {
         method: 'POST', 
         body: JSON.stringify(payload)
      });
    
    const storageKey = `cmt_signed_steps_${contract.id}`;
    const signedSteps = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!signedSteps.includes(step)) {
        signedSteps.push(step);
        localStorage.setItem(storageKey, JSON.stringify(signedSteps));
    }
    
    setAlreadySignedStep(true);
    setSigning(false); 
    setIsComplete(true); 
    } catch(e) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false); 
    }
  }; 

  if (isComplete) {
      return (
        <div className="flex flex-col h-screen items-center justify-center bg-green-50 animate-fade-in-up p-4 fixed inset-0 z-50">
           <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-green-100 max-w-md w-full">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle size={40} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-green-800 mb-2">ได้รับการรับรองเรียบร้อย</h1>
              <p className="text-gray-500 mb-8">ขอบคุณสำหรับการลงนามในเอกสาร<br/>ระบบได้บันทึกข้อมูลของท่านแล้ว</p>
              <div className="space-y-3">
                  <button onClick={() => { setIsComplete(false); refreshContract(); }} className="w-full py-3 bg-primary-navy text-white rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg">ตกลง / กลับไปดูเอกสาร</button>
                  {!isAdmin && <button onClick={() => window.close()} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">ปิดหน้าต่างนี้</button>}
              </div>
           </div>
        </div>
      );
  }

  if(!contract) return <div className="flex h-screen items-center justify-center font-bold text-primary-navy">Loading Document...</div>;
  
  const isLinkValid = !linkStep || linkStep === contract.current_step;
  const isEmployeeStep = contract.current_step === 4 && contract.status !== 'Complete';
  const canEdit = isEmployeeStep && !alreadySignedStep && isLinkValid;
  const showSignButton = contract.status !== 'Complete' && (isAdmin || (isLinkValid && !alreadySignedStep));
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0 !important; padding: 0 !important; background: white; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="bg-white border-b px-8 py-4 no-print shadow-sm z-20">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
                {isAdmin && <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20}/></button>}
                <div>
                    <h1 className="font-bold text-xl text-primary-navy">{contract.company_name}</h1>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {contract.id}</div>
                </div>
            </div>
            <div className="flex gap-4 items-center">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"><Printer size={18}/> พิมพ์ (Print)</button>
                <StatusBadge status={contract.status} step={contract.current_step} />
                
                {showSignButton ? (
                    <button onClick={()=>setSigning(true)} className="bg-primary-gold text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-yellow-600 transition-all flex gap-2 items-center animate-pulse">
                        <PenTool size={18}/> {isAdmin ? "ลงชื่อ (Admin)" : "ลงชื่อ (Sign Now)"}
                    </button>
                ) : (
                    contract.status !== 'Complete' && (
                        <div className={`px-4 py-2 rounded-xl font-bold text-sm border flex items-center gap-2 ${!isLinkValid ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                             {!isLinkValid ? <><X size={16}/> ลิงก์หมดอายุ (Link Expired)</> : <><CheckCircle size={16}/> คุณได้ลงนามแล้ว</>}
                        </div>
                    )
                )}
            </div>
         </div>
         
         <div className="max-w-4xl mx-auto">
             <StepTracker currentStep={contract.current_step} status={contract.status} />
         </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-200/50 p-8 flex justify-center">
         <div className="shadow-2xl">
            <ContractDocument 
                data={contract.data} 
                type={contract.contract_type} 
                company={contract.company_name} 
                isEditable={canEdit} 
                onMapUpdate={handleMapUpdate}
            />
         </div>
      </div>
      
        {signing && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div>
                            <h3 className="font-bold text-xl text-primary-navy">ลงลายมือชื่อ</h3>
                            <p className="text-sm text-gray-500">สำหรับขั้นตอนที่ {contract.current_step}</p>
                        </div>
                        <button onClick={()=>setSigning(false)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 bg-gray-50 mb-6 flex justify-center rounded-2xl relative overflow-hidden">
                        <SignatureCanvas ref={sigRef} />
                        <div className="absolute bottom-2 text-xs text-gray-400 pointer-events-none">เซ็นชื่อในกรอบนี้</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <button onClick={()=>{const ctx=sigRef.current.getContext('2d'); ctx.clearRect(0,0,320,160);}} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"><RotateCw size={14}/> ล้างลายเซ็น</button>
                        <div className="flex gap-3">
                            <button onClick={()=>setSigning(false)} 
                                    // เพิ่ม disabled เมื่อกำลังบันทึก
                                    disabled={isSaving} 
                                    className="px-5 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                            {/* *** ส่วนที่แก้ไข: ปุ่มยืนยัน (Confirm Button) *** */}
                            <button 
                                onClick={saveSignature} 
                                // เพิ่ม disabled และปรับสีปุ่มเมื่อกำลังบันทึก
                                disabled={isSaving}
                                className={`px-6 py-2 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 
                                ${isSaving 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-primary-navy text-white hover:shadow-xl hover:-translate-y-0.5'}`}
                            >
                            {isSaving 
                                ? <Loader2 className="animate-spin" size={18}/> 
                                : <Save size={18}/>}
                            {isSaving ? " กำลังบันทึก..." : "ยืนยัน"}
                            </button>
                            {/* ******************************************* */}
                        </div>
                    </div>
                </div>
                </div>
            )}
    </div>
  );
};

const SignatureCanvas = React.forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    React.useImperativeHandle(ref, () => canvasRef.current);
    const getPos = (e) => { const rect = canvasRef.current.getBoundingClientRect(); return { x: (e.clientX||e.touches[0].clientX) - rect.left, y: (e.clientY||e.touches[0].clientY) - rect.top }; };
    const draw = (e) => { if(!isDrawing) return; const ctx = canvasRef.current.getContext('2d'); const {x,y} = getPos(e); ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y); };
    return <canvas ref={canvasRef} width={320} height={160} className="cursor-crosshair touch-none" onMouseDown={e=>{setIsDrawing(true); const {x,y}=getPos(e); const ctx=canvasRef.current.getContext('2d'); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,y);}} onMouseUp={()=>{setIsDrawing(false);}} onMouseMove={draw} onTouchStart={e=>{setIsDrawing(true); const {x,y}=getPos(e); const ctx=canvasRef.current.getContext('2d'); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,y);}} onTouchMove={draw} onTouchEnd={()=>{setIsDrawing(false);}} />;
});

// ============================================================================
// CONTRACT DOCUMENT TEMPLATE
// ============================================================================
const ContractDocument = ({ data, type, company, isEditable, onMapUpdate }) => {
    if (!data) return <div className="p-10 text-center text-red-500">Error: ไม่พบข้อมูลสัญญา (Data Corrupted)</div>;
    const fields = data.Fields || {};
    const sigs = data.SignatureImages || {};
    const sigNames = data.SignatureNames || {};

    const F = ({ k, minW = "50px", align="center" }) => (
        <span className="field-inline" style={{ minWidth: minW, textAlign: align, display:'inline-block', borderBottom:'1px dotted #000', padding:'0 6px', color:'#0033cc' }}>{fields[k] || ""}</span>
    );

    const prefix = fields.ContractNO?.split('/')[0] || "CMT-P";
    const contractTitle = CONTRACT_TYPES[type] || type;
    const isNDA = type === 'secret_contract_page';

    const SigBlock = ({ img, name, align = "left" }) => (
        <div style={{ textAlign: align }}>
            <div style={{ marginTop: '5px' , fontSize: '12px'}}>
                ลงชื่อ <span style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '140px', height: '40px', border: '1px solid #999', margin: '0 6px', overflow: 'hidden', verticalAlign: 'middle'}}>
                    {img ? <img src={img} className="sig-img" style={{ maxHeight: '70px' }} /> : <span style={{ fontSize: '10px', color: '#ccc' }}>(ไม่มีรูปเซ็น)</span>}
                </span>
            </div>
            <div style={{ marginTop: '5px' }}>
                &emsp;&emsp;&ensp;(<span style={{ minWidth: '135px', display: 'inline-block', textAlign: 'center', borderBottom: '1px dotted #000' , fontSize: '12px'}}>{name || "...................."}</span>)
            </div>
        </div>
    );

    const RedWarningTable = () => (
        <table className="header-table" style={{width:'100%', borderCollapse:'collapse', marginTop:'0px', borderTop:'1px solid #000'}}>
            <tbody>
                <tr>
                    <td>
                        <div style={{fontSize:'12px', color:'#b00', fontWeight:'bold', textAlign:'center', verticalAlign:'middle', paddingTop: '8px'}}>
                            บริษัทถืออย่างเคร่งครัดว่า เรื่องค่าจ้างเป็นเรื่องลับ - เฉพาะตัว จึงไม่ควรจะบอกกล่าวหรือเปิดเผยแก่ผู้ใด
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );

    const EmployeeSignTable = () => (
        <table className="header-table" style={{width:'100%', borderCollapse:'collapse', marginTop:'10px', paddingTop: '10px' ,marginBottom: '10px'}}>
            <tbody>
                <tr>
                    <td style={{width:'70%', fontSize:'12px', verticalAlign:'middle'}}>
                        <div>&emsp;ข้าพเจ้ารับทราบเงื่อนไขการทดลองงานดังกล่าวข้างต้นและยินยอมที่จะปฏิบัติตามทุกประการ</div>
                        <div>&emsp;และข้าพเจ้าได้รับต้นฉบับสัญญาทดลองงานแล้ว</div>
                    </td>
                    <td style={{width:'30%', verticalAlign:'top'}}>
                        <SigBlock img={sigs.Sig2} name={sigNames.Name2} align="right" />
                    </td>
                </tr>
            </tbody>
        </table>
    );

    const ContractFooterAddon = ({ isCopy }) => {
        const footerStyle = { 
            marginTop: '-1px', 
            border: '1px solid #000', 
            paddingTop: '0px',
            width: '100%' 
        };
        if (type === 'probation_contract_page') 
            return <div style={footerStyle}>
                {!isCopy && <RedWarningTable />}
                {isCopy && <EmployeeSignTable />}</div>;
        if (type === 'contract_page_1') return <div style={footerStyle}>{!isCopy && <RedWarningTable />}{isCopy && <><EmployeeSignTable /><RedWarningTable /></>}</div>;
        return null;
    };

    const Header = ({ isCopy }) => (
        <table className="header-table" style={{width:'100%', marginBottom:'0px', borderCollapse:'collapse'}}>
            <tbody>
                <tr>
                    <td className="header-center pt-4" style={{width:'30%', fontSize:'12px', border:'0.5px solid #000', padding:'6px 8px', verticalAlign:'middle', fontWeight:700, textAlign:'center'}}>
                        {company}
                    </td>
                    <td className="header-center" style={{width:'40%', fontSize:'14px', border:'0.5px solid #000', padding:'6px 8px', verticalAlign:'middle', fontWeight:700, textAlign:'center'}}>
                        {contractTitle}
                    </td>
                    <td className="header-center" style={{width:'30%', fontSize:'14px', border:'0.5px solid #000', padding:'6px 8px', verticalAlign:'middle', fontWeight:600, textAlign:'center'}}>
                        <div>เลขที่ <span>{prefix}</span><F k="empId" minW="60px"/></div>
                        <div> {isCopy ? "คู่ฉบับ" : "ต้นฉบับ"}</div>
                    </td>
                </tr>
            </tbody>
        </table>
    );

    const SignatureSection = () => (
        <table style={{width:'90%', borderCollapse:'collapse', marginTop:'10px', marginLeft:'auto', marginRight:'auto'}}>
            <tbody>
                <tr>
                    <td style={{width:'50%', padding:'10px', verticalAlign:'top'}}>
                        <SigBlock img={sigs.Sig1} name={sigNames.Name1} align="left" />
                    </td>
                    <td style={{width:'50%', padding:'10px', verticalAlign:'top'}}>
                        <SigBlock img={sigs.Sig2} name={sigNames.Name2} align="left" />
                    </td>
                </tr>
                <tr>
                    <td style={{width:'50%', padding:'10px', verticalAlign:'top'}}>
                        <SigBlock img={sigs.Sig3} name={sigNames.Name3} align="left" />
                    </td>
                    <td style={{width:'50%', padding:'10px', verticalAlign:'top'}}>
                        <SigBlock img={sigs.Sig4} name={sigNames.Name4} align="left" />
                    </td>
                </tr>
            </tbody>
        </table>
    );

    const Page1 = ({ isCopy }) => (
        <div className="contract-paper" style={{width:'210mm', minHeight:'297mm', padding:'6.35mm 12.7mm 1.27mm 12.7mm', background:'white', boxShadow:'0 8px 20px rgba(0,0,0,0.1)', marginBottom:'10px', position:'relative'}}>
            <Header isCopy={isCopy} />
            <div style={{borderTop:'6px solid #a19a9a', margin:0, padding:0}}></div>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <tbody>
                    <tr>
                        <td style={{border:'1px solid #000', borderBottom:'none', padding:'8px'}}>
                            <div style={{textAlign:'right', fontWeight:200, fontSize:'12px'}}>เขียนที่ {company}</div>
                            <div style={{textAlign:'right', fontWeight:200, fontSize:'12px', marginTop:'20px'}}>
                                วันที่ทำสัญญา <F k="DD/MM/YYYY" minW="150px"/>
                            </div>
                            <div style={{fontSize:'12px', marginTop:'5px'}}>
                                &emsp;&emsp;สัญญาฉบับนี้ทําขึ้นระหว่าง <span style={{fontWeight:700}}>{company}</span> ตั้งอยู่เลขที่ 194 หมู่ 1 ถนนแจ้งสนิท ตําบลเมืองเพีย
                            </div>
                            <div style={{fontSize:'12px', marginTop:'1px'}}>
                                อําเภอบ้านไผ่ จังหวัดขอนแก่น โดย <b>ดร.กฤษณา สุขบุญญสถิตย์</b> ตําแหน่ง <b>ผู้จัดการฝ่ายบริหารทรัพยากรบุคคล</b> ผู้รับมอบอํานาจกระทําการแทน
                            </div>
                            <div style={{fontSize:'12px', marginTop:'1px'}}>
                                ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>“บริษัท”</b> ฝ่ายหนึ่ง กับ <F k="Name" minW="150px"/> <F k="Surname" minW="150px"/> อายุ <F k="Age" minW="40px"/> ปี
                            </div>
                            <div style={{fontSize:'12px', marginTop:'1px'}}>
                                บัตรประจําตัวประชาชนเลขที่ <F k="PersonalID" minW="200px"/> ออกให้ ณ <F k="PersonalID_validdate" minW="150px"/>
                            </div>
                            <div style={{fontSize:'12px', marginTop:'1px'}}>
                                อยู่บ้านเลขที่ <F k="Address" minW="300px" align="left"/>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table style={{width:'100%', minHeight:'200px', borderCollapse:'collapse', marginTop:'-1px'}}>
                <tbody>
                    <tr>
                        <td style={{border:'1px solid #000', borderTop:'none', padding:'8px', verticalAlign:'top'}}>
                            {type === 'contract_page_1' && (
                                <div style={{fontSize:'12px'}}>
                                    <div style={{marginTop:'1px'}}>ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>“พนักงาน”</b> อีกฝ่ายหนึ่ง ทั้งสองฝ่ายได้ตกลงทําสัญญาจ้างงานไว้ต่อกันดังต่อไปนี้</div>
                                    <div style={{marginTop:'20px'}}>&emsp; 1) &emsp;บริษัทตกลงจ้างพนักงานและพนักงานตกลงรับจ้างทํางานให้กับบริษัทในตําแหน่ง <F k="Position" minW="135px"/></div>
                                    <div style={{marginTop:'1px'}}>&ensp;&emsp;&emsp;&emsp;ประจําส่วนงาน<F k="project" minW="120px"/> แผนก <F k="Department" minW="120px"/> ฝ่าย <F k="Subdepartment" minW="120px"/></div>
                                    <div style={{marginTop:'5px'}}>&ensp;&emsp;&emsp;&emsp;โดยตกลงอัตราจ้างเริ่มต้นวันละ<F k="Salary" minW="100px"/>บาท ( <F k="Thai_salary" minW="240px"/> )</div>
                                    <div style={{marginTop:'1px'}}>&ensp;&emsp;&emsp;&emsp;และเริ่มอายุงาน ตั้งแต่วันที่<F k="Day_st" minW="30px"/> เดือน<F k="Month_st" minW="80px"/> พ.ศ.<F k="Year_st" minW="50px"/></div>
                                    <div style={{marginTop:'1px'}}>&ensp;&emsp;&emsp;&emsp;บริษัทจะจ่ายค่าจ้างผ่านทางบัญชีเงินฝากธนาคารทหารไทยธนชาต ทุกวันที่ 16 และวันที่ 30 ของเดือน โดยท่านชําระภาษีเงินได้เอง</div>
                                    {fields.Comment && <div style={{marginTop:'1px'}}>&ensp;&emsp;&emsp;&emsp;<b>หมายเหตุ : </b><span className="field-inline" style={{minWidth:'560px', display:'inline-block', borderBottom:'1px dotted #000', color:'#0033cc'}}>{fields.Comment}</span></div>}
                                    <div style={{marginTop:'20px'}}>&emsp; 2) &emsp;วันและเวลาทํางาน พนักงานตกลงทํางานตามสัญญาฉบับนี้ให้กับบริษัทตามวันและเวลาดังต่อไปนี้</div>
                                    <div style={{marginTop:'1px', marginLeft:'40px'}}>{WORK_SETS_FULL[data.SelectedWorkSet]?.map((line, i) => <div key={i}>{line}</div>)}</div>
                                    <div style={{marginTop:'20px'}}>&emsp; 3) &emsp;พนักงานมีสิทธิได้รับประโยชน์อย่างอื่นตามข้อบังคับและระเบียบของบริษัท ซึ่งมีอยู่ในขณะทําสัญญานี้และที่จะมีต่อไปในภายหน้า</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ในกรณีที่มีพระราชบัญญัติประกันสังคมหรือกฎหมายใดๆ ให้สิทธิประโยชน์แก่ลูกจ้างในลักษณะและ / หรือประเภทเดียวกัน</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;กับสิทธิประโยชน์ที่บริษัทกําหนดตามข้อบังคับและระเบียบของบริษัทซึ่งมีอยู่ในขณะนี้และที่จะมีต่อไปในภายหน้า พนักงานตกลง</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;จะใช้สิทธิดังกล่าว ถ้าสิทธิประโยชน์ที่ได้รับตามกฎหมายน้อยกว่าที่พนักงานจึงได้รับตามข้อบังคับและระเบียบบริษัทจะให้สิทธิประโยชน์</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;เพิ่มจนเท่ากับที่กําหนดไว้ตามข้อบังคับและระเบียบ แต่ถ้าหากสิทธิประโยชน์ที่ได้รับจากกฎหมายสูงกว่าข้อบังคับและระเบียบของบริษัท</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;พนักงานไม่มีสิทธิ์ได้รับสิทธิประโยชน์จากบริษัทอีก ทั้งนี้เว้นแต่จะมีกฎหมายบัญญัติไว้เป็นอย่างอื่น</div>
                                    <div style={{marginTop:'20px'}}>&emsp; 4) &emsp;พนักงานตกลงยินยอมให้บริษัทเปลี่ยนแปลง ตําแหน่ง หน้าที่ความรับผิดชอบ รวมทั้งแต่งตั้ง โอนย้ายพนักงานให้ไปปฏิบัติงาน</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;หรือบรรจุเป็นพนักงานประจําของบริษัทในตําแหน่งหน้าที่ใดในบริษัทได้ตามที่เห็นสมควร</div>
                                    <div style={{marginTop:'20px'}}>&emsp; 5) &emsp;กรณีพนักงานปฏิบัติงานโดยจงใจให้เกิดความเสียหายหรือประมาทเลินเล่ออย่างร้ายแรงจนเป็นเหตุให้บริษัทได้รับความเสียหายพนักงาน</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ยินยอมชดใช้ค่าเสียหายที่เกิดขึ้นตามจริง</div>
                                    <div style={{marginTop:'20px'}}>&emsp; 6) &emsp; ในขณะที่เป็นพนักงานของบริษัท พนักงานต้องไม่เป็นลูกจ้างของสถานประกอบการอื่นหรือบุคคลอื่นตลอดระยะเวลาการเป็นพนักงาน</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ของบริษัทโดยเด็ดขาด ไม่ว่าจะเป็นการทํางานในวันหยุดหรือนอกเวลาทํางานปกติก็ตาม และไม่ว่าจะได้รับค่าตอบแทน หรือไม่ก็ตาม</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ถ้าบริษัทพบว่าพนักงานเป็นลูกจ้างของสถานประกอบการอื่น บริษัทขอสงวนสิทธิในการบอกเลิกจ้างพนักงาน</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;โดยไม่ต้องบอกกล่าวล่วงหน้ารวมทั้งไม่จ่ายเงินชดเชยใดๆ ทั้งสิ้น</div>
                                    <div style={{marginTop:'20px'}}>&emsp; 7) &emsp; พนักงานตกลงว่าจะรักษาผลประโยชน์ของบริษัทและจะไม่กระทําการใดๆ อันเป็นการเปิดเผยความลับหรือสิ่งปกติใดๆ ที่เกี่ยวข้อง</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;กับกิจการของบริษัทให้กับผู้หนึ่งผู้ใดทราบโดยเด็ดขาด ซึ่งพนักงานอาจได้รับทราบเนื่องจากการปฏิบัติงาน หรือได้ค้นพบ</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ในระหว่างเวลาการจ้างและห้ามมิให้พนักงานนําข้อมูลต่างๆ ของบริษัทออกไปภายนอกที่ทําการของบริษัทและไม่ว่าพนักงาน</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;จะคงทํางานอยู่กับบริษัท หรือว่าสิ้นสภาพการเป็นพนักงานของบริษัทไปแล้ว ไม่ว่าด้วยเหตุผลใดๆ ก็ตามตลอดทั้งจะไม่ให้ความช่วยเหลือ</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;หรือให้คําปรึกษาแก่ผู้อื่นอันเป็นทางเสียหายหรือแข่งขันกับกิจการของบริษัท</div>
                                </div>
                            )}

                            {type === 'probation_contract_page' && (
                                <div style={{fontSize:'12px'}}>
                                    <div style={{marginTop:'1px'}}>ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>“พนักงาน”</b> อีกฝ่ายหนึ่ง ทั้งสองฝ่ายได้ตกลงทําสัญญาจ้างงานไว้ต่อกันดังต่อไปนี้</div>
                                    <div style={{marginTop:'5px'}}>&emsp; 1) &emsp;บริษัทตกลงจ้างพนักงานและพนักงานตกลงรับจ้างทํางานให้กับบริษัทในตําแหน่ง <F k="Position" minW="135px"/></div>
                                    <div style={{marginTop:'1px'}}>&ensp;&emsp;&emsp;&emsp;ประจําส่วนงาน<F k="project" minW="120px"/> แผนก <F k="Department" minW="120px"/> ฝ่าย <F k="Subdepartment" minW="120px"/></div>
                                    <div style={{marginTop:'5px'}}>&emsp; 2) &emsp;พนักงานจะต้องปฏิบัติงานในขั้นทดลองงานเป็นระยะเวลา 119 วัน โดยเริ่มปฏิบัติงานตั้งแต่</div>
                                    <div style={{marginTop:'1px'}}>&ensp;&emsp;&emsp;&emsp;วันที่<F k="Day_st" minW="30px"/> เดือน<F k="Month_st" minW="80px"/> พ.ศ.<F k="Year_st" minW="50px"/> &emsp;ถึง&emsp;วันที่<F k="Day_en" minW="30px"/> เดือน<F k="Month_en" minW="80px"/> พ.ศ.<F k="Year_en" minW="50px"/></div>
                                    <div style={{marginTop:'5px'}}>&emsp; 3) &emsp;อัตราค่าจ้างระหว่างทดลองงาน จํานวน<F k="Salary" minW="100px"/>บาท ( <F k="Thai_salary" minW="240px"/> )</div>
                                    <div style={{marginTop:'1px'}}>&ensp;&emsp;&emsp;&emsp;บริษัทจะจ่ายค่าจ้างผ่านทางบัญชีเงินฝากธนาคารทหารไทยธนชาต ทุกวันที่ 16 และวันที่ 30 ของเดือน โดยท่านชําระภาษีเงินได้เอง</div>
                                    {fields.Comment && <div style={{marginTop:'1px'}}>&ensp;&emsp;&emsp;&emsp;<b>หมายเหตุ : </b><span className="field-inline" style={{minWidth:'560px', display:'inline-block', borderBottom:'1px dotted #000', color:'#0033cc'}}>{fields.Comment}</span></div>}
                                    <div style={{marginTop:'5px'}}>&emsp; 4) &emsp;วันและเวลาทํางาน พนักงานตกลงทํางานตามสัญญาฉบับนี้ให้กับบริษัทตามวันและเวลาดังต่อไปนี้</div>
                                    <div style={{marginTop:'1px', marginLeft:'40px'}}>{WORK_SETS_FULL[data.SelectedWorkSet]?.map((line, i) => <div key={i}>{line}</div>)}</div>
                                    <div style={{marginTop:'5px'}}>&emsp; 5) &emsp;บริษัทฯ กําหนดให้มีการทดลองงาน ระยะเวลา 119 วัน หากผลงานของพนักงานไม่เป็นที่พอใจ บริษัทจะแจ้งให้พนักงานทราบล่วงหน้า</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;โดยที่บริษัทไม่จ่ายเงินชดเชยใดๆ ทั้งสิ้น</div>
                                    <div style={{marginTop:'5px'}}>&emsp; 6) &emsp; กรณีพนักงานลาออกกะทันหัน โดยไม่ได้บอกกล่าวล่วงหน้า อันเป็นการไม่ได้ปฏิบัติตามระเบียบว่าด้วยการลาออกจากการเป็นพนักงาน</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;การจ่ายค่าจ้างสําหรับวันทํางานส่วนที่เหลือ พนักงานจะต้องติดต่อขอรับค่าจ้างกับตัวแทนบริษัท ด้วยตนเอง</div>
                                    <div style={{marginTop:'5px'}}>&emsp; 7) &emsp;  พนักงานมีสิทธิได้รับประโยชน์อย่างอื่นตามข้อบังคับและระเบียบของบริษัทซึ่งมีอยู่ในขณะทําสัญญานี้และที่จะมีต่อไปในภายหน้า</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ในกรณี ที่มีพระราชบัญญัติประกันสังคมหรือกฎหมายใดๆ ให้สิทธิประโยชน์แก่ลูกจ้างในลักษณะและ / หรือประเภทเดียวกันกับสิทธิ</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ประโยชน์ที่ บริษัทกําหนดตามข้อบังคับและระเบียบของบริษัทซึ่งมีอยู่ในขณะนี้และที่จะมีต่อไปในภายหน้า พนักงานตกลงจะใช้สิทธิ</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ดังกล่าว ถ้าสิทธิ ประโยชน์ที่ได้รับตามกฎหมายน้อยกว่าที่พนักงานจึงได้รับตามข้อบังคับและระเบียบ บริษัทจะให้สิทธิประโยชน์</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;เพิ่มจนเท่ากับที่กําหนดไว้ตามข้อบังคับและระเบียบ แต่ถ้าหากสิทธิประโยชน์ที่ได้รับจากกฎหมายสูงกว่าข้อบังคับและระเบียบ</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ของบริษัท พนักงานไม่มีสิทธิ์ได้รับสิทธิ ประโยชน์จากบริษัทอีก ทั้งนี้เว้นแต่จะมีกฎหมายบัญญัติไว้เป็นอย่างอื่น</div>
                                    <div style={{marginTop:'5px'}}>&emsp; 8) &emsp; หนังสือสัญญาจ้างงานนี้ทําขึ้นเป็นสองฉบับ มีข้อความถูกต้องตรงกันสําหรับยึดถือไว้ฝ่ายละฉบับ คู่สัญญาทั้งสองฝ่ายได้อ่าน ตรวจดู</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;และเข้าใจข้อความในสัญญานี้โดยตลอด และยอมรับเงื่อนไขทุกประการแล้ว จึงได้ลงลายมือชื่อไว้เป็นสําคัญต่อหน้าพยาน</div>
                                    <SignatureSection />
                                </div>
                            )}

                            {isNDA && (
                                <div style={{fontSize:'12px'}}>
                                    <div style={{marginTop:'5px'}}>ได้ตกลงทําสัญญาจ้างเลขที่ <F k="ContractNO" minW="100px"/> ไว้ต่อกัน เมื่อวันที่ <F k="Day_st" minW="30px"/> เดือน <F k="Month_st" minW="80px"/> ปี <F k="Year_st" minW="50px"/> นั้น โดยพนักงานตกลงว่า</div>
                                    <div style={{marginTop:'10px'}}>&emsp; 1) &emsp;ในขณะที่พนักงานทํางานอยู่กับบริษัท พนักงานต้องไม่เป็นลูกจ้างของสถานประกอบการอื่นหรือบุคคลอื่นตลอดระยะเวลา</div>
                                    <div style={{marginTop:'1px'}}>การเป็นพนักงานของบริษัทโดยเด็ดขาด ไม่ว่าจะเป็นการทํางานในวันหยุดหรือนอกเวลาทํางานปกติก็ตาม และไม่ว่าจะได้รับค่าตอบแทน</div>
                                    <div style={{marginTop:'1px'}}>หรือไม่ก็ตาม หรือภายในกําหนดระยะเวลา 36 เดือน นับแต่สัญญาจ้างสิ้นสุดลงพนักงานสัญญาว่าจะไม่ประกอบกิจการ ไม่ว่าด้วยตนเอง</div>
                                    <div style={{marginTop:'1px'}}>หรือเป็นตัวแทน หรือเป็น ลูกจ้างผู้ใด หรือเข้าไปเกี่ยวข้องดําเนินการไม่ว่าจะเป็นโดยตรงหรือโดยอ้อมกับการพัฒนา ทําผลิต หรือจําหน่าย</div>
                                    <div style={{marginTop:'1px'}}>ซึ่งผลิตภัณฑ์อันเป็นการแข่งขัน กับผลิตภัณฑ์ของบริษัทฯ เว้นแต่ได้รับความยินยอมเป็นหนังสือจากบริษัทฯ</div>
                                    <div style={{marginTop:'5px'}}>&emsp; 2) &emsp;จะรักษาผลประโยชน์ของบริษัทและจะไม่กระทําการใดๆ อันเป็นการเปิดเผยความลับหรือสิ่งปกติใดๆ ที่เกี่ยวข้องกับกิจการของบริษัท</div>
                                    <div style={{marginTop:'1px'}}>ให้กับผู้หนึ่งผู้ใดทราบโดยเด็ดขาด ซึ่งผู้รับจ้างอาจได้รับทราบเนื่องจากการปฏิบัติงาน หรือได้ค้นพบในระหว่างเวลาการจ้าง และห้ามมิให้ผู้รับจ้าง</div>
                                    <div style={{marginTop:'1px'}}>นําข้อมูลต่างๆ ของบริษัทออกไปภายนอกที่ทําการของบริษัท และไม่ว่าผู้รับจ้างจะคงทํางานอยู่กับบริษัท หรือว่าสิ้นสภาพการเป็นผู้รับจ้างไปแล้ว</div>
                                    <div style={{marginTop:'1px'}}>ไม่ว่าด้วยเหตุผลใดๆ ก็ตาม ตลอดทั้งจะไม่ให้ความช่วยเหลือหรือให้คําปรึกษาแก่ผู้อื่น อันเป็นทางเสียหายหรือแข่งขันกับกิจการของบริษัท</div>
                                    <div style={{marginTop:'5px'}}>&emsp; 3) &emsp;จะไม่นําความลับทางการค้าของบริษัทไปเปิดเผยต่อบุคคลใด ไม่ว่าจะโดยตรงหรือปริยาย หรือกระทําด้วยประการใดๆ</div>
                                    <div style={{marginTop:'1px'}}>ให้เป็นที่ล่วงรู้ทั่วไป ในข้อมูลดังต่อไปนี้</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ก)&emsp;ข้อมูลทางการค้าด้านอุตสาหกรรม อาทิ ข้อมูลทรัพย์สินทางปัญญา ได้แก่ รูปแบบสินค้า (Design) ข้อมูลของเครื่องมือเครื่องใช้</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ในการผลิต ข้อมูลที่เกี่ยวกับเทคนิคการผลิต ความลับในกระบวนการผลิต (เคล็ดลับ) สูตรทางเคมี ข้อมูลผลการวิจัย</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ในห้องปฏิบัติการและวัตถุดิบในการผลิต เป็นต้น</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ข)&emsp;ข้อมูลทางการค้าด้านพาณิชย์ อาทิ ข้อมูลเกี่ยวกับการดําเนินธุรกิจของบริษัท แผนงานทางการตลาด ข้อมูลลูกค้าของบริษัท</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;แหล่งซื้อวัตถุดิบ ต้นทุนวัตถุดิบและสินค้าที่ซื้อ ข้อมูลเกี่ยวกับราคาสินค้าที่จะจําหน่าย เป็นต้น</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ค)&emsp;ข้อมูลของบริษัทด้านการบริหารและการจัดการ ทั้งการเงิน บัญชี การผลิต และการตลาด</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;หากพนักงานละเมิดข้อใดข้อหนึ่งตามข้อตกลงนี้ ไม่ว่าบริษัทจะได้รับความเสียหายหรือไม่</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ก)&emsp;กรณีที่พนักงานยังคงทํางานกับบริษัท ให้ถือว่าเป็นการกระทําผิดต่อบริษัทเป็นกรณีร้ายแรง บริษัทสามารถเลิกจ้างได้ทันที</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;โดยไม่ต้องจ่ายค่าชดเชย และมีสิทธิที่จะเรียกร้องค่าเสียหายได้อีกส่วนหนึ่ง ในห้องปฏิบัติการและวัตถุดิบในการผลิต เป็นต้น</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ข)&emsp;กรณีที่พนักงานสิ้นสภาพการเป็นพนักงานของบริษัทแล้ว ให้บริษัทมีสิทธิเรียกร้องค่าเสียหายเป็นเงินจํานวน 10 เท่า</div>
                                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ของอัตราค่าจ้างที่ได้รับครั้งสุดท้าย</div>
                                    <div style={{marginTop:'5px'}}>&emsp;&emsp;&emsp;&ensp;หนังสือสัญญาฉบับนี้ คู่สัญญาทั้งสองฝ่ายได้อ่าน ตรวจดูและเข้าใจข้อความในเอกสารนี้โดยตลอด และยอมรับเงื่อนไขทุกประการแล้ว</div>
                                    <div style={{marginTop:'1px'}}>จึงได้ลงลายมือชื่อไว้เป็นสําคัญต่อหน้าพยาน</div>
                                    <SignatureSection />
                                </div>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
            {(type === 'probation_contract_page') && (
                            <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                                <ContractFooterAddon isCopy={isCopy} />
                            </div>
                        )}

            <div className="doc-footer" style={{position:'absolute', bottom:'7mm', right:'12.7mm', fontSize:'12px', color:'#666'}}>Form.FR-HRM-001 แก้ครั้งที่ 12</div>
        </div>
    );

    // Page 2
    const Page2 = ({ isCopy }) => (
        <div className="contract-paper" style={{width:'210mm', minHeight:'297mm', padding:'6.35mm 12.7mm 1.27mm 12.7mm', background:'white', boxShadow:'0 8px 20px rgba(0,0,0,0.1)', marginBottom:'10px', position:'relative'}}>
            <div style={{height:'100%', border:'1px solid #000', padding:'8px', position:'relative'}}>
                <div style={{fontSize:'12px', marginTop:'10px'}}>
                    <div style={{marginTop:'5px'}}>&emsp;&emsp;&emsp;&ensp;พนักงานตกลงว่าจะไม่นําความลับทางการค้าของบริษัทไปเปิดเผยต่อบุคคลใด ไม่ว่าจะโดยตรง หรือปริยาย หรือกระทํา</div>
                    <div style={{marginTop:'1px'}}>ด้วยประการใดๆ ให้เป็นล่วงรู้ทั่วไปในข้อมูลดังต่อไปนี้</div>
                    <div style={{marginTop:'10px'}}>&emsp;&emsp;&emsp;&ensp;7.1)&emsp; ข้อมูลทางการค้าด้านอุตสาหกรรม อาทิ ข้อมูลที่เกี่ยวกับเทคนิคการผลิต ความลับในกระบวนการผลิต (เคล็ดลับ) สูตรทางเคมี</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ข้อมูลผลการวิจัยในห้องปฏิบัติการ และวัตถุดิบในการผลิต เป็นต้น</div>
                    <div style={{marginTop:'10px'}}>&emsp;&emsp;&emsp;&ensp;7.2)&emsp; ข้อมูลทางการค้าด้านพาณิชย์ อาทิ ข้อมูลเกี่ยวกับการดําเนินธุรกิจของบริษัท แผนงานทางการตลาด ข้อมูลลูกค้าของบริษัท</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;แหล่งซื้อวัตถุดิบ ข้อมูลเกี่ยวกับราคาสินค้าที่จะจําหน่าย เป็นต้น</div>
                    <div style={{marginTop:'10px'}}>&emsp;&emsp;&emsp;&ensp;7.3)&emsp; ข้อมูลของบริษัทด้านการบริหารและการจัดการ ทั้งการเงิน บัญชี การผลิต และการตลาดหากพนักงานกระทําผิดข้อสัญญานี้</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ไม่ว่าบริษัทจะได้รับความเสียหายหรือไม่</div>
                    <div style={{marginTop:'5px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ก)&emsp;กรณีที่พนักงานยังคงทํางานอยู่กับบริษัท ให้ถือว่าเป็นการกระทําผิดต่อบริษัทเป็นกรณีร้ายแรง บริษัทสามารถเลิกจ้าง</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ได้ทันที โดยไม่ต้องจ่ายค่าชดเชยและมีสิทธิที่จะเรียกร้องค่าเสียหายได้สูงสุดตามมูลค่าความเสียหาย</div>
                    <div style={{marginTop:'5px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ข)&emsp;กรณีที่พนักงานสิ้นสภาพการเป็นพนักงานของบริษัทแล้ว บริษัทมีสิทธิเรียกร้องค่าเสียหายได้สูงสุดตามมูลค่าเสียหาย</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&ensp;ที่เกิดขึ้นและสามารถดําเนินคดีตามกฎหมายได้ทั้งทางแพ่งและทางอาญา</div>
                    <div style={{marginTop:'20px'}}>&emsp; 8) &emsp;ในระหว่างสัญญาการเป็นพนักงานของบริษัทนั้นงานต่าง ๆ ที่บริษัทได้มอบหมายให้พนักงานดําเนินการทําในหน้าที่ ระหว่างการเป็น</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;พนักงาน ได้แก่ งานสร้างสรรค์อันมีลิขสิทธิ์ตาม พ.ร.บ.ลิขสิทธิ์ เช่น งานศิลปกรรม งานวรรณกรรม โปรแกรมคอมพิวเตอร์ งานแพร่ภาพ</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;แพร่เสียง โสตทัศนวัสดุ ภาพยนตร์ หรือสิ่งบันทึกเสียง เป็นต้น พนักงานตกลงว่าให้ตกเป็นลิขสิทธิ์ของบริษัทแต่เพียงผู้เดียว</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;และส่วนงานคิดรูปรอยประดิษฐ์ สัญลักษณ์ เครื่องหมายการค้า เครื่องบริการตาม พ.ร.บ.เครื่องหมายการค้านั้น ก็ให้ตกเป็นสิทธิ</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ของบริษัทที่จะเป็นเจ้าของเครื่องหมายต่าง ๆ ดังกล่าวแต่เพียงผู้เดียว</div>
                    <div style={{marginTop:'20px'}}>&emsp;&emsp;&emsp;&emsp;&emsp;แม้ว่างานอันมีลิขสิทธิ์ หรือเครื่องหมายต่างๆ ดังกล่าวตามวรรคแรกนั้นตนจะเป็นผู้สร้างสรรค์ผลงานหรือคิดเครื่องหมายขึ้นก็ตาม</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;พนักงานตกลงว่าจะไม่ทําหรือสนับสนุนให้ผู้อื่นกระทําซ้ํา หรือดัดแปลง เผยแพร่ต่อบุคคลอื่นหรือสาธารณชน หรือให้เช่าต้นฉบับหรือทำ</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;สําเนางานโปรแกรมคอมพิวเตอร์ โสตทัศนวัสดุ ภาพยนตร์ และสิ่งบันทึกเสียง หรือให้ประโยชน์แก่ ผู้อื่น หรืออนุญาตให้ผู้อื่น</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ใช้สิทธิดังกล่าว แก่ผลงานอันเป็นลิขสิทธิ์ของบริษัทหรือเครื่องหมายต่าง ๆ ที่บริษัทเป็นเจ้าของ</div>
                    <div style={{marginTop:'20px'}}>&emsp; 9) &emsp;พนักงานตกลงจะไม่รับประโยชน์ หรืออามิสสินจ้าง หรือสินตอบแทนอย่างหนึ่งอย่างใดจากผู้อื่น เนื่องจากการปฏิบัติงานหรือให้คําแนะนำ</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;เกี่ยวกับการกิจการของบริษัท ทั้งนี้หากพนักงานได้รับของขวัญหรือประโยชน์ด้วยเหตุดังกล่าวข้างต้น แม้จะได้รับในโอกาส</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ตามประเพณีนิยม ถ้ามีมูลค่าเกินกว่าปกติวิสัย พนักงานจะต้องแจ้งให้ผู้บังคับบัญชาทราบทุกกรณี</div>
                    <div style={{marginTop:'20px'}}>&ensp; 10) &emsp;หากคู่สัญญาฝ่ายใดฝ่ายหนึ่งมีความประสงค์จะเลิกสัญญาจ้างงาน คู่สัญญาฝ่ายนั้นจะต้องแจ้งให้อีกฝ่ายหนึ่งทราบล่วงหน้า</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ตามระเบียบข้อบังคับของบริษัทที่มีใช้อยู่ในขณะที่ทําสัญญาจ้างนี้</div>
                    <div style={{marginTop:'10px', color:'red'}}>&emsp;&emsp;&emsp;&ensp;กรณีพนักงานลาออกกะทันหัน โดยไม่ได้บอกกล่าวล่วงหน้าอันเป็นการไม่ได้ปฏิบัติตามระเบียบว่าด้วยการลาออกจากการเป็นพนักงาน</div>
                    <div style={{marginTop:'1px', color:'red'}}>&emsp;&emsp;&emsp;&ensp;การจ่ายค่าจ้างสําหรับวันทํางานส่วนที่เหลือ พนักงานจะต้องติดต่อขอรับค่าจ้างกับตัวแทนบริษัทด้วยตนเอง</div>
                    <div style={{marginTop:'20px'}}>&ensp; 11) &emsp;เมื่อสัญญานี้สิ้นสุดลงไม่ว่าด้วยเหตุใดก็ตาม พนักงานจะต้องส่งคืนซึ่งอุปกรณ์ เครื่องมือ เครื่องใช้ แบบพิมพ์ คู่มือ บันทึก รายงาน</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;บัตรพนักงานและวัสดุอื่นๆ อันเกี่ยวกับการดําเนินกิจการของบริษัท และที่อยู่ภายใต้การควบคุมดูแลของพนักงาน ให้แก่บริษัท</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;โดยพนักงาน จะต้องส่งคืนให้กับบริษัทก่อนล่วงหน้า 7 วัน ก่อนวันลาออกมีผลอนุมัติ</div>
                    <div style={{marginTop:'20px'}}>&ensp; 12) &emsp;พนักงานรับรองว่าจะปฏิบัติหน้าที่ตามที่บริษัทมอบหมายให้ด้วยความซื่อสัตย์สุจริต และเต็มกําลังความสามารถของตน รวมทั้งจะเสาะ</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;แสวงหาความรู้เพิ่มเติมหรือกระทําการอื่นๆ อันเป็นการส่งเสริมให้กิจการของบริษัทดําเนินรุดหน้าไปได้อย่างรวดเร็วด้วยดี</div>
                    <div style={{marginTop:'20px'}}>&ensp; 13) &emsp;พนักงานรับรองว่าจะอุทิศเวลาของตนให้แก่บริษัทและจะไม่ประกอบกิจการอย่างใดอย่างหนึ่ง หรืออาจเป็นการแข่งขันกันกิจการ</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ของบริษัทหรือเข้าร่วมในการประกอบกิจการโดยพนักงานได้รับผลประโยชน์ ไม่ว่าโดยทางตรงหรือทางอ้อมในธุรกิจของบริษัทอื่น</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ซึ่งประกอบกิจการเช่นเดียวกับบริษัท หรือกระทําการอย่างใดอย่างหนึ่งอันอาจก่อให้เกิดความเสียหายแก่บริษัท</div>
                    <div style={{marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ไม่ว่าจะโดยทางตรงหรือทางอ้อม</div>
                </div>
            </div>
            <div className="doc-footer" style={{position:'absolute', bottom:'7mm', right:'12.7mm', fontSize:'12px', color:'#666'}}>Form.FR-HRM-001 แก้ครั้งที่ 12</div>
        </div>
    );

    // Page 3
    const Page3 = ({ isCopy }) => (
        <div className="contract-paper" style={{width:'210mm', minHeight:'297mm', padding:'6.35mm 12.7mm 1.27mm 12.7mm', background:'white', boxShadow:'0 8px 20px rgba(0,0,0,0.1)', marginBottom:'10px', position:'relative'}}>
            <div style={{height:'100%', padding:'0', position:'relative', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                <div>
                    <table style={{width:'100%', borderCollapse:'collapse', borderBottom: 'none'}}>
                        <tbody>
                            <tr>
                                <td style={{border:'1px solid #000', padding:'8px', verticalAlign:'top', borderBottom:'none'}}>
                                    <div style={{fontSize:'12px', marginTop:'1px'}}>&ensp; 14) &emsp;พนักงานจะปฏิบัติตามระเบียบข้อบังคับเกี่ยวกับการทํางาน กฎระเบียบ คําสั่ง และประกาศของบริษัทโดยเคร่งครัด และให้ถือว่าระเบียบ</div>
                                    <div style={{fontSize:'12px', marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ข้อบังคับเกี่ยวกับการทํางาน กฎระเบียบ คําสั่ง และประกาศของบริษัทที่ได้ประกาศใช้ในปัจจุบัน หรือที่มีการแก้ไข เปลี่ยนแปลง</div>
                                    <div style={{fontSize:'12px', marginTop:'1px'}}>&emsp;&emsp;&emsp;&ensp;ในภายหน้าเป็นส่วนหนึ่งของสัญญานี้ ซึ่งนายจ้างอาจเปลี่ยนแปลงได้ตามความเหมาะสม และให้ถือเป็นส่วนหนึ่งของสัญญานี้ด้วย</div>
                                    <div style={{fontSize:'12px', marginTop:'20px', textIndent:'40px'}}>หนังสือสัญญาจ้างงานนี้ทําขึ้นเป็นสองฉบับมีข้อความถูกต้องตรงกันสําหรับยึดถือไว้ฝ่ายละฉบับ คู่สัญญาทั้งสองฝ่ายได้อ่าน ตรวจดู</div>
                                    <div style={{fontSize:'12px', marginTop:'1px'}}>และเข้าใจข้อความในสัญญานี้โดยตลอด และยอมรับเงื่อนไขทุกประการแล้วจึงได้ลงลายมือชื่อไว้เป็นสําคัญต่อหน้าพยาน</div>
                                </td>
                            </tr>
                            <tr>
                                <td style={{border:'1px solid #000', padding:'8px', borderTop:'none'}}>
                                    <SignatureSection />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <ContractFooterAddon isCopy={isCopy} />
            </div>
            <div className="doc-footer" style={{position:'absolute', bottom:'7mm', right:'12.7mm', fontSize:'12px', color:'#666'}}>Form.FR-HRM-001 แก้ครั้งที่ 12</div>
        </div>
    );

    // Page Address (ปรับให้ใช้ SigBlock ด้วย)
    const PageAddress = () => (
        <div className="contract-paper" style={{width:'210mm', minHeight:'297mm', padding:'6.35mm 12.7mm 1.27mm 12.7mm', background:'white', boxShadow:'0 8px 20px rgba(0,0,0,0.1)', marginBottom:'10px', position:'relative'}}>
            <table className="header-table" style={{marginBottom:'5px', width:'100%', border: '1px solid #000'}}>
                <tbody><tr><td style={{textAlign:'center', fontWeight:500, paddingTop: '10px', paddingBottom: '10px'}}>เอกสารแนบสัญญาจ้าง</td></tr></tbody>
            </table>
            <table className="form-table" style={{width:'100%', borderCollapse:'collapse', border:'1px solid #000'}}>
                <tbody>
                    <tr>
                        <td style={{width:'100%', padding:'6px', border:'1px solid #000'}}>
                            <div style={{fontSize:'12px'}}>
                                <div style={{marginTop:'1px'}}>
                                    พนักงานชื่อ <F k="Name" minW="260px" align="left"/> นามสกุล <F k="Surname" minW="260px" align="left"/>
                                </div>
                                <div style={{marginTop:'5px'}}>
                                    อาศัยอยู่บ้านเลขที่ <F k="House_id" minW="80px" align="left"/> หมู่ที่ <F k="Moo" minW="50px" align="left"/> ตรอก/ซอย <F k="Street" minW="120px" align="left"/> ถนน <F k="Road" minW="155px" align="left"/>
                                </div>
                                <div style={{marginTop:'5px'}}>
                                    ตำบล / แขวง <F k="Subdistrict" minW="150px" align="left"/> อำเภอ / เขต <F k="District" minW="150px" align="left"/> จังหวัด <F k="Province" minW="145px" align="left"/>
                                </div>
                                <div style={{marginTop:'5px'}}>
                                    หมายเลขโทรศัพท์ที่บ้าน <F k="Hounse_phone_number" minW="185px" align="left"/> หมายเลขโทรศัพท์เคลื่อนที่ <F k="Mobile_phone_number" minW="190px" align="left"/>
                                </div>
                                <div style={{marginTop:'5px'}}>
                                    สถานที่ใกล้เคียงที่บ้าน <F k="Place_near_home" minW="530px" align="left"/>
                                </div>
                                <div style={{marginTop:'5px'}}>
                                    ผู้ที่สามารถติดต่อได้ตามที่อยู่ ชื่อ <F k="Person_contact_name" minW="210px" align="left"/> นามสกุล <F k="Person_contact_surname" minW="215px" align="left"/>
                                </div>
                                <div style={{marginTop:'5px'}}>
                                    โทรศัพท์ที่สามารถติดต่อได้ <F k="Person_contact_phone" minW="185px" align="left"/> มีความสัมพันธ์เกี่ยวข้องเป็น <F k="Person_contact_relationship" minW="175px" align="left"/>
                                </div>
                                <div style={{fontWeight:700, marginTop:'30px', textAlign:'center'}}>โปรดเขียนแผนผังที่สังเขปที่ชัดเจนของที่อยู่ของพนักงาน</div>

                                {/* --- ส่วนที่เพิ่ม: ข้อความแจ้งเตือน (แสดงเฉพาะตอนแก้ไข + ไม่ปริ้นท์) --- */}
                                {isEditable && (
                                    <div className="no-print" style={{color: 'red', textAlign: 'center', marginTop: '5px', fontWeight: 'bold', border: '1px dashed red', padding: '5px', backgroundColor: '#fff5f5'}}>
                                        * กรุณาดับเบิ้ลคลิก หรือ ลากหมุด บนแผนที่เพื่อระบุตำแหน่งที่อยู่ของท่าน
                                    </div>
                                )}
                                {/* ------------------------------------------------------------- */}

                                <div className="my-2">
                                    <LeafletMap 
                                        id="map_home" 
                                        label="แผนที่: ที่อยู่ตามทะเบียนบ้าน"
                                        lat={data.MapHome?.lat} 
                                        lng={data.MapHome?.lng} 
                                        readonly={!isEditable}
                                        onSelect={(lat,lng) => onMapUpdate('MapHome', lat, lng)}
                                    />
                                </div>
                                <div style={{fontWeight:700, marginTop:'30px', textAlign:'center'}}>ที่อยู่ปัจจุบัน</div>

                                {/* --- ส่วนที่เพิ่ม: ข้อความแจ้งเตือน (แสดงเฉพาะตอนแก้ไข + ไม่ปริ้นท์) --- */}
                                {isEditable && (
                                    <div className="no-print" style={{color: 'red', textAlign: 'center', marginTop: '5px', fontWeight: 'bold', border: '1px dashed red', padding: '5px', backgroundColor: '#fff5f5'}}>
                                        * กรุณาดับเบิ้ลคลิก หรือ ลากหมุด บนแผนที่เพื่อระบุตำแหน่งที่อยู่ของท่าน
                                    </div>
                                )}
                                {/* ------------------------------------------------------------- */}

                                <div className="my-2">
                                    <LeafletMap 
                                        id="map_current" 
                                        label="แผนที่: ที่อยู่ปัจจุบัน"
                                        lat={data.MapCurrent?.lat} 
                                        lng={data.MapCurrent?.lng} 
                                        readonly={!isEditable}
                                        onSelect={(lat,lng) => onMapUpdate('MapCurrent', lat, lng)}
                                    />
                                </div>
                                <SigBlock img={sigs.Sig2} name={sigNames.Name2} align="right" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="doc-footer" style={{position:'absolute', bottom:'7mm', right:'12.7mm', fontSize:'12px', color:'#666'}}>Form.FR-HRM-001 แก้ครั้งที่ 12</div>
        </div>
    );

    return (
        <div className="print-area">
            {/* 1. Original Set */}
            <Page1 isCopy={false} />
            {type === 'contract_page_1' && <Page2 isCopy={false} />}
            {type === 'contract_page_1' && <Page3 isCopy={false} />}
            {(type === 'contract_page_1' || type === 'probation_contract_page') && <PageAddress />}

            {/* 2. Copy Set */}
            <div className="no-print h-10 bg-gray-200 flex items-center justify-center text-gray-500 font-bold border-y border-gray-300 my-4">--- ชุดคู่ฉบับ (Copy) ---</div>
            <Page1 isCopy={true} />
            {type === 'contract_page_1' && <Page2 isCopy={true} />}
            {type === 'contract_page_1' && <Page3 isCopy={true} />}
            {(type === 'contract_page_1' || type === 'probation_contract_page') && <PageAddress />}
        </div>
    );
};