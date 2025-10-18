# Quick Testing Guide - Theme Persistence

## Dev Server Status
✅ Running at `http://localhost:8080/`

## What Was Fixed

**BEFORE:**
- ❌ Navbar theme toggle didn't persist on reload
- ❌ Sidebar color picker didn't persist on reload  
- ✅ Settings page Save button worked

**AFTER:**
- ✅ Navbar theme toggle PERSISTS on reload
- ✅ Sidebar color picker PERSISTS on reload
- ✅ Settings page Save button still works
- ✅ All changes sync to Firestore immediately

---

## How to Test (5 minutes)

### Test 1: Quick Navbar Toggle
1. Go to `http://localhost:8080/`
2. Login to your account
3. **Open browser Console** (F12 or Right-click → Inspect → Console)
4. Look for navbar (top-right area)
5. Click **sun/moon icon** to toggle light/dark theme
6. **Check console** - You should see:
   ```
   🎨 setTheme called with: dark user available? true
   💾 Saving theme to Firestore for user: [YOUR_USER_ID]
   ✅ Theme saved to Firestore: {theme: 'dark', colorTheme: 'blue'}
   ```
7. **Refresh page** (F5)
8. ✅ Theme should be DARK (persisted from Firestore)

### Test 2: Sidebar Color Change
1. Click **accessibility icon** (on navbar/sidebar, looks like a person)
2. You'll see color options: Blue, Grey, Red, Yellow, Green
3. **Click different color** (e.g., Red)
4. **Check console** - You should see:
   ```
   🎨 setColorTheme called with: red user available? true
   💾 Saving color theme to Firestore for user: [YOUR_USER_ID]
   ✅ Theme saved to Firestore: {theme: 'dark', colorTheme: 'red'}
   ```
5. **Refresh page** (F5)
6. ✅ Theme should still be RED (persisted from Firestore)

### Test 3: Settings Page
1. Go to **Settings** tab/page
2. Change theme and/or color
3. Click **Save Changes** button
4. **Check console** for success message
5. **Refresh page** (F5)
6. ✅ Changes should persist

### Test 4: Multiple Quick Changes
1. Click navbar toggle 3-4 times fast
2. Change sidebar color 2-3 times
3. **Check console** - Each change should show save messages
4. **Refresh page** (F5)
5. ✅ Last change should be applied

---

## What to Look For in Console

### ✅ SUCCESS MESSAGES
```
💾 Saving theme to Firestore for user: abc123xyz
✅ Theme saved to Firestore: {theme: 'dark', colorTheme: 'green'}
```

### ⚠️ INFO MESSAGES (Normal)
```
⚠️ User not authenticated when attempting to save theme - will retry when user loads
🔄 Retrying pending saves for newly loaded user
👤 User loaded: abc123xyz
```

### ❌ ERROR MESSAGES (Check permissions)
```
❌ Failed to save color theme to Firestore: FirebaseError: Missing or insufficient permissions
```

---

## Expected Behavior

| Action | Before | After |
|--------|--------|-------|
| Click navbar toggle | UI changes, console log | UI changes + Firestore save |
| Change sidebar color | UI changes, console log | UI changes + Firestore save |
| Refresh page | Wrong theme loaded | Correct theme persists ✅ |
| Check Settings page | Shows old data | Shows new data ✅ |

---

## Troubleshooting

### Issue: Console shows "User not authenticated"
- **Cause:** You're not logged in
- **Fix:** Login to the app first

### Issue: Console shows errors but color changed
- **Cause:** Firestore permissions issue
- **Fix:** Check Firebase rules (should allow user to update own profile)

### Issue: Refresh shows different theme
- **Cause:** Firestore save failed
- **Check:** Look for error messages in console
- **Fix:** Make sure user is logged in and Firestore is accessible

### Issue: Console shows "saved" but page doesn't reload properly
- **Cause:** Browser cache
- **Fix:** Do a hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

---

## Files Changed

1. **`src/contexts/ThemeContext.tsx`** - Added retry logic for pending saves
2. **`vite.config.ts`** - Changed port to 8080

---

## Next Steps

Once verified working:

1. ✅ Test on multiple browsers
2. ✅ Test with multiple users simultaneously
3. ✅ Check Firestore console to confirm updates
4. ✅ Deploy to production

---

## Console Keyboard Shortcuts

- **Windows/Linux:** F12 → click "Console" tab
- **Mac:** Cmd + Option + J
- **Or:** Right-click → Inspect → Console tab

---

**Status:** ✅ Ready to Test  
**Server:** http://localhost:8080/  
**Time to Test:** 5 minutes
