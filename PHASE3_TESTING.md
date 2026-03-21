# Phase 3 Testing Guide

This guide helps you verify that all Phase 3 features are working correctly.

## Prerequisites

```bash
# Ensure dev server is running
npm run dev

# Server should be at http://localhost:3000
```

## Test 1: Database Indexes ✅ (Already Verified)

```bash
# Check migration was applied
ls -la prisma/migrations/ | grep add_performance_indexes

# Verify Prisma Client was regenerated
ls -la node_modules/.prisma/client/

# Validate schema
npx prisma validate
```

**Expected:**
- ✅ Migration folder exists
- ✅ Prisma Client regenerated
- ✅ Schema is valid

## Test 2: Search Pagination (Frontend)

### Setup
1. Login with STU001 / password123
2. Navigate to Search page (http://localhost:3000/search)

### Test Cases

#### Test 2.1: Search with Results
1. Enter search keyword: "キャリア" or "面接"
2. Click "検索" button
3. **Verify:**
   - ✅ Results appear in card format
   - ✅ Result count shows: "X件の結果が見つかりました（1/Yページ）"
   - ✅ If totalPages > 1, pagination controls appear

#### Test 2.2: Pagination Navigation (if multiple pages)
1. Click "次へ" (Next) button
2. **Verify:**
   - ✅ Page 2 loads
   - ✅ URL updates with `?q=keyword&page=2&limit=20`
   - ✅ Counter shows "（2/Yページ）"
   - ✅ Page scrolls to top
3. Click "前へ" (Previous) button
4. **Verify:**
   - ✅ Return to page 1
   - ✅ Counter shows "（1/Yページ）"

#### Test 2.3: Pagination Boundaries
1. On page 1:
   - ✅ "前へ" button is disabled
2. Navigate to last page:
   - ✅ "次へ" button is disabled

#### Test 2.4: Empty Results
1. Search for: "存在しないキーワード99999"
2. **Verify:**
   - ✅ "検索結果が見つかりませんでした" message appears
   - ✅ No pagination controls shown

## Test 3: Question History Pagination

### Setup
1. Login with STU001 / password123
2. Navigate to Question History (http://localhost:3000/question/history)

### Test Cases

#### Test 3.1: Initial Load
1. **Verify:**
   - ✅ Questions appear in reverse chronological order (newest first)
   - ✅ Each question shows:
     - Status badge (未回答/回答済み)
     - Category (if exists)
     - Question body
     - Timestamp
     - Related content link (if exists)

#### Test 3.2: Load More (if > 20 questions)
**Note:** You may need to create more questions first

1. **If "もっと見る" button appears:**
   - Click the button
2. **Verify:**
   - ✅ Button text changes to "読み込み中..."
   - ✅ Button is disabled during load
   - ✅ New questions append to the list (no page reload)
   - ✅ Button disappears if no more questions

#### Test 3.3: Create Questions to Test Pagination
1. Navigate to /question/new
2. Create 25+ questions with different content
3. Return to /question/history
4. **Verify:**
   - ✅ Initial load shows 20 questions
   - ✅ "もっと見る" button appears
   - ✅ Clicking loads remaining questions

## Test 4: API Endpoints

### Test 4.1: Search API
```bash
# Test basic search (page 1)
curl "http://localhost:3000/api/search?q=キャリア&page=1&limit=20"

# Test page 2
curl "http://localhost:3000/api/search?q=キャリア&page=2&limit=20"

# Test limit validation (should fail)
curl "http://localhost:3000/api/search?q=test&page=1&limit=200"

# Test missing query (should fail)
curl "http://localhost:3000/api/search?page=1&limit=20"
```

**Expected Response Format:**
```json
{
  "success": true,
  "results": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### Test 4.2: Question History API
```bash
# Test with authentication (replace with real token)
# Get token from browser cookies (auth_token)

# Initial load
curl -H "Cookie: auth_token=YOUR_TOKEN" \
  "http://localhost:3000/api/questions/me?limit=20"

# Load more (use nextCursor from previous response)
curl -H "Cookie: auth_token=YOUR_TOKEN" \
  "http://localhost:3000/api/questions/me?cursor=CURSOR_ID&limit=20"
```

**Expected Response Format:**
```json
{
  "success": true,
  "questions": [...],
  "pagination": {
    "nextCursor": "question-id" | null,
    "hasMore": true | false
  }
}
```

## Test 5: Backward Compatibility

### Test 5.1: Home Page (Unchanged)
1. Navigate to http://localhost:3000/home
2. **Verify:**
   - ✅ Still shows exactly 5 latest contents
   - ✅ No pagination controls
   - ✅ Cards display correctly

### Test 5.2: Content Detail (Unchanged)
1. Click any content card
2. **Verify:**
   - ✅ Detail page loads
   - ✅ All fields display correctly
   - ✅ "このコンテンツについて質問する" button works

### Test 5.3: Question Submission (Unchanged)
1. Navigate to /question/new
2. Submit a question
3. **Verify:**
   - ✅ Redirects to /question/history
   - ✅ New question appears at top

## Test 6: Performance Check

### Browser DevTools Network Tab

1. Open DevTools → Network tab
2. Clear network log
3. Perform search

**Check Response Times:**
- ✅ `/api/search` < 300ms (target)
- ✅ Page renders < 500ms total

4. Navigate to question history

**Check Response Times:**
- ✅ `/api/questions/me` < 200ms (target)
- ✅ "Load More" < 200ms (target)

### Console Logs

1. Open DevTools → Console
2. **Verify:**
   - ✅ No JavaScript errors
   - ✅ No React warnings
   - ✅ No network errors

## Test 7: Database Query Verification (Optional)

```bash
# Open Prisma Studio
npx prisma studio

# In browser (http://localhost:5555):
# 1. Open "Content" table
# 2. Check indexes exist (look for index icons)
# 3. Open "Question" table
# 4. Check indexes exist
```

## Test 8: Mobile Responsiveness

### On Mobile Device or DevTools Mobile View

1. Test search pagination
   - ✅ Pagination controls are usable
   - ✅ Buttons are properly sized

2. Test question history
   - ✅ "もっと見る" button is easily clickable
   - ✅ Questions display correctly

## Common Issues & Solutions

### Issue: "もっと見る" button doesn't appear

**Solution:**
- You need more than 20 questions in the database
- Create additional questions via /question/new
- Or adjust the limit in the API call for testing

### Issue: Pagination shows wrong page numbers

**Solution:**
- Check browser console for API response
- Verify `pagination.totalPages` calculation
- Clear browser cache and retry

### Issue: Search returns no results

**Solution:**
- Verify seed data was loaded: `npx prisma db seed`
- Check that contents have status="published"
- SQLite search is case-sensitive (use exact keyword from seed data)

### Issue: TypeScript errors in console

**Solution:**
- These are pre-existing and don't affect Phase 3
- Dev server still runs correctly with hot reload
- Production build will work

## Performance Benchmarks

After testing, record your results:

```
[ ] Home page load: _____ms
[ ] Search (first page): _____ms
[ ] Search (page 2): _____ms
[ ] Question history (initial): _____ms
[ ] Question history (load more): _____ms
[ ] Login: _____ms
```

**Target:**
- Home: < 200ms ✅
- Search: < 300ms ✅
- Questions: < 200ms ✅
- Login: < 100ms ✅

## Checklist Summary

- [ ] Database migration applied successfully
- [ ] 12 indexes created
- [ ] Search pagination works (prev/next)
- [ ] Question history "Load More" works
- [ ] API responses include pagination metadata
- [ ] Backward compatibility maintained
- [ ] No JavaScript errors in console
- [ ] Performance targets met
- [ ] Mobile responsive

## Next Steps After Testing

1. ✅ **If all tests pass:**
   - Phase 3 is complete
   - Ready for staging/production deployment
   - Proceed to Phase 4 planning

2. ❌ **If tests fail:**
   - Document the issue
   - Check PHASE3_IMPLEMENTATION.md for rollback plan
   - Review error messages in console
   - Check API responses in Network tab

## Production Deployment Checklist

Before deploying to production:

1. [ ] Switch to PostgreSQL in `prisma/schema.prisma`
2. [ ] Update DATABASE_URL environment variable
3. [ ] Run `npx prisma migrate deploy`
4. [ ] Verify indexes were created (Prisma Studio)
5. [ ] Test search with production data
6. [ ] Monitor performance metrics
7. [ ] Set up error tracking (Sentry)
8. [ ] Configure backup strategy

---

**Testing Time Estimate:** 20-30 minutes for complete testing

**Questions?** Check PHASE3_IMPLEMENTATION.md for technical details.
