import { UserRole } from "@prisma/client"

export interface JwtUserPayload {
  userId: string
  email: string
  role?: UserRole
}