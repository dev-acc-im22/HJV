import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  isPremium: boolean;
}

/**
 * Generate a JWT token for user authentication
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
  });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a token specifically for socket.io authentication
 */
export function generateSocketToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: "24h",
  });
}
