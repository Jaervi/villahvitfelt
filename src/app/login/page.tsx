'use client';

import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Stack, Anchor, Tabs, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconLogin, IconMail, IconLock, IconWand } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('password');
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Virheellinen sähköposti'),
      password: (value) => (activeTab === 'password' && value.length < 6 ? 'Salasanan on oltava vähintään 6 merkkiä' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      if (activeTab === 'password') {
        const { error: loginError } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: '/',
        });

        if (loginError) {
          notifications.show({
            title: 'Kirjautuminen epäonnistui',
            message: loginError.message || 'Tarkista sähköposti ja salasana.',
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Tervetuloa takaisin!',
            message: 'Kirjautuminen onnistui.',
            color: 'green',
          });
          router.push('/');
          router.refresh();
        }
      } else {
        const { error: magicLinkError } = await authClient.signIn.magicLink({
          email: values.email,
          callbackURL: '/',
        });

        if (magicLinkError) {
          notifications.show({
            title: 'Linkin lähetys epäonnistui',
            message: magicLinkError.message || 'Yritä uudelleen myöhemmin.',
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Linkki lähetetty!',
            message: 'Tarkista sähköpostisi kirjautumislinkkiä varten.',
            color: 'blue',
          });
        }
      }
    } catch (error) {
      notifications.show({
        title: 'Virhe',
        message: 'Jotain meni vikaan. Yritä uudelleen myöhemmin.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={800}>Tervetuloa takaisin</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Eikö sinulla ole vielä tunnusta?{' '}
        <Link href="/signup" style={{ textDecoration: 'none' }}>
          <Anchor size="sm" fw={700} c="forestGreen">
            Luo tunnus
          </Anchor>
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Tabs value={activeTab} onChange={setActiveTab} color="forestGreen">
          <Tabs.List grow mb="xl">
            <Tabs.Tab value="password" leftSection={<IconLock size={16} />}>Salasana</Tabs.Tab>
            <Tabs.Tab value="magic-link" leftSection={<IconMail size={16} />}>Sähköpostilinkki</Tabs.Tab>
          </Tabs.List>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Sähköposti"
                placeholder="sinun@email.fi"
                required
                {...form.getInputProps('email')}
              />
              
              {activeTab === 'password' && (
                <PasswordInput
                  label="Salasana"
                  placeholder="Salasanasi"
                  required
                  {...form.getInputProps('password')}
                />
              )}

              <Button 
                fullWidth 
                mt="xl" 
                color="forestGreen" 
                type="submit" 
                loading={loading}
                leftSection={activeTab === 'password' ? <IconLogin size={18} /> : <IconWand size={18} />}
                fw={700}
              >
                {activeTab === 'password' ? 'Kirjaudu sisään' : 'Lähetä kirjautumislinkki'}
              </Button>
            </Stack>
          </form>
        </Tabs>
      </Paper>
    </Container>
  );
}
