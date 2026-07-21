const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const payrollRoutes = require('./routes/payroll');
const budgetRoutes = require('./routes/budget');
const recruitingRoutes = require('./routes/recruiting');
const reportRoutes = require('./routes/reports');
const companyRoutes = require('./routes/company');
const propertyRoutes = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname)));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/recruiting', recruitingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/properties', propertyRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Prestige Realty HR running on http://localhost:${PORT}`);
});
