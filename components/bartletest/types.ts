export interface EvaluationData {
  achieverPercentage: number;
  explorerPercentage: number;
  socializerPercentage: number;
  killerPercentage: number;
}

export interface QuestionType {
  id: number;
  text: string;
  option0: string;
  option1: string;
  answer: boolean | null;
}
