import { apiGet, apiPost, apiPut } from "../api";


export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type RegisterResponse = {
  userId: string;
  email: string;
  role: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  role: string;
};

export type CurrentUserResponse = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
};

export function register(body: RegisterRequest) {
  return apiPost<RegisterRequest, RegisterResponse>("/api/auth/register", body, false);
}

export function login(body: LoginRequest) {
  return apiPost<LoginRequest, LoginResponse>("/api/auth/login", body, false);
}

export function getCurrentUser() {
  return apiGet<CurrentUserResponse>("/api/auth/me", true);
}

export function updateProfile(body: UpdateProfileRequest) {
  return apiPut<UpdateProfileRequest, void>("/api/auth/me", body, true);
}