import dynamic from 'next/dynamic';

const ResetPasswordClient = dynamic(
   () =>
      import('../../page-components/reset-password/ui/ResetPasswordClient').then(
         (m) => m.ResetPasswordClient
      ),
   { ssr: false }
);

export default function ResetPasswordPage() {
   return <ResetPasswordClient />;
}
