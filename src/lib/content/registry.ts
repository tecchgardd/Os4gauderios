/*
  Registro de tudo que o painel consegue editar.
  Os valores "default" são exatamente o que está no site hoje:
  se nada for alterado no painel, o site fica idêntico ao original.

  Formatação dos textos (mostrada como dica no painel):
    *texto*   -> itálico dourado (vira <em>)
    nova linha -> quebra de linha (vira <br>)
*/

export type SectionId = 'inicio' | 'marca' | 'historia' | 'numeros' | 'brasao' | 'sobre' | 'clipes' | 'vanera' | 'agenda' | 'musicas' | 'estrada' | 'divulgacao' | 'redes' | 'contato';
export type Section = { id: SectionId; label: string; hint: string };
export type TextOptions = { multiline?: boolean; plain?: boolean; short?: boolean; list?: boolean };
export type TextDef = TextOptions & { section: SectionId; key: string; label: string; default: string };
export type MediaType = 'image' | 'video' | 'file';
export type MediaOptions = { usage?: string; group?: string; thumb?: string; meta?: string; metaFormat?: 'full' | 'size' | 'zip'; accept?: string };
export type MediaDef = MediaOptions & { section: SectionId; slot: string; label: string; type: MediaType; default: string };
export type LinkKey = 'instagram' | 'youtube' | 'facebook' | 'tiktok' | 'spotify' | 'youtubemusic' | 'deezer' | 'applemusic' | 'amazonmusic' | 'palcomp3';
export type LinkDef = { key: LinkKey; label: string; group: 'redes' | 'plataformas'; fallback: string };
export type Profile = {
  contact_name: string; whatsapp: string; phone: string; email: string; producer: string; city: string;
  instagram_handle: string; pastaClipes: string; agendaIlustrativa: boolean; links: Record<LinkKey, string>;
};
export type ShowStatus = '' | 'confirmado' | 'ultimos' | 'esgotado' | 'fechado';

export const SECTIONS: Section[] = [
  { id: 'inicio', label: 'Início', hint: 'Topo do site: vídeo de abertura e título' },
  { id: 'marca', label: 'Marca', hint: 'Brasão usado em todo o site' },
  { id: 'historia', label: 'História', hint: 'Texto que acende palavra por palavra' },
  { id: 'numeros', label: 'Números', hint: 'Faixa com os quatro números' },
  { id: 'brasao', label: 'Brasão 3D', hint: 'Palavras em volta do brasão' },
  { id: 'sobre', label: 'Formação', hint: 'Fotos do grupo que trocam na rolagem' },
  { id: 'clipes', label: 'Clipes', hint: 'Tela de clipes e prévias com som' },
  { id: 'vanera', label: 'Vanera', hint: 'Texto vazado com vídeo' },
  { id: 'agenda', label: 'Agenda', hint: 'Textos da seção de agenda' },
  { id: 'musicas', label: 'Músicas', hint: 'Repertório e faixas rolantes' },
  { id: 'estrada', label: 'Estrada', hint: 'Ônibus, caminhão e van' },
  { id: 'divulgacao', label: 'Divulgação', hint: 'Kit para download: artes, fotos e clipes' },
  { id: 'redes', label: 'Redes sociais', hint: 'Cards das redes' },
  { id: 'contato', label: 'Contato', hint: 'Chamada final de contratação' }
];

/* ---------------- TEXTOS ---------------- */
const T = (section: SectionId, key: string, label: string, def: string, opts: TextOptions = {}): TextDef => ({ section, key, label, default: def, ...opts });

export const CLIPS = [
  { n: 1, file: 'andejo', title: 'Andejo', desc: 'Galpão de madeira, luz âmbar e a banda inteira em cena. Um clipe que tem cheiro de baile.' },
  { n: 2, file: 'doma', title: 'Doma de um Amor Perfeito', desc: 'Uma história de amor contada entre cavalos, cordeonas e um salão lotado. Cinema gaúcho de ponta a ponta.' },
  { n: 3, file: 'beijo', title: 'Um Beijo Embaixo do Chapéu', desc: 'Do acampamento do rodeio até o palco iluminado. O clipe que mostra o show como ele é.' },
  { n: 4, file: 'vanera', title: 'Vanera Varre Galpão', desc: 'Bota no assoalho, poeira subindo e a vaneira no talo. O nome já diz tudo.' }
] as const;

export const TEXTS: TextDef[] = [
  T('inicio', 'seo_title', 'Título da aba do navegador (Google)', 'Os 4 Gaudérios | Onde tem tradição, tem baile'),
  T('inicio', 'seo_description', 'Descrição para o Google', 'Os 4 Gaudérios — desde 1997 levando o fandango gaúcho de galpão em galpão. Clipes, músicas, estrutura de turnê e contratação de shows.', { multiline: true }),
  T('inicio', 'hero_eyebrow', 'Linha acima do título', 'Fandango gaúcho · Erechim · RS'),
  T('inicio', 'hero_sub', 'Frase abaixo do título', 'Onde tem *tradição*, tem baile.'),
  T('inicio', 'hero_after_eyebrow', 'Linha que aparece quando o vídeo encolhe', 'Desde 17 de agosto de 1997'),
  T('inicio', 'hero_after_title', 'Frase que aparece quando o vídeo encolhe', 'Vinte e nove anos fazendo *o salão tremer.*'),

  T('historia', 'manifesto', 'Texto da história', 'Foi em 1997 que a cordeona abriu o primeiro fole. Desde então, Os 4 Gaudérios atravessam o Sul de galpão em galpão, de rodeio em rodeio, levando a vaneira para quem não deixa a pista esfriar. É música feita de estrada, de lenço no pescoço e de gente que dança até o último acorde.', { multiline: true, plain: true }),

  T('numeros', 'stat_1_value', 'Número 1', '1997', { short: true }),
  T('numeros', 'stat_1_label', 'Legenda 1', 'Ano de fundação'),
  T('numeros', 'stat_2_value', 'Número 2', '29', { short: true }),
  T('numeros', 'stat_2_label', 'Legenda 2', 'Anos de estrada'),
  T('numeros', 'stat_3_value', 'Número 3', '4', { short: true }),
  T('numeros', 'stat_3_label', 'Legenda 3', 'Clipes oficiais em 4K'),
  T('numeros', 'stat_4_value', 'Número 4', 'RS', { short: true }),
  T('numeros', 'stat_4_label', 'Legenda 4', 'Erechim, Alto Uruguai'),

  T('brasao', 'crest_1', 'Palavra 1', 'Quatro cavaleiros'),
  T('brasao', 'crest_2', 'Palavra 2', 'Um pôr do sol'),
  T('brasao', 'crest_3', 'Palavra 3', 'Ouro de tradição'),
  T('brasao', 'crest_4', 'Palavra 4', 'Uma só tropa'),
  T('brasao', 'crest_caption', 'Legenda embaixo do brasão', 'O brasão que vai estampado\nno ônibus, no caminhão e no peito.', { multiline: true }),

  T('sobre', 'lineup_cap_1', 'Título da foto 1', '*De poncho* e chapéu.'),
  T('sobre', 'lineup_cap_2', 'Título da foto 2', '*Cordeona* no peito.'),
  T('sobre', 'lineup_cap_3', 'Título da foto 3', '*A tropa* reunida.'),
  T('sobre', 'lineup_text', 'Texto da formação', 'Cordeonas, violão, baixo, bateria e voz. Uma formação que sobe no palco pronta pra segurar o baile do primeiro ao último fandangueiro.', { multiline: true }),

  T('clipes', 'clips_title', 'Título da seção', 'Cinema\n*de galpão.*', { multiline: true }),
  T('clipes', 'clips_lead', 'Texto da seção', 'Quatro produções em 4K, gravadas onde o fandango acontece de verdade.', { multiline: true }),
  ...CLIPS.flatMap(c => [
    T('clipes', `clip_${c.n}_title`, `Clipe ${c.n} · nome`, c.title, { plain: true }),
    T('clipes', `clip_${c.n}_desc`, `Clipe ${c.n} · descrição`, c.desc, { multiline: true })
  ]),

  T('vanera', 'vanera_word', 'Palavra vazada', 'VANERA', { short: true, plain: true }),
  T('vanera', 'vanera_title', 'Frase final', 'A pista\n*não para.*', { multiline: true }),

  T('agenda', 'agenda_title', 'Título da seção', 'Próximos\n*bailes.*', { multiline: true }),
  T('agenda', 'agenda_lead', 'Texto da seção', 'Onde a cordeona vai abrir o fole nas próximas semanas. Confira a data mais perto de você e chegue cedo.', { multiline: true }),
  T('agenda', 'agenda_empty_title', 'Aviso sem datas · título', 'Novas datas em breve.'),
  T('agenda', 'agenda_empty_text', 'Aviso sem datas · texto', 'A agenda está sendo atualizada. Acompanhe as divulgações no Instagram ou consulte uma data para o seu evento.', { multiline: true }),

  T('musicas', 'music_title', 'Título da seção', 'O som que\n*acende o salão.*', { multiline: true }),
  T('musicas', 'music_lead', 'Texto da seção', 'Vaneira, vanerão, bugio e xote. Dá o play na playlist oficial e já vai se preparando pro baile.', { multiline: true }),
  T('musicas', 'music_marquee', 'Músicas da faixa rolante (uma por linha)', 'Trancão de Livramento\nFibra Galponeira\nLouco de Bem de Bem\nNa Muvuca da Neguinha\nEu Cutuco e Tu Cutuca', { multiline: true, plain: true, list: true }),

  T('estrada', 'road_title', 'Título da seção', 'Estrutura\nprópria\n*de turnê.*', { multiline: true }),
  T('estrada', 'road_lead', 'Texto da seção', 'Ônibus, caminhão e van com a marca da casa. Do Alto Uruguai para onde o baile chamar.', { multiline: true }),
  T('estrada', 'road_1_title', 'Veículo 1 · nome', 'O ônibus'),
  T('estrada', 'road_1_desc', 'Veículo 1 · descrição', 'leva a banda com conforto de cidade em cidade.'),
  T('estrada', 'road_2_title', 'Veículo 2 · nome', 'O caminhão'),
  T('estrada', 'road_2_desc', 'Veículo 2 · descrição', 'carrega som, luz e palco para cada show.'),
  T('estrada', 'road_3_title', 'Veículo 3 · nome', 'A van'),
  T('estrada', 'road_3_desc', 'Veículo 3 · descrição', 'vai na frente, abrindo caminho para a produção.'),

  T('divulgacao', 'press_title', 'Título da seção', 'Artes & fotos\n*para divulgar.*', { multiline: true }),
  T('divulgacao', 'press_lead', 'Texto da seção', 'Material oficial em alta resolução para contratantes, CTGs, imprensa e parceiros anunciarem o baile.', { multiline: true }),
  T('divulgacao', 'release', 'Release (texto para copiar)', 'Os 4 Gaudérios iniciaram sua trajetória em 17 de agosto de 1997, em Erechim, no Alto Uruguai gaúcho. Com repertório marcado pela vaneira e pelos ritmos regionais, o grupo leva o fandango a bailes, rodeios e festas por todo o Sul, com estrutura própria de turnê e clipes oficiais como “Andejo”, “Doma de um Amor Perfeito”, “Um Beijo Embaixo do Chapéu” e “Vanera Varre Galpão”. Contratações: (54) 99917-0670 · altouruguaieventos@gmail.com.', { multiline: true, plain: true }),

  T('redes', 'social_title', 'Título da seção', 'Siga\n*a tropa.*', { multiline: true }),
  T('redes', 'social_instagram', 'Card Instagram', 'Agenda, bastidores e as artes de cada baile.'),
  T('redes', 'social_youtube', 'Card YouTube', 'Clipes oficiais em 4K e shows ao vivo.'),
  T('redes', 'social_facebook', 'Card Facebook', 'Novidades, eventos e a comunidade fandangueira.'),
  T('redes', 'social_tiktok', 'Card TikTok', 'Os melhores momentos do baile em vídeos curtos.'),
  T('redes', 'social_whatsapp', 'Card WhatsApp', 'Fale direto com a produção para contratar.'),

  T('contato', 'contact_title', 'Título da seção', 'O próximo fandango\n*pode ser na sua cidade.*', { multiline: true }),
  T('contato', 'contact_lead', 'Texto da seção', 'Bailes, rodeios, festas e eventos. Fale com a produção para consultar datas e condições.', { multiline: true })
];

/* ---------------- MÍDIAS ---------------- */
// type: image | video | file   ·   meta: como o tamanho aparece no kit de divulgação
const M = (section: SectionId, slot: string, label: string, type: MediaType, def: string, opts: MediaOptions = {}): MediaDef => ({ section, slot, label, type, default: def, ...opts });

export const MEDIA: MediaDef[] = [
  M('inicio', 'hero_video', 'Vídeo de abertura (fundo do topo)', 'video', 'assets/web/video/hero.mp4', { usage: 'Topo do site, em tela cheia, sem som' }),
  M('inicio', 'hero_poster', 'Capa do vídeo de abertura', 'image', 'assets/web/video/hero.jpg', { usage: 'Aparece enquanto o vídeo carrega e no menu' }),

  M('marca', 'logo', 'Brasão grande', 'image', 'assets/web/img/brasao.webp', { usage: 'Abertura, brasão 3D, contato, menu e kit' }),
  M('marca', 'logo_sm', 'Brasão pequeno', 'image', 'assets/web/img/brasao-sm.webp', { usage: 'Medalhão da nav, agenda e mini player' }),

  M('sobre', 'foto_formacao_1', 'Foto da formação 1', 'image', 'assets/web/img/grupo-poncho.webp', { usage: 'Formação, menu e miniatura do kit' }),
  M('sobre', 'foto_formacao_2', 'Foto da formação 2', 'image', 'assets/web/img/grupo-instrumentos.webp', { usage: 'Formação, menu e miniatura do kit' }),
  M('sobre', 'foto_formacao_3', 'Foto da formação 3', 'image', 'assets/web/img/grupo-sentados.webp', { usage: 'Formação, menu e miniatura do kit' }),

  ...CLIPS.flatMap(c => [
    M('clipes', `clip_${c.n}_video`, `${c.title} · vídeo em loop`, 'video', `assets/web/video/${c.file}.mp4`, { usage: 'Tela de clipes e card do kit (sem som)' }),
    M('clipes', `clip_${c.n}_poster`, `${c.title} · capa`, 'image', `assets/web/video/${c.file}.jpg`, { usage: 'Capa enquanto o vídeo carrega' }),
    M('clipes', `clip_${c.n}_preview`, `${c.title} · trecho com som`, 'video', `assets/web/video/${c.file}-preview.mp4`, { usage: 'Botão “Assistir trecho com som”' })
  ]),

  M('vanera', 'vanera_video', 'Vídeo dentro das letras', 'video', 'assets/web/video/pes.mp4', { usage: 'Seção VANERA' }),
  M('vanera', 'vanera_poster', 'Capa do vídeo', 'image', 'assets/web/video/pes.jpg'),

  M('estrada', 'onibus', 'Ônibus', 'image', 'assets/web/img/onibus.webp', { usage: 'Estrada, menu e miniatura do kit' }),
  M('estrada', 'caminhao', 'Caminhão', 'image', 'assets/web/img/caminhao.webp', { usage: 'Estrada e miniatura do kit' }),
  M('estrada', 'van', 'Van', 'image', 'assets/web/img/van.webp', { usage: 'Estrada, menu e miniatura do kit' }),

  M('divulgacao', 'press_story', 'Arte · Story Instagram', 'image', 'assets/press/os4gauderios-story-instagram.jpg', { group: 'Artes', thumb: 'assets/web/img/press-story.webp', meta: 'JPG · 1080×1920 · 0,3 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_post', 'Arte · Post Instagram', 'image', 'assets/press/os4gauderios-post-instagram.jpg', { group: 'Artes', thumb: 'assets/web/img/press-post.webp', meta: 'JPG · 1080×1350 · 0,2 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_brasao_png', 'Logo · Brasão sem fundo', 'image', 'assets/press/os4gauderios-brasao-sem-fundo.png', { group: 'Logos', meta: 'PNG · 1295×1215 · 1,8 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_brasao_preto', 'Logo · Brasão fundo preto', 'image', 'assets/press/os4gauderios-brasao-fundo-preto.jpg', { group: 'Logos', thumb: 'assets/web/img/press-brasao-preto.webp', meta: 'JPG · 2000×2000 · 0,4 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_foto_instrumentos', 'Foto · Grupo com instrumentos', 'image', 'assets/press/os4gauderios-foto-instrumentos.png', { group: 'Fotos', meta: 'PNG sem fundo · 1416×1111 · 2,3 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_foto_grupo', 'Foto · Grupo reunido', 'image', 'assets/press/os4gauderios-foto-grupo.png', { group: 'Fotos', meta: 'PNG sem fundo · 1573×1000 · 2,2 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_foto_poncho', 'Foto · De poncho e chapéu', 'image', 'assets/press/os4gauderios-foto-poncho.png', { group: 'Fotos', meta: 'PNG sem fundo · 1640×959 · 2,1 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_onibus', 'Frota · Ônibus', 'image', 'assets/press/os4gauderios-onibus.png', { group: 'Frota', meta: 'PNG sem fundo · 1689×931 · 1,9 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_caminhao', 'Frota · Caminhão', 'image', 'assets/press/os4gauderios-caminhao.png', { group: 'Frota', meta: 'PNG sem fundo · 1774×887 · 2,1 MB', metaFormat: 'full' }),
  M('divulgacao', 'press_van', 'Frota · Van', 'image', 'assets/press/os4gauderios-van.png', { group: 'Frota', meta: 'PNG sem fundo · 1526×1030 · 2,1 MB', metaFormat: 'full' }),
  ...CLIPS.flatMap(c => {
    const sizes = ({ 1: ['10,6 MB', '7,8 MB'], 2: ['9,5 MB', '5,4 MB'], 3: ['9,0 MB', '7,3 MB'], 4: ['9,6 MB', '7,3 MB'] } as Record<number, string[]>)[c.n];
    const base = `assets/press/clipes/os4gauderios-${c.file}`;
    return [
      M('divulgacao', `press_clip_${c.n}_vertical`, `${c.title} · vertical 15s (Reels/Stories)`, 'video', `${base}-vertical-15s.mp4`, { group: 'Clipes', meta: sizes[0], metaFormat: 'size' }),
      M('divulgacao', `press_clip_${c.n}_trecho`, `${c.title} · trecho 30s com som`, 'video', `${base}-trecho-30s.mp4`, { group: 'Clipes', meta: sizes[1], metaFormat: 'size' }),
      M('divulgacao', `press_clip_${c.n}_foto1`, `${c.title} · foto 4K 1`, 'image', `${base}-foto-1.jpg`, { group: 'Clipes' }),
      M('divulgacao', `press_clip_${c.n}_foto2`, `${c.title} · foto 4K 2`, 'image', `${base}-foto-2.jpg`, { group: 'Clipes' })
    ];
  }),
  M('divulgacao', 'kit_zip', 'Kit completo (ZIP)', 'file', 'assets/os4gauderios-kit-divulgacao.zip', { group: 'Pacotes', meta: 'ZIP 14,8 MB', metaFormat: 'zip', accept: '.zip' }),
  M('divulgacao', 'clipes_zip', 'Pacote dos clipes (ZIP)', 'file', 'assets/os4gauderios-clipes-divulgacao.zip', { group: 'Pacotes', meta: 'ZIP 69,6 MB', metaFormat: 'zip', accept: '.zip' })
];

/* ---------------- PERFIL DA EMPRESA ---------------- */
export const LINKS: LinkDef[] = [
  { key: 'instagram', label: 'Instagram', group: 'redes', fallback: 'https://www.instagram.com/os4gauderios/' },
  { key: 'youtube', label: 'YouTube', group: 'redes', fallback: 'https://www.youtube.com/channel/UCXpdSMd86H9QW_qrxTTjTLw' },
  { key: 'facebook', label: 'Facebook', group: 'redes', fallback: 'https://www.facebook.com/search/top?q=Os%204%20Gaud%C3%A9rios' },
  { key: 'tiktok', label: 'TikTok', group: 'redes', fallback: 'https://www.tiktok.com/search?q=os4gauderios' },
  { key: 'spotify', label: 'Spotify', group: 'plataformas', fallback: 'https://open.spotify.com/playlist/2GgI7gHwBuifjeRIqPCsfA' },
  { key: 'youtubemusic', label: 'YouTube Music', group: 'plataformas', fallback: 'https://music.youtube.com/search?q=Os%204%20Gaud%C3%A9rios' },
  { key: 'deezer', label: 'Deezer', group: 'plataformas', fallback: 'https://www.deezer.com/search/Os%204%20Gaud%C3%A9rios' },
  { key: 'applemusic', label: 'Apple Music', group: 'plataformas', fallback: 'https://music.apple.com/br/search?term=Os%204%20Gaud%C3%A9rios' },
  { key: 'amazonmusic', label: 'Amazon Music', group: 'plataformas', fallback: 'https://music.amazon.com.br/search/Os%204%20Gaud%C3%A9rios' },
  { key: 'palcomp3', label: 'Palco MP3', group: 'plataformas', fallback: 'https://www.palcomp3.com.br/os4gauderiosoficial/' }
];

export const PROFILE_DEFAULTS: Profile = {
  contact_name: 'Gilberto Lima',
  whatsapp: '5554999170670',
  phone: '(54) 99917-0670',
  email: 'altouruguaieventos@gmail.com',
  producer: 'Alto Uruguai Eventos',
  city: 'Erechim–RS',
  instagram_handle: '@os4gauderios',
  pastaClipes: '',
  agendaIlustrativa: true,
  links: {
    instagram: 'https://www.instagram.com/os4gauderios/',
    youtube: 'https://www.youtube.com/channel/UCXpdSMd86H9QW_qrxTTjTLw',
    facebook: '', tiktok: '',
    spotify: 'https://open.spotify.com/playlist/2GgI7gHwBuifjeRIqPCsfA',
    youtubemusic: '', deezer: '', applemusic: '', amazonmusic: '',
    palcomp3: 'https://www.palcomp3.com.br/os4gauderiosoficial/'
  }
};

export const AGENDA_STATUS: { id: ShowStatus; label: string }[] = [
  { id: '', label: 'Sem status' },
  { id: 'confirmado', label: 'Confirmado' },
  { id: 'ultimos', label: 'Últimos ingressos' },
  { id: 'esgotado', label: 'Esgotado' },
  { id: 'fechado', label: 'Evento fechado' }
];

