export interface Employee {
  id: string
  user_id: string
  name: string
  email: string
  phone: string | null
  role: string
  department: string
  wallet_address: string
  avatar_url: string | null
  salary: number
  employment_type: string //Either employee or contractor 
}