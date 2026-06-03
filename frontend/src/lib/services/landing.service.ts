import api from '../axios';

export interface FeatureItem {
  id?: number;
  icon: string;
  title: string;
  description: string;
}

export interface AiInsightItem {
  id?: number;
  icon: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  id?: number;
  name: string;
  role: string;
  content: string;
}

export interface PricingItem {
  id?: number;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string; // JSON string format of array in db
  popular: number;
}

export const landingService = {
  // Features API
  getFeatures: async () => {
    const res = await api.get<FeatureItem[]>('/landing/features');
    return res.data;
  },
  createFeature: async (data: Partial<FeatureItem>) => {
    const res = await api.post<FeatureItem>('/landing/features', data);
    return res.data;
  },
  updateFeature: async (id: number, data: Partial<FeatureItem>) => {
    const res = await api.put<FeatureItem>(`/landing/features/${id}`, data);
    return res.data;
  },
  deleteFeature: async (id: number) => {
    const res = await api.delete<FeatureItem>(`/landing/features/${id}`);
    return res.data;
  },

  // AI Insights API
  getAiInsights: async () => {
    const res = await api.get<AiInsightItem[]>('/landing/ai-insights');
    return res.data;
  },
  createAiInsight: async (data: Partial<AiInsightItem>) => {
    const res = await api.post<AiInsightItem>('/landing/ai-insights', data);
    return res.data;
  },
  updateAiInsight: async (id: number, data: Partial<AiInsightItem>) => {
    const res = await api.put<AiInsightItem>(`/landing/ai-insights/${id}`, data);
    return res.data;
  },
  deleteAiInsight: async (id: number) => {
    const res = await api.delete<AiInsightItem>(`/landing/ai-insights/${id}`);
    return res.data;
  },

  // Testimonials API
  getTestimonials: async () => {
    const res = await api.get<TestimonialItem[]>('/landing/testimonials');
    return res.data;
  },
  createTestimonial: async (data: Partial<TestimonialItem>) => {
    const res = await api.post<TestimonialItem>('/landing/testimonials', data);
    return res.data;
  },
  updateTestimonial: async (id: number, data: Partial<TestimonialItem>) => {
    const res = await api.put<TestimonialItem>(`/landing/testimonials/${id}`, data);
    return res.data;
  },
  deleteTestimonial: async (id: number) => {
    const res = await api.delete<TestimonialItem>(`/landing/testimonials/${id}`);
    return res.data;
  },

  // Pricing API
  getPricing: async () => {
    const res = await api.get<PricingItem[]>('/landing/pricing');
    return res.data;
  },
  createPricing: async (data: Partial<PricingItem>) => {
    const res = await api.post<PricingItem>('/landing/pricing', data);
    return res.data;
  },
  updatePricing: async (id: number, data: Partial<PricingItem>) => {
    const res = await api.put<PricingItem>(`/landing/pricing/${id}`, data);
    return res.data;
  },
  deletePricing: async (id: number) => {
    const res = await api.delete<PricingItem>(`/landing/pricing/${id}`);
    return res.data;
  },
};
