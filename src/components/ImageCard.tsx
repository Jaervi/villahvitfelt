'use client';

import { Card, Overlay, Text, Title, Stack, Button, Box } from '@mantine/core';
import Link from 'next/link';
import React from 'react';

interface ImageCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  buttonText: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function ImageCard({ title, description, image, href, buttonText, icon, badge }: ImageCardProps) {
  return (
    <Card 
      shadow="sm" 
      padding="xl" 
      radius="md" 
      withBorder 
      style={{ 
        height: '100%', 
        position: 'relative', 
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 280,
        color: '#fff'
      }}
    >
      <Overlay 
        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, .7) 100%)" 
        opacity={1} 
        zIndex={1} 
        radius="md" 
      />
      
      <Stack gap="md" h="100%" style={{ position: 'relative', zIndex: 2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {icon}
          {badge}
        </Box>
        
        <Title order={3} c="white">{title}</Title>
        <Text size="sm" fz="16px" fw={600} c="white" style={{ opacity: 0.9 }}>
          {description}
        </Text>
        
        <Button 
          component={Link}
          href={href}
          variant="white" 
          color="dark" 
          mt="auto" 
          fw={800}
        >
          {buttonText}
        </Button>
      </Stack>
    </Card>
  );
}
