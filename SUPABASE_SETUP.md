# Supabase Configuration Guide

To make the Google Login work, you must enable it in your Supabase Dashboard. This cannot be done via code.

## 1. Enable Google Login
1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project ("Butex").
3.  On the left sidebar, click **Authentication** (icon looks like a users group).
4.  Click **Providers** under Configuration.
5.  Find **Google** and click it to expand.
6.  Toggle **Enable Sign in with Google** to **ON**.

## 2. Get Google Credentials (Required)
You need a "Client ID" and "Client Secret" from Google.
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Butex Salon").
3.  Go to **APIs & Services** > **OAuth consent screen**. Select "External" and fill in the required fields (App name: Butex, User support email: your email).
4.  Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
5.  Application type: **Web application**.
6.  **Authorized redirect URIs**:
    *   You must paste the "Callback URL" from your Supabase Google Provider page here.
    *   It looks like: `https://<your-project-id>.supabase.co/auth/v1/callback`
7.  Copy the **Client ID** and **Client Secret** and paste them into your Supabase Google Provider settings.
8.  Click **Save** in Supabase.

## 3. Enable Email Confirmation (Optional)
If you want to skip email verification for testing:
1.  Go to **Authentication** > **Providers** > **Email**.
2.  Uncheck **Confirm email**.
3.  Click **Save**.
