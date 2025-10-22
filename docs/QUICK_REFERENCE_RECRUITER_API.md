# Quick Reference Guide - Recruiter Backend APIs

## 🚀 Quick Start

### Import the Service
```typescript
import { RecruiterService } from "@/services/recruiterService";
```

---

## 📝 API Reference

### Authentication & Verification

#### Initialize Recruiter Profile
```typescript
const result = await RecruiterService.initializeRecruiterProfile({
  companyName: "Tech Company Inc",
  companyEmail: "recruiter@techcompany.com",
  gstNumber: "27AAPCT1234A1Z0",
  incorporationCertificate: "https://..." // optional
});

// Response:
// {
//   success: true,
//   message: "Recruiter profile initialized. Awaiting verification.",
//   recruiterId: "user_123"
// }
```

#### Get Recruiter Status
```typescript
const status = await RecruiterService.getRecruiterStatus();

// Response:
// {
//   isRecruiter: true,
//   status: "active" | "pending" | "verified" | "rejected",
//   isVerified: boolean,
//   companyName: "Tech Company Inc",
//   internshipsCreated: 5
// }
```

---

### 💼 Internship Management

#### Create Internship
```typescript
const result = await RecruiterService.createInternship({
  title: "Frontend Developer Intern",
  description: "Build responsive UIs with React...",
  location: "Bangalore, India",
  stipend: "₹20,000 - ₹30,000",
  duration: "3 months",
  sector: "Technology",
  skills: ["React", "TypeScript", "Tailwind CSS"],
  workMode: "Hybrid",
  applicationDeadline: "2025-11-30",
  companyLogoUrl: "https://...",
  maxApplications: 100
});

// Response:
// {
//   success: true,
//   internshipId: "intern_123",
//   message: "Internship created successfully"
// }
```

#### Update Internship
```typescript
const result = await RecruiterService.updateInternship("intern_123", {
  title: "Senior Frontend Developer Intern",
  stipend: "₹25,000 - ₹35,000",
  skills: ["React", "TypeScript", "Tailwind CSS", "GraphQL"]
});

// Response:
// {
//   success: true,
//   message: "Internship updated successfully"
// }
```

#### Publish Internship
```typescript
const result = await RecruiterService.publishInternship("intern_123");

// Response:
// {
//   success: true,
//   message: "Internship published successfully"
// }
```

#### Delete Internship
```typescript
const result = await RecruiterService.deleteInternship("intern_123");

// Response:
// {
//   success: true,
//   message: "Internship deleted successfully"
// }
```

#### Save Draft (Auto-save)
```typescript
const result = await RecruiterService.saveDraft("intern_123", {
  description: "Updated description...",
  skills: ["React", "TypeScript"]
});

// Called automatically while editing
```

---

### 📨 Application Management

#### Get Applications
```typescript
const result = await RecruiterService.getApplications({
  internshipId: "intern_123",
  status: "pending",
  limit: 50,
  offset: 0
});

// Response:
// {
//   applications: [
//     {
//       id: "app_1",
//       userId: "student_123",
//       internshipId: "intern_123",
//       status: "pending",
//       appliedAt: Timestamp,
//       notes: "...",
//       resumeURL: "..."
//     }
//   ],
//   hasMore: true,
//   total: 120
// }
```

#### Update Application Status
```typescript
const result = await RecruiterService.updateApplicationStatus(
  "app_123",
  "shortlisted",
  "Great background! Let's schedule an interview."
);

// Response:
// {
//   success: true,
//   message: "Application status updated and notification sent"
// }
```

#### Bulk Update Status
```typescript
const result = await RecruiterService.bulkUpdateApplicationStatus(
  ["app_1", "app_2", "app_3"],
  "rejected"
);

// Response:
// {
//   success: true,
//   updatedCount: 3,
//   message: "3 applications updated"
// }
```

#### Export Applications
```typescript
// Export to CSV
const csvBlob = await RecruiterService.exportApplicationsToCSV("intern_123");
// Downloads as CSV file

// Export to JSON (built-in)
const jsonBlob = await RecruiterService.exportApplicationsToCSV("intern_123");
// Downloads as JSON file
```

---

### 📊 Analytics

#### Track View
```typescript
const result = await RecruiterService.trackInternshipView("intern_123");

// Response:
// {
//   success: true
// }
```

#### Get Dashboard Analytics
```typescript
const stats = await RecruiterService.getRecruiterAnalytics();

// Response:
// {
//   totalInternships: 5,
//   totalViews: 1250,
//   totalApplications: 45,
//   statusBreakdown: {
//     pending: 10,
//     shortlisted: 15,
//     accepted: 5,
//     rejected: 15
//   },
//   conversionRate: "3.6"
// }
```

---

### 🔐 GDPR Compliance

#### Download Data
```typescript
const result = await RecruiterService.downloadUserData();

// Response:
// {
//   success: true,
//   data: {
//     profile: { ... },
//     recruiter: { ... },
//     applications: [ ... ],
//     internships: [ ... ],
//     notifications: [ ... ],
//     messages: [ ... ]
//   },
//   exportedAt: "2025-10-21T10:30:00Z"
// }

// Automatically downloads as JSON file
```

#### Deactivate Account
```typescript
const result = await RecruiterService.deactivateAccount(
  "Taking a break from hiring"
);

// Response:
// {
//   success: true,
//   message: "Account deactivated. You can reactivate within 30 days."
// }
```

#### Reactivate Account
```typescript
const result = await RecruiterService.reactivateAccount();

// Response:
// {
//   success: true,
//   message: "Account reactivated successfully"
// }
```

#### Update Privacy Settings
```typescript
const result = await RecruiterService.updatePrivacySettings({
  profileVisibility: "connections_only",
  hideFromCompanies: ["google.com", "microsoft.com"],
  anonymousMode: true,
  dataSharing: false
});

// Response:
// {
//   success: true,
//   message: "Privacy settings updated"
// }
```

---

## 🎨 Component Usage Examples

### Using EnhancedInternshipForm
```typescript
import { EnhancedInternshipForm } from "@/components/recruiter/EnhancedInternshipForm";

export function MyComponent() {
  return (
    <EnhancedInternshipForm
      internship={selectedInternship}
      onSave={() => {
        // Refresh list
        fetchInternships();
      }}
      onCancel={() => {
        // Close form
        setShowForm(false);
      }}
      onPublish={(internshipId) => {
        // Handle publish
        console.log("Published:", internshipId);
      }}
    />
  );
}
```

### Using EnhancedApplicationsTable
```typescript
import { EnhancedApplicationsTable } from "@/components/recruiter/EnhancedApplicationsTable";

export function ApplicationsView() {
  return (
    <EnhancedApplicationsTable
      internshipId="intern_123"
      limit={50}
    />
  );
}
```

### Using EnhancedRecruiterDashboard
```typescript
import { RecruiterDashboard } from "@/components/recruiter/EnhancedRecruiterDashboard";

export function DashboardView() {
  return (
    <RecruiterDashboard
      onCreateInternship={() => {
        // Open form to create new internship
        setShowForm(true);
      }}
    />
  );
}
```

### Using PrivacyAndAccountSettings
```typescript
import { PrivacyAndAccountSettings } from "@/components/recruiter/PrivacyAndAccountSettings";

export function SettingsView() {
  return (
    <PrivacyAndAccountSettings
      onAccountDeleted={() => {
        // Handle deletion
        logout();
      }}
    />
  );
}
```

---

## ⚠️ Error Handling

```typescript
import { RecruiterService } from "@/services/recruiterService";

try {
  const result = await RecruiterService.createInternship({
    title: "Developer Intern",
    description: "...",
    location: "Bangalore",
    stipend: "₹20,000",
    duration: "3 months",
    sector: "Technology",
    skills: ["React"]
  });
} catch (error: any) {
  if (error.code === "permission-denied") {
    console.error("You are not a verified recruiter");
  } else if (error.code === "invalid-argument") {
    console.error("Missing required fields");
  } else {
    console.error("Error:", error.message);
  }
}
```

---

## 🔄 Common Workflows

### Complete Recruiter Workflow
```typescript
// 1. Initialize recruiter profile
await RecruiterService.initializeRecruiterProfile({
  companyName: "MyCompany",
  companyEmail: "recruit@mycompany.com",
  gstNumber: "27AAPCT1234A1Z0"
});

// 2. Wait for admin verification (manual step)

// 3. Create internship
const { internshipId } = await RecruiterService.createInternship({
  title: "Frontend Dev",
  description: "...",
  location: "Bangalore",
  stipend: "₹20,000",
  duration: "3 months",
  sector: "Technology",
  skills: ["React", "TypeScript"]
});

// 4. Publish internship
await RecruiterService.publishInternship(internshipId);

// 5. Monitor applications
const { applications } = await RecruiterService.getApplications({
  internshipId,
  limit: 50
});

// 6. Update application statuses
for (const app of applications) {
  if (goodCandidate(app)) {
    await RecruiterService.updateApplicationStatus(
      app.id,
      "shortlisted",
      "Interested in your profile"
    );
  }
}

// 7. Get analytics
const stats = await RecruiterService.getRecruiterAnalytics();
console.log(`Conversion rate: ${stats.conversionRate}%`);
```

### Data Export Workflow
```typescript
// 1. User requests data download
const { data, exportedAt } = await RecruiterService.downloadUserData();

// 2. File automatically downloads
// 3. Show confirmation to user
alert("Your data has been downloaded!");

// 4. User can deactivate if needed
await RecruiterService.deactivateAccount("No longer hiring");
```

---

## 📋 Status Values

### Internship Status
- `draft` - Not yet published
- `published` - Visible to students
- `archived` - No longer accepting applications

### Application Status
- `pending` - Recently applied
- `applied` - Application received
- `in-review` - Under review
- `shortlisted` - Candidate shortlisted
- `interview` - Interview scheduled
- `interview_scheduled` - Interview confirmed
- `accepted` - Offer made
- `rejected` - Not selected
- `withdrawn` - Student withdrew

### Recruiter Status
- `pending` - Awaiting verification
- `verified` - Verified by admin
- `active` - Actively using platform
- `deactivated` - Account deactivated

### Profile Visibility
- `public` - Visible to everyone
- `private` - Only visible to owner
- `connections_only` - Visible to connections

---

## 🔗 Related Documentation

- **Full Documentation**: See `FULL_STACK_IMPLEMENTATION.md`
- **Deployment Guide**: See `BACKEND_SETUP_AND_DEPLOYMENT.md`
- **Implementation Status**: See `IMPLEMENTATION_COMPLETE.md`

---

## 💡 Tips & Best Practices

1. **Always use try-catch** when calling RecruiterService
2. **Paginate large datasets** - use limit and offset
3. **Auto-save drafts** - saves every 1.5 seconds
4. **Batch bulk operations** - update up to 100 items at once
5. **Check recruiter status** - before showing recruiter features
6. **Export regularly** - for backup and data management
7. **Monitor conversion rates** - optimize internship descriptions
8. **Use meaningful filters** - help recruiters find relevant applications

---

## 📞 Support

For issues:
1. Check error code and message
2. Verify user is authenticated
3. Confirm recruiter is verified
4. Check Firestore rules
5. Review function logs: `firebase functions:log`

---

Last Updated: October 21, 2025
Version: 1.0.0
