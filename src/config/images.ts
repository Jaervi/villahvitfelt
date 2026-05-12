export const imageConfig = {
  home: {
    hero: [
      '/images/cottage/topdown.jpeg',
      '/images/cottage/topimage.jpeg',
      '/images/cottage/bottomhouseimage.jpeg',
      'images/cottage/alamokkisisa.jpg',
      '/images/cottage/mokkikevat.jpg',
      '/images/cottage/ylamokkijuhannus.jpg',
      '/images/cottage/ylamokkipoyta.jpg',
      '/images/cottage/icysea.jpeg',
    ],
    footer: '/images/cottage/bottomhouseimage.jpeg',
  },
  sections: {
    arrival: '/images/cottage/ylamokkijuhannus.jpg',
    guides: '/images/cottage/topdown.jpeg',
    outdoors: '/images/cottage/topimage.jpeg',
  }
} as const;

export type ImageConfig = typeof imageConfig;
