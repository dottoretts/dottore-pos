const Employee = require('../models/Employee');

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching employees' 
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching employee' 
    });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { name, cnic, phone, joiningDate, status } = req.body;
    
    // Validation
    if (!name || !cnic || !phone || !joiningDate) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    const employee = new Employee({
      name,
      cnic,
      phone,
      joiningDate,
      status: status || 'working'
    });
    
    await employee.save();
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Employee with this CNIC already exists' 
      });
    }
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { name, cnic, phone, joiningDate, status } = req.body;
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, cnic, phone, joiningDate, status },
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Employee with this CNIC already exists' 
      });
    }
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting employee' 
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};