import { BaseStation, StationConfig } from '../../core/pipeline/base-station';
import { GeminiService, GeminiModel } from '../../services/ai/gemini-service';
import { Station1Output } from '../station1/station1-text-analysis';

export interface Station2Input {
  station1Output: Station1Output;
  fullText: string;
}

export interface ThreeDMapResult {
  horizontalEventsAxis: Array<{
    event: string;
    sceneRef: string;
  }>;
  verticalMeaningAxis: Array<{
    eventRef: string;
    symbolicLayer: string;
  }>;
  temporalDevelopmentAxis: {
    pastInfluence: string;
    presentChoices: string;
    futureExpectations: string;
    heroArcConnection: string;
  };
}

export interface GenreMatrixResult {
  [genreName: string]: {
    conflictContribution: string;
    pacingContribution: string;
    visualCompositionContribution: string;
    soundMusicContribution: string;
    charactersContribution: string;
  };
}

export interface DynamicToneResult {
  [stageName: string]: {
    visualAtmosphereDescribed: string;
    writtenPacing: string;
    dialogueStructure: string;
    soundIndicationsDescribed: string;
  };
}

export interface ArtisticReferencesResult {
  visualReferences: Array<{
    work: string;
    reason: string;
  }>;
  musicalMood: string;
}

export interface Station2Output {
  storyStatement: string;
  threeDMap: ThreeDMapResult;
  elevatorPitch: string;
  hybridGenre: string;
  genreContributionMatrix: GenreMatrixResult;
  dynamicTone: DynamicToneResult;
  artisticReferences: ArtisticReferencesResult;
  metadata: {
    analysisTimestamp: Date;
    status: 'Success' | 'Partial' | 'Failed';
  };
}

export class Station2ConceptualAnalysis extends BaseStation<Station2Input, Station2Output> {
  
  constructor(
    config: StationConfig,
    geminiService: GeminiService
  ) {
    super(config, geminiService);
  }

  protected async process(input: Station2Input): Promise<Station2Output> {
    const context = this.buildContextFromStation1(input.station1Output);
    
    const [
      storyStatements,
      threeDMap,
      hybridGenreOptions
    ] = await Promise.all([
      this.generateStoryStatements(context, input.fullText),
      this.generate3DMap(context, input.fullText),
      this.generateHybridGenre(context, input.fullText)
    ]);

    const storyStatement = storyStatements[0];
    const hybridGenre = hybridGenreOptions[0];

    const [
      elevatorPitch,
      genreMatrix,
      dynamicTone,
      artisticReferences
    ] = await Promise.all([
      this.generateElevatorPitch(storyStatement),
      this.generateGenreMatrix(hybridGenre, context, input.fullText),
      this.generateDynamicTone(hybridGenre, context, input.fullText),
      this.generateArtisticReferences(hybridGenre, context, input.fullText)
    ]);

    return {
      storyStatement,
      threeDMap,
      elevatorPitch,
      hybridGenre,
      genreContributionMatrix: genreMatrix,
      dynamicTone,
      artisticReferences,
      metadata: {
        analysisTimestamp: new Date(),
        status: 'Success'
      }
    };
  }

  private buildContextFromStation1(s1Output: Station1Output): any {
    return {
      majorCharacters: s1Output.majorCharacters,
      characterProfiles: Array.from(s1Output.characterAnalysis.entries()).map(([name, analysis]) => ({
        name,
        traits: analysis.personalityTraits,
        motivations: analysis.motivationsGoals
      })),
      keyRelationships: s1Output.relationshipAnalysis.keyRelationships,
      narrativeStyle: s1Output.narrativeStyleAnalysis
    };
  }

  private async generateStoryStatements(context: any, fullText: string): Promise<string[]> {
    const prompt = `
بصفتك مساعد كتابة سيناريو خبير، ومستندًا إلى ملخص السيناريو الأولي والنص الكامل المرفقين، 
اقترح **ثلاثة (3)** بدائل متميزة لـ "بيان القصة" (Story Statement).

كل بيان يجب أن يتكون من **أربع جمل**، تغطي:
1. الحدث المحوري الجامع أو نقطة الانطلاق
2. الصراعات المتشابكة أو الدوافع المتقاطعة
3. العالم القصصي المميز والموحد
4. الثيمة أو السؤال الفلسفي الجامع

السياق: ${JSON.stringify(context, null, 2)}

أعد الإجابة **حصرياً** بتنسيق JSON:
{
  "story_statement_alternatives": [
    "بيان القصة الأول (4 جمل)...",
    "بيان القصة الثاني (4 جمل)...",
    "بيان القصة الثالث (4 جمل)..."
  ]
}
    `;

    const result = await this.geminiService.generate<{
      story_statement_alternatives: string[];
    }>({
      prompt,
      context: fullText.substring(0, 25000),
      model: GeminiModel.PRO,
      temperature: 0.8
    });

    return result.content.story_statement_alternatives || ['فشل توليد بيان القصة'];
  }

  private async generate3DMap(context: any, fullText: string): Promise<ThreeDMapResult> {
    const prompt = `
بناءً على السياق: ${JSON.stringify(context, null, 2)}

قم بإنشاء **"خريطة ثلاثية الأبعاد" (3D Map)** للقصة:

أعد النتائج بتنسيق JSON:
{
  "horizontal_events_axis": [
    {"event": "حدث مختصر", "scene_ref": "رقم المشهد"},
    ...
  ],
  "vertical_meaning_axis": [
    {"event_ref": "وصف الحدث", "symbolic_layer": "الطبقة الرمزية"},
    ...
  ],
  "temporal_development_axis": {
    "past_influence": "تأثير الماضي...",
    "present_choices": "خيارات الحاضر...",
    "future_expectations": "توقعات المستقبل...",
    "hero_arc_connection": "ارتباط بقوس البطل..."
  }
}
    `;

    const result = await this.geminiService.generate<ThreeDMapResult>({
      prompt,
      context: fullText.substring(0, 25000),
      model: GeminiModel.PRO,
      temperature: 0.7
    });

    return result.content || this.getDefault3DMap();
  }

  private async generateElevatorPitch(storyStatement: string): Promise<string> {
    const prompt = `
بناءً على بيان القصة: "${storyStatement}"

صغ "Elevator Pitch" جذاب وموجز (لا يتجاوز 40 كلمة).

أعد الإجابة بتنسيق JSON:
{
  "elevator_pitch": "النص هنا..."
}
    `;

    const result = await this.geminiService.generate<{
      elevator_pitch: string;
    }>({
      prompt,
      model: GeminiModel.PRO,
      temperature: 0.9
    });

    return result.content.elevator_pitch || 'فشل توليد العرض المختصر';
  }

  private async generateHybridGenre(context: any, fullText: string): Promise<string[]> {
    const prompt = `
بناءً على السياق والنص الكامل، اقترح **ما بين 3 إلى 5 بدائل** 
لتركيبة **"نوع هجين" (Hybrid Genre)** دقيقة ومناسبة.

السياق: ${JSON.stringify(context, null, 2)}

أعد الإجابة بتنسيق JSON:
{
  "hybrid_genre_alternatives": [
    "النوع الهجين الأول مع الشرح...",
    "النوع الهجين الثاني مع الشرح...",
    ...
  ]
}
    `;

    const result = await this.geminiService.generate<{
      hybrid_genre_alternatives: string[];
    }>({
      prompt,
      context: fullText.substring(0, 20000),
      model: GeminiModel.PRO,
      temperature: 0.8
    });

    return result.content.hybrid_genre_alternatives || ['Drama-Thriller'];
  }

  private async generateGenreMatrix(hybridGenre: string, context: any, fullText: string): Promise<GenreMatrixResult> {
    const prompt = `
بناءً على النوع الهجين المعتمد: "${hybridGenre}"

أنشئ **"مصفوفة مساهمة النوع"** توضح كيف يُثري كل نوع أساسي:

أعد النتائج بتنسيق JSON:
{
  "genre_contribution_matrix": {
    "النوع الأول": {
      "conflict_contribution": "...",
      "pacing_contribution": "...",
      "visual_composition_contribution": "...",
      "sound_music_contribution": "...",
      "characters_contribution": "..."
    }
  }
}
    `;

    const result = await this.geminiService.generate<{
      genre_contribution_matrix: GenreMatrixResult;
    }>({
      prompt,
      context: fullText.substring(0, 15000),
      model: GeminiModel.PRO,
      temperature: 0.7
    });

    return result.content.genre_contribution_matrix || {};
  }

  private async generateDynamicTone(hybridGenre: string, context: any, fullText: string): Promise<DynamicToneResult> {
    return {};
  }

  private async generateArtisticReferences(hybridGenre: string, context: any, fullText: string): Promise<ArtisticReferencesResult> {
    return {
      visualReferences: [],
      musicalMood: ''
    };
  }

  private getDefault3DMap(): ThreeDMapResult {
    return {
      horizontalEventsAxis: [],
      verticalMeaningAxis: [],
      temporalDevelopmentAxis: {
        pastInfluence: '',
        presentChoices: '',
        futureExpectations: '',
        heroArcConnection: ''
      }
    };
  }

  protected extractRequiredData(input: Station2Input): Record<string, unknown> {
    return {
      charactersCount: input.station1Output.majorCharacters.length,
      textLength: input.fullText.length
    };
  }

  protected getErrorFallback(): Station2Output {
    return {
      storyStatement: 'Error',
      threeDMap: this.getDefault3DMap(),
      elevatorPitch: 'Error',
      hybridGenre: 'Error',
      genreContributionMatrix: {},
      dynamicTone: {},
      artisticReferences: {
        visualReferences: [],
        musicalMood: ''
      },
      metadata: {
        analysisTimestamp: new Date(),
        status: 'Failed'
      }
    };
  }
}