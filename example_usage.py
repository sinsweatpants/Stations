#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
مثال عملي شامل لاستخدام نظام تحليل النصوص الدرامية
=======================================================

هذا المثال يوضح كيفية استخدام النظام بشكل كامل من البداية للنهاية.

المؤلف: نظام تحليل النصوص الدرامية
الإصدار: 2.0.0
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# إضافة المسار للوصول للمكتبات
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# استيراد المكتبات الأساسية
from core.base_entities import (
    ConflictNetwork,
    Character,
    Relationship,
    Conflict,
    RelationshipType,
    RelationshipNature,
    ConflictPhase,
    ConflictSubject,
    ConflictScope
)

# استيراد وحدات التحليل
from analysis_modules.network_diagnostics import NetworkDiagnostics, diagnose_network
from analysis_modules.treatment_strategies import TreatmentStrategies, generate_treatments
from analysis_modules.efficiency_metrics import EfficiencyMetrics


def print_section(title):
    """طباعة عنوان قسم منسق"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")


def example_1_basic_network_creation():
    """
    مثال 1: إنشاء شبكة صراع بسيطة يدوياً
    """
    print_section("مثال 1: إنشاء شبكة صراع بسيطة")
    
    # إنشاء الشبكة
    network = ConflictNetwork("قصة الحب والخيانة")
    print(f"✓ تم إنشاء الشبكة: {network.name}")
    
    # إضافة شخصيات
    char1 = Character(
        id="char1",
        name="علي",
        description="شاب طموح يسعى للعدالة"
    )
    char1.profile = {
        "personality_traits": "شجاع، متهور، مخلص",
        "motivations_goals": "البحث عن الحقيقة والانتقام لوالده",
        "potential_arc": "من الانتقام إلى العفو"
    }
    
    char2 = Character(
        id="char2",
        name="فاطمة",
        description="فتاة قوية وذكية"
    )
    char2.profile = {
        "personality_traits": "ذكية، حذرة، عاطفية",
        "motivations_goals": "حماية عائلتها وإنقاذ علي من نفسه",
        "potential_arc": "من الخوف إلى الشجاعة"
    }
    
    char3 = Character(
        id="char3",
        name="أحمد",
        description="الخصم القوي"
    )
    char3.profile = {
        "personality_traits": "قاسي، ذكي، مخادع",
        "motivations_goals": "الحفاظ على السلطة بأي ثمن",
        "potential_arc": "من القوة إلى السقوط"
    }
    
    network.add_character(char1)
    network.add_character(char2)
    network.add_character(char3)
    print(f"✓ تم إضافة {len(network.characters)} شخصيات")
    
    # إضافة علاقات
    rel1 = Relationship(
        id="rel1",
        source="char1",
        target="char2",
        type=RelationshipType.LOVE,
        nature=RelationshipNature.POSITIVE,
        strength=8,
        description="علاقة حب قوية"
    )
    
    rel2 = Relationship(
        id="rel2",
        source="char1",
        target="char3",
        type=RelationshipType.ENMITY,
        nature=RelationshipNature.NEGATIVE,
        strength=9,
        description="عداوة مستحكمة"
    )
    
    network.add_relationship(rel1)
    network.add_relationship(rel2)
    print(f"✓ تم إضافة {len(network.relationships)} علاقات")
    
    # إضافة صراعات
    conflict1 = Conflict(
        id="conf1",
        name="الصراع على العدالة",
        description="علي يسعى لفضح أحمد وتحقيق العدالة",
        involved_characters=["char1", "char3"],
        subject=ConflictSubject.VALUE,
        scope=ConflictScope.PERSONAL,
        phase=ConflictPhase.ESCALATING,
        strength=8
    )
    conflict1.related_relationships = ["rel2"]
    conflict1.timestamps = [datetime.now()]
    
    network.add_conflict(conflict1)
    print(f"✓ تم إضافة {len(network.conflicts)} صراعات")
    
    # إنشاء لقطة
    network.create_snapshot("الحالة الأولية للشبكة")
    print(f"✓ تم إنشاء لقطة زمنية")
    
    # عرض ملخص
    print("\nملخص الشبكة:")
    print(f"  • الشخصيات: {len(network.characters)}")
    print(f"  • العلاقات: {len(network.relationships)}")
    print(f"  • الصراعات: {len(network.conflicts)}")
    print(f"  • اللقطات: {len(network.snapshots)}")
    
    return network


def example_2_network_diagnostics(network):
    """
    مثال 2: تشخيص الشبكة
    """
    print_section("مثال 2: تشخيص شامل للشبكة")
    
    # تشغيل التشخيص
    print("🔍 جاري تشغيل التشخيص الشامل...")
    diagnostics = NetworkDiagnostics(network)
    report = diagnostics.run_all_diagnostics()
    
    # عرض النتائج
    print(f"\n📊 درجة الصحة: {report['overall_health_score']:.1f}/100")
    print(f"⚠️  مستوى الخطورة: {report['criticality_level']}")
    
    print(f"\n📋 المشاكل المكتشفة:")
    print(f"  • مشاكل هيكلية: {len(report['structural_issues'])}")
    print(f"  • شخصيات معزولة: {report['isolated_characters']['total_isolated']}")
    print(f"  • صراعات مهملة: {report['abandoned_conflicts']['total_abandoned']}")
    print(f"  • شخصيات محملة: {report['overloaded_characters']['total_overloaded']}")
    print(f"  • اتصالات ضعيفة: {report['weak_connections']['total_weak']}")
    print(f"  • تكرارات: {report['redundancy_issues']['total_redundant']}")
    
    # عرض الملخص
    print(f"\n{report['summary']}")
    
    return report


def example_3_treatment_strategies(network, diagnostics_report):
    """
    مثال 3: توليد استراتيجيات العلاج
    """
    print_section("مثال 3: استراتيجيات العلاج المقترحة")
    
    # توليد الاستراتيجيات
    print("💡 جاري توليد استراتيجيات العلاج...")
    treatment = TreatmentStrategies(network, diagnostics_report)
    recommendations = treatment.analyze_and_recommend_treatments()
    
    # عرض الإجراءات ذات الأولوية
    print(f"\n🎯 الإجراءات ذات الأولوية ({len(recommendations['prioritized_actions'])}):")
    for i, action in enumerate(recommendations['prioritized_actions'][:3], 1):
        print(f"\n  {i}. [{action['priority'].upper()}] {action['description']}")
        print(f"     الوقت المقدر: {action['estimated_time']}")
        print(f"     الجهد: {action['effort']}")
    
    # عرض الإصلاحات السريعة
    if recommendations['quick_fixes']:
        print(f"\n⚡ إصلاحات سريعة ({len(recommendations['quick_fixes'])}):")
        for i, fix in enumerate(recommendations['quick_fixes'][:2], 1):
            print(f"\n  {i}. {fix['description']}")
            print(f"     الوقت: {fix['estimated_time']}")
    
    # عرض الملخص الموحد
    print(f"\n{recommendations['consolidated_summary']}")
    
    return recommendations


def example_4_efficiency_metrics(network):
    """
    مثال 4: قياس مقاييس الكفاءة
    """
    print_section("مثال 4: مقاييس الكفاءة والفعالية")
    
    # حساب المقاييس
    print("📈 جاري حساب مقاييس الكفاءة...")
    efficiency = EfficiencyMetrics(network)
    metrics = efficiency.analyze_efficiency()
    
    # عرض النتائج
    print(f"\n📊 النتائج:")
    print(f"  • الدرجة الإجمالية: {metrics.get('overall_efficiency_score', 0):.2f}")
    print(f"  • التصنيف: {metrics.get('overall_rating', 'N/A')}")
    print(f"  • تماسك الصراع: {metrics.get('conflict_cohesion', 0):.2f}")
    
    if 'dramatic_balance' in metrics:
        balance = metrics['dramatic_balance']
        print(f"  • التوازن الدرامي: {balance.get('balance_score', 0):.2f}")
        print(f"  • معامل جيني: {balance.get('character_involvement_gini', 0):.2f}")
    
    if 'narrative_efficiency' in metrics:
        eff = metrics['narrative_efficiency']
        print(f"  • كفاءة السرد: {eff.get('narrative_efficiency_score', 0):.2f}")
    
    return metrics


def example_5_export_results(network, diagnostics, treatments, metrics):
    """
    مثال 5: تصدير النتائج
    """
    print_section("مثال 5: تصدير النتائج")
    
    # إنشاء مجلد المخرجات
    output_dir = Path("example_output")
    output_dir.mkdir(exist_ok=True)
    print(f"✓ تم إنشاء مجلد المخرجات: {output_dir}")
    
    # تصدير ملخص الشبكة
    network_summary = {
        "network_name": network.name,
        "characters": {char.id: char.name for char in network.characters.values()},
        "relationships_count": len(network.relationships),
        "conflicts_count": len(network.conflicts),
        "created_at": datetime.now().isoformat()
    }
    
    with open(output_dir / "network_summary.json", 'w', encoding='utf-8') as f:
        json.dump(network_summary, f, ensure_ascii=False, indent=2)
    print("✓ تم حفظ: network_summary.json")
    
    # تصدير التشخيص
    with open(output_dir / "diagnostics_report.json", 'w', encoding='utf-8') as f:
        json.dump(diagnostics, f, ensure_ascii=False, indent=2, default=str)
    print("✓ تم حفظ: diagnostics_report.json")
    
    # تصدير التوصيات
    with open(output_dir / "treatment_recommendations.json", 'w', encoding='utf-8') as f:
        json.dump(treatments, f, ensure_ascii=False, indent=2)
    print("✓ تم حفظ: treatment_recommendations.json")
    
    # تصدير المقاييس
    with open(output_dir / "efficiency_metrics.json", 'w', encoding='utf-8') as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2, default=str)
    print("✓ تم حفظ: efficiency_metrics.json")
    
    # إنشاء تقرير Markdown
    report_md = f"""# تقرير التحليل الشامل

## معلومات الشبكة
- **الاسم**: {network.name}
- **الشخصيات**: {len(network.characters)}
- **العلاقات**: {len(network.relationships)}
- **الصراعات**: {len(network.conflicts)}
- **تاريخ التحليل**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## نتائج التشخيص
- **درجة الصحة**: {diagnostics['overall_health_score']:.1f}/100
- **مستوى الخطورة**: {diagnostics['criticality_level']}

## التوصيات الرئيسية
- إجمالي التوصيات: {treatments['total_recommendations']}
- إجراءات ذات أولوية: {len(treatments['prioritized_actions'])}
- إصلاحات سريعة: {len(treatments['quick_fixes'])}

## مقاييس الكفاءة
- الدرجة الإجمالية: {metrics.get('overall_efficiency_score', 0):.2f}
- التصنيف: {metrics.get('overall_rating', 'N/A')}

---
تم التوليد بواسطة: نظام تحليل النصوص الدرامية v2.0.0
"""
    
    with open(output_dir / "full_report.md", 'w', encoding='utf-8') as f:
        f.write(report_md)
    print("✓ تم حفظ: full_report.md")
    
    print(f"\n✅ تم تصدير جميع النتائج إلى: {output_dir.absolute()}")


def main():
    """
    الدالة الرئيسية لتشغيل جميع الأمثلة
    """
    print("\n" + "="*70)
    print("  🎭 مثال عملي شامل لنظام تحليل النصوص الدرامية")
    print("="*70)
    
    try:
        # مثال 1: إنشاء شبكة
        network = example_1_basic_network_creation()
        
        # مثال 2: تشخيص الشبكة
        diagnostics = example_2_network_diagnostics(network)
        
        # مثال 3: استراتيجيات العلاج
        treatments = example_3_treatment_strategies(network, diagnostics)
        
        # مثال 4: مقاييس الكفاءة
        metrics = example_4_efficiency_metrics(network)
        
        # مثال 5: تصدير النتائج
        example_5_export_results(network, diagnostics, treatments, metrics)
        
        print_section("اكتمل التنفيذ بنجاح! ✅")
        print("🎉 تم تشغيل جميع الأمثلة بنجاح!")
        print("\n💡 نصيحة: راجع المخرجات في مجلد 'example_output'")
        
    except Exception as e:
        print(f"\n❌ خطأ: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
