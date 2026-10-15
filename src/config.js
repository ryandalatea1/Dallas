// Configurações do site. Preencha e tudo passa a funcionar sozinho.
export const siteConfig = {
  // Contato (só números, com DDI e DDD: '5511999999999')
  whatsapp: '',
  whatsappMessage: 'Olá! Quero iniciar um projeto com a Dallas Marketing.',
  email: '',
  instagram: '',

  // Arquivos de mídia. Coloque-os em public/media/ com estes nomes
  // (ou troque os caminhos aqui). Enquanto não existirem, o site usa a
  // floresta em WebGL sozinha, sem quebrar nada.
  media: {
    wolfDesktop: './media/wolf-intro.mp4', // 16:9, 10 a 12 s: floresta, lobo corre, para, respira
    wolfMobile: './media/wolf-intro-mobile.mp4', // 9:16, mesma sequência enquadrada na vertical
    wolfPoster: './media/wolf-poster.jpg', // primeiro frame (opcional)
    wolfStill: './media/wolf-still.jpg', // lobo parado na névoa, para a chamada final (opcional)
    ambience: './media/ambience.mp3', // vento e floresta, ativado só pelo visitante (opcional)
  },

  // Direção da abertura, em segundos do vídeo.
  timeline: {
    brandAt: 8.5, // quando o nome DALLAS MARKETING aparece
    breathLoop: { start: 9.2, end: 11.8 }, // trecho que repete: o lobo parado, respirando
  },
};
