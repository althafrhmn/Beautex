# Email Verification Guide - Butex Salon System

## Problem: "Email not confirmed" Error

When you try to log in (especially as an employee), you might see an error saying your email is not confirmed.

---

## Solution 1: Disable Email Confirmation (Quick Fix for Development)

**Follow these steps in your Supabase Dashboard:**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your **Butex** project
3. Click **Authentication** in the left sidebar
4. Click **Providers**
5. Click on **Email** provider
6. Scroll down to find **"Confirm email"** toggle
7. **Turn it OFF** (disable it)
8. Click **Save**

✅ **Now you can log in without email verification!**

---

## Solution 2: Verify Your Email (Production-Ready)

If you want to keep email verification enabled (recommended for security):

1. **Register** a new account (Customer or Staff)
2. **Check your email inbox** (the email you used to register)
   - Also check your **Spam/Junk** folder
3. Look for an email from **Supabase** with subject like "Confirm your signup"
4. **Click the verification link** in the email
5. You'll be redirected to a confirmation page
6. **Now you can log in** successfully!

---

## For Staff Registration

When registering a new staff member:

1. Use the **Employee Login** tab → Click **"Register here"**
2. Fill in staff details
3. Enter the Admin Secret Key: **`BUTEX2025`**
4. Submit the form
5. **Verify the email** (check inbox)
6. Log in via **Employee** tab

---

## Troubleshooting

### "I didn't receive the verification email"

1. Check your **Spam/Junk** folder
2. Make sure you entered the correct email address
3. In Supabase Dashboard → **Authentication** → **Users**, you can manually verify a user:
   - Find the user in the list
   - Click the **"..."** menu
   - Select **"Confirm email"**

### "The verification link expired"

1. Try registering again with the same email
2. Or manually confirm the email in Supabase Dashboard (see above)

---

## Current System Status

✅ **Login Page**: Shows clear error messages for unconfirmed emails  
✅ **Register Page**: Reminds users to verify their email  
✅ **Staff Registration**: Includes email verification reminder  

---

## Need Help?

If you're still having issues:
1. Make sure you're using the correct email and password
2. Try the "Disable Email Confirmation" option for testing
3. Check Supabase Dashboard → Authentication → Users to see user status
