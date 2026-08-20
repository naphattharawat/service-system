export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "กรุณาเข้าสู่ระบบ") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "ไม่มีสิทธิ์เข้าถึง") {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "ไม่พบข้อมูล") {
    super(404, message);
  }
}
