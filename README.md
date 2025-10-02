# 🎭 نظام تحليل النصوص الدرامية المتقدم

## نظرة عامة

نظام شامل ومتكامل لتحليل النصوص السردية والدرامية باستخدام Python وتقنيات الذكاء الاصطناعي. يتكون النظام من **7 محطات متسلسلة**، كل منها متخصصة في جانب محدد من التحليل الدرامي.

### ✨ المميزات الرئيسية

- 🔬 **تحليل متعدد المستويات**: من تحليل النص الأساسي إلى التصور النهائي
- 🤖 **ذكاء اصطناعي متقدم**: استخدام نماذج متعددة (GPT-4, Gemini, Claude, وأخرى)
- 📊 **تصورات تفاعلية**: رسوم بيانية وتقارير HTML تفاعلية
- 🔗 **تحليل شبكي**: فحص العلاقات والصراعات كشبكة معقدة
- 🏥 **تشخيص وعلاج**: اكتشاف المشاكل واقتراح حلول عملية
- 📈 **مقاييس كمية**: تقييم الجودة الدرامية بمعايير علمية

---

## 🏗️ البنية المعمارية

```
script-analyzer/
│
├── backend/
│   ├── stations/                    # المحطات السبع
│   │   ├── station1.py             # تحليل النص الأساسي
│   │   ├── station2.py             # التحليل المفاهيمي
│   │   ├── station3_network_builder.py  # بناء شبكة الصراع
│   │   ├── station4.py             # قياس الكفاءة والفعالية
│   │   ├── station5.py             # التحليل الديناميكي والرمزي
│   │   ├── station6.py             # التشخيص والعلاج
│   │   └── station7.py             # التصور والعرض النهائي
│   │
│   ├── core/
│   │   └── base_entities.py        # الكيانات الأساسية (Character, Relationship, Conflict, Network)
│   │
│   ├── analysis_modules/           # وحدات التحليل المتخصصة
│   │   ├── network_diagnostics.py  # التشخيص الشبكي
│   │   ├── treatment_strategies.py # استراتيجيات العلاج
│   │   ├── efficiency_metrics.py   # مقاييس الكفاءة
│   │   ├── dynamic_analysis.py     # التحليل الديناميكي
│   │   ├── episodic_integration.py # التكامل الحلقي
│   │   └── ...
│   │
│   ├── utils/                      # أدوات مساعدة
│   │   ├── api_utils.py           # تكامل API للذكاء الاصطناعي
│   │   ├── file_utils.py          # معالجة الملفات
│   │   ├── cache_utils.py         # نظام التخزين المؤقت
│   │   └── perf_utils.py          # قياس الأداء
│   │
│   ├── config.yaml                 # ملف التكوين الرئيسي
│   └── run_all_stations.py        # سكريبت التشغيل الشامل
│
├── analysis_modules/               # نسخة محدثة من الوحدات
│   ├── network_diagnostics.py     # ✅ محدّث - تشخيص شامل
│   └── treatment_strategies.py    # ✅ محدّث - استراتيجيات عملية
│
├── requirements.txt                # التبعيات المطلوبة
└── README.md                       # هذا الملف
```

---

## 📋 متطلبات التشغيل

### البيئة

- **Python**: 3.8 أو أحدث
- **نظام التشغيل**: Windows, Linux, macOS
- **الذاكرة**: 4GB RAM (موصى به: 8GB+)
- **المساحة**: 500MB لتثبيت المكتبات

### التبعيات الأساسية

```bash
# تثبيت التبعيات
pip install -r requirements.txt

# التبعيات الرئيسية:
- openai >= 1.0.0
- google-generativeai >= 0.3.0
- anthropic >= 0.7.0
- networkx >= 3.0
- matplotlib >= 3.5.0
- pyyaml >= 6.0
- joblib >= 1.2.0
- tqdm >= 4.65.0
```

### مفاتيح API المطلوبة

```bash
# إعداد متغيرات البيئة
export OPENAI_API_KEY="your-openai-key"
export GOOGLE_API_KEY="your-google-key"
export ANTHROPIC_API_KEY="your-anthropic-key"  # اختياري
export TOGETHER_API_KEY="your-together-key"    # اختياري
export OPENROUTER_API_KEY="your-openrouter-key"  # اختياري
```

---

## 🚀 دليل الاستخدام السريع

### 1. إعداد المشروع

```bash
# استنساخ المشروع
git clone https://github.com/your-repo/script-analyzer.git
cd script-analyzer

# تثبيت التبعيات
pip install -r requirements.txt

# إعداد متغيرات البيئة
export PROSE_FILE_PATH="/path/to/your/script.txt"
export PROJECT_PATH="/path/to/output"
export PROJECT_NAME="MyProject"
export APP_CONFIG_PATH="backend/config.yaml"
```

### 2. تشغيل التحليل الكامل

```bash
# تشغيل جميع المحطات السبع
cd backend
python run_all_stations.py
```

### 3. تشغيل محطة واحدة

```bash
# مثال: تشغيل المحطة الأولى فقط
cd backend/stations
python station1.py
```

---

## 🔬 وصف المحطات السبع

### المحطة 1️⃣: تحليل النص الأساسي

**الهدف**: استخراج الشخصيات الرئيسية وتحليل العلاقات والأسلوب السردي

**المدخلات**:
- النص الكامل للقصة/السيناريو

**المخرجات**:
- قائمة الشخصيات الرئيسية (3-7 شخصيات)
- تحليل معمق لكل شخصية (السمات، الدوافع، الأهداف)
- تحليل العلاقات الرئيسية
- تحليل الأسلوب السردي (النغمة، الإيقاع، اللغة)

**مثال على المخرجات**:
```json
{
  "major_characters": ["علي", "فاطمة", "أحمد"],
  "character_analysis": {
    "علي": {
      "personality_traits": "شجاع، متهور، مخلص",
      "motivations_goals": "البحث عن العدالة والانتقام لوالده"
    }
  },
  "narrative_style": {
    "overall_tone": "مظلم ومشوّق",
    "pacing": "سريع مع لحظات تأمل"
  }
}
```

---

### المحطة 2️⃣: التحليل المفاهيمي

**الهدف**: استخلاص المفاهيم العميقة والثيمات والبنية الدرامية

**المدخلات**:
- مخرجات المحطة الأولى
- النص الكامل

**المخرجات**:
- بيان القصة (Story Statement)
- خريطة ثلاثية الأبعاد (الأحداث، المعنى، الزمن)
- عرض مختصر (Elevator Pitch)
- النوع الهجين والمصفوفة النوعية
- النغمة الديناميكية
- المراجع الفنية

**مثال**:
```json
{
  "story_statement": "قصة عن الولاء والخيانة في زمن الحرب",
  "hybrid_genre": "دراما نفسية + إثارة",
  "elevator_pitch": "عندما يكتشف جندي شاب خيانة صديقه..."
}
```

---

### المحطة 3️⃣: بناء شبكة الصراع

**الهدف**: بناء شبكة معقدة من الشخصيات والعلاقات والصراعات

**المدخلات**:
- مخرجات المحطات 1 و 2
- النص الكامل

**المخرجات**:
- شبكة صراع كاملة (`ConflictNetwork`)
  - الشخصيات مع خصائصها
  - العلاقات (النوع، الطبيعة، القوة)
  - الصراعات (الموضوع، النطاق، المرحلة)
- لقطات زمنية (Snapshots) لتطور الشبكة

**البنية الأساسية**:
```python
class ConflictNetwork:
    - characters: Dict[id, Character]
    - relationships: Dict[id, Relationship]
    - conflicts: Dict[id, Conflict]
    - snapshots: List[NetworkSnapshot]
```

---

### المحطة 4️⃣: قياس الكفاءة والفعالية

**الهدف**: تقييم كمي لجودة الشبكة الدرامية

**المدخلات**:
- شبكة الصراع من المحطة 3

**المخرجات**:
- **درجة الكفاءة الإجمالية** (0-100)
- **التصنيف**: Excellent / Good / Fair / Poor / Critical
- **تماسك الصراع** (Conflict Cohesion): 0-1
- **التوازن الدرامي** (Dramatic Balance)
  - توزيع الشخصيات (Gini coefficient)
  - توزيع الصراعات
- **كفاءة السرد** (Narrative Efficiency)
  - كفاءة الشخصيات
  - كفاءة العلاقات
  - كفاءة الصراعات
- **كثافة السرد** (Narrative Density)
- **التكرارات** (Redundancy Metrics)

**مثال**:
```json
{
  "overall_efficiency_score": 0.78,
  "overall_rating": "Good",
  "conflict_cohesion": 0.85,
  "dramatic_balance": {
    "balance_score": 0.72,
    "character_involvement_gini": 0.35
  }
}
```

---

### المحطة 5️⃣: التحليل الديناميكي والرمزي

**الهدف**: تحليل تطور الشبكة عبر الزمن والأبعاد الرمزية

**المدخلات**:
- شبكة الصراع
- مخرجات المحطة 4
- النص الكامل

**المخرجات**:
- **تحليل ديناميكي**:
  - جدول زمني للأحداث (Timeline)
  - تطور الشبكة (Network Evolution)
  - تتبع تطور الشخصيات (Character Development Tracking)
  - تقدم الصراعات (Conflict Progression)
- **تكامل حلقي** (Episodic Integration):
  - بنية المسلسل (Series Structure)
  - تفصيل المواسم (Season Breakdown)
  - توزيع الحلقات (Episode Distribution)
- **تحليل رمزي**:
  - الرموز الرئيسية
  - الأنماط المتكررة (Motifs)
  - الثيمات المركزية
- **تحليل أسلوبي**:
  - تقييم النغمة الإجمالية
  - تعقيد اللغة
  - انطباع الإيقاع
  - أسلوب الحوار

---

### المحطة 6️⃣: التشخيص والعلاج

**الهدف**: تشخيص المشاكل واقتراح حلول عملية

**المدخلات**:
- شبكة الصراع
- مخرجات المحطة 5

**المخرجات**:
- **تقرير تشخيصي**:
  - مشاكل هيكلية (Structural Issues)
  - شخصيات معزولة (Isolated Characters)
  - صراعات مهملة (Abandoned Conflicts)
  - شخصيات محملة (Overloaded Characters)
  - اتصالات ضعيفة (Weak Connections)
  - تكرارات (Redundancies)
  - **درجة الصحة الإجمالية** (0-100)
  - **مستوى الخطورة**: healthy / minor / moderate / major / critical

- **توصيات العلاج**:
  - إجراءات ذات أولوية (Prioritized Actions)
  - إصلاحات سريعة (Quick Fixes)
  - مراجعات هيكلية (Structural Revisions)
  - اقتراحات تطوير الشخصيات
  - استراتيجيات تعزيز الصراعات

- **مقاييس كفاءة متقدمة**:
  - الكفاءة الأساسية
  - إمكانية التحسين
  - قابلية التنفيذ
  - النتائج المتوقعة (متفائلة / واقعية / متشائمة)
  - تقييم المخاطر

**مثال على التشخيص**:
```json
{
  "overall_health_score": 67.5,
  "criticality_level": "moderate_issues",
  "isolated_characters": {
    "total_isolated": 2,
    "characters": [
      {
        "character_name": "سارة",
        "isolation_type": "completely_isolated",
        "suggested_connections": ["ربط مع الشخصية المركزية: أحمد"]
      }
    ]
  },
  "abandoned_conflicts": {
    "total_abandoned": 1,
    "conflicts": [
      {
        "conflict_name": "الصراع على الميراث",
        "issue_type": "stuck_in_phase",
        "days_inactive": 45
      }
    ]
  }
}
```

---

### المحطة 7️⃣: التصور والعرض النهائي

**الهدف**: إنشاء تصورات بصرية وتقارير نهائية شاملة

**المدخلات**:
- شبكة الصراع
- مخرجات جميع المحطات السابقة

**المخرجات**:
- **تصورات شبكية**:
  - رسم بياني للشبكة الكاملة (Network Graph)
  - خريطة العلاقات (Relationship Map)
  - خريطة الصراعات (Conflict Map)
- **تصورات زمنية**:
  - جدول زمني لتطور الصراعات
  - جدول زمني لتطور الشخصيات
  - جدول الأحداث الرئيسية
- **رسوم بيانية إحصائية**:
  - توزيع أنواع الصراعات
  - توزيع طبائع العلاقات
  - مشاركة الشخصيات في الصراعات
  - توزيع مراحل الصراعات
- **عناصر تفاعلية**:
  - مستكشف الشبكة التفاعلي
  - متصفح الجدول الزمني
  - محلل الصراعات
- **اقتراحات التكيف للمنصات**:
  - بنية حلقية (Episodic) للمسلسلات
  - بنية سينمائية للأفلام
  - بنية روائية مسلسلة للكتب
- **التقرير النهائي**:
  - ملخص تنفيذي
  - تحليل SWOT (نقاط القوة، الضعف، الفرص، التهديدات)
  - التقييم الشامل
  - النتائج التفصيلية
- **حزمة التصدير**:
  - JSON (للبرمجة)
  - Markdown (للقراءة)
  - HTML (تفاعلي)
  - PDF (للطباعة)

---

## 📊 أمثلة على المخرجات

### مثال 1: رسم بياني للشبكة

```
     [علي] ────عداء────> [أحمد]
       │                    │
       │                    │
    صداقة              تحالف
       │                    │
       ↓                    ↓
    [فاطمة] ──حب متبادل── [سارة]
```

### مثال 2: تقرير الصحة

```
==============================================
تقييم صحة الشبكة الدرامية
==============================================

الدرجة الإجمالية: 72.5/100
مستوى الخطورة: moderate_issues

المشاكل المكتشفة:
  • مشاكل هيكلية: 2
  • شخصيات معزولة: 1
  • صراعات مهملة: 3
  • شخصيات محملة: 1
  • اتصالات ضعيفة: 5
  • تكرارات: 2

التوصية الرئيسية:
✓ الشبكة في حالة جيدة مع بعض المجالات للتحسين
```

---

## 🔧 التكوين المتقدم

### ملف `config.yaml`

```yaml
api_providers:
  openai:
    enabled: true
    default_model: "gpt-4o-mini"
    temperature: 0.7
    max_tokens: 2000
  
  google:
    enabled: true
    models:
      pro: "gemini-1.5-pro-latest"
      flash: "gemini-1.5-flash-latest"

station_settings:
  station1_text_processing:
    max_characters_analyzed: 7
    analysis_depth: "detailed"
  
  station3_network_builder:
    enable_ai_inference: true
    relationship_threshold: 0.5
  
  station4_efficiency_metrics:
    enable_advanced_metrics: true
  
  station6_diagnostics:
    health_score_weights:
      structural: 0.3
      balance: 0.25
      efficiency: 0.25
      redundancy: 0.2

visualization:
  output_format: ["html", "png", "svg"]
  interactive_enabled: true
  chart_style: "seaborn"
```

---

## 🧪 الاختبار

### تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
pytest tests/

# اختبار محطة محددة
pytest tests/test_station1.py

# اختبار مع تغطية
pytest --cov=backend tests/
```

### أمثلة الاختبار

```python
# tests/test_network_diagnostics.py
import pytest
from core.base_entities import ConflictNetwork, Character
from analysis_modules.network_diagnostics import NetworkDiagnostics

def test_isolated_character_detection():
    """اختبار كشف الشخصيات المعزولة"""
    network = ConflictNetwork("Test Network")
    
    # إضافة شخصية معزولة
    char1 = Character(id="char1", name="علي")
    network.add_character(char1)
    
    # تشغيل التشخيص
    diagnostics = NetworkDiagnostics(network)
    report = diagnostics.run_all_diagnostics()
    
    # التحقق
    assert report['isolated_characters']['total_isolated'] == 1
    assert report['criticality_level'] in ['moderate_issues', 'major_issues']
```

---

## 📈 قياس الأداء

### معايير الأداء

| المحطة | الوقت المتوسط | الذاكرة |
|--------|---------------|---------|
| المحطة 1 | 30-60 ثانية | ~500MB |
| المحطة 2 | 45-90 ثانية | ~600MB |
| المحطة 3 | 2-4 دقائق | ~800MB |
| المحطة 4 | 10-20 ثانية | ~400MB |
| المحطة 5 | 1-2 دقيقة | ~700MB |
| المحطة 6 | 15-30 ثانية | ~500MB |
| المحطة 7 | 30-60 ثانية | ~600MB |
| **المجموع** | **5-10 دقائق** | **~1GB** |

*ملاحظة: الأوقات تقريبية وتعتمد على طول النص ومواصفات النظام*

### التحسينات

- ✅ **التخزين المؤقت**: استخدام `joblib` لتخزين النتائج
- ✅ **المعالجة المتوازية**: استخدام `asyncio` للعمليات المتزامنة
- ✅ **الاستدعاءات المُحسَّنة**: تقليل استدعاءات API من خلال الدُفعات

---

## 🤝 المساهمة

نرحب بالمساهمات! الرجاء اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

### معايير الكود

- اتباع PEP 8 لـ Python
- توثيق جميع الدوال (docstrings)
- كتابة اختبارات للميزات الجديدة
- معالجة الأخطاء بشكل شامل

---

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🆘 الدعم والمساعدة

### الأسئلة الشائعة

**س: كم يستغرق تحليل نص طويل؟**  
ج: للنص بطول 50,000 كلمة، يستغرق التحليل الكامل حوالي 5-10 دقائق.

**س: هل يمكن استخدام نماذج AI أخرى؟**  
ج: نعم! النظام مصمم ليكون مرناً. يمكنك إضافة نماذج جديدة في `utils/api_utils.py`.

**س: كيف أحسّن النتائج؟**  
ج: جرّب:
- تعديل قيم `temperature` في `config.yaml`
- استخدام نماذج أقوى (مثل GPT-4 بدلاً من GPT-4-mini)
- توفير سياق إضافي في المحطة الأولى

### التواصل

- 📧 **البريد الإلكتروني**: support@script-analyzer.com
- 💬 **Discord**: [انضم لمجتمعنا](https://discord.gg/script-analyzer)
- 📚 **الوثائق الكاملة**: [docs.script-analyzer.com](https://docs.script-analyzer.com)
- 🐛 **الإبلاغ عن الأخطاء**: [GitHub Issues](https://github.com/your-repo/script-analyzer/issues)

---

## 🙏 شكر وتقدير

- **Anthropic** - نماذج Claude AI
- **OpenAI** - نماذج GPT
- **Google** - نماذج Gemini
- **NetworkX** - مكتبة تحليل الشبكات
- **مجتمع Python** - الأدوات والمكتبات الرائعة

---

## 📚 مراجع علمية

1. McKee, Robert. *Story: Substance, Structure, Style and the Principles of Screenwriting*. 1997.
2. Snyder, Blake. *Save the Cat!: The Last Book on Screenwriting You'll Ever Need*. 2005.
3. Campbell, Joseph. *The Hero with a Thousand Faces*. 1949.
4. Newman, M.E.J. *Networks: An Introduction*. Oxford University Press, 2010.
5. Moretti, Franco. *Distant Reading*. Verso Books, 2013.

---

<p align="center">
  <b>صُنع بـ ❤️ لمحبي السرد والدراما</b>
</p>

<p align="center">
  ⭐ إذا أعجبك المشروع، لا تنسَ إضافة نجمة على GitHub!
</p>
