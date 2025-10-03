import { BaseStation, type StationConfig } from '../../core/pipeline/base-station';
import { GeminiService, GeminiModel } from '../../services/ai/gemini-service';
import { EfficiencyAnalyzer, EfficiencyMetrics } from '../../analysis_modules/efficiency-metrics';
import { Station3Output } from '../station3/station3-network-builder';
import type { ConflictNetwork } from '../../core/models/base-entities';

export interface Station4Input {
  station3Output: Station3Output;
}

export interface Station4Output {
  efficiencyMetrics: EfficiencyMetrics;
  recommendations: {
    priorityActions: string[];
    quickFixes: string[];
    structuralRevisions: string[];
  };
  metadata: {
    analysisTimestamp: Date;
    status: 'Success' | 'Partial' | 'Failed';
    analysisTime: number;
  };
}

export class Station4EfficiencyMetrics extends BaseStation<Station4Input, Station4Output> {
  private efficiencyAnalyzer: EfficiencyAnalyzer;

  constructor(
    config: StationConfig,
    geminiService: GeminiService
  ) {
    super(config, geminiService);
    this.efficiencyAnalyzer = new EfficiencyAnalyzer();
  }

  protected async process(input: Station4Input): Promise<Station4Output> {
    const startTime = Date.now();
    
    // حساب مقاييس الكفاءة
    const efficiencyMetrics = this.efficiencyAnalyzer.calculateEfficiencyMetrics(
      input.station3Output.conflictNetwork
    );

    // توليد التوصيات بناءً على النتائج
    const recommendations = await this.generateRecommendations(
      efficiencyMetrics,
      input.station3Output.conflictNetwork
    );

    const analysisTime = Date.now() - startTime;

    return {
      efficiencyMetrics,
      recommendations,
      metadata: {
        analysisTimestamp: new Date(),
        status: 'Success',
        analysisTime
      }
    };
  }

  private async generateRecommendations(
    metrics: EfficiencyMetrics,
    _network: ConflictNetwork
  ): Promise<{
    priorityActions: string[];
    quickFixes: string[];
    structuralRevisions: string[];
  }> {
    const context = {
      overallScore: metrics.overallEfficiencyScore,
      rating: metrics.overallRating,
      conflictCohesion: metrics.conflictCohesion,
      dramaticBalance: metrics.dramaticBalance.balanceScore,
      narrativeEfficiency: metrics.narrativeEfficiency,
      redundancy: metrics.redundancyMetrics
    };

    const prompt = `
بناءً على تحليل كفاءة الشبكة الدرامية التالي:

النتيجة الإجمالية: ${metrics.overallEfficiencyScore.toFixed(1)}/100
التصنيف: ${metrics.overallRating}
تماسك الصراع: ${metrics.conflictCohesion.toFixed(2)}
التوازن الدرامي: ${metrics.dramaticBalance.balanceScore.toFixed(2)}

اقترح توصيات محددة وعملية لتحسين الشبكة:

أعد الإجابة بتنسيق JSON:
{
  "priority_actions": [
    "إجراء عالي الأولوية 1",
    "إجراء عالي الأولوية 2",
    "إجراء عالي الأولوية 3"
  ],
  "quick_fixes": [
    "إصلاح سريع 1",
    "إصلاح سريع 2",
    "إصلاح سريع 3"
  ],
  "structural_revisions": [
    "مراجعة هيكلية 1",
    "مراجعة هيكلية 2"
  ]
}
    `;

    const result = await this.geminiService.generate<{
      priority_actions?: string[];
      quick_fixes?: string[];
      structural_revisions?: string[];
    }>({
      prompt,
      model: GeminiModel.PRO,
      temperature: 0.7
    });

    return {
      priorityActions: result.content.priority_actions ?? [],
      quickFixes: result.content.quick_fixes ?? [],
      structuralRevisions: result.content.structural_revisions ?? []
    };
  }

  protected extractRequiredData(input: Station4Input): Record<string, unknown> {
    return {
      charactersCount: input.station3Output.networkSummary.charactersCount,
      relationshipsCount: input.station3Output.networkSummary.relationshipsCount,
      conflictsCount: input.station3Output.networkSummary.conflictsCount
    };
  }

  protected getErrorFallback(): Station4Output {
    return {
      efficiencyMetrics: {
        overallEfficiencyScore: 0,
        overallRating: 'Critical',
        conflictCohesion: 0,
        dramaticBalance: {
          balanceScore: 0,
          characterInvolvementGini: 1
        },
        narrativeEfficiency: {
          characterEfficiency: 0,
          relationshipEfficiency: 0,
          conflictEfficiency: 0
        },
        narrativeDensity: 0,
        redundancyMetrics: {
          characterRedundancy: 0,
          relationshipRedundancy: 0,
          conflictRedundancy: 0
        }
      },
      recommendations: {
        priorityActions: ['خطأ في التحليل'],
        quickFixes: ['خطأ في التحليل'],
        structuralRevisions: ['خطأ في التحليل']
      },
      metadata: {
        analysisTimestamp: new Date(),
        status: 'Failed',
        analysisTime: 0
      }
    };
  }
}