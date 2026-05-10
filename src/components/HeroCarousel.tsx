'use client';

import { Carousel } from '@mantine/carousel';
import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Box, Overlay, Container, Stack } from '@mantine/core';
import '@mantine/carousel/styles.css';

interface HeroCarouselProps {
  images: readonly string[];
  height?: number | string;
  children?: React.ReactNode;
}

export function HeroCarousel({ images, height = 500, children }: HeroCarouselProps) {
  const autoplay = useRef(Autoplay({ delay: 5000 }));

  return (
    <Box style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden', position: 'relative' }}>
      <Carousel
        withIndicators
        height={height}
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        loop
        withControls={images.length > 1}
        styles={{
          indicator: {
            width: 12,
            height: 4,
            transition: 'width 250ms ease',
            '&[data-active]': {
              width: 40,
            },
          },
          controls: {
            zIndex: 4,
          },
          indicators: {
            zIndex: 4,
          }
        }}
      >
        {images.map((src, index) => (
          <Carousel.Slide key={index}>
            <Box
              style={{
                height: '100%',
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
            >
              <Overlay 
                color="#000" 
                opacity={0.4} 
                zIndex={1} 
              />
              <Overlay 
                gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .6) 100%)" 
                opacity={1} 
                zIndex={2} 
              />
            </Box>
          </Carousel.Slide>
        ))}
      </Carousel>

      {/* Fixed content over the sliding images */}
      {children && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3,
            pointerEvents: 'none', // Allow clicking controls underneath
          }}
        >
          <Container size="xl" h="100%">
            <Stack 
              justify="center" 
              h="100%" 
              style={{ 
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                color: '#fff',
                pointerEvents: 'auto', // Re-enable pointer events for text/buttons if needed
              }}
            >
              {children}
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
}
