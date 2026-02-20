export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  role: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  userId: string;
  email: string;
  role: string;
};