'use client';

import { Box, Overlay, Container, Stack } from '@mantine/core';
import React from 'react';

interface ParallaxBannerProps {
  src: string;
  height?: number | string;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export function ParallaxBanner({ 
  src, 
  height = 400, 
  overlayOpacity = 0.5, 
  children 
}: ParallaxBannerProps) {
  return (
    <Box
      style={{
        position: 'relative',
        height: height,
        backgroundImage: `url(${src})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
        // Removing fixed attachment as it can feel jarring on some devices
        // and doesn't "scroll with the page" in the way some expect.
      }}
    >
      {/* Multi-layered shading for maximum text clarity */}
      <Overlay 
        color="#000" 
        opacity={overlayOpacity} 
        zIndex={1} 
      />
      <Overlay 
        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .6) 100%)" 
        opacity={1} 
        zIndex={2} 
      />
      
      <Container size="xl" h="100%" style={{ position: 'relative', zIndex: 3 }}>
        <Stack 
          justify="center" 
          h="100%" 
          style={{ 
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            color: '#fff'
          }}
        >
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
