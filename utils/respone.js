// utils/responseHelpers.js

const { Response } = require('express');

/**
 * @typedef {Object} SuccessResponseData
 * @property {any} [data]
 * @property {string} message
 */

/**
 * @typedef {Object} ErrorResponseData
 * @property {string} message
 * @property {any[]} [errors]
 * @property {string} [code]
 * @property {number} statusCode
 */

/**
 * Send a success response
 * @param {Response} res - Express response object
 * @param {any} data - Data to send in the response
 * @param {string} message - Message to send in the response
 */
const sendSuccessResponse = (res, data, message) => {
    const responseData = {
        data,
        message,
    };
    res.status(200).json(responseData);
};

/**
 * Send a validation error response
 * @param {Response} res - Express response object
 * @param {any[]} errors - List of validation errors
 * @param {string} message - Message to send in the response
 */
const sendValidationErrorResponse = (res, errors, message) => {
    const errorResponse = {
        message,
        errors,
        code: 'FST_ERR_VALIDATION',
        statusCode: 422,
    };
    res.status(422).json(errorResponse);
};

/**
 * Send a not found response
 * @param {Response} res - Express response object
 * @param {string} message - Message to send in the response
 */
const sendNotFoundResponse = (res, message) => {
    const errorResponse = {
        message,
        statusCode: 404,
    };
    res.status(404).json(errorResponse);
};

/**
 * Send an unauthorized response
 * @param {Response} res - Express response object
 * @param {string} message - Message to send in the response
 */
const sendUnauthorizedResponse = (res, message) => {
    res.status(401).json({ message });
};

/**
 * Send a generic error response
 * @param {Response} res - Express response object
 * @param {string} message - Message to send in the response
 */
const sendErrorResponse = (res, message) => {
    res.status(500).json({ error: true, message });
};

module.exports = {
    sendSuccessResponse,
    sendValidationErrorResponse,
    sendNotFoundResponse,
    sendUnauthorizedResponse,
    sendErrorResponse,
};
