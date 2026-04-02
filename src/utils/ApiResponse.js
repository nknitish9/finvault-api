/**
 * Consistent API response wrapper.
 * Ensures every endpoint returns a uniform JSON envelope.
 */
class ApiResponse {
  /**
   * Send a success response.
   * @param {import('express').Response} res - Express response object
   * @param {object} options
   * @param {number}  [options.statusCode=200] - HTTP status code
   * @param {string}  [options.message='Success'] - Response message
   * @param {*}       [options.data=null] - Response payload
   * @param {object}  [options.meta=null] - Pagination or additional metadata
   */
  static success(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
    const response = {
      success: true,
      message,
      data,
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201).
   */
  static created(res, { message = 'Resource created successfully', data = null } = {}) {
    return ApiResponse.success(res, { statusCode: 201, message, data });
  }

  /**
   * Send an error response.
   * @param {import('express').Response} res - Express response object
   * @param {object} options
   * @param {number}  [options.statusCode=500] - HTTP status code
   * @param {string}  [options.message='Something went wrong'] - Error message
   * @param {Array}   [options.errors=[]] - Detailed field-level errors
   */
  static error(res, { statusCode = 500, message = 'Something went wrong', errors = [] } = {}) {
    const response = {
      success: false,
      message,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
