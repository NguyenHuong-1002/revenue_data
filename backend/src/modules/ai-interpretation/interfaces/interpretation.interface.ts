export interface IInterpretationSummary {
  summaryBullets: string[];
  recommendation: string;
}

export interface IInterpretationResponse {
  provider: 'deepseek';
  model: string;
  content: IInterpretationSummary;
  rawContent: string;
}
