export const SUPPORTED_FRUITS = ["Mango", "Banana", "Apple", "Orange", "Guava"] as const;
export type SupportedFruit = (typeof SUPPORTED_FRUITS)[number];

export const FRESHNESS_CATEGORIES = ["Fresh", "Ripe", "Overripe", "Damaged", "Rotten"] as const;
export type FreshnessCategory = (typeof FRESHNESS_CATEGORIES)[number];

export interface AnalysisResult {
  fruit_name: string;
  is_supported: boolean;
  fruit_confidence: number; // 0-100
  freshness_category: FreshnessCategory | string;
  freshness_confidence: number;
  freshness_score: number;
  quality_score: number;
  damage_score: number;
  ripeness_score: number;
  recommendation: string;
  observations: string[];
  highlights: Array<{ label: string; x: number; y: number; w: number; h: number }>;
}

export interface ScanRecord extends AnalysisResult {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
}
