// Prestige Realty Group - HR Management System
// ============================================
// Dynamic version - uses API instead of localStorage

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initModals();
    initFilters();
    initSearch();
    initTables();
    initNotifications();
    loadAllData();
});

// ============================================
// DATA LOADING (from API)
// ============================================
var appData = {};

async function loadAllData() {
    try {
        var results = await Promise.allSettled([
            API.getCompany(),
            API.getEmployees(),
            API.getSalaryEntries(),
            API.getBenefits(),
            API.getApplicants(),
            API.getMetrics(),
            API.getSeniors(),
            API.getEmployeeIds(),
            API.getJobBudgets(),
            API.getProjectBudgets(),
            API.getPositions(),
            API.getRecruitingStats(),
            API.getProperties(),
            API.getHiringTrends(),
            API.getAgentPerformance()
        ]);

        appData.company = results[0].status === 'fulfilled' ? results[0].value.company : {};
        appData.employees = results[1].status === 'fulfilled' ? results[1].value.employees : [];
        appData.salaryEntries = results[2].status === 'fulfilled' ? results[2].value.entries : [];
        appData.benefitPlans = results[3].status === 'fulfilled' ? results[3].value.benefits : [];
        appData.applicants = results[4].status === 'fulfilled' ? results[4].value.applicants : [];
        appData.reportMetrics = results[5].status === 'fulfilled' ? results[5].value.metrics : [];
        appData.seniors = results[6].status === 'fulfilled' ? results[6].value.seniors : [];
        appData.employeeIds = results[7].status === 'fulfilled' ? results[7].value.employeeIds : [];
        appData.jobBudgets = results[8].status === 'fulfilled' ? results[8].value.jobs : [];
        appData.projectBudgets = results[9].status === 'fulfilled' ? results[9].value.projects : [];
        appData.openPositions = results[10].status === 'fulfilled' ? results[10].value.positions : [];
        appData.recruitingStats = results[11].status === 'fulfilled' ? results[11].value.stats : {};
        appData.properties = results[12].status === 'fulfilled' ? results[12].value.properties : [];
        appData.hiringTrends = results[13].status === 'fulfilled' ? results[13].value.trends : [];
        appData.agentPerformance = results[14].status === 'fulfilled' ? results[14].value.agents : [];

        initCompanyInfoForm();
        initSalaryEntryForm();
        initBenefitPlanForm();
        initApplicantForm();
        initReportMetricForm();
        initEmployeeTableActions();
        updateDashboardStats();
        renderSeniorTable();
        updateSeniorStats();
        updateDeductionStats();
        initRecruitingStats();
        renderOpenPositionsTable();
        renderJobBudgetTable();
        renderProjectBudgetTable();
        updateBudgetSummary();
        renderEmployeeIdTable();
        renderPropertyGrid();
        updatePropertyStats();
        renderReportsPage();
        generateNotifications();
    } catch (err) {
        console.error('Failed to load data:', err);
    }
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================
function initMobileMenu() {
    var btn = document.querySelector('.mobile-menu-btn');
    var sidebar = document.querySelector('.sidebar');
    if (btn && sidebar) {
        btn.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================
function initModals() {
    document.querySelectorAll('[data-modal]').forEach(function(trigger) {
        trigger.addEventListener('click', function() {
            var modalId = this.getAttribute('data-modal');
            var modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(function(el) {
        el.addEventListener('click', function(e) {
            if (e.target === this || this.classList.contains('modal-close')) {
                var overlay = this.closest('.modal-overlay') || this;
                if (overlay && overlay.classList.contains('modal-overlay')) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });
    document.querySelectorAll('.btn-cancel').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var overlay = this.closest('.modal-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(function(overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

// ============================================
// FILTER BUTTONS
// ============================================
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var group = this.closest('.toolbar-left');
            if (group) {
                group.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
            }
            this.classList.add('active');
        });
    });
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function initSearch() {
    var searchInput = document.querySelector('.header-search input');
    if (!searchInput) return;
    searchInput.addEventListener('input', debounce(function() {
        var query = this.value.toLowerCase().trim();
        document.querySelectorAll('.data-table tbody tr').forEach(function(row) {
            var text = row.textContent.toLowerCase();
            row.style.display = query === '' || text.includes(query) ? '' : 'none';
        });
    }, 300));
}

// ============================================
// TABLE ROW SELECTION
// ============================================
function initTables() {
    document.querySelectorAll('.data-table tbody tr').forEach(function(row) {
        row.addEventListener('click', function(e) {
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return;
            this.classList.toggle('selected');
        });
    });
}

// ============================================
// NOTIFICATIONS (Dynamic from data)
// ============================================
function initNotifications() {
    generateNotifications();
}

function generateNotifications() {
    var btn = document.getElementById('notificationBtn');
    var dot = document.getElementById('notificationDot');
    var dropdown = document.getElementById('notificationDropdown');
    if (!btn || !dropdown) return;

    var notifications = [];

    var employees = appData.employees || [];
    var applicants = appData.applicants || [];
    var positions = appData.openPositions || [];
    var properties = appData.properties || [];

    var newApplicants = applicants.filter(function(a) { return a.status === 'New'; });
    if (newApplicants.length > 0) {
        newApplicants.slice(0, 3).forEach(function(a) {
            notifications.push({
                type: 'blue',
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
                text: '<strong>' + a.name + '</strong> applied for ' + (a.position || 'a position'),
                time: a.created_at ? formatRelativeTime(a.created_at) : 'Recently',
                link: 'recruiting.html'
            });
        });
    }

    var interviewApps = applicants.filter(function(a) { return a.status === 'Interview Scheduled'; });
    if (interviewApps.length > 0) {
        notifications.push({
            type: 'green',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
            text: '<strong>' + interviewApps.length + ' interview' + (interviewApps.length > 1 ? 's' : '') + '</strong> scheduled',
            time: 'Upcoming',
            link: 'recruiting.html'
        });
    }

    var offerApps = applicants.filter(function(a) { return a.status === 'Offer Sent'; });
    if (offerApps.length > 0) {
        notifications.push({
            type: 'gold',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
            text: '<strong>' + offerApps.length + ' offer' + (offerApps.length > 1 ? 's' : '') + '</strong> pending response',
            time: 'Pending',
            link: 'recruiting.html'
        });
    }

    if (positions.length > 0) {
        notifications.push({
            type: 'orange',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
            text: '<strong>' + positions.length + ' open position' + (positions.length > 1 ? 's' : '') + '</strong> need attention',
            time: 'Active',
            link: 'recruiting.html'
        });
    }

    var forSale = properties.filter(function(p) { return p.status === 'for-sale'; }).length;
    if (forSale > 0) {
        notifications.push({
            type: 'blue',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
            text: '<strong>' + forSale + ' propert' + (forSale > 1 ? 'ies' : 'y') + '</strong> listed for sale',
            time: 'Active',
            link: 'properties.html'
        });
    }

    var activeEmps = employees.filter(function(e) { return e.status === 'Active'; }).length;
    if (activeEmps > 0) {
        notifications.push({
            type: 'green',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
            text: '<strong>' + activeEmps + ' active employee' + (activeEmps > 1 ? 's' : '') + '</strong> on payroll',
            time: 'Overview',
            link: 'employees.html'
        });
    }

    if (dot) {
        dot.style.display = notifications.length > 0 ? 'block' : 'none';
    }

    if (notifications.length === 0) {
        dropdown.innerHTML = '<div class="notification-empty">No notifications</div>';
    } else {
        var html = '<div class="notification-header"><strong>Notifications</strong><span class="notification-count">' + notifications.length + '</span></div>';
        notifications.forEach(function(n) {
            html += '<a href="' + n.link + '" class="notification-item">' +
                '<div class="notification-icon ' + n.type + '">' + n.icon + '</div>' +
                '<div class="notification-text">' + n.text + '<span class="notification-time">' + n.time + '</span></div>' +
            '</a>';
        });
        dropdown.innerHTML = html;
    }

    btn.onclick = function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    };

    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// ============================================
// COMPANY INFO FORM (Dashboard)
// ============================================
function initCompanyInfoForm() {
    var form = document.getElementById('companyInfoForm');
    if (!form) return;
    var info = appData.company || {};
    var nameInput = form.querySelector('[name="companyName"]');
    var empInput = form.querySelector('[name="totalEmployees"]');
    var addrInput = form.querySelector('[name="companyAddress"]');
    var phoneInput = form.querySelector('[name="companyPhone"]');
    if (nameInput) nameInput.value = info.name || '';
    if (empInput) empInput.value = info.total_employees || '';
    if (addrInput) addrInput.value = info.address || '';
    if (phoneInput) phoneInput.value = info.phone || '';
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        try {
            await API.saveCompany({
                name: fd.get('companyName'),
                totalEmployees: parseInt(fd.get('totalEmployees')) || 0,
                address: fd.get('companyAddress'),
                phone: fd.get('companyPhone')
            });
            updateDashboardStats();
            showSuccess('Company information saved successfully!');
        } catch (err) {
            showSuccess('Error saving: ' + err.message);
        }
    });
}

// ============================================
// ADD EMPLOYEE FORM (Employees page)
// ============================================
async function handleAddEmployee(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var name = fd.get('name');
    if (!name) return;
    try {
        await API.addEmployee({
            name: name,
            email: fd.get('email') || '',
            department: fd.get('department') || '',
            position: fd.get('position') || '',
            startDate: fd.get('startDate') || '',
            salary: parseInt(fd.get('salary')) || 0,
            status: 'Active',
            deductions: {
                income_tax: parseFloat(fd.get('deductionIncomeTax')) || 0,
                social_security: parseFloat(fd.get('deductionSocialSecurity')) || 0,
                medicare: parseFloat(fd.get('deductionMedicare')) || 0,
                health_insurance: parseFloat(fd.get('deductionHealth')) || 0,
                retirement_401k: parseFloat(fd.get('deduction401k')) || 0,
                custom: parseFloat(fd.get('deductionCustom')) || 0
            }
        });
        var data = await API.getEmployees();
        appData.employees = data.employees;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        form.reset();
        showSuccess('Employee "' + name + '" added successfully!');
        renderEmployeeTable();
        updateDashboardStats();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

// ============================================
// EDIT EMPLOYEE
// ============================================
function editEmployee(id) {
    var emp = appData.employees.find(function(e) { return e.id === id; });
    if (!emp) return;
    var modal = document.getElementById('editEmployeeModal');
    if (!modal) return;
    var d = emp.deductions || {};
    modal.querySelector('[name="editEmpId"]').value = id;
    modal.querySelector('[name="editName"]').value = emp.name;
    modal.querySelector('[name="editEmail"]').value = emp.email || '';
    modal.querySelector('[name="editDepartment"]').value = emp.department || '';
    modal.querySelector('[name="editPosition"]').value = emp.position || '';
    modal.querySelector('[name="editStartDate"]').value = emp.start_date || '';
    modal.querySelector('[name="editSalary"]').value = emp.salary || 0;
    modal.querySelector('[name="editStatus"]').value = emp.status || 'Active';
    modal.querySelector('[name="editDeductionIncomeTax"]').value = d.income_tax || 0;
    modal.querySelector('[name="editDeductionSocialSecurity"]').value = d.social_security || 0;
    modal.querySelector('[name="editDeductionMedicare"]').value = d.medicare || 0;
    modal.querySelector('[name="editDeductionHealth"]').value = d.health_insurance || 0;
    modal.querySelector('[name="editDeduction401k"]').value = d.retirement_401k || 0;
    modal.querySelector('[name="editDeductionCustom"]').value = d.custom || 0;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditEmployee(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = fd.get('editEmpId');
    try {
        await API.updateEmployee(id, {
            name: fd.get('editName'),
            email: fd.get('editEmail'),
            department: fd.get('editDepartment'),
            position: fd.get('editPosition'),
            startDate: fd.get('editStartDate'),
            salary: parseInt(fd.get('editSalary')) || 0,
            status: fd.get('editStatus'),
            deductions: {
                income_tax: parseFloat(fd.get('editDeductionIncomeTax')) || 0,
                social_security: parseFloat(fd.get('editDeductionSocialSecurity')) || 0,
                medicare: parseFloat(fd.get('editDeductionMedicare')) || 0,
                health_insurance: parseFloat(fd.get('editDeductionHealth')) || 0,
                retirement_401k: parseFloat(fd.get('editDeduction401k')) || 0,
                custom: parseFloat(fd.get('editDeductionCustom')) || 0
            }
        });
        var data = await API.getEmployees();
        appData.employees = data.employees;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Employee updated successfully!');
        renderEmployeeTable();
        updateDashboardStats();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

async function deleteEmployee(id) {
    var emp = appData.employees.find(function(e) { return e.id === id; });
    if (!emp) return;
    if (!confirm('Are you sure you want to remove ' + emp.name + '?')) return;
    try {
        await API.deleteEmployee(id);
        var data = await API.getEmployees();
        appData.employees = data.employees;
        showSuccess(emp.name + ' has been removed.');
        renderEmployeeTable();
        updateDashboardStats();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function renderEmployeeTable() {
    var tbody = document.querySelector('#employeeTableBody');
    if (!tbody) return;
    var employees = appData.employees || [];
    var html = '';
    employees.forEach(function(emp) {
        var statusClass = emp.status === 'Active' ? 'badge-active' : emp.status === 'On Leave' ? 'badge-pending' : 'badge-inactive';
        var salaryFormatted = '$' + (emp.salary || 0).toLocaleString();
        var totalDeductions = calcDeductionTotals(emp.deductions);
        var netPay = (emp.salary || 0) - totalDeductions;
        var monthlyNet = Math.round(netPay / 12);
        html += '<tr data-id="' + emp.id + '">' +
            '<td><div class="employee-row"><div class="employee-avatar ' + (emp.avatar_class || 'avatar-blue') + '">' + (emp.initials || '??') + '</div><div><div class="employee-name">' + emp.name + '</div><div class="employee-role">' + (emp.email || '') + '</div></div></div></td>' +
            '<td>' + (emp.department || '') + '</td>' +
            '<td>' + (emp.position || '') + '</td>' +
            '<td><strong>' + salaryFormatted + '</strong></td>' +
            '<td><span class="deduction-amount">-$' + totalDeductions.toLocaleString() + '</span></td>' +
            '<td><strong class="net-pay-amount">$' + netPay.toLocaleString() + '</strong><br><span class="net-pay-monthly">($' + monthlyNet.toLocaleString() + '/mo)</span></td>' +
            '<td><span class="badge ' + statusClass + '">' + (emp.status || '') + '</span></td>' +
            '<td class="action-cell">' +
                '<button class="btn btn-sm btn-secondary" onclick="editEmployee(\'' + emp.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteEmployee(\'' + emp.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
}

function initEmployeeTableActions() {
    renderEmployeeTable();
}

// ============================================
// SALARY ENTRY FORM (Payroll page)
// ============================================
function initSalaryEntryForm() {
    var form = document.getElementById('salaryEntryForm');
    if (!form) return;
    renderSalaryTable();
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        try {
            await API.addSalaryEntry({
                period: fd.get('payPeriod'),
                employeeCount: parseInt(fd.get('employeeCount')) || 0,
                gross: parseFloat(fd.get('grossPay')) || 0,
                deductions: parseFloat(fd.get('deductions')) || 0
            });
            var data = await API.getSalaryEntries();
            appData.salaryEntries = data.entries;
            form.reset();
            showSuccess('Salary entry added successfully!');
            renderSalaryTable();
        } catch (err) {
            showSuccess('Error: ' + err.message);
        }
    });
}

function renderSalaryTable() {
    var tbody = document.querySelector('#salaryTableBody');
    if (!tbody) return;
    var entries = appData.salaryEntries || [];
    var html = '';
    entries.forEach(function(entry) {
        var statusClass = entry.status === 'Processed' ? 'badge-active' : 'badge-pending';
        html += '<tr>' +
            '<td>' + (entry.period || '') + '</td>' +
            '<td>' + (entry.employee_count || 0) + '</td>' +
            '<td>$' + (entry.gross || 0).toLocaleString() + '</td>' +
            '<td>$' + (entry.deductions || 0).toLocaleString() + '</td>' +
            '<td>$' + (entry.net || 0).toLocaleString() + '</td>' +
            '<td><span class="badge ' + statusClass + '">' + (entry.status || '') + '</span></td>' +
            '<td><button class="btn btn-sm btn-secondary">View</button></td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
}

// ============================================
// BENEFIT PLAN FORM (Payroll page)
// ============================================
function initBenefitPlanForm() {
    var form = document.getElementById('benefitPlanForm');
    if (!form) return;
    renderBenefitTable();
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        try {
            await API.addBenefit({
                name: fd.get('benefitName'),
                cost: parseFloat(fd.get('benefitCost')) || 0,
                note: fd.get('benefitNote') || ''
            });
            var data = await API.getBenefits();
            appData.benefitPlans = data.benefits;
            form.reset();
            showSuccess('Benefit plan added successfully!');
            renderBenefitTable();
        } catch (err) {
            showSuccess('Error: ' + err.message);
        }
    });
}

function renderBenefitTable() {
    var tbody = document.querySelector('#benefitTableBody');
    if (!tbody) return;
    var plans = appData.benefitPlans || [];
    var html = '';
    plans.forEach(function(plan) {
        var costStr = plan.cost > 0 ? '$' + plan.cost + '/month per employee' : (plan.note || 'Employer paid');
        html += '<tr>' +
            '<td><strong>' + (plan.name || '') + '</strong></td>' +
            '<td>' + costStr + '</td>' +
            '<td>' + (plan.enrolled || 0) + '</td>' +
            '<td><span class="badge badge-active">Active</span></td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
}

// ============================================
// APPLICANT FORM (Recruiting page)
// ============================================
function initApplicantForm() {
    var form = document.getElementById('applicantForm');
    if (!form) return;
    renderApplicantTable();
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        var name = fd.get('applicantName');
        if (!name) return;
        try {
            await API.addApplicant({
                name: name,
                position: fd.get('applicantPosition') || '',
                email: fd.get('applicantEmail') || '',
                phone: fd.get('applicantPhone') || '',
                status: fd.get('applicantStatus') || 'New',
                experience: parseInt(fd.get('applicantExperience')) || 0
            });
            var data = await API.getApplicants();
            appData.applicants = data.applicants;
            form.reset();
            showSuccess('Applicant "' + name + '" added successfully!');
            renderApplicantTable();
            updateRecruitingStats();
        } catch (err) {
            showSuccess('Error: ' + err.message);
        }
    });
}

function renderApplicantTable() {
    var tbody = document.querySelector('#applicantTableBody');
    if (!tbody) return;
    var applicants = appData.applicants || [];
    var html = '';
    applicants.forEach(function(app) {
        var statusClass = 'badge-active';
        if (app.status === 'Under Review') statusClass = 'badge-pending';
        else if (app.status === 'Interview Scheduled') statusClass = 'badge-primary';
        else if (app.status === 'Offer Sent') statusClass = 'badge-gold';
        else if (app.status === 'Rejected') statusClass = 'badge-inactive';
        html += '<tr>' +
            '<td><div class="employee-row"><div class="employee-avatar avatar-blue">' + (app.initials || '??') + '</div><div><div class="employee-name">' + app.name + '</div><div class="employee-role">' + (app.email || '') + '</div></div></div></td>' +
            '<td>' + (app.position || '') + '</td>' +
            '<td>' + (app.phone || '') + '</td>' +
            '<td>' + (app.experience || 0) + ' yrs</td>' +
            '<td>' + (app.date || '') + '</td>' +
            '<td><span class="badge ' + statusClass + '">' + (app.status || '') + '</span></td>' +
            '<td class="action-cell">' +
                '<button class="btn btn-sm btn-secondary" onclick="editApplicant(\'' + app.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteApplicant(\'' + app.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    if (!html) html = '<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No applicants yet. Add one above.</td></tr>';
    tbody.innerHTML = html;
    updateRecruitingStats();
}

function editApplicant(id) {
    var app = appData.applicants.find(function(x) { return x.id === id; });
    if (!app) return;
    var modal = document.getElementById('editApplicantModal');
    if (!modal) return;
    modal.querySelector('[name="editApplicantId"]').value = id;
    modal.querySelector('[name="editApplicantName"]').value = app.name;
    modal.querySelector('[name="editApplicantEmail"]').value = app.email || '';
    modal.querySelector('[name="editApplicantPhone"]').value = app.phone || '';
    modal.querySelector('[name="editApplicantPosition"]').value = app.position || '';
    modal.querySelector('[name="editApplicantExperience"]').value = app.experience || 0;
    modal.querySelector('[name="editApplicantStatus"]').value = app.status || 'New';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditApplicant(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = fd.get('editApplicantId');
    try {
        await API.updateApplicant(id, {
            name: fd.get('editApplicantName'),
            email: fd.get('editApplicantEmail'),
            phone: fd.get('editApplicantPhone'),
            position: fd.get('editApplicantPosition'),
            experience: parseInt(fd.get('editApplicantExperience')) || 0,
            status: fd.get('editApplicantStatus')
        });
        var data = await API.getApplicants();
        appData.applicants = data.applicants;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Applicant updated!');
        renderApplicantTable();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

async function deleteApplicant(id) {
    var app = appData.applicants.find(function(x) { return x.id === id; });
    if (!app) return;
    if (!confirm('Remove applicant "' + app.name + '"?')) return;
    try {
        await API.deleteApplicant(id);
        var data = await API.getApplicants();
        appData.applicants = data.applicants;
        showSuccess('Applicant removed.');
        renderApplicantTable();
        updateRecruitingStats();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

// ============================================
// REPORT METRIC FORM (Reports page)
// ============================================
function initReportMetricForm() {
    var form = document.getElementById('reportMetricForm');
    if (!form) return;
    renderMetricsGrid();
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        try {
            await API.addMetric({
                metric: fd.get('metricName'),
                value: fd.get('metricValue'),
                change: fd.get('metricChange') || '',
                direction: fd.get('metricDirection') || 'up'
            });
            var data = await API.getMetrics();
            appData.reportMetrics = data.metrics;
            form.reset();
            showSuccess('Report metric added successfully!');
            renderMetricsGrid();
        } catch (err) {
            showSuccess('Error: ' + err.message);
        }
    });
}

function renderMetricsGrid() {
    var grid = document.getElementById('metricsGrid');
    if (!grid) return;
    var metrics = appData.reportMetrics || [];
    var icons = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M19 21H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
    ];
    var colors = ['blue', 'gold', 'red', 'green', 'orange', 'blue'];
    var html = '';
    metrics.forEach(function(m, i) {
        var icon = icons[i % icons.length];
        var color = colors[i % colors.length];
        html += '<div class="stat-card">' +
            '<div class="stat-icon ' + color + '">' + icon + '</div>' +
            '<div class="stat-info"><h4>' + m.value + '</h4><p>' + m.metric + '</p>' +
            (m.change ? '<span class="stat-change ' + m.direction + '">' + m.change + '</span>' : '') +
            '</div></div>';
    });
    grid.innerHTML = html;
}

// ============================================
// DEDUCTION HELPERS
// ============================================
function calcDeductionTotals(deductions) {
    if (!deductions) return 0;
    var keys = Object.keys(deductions);
    var sum = 0;
    for (var i = 0; i < keys.length; i++) {
        sum += deductions[keys[i]] || 0;
    }
    return sum;
}

function getDeductionBreakdownHtml(deductions) {
    if (!deductions) return '<span style="color:#999">No deductions</span>';
    var labels = {
        income_tax: 'Income Tax', social_security: 'Social Security', medicare: 'Medicare',
        health_insurance: 'Health Ins.', retirement_401k: '401(k)', custom: 'Custom'
    };
    var html = '<div class="deduction-breakdown">';
    var keys = Object.keys(deductions);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var val = deductions[k] || 0;
        if (val > 0) {
            html += '<span class="deduction-tag">' + (labels[k] || k) + ': $' + val.toLocaleString() + '</span>';
        }
    }
    var total = calcDeductionTotals(deductions);
    html += '<span class="deduction-tag deduction-total">Total: $' + total.toLocaleString() + '</span>';
    html += '</div>';
    return html;
}

// ============================================
// DASHBOARD STATS UPDATE
// ============================================
function updateDashboardStats() {
    var employees = appData.employees || [];
    var properties = appData.properties || [];
    var positions = appData.openPositions || [];
    var activeCount = employees.filter(function(e) { return e.status === 'Active'; }).length;
    var totalPayroll = employees.reduce(function(sum, e) { return sum + (e.salary || 0); }, 0);
    var activeListings = properties.filter(function(p) { return p.status === 'for-sale' || p.status === 'for-rent'; }).length;
    document.querySelectorAll('[data-stat="totalEmployees"]').forEach(function(el) { el.textContent = employees.length; });
    document.querySelectorAll('[data-stat="activeEmployees"]').forEach(function(el) { el.textContent = activeCount; });
    document.querySelectorAll('[data-stat="totalPayroll"]').forEach(function(el) { el.textContent = '$' + (totalPayroll / 12).toLocaleString(undefined, {maximumFractionDigits:0}) + '/mo'; });
    document.querySelectorAll('[data-stat="activeListings"]').forEach(function(el) { el.textContent = activeListings; });
    document.querySelectorAll('[data-stat="openPositions"]').forEach(function(el) { el.textContent = positions.length; });
    renderDashboardActivity();
    generateNotifications();
}

function renderDashboardActivity() {
    var list = document.getElementById('recentActivityList');
    if (!list) return;
    var items = [];
    var employees = appData.employees || [];
    var properties = appData.properties || [];
    var applicants = appData.applicants || [];
    var positions = appData.openPositions || [];
    var salaryEntries = appData.salaryEntries || [];

    employees.slice(0, 3).forEach(function(e) {
        var created = e.created_at || e.start_date || '';
        items.push({
            dot: 'green',
            text: '<strong>' + e.name + '</strong> joined as ' + (e.position || e.department || 'employee'),
            time: created ? formatRelativeTime(created) : 'Recently'
        });
    });

    properties.slice(0, 2).forEach(function(p) {
        var statusLabel = p.status === 'for-sale' ? 'listed for sale' : p.status === 'for-rent' ? 'listed for rent' : 'marked as sold';
        items.push({
            dot: 'gold',
            text: '<strong>' + (p.name || 'Property') + '</strong> ' + statusLabel + (p.agent ? ' (Agent: ' + p.agent + ')' : ''),
            time: p.created_at ? formatRelativeTime(p.created_at) : 'Recently'
        });
    });

    applicants.slice(0, 2).forEach(function(a) {
        items.push({
            dot: 'blue',
            text: '<strong>' + a.name + '</strong> applied for ' + (a.position || 'a position'),
            time: a.created_at ? formatRelativeTime(a.created_at) : 'Recently'
        });
    });

    positions.slice(0, 1).forEach(function(p) {
        items.push({
            dot: 'red',
            text: '<strong>Open position:</strong> ' + (p.title || '') + (p.department ? ' in ' + p.department : ''),
            time: 'Currently open'
        });
    });

    if (salaryEntries.length > 0) {
        var latest = salaryEntries[0];
        items.push({
            dot: 'green',
            text: '<strong>Payroll processed</strong> for ' + (latest.period || 'latest period'),
            time: 'Payroll'
        });
    }

    if (items.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No activity yet. Start adding data!</p>';
        return;
    }

    var html = '';
    items.slice(0, 5).forEach(function(item) {
        html += '<div class="activity-item">' +
            '<div class="activity-dot ' + item.dot + '"></div>' +
            '<div class="activity-content">' +
                '<p>' + item.text + '</p>' +
                '<span class="activity-time">' + item.time + '</span>' +
            '</div>' +
        '</div>';
    });
    list.innerHTML = html;
}

function formatRelativeTime(dateStr) {
    try {
        var d = new Date(dateStr);
        var now = new Date();
        var diffMs = now - d;
        var diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return diffMins + 'm ago';
        var diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return diffHours + 'h ago';
        var diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return diffDays + 'd ago';
        return d.toLocaleDateString();
    } catch (e) {
        return 'Recently';
    }
}

// ============================================
// JOB & PROJECT BUDGETS (Budget page)
// ============================================
function renderJobBudgetTable() {
    var tbody = document.querySelector('#jobBudgetBody');
    if (!tbody) return;
    var jobs = appData.jobBudgets || [];
    var html = '';
    jobs.forEach(function(j) {
        var spentPct = j.allocated > 0 ? Math.round((j.spent / j.allocated) * 100) : 0;
        var barColor = spentPct > 90 ? '#C53030' : spentPct > 70 ? '#D69E2E' : '#276749';
        html += '<tr>' +
            '<td><strong>' + (j.title || '') + '</strong></td>' +
            '<td>' + (j.department || '') + '</td>' +
            '<td>' + (j.headcount || 0) + '</td>' +
            '<td><div class="salary-input-group"><span>$</span><span style="background:transparent;color:inherit;padding:0;border:none;font-weight:400;">' + (j.allocated || 0).toLocaleString() + '</span></div></td>' +
            '<td><span class="deduction-amount">$' + (j.spent || 0).toLocaleString() + '</span></td>' +
            '<td><div class="budget-progress"><div class="budget-progress-bar" style="width:' + Math.min(spentPct, 100) + '%;background:' + barColor + ';"></div><span class="budget-progress-label">' + spentPct + '%</span></div></td>' +
            '<td>' + (j.notes || '') + '</td>' +
            '<td class="action-cell">' +
                '<button class="btn btn-sm btn-secondary" onclick="editJobBudget(\'' + j.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteJobBudget(\'' + j.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    if (!html) html = '<tr><td colspan="8" style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No job budgets added yet.</td></tr>';
    tbody.innerHTML = html;
}

async function handleAddJobBudget(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    try {
        await API.addJobBudget({
            title: fd.get('jobTitle'),
            department: fd.get('jobDepartment'),
            headcount: parseInt(fd.get('jobHeadcount')) || 0,
            allocated: parseInt(fd.get('jobAllocated')) || 0,
            spent: parseInt(fd.get('jobSpent')) || 0,
            notes: fd.get('jobNotes') || ''
        });
        var data = await API.getJobBudgets();
        appData.jobBudgets = data.jobs;
        form.reset();
        showSuccess('Job budget added!');
        renderJobBudgetTable();
        updateBudgetSummary();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function editJobBudget(id) {
    var j = appData.jobBudgets.find(function(x) { return x.id === id; });
    if (!j) return;
    var modal = document.getElementById('editJobBudgetModal');
    if (!modal) return;
    modal.querySelector('[name="editJobId"]').value = id;
    modal.querySelector('[name="editJobTitle"]').value = j.title;
    modal.querySelector('[name="editJobDepartment"]').value = j.department || '';
    modal.querySelector('[name="editJobHeadcount"]').value = j.headcount || 0;
    modal.querySelector('[name="editJobAllocated"]').value = j.allocated || 0;
    modal.querySelector('[name="editJobSpent"]').value = j.spent || 0;
    modal.querySelector('[name="editJobNotes"]').value = j.notes || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditJobBudget(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = fd.get('editJobId');
    try {
        await API.updateJobBudget(id, {
            title: fd.get('editJobTitle'),
            department: fd.get('editJobDepartment'),
            headcount: parseInt(fd.get('editJobHeadcount')) || 0,
            allocated: parseInt(fd.get('editJobAllocated')) || 0,
            spent: parseInt(fd.get('editJobSpent')) || 0,
            notes: fd.get('editJobNotes') || ''
        });
        var data = await API.getJobBudgets();
        appData.jobBudgets = data.jobs;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Job budget updated!');
        renderJobBudgetTable();
        updateBudgetSummary();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

async function deleteJobBudget(id) {
    var j = appData.jobBudgets.find(function(x) { return x.id === id; });
    if (!j) return;
    if (!confirm('Delete budget for "' + j.title + '"?')) return;
    try {
        await API.deleteJobBudget(id);
        var data = await API.getJobBudgets();
        appData.jobBudgets = data.jobs;
        showSuccess('Job budget removed.');
        renderJobBudgetTable();
        updateBudgetSummary();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function renderProjectBudgetTable() {
    var tbody = document.querySelector('#projectBudgetBody');
    if (!tbody) return;
    var projects = appData.projectBudgets || [];
    var html = '';
    projects.forEach(function(p) {
        var spentPct = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
        var barColor = spentPct > 90 ? '#C53030' : spentPct > 70 ? '#D69E2E' : '#276749';
        var statusClass = p.status === 'Active' ? 'badge-active' : p.status === 'Completed' ? 'badge-primary' : 'badge-pending';
        html += '<tr>' +
            '<td><strong>' + (p.name || '') + '</strong></td>' +
            '<td>' + (p.type || 'General') + '</td>' +
            '<td><div class="salary-input-group"><span>$</span><span style="background:transparent;color:inherit;padding:0;border:none;font-weight:400;">' + (p.budget || 0).toLocaleString() + '</span></div></td>' +
            '<td><span class="deduction-amount">$' + (p.spent || 0).toLocaleString() + '</span></td>' +
            '<td><div class="budget-progress"><div class="budget-progress-bar" style="width:' + Math.min(spentPct, 100) + '%;background:' + barColor + ';"></div><span class="budget-progress-label">' + spentPct + '%</span></div></td>' +
            '<td><span class="badge ' + statusClass + '">' + (p.status || '') + '</span></td>' +
            '<td class="action-cell">' +
                '<button class="btn btn-sm btn-secondary" onclick="editProjectBudget(\'' + p.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteProjectBudget(\'' + p.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    if (!html) html = '<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No project budgets added yet.</td></tr>';
    tbody.innerHTML = html;
}

async function handleAddProjectBudget(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    try {
        await API.addProjectBudget({
            name: fd.get('projectName'),
            type: fd.get('projectType'),
            budget: parseInt(fd.get('projectBudget')) || 0,
            spent: parseInt(fd.get('projectSpent')) || 0,
            status: fd.get('projectStatus') || 'Active'
        });
        var data = await API.getProjectBudgets();
        appData.projectBudgets = data.projects;
        form.reset();
        showSuccess('Project budget added!');
        renderProjectBudgetTable();
        updateBudgetSummary();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function editProjectBudget(id) {
    var p = appData.projectBudgets.find(function(x) { return x.id === id; });
    if (!p) return;
    var modal = document.getElementById('editProjectBudgetModal');
    if (!modal) return;
    modal.querySelector('[name="editProjectId"]').value = id;
    modal.querySelector('[name="editProjectName"]').value = p.name;
    modal.querySelector('[name="editProjectType"]').value = p.type || '';
    modal.querySelector('[name="editProjectBudget"]').value = p.budget || 0;
    modal.querySelector('[name="editProjectSpent"]').value = p.spent || 0;
    modal.querySelector('[name="editProjectStatus"]').value = p.status || 'Active';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditProjectBudget(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = fd.get('editProjectId');
    try {
        await API.updateProjectBudget(id, {
            name: fd.get('editProjectName'),
            type: fd.get('editProjectType'),
            budget: parseInt(fd.get('editProjectBudget')) || 0,
            spent: parseInt(fd.get('editProjectSpent')) || 0,
            status: fd.get('editProjectStatus')
        });
        var data = await API.getProjectBudgets();
        appData.projectBudgets = data.projects;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Project budget updated!');
        renderProjectBudgetTable();
        updateBudgetSummary();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

async function deleteProjectBudget(id) {
    var p = appData.projectBudgets.find(function(x) { return x.id === id; });
    if (!p) return;
    if (!confirm('Delete project "' + p.name + '"?')) return;
    try {
        await API.deleteProjectBudget(id);
        var data = await API.getProjectBudgets();
        appData.projectBudgets = data.projects;
        showSuccess('Project budget removed.');
        renderProjectBudgetTable();
        updateBudgetSummary();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function updateBudgetSummary() {
    var jobs = appData.jobBudgets || [];
    var projects = appData.projectBudgets || [];
    var jobAllocated = jobs.reduce(function(s, j) { return s + (j.allocated || 0); }, 0);
    var jobSpent = jobs.reduce(function(s, j) { return s + (j.spent || 0); }, 0);
    var projBudget = projects.reduce(function(s, p) { return s + (p.budget || 0); }, 0);
    var projSpent = projects.reduce(function(s, p) { return s + (p.spent || 0); }, 0);
    var el1 = document.getElementById('budgetTotalAllocated');
    var el2 = document.getElementById('budgetTotalSpent');
    var el3 = document.getElementById('budgetProjectTotal');
    var el4 = document.getElementById('budgetProjectSpent');
    if (el1) el1.textContent = '$' + jobAllocated.toLocaleString();
    if (el2) el2.textContent = '$' + jobSpent.toLocaleString();
    if (el3) el3.textContent = '$' + projBudget.toLocaleString();
    if (el4) el4.textContent = '$' + projSpent.toLocaleString();
}

// ============================================
// EMPLOYEE PHOTOS & SSN (Employees ID page)
// ============================================
function renderEmployeeIdTable() {
    var tbody = document.querySelector('#employeeIdBody');
    if (!tbody) return;
    var employees = appData.employeeIds || [];
    var html = '';
    employees.forEach(function(emp) {
        var photoHtml = emp.photo
            ? '<img src="' + emp.photo + '" alt="' + emp.name + '" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--color-secondary);">'
            : '<div class="employee-avatar avatar-blue" style="width:44px;height:44px;font-size:14px;">' + (emp.initials || '??') + '</div>';
        var ssnDisplay = emp.ssn ? '***-**-' + emp.ssn.slice(-4) : '---';
        html += '<tr>' +
            '<td>' + photoHtml + '</td>' +
            '<td><strong>' + emp.name + '</strong><br><span style="color:var(--color-text-muted);font-size:12px;">' + (emp.email || '') + '</span></td>' +
            '<td>' + (emp.department || '') + '</td>' +
            '<td><code style="background:#EDF2F7;padding:4px 8px;border-radius:4px;font-size:13px;letter-spacing:1px;">' + ssnDisplay + '</code></td>' +
            '<td>' + (emp.date_of_birth || '---') + '</td>' +
            '<td class="action-cell">' +
                '<button class="btn btn-sm btn-secondary" onclick="viewEmployeeSSN(\'' + emp.id + '\')">View SSN</button> ' +
                '<button class="btn btn-sm btn-secondary" onclick="editEmployeeId(\'' + emp.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteEmployeeId(\'' + emp.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    if (!html) html = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No employee records yet.</td></tr>';
    tbody.innerHTML = html;
}

async function handleAddEmployeeId(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var name = fd.get('empName');
    if (!name) return;
    var photoFile = fd.get('empPhoto');
    var saveFn = async function(photoData) {
        try {
            await API.addEmployeeId({
                name: name,
                email: fd.get('empEmail') || '',
                department: fd.get('empDepartment') || '',
                ssn: fd.get('empSSN') || '',
                dateOfBirth: fd.get('empDOB') || '',
                phone: fd.get('empPhone') || '',
                photo: photoData || ''
            });
            var data = await API.getEmployeeIds();
            appData.employeeIds = data.employeeIds;
            form.reset();
            var preview = document.getElementById('photoPreview');
            if (preview) preview.style.display = 'none';
            showSuccess(name + ' added!');
            renderEmployeeIdTable();
        } catch (err) {
            showSuccess('Error: ' + err.message);
        }
    };
    if (photoFile && photoFile.size > 0) {
        var reader = new FileReader();
        reader.onload = function(ev) { saveFn(ev.target.result); };
        reader.readAsDataURL(photoFile);
    } else {
        saveFn('');
    }
}

function editEmployeeId(id) {
    var emp = appData.employeeIds.find(function(x) { return x.id === id; });
    if (!emp) return;
    var modal = document.getElementById('editEmployeeIdModal');
    if (!modal) return;
    modal.querySelector('[name="editEmpIdKey"]').value = id;
    modal.querySelector('[name="editEmpName"]').value = emp.name;
    modal.querySelector('[name="editEmpEmail"]').value = emp.email || '';
    modal.querySelector('[name="editEmpDepartment"]').value = emp.department || '';
    modal.querySelector('[name="editEmpSSN"]').value = emp.ssn || '';
    modal.querySelector('[name="editEmpDOB"]').value = emp.date_of_birth || '';
    modal.querySelector('[name="editEmpPhone"]').value = emp.phone || '';
    var preview = modal.querySelector('#editPhotoPreview');
    if (preview) {
        if (emp.photo) { preview.src = emp.photo; preview.style.display = 'block'; }
        else { preview.style.display = 'none'; }
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditEmployeeId(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = fd.get('editEmpIdKey');
    var photoFile = fd.get('editEmpPhoto');
    var saveFn = async function(photoData) {
        try {
            var update = {
                name: fd.get('editEmpName'),
                email: fd.get('editEmpEmail'),
                department: fd.get('editEmpDepartment'),
                ssn: fd.get('editEmpSSN'),
                dateOfBirth: fd.get('editEmpDOB'),
                phone: fd.get('editEmpPhone')
            };
            if (photoData !== undefined) update.photo = photoData;
            await API.updateEmployeeId(id, update);
            var data = await API.getEmployeeIds();
            appData.employeeIds = data.employeeIds;
            var overlay = form.closest('.modal-overlay');
            if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
            showSuccess('Employee record updated!');
            renderEmployeeIdTable();
        } catch (err) {
            showSuccess('Error: ' + err.message);
        }
    };
    if (photoFile && photoFile.size > 0) {
        var reader = new FileReader();
        reader.onload = function(ev) { saveFn(ev.target.result); };
        reader.readAsDataURL(photoFile);
    } else {
        saveFn(undefined);
    }
}

async function deleteEmployeeId(id) {
    var emp = appData.employeeIds.find(function(x) { return x.id === id; });
    if (!emp) return;
    if (!confirm('Delete record for "' + emp.name + '"?')) return;
    try {
        await API.deleteEmployeeId(id);
        var data = await API.getEmployeeIds();
        appData.employeeIds = data.employeeIds;
        showSuccess('Employee record deleted.');
        renderEmployeeIdTable();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function viewEmployeeSSN(id) {
    var emp = appData.employeeIds.find(function(x) { return x.id === id; });
    if (!emp) return;
    var modal = document.getElementById('viewSSNModal');
    if (!modal) return;
    var photoEl = modal.querySelector('#viewSSNPhoto');
    var nameEl = modal.querySelector('#viewSSNName');
    var deptEl = modal.querySelector('#viewSSNDept');
    var ssnEl = modal.querySelector('#viewSSNNumber');
    var dobEl = modal.querySelector('#viewSSNDOB');
    var phoneEl = modal.querySelector('#viewSSNPhone');
    var emailEl = modal.querySelector('#viewSSNEmail');
    if (photoEl) {
        if (emp.photo) { photoEl.src = emp.photo; photoEl.style.display = 'block'; }
        else { photoEl.style.display = 'none'; }
    }
    if (nameEl) nameEl.textContent = emp.name;
    if (deptEl) deptEl.textContent = emp.department || 'N/A';
    if (ssnEl) ssnEl.textContent = emp.ssn || 'Not provided';
    if (dobEl) dobEl.textContent = emp.date_of_birth || 'Not provided';
    if (phoneEl) phoneEl.textContent = emp.phone || 'Not provided';
    if (emailEl) emailEl.textContent = emp.email || 'Not provided';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function previewPhoto(input, previewId) {
    var preview = document.getElementById(previewId);
    if (!preview) return;
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = 'none';
    }
}

// ============================================
// RECRUITING STATS (Auto-calculated)
// ============================================
function initRecruitingStats() {
    updateRecruitingStats();
}

function updateRecruitingStats() {
    var positions = appData.openPositions || [];
    var applicants = appData.applicants || [];
    var openCount = positions.length;
    var totalApplicants = applicants.length;
    var interviews = applicants.filter(function(a) { return a.status === 'Interview Scheduled'; }).length;
    var offers = applicants.filter(function(a) { return a.status === 'Offer Sent'; }).length;
    var el1 = document.getElementById('recruitingOpenPositions');
    var el2 = document.getElementById('recruitingTotalApplicants');
    var el3 = document.getElementById('recruitingInterviews');
    var el4 = document.getElementById('recruitingOffersPending');
    if (el1) el1.textContent = openCount;
    if (el2) el2.textContent = totalApplicants;
    if (el3) el3.textContent = interviews;
    if (el4) el4.textContent = offers;
}

// ============================================
// OPEN POSITIONS TABLE
// ============================================
function renderOpenPositionsTable() {
    var tbody = document.querySelector('#openPositionsBody');
    if (!tbody) return;
    var positions = appData.openPositions || [];
    var html = '';
    positions.forEach(function(p) {
        html += '<tr>' +
            '<td><strong>' + (p.title || '') + '</strong></td>' +
            '<td>' + (p.department || '') + '</td>' +
            '<td>' + (p.type || '') + '</td>' +
            '<td>' + (p.posted || '') + '</td>' +
            '<td>' + (p.applicants || 0) + '</td>' +
            '<td>' +
                '<button class="btn btn-sm btn-secondary" onclick="editOpenPosition(\'' + p.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteOpenPosition(\'' + p.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    if (!html) html = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No open positions.</td></tr>';
    tbody.innerHTML = html;
    updateRecruitingStats();
}

async function handleAddOpenPosition(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    try {
        await API.addPosition({
            title: fd.get('positionTitle'),
            department: fd.get('positionDepartment'),
            type: fd.get('positionType') || 'Full-time'
        });
        var data = await API.getPositions();
        appData.openPositions = data.positions;
        form.reset();
        showSuccess('Position posted!');
        renderOpenPositionsTable();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function editOpenPosition(id) {
    var p = appData.openPositions.find(function(x) { return x.id === id; });
    if (!p) return;
    var modal = document.getElementById('editPositionModal');
    if (!modal) return;
    modal.querySelector('[name="editPositionId"]').value = id;
    modal.querySelector('[name="editPositionTitle"]').value = p.title;
    modal.querySelector('[name="editPositionDepartment"]').value = p.department || '';
    modal.querySelector('[name="editPositionType"]').value = p.type || 'Full-time';
    modal.querySelector('[name="editPositionApplicants"]').value = p.applicants || 0;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditOpenPosition(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = fd.get('editPositionId');
    try {
        await API.updatePosition(id, {
            title: fd.get('editPositionTitle'),
            department: fd.get('editPositionDepartment'),
            type: fd.get('editPositionType'),
            applicants: parseInt(fd.get('editPositionApplicants')) || 0
        });
        var data = await API.getPositions();
        appData.openPositions = data.positions;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Position updated!');
        renderOpenPositionsTable();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

async function deleteOpenPosition(id) {
    var p = appData.openPositions.find(function(x) { return x.id === id; });
    if (!p) return;
    if (!confirm('Remove position "' + p.title + '"?')) return;
    try {
        await API.deletePosition(id);
        var data = await API.getPositions();
        appData.openPositions = data.positions;
        showSuccess('Position removed.');
        renderOpenPositionsTable();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

// ============================================
// SENIOR EMPLOYEES (Payroll page)
// ============================================
function renderSeniorTable() {
    var tbody = document.querySelector('#seniorTableBody');
    if (!tbody) return;
    var seniors = appData.seniors || [];
    var html = '';
    seniors.forEach(function(s) {
        var totalDed = calcDeductionTotals(s.deductions);
        var netPay = (s.salary || 0) - totalDed;
        html += '<tr>' +
            '<td><div class="employee-row"><div class="employee-avatar avatar-gold">' + (s.initials || '??') + '</div><div><div class="employee-name">' + s.name + '</div><div class="employee-role">' + (s.email || '') + '</div></div></div></td>' +
            '<td>' + (s.department || 'Senior') + '</td>' +
            '<td><strong>$' + (s.salary || 0).toLocaleString() + '</strong></td>' +
            '<td><span class="deduction-amount">-$' + totalDed.toLocaleString() + '</span></td>' +
            '<td><strong class="net-pay-amount">$' + netPay.toLocaleString() + '</strong></td>' +
            '<td>' +
                '<button class="btn btn-sm btn-secondary" onclick="editSenior(\'' + s.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteSenior(\'' + s.id + '\')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    if (!html) html = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No senior employees added yet.</td></tr>';
    tbody.innerHTML = html;
}

async function handleAddSenior(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var name = fd.get('seniorName');
    if (!name) return;
    try {
        await API.addSenior({
            name: name,
            email: fd.get('seniorEmail') || '',
            department: fd.get('seniorDepartment') || 'Senior Management',
            salary: parseInt(fd.get('seniorSalary')) || 0,
            deductions: {
                income_tax: parseFloat(fd.get('seniorDeductionIncomeTax')) || 0,
                social_security: parseFloat(fd.get('seniorDeductionSocialSecurity')) || 0,
                medicare: parseFloat(fd.get('seniorDeductionMedicare')) || 0,
                health_insurance: parseFloat(fd.get('seniorDeductionHealth')) || 0,
                retirement_401k: parseFloat(fd.get('seniorDeduction401k')) || 0,
                custom: parseFloat(fd.get('seniorDeductionCustom')) || 0
            }
        });
        var data = await API.getSeniors();
        appData.seniors = data.seniors;
        form.reset();
        showSuccess(name + ' added as senior employee!');
        renderSeniorTable();
        updateSeniorStats();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function editSenior(id) {
    var s = appData.seniors.find(function(x) { return x.id === id; });
    if (!s) return;
    var modal = document.getElementById('editSeniorModal');
    if (!modal) return;
    var d = s.deductions || {};
    modal.querySelector('[name="editSeniorId"]').value = id;
    modal.querySelector('[name="editSeniorName"]').value = s.name;
    modal.querySelector('[name="editSeniorEmail"]').value = s.email || '';
    modal.querySelector('[name="editSeniorDepartment"]').value = s.department || 'Senior Management';
    modal.querySelector('[name="editSeniorSalary"]').value = s.salary || 0;
    modal.querySelector('[name="editSeniorDeductionIncomeTax"]').value = d.income_tax || 0;
    modal.querySelector('[name="editSeniorDeductionSocialSecurity"]').value = d.social_security || 0;
    modal.querySelector('[name="editSeniorDeductionMedicare"]').value = d.medicare || 0;
    modal.querySelector('[name="editSeniorDeductionHealth"]').value = d.health_insurance || 0;
    modal.querySelector('[name="editSeniorDeduction401k"]').value = d.retirement_401k || 0;
    modal.querySelector('[name="editSeniorDeductionCustom"]').value = d.custom || 0;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditSenior(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = fd.get('editSeniorId');
    try {
        await API.updateSenior(id, {
            name: fd.get('editSeniorName'),
            email: fd.get('editSeniorEmail'),
            department: fd.get('editSeniorDepartment'),
            salary: parseInt(fd.get('editSeniorSalary')) || 0,
            deductions: {
                income_tax: parseFloat(fd.get('editSeniorDeductionIncomeTax')) || 0,
                social_security: parseFloat(fd.get('editSeniorDeductionSocialSecurity')) || 0,
                medicare: parseFloat(fd.get('editSeniorDeductionMedicare')) || 0,
                health_insurance: parseFloat(fd.get('editSeniorDeductionHealth')) || 0,
                retirement_401k: parseFloat(fd.get('editSeniorDeduction401k')) || 0,
                custom: parseFloat(fd.get('editSeniorDeductionCustom')) || 0
            }
        });
        var data = await API.getSeniors();
        appData.seniors = data.seniors;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess(fd.get('editSeniorName') + ' updated successfully!');
        renderSeniorTable();
        updateSeniorStats();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

async function deleteSenior(id) {
    var s = appData.seniors.find(function(x) { return x.id === id; });
    if (!s) return;
    if (!confirm('Remove ' + s.name + ' from senior employees?')) return;
    try {
        await API.deleteSenior(id);
        var data = await API.getSeniors();
        appData.seniors = data.seniors;
        showSuccess(s.name + ' removed from senior employees.');
        renderSeniorTable();
        updateSeniorStats();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function updateSeniorStats() {
    var seniors = appData.seniors || [];
    var totalSalary = seniors.reduce(function(sum, s) { return sum + (s.salary || 0); }, 0);
    var totalDeductions = seniors.reduce(function(sum, s) { return sum + calcDeductionTotals(s.deductions); }, 0);
    var totalNet = totalSalary - totalDeductions;
    var el1 = document.getElementById('seniorCount');
    var el2 = document.getElementById('seniorTotalSalary');
    var el3 = document.getElementById('seniorTotalDeductions');
    var el4 = document.getElementById('seniorTotalNet');
    if (el1) el1.textContent = seniors.length;
    if (el2) el2.textContent = '$' + totalSalary.toLocaleString();
    if (el3) el3.textContent = '-$' + totalDeductions.toLocaleString();
    if (el4) el4.textContent = '$' + totalNet.toLocaleString();
}

// ============================================
// EMPLOYEE DEDUCTIONS SUMMARY
// ============================================
function getEmployeeDeductionsSummary() {
    var employees = appData.employees || [];
    var totalGross = 0, totalDeductions = 0;
    employees.forEach(function(emp) {
        totalGross += emp.salary || 0;
        totalDeductions += calcDeductionTotals(emp.deductions);
    });
    return { gross: totalGross, totalDeductions: totalDeductions, net: totalGross - totalDeductions, count: employees.length };
}

function updateDeductionStats() {
    var summary = getEmployeeDeductionsSummary();
    var el1 = document.getElementById('totalGrossStat');
    var el2 = document.getElementById('totalDeductionsStat');
    var el3 = document.getElementById('totalNetStat');
    var el4 = document.getElementById('employeeCountStat');
    if (el1) el1.textContent = '$' + summary.gross.toLocaleString();
    if (el2) el2.textContent = '-$' + summary.totalDeductions.toLocaleString();
    if (el3) el3.textContent = '$' + summary.net.toLocaleString();
    if (el4) el4.textContent = summary.count;
}

// ============================================
// PROPERTY LISTINGS
// ============================================
var propertyColors = ['#1E3A5F', '#276749', '#553C9A', '#C53030', '#B7791F', '#2B6CB0', '#2F855A', '#6B46C1'];
var propertyGradients = {
    '#1E3A5F': 'linear-gradient(135deg, #1E3A5F, #3B82F6)',
    '#276749': 'linear-gradient(135deg, #276749, #48BB78)',
    '#553C9A': 'linear-gradient(135deg, #553C9A, #9F7AEA)',
    '#C53030': 'linear-gradient(135deg, #C53030, #FC8181)',
    '#B7791F': 'linear-gradient(135deg, #B7791F, #ECC94B)',
    '#2B6CB0': 'linear-gradient(135deg, #2B6CB0, #63B3ED)',
    '#2F855A': 'linear-gradient(135deg, #2F855A, #68D391)',
    '#6B46C1': 'linear-gradient(135deg, #6B46C1, #B794F4)'
};
var propertyIcons = {
    'For Sale': 'badge-primary',
    'For Rent': 'badge-gold',
    'Sold': 'badge-active'
};

function renderPropertyGrid() {
    var grid = document.querySelector('#propertyGrid');
    if (!grid) return;
    var properties = appData.properties || [];
    var html = '';
    properties.forEach(function(p) {
        var grad = propertyGradients[p.color] || propertyGradients['#1E3A5F'];
        var statusLabel = p.status === 'for-sale' ? 'For Sale' : p.status === 'for-rent' ? 'For Rent' : 'Sold';
        var badgeClass = propertyIcons[statusLabel] || 'badge-primary';
        html += '<div class="property-card" data-id="' + p.id + '">' +
            '<div class="property-image" style="background: ' + grad + ';">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect x="9" y="14" width="6" height="8"/></svg>' +
                '<span class="property-status"><span class="badge ' + badgeClass + '">' + statusLabel + '</span></span>' +
            '</div>' +
            '<div class="property-body">' +
                '<h4>' + (p.name || '') + '</h4>' +
                '<p class="property-address">' + (p.address || '') + '</p>' +
                '<div class="property-meta">' +
                    '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M2 10h20"/><path d="M7 4v3"/><path d="M12 4v3"/><path d="M17 4v3"/></svg> ' + (p.bedrooms || 0) + ' Beds</span>' +
                    '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16a1 1 0 0 1 1 1v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v7"/><line x1="4" y1="18" x2="4" y2="20"/><line x1="20" y1="18" x2="20" y2="20"/></svg> ' + (p.bathrooms || 0) + ' Baths</span>' +
                    '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg> ' + (p.sqft || 0).toLocaleString() + ' sqft</span>' +
                '</div>' +
            '</div>' +
            '<div class="property-footer">' +
                '<span class="property-price">$' + (p.price || 0).toLocaleString() + '</span>' +
                '<span class="employee-role">' + (p.agent || '') + '</span>' +
            '</div>' +
            '<div style="padding: 0 20px 16px; display: flex; gap: 8px;">' +
                '<button class="btn btn-sm btn-secondary" onclick="editProperty(\'' + p.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteProperty(\'' + p.id + '\')">Delete</button>' +
            '</div>' +
        '</div>';
    });
    if (!html) html = '<div style="grid-column: 1/-1; text-align:center; color:var(--color-text-muted); padding:var(--space-3xl);">No properties listed yet. Click "Add Listing" to get started.</div>';
    grid.innerHTML = html;
    updatePropertyStats();
}

function updatePropertyStats() {
    var properties = appData.properties || [];
    var total = properties.length;
    var sale = properties.filter(function(p) { return p.status === 'for-sale'; }).length;
    var rent = properties.filter(function(p) { return p.status === 'for-rent'; }).length;
    var sold = properties.filter(function(p) { return p.status === 'sold'; }).length;
    var els = document.querySelectorAll('.property-stat-total');
    els.forEach(function(el) { el.textContent = total; });
    els = document.querySelectorAll('.property-stat-sale');
    els.forEach(function(el) { el.textContent = sale; });
    els = document.querySelectorAll('.property-stat-rent');
    els.forEach(function(el) { el.textContent = rent; });
    els = document.querySelectorAll('.property-stat-sold');
    els.forEach(function(el) { el.textContent = sold; });
}

async function handleAddProperty(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var color = propertyColors[appData.properties ? appData.properties.length % propertyColors.length : 0];
    try {
        await API.addProperty({
            name: fd.get('name'),
            address: fd.get('address'),
            type: fd.get('type'),
            status: fd.get('status'),
            price: parseInt(fd.get('price')) || 0,
            bedrooms: parseInt(fd.get('bedrooms')) || 0,
            bathrooms: parseInt(fd.get('bathrooms')) || 0,
            agent: fd.get('agent') || '',
            color: color
        });
        var data = await API.getProperties();
        appData.properties = data.properties;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        form.reset();
        showSuccess('Property added!');
        renderPropertyGrid();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

function editProperty(id) {
    var p = appData.properties.find(function(x) { return x.id === id; });
    if (!p) return;
    var modal = document.getElementById('editPropertyModal');
    if (!modal) return;
    modal.querySelector('[name="editPropertyId"]').value = id;
    modal.querySelector('[name="editPropertyName"]').value = p.name;
    modal.querySelector('[name="editPropertyAddress"]').value = p.address || '';
    modal.querySelector('[name="editPropertyType"]').value = p.type || '';
    modal.querySelector('[name="editPropertyStatus"]').value = p.status || 'for-sale';
    modal.querySelector('[name="editPropertyPrice"]').value = p.price || 0;
    modal.querySelector('[name="editPropertyBedrooms"]').value = p.bedrooms || 0;
    modal.querySelector('[name="editPropertyBathrooms"]').value = p.bathrooms || 0;
    modal.querySelector('[name="editPropertyAgent"]').value = p.agent || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditProperty(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = fd.get('editPropertyId');
    try {
        await API.updateProperty(id, {
            name: fd.get('editPropertyName'),
            address: fd.get('editPropertyAddress'),
            type: fd.get('editPropertyType'),
            status: fd.get('editPropertyStatus'),
            price: parseInt(fd.get('editPropertyPrice')) || 0,
            bedrooms: parseInt(fd.get('editPropertyBedrooms')) || 0,
            bathrooms: parseInt(fd.get('editPropertyBathrooms')) || 0,
            agent: fd.get('editPropertyAgent')
        });
        var data = await API.getProperties();
        appData.properties = data.properties;
        var overlay = form.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Property updated!');
        renderPropertyGrid();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

async function deleteProperty(id) {
    var p = appData.properties.find(function(x) { return x.id === id; });
    if (!p) return;
    if (!confirm('Delete property "' + p.name + '"?')) return;
    try {
        await API.deleteProperty(id);
        var data = await API.getProperties();
        appData.properties = data.properties;
        showSuccess('Property deleted.');
        renderPropertyGrid();
    } catch (err) {
        showSuccess('Error: ' + err.message);
    }
}

// ============================================
// REPORTS PAGE - Dynamic rendering
// ============================================
function renderReportsPage() {
    renderReportMetrics();
    renderDepartmentChart();
    renderAgentPerformance();
    renderHiringTrends();
    renderKeyRecruitmentMetrics();
}

function renderReportMetrics() {
    var grid = document.getElementById('metricsGrid');
    if (!grid) return;
    var metrics = appData.reportMetrics || [];
    var icons = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M19 21H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
    ];
    var colors = ['blue', 'gold', 'red', 'green', 'orange', 'blue'];
    var html = '';
    metrics.forEach(function(m, i) {
        var icon = icons[i % icons.length];
        var color = colors[i % colors.length];
        html += '<div class="stat-card" style="position:relative;">' +
            '<div class="stat-icon ' + color + '">' + icon + '</div>' +
            '<div class="stat-info"><h4>' + m.value + '</h4><p>' + m.metric + '</p>' +
            (m.change ? '<span class="stat-change ' + m.direction + '">' + m.change + '</span>' : '') +
            '</div>' +
            '<div style="position:absolute;top:8px;right:8px;display:flex;gap:4px;">' +
                '<button class="btn btn-sm btn-secondary" onclick="editReportMetric(\'' + m.id + '\')" style="padding:2px 8px;font-size:11px;">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="removeReportMetric(\'' + m.id + '\')" style="padding:2px 8px;font-size:11px;">&times;</button>' +
            '</div></div>';
    });
    if (!html) html = '<div style="grid-column:1/-1;text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No metrics yet. Add one above.</div>';
    grid.innerHTML = html;
}

function renderDepartmentChart() {
    var container = document.getElementById('departmentChart');
    if (!container) return;
    var employees = appData.employees || [];
    var deptMap = {};
    employees.forEach(function(e) {
        var dept = e.department || 'Other';
        deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    var depts = Object.keys(deptMap);
    var maxCount = Math.max.apply(null, depts.map(function(d) { return deptMap[d]; }).concat([1]));
    var colors = ['#1E3A5F', '#C9A84C', '#276749', '#C53030', '#6B46C1', '#D53F8C'];
    var html = '<div class="chart-bars">';
    depts.forEach(function(dept, i) {
        var pct = Math.round((deptMap[dept] / maxCount) * 100);
        html += '<div class="chart-bar" style="height: ' + pct + '%; background: ' + colors[i % colors.length] + ';" data-label="' + dept + ' (' + deptMap[dept] + ')"></div>';
    });
    if (depts.length === 0) html += '<p style="color:var(--color-text-muted);padding:var(--space-xl);">No employee data. Add employees first.</p>';
    html += '</div>';
    container.innerHTML = html;
}

function renderAgentPerformance() {
    var tbody = document.getElementById('agentTableBody');
    if (!tbody) return;
    var agents = appData.agentPerformance || [];
    var avatarColors = ['avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-gold', 'avatar-red', 'avatar-pink'];
    var html = '';
    agents.forEach(function(a, i) {
        var initials = a.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
        var statusClass = a.status === 'Top Performer' ? 'badge-gold' : a.status === 'Excellent' ? 'badge-primary' : 'badge-info';
        html += '<tr>' +
            '<td><div class="employee-row"><div class="employee-avatar ' + avatarColors[i % avatarColors.length] + '">' + initials + '</div><div><div class="employee-name">' + a.name + '</div></div></div></td>' +
            '<td>' + (a.sales || 0) + '</td>' +
            '<td>' + (a.revenue || '$0') + '</td>' +
            '<td><span class="badge ' + statusClass + '">' + (a.status || 'Good') + '</span></td>' +
            '<td class="action-cell">' +
                '<button class="btn btn-sm btn-secondary" onclick="editAgentPerf(\'' + a.id + '\')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="removeAgentPerf(\'' + a.id + '\')">&times;</button>' +
            '</td>' +
            '</tr>';
    });
    if (!html) html = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No agent data yet.</td></tr>';
    tbody.innerHTML = html;
}

function renderHiringTrends() {
    var list = document.getElementById('hiringTrendsList');
    if (!list) return;
    var trends = appData.hiringTrends || [];
    var dots = ['blue', 'gold', 'green', 'red', 'blue', 'gold', 'green', 'red'];
    var html = '';
    trends.forEach(function(t, i) {
        var badge = t.status === 'In Progress' ? '<span class="badge badge-pending" style="margin-left:6px;">In Progress</span>' : '';
        html += '<div class="activity-item" style="position:relative;">' +
            '<div class="activity-dot ' + dots[i % dots.length] + '"></div>' +
            '<div class="activity-content">' +
                '<p><strong>' + t.month + '</strong> \u2014 ' + (t.hires || 0) + ' hire' + (t.hires !== 1 ? 's' : '') + badge + '</p>' +
                '<span class="activity-time">' + (t.departments || '') + '</span>' +
            '</div>' +
            '<div style="margin-left:auto;display:flex;gap:4px;flex-shrink:0;">' +
                '<button class="btn btn-sm btn-secondary" onclick="editHiringTrend(\'' + t.id + '\')" style="padding:2px 8px;font-size:11px;">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="removeHiringTrend(\'' + t.id + '\')" style="padding:2px 8px;font-size:11px;">&times;</button>' +
            '</div>' +
        '</div>';
    });
    if (!html) html = '<p style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No hiring trends yet. Add one above.</p>';
    list.innerHTML = html;
}

function renderKeyRecruitmentMetrics() {
    var grid = document.getElementById('keyMetricsGrid');
    if (!grid) return;
    var metrics = appData.reportMetrics || [];
    var recruitmentLabels = ['Avg Time to Hire', 'Cost per Hire', 'Offer Acceptance Rate'];
    var filtered = metrics.filter(function(m) { return recruitmentLabels.indexOf(m.metric) !== -1; });
    if (filtered.length === 0) {
        filtered = recruitmentLabels.map(function(label) {
            return { metric: label, value: '--', change: 'Add data', direction: 'up' };
        });
    }
    var icons = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
    ];
    var colors = ['blue', 'gold', 'green'];
    var html = '';
    filtered.forEach(function(m, i) {
        html += '<div class="stat-card">' +
            '<div class="stat-icon ' + colors[i % colors.length] + '">' + icons[i % icons.length] + '</div>' +
            '<div class="stat-info"><h4>' + m.value + '</h4><p>' + m.metric + '</p>' +
            (m.change ? '<span class="stat-change ' + m.direction + '">' + m.change + '</span>' : '') +
            '</div></div>';
    });
    grid.innerHTML = html;
}

// Report CRUD helpers
async function handleAddReportMetric(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    try {
        await API.addMetric({
            metric: fd.get('metricName'),
            value: fd.get('metricValue'),
            change: fd.get('metricChange') || '',
            direction: fd.get('metricDirection') || 'up'
        });
        var data = await API.getMetrics();
        appData.reportMetrics = data.metrics;
        form.reset();
        showSuccess('Metric added!');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

function editReportMetric(id) {
    var m = appData.reportMetrics.find(function(x) { return x.id === id; });
    if (!m) return;
    var modal = document.getElementById('editMetricModal');
    if (!modal) return;
    modal.querySelector('[name="editMetricId"]').value = id;
    modal.querySelector('[name="editMetricName"]').value = m.metric;
    modal.querySelector('[name="editMetricValue"]').value = m.value;
    modal.querySelector('[name="editMetricChange"]').value = m.change || '';
    modal.querySelector('[name="editMetricDirection"]').value = m.direction || 'up';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditReportMetric(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    try {
        await API.updateMetric(fd.get('editMetricId'), {
            metric: fd.get('editMetricName'),
            value: fd.get('editMetricValue'),
            change: fd.get('editMetricChange'),
            direction: fd.get('editMetricDirection')
        });
        var data = await API.getMetrics();
        appData.reportMetrics = data.metrics;
        var overlay = e.target.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Metric updated!');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

async function removeReportMetric(id) {
    if (!confirm('Delete this metric?')) return;
    try {
        await API.deleteMetric(id);
        var data = await API.getMetrics();
        appData.reportMetrics = data.metrics;
        showSuccess('Metric deleted.');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

async function handleAddAgentPerf(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    try {
        await API.addAgentPerformance({
            name: fd.get('agentName'),
            sales: parseInt(fd.get('agentSales')) || 0,
            revenue: fd.get('agentRevenue') || '$0',
            status: fd.get('agentStatus') || 'Good'
        });
        var data = await API.getAgentPerformance();
        appData.agentPerformance = data.agents;
        form.reset();
        showSuccess('Agent added!');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

function editAgentPerf(id) {
    var a = appData.agentPerformance.find(function(x) { return x.id === id; });
    if (!a) return;
    var modal = document.getElementById('editAgentModal');
    if (!modal) return;
    modal.querySelector('[name="editAgentId"]').value = id;
    modal.querySelector('[name="editAgentName"]').value = a.name;
    modal.querySelector('[name="editAgentSales"]').value = a.sales || 0;
    modal.querySelector('[name="editAgentRevenue"]').value = a.revenue || '';
    modal.querySelector('[name="editAgentStatus"]').value = a.status || 'Good';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditAgentPerf(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    try {
        await API.updateAgentPerformance(fd.get('editAgentId'), {
            name: fd.get('editAgentName'),
            sales: parseInt(fd.get('editAgentSales')) || 0,
            revenue: fd.get('editAgentRevenue'),
            status: fd.get('editAgentStatus')
        });
        var data = await API.getAgentPerformance();
        appData.agentPerformance = data.agents;
        var overlay = e.target.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Agent updated!');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

async function removeAgentPerf(id) {
    if (!confirm('Delete this agent record?')) return;
    try {
        await API.deleteAgentPerformance(id);
        var data = await API.getAgentPerformance();
        appData.agentPerformance = data.agents;
        showSuccess('Agent deleted.');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

async function handleAddHiringTrend(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    try {
        await API.addHiringTrend({
            month: fd.get('trendMonth'),
            hires: parseInt(fd.get('trendHires')) || 0,
            departments: fd.get('trendDepts') || '',
            status: fd.get('trendStatus') || 'Completed'
        });
        var data = await API.getHiringTrends();
        appData.hiringTrends = data.trends;
        form.reset();
        showSuccess('Hiring trend added!');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

function editHiringTrend(id) {
    var t = appData.hiringTrends.find(function(x) { return x.id === id; });
    if (!t) return;
    var modal = document.getElementById('editTrendModal');
    if (!modal) return;
    modal.querySelector('[name="editTrendId"]').value = id;
    modal.querySelector('[name="editTrendMonth"]').value = t.month;
    modal.querySelector('[name="editTrendHires"]').value = t.hires || 0;
    modal.querySelector('[name="editTrendDepts"]').value = t.departments || '';
    modal.querySelector('[name="editTrendStatus"]').value = t.status || 'Completed';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function handleEditHiringTrend(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    try {
        await API.updateHiringTrend(fd.get('editTrendId'), {
            month: fd.get('editTrendMonth'),
            hires: parseInt(fd.get('editTrendHires')) || 0,
            departments: fd.get('editTrendDepts'),
            status: fd.get('editTrendStatus')
        });
        var data = await API.getHiringTrends();
        appData.hiringTrends = data.trends;
        var overlay = e.target.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
        showSuccess('Trend updated!');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

async function removeHiringTrend(id) {
    if (!confirm('Delete this hiring trend?')) return;
    try {
        await API.deleteHiringTrend(id);
        var data = await API.getHiringTrends();
        appData.hiringTrends = data.trends;
        showSuccess('Trend deleted.');
        renderReportsPage();
    } catch (err) { showSuccess('Error: ' + err.message); }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showSuccess(msg) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:80px;right:20px;background:#276749;color:#fff;padding:14px 24px;border-radius:8px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.2);animation:slideUp 0.3s ease;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

function debounce(func, wait) {
    var timeout;
    return function() {
        var args = arguments;
        var ctx = this;
        clearTimeout(timeout);
        timeout = setTimeout(function() { func.apply(ctx, args); }, wait);
    };
}

console.log('%cPrestige Realty Group\n%cHR Management System', 'font-size:18px;font-weight:bold;color:#1E3A5F;', 'font-size:12px;color:#C9A84C;');
