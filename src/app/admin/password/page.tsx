import ChangePasswordForm from "@/components/account/ChangePasswordForm";

// Access is enforced by the admin layout; the form posts to
// /api/account/password, which changes the signed-in user's own password.
export default function AdminPasswordPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h1>
      <p className="text-sm text-gray-500 mb-8">
        Use at least 12 characters, and don&apos;t reuse a password from another site.
      </p>
      <ChangePasswordForm />
    </div>
  );
}
