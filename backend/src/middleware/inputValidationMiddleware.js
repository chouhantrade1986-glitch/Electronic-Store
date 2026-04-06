const { body, param, query, validationResult } = require("express-validator");

/**
 * Central input validation middleware for common fields
 */

// Email validation
const validateEmail = (fieldName = "email") => {
  return body(fieldName)
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .trim();
};

// Password validation - minimum 8 characters, at least one uppercase, one lowercase, one number
const validatePassword = (fieldName = "password") => {
  return body(fieldName)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and number");
};

// Phone number validation
const validatePhone = (fieldName = "phone") => {
  return body(fieldName)
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone must be 10 digits");
};

// Product ID validation
const validateProductId = (paramName = "id") => {
  return param(paramName)
    .isInt({ min: 1 })
    .withMessage("Invalid product ID");
};

// Order ID validation
const validateOrderId = (paramName = "orderId") => {
  return param(paramName)
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage("Invalid order ID format");
};

// Pagination validation
const validatePagination = () => {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100")
  ];
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Input validation failed",
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Sanitize user-generated content
const sanitizeText = (fieldName) => {
  return body(fieldName)
    .trim()
    .escape()
    .withMessage(`${fieldName} contains invalid characters`);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateProductId,
  validateOrderId,
  validatePagination,
  handleValidationErrors,
  sanitizeText,
  body,
  param,
  query
};
