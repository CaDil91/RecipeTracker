# Repository Transition Plan: Public to Private

**Cutoff Point:** After image upload feature (Sprint 5.1)
**Timeline:** 1-2 weeks from today

---

## Phase 1: Immediate Security (TODAY - 30 minutes)

### Rotate Azure Storage Key
```
1. Azure Portal → Storage Accounts → foodbudgetstorage
2. Access Keys → Regenerate key2
3. Copy new key
4. Update local appsettings.Development.json (DO NOT COMMIT)
5. Test API storage connection
```

### Change SQL Password
```
1. SQL Server Management Studio → Connect to DESKTOP-9PB9RM3,62651
2. Security → Logins → sa → Properties → Set new password
3. Update local appsettings.Development.json (DO NOT COMMIT)
4. Test API database connection
```

---

## Phase 2: Complete Image Upload (1-2 weeks)

Sprint 5.1 work - see separate sprint documentation

---

## Phase 3: Portfolio Prep (1 weekend)

### Create README.md
- [ ] Project description and architecture overview
- [ ] Tech stack (React Native, .NET 8, Entra External ID, Azure)
- [ ] Key features list
- [ ] Security highlights (2025 standards: CSP, CORS, config validation, SAS tokens)
- [ ] Screenshots (login, recipe list, recipe detail, image upload)
- [ ] Demo video link (1-2 minutes)
- [ ] Setup instructions (refer to docs/setup.md)
- [ ] Notice: "Development continues privately for monetization"

### Create docs/setup.md
- [ ] Prerequisites
- [ ] Backend setup steps
- [ ] Frontend setup steps
- [ ] Environment variables (use .env.example as reference)

### Create .env.example files
**Backend:**
```
AzureAd__Instance=https://yoursubdomain.ciamlogin.com/
AzureAd__TenantId=your-tenant-guid
AzureAd__ClientId=your-client-guid
ConnectionStrings__DefaultConnection=Server=...
AzureStorage__ConnectionString=DefaultEndpointsProtocol=https;AccountName=...
Security__AllowedOrigins__0=http://localhost:8081
```

**Frontend:**
```
EXPO_PUBLIC_API_URL=http://localhost:5186
EXPO_PUBLIC_MSAL_CLIENT_ID=your-client-guid
EXPO_PUBLIC_MSAL_AUTHORITY=https://yoursubdomain.ciamlogin.com/your-tenant-guid
```

### Sanitize Config Files
- [ ] Remove all real credentials from appsettings.Development.json
- [ ] Replace with placeholders or empty strings
- [ ] Commit sanitized configs

### Create Visual Assets
- [ ] Architecture diagram (draw.io or Excalidraw)
- [ ] Screenshots of main features
- [ ] Record 1-2 minute demo video → Upload to YouTube (unlisted)

---

## Phase 4: Repository Transition (1 evening)

### Tag and Archive Public Repo
```bash
git tag -a v1.0-portfolio-mvp -m "Portfolio version: MVP with auth and image upload"
git push origin v1.0-portfolio-mvp
```

**Archive on GitHub:**
```
Settings → Danger Zone → Archive this repository
```

### Create Private Repository
```bash
# Option A: Fresh start (recommended - no credential history)
1. GitHub → New Repository → "FoodBudget-Private" (Private)
2. Clone public repo to new folder
3. Delete .git folder
4. git init
5. git remote add origin <private-repo-url>
6. git add .
7. git commit -m "Initial commit from portfolio version"
8. git push -u origin main

# Update local environment
cd ../FoodBudget
git remote set-url origin <private-repo-url>
```

---

## Phase 5: Public Progress Blog (Optional)

### Setup GitHub Pages
```
1. GitHub → New Repository → "foodbudget-progress" (Public)
2. Settings → Pages → Enable
3. Add blog posts about features without code
4. Link from portfolio repo README
```

### Blog Post Ideas
- Building Modern Recipe App: Architecture Decisions
- Solving MSAL Token Race Condition
- Implementing 2025 Security Standards
- Why I Decided NOT to Implement Session Warnings

---

## Quick Checklist

**Today:**
- [ ] Rotate Azure Storage key
- [ ] Change SQL password
- [ ] Verify no production impact

**This Week:**
- [ ] Complete image upload feature (Sprint 5.1)

**After Image Upload:**
- [ ] Create 5-10 demo recipes with photos
- [ ] Take screenshots
- [ ] Record demo video
- [ ] Write README
- [ ] Create setup.md
- [ ] Create .env.example files
- [ ] Sanitize configs
- [ ] Tag v1.0-portfolio-mvp
- [ ] Archive public repo
- [ ] Create private repo
- [ ] Setup progress blog (optional)

---

## Portfolio Cutoff: What's Public vs. Private

**Public (Portfolio MVP):**
- ✅ User authentication (Entra External ID)
- ✅ Recipe CRUD operations
- ✅ Recipe images (Azure Blob Storage)