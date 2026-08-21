# Account Creation Trace

This note documents the diagnostic phases added to the admin account creation flow.

## Request Path

1. `src/pages/admin/AddUserPage.jsx`
2. `src/services/api.js`
3. `server/routes/adminRoutes.js`
4. `server/middleware/auth.js`
5. `server/controllers/adminController.js`
6. Supabase tables in `supabase/schema.sql`

## Logged Phases

### Auth middleware

- `missing_bearer_or_config`
- `validating_token`
- `token_validation_failed`
- `token_valid`
- `profile_lookup_failed`
- `role_resolution_failed`
- `auth_success`

### Create user controller

- `config_missing`
- `request_received`
- `validation_failed`
- `checking_existing_profiles`
- `creating_auth_user`
- `auth_create_failed`
- `auth_create_succeeded`
- `upserting_profile`
- `profile_upsert_failed`
- `upserting_student_row`
- `student_upsert_failed`
- `upserting_teacher_row`
- `teacher_upsert_failed`
- `create_user_completed`
- `unhandled_error`

## How To Read It

- If the logs stop at auth middleware, the issue is token validation or profile resolution.
- If the logs reach `createUser`, the session is good and the issue is inside the user creation steps.
- If the logs stop after `auth_create_succeeded`, the auth user was created but the profile or role-specific insert failed.

## Stored Data

- Auth identity is stored in `auth.users`
- User profile data is stored in `public.profiles`
- Student membership is stored in `public.students`
- Teacher membership is stored in `public.teachers`
- Admin users do not have a separate admin table; they are stored as `public.profiles` rows with `role = 'admin'`
