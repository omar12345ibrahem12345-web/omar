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

// Metrics
router.get('/metrics', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('report_metrics')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ metrics: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/metrics', getUser, async (req, res) => {
  try {
    const { metric, value, change, direction } = req.body;
    const { data, error } = await supabaseAdmin
      .from('report_metrics')
      .insert({
        user_id: req.user.id, metric, value,
        change: change || '', direction: direction || 'up'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ metric: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/metrics/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { metric, value, change, direction } = req.body;
    const { data, error } = await supabaseAdmin
      .from('report_metrics')
      .update({ metric, value, change, direction })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ metric: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/metrics/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('report_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Metric deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hiring Trends
router.get('/hiring-trends', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('hiring_trends')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ trends: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/hiring-trends', getUser, async (req, res) => {
  try {
    const { month, hires, departments, status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('hiring_trends')
      .insert({
        user_id: req.user.id, month, hires: hires || 0,
        departments: departments || '', status: status || 'Completed'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ trend: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/hiring-trends/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { month, hires, departments, status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('hiring_trends')
      .update({ month, hires, departments, status })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ trend: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/hiring-trends/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('hiring_trends')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Trend deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agent Performance
router.get('/agents', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('agent_performance')
      .select('*')
      .eq('user_id', req.user.id)
      .order('sales', { ascending: false });
    if (error) throw error;
    res.json({ agents: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/agents', getUser, async (req, res) => {
  try {
    const { name, sales, revenue, status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('agent_performance')
      .insert({
        user_id: req.user.id, name, sales: sales || 0,
        revenue: revenue || '$0', status: status || 'Good'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ agent: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/agents/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sales, revenue, status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('agent_performance')
      .update({ name, sales, revenue, status })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ agent: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/agents/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('agent_performance')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
