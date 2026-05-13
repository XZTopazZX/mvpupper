# Debug Notes - App Hanging on Loading Screen

## Root Cause Analysis

The app is hanging because of **multiple critical issues**:

### Issue 1: Expo Router Conditional Stack.Screen Pattern (MAIN CAUSE)
The `_layout.tsx` uses conditional rendering of `Stack.Screen` children based on state:
```tsx
{!user ? (
  <Stack.Screen name="login" />
) : !household ? (
  <Stack.Screen name="setup" />
) : (
  <Stack.Screen name="(tabs)" />
)}
```

This is **NOT how expo-router works**. In expo-router, ALL routes are file-based and always defined. You can't conditionally render Stack.Screen children like this. The correct approach is:
- Use `<Redirect>` component to redirect users
- Or use `Stack.Protected` (SDK 55+)
- Or use `useRootNavigationState` + `router.replace()`

### Issue 2: Conflicting Route Files
There's BOTH:
- `app/index.tsx` (a simple placeholder screen)
- `app/(tabs)/index.tsx` (the real home screen)

When the app loads, expo-router resolves `app/index.tsx` as the initial route. The conditional Stack.Screen rendering in _layout.tsx conflicts with this.

### Issue 3: The `explore.tsx` tab references `@/assets/images/react-logo.png` with require()
This is a leftover from the template. It might cause a crash if the bundler has issues.

### Issue 4: Icon mapping is incomplete
The `icon-symbol.tsx` MAPPING only has:
- 'house.fill' -> 'home'
- 'paperplane.fill' -> 'send'  
- 'chevron.left.forwardslash.chevron.right' -> 'code'
- 'chevron.right' -> 'chevron-right'

But the tabs use:
- 'list.bullet' (NOT MAPPED)
- 'calendar' (NOT MAPPED)
- 'gearshape.fill' (NOT MAPPED)

This will cause a crash/undefined icon render on Android.

## Solution

1. Remove conditional Stack.Screen rendering
2. Use `<Redirect>` from expo-router for auth flow
3. Remove `app/index.tsx` (let (tabs)/index.tsx be the home)
4. Fix icon mappings or use direct MaterialIcons
5. Remove `explore.tsx` tab (leftover template)
6. Remove `modal.tsx` (leftover template)
