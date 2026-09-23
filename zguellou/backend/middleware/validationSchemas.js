const { checkSchema } = require('express-validator');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
const NAME_REGEX = /^[\p{L}]+$/u;

const registerSchema = checkSchema({
  email: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
    trim: true,
    normalizeEmail: true,
    isEmail: { errorMessage: 'validation/invalid_email' },
    isLength: {
      options: { max: 254 },
      errorMessage: 'validation/email_too_long',
    }
  },
  password: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: 'validation/password_length_invalid',
    },
    matches: {
      options: PASSWORD_REGEX,
      errorMessage: 'validation/password_weak',
    },
  },
  first_name: {
    in: ['body'],
    optional: {
      options: {
        checkFalsy: true,
      },
    },
    trim: true,
    isLength: {
      options: { min: 2, max: 30 },
      errorMessage: 'validation/first_name_length_invalid',
    },
    matches: {
      options: NAME_REGEX,
      errorMessage: 'validation/invalid_first_name',
    },
  },
  last_name: {
    in: ['body'],
    optional: {
      options: {
        checkFalsy: true,
      },
    },
    trim: true,
    isLength: {
      options: { min: 2, max: 30 },
      errorMessage: 'validation/last_name_length_invalid',
    },
    matches: {
      options: NAME_REGEX,
      errorMessage: 'validation/invalid_last_name',
    },
  },
});

const loginSchema = checkSchema({
  email: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
    trim: true,
    normalizeEmail: true,
    isEmail: { errorMessage: 'validation/invalid_email' },
  },
  password: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
  },
});

const forgotPasswordSchema = checkSchema({
  email: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
    trim: true,
    normalizeEmail: true,
    isEmail: { errorMessage: 'validation/invalid_email' },
  },
});

const resetPasswordSchema = checkSchema({
  password: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: 'validation/password_length_invalid',
    },
    matches: {
      options: PASSWORD_REGEX,
      errorMessage: 'validation/password_weak',
    },
  },
});

const changePasswordSchema = checkSchema({
  new_password: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: 'validation/password_length_invalid',
    },
    matches: {
      options: PASSWORD_REGEX,
      errorMessage: 'validation/password_weak',
    },
  },
});

const updateProfileSchema = checkSchema({
  first_name: {
    in: ['body'],
    optional: { options: { checkFalsy: true } },
    trim: true,
    isLength: { options: { min: 2, max: 30 }, errorMessage: 'validation/first_name_length_invalid' },
    matches: {
      options: NAME_REGEX,
      errorMessage: 'validation/first_name_invalid_chars',
    },
  },
  last_name: {
    in: ['body'],
    optional: { options: { checkFalsy: true } },
    trim: true,
    isLength: { options: { min: 2, max: 30 }, errorMessage: 'validation/last_name_length_invalid' },
    matches: {
      options: NAME_REGEX,
      errorMessage: 'validation/last_name_invalid_chars',
    },
  },
  is_dropout: {
    in: ['body'],
    optional: true,
    isBoolean: { errorMessage: 'validation/invalid_boolean' },
    toBoolean: true,
  },
  year_of_birth: {
    in: ['body'],
    optional: true,
    isInt: { options: { min: 1900, max: new Date().getFullYear() }, errorMessage: 'validation/invalid_year' },
    toInt: true,
  },
  diploma_id: {
    in: ['body'],
    optional: { options: { checkFalsy: true } },
    isUUID: { errorMessage: 'validation/invalid_uuid' },
  },
  diploma_note: {
    in: ['body'],
    optional: { options: { checkFalsy: true } },
    isFloat: { options: { min: 0, max: 20 }, errorMessage: 'validation/invalid_grade' },
    toFloat: true,
  },
  diploma_year: {
    in: ['body'],
    optional: { options: { checkFalsy: true } },
    isInt: { options: { min: 2000, max: new Date().getFullYear() + 1 }, errorMessage: 'validation/invalid_year' },
    toInt: true,
  }
});

const changeOwnPasswordSchema = checkSchema({
  current_password: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
  },
  new_password: {
    in: ['body'],
    exists: { errorMessage: 'validation/required_field' },
    notEmpty: { errorMessage: 'validation/required_field' },
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: 'validation/password_length_invalid',
    },
    matches: {
      options: PASSWORD_REGEX,
      errorMessage: 'validation/password_weak',
    },
  },
});

module.exports = {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  changeOwnPasswordSchema,
};