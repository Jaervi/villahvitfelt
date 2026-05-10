'use client';

import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Stack, Anchor } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUserPlus } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateInvite, claimInvite } from '@/lib/actions/invites';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      inviteCode: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Nimi on liian lyhyt' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Virheellinen sähköposti'),
      password: (value) => (value.length < 6 ? 'Salasanan on oltava vähintään 6 merkkiä' : null),
      inviteCode: (value) => (value.length === 0 ? 'Kutsuavain vaaditaan' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      // 1. Validate Invite Code
      const inviteCheck = await validateInvite(values.inviteCode);
      if (!inviteCheck.valid) {
        notifications.show({
          title: 'Virheellinen kutsuavain',
          message: inviteCheck.error || "Tarkista koodi.",
          color: 'red',
        });
        setLoading(false);
        return;
      }

      // 2. Perform Signup
      const { error: signupError } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (signupError) {
        notifications.show({
          title: 'Rekisteröityminen epäonnistui',
          message: signupError.message || "Tarkista tiedot.",
          color: 'red',
        });
        setLoading(false);
        return;
      }

      // 3. Claim Invite upon success
      await claimInvite(values.inviteCode);

      notifications.show({
        title: 'Tili luotu!',
        message: 'Tervetuloa Villa Hvitfeltiin.',
        color: 'green',
      });

      router.push('/');
      router.refresh();
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
      <Title ta="center" fw={800}>Luo uusi tunnus</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Onko sinulla jo tunnus?{' '}
        <Anchor component={Link} href="/login" size="sm" fw={700} c="forestGreen">
          Kirjaudu sisään
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Nimi"
              placeholder="Oma nimesi"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Sähköposti"
              placeholder="sinun@email.fi"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Salasana"
              placeholder="Vähintään 6 merkkiä"
              required
              {...form.getInputProps('password')}
            />
            <TextInput
              label="Kutsuavain"
              placeholder="Syötä saamasi kutsuavain"
              required
              {...form.getInputProps('inviteCode')}
            />
            <Button 
              fullWidth 
              mt="xl" 
              color="forestGreen" 
              type="submit" 
              loading={loading}
              leftSection={<IconUserPlus size={18} />}
              fw={700}
            >
              Luo tunnus
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
