// Prestige Realty Group - HR Management System
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initModals();
    initFilters();
    initSearch();
    initTables();
    initNotifications();
    loadDataFromStorage();
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
});

// Mobile Menu Toggle
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
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

// Modal Functionality
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

// Filter Buttons
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

// Search Functionality
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

// Table Row Selection
function initTables() {
    document.querySelectorAll('.data-table tbody tr').forEach(function(row) {
        row.addEventListener('click', function(e) {
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return;
            this.classList.toggle('selected');
        });
    });
}

// Notifications
function initNotifications() {
    document.querySelectorAll('.header-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var dot = this.querySelector('.notification-dot');
            if (dot) dot.remove();
        });
    });
}

// ============================================
// DATA STORAGE (localStorage)
// ============================================
function getData(key, defaultVal) {
    try {
        var val = localStorage.getItem('prg_' + key);
        return val ? JSON.parse(val) : defaultVal;
    } catch(e) { return defaultVal; }
}

function setData(key, val) {
    try { localStorage.setItem('prg_' + key, JSON.stringify(val)); } catch(e) {}
}

function loadDataFromStorage() {
    if (!getData('companyInfo')) {
        setData('companyInfo', {
            name: 'Prestige Realty Group',
            totalEmployees: 42,
            founded: '2015',
            address: '100 Sunset Boulevard, Beverly Hills, CA 90210',
            phone: '(310) 555-0100',
            website: 'www.prestigerealty.com'
        });
    }
    if (!getData('employees') || getData('employees').length === 0) {
        setData('employees', [
            { id: 1, name: 'James Rodriguez', email: 'j.rodriguez@prestige.com', department: 'Sales', position: 'Senior Real Estate Agent', startDate: '2022-01-15', salary: 95000, status: 'Active', avatar: 'JR', avatarClass: 'avatar-blue', deductions: { incomeTax: 19000, socialSecurity: 7267.50, medicare: 1377.50, healthInsurance: 450, retirement401k: 3800, custom: 0 } },
            { id: 2, name: 'Emily Chen', email: 'e.chen@prestige.com', department: 'Sales', position: 'Real Estate Agent', startDate: '2023-03-08', salary: 72000, status: 'Active', avatar: 'EC', avatarClass: 'avatar-green', deductions: { incomeTax: 14400, socialSecurity: 5508, medicare: 1044, healthInsurance: 450, retirement401k: 2880, custom: 0 } },
            { id: 3, name: 'Michael Torres', email: 'm.torres@prestige.com', department: 'Sales', position: 'Lead Agent', startDate: '2020-09-02', salary: 110000, status: 'Active', avatar: 'MT', avatarClass: 'avatar-purple', deductions: { incomeTax: 22000, socialSecurity: 8415, medicare: 1595, healthInsurance: 450, retirement401k: 4400, custom: 0 } },
            { id: 4, name: 'Amanda Foster', email: 'a.foster@prestige.com', department: 'Admin', position: 'Office Manager', startDate: '2021-06-20', salary: 65000, status: 'Active', avatar: 'AF', avatarClass: 'avatar-pink', deductions: { incomeTax: 13000, socialSecurity: 4972.50, medicare: 942.50, healthInsurance: 450, retirement401k: 2600, custom: 0 } },
            { id: 5, name: 'David Kim', email: 'd.kim@prestige.com', department: 'Marketing', position: 'Marketing Director', startDate: '2021-02-01', salary: 88000, status: 'Active', avatar: 'DK', avatarClass: 'avatar-gold', deductions: { incomeTax: 17600, socialSecurity: 6732, medicare: 1276, healthInsurance: 450, retirement401k: 3520, custom: 0 } },
            { id: 6, name: 'Samantha Park', email: 's.park@prestige.com', department: 'Admin', position: 'HR Coordinator', startDate: '2023-08-14', salary: 55000, status: 'Active', avatar: 'SP', avatarClass: 'avatar-blue', deductions: { incomeTax: 11000, socialSecurity: 4207.50, medicare: 797.50, healthInsurance: 450, retirement401k: 2200, custom: 0 } },
            { id: 7, name: 'Robert Williams', email: 'r.williams@prestige.com', department: 'Sales', position: 'Real Estate Agent', startDate: '2024-11-05', salary: 68000, status: 'On Leave', avatar: 'RW', avatarClass: 'avatar-green', deductions: { incomeTax: 13600, socialSecurity: 5202, medicare: 986, healthInsurance: 450, retirement401k: 2720, custom: 0 } },
            { id: 8, name: 'Lisa Bennett', email: 'l.bennett@prestige.com', department: 'Finance', position: 'Accountant', startDate: '2022-04-03', salary: 72000, status: 'Active', avatar: 'LB', avatarClass: 'avatar-red', deductions: { incomeTax: 14400, socialSecurity: 5508, medicare: 1044, healthInsurance: 450, retirement401k: 2880, custom: 0 } },
            { id: 9, name: 'Thomas Harris', email: 't.harris@prestige.com', department: 'Sales', position: 'Junior Agent', startDate: '2025-01-10', salary: 48000, status: 'Active', avatar: 'TH', avatarClass: 'avatar-purple', deductions: { incomeTax: 9600, socialSecurity: 3672, medicare: 696, healthInsurance: 450, retirement401k: 1920, custom: 0 } },
            { id: 10, name: 'Nancy Johnson', email: 'n.johnson@prestige.com', department: 'Legal', position: 'Legal Counsel', startDate: '2019-07-22', salary: 120000, status: 'Active', avatar: 'NJ', avatarClass: 'avatar-gold', deductions: { incomeTax: 24000, socialSecurity: 9180, medicare: 1740, healthInsurance: 450, retirement401k: 4800, custom: 0 } }
        ]);
    }
    if (!getData('salaryEntries') || getData('salaryEntries').length === 0) {
        setData('salaryEntries', [
            { period: 'Jul 1-15, 2026', employees: 42, gross: 142375, deductions: 35594, net: 106781, status: 'Processed' },
            { period: 'Jun 16-30, 2026', employees: 42, gross: 142375, deductions: 35594, net: 106781, status: 'Processed' },
            { period: 'Jun 1-15, 2026', employees: 41, gross: 138950, deductions: 34738, net: 104213, status: 'Processed' }
        ]);
    }
    if (!getData('benefitPlans') || getData('benefitPlans').length === 0) {
        setData('benefitPlans', [
            { name: 'Health Insurance (Premium)', cost: 450, enrolled: 38 },
            { name: 'Dental Plan', cost: 85, enrolled: 35 },
            { name: 'Vision Plan', cost: 35, enrolled: 32 },
            { name: '401(k) Retirement', cost: 0, enrolled: 36, note: '4% match' },
            { name: 'Life Insurance', cost: 25, enrolled: 30 }
        ]);
    }
    if (!getData('applicants') || getData('applicants').length === 0) {
        setData('applicants', [
            { name: 'Rachel Green', position: 'Senior Real Estate Agent', date: 'Jul 12, 2026', status: 'Under Review', initials: 'RG' },
            { name: 'Tom Baker', position: 'Marketing Coordinator', date: 'Jul 10, 2026', status: 'Interview Scheduled', initials: 'TB' },
            { name: 'Sarah Lee', position: 'Office Administrator', date: 'Jul 8, 2026', status: 'New', initials: 'SL' },
            { name: 'James Mitchell', position: 'Junior Agent Trainee', date: 'Jul 11, 2026', status: 'Under Review', initials: 'JM' },
            { name: 'Priya Patel', position: 'Finance Analyst', date: 'Jul 7, 2026', status: 'Offer Sent', initials: 'PP' },
            { name: 'Carlos Rivera', position: 'Senior Real Estate Agent', date: 'Jun 30, 2026', status: 'Rejected', initials: 'CR' }
        ]);
    }
    if (!getData('reportMetrics') || getData('reportMetrics').length === 0) {
        setData('reportMetrics', [
            { metric: 'Avg Employee Tenure', value: '2.8 years', change: '+0.3 vs last year', direction: 'up' },
            { metric: 'Employee Satisfaction', value: '4.2/5', change: '+0.4 improvement', direction: 'up' },
            { metric: 'Turnover Rate', value: '7.1%', change: '+1.2% vs Q1', direction: 'down' },
            { metric: 'Training Hours (YTD)', value: '1,240', change: '+180 this quarter', direction: 'up' }
        ]);
    }
}

// ============================================
// COMPANY INFO FORM (Dashboard)
// ============================================
function initCompanyInfoForm() {
    var form = document.getElementById('companyInfoForm');
    if (!form) return;
    var info = getData('companyInfo', {});
    var nameInput = form.querySelector('[name="companyName"]');
    var empInput = form.querySelector('[name="totalEmployees"]');
    var addrInput = form.querySelector('[name="companyAddress"]');
    var phoneInput = form.querySelector('[name="companyPhone"]');
    if (nameInput) nameInput.value = info.name || '';
    if (empInput) empInput.value = info.totalEmployees || '';
    if (addrInput) addrInput.value = info.address || '';
    if (phoneInput) phoneInput.value = info.phone || '';
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        setData('companyInfo', {
            name: fd.get('companyName'),
            totalEmployees: parseInt(fd.get('totalEmployees')) || 0,
            founded: info.founded || '2015',
            address: fd.get('companyAddress'),
            phone: fd.get('companyPhone'),
            website: info.website || ''
        });
        updateDashboardStats();
        showSuccess('Company information saved successfully!');
    });
}

// ============================================
// ADD EMPLOYEE FORM (Employees page)
// ============================================
function handleAddEmployee(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var name = fd.get('name');
    var email = fd.get('email');
    var department = fd.get('department');
    var position = fd.get('position');
    var startDate = fd.get('startDate');
    var salary = parseInt(fd.get('salary')) || 0;
    var deductions = {
        incomeTax: parseFloat(fd.get('deductionIncomeTax')) || 0,
        socialSecurity: parseFloat(fd.get('deductionSocialSecurity')) || 0,
        medicare: parseFloat(fd.get('deductionMedicare')) || 0,
        healthInsurance: parseFloat(fd.get('deductionHealth')) || 0,
        retirement401k: parseFloat(fd.get('deduction401k')) || 0,
        custom: parseFloat(fd.get('deductionCustom')) || 0
    };
    if (!name) return;
    var employees = getData('employees', []);
    var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
    var colors = ['avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-pink', 'avatar-gold', 'avatar-red'];
    var newEmp = {
        id: Date.now(),
        name: name,
        email: email || '',
        department: department || '',
        position: position || '',
        startDate: startDate || '',
        salary: salary,
        status: 'Active',
        avatar: initials,
        avatarClass: colors[employees.length % colors.length],
        deductions: deductions
    };
    employees.push(newEmp);
    setData('employees', employees);
    updateCompanyEmployeeCount();
    var overlay = form.closest('.modal-overlay');
    if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
    form.reset();
    showSuccess('Employee "' + name + '" added successfully!');
    if (typeof renderEmployeeTable === 'function') renderEmployeeTable();
    if (typeof renderDashboardSalaryTable === 'function') renderDashboardSalaryTable();
    updateDashboardStats();
}

// ============================================
// EDIT EMPLOYEE
// ============================================
function editEmployee(id) {
    var employees = getData('employees', []);
    var emp = employees.find(function(e) { return e.id === id; });
    if (!emp) return;
    var modal = document.getElementById('editEmployeeModal');
    if (!modal) return;
    var d = emp.deductions || {};
    modal.querySelector('[name="editEmpId"]').value = id;
    modal.querySelector('[name="editName"]').value = emp.name;
    modal.querySelector('[name="editEmail"]').value = emp.email;
    modal.querySelector('[name="editDepartment"]').value = emp.department;
    modal.querySelector('[name="editPosition"]').value = emp.position;
    modal.querySelector('[name="editStartDate"]').value = emp.startDate;
    modal.querySelector('[name="editSalary"]').value = emp.salary;
    modal.querySelector('[name="editStatus"]').value = emp.status;
    modal.querySelector('[name="editDeductionIncomeTax"]').value = d.incomeTax || 0;
    modal.querySelector('[name="editDeductionSocialSecurity"]').value = d.socialSecurity || 0;
    modal.querySelector('[name="editDeductionMedicare"]').value = d.medicare || 0;
    modal.querySelector('[name="editDeductionHealth"]').value = d.healthInsurance || 0;
    modal.querySelector('[name="editDeduction401k"]').value = d.retirement401k || 0;
    modal.querySelector('[name="editDeductionCustom"]').value = d.custom || 0;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleEditEmployee(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = parseInt(fd.get('editEmpId'));
    var employees = getData('employees', []);
    var idx = employees.findIndex(function(e) { return e.id === id; });
    if (idx === -1) return;
    employees[idx].name = fd.get('editName');
    employees[idx].email = fd.get('editEmail');
    employees[idx].department = fd.get('editDepartment');
    employees[idx].position = fd.get('editPosition');
    employees[idx].startDate = fd.get('editStartDate');
    employees[idx].salary = parseInt(fd.get('editSalary')) || 0;
    employees[idx].status = fd.get('editStatus');
    employees[idx].deductions = {
        incomeTax: parseFloat(fd.get('editDeductionIncomeTax')) || 0,
        socialSecurity: parseFloat(fd.get('editDeductionSocialSecurity')) || 0,
        medicare: parseFloat(fd.get('editDeductionMedicare')) || 0,
        healthInsurance: parseFloat(fd.get('editDeductionHealth')) || 0,
        retirement401k: parseFloat(fd.get('editDeduction401k')) || 0,
        custom: parseFloat(fd.get('editDeductionCustom')) || 0
    };
    employees[idx].avatar = employees[idx].name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
    setData('employees', employees);
    var overlay = form.closest('.modal-overlay');
    if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
    showSuccess('Employee "' + employees[idx].name + '" updated successfully!');
    if (typeof renderEmployeeTable === 'function') renderEmployeeTable();
    if (typeof renderDashboardSalaryTable === 'function') renderDashboardSalaryTable();
    updateDashboardStats();
}

function deleteEmployee(id) {
    var employees = getData('employees', []);
    var emp = employees.find(function(e) { return e.id === id; });
    if (!emp) return;
    if (!confirm('Are you sure you want to remove ' + emp.name + '?')) return;
    employees = employees.filter(function(e) { return e.id !== id; });
    setData('employees', employees);
    updateCompanyEmployeeCount();
    showSuccess(emp.name + ' has been removed.');
    if (typeof renderEmployeeTable === 'function') renderEmployeeTable();
}

function updateCompanyEmployeeCount() {
    var employees = getData('employees', []);
    var activeCount = employees.filter(function(e) { return e.status === 'Active'; }).length;
    var info = getData('companyInfo', {});
    info.totalEmployees = employees.length;
    setData('companyInfo', info);
    document.querySelectorAll('.emp-count-stat').forEach(function(el) {
        el.textContent = employees.length;
    });
}

// Render Employee Table
function renderEmployeeTable() {
    var tbody = document.querySelector('#employeeTableBody');
    if (!tbody) return;
    var employees = getData('employees', []);
    var html = '';
    employees.forEach(function(emp) {
        var statusClass = emp.status === 'Active' ? 'badge-active' : emp.status === 'On Leave' ? 'badge-pending' : 'badge-inactive';
        var salaryFormatted = '$' + (emp.salary || 0).toLocaleString();
        var totalDeductions = calcDeductionTotals(emp.deductions);
        var netPay = calcNetPay(emp.salary, emp.deductions);
        var monthlyNet = Math.round(netPay / 12);
        html += '<tr data-id="' + emp.id + '">' +
            '<td><div class="employee-row"><div class="employee-avatar ' + emp.avatarClass + '">' + emp.avatar + '</div><div><div class="employee-name">' + emp.name + '</div><div class="employee-role">' + emp.email + '</div></div></div></td>' +
            '<td>' + emp.department + '</td>' +
            '<td>' + emp.position + '</td>' +
            '<td><strong>' + salaryFormatted + '</strong></td>' +
            '<td><span class="deduction-amount">-$' + totalDeductions.toLocaleString() + '</span></td>' +
            '<td><strong class="net-pay-amount">$' + netPay.toLocaleString() + '</strong><br><span class="net-pay-monthly">($' + monthlyNet.toLocaleString() + '/mo)</span></td>' +
            '<td><span class="badge ' + statusClass + '">' + emp.status + '</span></td>' +
            '<td class="action-cell">' +
                '<button class="btn btn-sm btn-secondary" onclick="editEmployee(' + emp.id + ')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteEmployee(' + emp.id + ')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
    updateCompanyEmployeeCount();
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
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        var entries = getData('salaryEntries', []);
        var gross = parseFloat(fd.get('grossPay')) || 0;
        var deductions = parseFloat(fd.get('deductions')) || 0;
        entries.unshift({
            period: fd.get('payPeriod'),
            employees: parseInt(fd.get('employeeCount')) || 0,
            gross: gross,
            deductions: deductions,
            net: gross - deductions,
            status: 'Processed'
        });
        setData('salaryEntries', entries);
        form.reset();
        showSuccess('Salary entry added successfully!');
        renderSalaryTable();
    });
}

function renderSalaryTable() {
    var tbody = document.querySelector('#salaryTableBody');
    if (!tbody) return;
    var entries = getData('salaryEntries', []);
    var html = '';
    entries.forEach(function(entry) {
        var statusClass = entry.status === 'Processed' ? 'badge-active' : 'badge-pending';
        html += '<tr>' +
            '<td>' + entry.period + '</td>' +
            '<td>' + entry.employees + '</td>' +
            '<td>$' + entry.gross.toLocaleString() + '</td>' +
            '<td>$' + entry.deductions.toLocaleString() + '</td>' +
            '<td>$' + entry.net.toLocaleString() + '</td>' +
            '<td><span class="badge ' + statusClass + '">' + entry.status + '</span></td>' +
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
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        var plans = getData('benefitPlans', []);
        plans.push({
            name: fd.get('benefitName'),
            cost: parseFloat(fd.get('benefitCost')) || 0,
            enrolled: 0,
            note: fd.get('benefitNote') || ''
        });
        setData('benefitPlans', plans);
        form.reset();
        showSuccess('Benefit plan added successfully!');
        renderBenefitTable();
    });
}

function renderBenefitTable() {
    var tbody = document.querySelector('#benefitTableBody');
    if (!tbody) return;
    var plans = getData('benefitPlans', []);
    var html = '';
    plans.forEach(function(plan) {
        var costStr = plan.cost > 0 ? '$' + plan.cost + '/month per employee' : (plan.note || 'Employer paid');
        html += '<tr>' +
            '<td><strong>' + plan.name + '</strong></td>' +
            '<td>' + costStr + '</td>' +
            '<td>' + plan.enrolled + '</td>' +
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
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        var name = fd.get('applicantName');
        if (!name) return;
        var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
        var applicants = getData('applicants', []);
        applicants.unshift({
            name: name,
            position: fd.get('applicantPosition') || '',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'New',
            initials: initials
        });
        setData('applicants', applicants);
        form.reset();
        showSuccess('Applicant "' + name + '" added successfully!');
        renderApplicantTable();
    });
}

function renderApplicantTable() {
    var tbody = document.querySelector('#applicantTableBody');
    if (!tbody) return;
    var applicants = getData('applicants', []);
    var html = '';
    applicants.forEach(function(app) {
        var statusClass = 'badge-active';
        if (app.status === 'Under Review') statusClass = 'badge-pending';
        else if (app.status === 'Interview Scheduled') statusClass = 'badge-primary';
        else if (app.status === 'Offer Sent') statusClass = 'badge-gold';
        else if (app.status === 'Rejected') statusClass = 'badge-inactive';
        html += '<tr>' +
            '<td><div class="employee-row"><div class="employee-avatar avatar-blue">' + app.initials + '</div><div><div class="employee-name">' + app.name + '</div></div></div></td>' +
            '<td>' + app.position + '</td>' +
            '<td>' + app.date + '</td>' +
            '<td><span class="badge ' + statusClass + '">' + app.status + '</span></td>' +
            '<td><button class="btn btn-sm btn-secondary">View</button></td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
}

// ============================================
// REPORT METRIC FORM (Reports page)
// ============================================
function initReportMetricForm() {
    var form = document.getElementById('reportMetricForm');
    if (!form) return;
    renderMetricsGrid();
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(form);
        var metrics = getData('reportMetrics', []);
        metrics.push({
            metric: fd.get('metricName'),
            value: fd.get('metricValue'),
            change: fd.get('metricChange') || '',
            direction: fd.get('metricDirection') || 'up'
        });
        setData('reportMetrics', metrics);
        form.reset();
        showSuccess('Report metric added successfully!');
        renderMetricsGrid();
    });
}

function renderMetricsGrid() {
    var grid = document.getElementById('metricsGrid');
    if (!grid) return;
    var metrics = getData('reportMetrics', []);
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
    return Object.keys(deductions).reduce(function(sum, k) { return sum + (deductions[k] || 0); }, 0);
}

function calcNetPay(salary, deductions) {
    return salary - calcDeductionTotals(deductions);
}

function getDeductionBreakdownHtml(deductions) {
    if (!deductions) return '<span style="color:#999">No deductions</span>';
    var labels = {
        incomeTax: 'Income Tax', socialSecurity: 'Social Security', medicare: 'Medicare',
        healthInsurance: 'Health Ins.', retirement401k: '401(k)', custom: 'Custom'
    };
    var html = '<div class="deduction-breakdown">';
    Object.keys(deductions).forEach(function(k) {
        var val = deductions[k] || 0;
        if (val > 0) {
            html += '<span class="deduction-tag">' + (labels[k] || k) + ': $' + val.toLocaleString() + '</span>';
        }
    });
    var total = calcDeductionTotals(deductions);
    html += '<span class="deduction-tag deduction-total">Total: $' + total.toLocaleString() + '</span>';
    html += '</div>';
    return html;
}

// ============================================
// DASHBOARD STATS UPDATE
// ============================================
function updateDashboardStats() {
    var employees = getData('employees', []);
    var activeCount = employees.filter(function(e) { return e.status === 'Active'; }).length;
    var totalPayroll = employees.reduce(function(sum, e) { return sum + (e.salary || 0); }, 0);
    document.querySelectorAll('[data-stat="totalEmployees"]').forEach(function(el) { el.textContent = employees.length; });
    document.querySelectorAll('[data-stat="activeEmployees"]').forEach(function(el) { el.textContent = activeCount; });
    document.querySelectorAll('[data-stat="totalPayroll"]').forEach(function(el) { el.textContent = '$' + (totalPayroll / 12).toLocaleString(undefined, {maximumFractionDigits:0}) + '/mo'; });
}

// ============================================
// SENIOR EMPLOYEES (Payroll page)
// ============================================
function renderSeniorTable() {
    var tbody = document.querySelector('#seniorTableBody');
    if (!tbody) return;
    var seniors = getData('seniors', []);
    var html = '';
    seniors.forEach(function(s) {
        var totalDed = calcDeductionTotals(s.deductions);
        var netPay = s.salary - totalDed;
        html += '<tr>' +
            '<td><div class="employee-row"><div class="employee-avatar avatar-gold">' + s.initials + '</div><div><div class="employee-name">' + s.name + '</div><div class="employee-role">' + (s.email || '') + '</div></div></div></td>' +
            '<td>' + (s.department || 'Senior') + '</td>' +
            '<td><strong>$' + s.salary.toLocaleString() + '</strong></td>' +
            '<td><span class="deduction-amount">-$' + totalDed.toLocaleString() + '</span></td>' +
            '<td><strong class="net-pay-amount">$' + netPay.toLocaleString() + '</strong></td>' +
            '<td>' +
                '<button class="btn btn-sm btn-secondary" onclick="editSenior(' + s.id + ')">Edit</button> ' +
                '<button class="btn btn-sm btn-danger" onclick="deleteSenior(' + s.id + ')">Delete</button>' +
            '</td>' +
            '</tr>';
    });
    if (!html) html = '<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);padding:var(--space-xl);">No senior employees added yet. Use the form above to add one.</td></tr>';
    tbody.innerHTML = html;
}

function handleAddSenior(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var name = fd.get('seniorName');
    if (!name) return;
    var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
    var seniors = getData('seniors', []);
    seniors.push({
        id: Date.now(),
        name: name,
        email: fd.get('seniorEmail') || '',
        department: fd.get('seniorDepartment') || 'Senior Management',
        salary: parseInt(fd.get('seniorSalary')) || 0,
        deductions: {
            incomeTax: parseFloat(fd.get('seniorDeductionIncomeTax')) || 0,
            socialSecurity: parseFloat(fd.get('seniorDeductionSocialSecurity')) || 0,
            medicare: parseFloat(fd.get('seniorDeductionMedicare')) || 0,
            healthInsurance: parseFloat(fd.get('seniorDeductionHealth')) || 0,
            retirement401k: parseFloat(fd.get('seniorDeduction401k')) || 0,
            custom: parseFloat(fd.get('seniorDeductionCustom')) || 0
        },
        initials: initials
    });
    setData('seniors', seniors);
    form.reset();
    showSuccess(name + ' added as senior employee!');
    renderSeniorTable();
    updateSeniorStats();
}

function editSenior(id) {
    var seniors = getData('seniors', []);
    var s = seniors.find(function(x) { return x.id === id; });
    if (!s) return;
    var modal = document.getElementById('editSeniorModal');
    if (!modal) return;
    var d = s.deductions || {};
    modal.querySelector('[name="editSeniorId"]').value = id;
    modal.querySelector('[name="editSeniorName"]').value = s.name;
    modal.querySelector('[name="editSeniorEmail"]').value = s.email || '';
    modal.querySelector('[name="editSeniorDepartment"]').value = s.department || 'Senior Management';
    modal.querySelector('[name="editSeniorSalary"]').value = s.salary;
    modal.querySelector('[name="editSeniorDeductionIncomeTax"]').value = d.incomeTax || 0;
    modal.querySelector('[name="editSeniorDeductionSocialSecurity"]').value = d.socialSecurity || 0;
    modal.querySelector('[name="editSeniorDeductionMedicare"]').value = d.medicare || 0;
    modal.querySelector('[name="editSeniorDeductionHealth"]').value = d.healthInsurance || 0;
    modal.querySelector('[name="editSeniorDeduction401k"]').value = d.retirement401k || 0;
    modal.querySelector('[name="editSeniorDeductionCustom"]').value = d.custom || 0;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleEditSenior(e) {
    e.preventDefault();
    var form = e.target;
    var fd = new FormData(form);
    var id = parseInt(fd.get('editSeniorId'));
    var seniors = getData('seniors', []);
    var idx = seniors.findIndex(function(x) { return x.id === id; });
    if (idx === -1) return;
    var name = fd.get('editSeniorName');
    seniors[idx].name = name;
    seniors[idx].email = fd.get('editSeniorEmail');
    seniors[idx].department = fd.get('editSeniorDepartment');
    seniors[idx].salary = parseInt(fd.get('editSeniorSalary')) || 0;
    seniors[idx].deductions = {
        incomeTax: parseFloat(fd.get('editSeniorDeductionIncomeTax')) || 0,
        socialSecurity: parseFloat(fd.get('editSeniorDeductionSocialSecurity')) || 0,
        medicare: parseFloat(fd.get('editSeniorDeductionMedicare')) || 0,
        healthInsurance: parseFloat(fd.get('editSeniorDeductionHealth')) || 0,
        retirement401k: parseFloat(fd.get('editSeniorDeduction401k')) || 0,
        custom: parseFloat(fd.get('editSeniorDeductionCustom')) || 0
    };
    seniors[idx].initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
    setData('seniors', seniors);
    var overlay = form.closest('.modal-overlay');
    if (overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
    showSuccess(name + ' updated successfully!');
    renderSeniorTable();
    updateSeniorStats();
}

function deleteSenior(id) {
    var seniors = getData('seniors', []);
    var s = seniors.find(function(x) { return x.id === id; });
    if (!s) return;
    if (!confirm('Remove ' + s.name + ' from senior employees?')) return;
    seniors = seniors.filter(function(x) { return x.id !== id; });
    setData('seniors', seniors);
    showSuccess(s.name + ' removed from senior employees.');
    renderSeniorTable();
    updateSeniorStats();
}

function updateSeniorStats() {
    var seniors = getData('seniors', []);
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
    var employees = getData('employees', []);
    var totalGross = 0, totalDeductions = 0;
    employees.forEach(function(emp) {
        totalGross += emp.salary || 0;
        totalDeductions += calcDeductionTotals(emp.deductions);
    });
    return {
        gross: totalGross,
        totalDeductions: totalDeductions,
        net: totalGross - totalDeductions,
        count: employees.length
    };
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
// UTILITY FUNCTIONS
// ============================================
function showSuccess(msg) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:80px;right:20px;background:#276749;color:#fff;padding:14px 24px;border-radius:8px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.2);animation:slideUp 0.3s ease;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

function confirmDelete(name) {
    if (confirm('Are you sure you want to remove ' + name + '?')) {
        showSuccess(name + ' has been removed.');
    }
}

function printPayroll() { window.print(); }

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
