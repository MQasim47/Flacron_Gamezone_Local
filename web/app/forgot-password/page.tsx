import dynamic from 'next/dynamic';

const ForgotPasswordClient = dynamic(
   () =>
      import('../../page-components/forgot-password/ui/ForgotPasswordClient').then(
         (m) => m.ForgotPasswordClient
      ),
   { ssr: false }
);

export default function ForgotPasswordPage() {
   return <ForgotPasswordClient />;
}
