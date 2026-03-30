export type ContractStatus = 'active' | 'suspended'
export type Role = 'student' | 'admin'

export interface User {
  id: string
  student_id: string
  name: string
  password_hash: string
  role: Role
  contract_status: ContractStatus
  created_at: Date
}

export interface JWTPayload {
  userId: string
  studentId: string
  name: string
  role: Role
  contractStatus: ContractStatus
}

export interface LoginCredentials {
  student_id: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  user?: {
    id: string
    student_id: string
    name: string
    contract_status: ContractStatus
  }
}
