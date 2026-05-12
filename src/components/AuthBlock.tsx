'use client';

import { Card, Text, Button, Stack, Group, Box } from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface AuthBlockProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthBlock({ children, title, description }: AuthBlockProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return null; // Or a skeleton loader
  }

  if (session) {
    return <>{children}</>;
  }

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Stack align="center" gap="md" py="xl">
        <Box 
          style={{ 
            backgroundColor: 'var(--mantine-color-default-hover)', 
            borderRadius: '50%', 
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ fontSize: '40px' }}>🔒</div>
        </Box>
        
        <Stack gap="xs" align="center">
          <Text size="lg" fw={800}>
            {title || 'Tämä sisältö vaatii kirjautumisen'}
          </Text>
          <Text size="sm" fw={500} ta="center" style={{ maxWidth: 400, opacity: 0.85 }}>
            {description || 'Kirjaudu sisään nähdäksesi mökin tarkemmat ohjeet ja tiedot.'}
          </Text>
        </Stack>

        <Group mt="md">
          <Button 
            onClick={() => router.push("/login")} 
            variant="filled" 
            color="forestGreen" 
            fw={700}
          >
            Kirjaudu sisään
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
