// Configurações do site. Preencha e tudo passa a funcionar sozinho.
export const siteConfig = {
  // Contato (só números, com DDI e DDD: '5511999999999')
  whatsapp: '',
  whatsappMessage: 'Olá! Quero iniciar um projeto com a Dallas Marketing.',
  email: '',
  instagram: '',

  // Mídia (public/media/). Os vídeos do lobo já estão incluídos.
  media: {
    wolfDesktop: './media/wolf-intro.mp4', // 16:9, 1080p, 5 s
    wolfMobile: './media/wolf-intro-mobile.mp4', // 9:16, 720x1280
    wolfDesktopWebm: './media/wolf-intro.webm', // mesmas cenas em VP9, para navegadores sem H.264
    wolfMobileWebm: './media/wolf-intro-mobile.webm',
    wolfPoster: './media/wolf-poster.jpg',
    wolfPosterMobile: './media/wolf-poster-mobile.jpg',
    wolfStill: './media/wolf-still.jpg', // lobo encarando, usado na chamada final
    ambience: './media/ambience.mp3', // opcional: vento e trovão ao longe, só no clique
  },

  // Direção da abertura, em segundos do vídeo.
  timeline: {
    brandAt: 3.9, // o lobo para e encara: a marca aparece
    breathLoop: null, // o vídeo termina no olhar; depois a cena segue em "hold"
    // depois do fim do vídeo: a câmera avança devagar na cara dele e ele respira
    hold: {
      zoom: 1.26,
      duration: 11,
      face: { desktop: [0.59, 0.27], mobile: [0.63, 0.27] }, // centro do rosto (x, y em fração do vídeo)
      muzzle: { desktop: [0.612, 0.325], mobile: [0.69, 0.33] }, // ponta do focinho (de onde sai o vapor)
      facing: 1, // 1 = o lobo olha para a direita do quadro
      breathEvery: 3.4,
    },
    // raios: o primeiro cai junto com o raio do próprio vídeo; os outros, aleatórios
    storm: {
      firstStrikeAt: 4.05,
      origin: { desktop: [0.82, 0.3], mobile: [0.86, 0.3] },
      every: [6, 13],
    },
  },
};
