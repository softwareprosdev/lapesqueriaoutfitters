import { Toaster } from 'react-hot-toast';

interface LoginLayoutProps {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
}
