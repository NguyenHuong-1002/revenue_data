import api from '@/lib/axios';

export interface ReportQueryDto {
  fromMonth?: string;
  toMonth?: string;
  topN?: number;
}

export const reportService = {
  exportGrowthPdf(params?: ReportQueryDto) {
    return api.get<Blob>('/reports/growth/pdf', {
      params,
      responseType: 'blob',
    });
  },

  exportGrowthExcel(params?: ReportQueryDto) {
    return api.get<Blob>('/reports/growth/excel', {
      params,
      responseType: 'blob',
    });
  },

  exportRevenuePdf(params?: ReportQueryDto) {
    return api.get<Blob>('/reports/revenue/pdf', {
      params,
      responseType: 'blob',
    });
  },

  exportRevenueExcel(params?: ReportQueryDto) {
    return api.get<Blob>('/reports/revenue/excel', {
      params,
      responseType: 'blob',
    });
  },
};

export type ReportService = typeof reportService;
