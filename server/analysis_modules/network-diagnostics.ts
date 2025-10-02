import { ConflictNetwork, Character, Conflict, Relationship } from '../core/models/base-entities';

export interface DiagnosticReport {
  overallHealthScore: number;
  criticalityLevel: 'healthy' | 'minor_issues' | 'moderate_issues' | 'major_issues' | 'critical';
  structuralIssues: StructuralIssue[];
  isolatedCharacters: {
    totalIsolated: number;
    characters: IsolatedCharacterIssue[];
  };
  abandonedConflicts: {
    totalAbandoned: number;
    conflicts: AbandonedConflictIssue[];
  };
  overloadedCharacters: {
    totalOverloaded: number;
    characters: OverloadedCharacterIssue[];
  };
  weakConnections: {
    totalWeak: number;
    connections: WeakConnectionIssue[];
  };
  redundancies: {
    totalRedundant: number;
    items: RedundancyIssue[];
  };
}

export interface StructuralIssue {
  type: 'disconnected_components' | 'single_point_failure' | 'circular_dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedElements: string[];
}

export interface IsolatedCharacterIssue {
  characterName: string;
  characterId: string;
  isolationType: 'completely_isolated' | 'weakly_connected' | 'conflict_isolated';
  suggestedConnections: string[];
}

export interface AbandonedConflictIssue {
  conflictName: string;
  conflictId: string;
  issueType: 'stuck_in_phase' | 'no_progression' | 'weak_involvement';
  daysInactive: number;
  suggestedActions: string[];
}

export interface OverloadedCharacterIssue {
  characterName: string;
  characterId: string;
  overloadType: 'too_many_conflicts' | 'too_many_relationships' | 'central_bottleneck';
  currentLoad: number;
  recommendedLoad: number;
  suggestedDistribution: string[];
}

export interface WeakConnectionIssue {
  connectionType: 'relationship' | 'conflict_involvement';
  elementId: string;
  weakness: string;
  strengthScore: number;
  improvementSuggestions: string[];
}

export interface RedundancyIssue {
  redundancyType: 'duplicate_relationships' | 'similar_conflicts' | 'overlapping_characters';
  affectedElements: string[];
  redundancyScore: number;
  consolidationSuggestion: string;
}

export class NetworkDiagnostics {
  private network: ConflictNetwork;

  constructor(network: ConflictNetwork) {
    this.network = network;
  }

  runAllDiagnostics(): DiagnosticReport {
    const structuralIssues = this.analyzeStructuralIssues();
    const isolatedCharacters = this.findIsolatedCharacters();
    const abandonedConflicts = this.findAbandonedConflicts();
    const overloadedCharacters = this.findOverloadedCharacters();
    const weakConnections = this.findWeakConnections();
    const redundancies = this.findRedundancies();

    const overallHealthScore = this.calculateOverallHealth({
      structuralIssues,
      isolatedCharacters,
      abandonedConflicts,
      overloadedCharacters,
      weakConnections,
      redundancies
    });

    return {
      overallHealthScore,
      criticalityLevel: this.determineCriticalityLevel(overallHealthScore),
      structuralIssues,
      isolatedCharacters,
      abandonedConflicts,
      overloadedCharacters,
      weakConnections,
      redundancies
    };
  }

  private analyzeStructuralIssues(): StructuralIssue[] {
    const issues: StructuralIssue[] = [];

    // Check for disconnected components
    const components = this.findConnectedComponents();
    if (components.length > 1) {
      issues.push({
        type: 'disconnected_components',
        severity: 'high',
        description: `الشبكة مقسمة إلى ${components.length} مكونات منفصلة`,
        affectedElements: components.flat()
      });
    }

    // Check for single points of failure
    const criticalNodes = this.findCriticalNodes();
    if (criticalNodes.length > 0) {
      issues.push({
        type: 'single_point_failure',
        severity: 'medium',
        description: 'توجد شخصيات حرجة قد تؤدي إزالتها لانهيار الشبكة',
        affectedElements: criticalNodes
      });
    }

    return issues;
  }

  private findIsolatedCharacters(): {
    totalIsolated: number;
    characters: IsolatedCharacterIssue[];
  } {
    const isolatedChars: IsolatedCharacterIssue[] = [];

    for (const character of this.network.characters.values()) {
      const relationships = this.getCharacterRelationships(character.id);
      const conflicts = this.getCharacterConflicts(character.id);

      if (relationships.length === 0 && conflicts.length === 0) {
        isolatedChars.push({
          characterName: character.name,
          characterId: character.id,
          isolationType: 'completely_isolated',
          suggestedConnections: this.suggestConnectionsForCharacter(character.id)
        });
      } else if (relationships.length <= 1 && conflicts.length === 0) {
        isolatedChars.push({
          characterName: character.name,
          characterId: character.id,
          isolationType: 'weakly_connected',
          suggestedConnections: this.suggestConnectionsForCharacter(character.id)
        });
      } else if (relationships.length > 0 && conflicts.length === 0) {
        isolatedChars.push({
          characterName: character.name,
          characterId: character.id,
          isolationType: 'conflict_isolated',
          suggestedConnections: this.suggestConflictInvolvement(character.id)
        });
      }
    }

    return {
      totalIsolated: isolatedChars.length,
      characters: isolatedChars
    };
  }

  private findAbandonedConflicts(): {
    totalAbandoned: number;
    conflicts: AbandonedConflictIssue[];
  } {
    const abandonedConflicts: AbandonedConflictIssue[] = [];

    for (const conflict of this.network.conflicts.values()) {
      const daysSinceLastUpdate = this.calculateDaysSinceLastUpdate(conflict);
      
      if (daysSinceLastUpdate > 30) {
        abandonedConflicts.push({
          conflictName: conflict.name,
          conflictId: conflict.id,
          issueType: 'stuck_in_phase',
          daysInactive: daysSinceLastUpdate,
          suggestedActions: this.suggestConflictActions(conflict)
        });
      } else if (conflict.strength < 3) {
        abandonedConflicts.push({
          conflictName: conflict.name,
          conflictId: conflict.id,
          issueType: 'weak_involvement',
          daysInactive: daysSinceLastUpdate,
          suggestedActions: this.suggestConflictActions(conflict)
        });
      }
    }

    return {
      totalAbandoned: abandonedConflicts.length,
      conflicts: abandonedConflicts
    };
  }

  private findOverloadedCharacters(): {
    totalOverloaded: number;
    characters: OverloadedCharacterIssue[];
  } {
    const overloadedChars: OverloadedCharacterIssue[] = [];

    for (const character of this.network.characters.values()) {
      const relationships = this.getCharacterRelationships(character.id);
      const conflicts = this.getCharacterConflicts(character.id);
      
      const totalLoad = relationships.length + conflicts.length * 2; // Conflicts weighted more
      
      if (totalLoad > 8) { // Threshold for overload
        overloadedChars.push({
          characterName: character.name,
          characterId: character.id,
          overloadType: 'central_bottleneck',
          currentLoad: totalLoad,
          recommendedLoad: 6,
          suggestedDistribution: this.suggestLoadDistribution(character.id)
        });
      }
    }

    return {
      totalOverloaded: overloadedChars.length,
      characters: overloadedChars
    };
  }

  private findWeakConnections(): {
    totalWeak: number;
    connections: WeakConnectionIssue[];
  } {
    const weakConnections: WeakConnectionIssue[] = [];

    // Check weak relationships
    for (const relationship of this.network.relationships.values()) {
      if (relationship.strength < 4) {
        weakConnections.push({
          connectionType: 'relationship',
          elementId: relationship.id,
          weakness: 'قوة العلاقة ضعيفة',
          strengthScore: relationship.strength,
          improvementSuggestions: [
            'أضف مشاهد تفاعل أكثر بين الشخصيتين',
            'طور الخلفية المشتركة للشخصيتين',
            'أنشئ صراعاً يجمع بينهما'
          ]
        });
      }
    }

    // Check weak conflict involvement
    for (const conflict of this.network.conflicts.values()) {
      if (conflict.strength < 4) {
        weakConnections.push({
          connectionType: 'conflict_involvement',
          elementId: conflict.id,
          weakness: 'مشاركة ضعيفة في الصراع',
          strengthScore: conflict.strength,
          improvementSuggestions: [
            'زد من حدة الصراع',
            'أضف نقاط تحول مهمة',
            'اربط الصراع بدوافع الشخصيات الأساسية'
          ]
        });
      }
    }

    return {
      totalWeak: weakConnections.length,
      connections: weakConnections
    };
  }

  private findRedundancies(): {
    totalRedundant: number;
    items: RedundancyIssue[];
  } {
    const redundancies: RedundancyIssue[] = [];

    // Check for duplicate relationships
    const relationshipPairs = this.findDuplicateRelationships();
    for (const pair of relationshipPairs) {
      redundancies.push({
        redundancyType: 'duplicate_relationships',
        affectedElements: pair,
        redundancyScore: 0.8,
        consolidationSuggestion: 'دمج العلاقات المتشابهة في علاقة واحدة أقوى'
      });
    }

    // Check for similar conflicts
    const conflictGroups = this.findSimilarConflicts();
    for (const group of conflictGroups) {
      if (group.length > 1) {
        redundancies.push({
          redundancyType: 'similar_conflicts',
          affectedElements: group,
          redundancyScore: 0.7,
          consolidationSuggestion: 'دمج الصراعات المتشابهة في صراع واحد أكثر تعقيداً'
        });
      }
    }

    return {
      totalRedundant: redundancies.length,
      items: redundancies
    };
  }

  // Helper methods
  private getCharacterRelationships(characterId: string): Relationship[] {
    return Array.from(this.network.relationships.values()).filter(
      rel => rel.source === characterId || rel.target === characterId
    );
  }

  private getCharacterConflicts(characterId: string): Conflict[] {
    return Array.from(this.network.conflicts.values()).filter(
      conflict => conflict.involvedCharacters.includes(characterId)
    );
  }

  private findConnectedComponents(): string[][] {
    // Simple connected components algorithm
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const charId of this.network.characters.keys()) {
      if (!visited.has(charId)) {
        const component = this.dfsComponent(charId, visited);
        components.push(component);
      }
    }

    return components;
  }

  private dfsComponent(startId: string, visited: Set<string>): string[] {
    const component: string[] = [];
    const stack = [startId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (visited.has(currentId)) continue;

      visited.add(currentId);
      component.push(currentId);

      // Add connected characters
      const relationships = this.getCharacterRelationships(currentId);
      for (const rel of relationships) {
        const otherId = rel.source === currentId ? rel.target : rel.source;
        if (!visited.has(otherId)) {
          stack.push(otherId);
        }
      }
    }

    return component;
  }

  private findCriticalNodes(): string[] {
    // Characters whose removal would disconnect the network
    const criticalNodes: string[] = [];
    
    for (const charId of this.network.characters.keys()) {
      const relationships = this.getCharacterRelationships(charId);
      if (relationships.length >= 3) { // High connectivity threshold
        criticalNodes.push(charId);
      }
    }

    return criticalNodes;
  }

  private suggestConnectionsForCharacter(characterId: string): string[] {
    const suggestions: string[] = [];
    const character = this.network.characters.get(characterId);
    
    if (character) {
      // Find characters with similar traits or roles
      for (const otherChar of this.network.characters.values()) {
        if (otherChar.id !== characterId) {
          suggestions.push(`ربط مع الشخصية: ${otherChar.name}`);
          if (suggestions.length >= 3) break;
        }
      }
    }

    return suggestions;
  }

  private suggestConflictInvolvement(characterId: string): string[] {
    const suggestions: string[] = [];
    const conflicts = Array.from(this.network.conflicts.values());
    
    for (const conflict of conflicts.slice(0, 2)) {
      suggestions.push(`إشراك في الصراع: ${conflict.name}`);
    }

    return suggestions;
  }

  private calculateDaysSinceLastUpdate(conflict: Conflict): number {
    if (conflict.timestamps.length === 0) return 365; // Very old
    
    const lastUpdate = conflict.timestamps[conflict.timestamps.length - 1];
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private suggestConflictActions(conflict: Conflict): string[] {
    return [
      'تطوير الصراع إلى المرحلة التالية',
      'إضافة نقطة تحول جديدة',
      'زيادة مشاركة الشخصيات',
      'ربط الصراع بصراعات أخرى'
    ];
  }

  private suggestLoadDistribution(characterId: string): string[] {
    return [
      'نقل بعض العلاقات لشخصيات أخرى',
      'تقسيم الصراعات الكبيرة',
      'إنشاء شخصيات مساعدة'
    ];
  }

  private findDuplicateRelationships(): string[][] {
    const duplicates: string[][] = [];
    const relationships = Array.from(this.network.relationships.values());
    
    for (let i = 0; i < relationships.length; i++) {
      for (let j = i + 1; j < relationships.length; j++) {
        const rel1 = relationships[i];
        const rel2 = relationships[j];
        
        if (this.areRelationshipsSimilar(rel1, rel2)) {
          duplicates.push([rel1.id, rel2.id]);
        }
      }
    }
    
    return duplicates;
  }

  private findSimilarConflicts(): string[][] {
    const groups: string[][] = [];
    const conflicts = Array.from(this.network.conflicts.values());
    const processed = new Set<string>();
    
    for (const conflict of conflicts) {
      if (processed.has(conflict.id)) continue;
      
      const similarGroup = [conflict.id];
      processed.add(conflict.id);
      
      for (const otherConflict of conflicts) {
        if (otherConflict.id !== conflict.id && !processed.has(otherConflict.id)) {
          if (this.areConflictsSimilar(conflict, otherConflict)) {
            similarGroup.push(otherConflict.id);
            processed.add(otherConflict.id);
          }
        }
      }
      
      if (similarGroup.length > 1) {
        groups.push(similarGroup);
      }
    }
    
    return groups;
  }

  private areRelationshipsSimilar(rel1: Relationship, rel2: Relationship): boolean {
    return (
      rel1.type === rel2.type &&
      ((rel1.source === rel2.source && rel1.target === rel2.target) ||
       (rel1.source === rel2.target && rel1.target === rel2.source))
    );
  }

  private areConflictsSimilar(conflict1: Conflict, conflict2: Conflict): boolean {
    return (
      conflict1.subject === conflict2.subject &&
      conflict1.scope === conflict2.scope &&
      this.hasOverlappingCharacters(conflict1.involvedCharacters, conflict2.involvedCharacters)
    );
  }

  private hasOverlappingCharacters(chars1: string[], chars2: string[]): boolean {
    return chars1.some(char => chars2.includes(char));
  }

  private calculateOverallHealth(issues: any): number {
    let score = 100;
    
    // Deduct points for each type of issue
    score -= issues.structuralIssues.length * 15;
    score -= issues.isolatedCharacters.totalIsolated * 10;
    score -= issues.abandonedConflicts.totalAbandoned * 8;
    score -= issues.overloadedCharacters.totalOverloaded * 12;
    score -= issues.weakConnections.totalWeak * 5;
    score -= issues.redundancies.totalRedundant * 7;
    
    return Math.max(0, score);
  }

  private determineCriticalityLevel(score: number): 'healthy' | 'minor_issues' | 'moderate_issues' | 'major_issues' | 'critical' {
    if (score >= 85) return 'healthy';
    if (score >= 70) return 'minor_issues';
    if (score >= 50) return 'moderate_issues';
    if (score >= 30) return 'major_issues';
    return 'critical';
  }
}