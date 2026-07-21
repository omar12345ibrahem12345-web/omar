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
      .from('properties')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ properties: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', getUser, async (req, res) => {
  try {
    const { name, address, type, status, price, bedrooms, bathrooms, sqft, agent, color } = req.body;
    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert({
        user_id: req.user.id, name, address, type,
        status: status || 'for-sale', price: price || 0,
        bedrooms: bedrooms || 0, bathrooms: bathrooms || 0,
        sqft: sqft || 0, agent: agent || '',
        color: color || '#1E3A5F'
      })
      .select()
      .single();
    if (error) throw error;
    res.json({ property: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, type, status, price, bedrooms, bathrooms, sqft, agent, color } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (address !== undefined) update.address = address;
    if (type !== undefined) update.type = type;
    if (status !== undefined) update.status = status;
    if (price !== undefined) update.price = price;
    if (bedrooms !== undefined) update.bedrooms = bedrooms;
    if (bathrooms !== undefined) update.bathrooms = bathrooms;
    if (sqft !== undefined) update.sqft = sqft;
    if (agent !== undefined) update.agent = agent;
    if (color !== undefined) update.color = color;

    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(update)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ property: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', getUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
