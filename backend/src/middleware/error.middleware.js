export function errorHandler(err, req, res, next) {
  console.error(err);

  const message = err.message || "Internal server error";

  // Map known error codes/messages to HTTP status codes
  const errorMap = {
    PROJECT_NAME_REQUIRED: { status: 400, code: "PROJECT_NAME_REQUIRED" },
    NO_FIELDS_TO_UPDATE: { status: 400, code: "NO_FIELDS_TO_UPDATE" },
    EMAIL_REQUIRED: { status: 400, code: "EMAIL_REQUIRED" },
    INVALID_ROLE: { status: 400, code: "INVALID_ROLE" },
    CANNOT_ADD_SELF: { status: 400, code: "CANNOT_ADD_SELF" },
    ALREADY_MEMBER: { status: 409, code: "ALREADY_MEMBER" },
    USER_NOT_FOUND: { status: 404, code: "USER_NOT_FOUND" },
    PROJECT_NOT_FOUND: { status: 404, code: "PROJECT_NOT_FOUND" },
    MEMBER_NOT_FOUND: { status: 404, code: "MEMBER_NOT_FOUND" },
    DOCUMENT_NOT_FOUND: { status: 404, code: "DOCUMENT_NOT_FOUND" },
    ACCESS_DENIED: { status: 403, code: "ACCESS_DENIED" },
    NOT_AUTHORIZED: { status: 403, code: "NOT_AUTHORIZED" },
  };

  const mapped = errorMap[message] || {
    status: err.statusCode || 500,
    code: err.code || "INTERNAL_SERVER_ERROR",
  };

  res.status(mapped.status).json({
    success: false,
    error: {
      code: mapped.code,
      message,
    },
  });
}

