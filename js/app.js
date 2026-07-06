// Main App controller handling views, dates, and logic for Christ University Attendance System

document.addEventListener("DOMContentLoaded", () => {
    // Current state variables
    let currentDate = new Date(); // Defaults to today
    let currentClass = "MCA A";
    let currentSubject = "Web Technologies";
    
    let currentAttendanceMap = {}; // Temporary map of studentId -> status ('P', 'A', 'L', 'M', 'I')
    
    // Palette for student monograms
    const MONOGRAM_PALETTE = [
        "#4f46e5", // Indigo
        "#06b6d4", // Cyan
        "#10b981", // Emerald
        "#8b5cf6", // Violet
        "#ec4899", // Pink
        "#f59e0b", // Amber
        "#3b82f6", // Blue
        "#14b8a6", // Teal
        "#f43f5e", // Rose
        "#10b981"  // Green
    ];

    // Helper to get initials and color for monograms
    function getMonogramData(name) {
        const initials = name
            .split(' ')
            .filter(n => n.length > 0)
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
            
        // Calculate hash from name to get a consistent color index
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorIdx = Math.abs(hash) % MONOGRAM_PALETTE.length;
        const color = MONOGRAM_PALETTE[colorIdx];
        
        return { initials, color };
    }
    
    // Elements Cache
    const el = {
        pages: document.querySelectorAll(".page"),
        sidebarIconItems: document.querySelectorAll(".sidebar-icon-item"),
        sidebarMenuItems: document.querySelectorAll(".sidebar-menu-item"),
        userSummaryProfile: document.querySelector(".user-profile-summary"),
        
        // Header profile Elements
        hdrTeacherName: document.getElementById("hdr-teacher-name"),
        hdrTeacherRole: document.getElementById("hdr-teacher-role"),
        hdrTeacherAvatar: document.getElementById("hdr-teacher-avatar"),
        
        // Dashboard Elements
        dashTotalStudents: document.getElementById("dash-total-students"),
        dashAvgAttendance: document.getElementById("dash-avg-attendance"),
        dashTodayStatus: document.getElementById("dash-today-status"),
        dashTodayTime: document.getElementById("dash-today-time"),
        dashTeacherWelcome: document.getElementById("dash-teacher-welcome"),
        dashRecentSubmissionsBody: document.getElementById("dash-recent-submissions-body"),
        
        // Take Attendance Elements
        dateDisplayStr: document.getElementById("date-display-str"),
        prevDateBtn: document.getElementById("prev-date-btn"),
        nextDateBtn: document.getElementById("next-date-btn"),
        datePickerTrigger: document.getElementById("date-picker-trigger"),
        hiddenDatePicker: document.getElementById("hidden-date-picker"),
        
        selectClass: document.getElementById("select-class"),
        selectSubject: document.getElementById("select-subject"),
        takeAttendanceBtn: document.getElementById("take-attendance-btn"),
        attendanceStudentsContainer: document.getElementById("attendance-students-container"),
        
        // Reports Layout Elements
        btnClassReport: document.getElementById("btn-class-report"),
        btnStudentReport: document.getElementById("btn-student-report"),
        viewClassReport: document.getElementById("view-class-report"),
        viewStudentReport: document.getElementById("view-student-report"),
        btnBackToClass: document.getElementById("btn-back-to-class"),
        
        // Class Report Elements
        selectReportClass: document.getElementById("select-report-class"),
        classCircleFill: document.getElementById("class-circle-fill"),
        classPercentageVal: document.getElementById("class-percentage-val"),
        classStatusBadge: document.getElementById("class-status-badge"),
        
        classHoursPresent: document.getElementById("class-hours-present"),
        classHoursAbsent: document.getElementById("class-hours-absent"),
        classLateCount: document.getElementById("class-late-count"),
        classMedicalCount: document.getElementById("class-medical-count"),
        classInformedCount: document.getElementById("class-informed-count"),
        classUninformedCount: document.getElementById("class-uninformed-count"),
        classSummaryTableBody: document.getElementById("class-summary-table-body"),
        
        // Reports Individual Elements
        selectReportStudent: document.getElementById("select-report-student"),
        reportCircleFill: document.getElementById("report-circle-fill"),
        reportPercentageVal: document.getElementById("report-percentage-val"),
        reportStatusBadge: document.getElementById("report-status-badge"),
        
        repHoursPresent: document.getElementById("rep-hours-present"),
        repHoursAbsent: document.getElementById("rep-hours-absent"),
        repLateCount: document.getElementById("rep-late-count"),
        repMedicalCount: document.getElementById("rep-medical-count"),
        repInformedCount: document.getElementById("rep-informed-count"),
        repUninformedCount: document.getElementById("rep-uninformed-count"),
        reportHistoryTableBody: document.getElementById("report-history-table-body"),
        
        // Profile Elements
        profAvatar: document.getElementById("prof-avatar"),
        profName: document.getElementById("prof-name"),
        profDesignation: document.getElementById("prof-designation"),
        profEmail: document.getElementById("prof-email"),
        profPhone: document.getElementById("prof-phone"),
        profDepartment: document.getElementById("prof-department"),
        
        // Edit Profile Form Elements
        editProfileForm: document.getElementById("edit-profile-form"),
        inputName: document.getElementById("input-name"),
        inputEmail: document.getElementById("input-email"),
        inputPhone: document.getElementById("input-phone"),
        inputDesignation: document.getElementById("input-designation"),
        inputClass: document.getElementById("input-class"),
        inputSubject: document.getElementById("input-subject"),
        
        toastContainer: document.getElementById("toast-container")
    };

    // --- TAB SYSTEM ---
    function switchTab(targetId) {
        // Update active class on pages
        el.pages.forEach(page => {
            page.classList.remove("active");
            if (page.id === `page-${targetId}`) {
                page.classList.add("active");
            }
        });
        
        // Update sidebar visual active states
        el.sidebarIconItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("data-target") === targetId) {
                item.classList.add("active");
            }
        });
        
        el.sidebarMenuItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("data-target") === targetId) {
                item.classList.add("active");
            }
        });
        
        // Trigger specific logic per tab
        if (targetId === "dashboard") {
            renderDashboard();
        } else if (targetId === "attendance") {
            updateSubjectDropdown();
            renderAttendanceSheet();
        } else if (targetId === "reports") {
            switchReportSubView("class");
        } else if (targetId === "profile") {
            populateProfileDetails();
        }
    }
    
    // Set up click listeners for tabs
    el.sidebarIconItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            switchTab(target);
        });
    });
    
    el.sidebarMenuItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            switchTab(target);
        });
    });

    el.userSummaryProfile.addEventListener("click", () => {
        switchTab("profile");
    });

    // --- TOAST NOTIFICATIONS ---
    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        let iconHtml = '<i class="fa-solid fa-circle-check"></i>';
        if (type === "info") {
            iconHtml = '<i class="fa-solid fa-circle-info"></i>';
        }
        
        toast.innerHTML = `${iconHtml} <span>${message}</span>`;
        el.toastContainer.appendChild(toast);
        
        // Animate slide out and remove
        setTimeout(() => {
            toast.style.animation = "slideInRight 0.3s reverse forwards";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- DATE FORMATTER & NAVIGATOR ---
    function formatDateDisplay(dateObj) {
        const today = new Date();
        const isToday = dateObj.toDateString() === today.toDateString();
        
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        const dateStr = dateObj.toLocaleDateString('en-US', options);
        
        return isToday ? `Today ${dateStr}` : dateStr;
    }
    
    function updateDateUI() {
        el.dateDisplayStr.textContent = formatDateDisplay(currentDate);
        renderAttendanceSheet();
    }
    
    el.prevDateBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateUI();
    });
    
    el.nextDateBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateUI();
    });
    
    el.datePickerTrigger.addEventListener("click", () => {
        el.hiddenDatePicker.showPicker();
    });
    
    el.hiddenDatePicker.addEventListener("change", (e) => {
        if (e.target.value) {
            currentDate = new Date(e.target.value);
            updateDateUI();
        }
    });

    // --- SUBJECT DROPDOWN SYNC ---
    function updateSubjectDropdown() {
        const subjects = {
            "MCA A": ["Web Technologies", "Python Programming", "Database Systems"],
            "MCA B": ["Web Technologies", "Python Programming", "Database Systems"],
            "MSC AI ML": ["Machine Learning", "Deep Learning", "Natural Language Processing"]
        };
        
        const list = subjects[currentClass] || [];
        const prevVal = el.selectSubject.value;
        el.selectSubject.innerHTML = "";
        
        list.forEach(sub => {
            const opt = document.createElement("option");
            opt.value = sub;
            opt.textContent = sub;
            el.selectSubject.appendChild(opt);
        });
        
        // Re-apply previous value if valid, otherwise select first
        if (list.includes(prevVal)) {
            el.selectSubject.value = prevVal;
        } else if (list.length > 0) {
            el.selectSubject.value = list[0];
        }
        
        currentSubject = el.selectSubject.value;
    }

    // --- ATTENDANCE sheet CONTROLLER ---
    function renderAttendanceSheet() {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Fetch existing attendance if any
        const saved = DB.getAttendance(dateStr, currentClass, currentSubject);
        const students = DB.getStudents().filter(s => s.classId === currentClass);
        
        // Reset current map
        currentAttendanceMap = {};
        
        if (saved) {
            currentAttendanceMap = { ...saved };
        } else {
            // Default everyone to present ('P') as convenience
            students.forEach(s => {
                currentAttendanceMap[s.id] = 'P';
            });
        }
        
        // Sort students alphabetically
        students.sort((a, b) => a.name.localeCompare(b.name));
        
        // Group by alphabet letter
        const groups = {};
        students.forEach(s => {
            const firstLetter = s.name.charAt(0).toUpperCase();
            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter].push(s);
        });
        
        // Render
        el.attendanceStudentsContainer.innerHTML = "";
        
        if (students.length === 0) {
            el.attendanceStudentsContainer.innerHTML = `
                <div style="background-color:#ffffff; padding:40px; text-align:center; border-radius:var(--radius-md); color:var(--text-secondary); box-shadow:var(--shadow-sm); border:1px solid var(--border-color);">
                    <i class="fa-regular fa-folder-open" style="font-size:32px; color:var(--text-muted); margin-bottom:15px; display:block;"></i>
                    No students found in Class ${currentClass}.
                </div>
            `;
            return;
        }

        const sortedLetters = Object.keys(groups).sort();
        sortedLetters.forEach(letter => {
            const groupDiv = document.createElement("div");
            groupDiv.className = "alphabet-group-container";
            
            groupDiv.innerHTML = `<h2 class="alphabet-header">${letter}</h2>`;
            
            const gridDiv = document.createElement("div");
            gridDiv.className = "student-grid";
            
            groups[letter].forEach(student => {
                const activeStatus = currentAttendanceMap[student.id] || 'P';
                const monogram = getMonogramData(student.name);
                
                const card = document.createElement("div");
                card.className = "student-card";
                card.setAttribute("data-student-id", student.id);
                
                // Add status indicator pill on the top right
                let pillHtml = "";
                if (saved) {
                    pillHtml = `<span class="card-status-pill ${activeStatus.toLowerCase()}">${getStatusName(activeStatus)}</span>`;
                }
                
                card.innerHTML = `
                    ${pillHtml}
                    <div class="card-avatar-wrapper">
                        <div class="card-avatar-monogram" style="background-color: ${monogram.color};">${monogram.initials}</div>
                    </div>
                    <h3 class="card-student-name">${student.name}</h3>
                    <div class="card-toggles-row">
                        <button class="status-toggle ${activeStatus === 'P' ? 'active' : ''}" data-status="P" data-tooltip="Present">P</button>
                        <button class="status-toggle ${activeStatus === 'A' ? 'active' : ''}" data-status="A" data-tooltip="Absent (Uninformed)">A</button>
                        <button class="status-toggle ${activeStatus === 'L' ? 'active' : ''}" data-status="L" data-tooltip="Late Arrival">L</button>
                        <button class="status-toggle ${activeStatus === 'M' ? 'active' : ''}" data-status="M" data-tooltip="Medical Leave">M</button>
                        <button class="status-toggle ${activeStatus === 'I' ? 'active' : ''}" data-status="I" data-tooltip="Informed Leave">I</button>
                    </div>
                `;
                
                // Set up click triggers for toggles
                const toggles = card.querySelectorAll(".status-toggle");
                toggles.forEach(toggle => {
                    toggle.addEventListener("click", () => {
                        toggles.forEach(t => t.classList.remove("active"));
                        toggle.classList.add("active");
                        
                        const selectedStatus = toggle.getAttribute("data-status");
                        currentAttendanceMap[student.id] = selectedStatus;
                        
                        // Remove the saved indicator pill until user submits
                        const existingPill = card.querySelector(".card-status-pill");
                        if (existingPill) existingPill.remove();
                    });
                });
                
                gridDiv.appendChild(card);
            });
            
            groupDiv.appendChild(gridDiv);
            el.attendanceStudentsContainer.appendChild(groupDiv);
        });
    }

    function getStatusName(status) {
        switch (status) {
            case 'P': return 'Present';
            case 'A': return 'Absent';
            case 'L': return 'Late';
            case 'M': return 'Medical';
            case 'I': return 'Informed';
            default: return '';
        }
    }

    // Filter Change Listeners
    el.selectClass.addEventListener("change", (e) => {
        currentClass = e.target.value;
        updateSubjectDropdown();
        renderAttendanceSheet();
    });
    
    el.selectSubject.addEventListener("change", (e) => {
        currentSubject = e.target.value;
        renderAttendanceSheet();
    });

    // Save/Submit Button Event
    el.takeAttendanceBtn.addEventListener("click", () => {
        const dateStr = currentDate.toISOString().split('T')[0];
        DB.saveAttendance(dateStr, currentClass, currentSubject, currentAttendanceMap);
        
        showToast(`Attendance saved: ${currentClass} (${currentSubject})`);
        renderAttendanceSheet(); // Refresh grid with status pills
    });

    // --- REPORTS DUAL VIEW SYSTEM ---
    function switchReportSubView(viewType) {
        if (viewType === "class") {
            el.btnClassReport.classList.add("active");
            el.btnClassReport.style.backgroundColor = "#2e37a4";
            el.btnClassReport.style.color = "#ffffff";
            
            el.btnStudentReport.classList.remove("active");
            el.btnStudentReport.style.backgroundColor = "transparent";
            el.btnStudentReport.style.color = "var(--text-secondary)";
            
            el.viewClassReport.style.display = "block";
            el.viewStudentReport.style.display = "none";
            
            renderClassReport();
        } else {
            el.btnStudentReport.classList.add("active");
            el.btnStudentReport.style.backgroundColor = "#2e37a4";
            el.btnStudentReport.style.color = "#ffffff";
            
            el.btnClassReport.classList.remove("active");
            el.btnClassReport.style.backgroundColor = "transparent";
            el.btnClassReport.style.color = "var(--text-secondary)";
            
            el.viewClassReport.style.display = "none";
            el.viewStudentReport.style.display = "block";
            
            populateReportStudentsDropdown();
            renderReportDetails();
        }
    }
    
    el.btnClassReport.addEventListener("click", () => switchReportSubView("class"));
    el.btnStudentReport.addEventListener("click", () => switchReportSubView("student"));
    el.btnBackToClass.addEventListener("click", () => switchReportSubView("class"));

    // --- CLASS REPORT CONTROLLER ---
    function renderClassReport() {
        const selectedClass = el.selectReportClass.value;
        const students = DB.getStudents().filter(s => s.classId === selectedClass);
        
        if (students.length === 0) {
            el.classSummaryTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">
                        No student summary data available for this class.
                    </td>
                </tr>
            `;
            return;
        }
        
        let classSumPercentage = 0;
        let classTotalHoursPresent = 0;
        let classTotalHoursAbsent = 0;
        let classTotalLateCount = 0;
        let classTotalMedicalCount = 0;
        let classTotalInformedCount = 0;
        let classTotalUninformedCount = 0;
        let activeStudents = 0;
        
        const summaryRows = [];
        
        students.forEach(student => {
            const metrics = DB.getStudentMetrics(student.id);
            if (metrics) {
                classSumPercentage += metrics.percentage;
                classTotalHoursPresent += metrics.hoursPresent;
                classTotalHoursAbsent += metrics.hoursAbsent;
                classTotalLateCount += metrics.lateCount;
                classTotalMedicalCount += metrics.medicalCount;
                classTotalInformedCount += metrics.informedCount;
                classTotalUninformedCount += metrics.uninformedCount;
                activeStudents++;
                
                summaryRows.push({
                    id: student.id,
                    name: student.name,
                    rollNo: student.rollNo,
                    percentage: metrics.percentage,
                    hoursPresent: metrics.hoursPresent,
                    hoursAbsent: metrics.hoursAbsent,
                    lateCount: metrics.lateCount,
                    m: metrics.medicalCount,
                    i: metrics.informedCount,
                    u: metrics.uninformedCount
                });
            }
        });
        
        // Calculate Class Average
        const classAvg = activeStudents > 0 ? Math.round(classSumPercentage / activeStudents) : 0;
        
        // Draw Class progress circle
        const circumference = 439.6;
        const offset = circumference - (classAvg / 100) * circumference;
        el.classCircleFill.style.strokeDashoffset = offset;
        el.classPercentageVal.textContent = `${classAvg}%`;
        
        // Badge style
        el.classStatusBadge.className = "status-label-badge";
        if (classAvg >= 90) {
            el.classStatusBadge.textContent = "Excellent Average";
            el.classStatusBadge.classList.add("excellent");
        } else if (classAvg >= 75) {
            el.classStatusBadge.textContent = "Good Average";
            el.classStatusBadge.classList.add("good");
        } else if (classAvg >= 60) {
            el.classStatusBadge.textContent = "Borderline Average";
            el.classStatusBadge.classList.add("warning");
        } else {
            el.classStatusBadge.textContent = "Needs Intervention";
            el.classStatusBadge.classList.add("critical");
        }
        
        // Set Class totals cards
        el.classHoursPresent.textContent = `${classTotalHoursPresent} hrs`;
        el.classHoursAbsent.textContent = `${classTotalHoursAbsent} hrs`;
        el.classLateCount.textContent = classTotalLateCount;
        el.classMedicalCount.textContent = classTotalMedicalCount;
        el.classInformedCount.textContent = classTotalInformedCount;
        el.classUninformedCount.textContent = classTotalUninformedCount;
        
        // Sort rows by name
        summaryRows.sort((a, b) => a.name.localeCompare(b.name));
        
        // Populate Class summary table
        el.classSummaryTableBody.innerHTML = "";
        summaryRows.forEach(row => {
            const tr = document.createElement("tr");
            const monogram = getMonogramData(row.name);
            
            // Format percentage styling
            let pctClass = "present";
            if (row.percentage < 60) pctClass = "absent";
            else if (row.percentage < 75) pctClass = "late";
            
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="user-avatar-monogram" style="background-color: ${monogram.color}; font-size:12px; width:30px; height:30px;">${monogram.initials}</div>
                        <strong>${row.name}</strong>
                    </div>
                </td>
                <td>${row.rollNo}</td>
                <td><span class="status-badge ${pctClass}">${row.percentage}%</span></td>
                <td>${row.hoursPresent} hrs</td>
                <td>${row.hoursAbsent} hrs</td>
                <td>${row.lateCount}</td>
                <td style="font-size:12px; color:var(--text-secondary);">
                    M: ${row.m} | I: ${row.i} | U: ${row.u}
                </td>
                <td>
                    <button class="btn-primary btn-drilldown" data-student-id="${row.id}" style="padding:6px 12px; font-size:11px; height:auto; border-radius:12px;">
                        <i class="fa-solid fa-chart-simple"></i> View
                    </button>
                </td>
            `;
            
            // Drill down action handler
            tr.querySelector(".btn-drilldown").addEventListener("click", () => {
                // Change dropdown selection
                el.selectReportStudent.value = row.id;
                // Switch sub-view
                switchReportSubView("student");
            });
            
            el.classSummaryTableBody.appendChild(tr);
        });
    }

    el.selectReportClass.addEventListener("change", renderClassReport);

    // --- REPORTS INDIVIDUAL VIEW CONTROLLER ---
    function populateReportStudentsDropdown() {
        const students = DB.getStudents();
        students.sort((a, b) => a.name.localeCompare(b.name));
        
        const currentValue = el.selectReportStudent.value;
        el.selectReportStudent.innerHTML = "";
        
        students.forEach(student => {
            const option = document.createElement("option");
            option.value = student.id;
            option.textContent = `${student.name} (${student.classId} - Roll: ${student.rollNo})`;
            el.selectReportStudent.appendChild(option);
        });
        
        // Maintain selection if still valid
        if (currentValue && students.find(s => s.id === currentValue)) {
            el.selectReportStudent.value = currentValue;
        } else if (students.length > 0) {
            el.selectReportStudent.value = students[0].id;
        }
    }

    function renderReportDetails() {
        const studentId = el.selectReportStudent.value;
        if (!studentId) return;
        
        const metrics = DB.getStudentMetrics(studentId);
        if (!metrics) return;
        
        // Circular Progress Ring calculation
        const circumference = 439.6;
        const percentage = metrics.percentage;
        const offset = circumference - (percentage / 100) * circumference;
        
        el.reportCircleFill.style.strokeDashoffset = offset;
        el.reportPercentageVal.textContent = `${percentage}%`;
        
        // Set Badge styling based on level
        el.reportStatusBadge.className = "status-label-badge";
        if (percentage >= 90) {
            el.reportStatusBadge.textContent = "Excellent";
            el.reportStatusBadge.classList.add("excellent");
        } else if (percentage >= 75) {
            el.reportStatusBadge.textContent = "Good Progress";
            el.reportStatusBadge.classList.add("good");
        } else if (percentage >= 60) {
            el.reportStatusBadge.textContent = "Needs Attention";
            el.reportStatusBadge.classList.add("warning");
        } else {
            el.reportStatusBadge.textContent = "Critical Level";
            el.reportStatusBadge.classList.add("critical");
        }
        
        // Update stat cards
        el.repHoursPresent.textContent = `${metrics.hoursPresent} hrs`;
        el.repHoursAbsent.textContent = `${metrics.hoursAbsent} hrs`;
        el.repLateCount.textContent = metrics.lateCount;
        el.repMedicalCount.textContent = metrics.medicalCount;
        el.repInformedCount.textContent = metrics.informedCount;
        el.repUninformedCount.textContent = metrics.uninformedCount;
        
        // Populate historical log table
        el.reportHistoryTableBody.innerHTML = "";
        if (metrics.history.length === 0) {
            el.reportHistoryTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">
                        No historical attendance records found for this student.
                    </td>
                </tr>
            `;
            return;
        }
        
        metrics.history.forEach(log => {
            const tr = document.createElement("tr");
            
            // Format Log Date
            const logDate = new Date(log.date);
            const dateStrFormatted = logDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' });
            
            let statusBadgeClass = "";
            let statusText = "";
            let hoursLogged = "0 hrs";
            let details = "";
            
            switch (log.status) {
                case 'P':
                    statusBadgeClass = "present";
                    statusText = "Present";
                    hoursLogged = "6 hrs";
                    details = "Attended full daily sessions";
                    break;
                case 'A':
                    statusBadgeClass = "absent";
                    statusText = "Absent";
                    hoursLogged = "0 hrs";
                    details = "Uninformed / Unexcused absence";
                    break;
                case 'L':
                    statusBadgeClass = "late";
                    statusText = "Late Arrival";
                    hoursLogged = "4 hrs";
                    details = "Late Arrival (2 Hours Missed)";
                    break;
                case 'M':
                    statusBadgeClass = "medical";
                    statusText = "Medical Leave";
                    hoursLogged = "0 hrs";
                    details = "Excused - Medical Certificate Filed";
                    break;
                case 'I':
                    statusBadgeClass = "informed";
                    statusText = "Informed Leave";
                    hoursLogged = "0 hrs";
                    details = "Excused - Parent Note Approved";
                    break;
            }
            
            tr.innerHTML = `
                <td><strong>${dateStrFormatted}</strong></td>
                <td>${log.classId}</td>
                <td>${log.subjectId}</td>
                <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
                <td>${hoursLogged}</td>
                <td style="color:var(--text-secondary); font-size:13px;">${details}</td>
            `;
            
            el.reportHistoryTableBody.appendChild(tr);
        });
    }

    el.selectReportStudent.addEventListener("change", renderReportDetails);

    // --- PROFILE CONTROLLER ---
    function populateProfileDetails() {
        const teacher = DB.getTeacherProfile();
        const monogram = getMonogramData(teacher.name);
        
        // Headers
        el.hdrTeacherName.textContent = teacher.name;
        el.hdrTeacherRole.textContent = teacher.designation;
        
        el.hdrTeacherAvatar.textContent = monogram.initials;
        el.hdrTeacherAvatar.style.backgroundColor = monogram.color;
        
        // Left Profile Card
        el.profAvatar.textContent = monogram.initials;
        el.profAvatar.style.backgroundColor = monogram.color;
        el.profName.textContent = teacher.name;
        el.profDesignation.textContent = teacher.designation;
        el.profEmail.textContent = teacher.email;
        el.profPhone.textContent = teacher.phone;
        el.profDepartment.textContent = teacher.department;
        
        // Input fields for edit form
        el.inputName.value = teacher.name;
        el.inputEmail.value = teacher.email;
        el.inputPhone.value = teacher.phone;
        el.inputDesignation.value = teacher.designation;
        el.inputClass.value = teacher.classHandled;
        el.inputSubject.value = teacher.subjectHandled;
    }
    
    // Save Profile Form Submission
    el.editProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const teacher = DB.getTeacherProfile();
        
        teacher.name = el.inputName.value;
        teacher.email = el.inputEmail.value;
        teacher.phone = el.inputPhone.value;
        teacher.designation = el.inputDesignation.value;
        teacher.classHandled = el.inputClass.value;
        teacher.subjectHandled = el.inputSubject.value;
        
        DB.saveTeacherProfile(teacher);
        
        // Refresh profile info
        populateProfileDetails();
        showToast("Profile details updated successfully!");
    });

    // --- DASHBOARD CONTROLLER ---
    function renderDashboard() {
        const students = DB.getStudents();
        const teacher = DB.getTeacherProfile();
        
        el.dashTotalStudents.textContent = students.length;
        el.dashTeacherWelcome.textContent = teacher.name;
        
        // Calc average attendance rate
        let cumulativePercentage = 0;
        let countedStudents = 0;
        
        students.forEach(student => {
            const metrics = DB.getStudentMetrics(student.id);
            if (metrics && metrics.totalSessions > 0) {
                cumulativePercentage += metrics.percentage;
                countedStudents++;
            }
        });
        
        const avgAttendance = countedStudents > 0 ? Math.round(cumulativePercentage / countedStudents) : 92;
        el.dashAvgAttendance.textContent = `${avgAttendance}%`;
        
        // Today's status check
        const dateTodayStr = new Date().toISOString().split('T')[0];
        const todayAttendance = DB.getAttendance(dateTodayStr, "MCA A", "Web Technologies");
        
        if (todayAttendance) {
            el.dashTodayStatus.textContent = "Recorded";
            el.dashTodayStatus.style.color = "var(--success)";
            el.dashTodayTime.textContent = "Submitted today";
        } else {
            el.dashTodayStatus.textContent = "Pending";
            el.dashTodayStatus.style.color = "var(--warning)";
            el.dashTodayTime.textContent = "Awaiting sheets";
        }
        
        // Render Recent Submissions (Read from DB keys)
        const attendance = JSON.parse(localStorage.getItem("wdc_attendance") || "{}");
        const submissionKeys = Object.keys(attendance);
        
        // Sort keys by date desc
        submissionKeys.sort((a, b) => b.localeCompare(a));
        
        el.dashRecentSubmissionsBody.innerHTML = "";
        
        const recentSubmissions = submissionKeys.slice(0, 5); // display 5 records
        
        if (recentSubmissions.length === 0) {
            el.dashRecentSubmissionsBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">
                        No attendance records recorded yet.
                    </td>
                </tr>
            `;
            return;
        }
        
        recentSubmissions.forEach(key => {
            const [dateStr, classId, subjectId] = key.split('_');
            const records = attendance[key];
            const totalCount = Object.keys(records).length;
            
            const tr = document.createElement("tr");
            
            // Format date nicely
            const subDate = new Date(dateStr);
            const dateStrFormatted = subDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
            
            tr.innerHTML = `
                <td><strong>${dateStrFormatted}</strong></td>
                <td>${classId}</td>
                <td>${subjectId}</td>
                <td>${totalCount} Students</td>
                <td><span class="status-badge present">Submitted</span></td>
            `;
            el.dashRecentSubmissionsBody.appendChild(tr);
        });
    }

    // Toggle Sidebar collapse/expand animation
    const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn");
    
    toggleSidebarBtn.addEventListener("click", () => {
        const textBar = document.querySelector(".sidebar-text-bar");
        if (textBar.style.display === "none") {
            textBar.style.display = "flex";
        } else {
            textBar.style.display = "none";
        }
    });

    // Initialize Page
    switchTab("dashboard");
    populateProfileDetails();
});
