# Stations - Advanced Dramatic Text Analysis System

نظام Stations هو خط أنابيب تحليل سردي مكوَّن من سبع محطات مترابطة، مدعوم بخدمة Gemini AI وواجهة React. يهدف النظام إلى تقديم تحليل درامي شامل من النص الخام حتى التقارير النهائية والمرئيات المهيأة للنشر.

## 🌟 المزايا الرئيسية
- ✅ **تحليل متعدد المراحل**: سبع محطات تغطي تحليل النص، بناء شبكة الصراع، القياسات الكمية، التشخيص والعلاج، والتقارير النهائية.
- ✅ **تكامل Gemini AI**: أوامر مخصصة لكل محطة مع حراسة للأنواع وعمليات إعادة محاولة.
- ✅ **أمان الإنتاج**: مصادقة API Key، تحديد المعدل، تعقيم المدخلات، CORS، وHelmet.
- ✅ **الملاحظة والتسجيل**: تسجيل هيكلي عبر Winston وMorgan مع ملفات سجلات منفصلة.
- ✅ **جاهزية التشغيل**: Dockerfile متعدد المراحل، docker-compose، وصحة الخدمات (`/health`, `/ready`, `/live`).
- ✅ **جودة الكود**: TypeScript strict، ESLint، Prettier، وCI جاهز عبر GitHub Actions.

## 📋 المتطلبات
- Node.js 18 أو 20
- npm
- مفتاح Gemini API صالح
- (اختياري) Docker وdocker-compose

## 🚀 التشغيل السريع
```bash
# تثبيت الاعتمادات
npm install

# نسخ المتغيرات البيئية
cp .env.example .env

# تحرير .env وإضافة المفتاح
# GEMINI_API_KEY=your-api-key

# تشغيل بيئة التطوير
npm run dev
```
الخادم يستمع افتراضياً على `http://localhost:5000`.

## 🧪 الأوامر المتاحة
```bash
npm run dev            # تشغيل الخادم في التطوير
npm run build          # بناء الواجهة والخادم للإنتاج
npm run start          # تشغيل الإصدار المبني
npm run check          # فحص أنواع TypeScript
npm run lint           # تحليل ESLint
npm run lint:fix       # إصلاح تلقائي لأخطاء ESLint
npm run format         # تنسيق Prettier
npm run format:check   # التحقق من التنسيق
npm test               # اختبارات (إن وجدت)
```

## 🐳 Docker
```bash
# بناء الصورة
npm run docker:build

# التشغيل مع ملف .env
npm run docker:run

# أو docker-compose
npm run docker:compose
```
الصورة تتضمن مستخدماً غير جذري، healthcheck، ومسارات لحفظ السجلات والمخرجات التحليلية.

## 🔐 الأمان
- مصادقة عبر رأس `X-API-Key` (قابلة للتهيئة عبر `VALID_API_KEYS`).
- تحديد معدل عام على `/api/` بالإضافة إلى محدد صارم لمسارات التحليل.
- تعقيم المدخلات وإزالة الوسوم البرمجية.
- ترويسات أمان Helmet وفلترة CORS قائمة بيضاء.

## 📊 البنية المعمارية المختصرة
1. **Station 1** – تحليل النص واستخراج الشخصيات.
2. **Station 2** – التحليل المفاهيمي والبيانات المرجعية.
3. **Station 3** – بناء شبكة الصراع.
4. **Station 4** – مقاييس الكفاءة والسرد.
5. **Station 5** – التحليل الديناميكي والرمزي والأسلوبي.
6. **Station 6** – التشخيص وخطة العلاج.
7. **Station 7** – التصور والتقارير والتصدير.

## 📚 الوثائق
- [API Documentation](./API_DOCUMENTATION.md)
- [Testing Guide](./TESTING_DIRECTIVE_STATIONS.md)
- [Architecture Notes](./design_guidelines.md)

## 🌐 المتغيرات البيئية الهامة
```bash
GEMINI_API_KEY=           # مطلوب للتكامل مع Gemini
VALID_API_KEYS=           # مفاتيح API مفصولة بفاصلة
ALLOWED_ORIGINS=          # نطاقات CORS مسموحة
PORT=5000                 # المنفذ الافتراضي
NODE_ENV=development      # طور التشغيل
LOG_LEVEL=info            # مستوى السجلات
```

## 🤝 المساهمة
1. Fork للمستودع.
2. إنشاء فرع (`git checkout -b feature/awesome`).
3. تنفيذ التغييرات مع اختبارات وتمرير lint.
4. إنشاء Pull Request.

## 📞 الدعم
- البريد: support@example.com
- القضايا: https://github.com/your-repo/stations/issues
