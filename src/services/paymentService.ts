import apiClient from './client';
import { ApiResponse } from './types';

export const subscriptionAPI = {
  getUserSubscription: () =>
    apiClient.get<ApiResponse<any>>('/api/subscription/user'),
  
  upgradeSubscription: (planType: 'FREE' | 'MONTHLY' | 'ANNUALLY') =>
    apiClient.put<ApiResponse<any>>('/api/subscription/upgrade', null, { params: { planType } }),
};

export const paymentAPI = {
  createPaymentLink: (planType: 'FREE' | 'MONTHLY' | 'ANNUALLY') =>
    apiClient.post<ApiResponse<any>>(`/api/payment/${planType}`),
};
