// Data management layer using localStorage for Christ Attendance System

// Clear old localStorage values from version 1.0 to reload new Christ Attendance System data
if (localStorage.getItem("christ_attendance_version") !== "2.2") {
    localStorage.clear();
    localStorage.setItem("christ_attendance_version", "2.2");
}

const DEFAULT_STUDENTS = [
    // MCA A Students
    { id: "stud-1", name: "Amanda Kherr", email: "amanda.k@christ.edu", rollNo: "2621001", classId: "MCA A" },
    { id: "stud-2", name: "Angel Johnson", email: "angel.j@christ.edu", rollNo: "2621002", classId: "MCA A" },
    { id: "stud-3", name: "Alexander Kherr", email: "alex.k@christ.edu", rollNo: "2621003", classId: "MCA A" },
    { id: "stud-4", name: "Austin Kherr", email: "austin.k@christ.edu", rollNo: "2621004", classId: "MCA A" },
    { id: "stud-5", name: "Aada Kherr", email: "aada.k@christ.edu", rollNo: "2621005", classId: "MCA A" },
    { id: "stud-6", name: "Babak Kherr", email: "babak.k@christ.edu", rollNo: "2621006", classId: "MCA A" },

    // MCA B Students
    { id: "stud-7", name: "Baha Johnson", email: "baha.j@christ.edu", rollNo: "2621051", classId: "MCA B" },
    { id: "stud-8", name: "Babette Kherr", email: "babette.k@christ.edu", rollNo: "2621052", classId: "MCA B" },
    { id: "stud-9", name: "Badan Kherr", email: "badan.k@christ.edu", rollNo: "2621053", classId: "MCA B" },
    { id: "stud-10", name: "Bailee Kherr", email: "bailee.k@christ.edu", rollNo: "2621054", classId: "MCA B" },
    { id: "stud-11", name: "Charles Darwin", email: "charles.d@christ.edu", rollNo: "2621055", classId: "MCA B" },
    { id: "stud-12", name: "Chloe Bennett", email: "chloe.b@christ.edu", rollNo: "2621056", classId: "MCA B" },

    // MSC AI ML Students
    { id: "stud-13", name: "Daniel Craig", email: "daniel.c@christ.edu", rollNo: "2622101", classId: "MSC AI ML" },
    { id: "stud-14", name: "Daisy Ridley", email: "daisy.r@christ.edu", rollNo: "2622102", classId: "MSC AI ML" },
    { id: "stud-15", name: "Ethan Hunt", email: "ethan.h@christ.edu", rollNo: "2622103", classId: "MSC AI ML" },
    { id: "stud-16", name: "Emma Watson", email: "emma.w@christ.edu", rollNo: "2622104", classId: "MSC AI ML" },
    { id: "stud-17", name: "Franklin D", email: "franklin.d@christ.edu", rollNo: "2622105", classId: "MSC AI ML" },
    { id: "stud-18", name: "Fiona Gallagher", email: "fiona.g@christ.edu", rollNo: "2622106", classId: "MSC AI ML" }
];

// Initialize localStorage with dummy data if not already present
function initDatabase() {
    if (!localStorage.getItem("wdc_students")) {
        localStorage.setItem("wdc_students", JSON.stringify(DEFAULT_STUDENTS));
    }
    
    if (!localStorage.getItem("wdc_attendance")) {
        const mockAttendance = {};
        const students = DEFAULT_STUDENTS;
        const classes = ["MCA A", "MCA B", "MSC AI ML"];
        const subjects = {
            "MCA A": ["Web Technologies", "Python Programming", "Database Systems"],
            "MCA B": ["Web Technologies", "Python Programming", "Database Systems"],
            "MSC AI ML": ["Machine Learning", "Deep Learning", "Natural Language Processing"]
        };
        
        const statuses = ["P", "P", "P", "P", "P", "L", "A", "M", "I"]; // heavily weighted towards Present

        // Seed for 12 dates (excluding weekends)
        for (let i = 1; i <= 15; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const day = date.getDay();
            if (day === 0 || day === 6) continue; // skip weekends
            
            const dateStr = date.toISOString().split('T')[0];
            
            classes.forEach(classId => {
                const subjectList = subjects[classId];
                subjectList.forEach(subjectId => {
                    const key = `${dateStr}_${classId}_${subjectId}`;
                    const record = {};
                    
                    students.forEach(student => {
                        if (student.classId === classId) {
                            const randIdx = Math.floor(Math.random() * statuses.length);
                            record[student.id] = statuses[randIdx];
                        }
                    });
                    
                    mockAttendance[key] = record;
                });
            });
        }
        
        localStorage.setItem("wdc_attendance", JSON.stringify(mockAttendance));
    }

    if (!localStorage.getItem("wdc_teacher_profile")) {
        const teacherProfile = {
            name: "Dr. Sunny Joseph",
            designation: "Professor & Coordinator",
            email: "sunny.joseph@christ.edu",
            phone: "+91 80 4012 9100",
            department: "Department of Computer Science",
            avatar: "", // empty as requested
            classHandled: "MCA & MSC AI ML",
            subjectHandled: "Machine Learning & Python"
        };
        localStorage.setItem("wdc_teacher_profile", JSON.stringify(teacherProfile));
    }
}

// Data methods
const DB = {
    getStudents() {
        return JSON.parse(localStorage.getItem("wdc_students") || "[]");
    },
    
    getTeacherProfile() {
        return JSON.parse(localStorage.getItem("wdc_teacher_profile") || "{}");
    },

    saveTeacherProfile(profile) {
        localStorage.setItem("wdc_teacher_profile", JSON.stringify(profile));
    },
    
    getAttendance(dateStr, classId, subjectId) {
        const attendance = JSON.parse(localStorage.getItem("wdc_attendance") || "{}");
        const key = `${dateStr}_${classId}_${subjectId}`;
        return attendance[key] || null;
    },
    
    saveAttendance(dateStr, classId, subjectId, attendanceMap) {
        const attendance = JSON.parse(localStorage.getItem("wdc_attendance") || "{}");
        const key = `${dateStr}_${classId}_${subjectId}`;
        attendance[key] = attendanceMap;
        localStorage.setItem("wdc_attendance", JSON.stringify(attendance));
    },
    
    getStudentMetrics(studentId) {
        const attendance = JSON.parse(localStorage.getItem("wdc_attendance") || "{}");
        const students = this.getStudents();
        const student = students.find(s => s.id === studentId);
        
        if (!student) return null;
        
        let totalPresent = 0;
        let totalAbsent = 0; // Uninformed
        let totalLate = 0;
        let totalMedical = 0;
        let totalInformed = 0;
        let totalSessions = 0;
        
        const history = [];

        // Loop through all saved attendance entries to aggregate stats for this student
        for (const [key, records] of Object.entries(attendance)) {
            if (records[studentId]) {
                const [dateStr, classId, subjectId] = key.split('_');
                const status = records[studentId];
                
                totalSessions++;
                
                switch (status) {
                    case 'P':
                        totalPresent++;
                        break;
                    case 'A':
                        totalAbsent++;
                        break;
                    case 'L':
                        totalLate++;
                        break;
                    case 'M':
                        totalMedical++;
                        break;
                    case 'I':
                        totalInformed++;
                        break;
                }
                
                history.push({
                    date: dateStr,
                    classId,
                    subjectId,
                    status
                });
            }
        }
        
        // Sort history by date descending
        history.sort((a, b) => b.date.localeCompare(a.date));
        
        // Calculations for hours:
        // Present (P): 6 hours present, 0 hours absent
        // Late (L): 4 hours present, 2 hours absent
        // Absent (A) / Medical (M) / Informed (I): 0 hours present, 6 hours absent
        const hoursPresent = (totalPresent * 6) + (totalLate * 4);
        const hoursAbsent = (totalAbsent * 6) + (totalLate * 2) + (totalMedical * 6) + (totalInformed * 6);
        const totalHours = totalSessions * 6;
        
        // Percentage calculated by: (hoursPresent / totalHours) * 100
        const percentage = totalHours > 0 ? Math.round((hoursPresent / totalHours) * 100) : 100;
        
        return {
            student,
            percentage,
            hoursPresent,
            hoursAbsent,
            lateCount: totalLate,
            medicalCount: totalMedical,
            informedCount: totalInformed,
            uninformedCount: totalAbsent, // 'A' maps to uninformed
            totalSessions,
            history
        };
    }
};

// Initialize
initDatabase();
window.DB = DB;
