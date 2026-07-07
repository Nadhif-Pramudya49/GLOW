const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { JWT_SECRET } = require('../middlewares/auth');

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide fullName, email, and password' });
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = (role === 'OWNER' || role === 'ADMIN') ? role : 'USER';

    const userData = {
      fullName,
      email,
      password: hashedPassword,
      role: assignedRole,
    };

    if (assignedRole === 'OWNER') {
      userData.businessProfile = {
        create: {
          businessName: req.body.businessName || 'Business of ' + fullName,
          status: 'PENDING'
        }
      };
    }

    const user = await prisma.user.create({
      data: userData,
      select: { id: true, fullName: true, email: true, role: true }
    });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPass } = user;
    
    res.json({ user: userWithoutPass, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, email: true, role: true, businessProfile: true, userProfile: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, address, identityNumber, emergencyContact } = req.body;
    if (!fullName) return res.status(400).json({ error: 'Name is required' });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        fullName,
        userProfile: {
          upsert: {
            create: { phoneNumber, address, identityNumber, emergencyContact },
            update: { phoneNumber, address, identityNumber, emergencyContact }
          }
        }
      },
      select: { id: true, fullName: true, email: true, role: true, businessProfile: true, userProfile: true }
    });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
