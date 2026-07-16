# Architecture Overview & Data Flow Diagrams

## ️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Recruiter Components Layer                 │   │
│  │                                                       │   │
│  │  - EnhancedInternshipForm                           │   │
│  │  - EnhancedApplicationsTable                        │   │
│  │  - EnhancedRecruiterDashboard                       │   │
│  │  - PrivacyAndAccountSettings                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           RecruiterService (TypeScript)             │   │
│  │        (All API calls to Cloud Functions)           │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Firebase Client SDK (Auth + Firestore)         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            
                (HTTPS + JWT Authentication)
                            
┌─────────────────────────────────────────────────────────────┐
│              Firebase Backend Infrastructure                 │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Cloud Functions (index.ts)                  │   │
│  │                                                       │   │
│  │   Authentication Middleware                        │   │
│  │   Recruiter Verification (8 functions)            │   │
│  │   Internship Management (5 functions)             │   │
│  │   Application Management (4 functions)            │   │
│  │   Analytics & Tracking (2 functions)              │   │
│  │   GDPR Compliance (3 functions)                   │   │
│  │   OG Tags Fetching (1 function)                   │   │
│  │                                                       │   │
│  │  Total: 23 Cloud Functions                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Firestore Database                          │   │
│  │     (Real-time NoSQL + Security Rules)               │   │
│  │                                                       │   │
│  │  Collections:                                        │   │
│  │   recruiters                                       │   │
│  │   verificationRequests                            │   │
│  │   internships (enhanced)                          │   │
│  │   applications (enhanced)                         │   │
│  │   analytics (new)                                 │   │
│  │   messages (new)                                  │   │
│  │   notifications (enhanced)                        │   │
│  │   profiles (enhanced)                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Firebase Authentication                         │   │
│  │         (JWT + Role Management)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

##  Recruiter Workflow - Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. RECRUITER SIGNUP & VERIFICATION                          │
│─────────────────────────────────────────────────────────────│
│                                                               │
│  User Registration                                            │
│       ↓                                                       │
│  Firebase Auth (Email/Password or OAuth)                    │
│       ↓                                                       │
│  RecruiterService.initializeRecruiterProfile()              │
│       ↓                                                       │
│  Cloud Function: initializeRecruiterProfile()               │
│       ├─ Verify user authenticated                          │
│       ├─ Create recruiters/{userId} document               │
│       ├─ Set status = "pending"                            │
│       └─ Create verificationRequests document              │
│       ↓                                                       │
│  Admin Review (Manual Step)                                 │
│       ├─ Admin verifies GST number                         │
│       ├─ Admin checks incorporation certificate            │
│       └─ Admin approves                                     │
│       ↓                                                       │
│  Status = "verified" → "active"                             │
│       ↓                                                       │
│   Ready to create internships                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. INTERNSHIP CREATION                                       │
│─────────────────────────────────────────────────────────────│
│                                                               │
│  User opens EnhancedInternshipForm                           │
│       ↓                                                       │
│  Form rendered with empty fields                            │
│       ↓                                                       │
│  User fills in details                                      │
│       ├─ Title, Description, Location                      │
│       ├─ Stipend, Duration, Sector                         │
│       └─ Skills, Work Mode, Deadline                       │
│       ↓                                                       │
│  Auto-save triggered every 1.5 seconds                     │
│       ├─ FormData state updated                            │
│       ├─ RecruiterService.saveDraft() called              │
│       └─ Cloud Function: updateInternship()               │
│       ↓                                                       │
│  User clicks "Publish"                                      │
│       ↓                                                       │
│  RecruiterService.publishInternship()                       │
│       ↓                                                       │
│  Cloud Function: publishInternship()                        │
│       ├─ Verify user is recruiter                          │
│       ├─ Verify recruiter owns internship                  │
│       ├─ Update status = "published"                       │
│       └─ Set publishedAt timestamp                         │
│       ↓                                                       │
│   Internship visible to students                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. APPLICATION MANAGEMENT                                    │
│─────────────────────────────────────────────────────────────│
│                                                               │
│  Students apply to internship                               │
│       ↓                                                       │
│  Application documents created in Firestore                 │
│       ├─ applications/{appId}                              │
│       ├─ status = "pending"                                │
│       └─ appliedAt = now()                                 │
│       ↓                                                       │
│  Recruiter opens EnhancedApplicationsTable                 │
│       ↓                                                       │
│  Table fetches with RecruiterService.getApplications()     │
│       ↓                                                       │
│  Cloud Function: getApplications()                         │
│       ├─ Verify recruiter authenticated                    │
│       ├─ Query applications where recruiterId == userId    │
│       ├─ Apply status filter if specified                  │
│       ├─ Sort by appliedAt (descending)                    │
│       └─ Return paginated results (limit=50)              │
│       ↓                                                       │
│  Recruiter selects applications                            │
│       ├─ Individual status dropdown                        │
│       └─ Bulk action checkbox                              │
│       ↓                                                       │
│  Recruiter updates status                                  │
│       ├─ Single: RecruiterService.updateApplicationStatus()│
│       └─ Bulk: RecruiterService.bulkUpdateApplicationStatus()
│       ↓                                                       │
│  Cloud Function: updateApplicationStatus()                │
│       ├─ Verify recruiter owns application                │
│       ├─ Update application status                        │
│       └─ Create notification for student                  │
│       ↓                                                       │
│   Application updated + Student notified                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4. ANALYTICS & DASHBOARD                                     │
│─────────────────────────────────────────────────────────────│
│                                                               │
│  Student views internship                                   │
│       ↓                                                       │
│  Frontend calls RecruiterService.trackInternshipView()     │
│       ↓                                                       │
│  Cloud Function: trackInternshipView()                     │
│       ├─ Increment internships/{id}.views by 1            │
│       ├─ Create analytics document                        │
│       │  └─ eventType = "view"                            │
│       └─ Record timestamp                                  │
│       ↓                                                       │
│  Recruiter opens EnhancedRecruiterDashboard               │
│       ↓                                                       │
│  Dashboard calls RecruiterService.getRecruiterAnalytics() │
│       ↓                                                       │
│  Cloud Function: getRecruiterAnalytics()                  │
│       ├─ Get all internships where recruiterId == userId  │
│       ├─ Calculate totalInternships count                 │
│       ├─ Sum all views across internships                 │
│       ├─ Get all applications for recruiter              │
│       ├─ Calculate totalApplications count                │
│       ├─ Build statusBreakdown object                    │
│       └─ Calculate conversionRate                        │
│       ↓                                                       │
│  Dashboard renders metrics                                 │
│       ├─ Key cards (Internships, Views, Apps, Conversion) │
│       ├─ Pie chart (Status breakdown)                    │
│       ├─ Performance metrics                              │
│       └─ Optimization tips                                │
│       ↓                                                       │
│   Recruiter gains insights                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 5. GDPR COMPLIANCE                                            │
│─────────────────────────────────────────────────────────────│
│                                                               │
│  User requests data download                               │
│       ↓                                                       │
│  RecruiterService.downloadUserData()                       │
│       ↓                                                       │
│  Cloud Function: exportUserData()                          │
│       ├─ Verify user authenticated                        │
│       ├─ Fetch profiles/{userId}                         │
│       ├─ Fetch recruiters/{userId}                       │
│       ├─ Fetch applications where userId == uid          │
│       ├─ Fetch internships where recruiterId == uid      │
│       ├─ Fetch notifications where userId == uid         │
│       └─ Fetch messages where senderId/recipientId==uid  │
│       ↓                                                       │
│  Return data object with all collections                  │
│       ↓                                                       │
│  Frontend creates Blob from JSON                          │
│       ↓                                                       │
│  Browser downloads: gdpr-data-export-YYYY-MM-DD.json     │
│       ↓                                                       │
│   User has portable data                                 │
│       ↓                                                       │
│  User clicks "Deactivate Account"                         │
│       ↓                                                       │
│  RecruiterService.deactivateAccount(reason)              │
│       ↓                                                       │
│  Cloud Function: deactivateAccount()                      │
│       ├─ Set profiles/{userId}.isActive = false         │
│       ├─ Set deactivatedAt = now()                      │
│       ├─ If recruiter, set status = "deactivated"       │
│       └─ Store reason                                    │
│       ↓                                                       │
│  Account becomes inactive (can reactivate within 30 days) │
│       ↓                                                       │
│   GDPR Article 20 Compliance                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

##  Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                    Firebase Firestore                         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  recruiters/{userId}                                          │
│  ├─ userId (key)                                            │
│  ├─ companyName                                             │
│  ├─ isVerified                                              │
│  ├─ status: "pending" | "active" | "deactivated"           │
│  └─ internshipsCreated (counter)                            │
│         ↓ (recruiter creates)                               │
│         └─→ internships/{internshipId}                      │
│            ├─ recruiterId (foreign key)                    │
│            ├─ title, description, location                 │
│            ├─ status: "draft" | "published"               │
│            ├─ views (counter)                              │
│            ├─ createdAt, publishedAt                       │
│            └─ (students apply to)                          │
│               └─→ applications/{applicationId}             │
│                  ├─ recruiterId (denormalized)             │
│                  ├─ internshipId (foreign key)             │
│                  ├─ userId (student)                       │
│                  ├─ status: "pending" | "shortlisted"...   │
│                  ├─ appliedAt                              │
│                  └─ (triggers)                             │
│                     └─→ notifications/{notifId}            │
│                        ├─ userId (student)                 │
│                        ├─ type                             │
│                        ├─ message                          │
│                        └─ createdAt                        │
│                                                             │
│  analytics/{analyticsId}                                     │
│  ├─ internshipId (foreign key)                            │
│  ├─ eventType: "view" | "click" | "apply"                 │
│  ├─ userId (viewer)                                        │
│  └─ timestamp                                              │
│                                                             │
│  messages/{messageId}                                        │
│  ├─ senderId                                               │
│  ├─ recipientId                                            │
│  ├─ content                                                │
│  ├─ createdAt                                              │
│  └─ isRead                                                 │
│                                                             │
│  profiles/{userId}                                           │
│  ├─ name, email, phone                                     │
│  ├─ isActive                                               │
│  ├─ isPublic                                               │
│  ├─ deactivatedAt                                          │
│  └─ privacy settings                                       │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

---

##  Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│              API Request from Frontend                       │
│                    (RecruiterService)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           Cloud Function Handler                            │
│  - Receives request with JWT token in context.auth         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Authentication Check                              │
│  if (!context.auth?.uid) {                                 │
│    throw HttpsError("unauthenticated")                    │
│  }                                                         │
│   User is logged in                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Authorization Check (Role Verification)           │
│  const isRecruiter = await verifyRecruiterRole(userId)    │
│  if (!isRecruiter) {                                       │
│    throw HttpsError("permission-denied")                  │
│  }                                                         │
│   User is verified recruiter                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Ownership Verification (if applicable)            │
│  const owns = await verifyInternshipOwnership(             │
│    internshipId,                                           │
│    userId                                                  │
│  )                                                         │
│  if (!owns) {                                              │
│    throw HttpsError("permission-denied")                  │
│  }                                                         │
│   Recruiter owns this internship                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Input Validation                                  │
│  if (!title || !description || !location) {               │
│    throw HttpsError("invalid-argument")                   │
│  }                                                         │
│   All required fields present                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Business Logic & Database Operation               │
│  await db.collection("internships").update(...)           │
│   Operation succeeds                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           Firestore Security Rules Check                    │
│  match /internships/{internshipId} {                       │
│    allow update: if                                        │
│      isVerifiedRecruiter() &&                             │
│      resource.data.recruiterId == request.auth.uid        │
│  }                                                         │
│   Double-check at database level                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Return Response to Frontend                       │
│  return { success: true, message: "..." }                 │
│   Request completed securely                            │
└─────────────────────────────────────────────────────────────┘
```

---

##  Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│         Frontend Optimization                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Pagination (limit=50, offset=0)                         │
│     → Reduces payload size                                  │
│     → Faster initial load                                  │
│     → Better UX                                            │
│                                                              │
│   Auto-save with debouncing (1.5 second delay)            │
│     → Reduces database writes                              │
│     → Saves user progress                                  │
│     → No blocking UI                                       │
│                                                              │
│   Bulk operations (update 100 items at once)              │
│     → Single database transaction                          │
│     → Atomic consistency                                   │
│     → Reduced latency                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         Database Optimization                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Firestore Indexes                                       │
│     Query 1: recruiterId + createdAt (descending)          │
│     Query 2: recruiterId + status (ascending)              │
│     Query 3: internshipId + appliedAt (descending)         │
│     Query 4: userId + createdAt (descending)               │
│     → O(1) query time instead of O(n)                      │
│                                                              │
│   Collection Structure                                    │
│     → Shallow nesting (2-3 levels max)                     │
│     → Denormalized data where appropriate                  │
│     → Counters for aggregations                            │
│                                                              │
│   Batch Operations                                        │
│     → writeBatch() for atomic consistency                  │
│     → Single transaction for related updates               │
│     → Reduced conflicts                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         Cloud Function Optimization                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Efficient Queries                                       │
│     → Use indexes                                          │
│     → Limit fields retrieved                              │
│     → Use constraints (where clauses)                     │
│     → Avoid N+1 queries                                   │
│                                                              │
│   Async Operations                                        │
│     → Parallel queries where possible                     │
│     → Promise.all() for concurrent operations             │
│     → Await only what's necessary                         │
│                                                              │
│   Memory Management                                       │
│     → Streaming for large results                         │
│     → Clean up event listeners                            │
│     → No memory leaks                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

##  Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Development                               │
├─────────────────────────────────────────────────────────────┤
│  Local Environment                                           │
│  ├─ Firebase Emulator (Port 4000)                          │
│  ├─ Firestore Emulator (Port 8080)                         │
│  ├─ Functions Emulator (Port 5001)                         │
│  ├─ Auth Emulator (Port 9099)                              │
│  └─ Vite Dev Server (Port 5173)                            │
│                                                              │
│  npm run dev             # Start dev server               │
│  firebase emulators:start # Start all emulators           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  firebase deploy --dry-run
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Staging                                   │
├─────────────────────────────────────────────────────────────┤
│  Firebase Project (Staging)                                 │
│  ├─ Cloud Functions (auto-scaling)                         │
│  ├─ Firestore Database (auto-scaling)                      │
│  ├─ Firebase Authentication                                │
│  └─ Firebase Hosting                                       │
│                                                              │
│  firebase use staging                                       │
│  firebase deploy                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   Manual Testing
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Production                                │
├─────────────────────────────────────────────────────────────┤
│  Firebase Project (Production)                              │
│  ├─ Cloud Functions (auto-scaling, monitoring)             │
│  ├─ Firestore Database (auto-scaling, backups)             │
│  ├─ Firebase Authentication (2FA, security)                │
│  ├─ Firebase Hosting (CDN, SSL/TLS)                        │
│  └─ Cloud Logging & Monitoring                             │
│                                                              │
│  firebase use production                                    │
│  firebase deploy                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
            Monitor Logs & Performance Metrics
```

---

##  Firestore Collections Structure

```
recruiters/
  {userId}/
    - companyName: "Tech Corp"
    - isVerified: true
    - status: "active"
    - internshipsCreated: 5
    - createdAt: Timestamp
    
verificationRequests/
  {requestId}/
    - recruiterId: "user_123"
    - status: "pending"
    - createdAt: Timestamp
    
internships/
  {internshipId}/
    - title: "Frontend Dev Intern"
    - recruiterId: "user_123"
    - status: "published"
    - views: 1250
    - createdAt: Timestamp
    - publishedAt: Timestamp
    
applications/
  {applicationId}/
    - userId: "student_123"
    - internshipId: "intern_456"
    - recruiterId: "user_123"
    - status: "pending"
    - appliedAt: Timestamp
    
analytics/
  {analyticsId}/
    - internshipId: "intern_456"
    - userId: "student_123"
    - eventType: "view"
    - timestamp: Timestamp
    
notifications/
  {notificationId}/
    - userId: "student_123"
    - type: "application_status_updated"
    - message: "..."
    - read: false
    - createdAt: Timestamp
    
messages/
  {messageId}/
    - senderId: "user_123"
    - recipientId: "student_123"
    - content: "..."
    - createdAt: Timestamp
    
profiles/
  {userId}/
    - name: "John Doe"
    - email: "john@example.com"
    - isActive: true
    - deactivatedAt: null
```

---

##  Implementation Summary

- **Frontend Components**: 4 production-ready React components
- **Cloud Functions**: 23 serverless functions
- **Database Collections**: 8 collections with proper relationships
- **Security Rules**: Comprehensive Firestore rules
- **Documentation**: 4 complete guides

---

Last Updated: October 21, 2025
