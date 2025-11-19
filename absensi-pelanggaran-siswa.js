const { motion } = window.framerMotion;
const { useState, useEffect, useMemo } = React;

function uid() {
  return Date.now().toString(36) + "-" + Math.floor(Math.random() * 9999).toString(36);
}

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function exportToCSV(rows, filename = "export.csv") {
  if (!rows || rows.length === 0) return alert("Tidak ada data untuk diexport.");
  const keys = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [keys.join(",")].concat(rows.map(r => keys.map(k => escape(r[k])).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [students, setStudents] = useState(() => readLS("sa_students", [
    { id: uid(), name: "Andi Saputra", class: "7A" },
    { id: uid(), name: "Siti Aminah", class: "7B" },
    { id: uid(), name: "Budi Santoso", class: "8A" },
  ]));

  const [attendance, setAttendance] = useState(() => readLS("sa_attendance", []));
  const [violations, setViolations] = useState(() => readLS("sa_violations", []));
  const [violationTypes, setViolationTypes] = useState(() =>
    readLS("sa_violationTypes", [
      "Tidak memakai dasi",
      "Tidak memakai sabuk",
      "Rambut panjang",
      "Tidak memakai ciput (siswi)",
      "Berkelahi",
    ])
  );

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));
  const [query, setQuery] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [selectedStudentForViolation, setSelectedStudentForViolation] = useState("");
  const [selectedViolationType, setSelectedViolationType] = useState("");
  const [violationNote, setViolationNote] = useState("");
  const [newViolationTypeInput, setNewViolationTypeInput] = useState("");

  useEffect(() => writeLS("sa_students", students), [students]);
  useEffect(() => writeLS("sa_attendance", attendance), [attendance]);
  useEffect(() => writeLS("sa_violations", violations), [violations]);
  useEffect(() => writeLS("sa_violationTypes", violationTypes), [violationTypes]);

  const filteredStudents = useMemo(() =>
    students.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.class || "").toLowerCase().includes(query.toLowerCase())
    ), [students, query]);

  const attendanceForDate = attendance.filter(a => a.date === selectedDate);
  const violationsForDate = violations.filter(v => v.date === selectedDate);

  function addStudent(e) {
    e && e.preventDefault();
    if (!newStudentName.trim()) return alert("Nama siswa harus diisi");
    const s = { id: uid(), name: newStudentName.trim(), class: newStudentClass.trim() || "-" };
    setStudents(prev => [...prev, s]);
    setNewStudentName("");
    setNewStudentClass("");
  }

  function removeStudent(id) {
    if (!confirm("Hapus siswa ini beserta data terkait?")) return;
    setStudents(prev => prev.filter(s => s.id !== id));
    setAttendance(prev => prev.filter(a => a.studentId !== id));
    setViolations(prev => prev.filter(v => v.studentId !== id));
  }

  function setAttendanceFor(studentId, status) {
    const idx = attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    if (idx >= 0) {
      const copy = [...attendance];
      copy[idx] = { ...copy[idx], status };
      setAttendance(copy);
    } else {
      setAttendance(prev => [...prev, { id: uid(), studentId, date: selectedDate, status, note: "" }]);
    }
  }

  function addViolation(e) {
    e && e.preventDefault();
    if (!selectedStudentForViolation) return alert("Pilih siswa.");
    if (!selectedViolationType) return alert("Pilih jenis pelanggaran.");
    setViolations(prev => [...prev, {
      id: uid(),
      studentId: selectedStudentForViolation,
      date: selectedDate,
      type: selectedViolationType,
      note: violationNote || ""
    }]);
    setSelectedStudentForViolation("");
    setSelectedViolationType("");
    setViolationNote("");
  }

  function addViolationType() {
    const v = newViolationTypeInput.trim();
    if (!v) return;
    if (violationTypes.includes(v)) return alert("Jenis pelanggaran sudah ada.");
    setViolationTypes(prev => [...prev, v]);
    setNewViolationTypeInput("");
  }

  function removeViolation(id) {
    if (!confirm("Hapus catatan pelanggaran ini?")) return;
    setViolations(prev => prev.filter(v => v.id !== id));
  }

  function resetAllData() {
    if (!confirm("Reset semua data? Tindakan ini tidak dapat dibatalkan.")) return;
    setStudents([]);
    setAttendance([]);
    setViolations([]);
  }

  const statsAll = useMemo(() => {
    const map = {};
    for (const t of violationTypes) map[t] = 0;
    for (const v of violations) {
      map[v.type] = (map[v.type] || 0) + 1;
    }
    return map;
  }, [violations, violationTypes]);

  const statsToday = useMemo(() => {
    const map = {};
    for (const t of violationTypes) map[t] = 0;
    for (const v of violations.filter(x => x.date === selectedDate)) {
      map[v.type] = (map[v.type] || 0) + 1;
    }
    return map;
  }, [violations, selectedDate, violationTypes]);

  // JSX UI (isi tampilan utama)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ... seluruh JSX isi tampilan (sama seperti di file kamu sebelumnya) ... */}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);