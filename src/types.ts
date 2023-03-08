export interface LoginFormFields {
  email: string;
  password: string;
}

export interface Name {
  first_name: string;
  last_name: string;
}

export interface Address {
  city: string;
  state: string;
  country: string;
}

export interface Member {
  docId?: string;
  name: Name;
  email: string;
  mobile_phone: number;
  joining_date: Date;
  address: Address;
  membership_program: MembershipProgram;
  is_active?: boolean
}

export interface MembershipProgram {
  membershipProgramId?: string;
  name: string;
  price: number;
}

export interface Product {
  product_id?: string;
  name: string;
  total_stock: number;
  available_stock: number;
  price: number;
}

export interface Template {
  docId?: string;
  channel: string;
  message: string;
}

export interface Month {
  docId: string;
  name: string;
  value: Number;
}

export interface Year {
  docId: string;
  value: Number;
}

export interface MembershipPayment {
  docId?: string;
  member: Member;
  membership_program: MembershipProgram;
  month: Number;
  year: Number;
  status: string;
}

export interface ProductPayment {
  docId?: string;
  member: Member;
  product: Product;
  month: Number;
  year: Number;
  quantity: Number;
  status: string;
  total: Number;
  due: Number;
}

