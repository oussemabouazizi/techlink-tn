const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').trim().isLength({ min: 2 }),
  body('role').isIn(['freelancer', 'client']),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  handleValidationErrors,
];

const jobValidation = [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 20 }),
  body('budget_min').optional().isFloat({ min: 0 }),
  body('budget_max').optional().isFloat({ min: 0 }),
  handleValidationErrors,
];

const proposalValidation = [
  body('cover_letter').trim().isLength({ min: 50 }),
  body('bid_amount').isFloat({ min: 1 }),
  body('delivery_days').isInt({ min: 1 }),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  jobValidation,
  proposalValidation,
  handleValidationErrors,
};