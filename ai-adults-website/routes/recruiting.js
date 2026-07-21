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

router.get('/positions', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('open_positions')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ positions: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/positions', getUser, async (req, res) => {
  try {
    const { title, department, type } = req.body;
    const { data, error } = await supabaseAdmin
      .from('open_positions')
      .insert({
        user_id: req.user.id, title, department,
        type: type || 'Full-time', posted: 'Just now', applicants: 0
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ position: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/positions/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, type, applicants } = req.body;
    const { data, error } = await supabaseAdmin
      .from('open_positions')
      .update({ title, department, type, applicants })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ position: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/positions/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('open_positions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Position deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/applicants', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('applicants')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ applicants: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/applicants', getUser, async (req, res) => {
  try {
    const { name, position, email, phone, status, experience } = req.body;
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const { data, error } = await supabaseAdmin
      .from('applicants')
      .insert({
        user_id: req.user.id, name, position,
        email: email || '',
        phone: phone || '',
        experience: experience || 0,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: status || 'New', initials
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ applicant: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', getUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recruiting_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json({ stats: data || { open_positions: 5, total_applicants: 23, interviews: 8, offers_pending: 2 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/applicants/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, status, email, phone, experience } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (position !== undefined) update.position = position;
    if (status !== undefined) update.status = status;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (experience !== undefined) update.experience = experience;
    if (name) {
      update.initials = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    }
    const { data, error } = await supabaseAdmin
      .from('applicants')
      .update(update)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ applicant: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/applicants/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('applicants')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Applicant deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stats', getUser, async (req, res) => {
  try {
    const { openPositions, totalApplicants, interviews, offersPending } = req.body;
    const existing = await supabaseAdmin
      .from('recruiting_stats')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (existing.data) {
      const { data, error } = await supabaseAdmin
        .from('recruiting_stats')
        .update({
          open_positions: openPositions, total_applicants: totalApplicants,
          interviews, offers_pending: offersPending
        })
        .eq('id', existing.data.id)
        .select()
        .single();
      if (error) throw error;
      return res.json({ stats: data });
    } else {
      const { data, error } = await supabaseAdmin
        .from('recruiting_stats')
        .insert({
          user_id: req.user.id, open_positions: openPositions,
          total_applicants: totalApplicants, interviews, offers_pending: offersPending
        })
        .select()
        .single();
      if (error) throw error;
      return res.json({ stats: data });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
