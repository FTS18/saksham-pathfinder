# Firebase Firestore Indexes

## Required Composite Indexes

If you encounter Firebase index errors, you can create the required indexes using the Firebase Console or the provided links in the error messages.

### For Skills Query
- Collection: `internships`
- Fields:
  - `required_skills` (Array)
  - `posted_date` (Descending)
  - `__name__` (Ascending)

### Alternative Solution
The code has been updated to avoid requiring composite indexes by:
1. Removing `orderBy` from queries that use `array-contains`
2. Sorting results in memory after fetching
3. Using simple queries as fallbacks

This approach works better for development and reduces Firebase index requirements.

## Creating Indexes Manually

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database > Indexes
4. Click "Create Index"
5. Add the fields as specified above

## Error Links
When you see index errors in the console, Firebase provides direct links to create the required indexes. Simply click on those links to automatically create the indexes.