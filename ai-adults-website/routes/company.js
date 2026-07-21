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
      .from('company_info')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json({ company: data || { name: 'Prestige Realty Group', total_employees: 42, founded: '2015', address: '', phone: '', website: '' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', getUser, async (req, res) => {
  try {
    const { name, totalEmployees, address, phone, website } = req.body;
    const existing = await supabaseAdmin
      .from('company_info')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const payload = {
      name, total_employees: totalEmployees || 0,
      address: address || '', phone: phone || '',
      website: website || ''
    };

    if (existing.data) {
      const { data, error } = await supabaseAdmin
        .from('company_info')
        .update(payload)
        .eq('id', existing.data.id)
        .select()
        .single();
      if (error) throw error;
      return res.json({ company: data });
    } else {
      const { data, error } = await supabaseAdmin
        .from('company_info')
        .insert({ user_id: req.user.id, ...payload })
        .select()
        .single();
      if (error) throw error;
      return res.json({ company: data });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/employee-ids', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('employee_ids')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ employeeIds: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/employee-ids', getUser, async (req, res) => {
  try {
    const { name, email, department, ssn, dateOfBirth, phone, photo } = req.body;
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const { data, error } = await supabaseAdmin
      .from('employee_ids')
      .insert({
        user_id: req.user.id, name, email, department,
        ssn, date_of_birth: dateOfBirth, phone, photo, initials
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ employeeId: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/employee-ids/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, ssn, dateOfBirth, phone, photo } = req.body;
    const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) : undefined;
    const update = {};
    if (name !== undefined) { update.name = name; update.initials = initials; }
    if (email !== undefined) update.email = email;
    if (department !== undefined) update.department = department;
    if (ssn !== undefined) update.ssn = ssn;
    if (dateOfBirth !== undefined) update.date_of_birth = dateOfBirth;
    if (phone !== undefined) update.phone = phone;
    if (photo !== undefined) update.photo = photo;

    const { data, error } = await supabaseAdmin
      .from('employee_ids')
      .update(update)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ employeeId: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/employee-ids/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('employee_ids')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Employee ID record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
