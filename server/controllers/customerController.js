import Customer from '../models/Customer.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { customerId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const count = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      customers,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalCustomers: count
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerConsent = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { customerId: req.params.id },
      req.body,
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};
