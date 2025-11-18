# SAGE Red Team Security Analysis Report

## Executive Summary

This comprehensive security analysis of the SAGE (Synthetic Audience Generation Engine) codebase has identified **multiple critical and high-severity vulnerabilities** that require immediate attention. The application is a full-stack survey platform using FastAPI (backend) and React (frontend) with integrations to OpenAI and Anthropic APIs.

**Key Findings:**
- **1 CRITICAL** issue: Hardcoded API keys exposed in repository
- **6 HIGH** priority vulnerabilities
- **8 MEDIUM** priority issues
- **5 LOW** priority improvements needed

The most severe issue is the exposure of production API keys in the `.env` file, which poses an immediate financial and security risk.

---

## CRITICAL ISSUES

### 🔴 CRIT-1: Hardcoded API Keys Committed to Repository

**Location:** `backend/.env:2-5`

**Finding:**
```bash
OPENAI_API_KEY=sk-proj-[REDACTED]
ANTHROPIC_API_KEY=sk-ant-api03-[REDACTED]
```

**Impact:**
- Immediate unauthorized access to paid API services
- Potential for large financial charges
- Possible data exfiltration through API usage logs
- Credential compromise if repository is public or becomes compromised

**Attack Vector:**
1. Attacker clones repository or views file history
2. Extracts API keys from `.env` file
3. Uses keys for unauthorized LLM API access
4. Racks up charges or exfiltrates training data

**Remediation:**
1. **IMMEDIATELY** revoke and rotate these API keys at OpenAI and Anthropic
2. Remove `.env` files from git history: `git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/.env frontend/.env" --prune-empty --tag-name-filter cat -- --all`
3. Add `.env` to `.gitignore` (already present but file was committed before)
4. Use environment-specific secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
5. Implement pre-commit hooks to prevent future credential commits
6. Audit API usage logs for unauthorized activity

---

## HIGH PRIORITY

### 🟠 HIGH-1: No Authentication or Authorization on API Endpoints

**Location:** `backend/main.py:84-100, all endpoints`

**Finding:**
The entire FastAPI application has **zero authentication** or **authorization** mechanisms. All endpoints are publicly accessible:

```python
@app.post("/api/surveys")
async def create_survey(request: CreateSurveyRequest):
    # No auth check - anyone can create surveys

@app.delete("/api/surveys/{survey_id}")
async def delete_survey(survey_id: str):
    # No auth check - anyone can delete any survey

@app.post("/api/run-survey")
async def run_survey(request: RunSurveyRequest):
    # No auth check - anyone can trigger expensive LLM API calls
```

**Impact:**
- Unauthorized users can create, modify, or delete surveys
- Anyone can trigger expensive LLM API calls, depleting API quotas
- No audit trail of who performed actions
- Potential for abuse, spam, or DoS through resource exhaustion

**Attack Vector:**
1. Attacker discovers API endpoint (trivial - `/docs` exposes all)
2. Sends requests to `/api/run-survey` with large `num_profiles` values
3. Causes financial damage through API rate limit exhaustion
4. Deletes legitimate survey data via DELETE endpoints

**Remediation:**
1. Implement OAuth2/JWT authentication with FastAPI's `Security` dependency
2. Add role-based access control (RBAC) for admin vs. user operations
3. Implement rate limiting per user/IP address
4. Add API key requirement for programmatic access
5. Log all API operations with user attribution

### 🟠 HIGH-2: Arbitrary File Upload Vulnerability

**Location:** `backend/main.py:1251-1299`

**Finding:**
File upload endpoint has weak validation and potential path traversal risks:

```python
@app.post("/api/upload/image")
async def upload_image(file: UploadFile = File(...)):
    # Validation issues:
    file_ext = Path(file.filename).suffix.lower()  # Client-controlled filename
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(...)

    file_hash = hashlib.md5(content).hexdigest()  # MD5 is weak
    unique_filename = f"{file_hash}{file_ext}"
    file_path = IMAGES_DIR / unique_filename  # No path traversal check
```

**Issues:**
1. Client controls filename extension - can include path traversal sequences
2. MD5 is cryptographically broken - collision attacks possible
3. No content-type validation (magic byte checking)
4. Extension-only validation can be bypassed
5. No maximum filename length check

**Attack Vector:**
1. Attacker crafts malicious filename: `../../etc/passwd.jpg`
2. Uploads PHP shell disguised as image
3. Triggers code execution if web server misconfigured
4. Or uses collision attack to replace legitimate files

**Remediation:**
1. Use SHA-256 instead of MD5 for hashing
2. Validate file content (magic bytes) not just extension
3. Sanitize filename: `secure_filename()` or reject non-alphanumeric
4. Use UUID for filenames, ignore client-provided names
5. Store uploads outside web root with restricted permissions
6. Implement virus scanning for uploads
7. Add per-user upload quotas

### 🟠 HIGH-3: Path Traversal in Survey/Run Management

**Location:** `backend/main.py:247-253, 504-516, 990-1009`

**Finding:**
Survey ID and Run ID parameters are directly used in file paths without validation:

```python
def get_survey_path(survey_id: str) -> Path:
    config_dir = get_config_dir()
    yaml_path = config_dir / f"{survey_id}.yaml"  # No validation!
    if not yaml_path.exists():
        raise HTTPException(status_code=404, ...)
    return yaml_path

@app.delete("/api/surveys/{survey_id}")
async def delete_survey(survey_id: str):
    survey_path = get_survey_path(survey_id)
    survey_path.unlink()  # Deletes file!
```

**Attack Vector:**
1. Attacker sends: `DELETE /api/surveys/../../../etc/passwd`
2. Application constructs path: `config/../../../etc/passwd.yaml`
3. File deletion occurs outside intended directory
4. Critical system files could be deleted

**Remediation:**
1. Validate survey_id/run_id against whitelist pattern: `^[a-zA-Z0-9_-]+$`
2. Use `Path.resolve()` and verify result is within expected directory
3. Reject any ID containing `..`, `/`, or `\`
4. Implement input validation decorator for all path parameters

### 🟠 HIGH-4: Unsafe YAML Parsing (Mitigated)

**Location:** `backend/main.py:466, backend/ssr_core/survey.py:275`

**Finding:**
While the code correctly uses `yaml.safe_load()`, the survey creation endpoint allows arbitrary YAML content:

```python
@app.post("/api/surveys")
async def create_survey(request: CreateSurveyRequest):
    survey_config = yaml.safe_load(request.yaml_content)  # User content
    survey_path.write_text(request.yaml_content)  # Saved to disk
```

**Potential Issues:**
1. DoS through extremely large YAML files
2. Billion laughs attack (exponential entity expansion)
3. Resource exhaustion via deeply nested structures
4. No schema validation - malformed data accepted

**Attack Vector:**
1. Upload YAML with deeply nested structures (1000+ levels)
2. Cause parser to consume excessive memory/CPU
3. Crash application or slow it to unusability

**Remediation:**
1. Implement YAML size limits (e.g., 1MB max)
2. Use `yaml.safe_load()` with custom constructors to limit depth
3. Validate against JSON Schema after parsing
4. Set resource limits for YAML parsing operations

### 🟠 HIGH-5: Information Disclosure via Error Messages

**Location:** Multiple locations, e.g., `backend/main.py:350-351, 580, 650, 1122`

**Finding:**
Detailed error messages expose internal implementation details:

```python
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error loading survey: {str(e)}")
    # Exposes: file paths, Python tracebacks, internal logic
```

**Impact:**
- Reveals file system structure
- Exposes Python version and library versions
- Shows SQL queries (if any) in stack traces
- Aids attackers in reconnaissance

**Remediation:**
1. Return generic error messages to clients
2. Log detailed errors server-side only
3. Implement custom exception handler
4. Use FastAPI's `HTTPException` with safe messages

### 🟠 HIGH-6: Uncontrolled Resource Consumption

**Location:** `backend/main.py:178, 196`

**Finding:**
API accepts requests that can trigger expensive operations without limits:

```python
class RunSurveyRequest(BaseModel):
    num_profiles: int = Field(default=100, ge=10, le=500)  # Max 500
    # But: 500 profiles * 10 questions = 5,000 API calls!

class CreateGroundTruthFromSSRRequest(BaseModel):
    num_profiles: int = Field(default=500, ge=10, le=2000)  # Max 2,000!
    # 2000 profiles * 10 questions = 20,000 API calls = $$$
```

**Attack Vector:**
1. Attacker sends requests with maximum allowed values
2. Each request triggers thousands of OpenAI/Anthropic API calls
3. Costs accumulate rapidly (GPT-4 costs ~$0.03-0.06 per 1K tokens)
4. Application continues accepting requests until API budget exhausted

**Remediation:**
1. Implement per-user/per-IP rate limiting
2. Add cost estimation and budget checks before execution
3. Require admin approval for requests exceeding thresholds
4. Implement queue system with priority and throttling
5. Add circuit breakers for API failures

---

## MEDIUM PRIORITY

### 🟡 MED-1: CORS Configuration Too Permissive

**Location:** `backend/main.py:90-100`

**Finding:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # All HTTP methods allowed
    allow_headers=["*"],  # All headers allowed
)
```

**Issues:**
- `allow_methods=["*"]` permits unusual HTTP methods
- `allow_headers=["*"]` accepts any custom headers
- No production origins configured

**Remediation:**
- Explicitly list allowed methods: `["GET", "POST", "PUT", "DELETE"]`
- Restrict headers to necessary ones
- Use environment variables for production origins

### 🟡 MED-2: Concurrent API Calls Without Rate Limit Protection

**Location:** `backend/ssr_core/llm_client.py:321-380`

**Finding:**
```python
def generate_responses_concurrent(self, ..., max_concurrent: int = 10):
    with ThreadPoolExecutor(max_workers=max_concurrent) as executor:
        # Can trigger 10-20 simultaneous API calls
```

**Issues:**
- No backoff/retry logic for rate limit errors
- Hardcoded concurrency limits
- No circuit breaker for API failures
- Could violate OpenAI/Anthropic rate limits

**Remediation:**
1. Implement exponential backoff with jitter
2. Add retry logic with max attempts
3. Respect `Retry-After` headers
4. Use semaphore for global rate limiting

### 🟡 MED-3: Frontend Hardcodes Backend URL

**Location:** `frontend/src/pages/SurveyRunnerPage.tsx:112`, `frontend/.env:2`

**Finding:**
```typescript
const response = await fetch('http://localhost:8000/api/run-survey-stream', {
```

**Issues:**
- Hardcoded backend URL won't work in production
- HTTP instead of HTTPS in production would be insecure
- No environment-based configuration

**Remediation:**
1. Use environment variables: `REACT_APP_API_URL`
2. Create production build with HTTPS URLs
3. Implement base URL configuration

### 🟡 MED-4: Missing Input Validation on File Operations

**Location:** `backend/main.py:456-480`

**Finding:**
Survey filename validation is weak:

```python
if not request.filename.endswith('.yaml'):
    request.filename += '.yaml'  # Naive append
```

**Attack Vector:**
- Input: `../../../etc/passwd`
- Result: `../../../etc/passwd.yaml`
- Path traversal persists

**Remediation:**
Validate filename matches: `^[a-zA-Z0-9_-]+\.yaml$`

### 🟡 MED-5: Insufficient Logging and Monitoring

**Location:** Throughout application

**Finding:**
- No structured logging
- No request/response logging
- No security event logging
- No monitoring or alerting

**Remediation:**
1. Implement structured logging (JSON format)
2. Log all authentication attempts
3. Log file operations (create/delete)
4. Add metrics and alerting for anomalies

### 🟡 MED-6: No HTTPS Enforcement

**Location:** `backend/main.py:1357`

**Finding:**
```python
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# HTTP only, no TLS configuration
```

**Remediation:**
1. Configure TLS certificates
2. Use reverse proxy (nginx) for TLS termination
3. Enforce HTTPS redirects
4. Set `Strict-Transport-Security` headers

### 🟡 MED-7: Weak Hash Algorithm (MD5)

**Location:** `backend/main.py:1274`

**Finding:**
```python
file_hash = hashlib.md5(content).hexdigest()
```

**Impact:**
MD5 collisions can allow file replacement attacks

**Remediation:**
Use SHA-256: `hashlib.sha256(content).hexdigest()`

### 🟡 MED-8: Dependency Vulnerabilities

**Finding:**
Frontend has multiple high-severity npm vulnerabilities:
- `nth-check`: ReDoS vulnerability (CVE-2021-3803)
- `@svgr/plugin-svgo`: High severity
- `css-select`: High severity
- react-scripts dependencies outdated

**Remediation:**
```bash
cd frontend
npm audit fix --force
npm update
```

---

## LOW PRIORITY

### 🔵 LOW-1: Missing Security Headers

**Finding:**
No security headers configured (X-Frame-Options, X-Content-Type-Options, etc.)

**Remediation:**
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "yourdomain.com"])
# Add CSP, X-Frame-Options, etc.
```

### 🔵 LOW-2: TODO Comments Indicate Incomplete Features

**Location:** `backend/main.py:1318, 1345`, `backend/ssr_core/llm_client.py:162`

**Finding:**
```python
# TODO: Add screenshot capture using playwright
# TODO: Implement progress tracking
# TODO: Download and encode URL images for Anthropic
```

**Impact:**
Incomplete features may have security implications

**Remediation:**
Review and complete or remove TODO items

### 🔵 LOW-3: Insecure Defaults

**Location:** `backend/main.py:1357`

**Finding:**
```python
uvicorn.run(..., host="0.0.0.0", reload=True)
# Binds to all interfaces, reload mode in production is risky
```

**Remediation:**
- Bind to localhost in development
- Disable reload in production
- Use production-ready server (gunicorn + uvicorn workers)

### 🔵 LOW-4: No Request Size Limits

**Finding:**
FastAPI has no explicit request body size limits

**Remediation:**
```python
app.add_middleware(
    RequestSizeLimiterMiddleware,
    max_request_size=10_000_000  # 10MB
)
```

### 🔵 LOW-5: Unclear Data Retention Policy

**Finding:**
Survey runs and results accumulate indefinitely in `results/` directory

**Remediation:**
1. Implement data retention policy
2. Add automatic cleanup of old results
3. Archive instead of delete for compliance

---

## RECOMMENDATIONS

### Strategic Security Improvements

1. **Authentication & Authorization (Priority 1)**
   - Implement OAuth2 with password flow
   - Add JWT token management
   - Create user roles (admin, user, viewer)
   - Audit all access attempts

2. **Input Validation Framework (Priority 1)**
   - Create centralized validation middleware
   - Use Pydantic models for all inputs
   - Implement whitelist validation for IDs/filenames
   - Add JSON Schema validation for complex inputs

3. **Secrets Management (Priority 1)**
   - Migrate to AWS Secrets Manager or HashiCorp Vault
   - Implement key rotation schedule
   - Use separate keys per environment
   - Audit key usage

4. **Rate Limiting & Resource Control (Priority 2)**
   - Implement Redis-based rate limiting
   - Add cost estimation before expensive operations
   - Set budget alerts
   - Create fair usage quotas

5. **Security Monitoring (Priority 2)**
   - Implement SIEM integration
   - Add anomaly detection
   - Create security dashboards
   - Set up automated alerts

6. **Dependency Management (Priority 2)**
   - Implement Dependabot or Renovate
   - Schedule regular dependency updates
   - Pin dependency versions
   - Test updates in staging

7. **Infrastructure Security (Priority 3)**
   - Deploy behind WAF (Web Application Firewall)
   - Use container scanning
   - Implement network segmentation
   - Enable VPC/private networking

### Compliance Considerations

If handling any user data, consider:
- GDPR compliance (data retention, right to deletion)
- SOC 2 requirements (logging, access controls)
- Data encryption at rest and in transit
- Regular security audits and penetration testing

---

## Proof of Concept Exploits

### PoC-1: API Key Extraction
```bash
# If repo is public, anyone can view:
curl https://raw.githubusercontent.com/user/sage/main/backend/.env
# Extracted keys can be used immediately
```

### PoC-2: Unauthorized Survey Deletion
```bash
curl -X DELETE http://localhost:8000/api/surveys/important_survey
# No auth required - survey deleted
```

### PoC-3: Path Traversal File Deletion
```bash
curl -X DELETE http://localhost:8000/api/surveys/../../../sensitive_file
# Attempts to delete files outside survey directory
```

### PoC-4: Resource Exhaustion
```bash
curl -X POST http://localhost:8000/api/run-survey \
  -H "Content-Type: application/json" \
  -d '{"survey_id":"test","num_profiles":500,...}'
# Triggers 5,000+ API calls without authentication
```

---

## Risk Assessment Matrix

| Issue | Likelihood | Impact | Risk Score |
|-------|-----------|--------|------------|
| CRIT-1: Exposed API Keys | High | Critical | **9.5/10** |
| HIGH-1: No Authentication | High | High | **9.0/10** |
| HIGH-2: File Upload | Medium | High | **7.5/10** |
| HIGH-3: Path Traversal | Medium | High | **7.5/10** |
| HIGH-4: YAML DoS | Medium | Medium | **6.0/10** |
| HIGH-5: Info Disclosure | High | Low | **5.5/10** |
| HIGH-6: Resource Exhaustion | High | High | **8.0/10** |

---

## Conclusion

The SAGE application has a solid architecture but requires immediate security hardening before production deployment. The critical API key exposure must be addressed within **24 hours**. High-priority issues should be resolved within **1 week**. Medium and low-priority issues can be addressed in the next development sprint.

**Immediate Actions Required:**
1. Revoke and rotate exposed API keys
2. Remove credentials from git history
3. Implement basic authentication
4. Add input validation for file paths
5. Deploy rate limiting

This analysis was conducted with authorized access for defensive security purposes.

---

**Report Generated:** 2025-11-14
**Analyst:** Claude Code Red Team Analysis
**Scope:** Full codebase security audit
**Methodology:** Static code analysis, dependency scanning, threat modeling
