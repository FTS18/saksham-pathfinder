# Saksham Pathfinder - Full-Stack Backend Implementation

## 📋 Overview

This document outlines the complete full-stack implementation of the Saksham Pathfinder platform with a focus on the recruiter role, GDPR compliance, and real-time data management.

---

## 🏗️ Architecture

### Backend Stack
- **Firebase Cloud Functions** - Serverless backend for business logic
- **Firestore Database** - NoSQL database with real-time capabilities
- **Firebase Authentication** - User authentication and role management
- **Firestore Security Rules** - Fine-grained access control

### Frontend Stack
- **React + TypeScript** - UI framework
- **Vite** - Build tool
- **Radix UI + Tailwind CSS** - Component library and styling
- **Recharts** - Analytics visualization

---

## 🔐 Backend Infrastructure

### 1. Firebase Cloud Functions (`functions/src/index.ts`)

#### Authentication & Authorization
```typescript
// Middleware functions for role verification
- getAuthenticatedUserId()      // Verify user is logged in
- verifyRecruiterRole()         // Check recruiter status
- verifyInternshipOwnership()   // Verify recruiter owns internship
```

#### Recruiter Verification & Onboarding
```typescript
- initializeRecruiterProfile()  // Create recruiter profile with company verification
- getRecruiterStatus()          // Get verification status
```

#### Internship Management (Recruiter Only)
```typescript
- createInternship()            // Create new internship
- updateInternship()            // Update existing internship
- deleteInternship()            // Delete internship and related applications
- publishInternship()           // Make internship visible to students
```

#### Application Management
```typescript
- getApplications()             // Fetch recruiter's applications
- updateApplicationStatus()     // Update single application status
- bulkUpdateApplicationStatus() // Bulk update multiple applications
```

#### Analytics & Tracking
```typescript
- trackInternshipView()         // Track when internship is viewed
- getRecruiterAnalytics()       // Get dashboard analytics
```

#### GDPR Compliance
```typescript
- exportUserData()              // Export all user data (GDPR Article 20)
- deactivateAccount()           // Temporary account deactivation
- reactivateAccount()           // Reactivate within 30 days
```

---

## 📊 Database Schema

### Collections

#### 1. `recruiters` Collection
```typescript
{
  userId: string;                           // Firebase UID
  companyName: string;                      // Company name
  companyEmail: string;                     // Company email
  emailDomain: string;                      // Domain for verification
  gstNumber: string;                        // GST number
  incorporationCertificateUrl?: string;    // Document URL
  isVerified: boolean;                      // Verification status
  status: "pending" | "verified" | "active" | "deactivated";
  submittedAt: Timestamp;                   // Application submission time
  updatedAt: Timestamp;                     // Last update time
  internshipsCreated: number;               // Count of internships
  applicationsReceived: number;             // Count of applications
  deactivatedAt?: Timestamp;                // Deactivation time
}
```

#### 2. `verificationRequests` Collection
```typescript
{
  recruiterId: string;                      // Reference to user
  companyName: string;
  companyEmail: string;
  gstNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;                      // Admin ID
  rejectionReason?: string;
}
```

#### 3. `internships` Collection (Enhanced)
```typescript
{
  id: string;                               // Document ID
  recruiterId: string;                      // Recruiter's ID
  title: string;                            // Job title
  description: string;                      // Full description
  location: string;                         // Job location
  stipend: string;                          // Salary range
  duration: string;                         // Internship duration
  sector: string;                           // Industry sector
  skills: string[];                         // Required skills
  workMode: "Remote" | "On-site" | "Hybrid";
  applicationDeadline?: string;             // Application deadline
  companyLogoUrl?: string;                  // Company logo URL
  maxApplications?: number;                 // Max applications allowed
  status: "draft" | "published" | "archived";
  views: number;                            // View count for analytics
  applications: number;                     // Application count
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;                  // When published
}
```

#### 4. `applications` Collection (Enhanced)
```typescript
{
  id: string;
  userId: string;                           // Student's UID
  recruiterId: string;                      // Recruiter's UID
  internshipId: string;                     // Internship ID
  internshipTitle: string;
  companyName: string;
  status: "pending" | "in-review" | "shortlisted" | "accepted" | "rejected";
  appliedAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;                           // Recruiter notes
  resumeURL?: string;                       // Student's resume
  coverLetter?: string;                     // Application cover letter
  priority?: "low" | "medium" | "high";
  source?: string;
  metadata?: {
    screenTime?: number;
    clicks?: number;
  };
}
```

#### 5. `analytics` Collection (New)
```typescript
{
  id: string;
  internshipId: string;
  userId?: string;                          // Viewer's ID
  recruiterId?: string;
  eventType: "view" | "click" | "apply" | "save";
  timestamp: Timestamp;
  metadata?: {
    referrer?: string;
    device?: string;
  };
}
```

#### 6. `messages` Collection (New)
```typescript
{
  id: string;
  conversationId: string;                   // Thread ID
  senderId: string;                         // From user
  recipientId: string;                      // To user
  subject?: string;
  content: string;
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: {
    attachments?: string[];
    reactions?: Record<string, number>;
  };
}
```

#### 7. `notifications` Collection (Enhanced)
```typescript
{
  id: string;
  userId: string;
  type: "application_status_updated" | "new_application" | "message" | "profile_viewed";
  title: string;
  message: string;
  applicationId?: string;
  read: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

---

## 🔒 Security Rules (firestore.rules)

### Key Rules

1. **Recruiter Access Control**
   ```
   - Only verified recruiters can create/update/delete internships
   - Recruiters can only modify their own internships
   - Published internships visible to all authenticated users
   ```

2. **Application Access**
   ```
   - Students can only read/create their own applications
   - Recruiters can read applications for their internships
   - Only application owner or recruiter can update status
   ```

3. **Analytics Access**
   ```
   - Recruiters can only read analytics for their internships
   - Admins can read all analytics
   ```

4. **Message Access**
   ```
   - Users can only read messages sent to/from them
   - Only sender can delete their messages
   ```

---

## 📱 Frontend Services

### RecruiterService (`src/services/recruiterService.ts`)

Handles all recruiter-related API calls:

#### Verification & Onboarding
- `initializeRecruiterProfile(data)` - Start verification process
- `getRecruiterStatus()` - Check current status

#### Internship Operations
- `createInternship(internship)` - Create new
- `updateInternship(id, updates)` - Update
- `deleteInternship(id)` - Delete
- `publishInternship(id)` - Publish
- `saveDraft(id, updates)` - Auto-save

#### Application Management
- `getApplications(filters)` - Fetch applications
- `updateApplicationStatus(id, status, notes)` - Update status
- `bulkUpdateApplicationStatus(ids, status)` - Bulk update

#### Analytics
- `trackInternshipView(internshipId)` - Track views
- `getRecruiterAnalytics()` - Get dashboard stats

#### GDPR Features
- `downloadUserData()` - Export all data
- `deactivateAccount(reason)` - Deactivate
- `reactivateAccount()` - Reactivate
- `updatePrivacySettings(settings)` - Update privacy

---

## 🎨 Frontend Components

### Recruiter Components

#### 1. `EnhancedInternshipForm`
- Create/Edit internships
- Auto-save functionality
- Publish/Duplicate/Delete actions
- Skill management
- Real-time validation

**Props:**
```typescript
interface InternshipFormProps {
  internship?: Internship | null;
  onSave?: () => void;
  onCancel?: () => void;
  onPublish?: (internshipId: string) => void;
}
```

#### 2. `EnhancedApplicationsTable`
- Display applications with filtering
- Sort by status, date
- Select multiple applications
- Bulk status updates
- Export to CSV/JSON
- Real-time status changes

**Props:**
```typescript
interface ApplicationsTableProps {
  internshipId?: string;
  limit?: number;
}
```

#### 3. `EnhancedRecruiterDashboard`
- Key metrics cards (Total Internships, Views, Applications, Conversion Rate)
- Status breakdown pie chart
- Performance metrics
- Optimization tips

**Props:**
```typescript
interface DashboardStatsProps {
  onCreateInternship?: () => void;
}
```

#### 4. `PrivacyAndAccountSettings`
- Privacy settings (profile visibility, anonymous mode, data sharing)
- GDPR data download
- Temporary account deactivation/reactivation
- Permanent account deletion
- Audit trail

**Props:**
```typescript
interface PrivacySettingsProps {
  onAccountDeleted?: () => void;
}
```

---

## 🔄 Data Flow

### Internship Creation Flow
1. User clicks "Create Internship"
2. Opens `EnhancedInternshipForm`
3. User fills in details
4. Form auto-saves drafts every 1.5 seconds
5. User clicks "Publish"
6. Calls `publishInternship()` Cloud Function
7. Function verifies recruiter role and ownership
8. Updates Firestore, sets status to "published"
9. Dashboard refreshes with new internship count

### Application Status Update Flow
1. Recruiter views `EnhancedApplicationsTable`
2. Selects applications to update
3. Clicks bulk action or individual dropdown
4. Calls `updateApplicationStatus()` or `bulkUpdateApplicationStatus()`
5. Cloud Function validates ownership
6. Updates Firestore with new status
7. Creates notification for student
8. Table updates in real-time
9. Dashboard analytics refresh

### Data Export Flow (GDPR)
1. User clicks "Download Your Data"
2. Confirms in dialog
3. Calls `exportUserData()` Cloud Function
4. Function fetches from multiple collections:
   - profiles, recruiters, internships, applications, notifications, messages
5. Returns data as JSON
6. Frontend downloads as file
7. No data is stored server-side

---

## 📊 Firestore Indexes

Required indexes for optimal performance:

```json
{
  "indexes": [
    {
      "collectionGroup": "internships",
      "fields": [
        { "fieldPath": "recruiterId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "applications",
      "fields": [
        { "fieldPath": "recruiterId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "applications",
      "fields": [
        { "fieldPath": "internshipId", "order": "ASCENDING" },
        { "fieldPath": "appliedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🚀 Deployment

### 1. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

### 4. Build & Deploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

---

## 🧪 Testing

### Test Cloud Functions Locally
```bash
npm run test:firestore:emulator
```

### Test Firestore Rules
```bash
npm run test:firestore:rules
```

---

## 📈 Performance Optimization

### 1. Pagination
- Applications table uses pagination (default 50 per page)
- Reduces bandwidth and improves UI responsiveness

### 2. Caching
- Frontend caches recruiter status
- Analytics cached for 5 minutes

### 3. Batch Operations
- Bulk status updates use writeBatch
- Reduces API calls

### 4. Indexes
- Firestore indexes optimize queries
- Faster filtering by recruiter and status

---

## 🔐 GDPR Compliance

### 1. Data Download (Article 20)
- `exportUserData()` collects all user data
- Returns in machine-readable JSON format
- Portable data format

### 2. Account Deactivation (Right to be Forgotten)
- User can deactivate account temporarily
- 30-day window for reactivation
- After 30 days, data can be deleted

### 3. Account Deletion
- Permanent deletion with confirmation
- All related data removed
- Non-reversible

### 4. Privacy Settings
- Profile visibility control
- Opt-out from specific companies
- Anonymous browsing mode
- Data sharing preferences

---

## ❌ Error Handling

### Cloud Functions Error Codes
```typescript
- "unauthenticated" - User not logged in
- "permission-denied" - Insufficient permissions
- "invalid-argument" - Missing or invalid parameters
- "not-found" - Resource not found
- "already-exists" - Duplicate entry
```

### Frontend Error Handling
- Try-catch blocks on all API calls
- User-friendly error messages
- Error toast notifications
- Retry mechanisms

---

## 📚 Usage Examples

### Create Internship
```typescript
const result = await RecruiterService.createInternship({
  title: "Frontend Developer Intern",
  description: "Build responsive UIs...",
  location: "Bangalore, India",
  stipend: "₹20,000 - ₹30,000",
  duration: "3 months",
  sector: "Technology",
  skills: ["React", "TypeScript", "Tailwind CSS"],
  workMode: "Hybrid"
});

console.log(result.internshipId); // New internship ID
```

### Update Application Status
```typescript
await RecruiterService.updateApplicationStatus(
  "app_123",
  "shortlisted",
  "Great background! Let's schedule an interview."
);
```

### Get Dashboard Analytics
```typescript
const stats = await RecruiterService.getRecruiterAnalytics();

console.log(stats.totalInternships);    // 5
console.log(stats.totalApplications);   // 45
console.log(stats.conversionRate);      // "12.5"
```

### Export User Data
```typescript
const { data } = await RecruiterService.downloadUserData();

// data contains:
// - profile
// - recruiter
// - applications
// - internships
// - notifications
// - messages
```

---

## 🎯 Next Steps

1. **Admin Dashboard** - Review and approve recruiter verifications
2. **Email Notifications** - Send real-time alerts to recruiters
3. **Analytics Dashboard** - Advanced reporting and insights
4. **Message System** - Real-time chat between recruiters and students
5. **Payment Integration** - Premium recruiter features
6. **CV Parsing** - Extract information from student CVs
7. **AI Matching** - ML-based candidate recommendations
8. **Bulk Operations** - CSV import/export for internships
9. **Custom Workflows** - Recruiter workflow customization
10. **API Integration** - Webhook support for third-party tools

---

## 📞 Support

For issues or questions:
1. Check the error messages and logs
2. Review Firestore rules and indexes
3. Verify Cloud Function deployment
4. Check browser console for client errors
5. Review Firebase documentation

---

## 📝 License

This implementation is part of Saksham Pathfinder.

---

Last Updated: October 21, 2025
