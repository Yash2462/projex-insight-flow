import axios from 'axios';
import { API_URL } from './client';

export const authAPI = {
  login: (data: { email: string; password: string; otp?: string }) =>
    axios.post(`${API_URL}/auth/login`, data),
  
  signup: (data: { fullName: string; email: string; password: string }) =>
    axios.post(`${API_URL}/auth/signup`, data),
  
  sendOtp: (email: string) =>
    axios.post(`${API_URL}/auth/send-otp?email=${email}`),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    axios.post(`${API_URL}/auth/reset-password`, data),
};
