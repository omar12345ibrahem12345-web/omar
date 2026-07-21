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

router.get('/jobs', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('job_budgets')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ jobs: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/jobs', getUser, async (req, res) => {
  try {
    const { title, department, headcount, allocated, spent, notes } = req.body;
    const { data, error } = await supabaseAdmin
      .from('job_budgets')
      .insert({
        user_id: req.user.id, title, department,
        headcount: headcount || 0, allocated: allocated || 0,
        spent: spent || 0, notes: notes || ''
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ job: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/jobs/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, headcount, allocated, spent, notes } = req.body;
    const { data, error } = await supabaseAdmin
      .from('job_budgets')
      .update({ title, department, headcount, allocated, spent, notes })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ job: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/jobs/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('job_budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Job budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/projects', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('project_budgets')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ projects: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/projects', getUser, async (req, res) => {
  try {
    const { name, type, budget, spent, status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('project_budgets')
      .insert({
        user_id: req.user.id, name, type,
        budget: budget || 0, spent: spent || 0,
        status: status || 'Active'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ project: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/projects/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, budget, spent, status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('project_budgets')
      .update({ name, type, budget, spent, status })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ project: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/projects/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('project_budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Project budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
