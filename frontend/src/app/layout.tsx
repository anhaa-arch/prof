import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { ToastProvider } from '@/components/ToastContainer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'University Research & Credit Management',
  description: 'Эрдэм шинжилгээний бүртгэл, кредит тооцоолол',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className={inter.className}>
        <ToastProvider>
          <ApolloWrapper>{children}</ApolloWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}

