import { z } from 'zod';

// Station 1 Schemas
export const analyzeTextSchema = z.object({
  fullText: z.string().min(100, 'النص يجب أن يحتوي على 100 حرف على الأقل'),
  projectName: z.string().min(1, 'اسم المشروع مطلوب'),
  proseFilePath: z.string().optional()
});

export const characterAnalysisSchema = z.object({
  personalityTraits: z.string(),
  motivationsGoals: z.string(),
  keyRelationshipsBrief: z.string(),
  narrativeFunction: z.string(),
  potentialArcObservation: z.string()
});

export const relationshipAnalysisSchema = z.object({
  keyRelationships: z.array(z.object({
    characters: z.tuple([z.string(), z.string()]),
    dynamic: z.string(),
    narrativeImportance: z.string()
  }))
});

export const narrativeStyleSchema = z.object({
  overallTone: z.string(),
  pacingAnalysis: z.string(),
  languageStyle: z.string()
});

export const station1ResponseSchema = z.object({
  majorCharacters: z.array(z.string()),
  characterAnalysis: z.record(z.string(), characterAnalysisSchema),
  relationshipAnalysis: relationshipAnalysisSchema,
  narrativeStyleAnalysis: narrativeStyleSchema,
  metadata: z.object({
    analysisTimestamp: z.string(),
    status: z.enum(['Success', 'Partial', 'Failed'])
  })
});

// Types
export type AnalyzeTextRequest = z.infer<typeof analyzeTextSchema>;
export type Station1Response = z.infer<typeof station1ResponseSchema>;
export type CharacterAnalysisResult = z.infer<typeof characterAnalysisSchema>;
export type RelationshipAnalysisResult = z.infer<typeof relationshipAnalysisSchema>;
export type NarrativeStyleResult = z.infer<typeof narrativeStyleSchema>;