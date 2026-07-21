const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

function getUser(req, res, next) {
  const token = req.cookies['sb-access-token'];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  supabaseAdmin.auth.getUser(token).then(({ data, error }) => {
    if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });
    req.user = data.user;
    next();
  }).catch(() => res.status(401).json({ error: 'Auth failed' }));
}

router.get('/entries', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('salary_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ entries: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/entries', getUser, async (req, res) => {
  try {
    const { period, employeeCount, gross, deductions } = req.body;
    const { data, error } = await supabaseAdmin
      .from('salary_entries')
      .insert({
        user_id: req.user.id,
        period, employee_count: employeeCount || 0,
        gross: gross || 0, deductions: deductions || 0,
        net: (gross || 0) - (deductions || 0), status: 'Processed'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ entry: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/benefits', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('benefit_plans')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ benefits: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/benefits', getUser, async (req, res) => {
  try {
    const { name, cost, note } = req.body;
    const { data, error } = await supabaseAdmin
      .from('benefit_plans')
      .insert({ user_id: req.user.id, name, cost: cost || 0, enrolled: 0, note: note || '' })
      .select()
      .single();
    if (error) throw error;
    res.json({ benefit: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/seniors', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('seniors')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ seniors: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seniors', getUser, async (req, res) => {
  try {
    const { name, email, department, salary, deductions } = req.body;
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const { data, error } = await supabaseAdmin
      .from('seniors')
      .insert({
        user_id: req.user.id, name, email, department,
        salary: salary || 0, initials,
        deductions: deductions || { income_tax: 0, social_security: 0, medicare: 0, health_insurance: 0, retirement_401k: 0, custom: 0 }
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ senior: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/seniors/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, salary, deductions } = req.body;
    const update = {};
    if (name !== undefined) { update.name = name; update.initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2); }
    if (email !== undefined) update.email = email;
    if (department !== undefined) update.department = department;
    if (salary !== undefined) update.salary = salary;
    if (deductions !== undefined) update.deductions = deductions;

    const { data, error } = await supabaseAdmin
      .from('seniors')
      .update(update)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ senior: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/seniors/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('seniors')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Senior deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
