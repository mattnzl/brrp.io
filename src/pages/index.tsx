import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/login');
  }, [router]);

  return (
    <>
      <Head>
        <title>BRRP.IO - Waste Tracking System</title>
        <meta name="description" content="BRRP.IO Waste Tracking and Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', margin: 0 }}>BRRP.IO</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>Redirecting to login...</p>
        </div>
      </div>
    </>
  );
}
