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

router.get('/', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ employees: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', getUser, async (req, res) => {
  try {
    const { name, email, department, position, startDate, salary, status, deductions } = req.body;
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const { data, error } = await supabaseAdmin
      .from('employees')
      .insert({
        user_id: req.user.id,
        name, email, department, position, start_date: startDate,
        salary: salary || 0, status: status || 'Active',
        initials,
        deductions: deductions || { income_tax: 0, social_security: 0, medicare: 0, health_insurance: 0, retirement_401k: 0, custom: 0 }
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ employee: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, position, startDate, salary, status, deductions } = req.body;
    const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) : undefined;
    const update = {};
    if (name !== undefined) { update.name = name; update.initials = initials; }
    if (email !== undefined) update.email = email;
    if (department !== undefined) update.department = department;
    if (position !== undefined) update.position = position;
    if (startDate !== undefined) update.start_date = startDate;
    if (salary !== undefined) update.salary = salary;
    if (status !== undefined) update.status = status;
    if (deductions !== undefined) update.deductions = deductions;

    const { data, error } = await supabaseAdmin
      .from('employees')
      .update(update)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ employee: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
