# Stations API Documentation

## Base URL
```
Production: https://your-domain.com
Development: http://localhost:5000
```

## Authentication

All API requests (except health checks) require an API key header:

```
X-API-Key: your-api-key
```

## Rate Limits

- General API: 100 requests per 15 minutes
- AI Analysis: 10 requests per hour
- Read-only: 1000 requests per 15 minutes

## Endpoints

### Health Checks

#### `GET /health`
Returns server heartbeat information.

**Response**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 12345.67
}
```

#### `GET /ready`
Reports readiness of dependencies (Gemini API key, file system, etc.).

```json
{
  "status": "ready",
  "checks": {
    "geminiApiKey": true,
    "fileSystem": true
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### `GET /live`
Liveness probe.

### Analysis Endpoints

#### `POST /api/analyze-text`
Runs stations 1–3.

**Headers**
- `Content-Type: application/json`
- `X-API-Key: your-api-key`

**Body**
```json
{
  "fullText": "نص درامي للتحليل...",
  "projectName": "اسم المشروع",
  "proseFilePath": "optional/path/to/file.txt"
}
```

**Response**
```json
{
  "station1": { "majorCharacters": ["أحمد"], "characterAnalysis": {}, "relationshipAnalysis": {}, "narrativeStyleAnalysis": {}, "metadata": {"analysisTimestamp": "2025-01-15T10:30:00.000Z", "status": "Success"} },
  "station2": { "storyStatement": "...", "elevatorPitch": "...", "hybridGenre": "..." },
  "station3": { "networkSummary": { "charactersCount": 3, "relationshipsCount": 2, "conflictsCount": 1, "snapshotsCount": 0 } }
}
```

**Errors**
- 400: Validation failed (Zod details)
- 401/403: Missing or invalid API key
- 429: Rate limit exceeded
- 500: Internal error

#### `POST /api/analyze-full-pipeline`
Runs all seven stations.

**Response**
```json
{
  "success": true,
  "data": { "station1": { ... }, "pipelineMetadata": { "stationsCompleted": 7, "totalExecutionTime": 45000 } },
  "message": "تم إنجاز 7 محطات من أصل 7",
  "executionTime": "45.0 ثانية"
}
```

### Status Endpoint

#### `GET /api/stations-status`
Returns availability of stations.

```json
{
  "success": true,
  "stations": { "1": "Station 1: Text Analysis - متاح" },
  "totalStations": 7,
  "availableStations": 7
}
```

## Rate Limiting Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1642234567
```

## Examples

### curl
```bash
curl -X POST http://localhost:5000/api/analyze-text \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-1" \
  -d '{
    "fullText": "في قرية صغيرة على ضفاف النيل...",
    "projectName": "قصة القرية"
  }'
```

### JavaScript
```javascript
const response = await fetch('http://localhost:5000/api/analyze-text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'dev-key-1'
  },
  body: JSON.stringify({
    fullText: 'نص درامي للتحليل...',
    projectName: 'مشروع جديد'
  })
});
const data = await response.json();
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:5000/api/analyze-text',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'dev-key-1'
    },
    json={
        'fullText': 'نص درامي للتحليل...',
        'projectName': 'مشروع جديد'
    }
)
print(response.json())
```

## Support

- GitHub Issues: https://github.com/your-repo/stations/issues
- Email: support@example.com
