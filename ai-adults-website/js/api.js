// API Client - Replaces localStorage with server-side API calls
// ============================================

var API = {
  request: async function(method, url, body) {
    var opts = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }
    var res = await fetch(url, opts);
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  // Company
  getCompany: function() { return this.request('GET', '/api/company'); },
  saveCompany: function(info) { return this.request('POST', '/api/company', info); },

  // Employees
  getEmployees: function() { return this.request('GET', '/api/employees'); },
  addEmployee: function(emp) { return this.request('POST', '/api/employees', emp); },
  updateEmployee: function(id, emp) { return this.request('PUT', '/api/employees/' + id, emp); },
  deleteEmployee: function(id) { return this.request('DELETE', '/api/employees/' + id); },

  // Payroll
  getSalaryEntries: function() { return this.request('GET', '/api/payroll/entries'); },
  addSalaryEntry: function(entry) { return this.request('POST', '/api/payroll/entries', entry); },
  getBenefits: function() { return this.request('GET', '/api/payroll/benefits'); },
  addBenefit: function(benefit) { return this.request('POST', '/api/payroll/benefits', benefit); },
  getSeniors: function() { return this.request('GET', '/api/payroll/seniors'); },
  addSenior: function(senior) { return this.request('POST', '/api/payroll/seniors', senior); },
  updateSenior: function(id, senior) { return this.request('PUT', '/api/payroll/seniors/' + id, senior); },
  deleteSenior: function(id) { return this.request('DELETE', '/api/payroll/seniors/' + id); },

  // Budget
  getJobBudgets: function() { return this.request('GET', '/api/budget/jobs'); },
  addJobBudget: function(job) { return this.request('POST', '/api/budget/jobs', job); },
  updateJobBudget: function(id, job) { return this.request('PUT', '/api/budget/jobs/' + id, job); },
  deleteJobBudget: function(id) { return this.request('DELETE', '/api/budget/jobs/' + id); },
  getProjectBudgets: function() { return this.request('GET', '/api/budget/projects'); },
  addProjectBudget: function(project) { return this.request('POST', '/api/budget/projects', project); },
  updateProjectBudget: function(id, project) { return this.request('PUT', '/api/budget/projects/' + id, project); },
  deleteProjectBudget: function(id) { return this.request('DELETE', '/api/budget/projects/' + id); },

  // Recruiting
  getPositions: function() { return this.request('GET', '/api/recruiting/positions'); },
  addPosition: function(pos) { return this.request('POST', '/api/recruiting/positions', pos); },
  updatePosition: function(id, pos) { return this.request('PUT', '/api/recruiting/positions/' + id, pos); },
  deletePosition: function(id) { return this.request('DELETE', '/api/recruiting/positions/' + id); },
  getApplicants: function() { return this.request('GET', '/api/recruiting/applicants'); },
  addApplicant: function(app) { return this.request('POST', '/api/recruiting/applicants', app); },
  updateApplicant: function(id, app) { return this.request('PUT', '/api/recruiting/applicants/' + id, app); },
  deleteApplicant: function(id) { return this.request('DELETE', '/api/recruiting/applicants/' + id); },
  getRecruitingStats: function() { return this.request('GET', '/api/recruiting/stats'); },
  saveRecruitingStats: function(stats) { return this.request('POST', '/api/recruiting/stats', stats); },

  // Reports
  getMetrics: function() { return this.request('GET', '/api/reports/metrics'); },
  addMetric: function(metric) { return this.request('POST', '/api/reports/metrics', metric); },
  updateMetric: function(id, metric) { return this.request('PUT', '/api/reports/metrics/' + id, metric); },
  deleteMetric: function(id) { return this.request('DELETE', '/api/reports/metrics/' + id); },
  getHiringTrends: function() { return this.request('GET', '/api/reports/hiring-trends'); },
  addHiringTrend: function(trend) { return this.request('POST', '/api/reports/hiring-trends', trend); },
  updateHiringTrend: function(id, trend) { return this.request('PUT', '/api/reports/hiring-trends/' + id, trend); },
  deleteHiringTrend: function(id) { return this.request('DELETE', '/api/reports/hiring-trends/' + id); },
  getAgentPerformance: function() { return this.request('GET', '/api/reports/agents'); },
  addAgentPerformance: function(agent) { return this.request('POST', '/api/reports/agents', agent); },
  updateAgentPerformance: function(id, agent) { return this.request('PUT', '/api/reports/agents/' + id, agent); },
  deleteAgentPerformance: function(id) { return this.request('DELETE', '/api/reports/agents/' + id); },

  // Employee IDs
  getEmployeeIds: function() { return this.request('GET', '/api/company/employee-ids'); },
  addEmployeeId: function(emp) { return this.request('POST', '/api/company/employee-ids', emp); },
  updateEmployeeId: function(id, emp) { return this.request('PUT', '/api/company/employee-ids/' + id, emp); },
  deleteEmployeeId: function(id) { return this.request('DELETE', '/api/company/employee-ids/' + id); },

  // Properties
  getProperties: function() { return this.request('GET', '/api/properties'); },
  addProperty: function(prop) { return this.request('POST', '/api/properties', prop); },
  updateProperty: function(id, prop) { return this.request('PUT', '/api/properties/' + id, prop); },
  deleteProperty: function(id) { return this.request('DELETE', '/api/properties/' + id); }
};
