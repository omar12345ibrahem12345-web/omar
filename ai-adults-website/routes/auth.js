const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || '' } }
    });

    if (error) return res.status(400).json({ error: error.message });

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    if (data.session) {
      res.cookie('sb-access-token', data.session.access_token, {
        httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 * 1000
      });
      res.cookie('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 * 1000
      });
    }

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    res.cookie('sb-access-token', data.session.access_token, {
      httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 * 1000
    });
    res.cookie('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 * 1000
    });

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies['sb-access-token'];
    if (token) {
      await supabase.auth.admin.signOut(token).catch(() => {});
    }
    res.clearCookie('sb-access-token');
    res.clearCookie('sb-refresh-token');
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/session', async (req, res) => {
  try {
    const token = req.cookies['sb-access-token'];
    const refreshToken = req.cookies['sb-refresh-token'];

    if (!token && !refreshToken) {
      return res.json({ session: null, user: null });
    }

    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        return res.json({
          session: { access_token: token },
          user: data.user
        });
      }
    }

    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (!error && data.session) {
        res.cookie('sb-access-token', data.session.access_token, {
          httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 * 1000
        });
        res.cookie('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 * 1000
        });
        return res.json({ session: data.session, user: data.user });
      }
    }

    res.json({ session: null, user: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user', async (req, res) => {
  try {
    const token = req.cookies['sb-access-token'];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ error: error.message });

    res.json({ user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
