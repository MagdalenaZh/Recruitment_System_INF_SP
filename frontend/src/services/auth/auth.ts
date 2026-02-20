import { apiPost } from "./api";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../../types/auth/auth";

export function login(body: LoginRequest) {
  return apiPost<LoginRequest, LoginResponse>("/api/auth/login", body);
}

export function register(body: RegisterRequest) {
  return apiPost<RegisterRequest, RegisterResponse>("/api/auth/register", body);
}
