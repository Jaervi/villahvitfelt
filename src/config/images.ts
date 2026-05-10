export const imageConfig = {
  home: {
    hero: [
      '/images/cottage/topdown.jpeg',
      '/images/cottage/topimage.jpeg',
      '/images/cottage/bottomhouseimage.jpeg',
      '/images/cottage/mokkikevat.jpg',
      '/images/cottage/ylamokkijuhannus.jpg',
    ],
    footer: '/images/cottage/bottomhouseimage.jpeg',
  },
  sections: {
    arrival: '/images/cottage/topimage.jpeg',
    guides: '/images/cottage/bottomhouseimage.jpeg',
    outdoors: '/images/cottage/topimage.jpeg',
  }
} as const;

export type ImageConfig = typeof imageConfig;
