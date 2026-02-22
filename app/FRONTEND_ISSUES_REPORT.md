# Frontend Blank Screen – Issues Report

## Summary
The app renders a blank screen due to several configuration and component issues.

---

## Critical Issues (Likely Cause of Blank Screen)

### 1. **Missing ThemeProvider – Toaster Crash**
**File:** `App.tsx`  
**Problem:** The `Toaster` component (`@/components/ui/sonner`) uses `useTheme()` from `next-themes`. There is no `ThemeProvider` wrapping the app, so `useTheme()` may throw or behave incorrectly when used outside the provider.

**Fix:** Wrap the app with `ThemeProvider` from `next-themes`.

---

### 2. **API Base URL Mismatch**
**File:** `src/lib/constants.ts`  
**Problem:** `API_BASE_URL` defaults to `http://localhost:8000/api`, but the backend runs on port **5000**.

**Fix:** Change default to `http://localhost:5000/api` or ensure `.env` has `VITE_API_BASE_URL=http://localhost:5000/api`.

---

## Medium Priority Issues

### 3. **Icon Component Rendering (Potential React Error)**
**Files:** `Home.tsx` (line 121), `Navbar.tsx` (lines 145, 157, 169)  
**Problem:** Using `<feature.icon />` and `<link.icon />` – in JSX, lowercase tag names can be treated as HTML elements. `link` is a valid HTML element, which can cause rendering issues.

**Fix:** Assign to uppercase variable before rendering:
```tsx
const Icon = feature.icon;
<Icon className="h-6 w-6 text-indigo-600" />
```

---

### 4. **Vite Base Path**
**File:** `vite.config.ts`  
**Problem:** `base: './'` uses relative paths. If the app is served from a subpath (e.g. `/app/`), assets and routing may break.

**Fix:** Set `base` to the correct deployment path (e.g. `/` for root, `/app/` for subpath).

---

## Low Priority / Notes

### 5. **kimi-plugin-inspect-react**
**File:** `vite.config.ts`  
**Problem:** Third-party plugin may affect runtime behavior. Consider temporarily removing it to rule out plugin-related issues.

### 6. **Supabase Env Variables**
**Problem:** Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, Supabase auth will not work. The app may still render, but auth features will fail.

### 7. **React Router Structure**
**File:** `App.tsx`  
**Note:** Nested `Routes` under `path="/*"` is valid. Ensure the inner `Route path="/"` correctly matches the home route.

---

## Recommended Fix Order
1. Add `ThemeProvider` (most likely to fix blank screen)
2. Fix API base URL
3. Fix icon rendering patterns
4. Verify `.env` has correct Supabase and API URLs
