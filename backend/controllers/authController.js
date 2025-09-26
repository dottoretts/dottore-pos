// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'dottore@admin',
  password: 'Ammar@Admin'
};

// Login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          username: ADMIN_CREDENTIALS.username
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Check authentication status
const checkAuth = (req, res) => {
  res.json({ 
    loggedIn: true,
    user: {
      username: ADMIN_CREDENTIALS.username
    }
  });
};

// Logout controller
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  login,
  checkAuth,
  logout
};