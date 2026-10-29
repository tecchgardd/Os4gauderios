/*
  Gera src/lib/content/template.html a partir do HTML original (legacy/index-static.html).
  Cada texto, mídia e contato editável vira um marcador {{...}} que o
  servidor preenche com o que estiver salvo no painel.

  Uso: npm run template
*/
import fs from 'fs';
import path from 'path';
import { CLIPS, MEDIA } from '../src/lib/content/registry';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'src', 'lib', 'content', 'template.html');
const src = fs.readFileSync(path.join(ROOT, 'legacy', 'index-static.html'), 'utf8');

let html = src.slice(src.indexOf('<body class="is-loading">') + '<body class="is-loading">'.length, src.indexOf('<script src="https://cdnjs'));
const errors: string[] = [];

// troca exata, conferindo quantas vezes o trecho aparece
const swap = (find: string, repl: string, count: number | 'all' = 1) => {
  const n = html.split(find).length - 1;
  if (n !== count && !(count === 'all' && n > 0)) errors.push(`esperava ${count}x, achei ${n}x: ${find.slice(0, 90)}`);
  html = html.split(find).join(repl);
};

/* ---------- textos ---------- */
swap('<span class="dot"></span> Fandango gaúcho · Erechim · RS</p>', '<span class="dot"></span> {{t:hero_eyebrow}}</p>');
swap('<p class="hero-sub">Onde tem <em>tradição</em>, tem baile.</p>', '<p class="hero-sub">{{t:hero_sub}}</p>');
swap('<p class="eyebrow">Desde 17 de agosto de 1997</p>', '<p class="eyebrow">{{t:hero_after_eyebrow}}</p>');
swap('<p class="hero-after-title">Vinte e nove anos fazendo <em>o salão tremer.</em></p>', '<p class="hero-after-title">{{t:hero_after_title}}</p>');
swap(/<p class="manifesto-text" data-reveal-words>[\s\S]*?<\/p>/.exec(html)![0], '<p class="manifesto-text" data-reveal-words>{{t:manifesto}}</p>');
swap(/<div class="wrap stats-grid">[\s\S]*?<\/div>\n  <\/div>/.exec(html)![0], '<div class="wrap stats-grid">{{block:stats}}</div>');
swap('<span>01</span>Quatro cavaleiros</li>', '<span>01</span>{{t:crest_1}}</li>');
swap('<span>02</span>Um pôr do sol</li>', '<span>02</span>{{t:crest_2}}</li>');
swap('<span>03</span>Ouro de tradição</li>', '<span>03</span>{{t:crest_3}}</li>');
swap('<span>04</span>Uma só tropa</li>', '<span>04</span>{{t:crest_4}}</li>');
swap('<p class="crest-caption">O brasão que vai estampado<br>no ônibus, no caminhão e no peito.</p>', '<p class="crest-caption">{{t:crest_caption}}</p>');
swap('<h2 class="lineup-cap is-active"><em>De poncho</em> e chapéu.</h2>', '<h2 class="lineup-cap is-active">{{t:lineup_cap_1}}</h2>');
swap('<h2 class="lineup-cap"><em>Cordeona</em> no peito.</h2>', '<h2 class="lineup-cap">{{t:lineup_cap_2}}</h2>');
swap('<h2 class="lineup-cap"><em>A tropa</em> reunida.</h2>', '<h2 class="lineup-cap">{{t:lineup_cap_3}}</h2>');
swap('<p class="lineup-text">Cordeonas, violão, baixo, bateria e voz. Uma formação que sobe no palco pronta pra segurar o baile do primeiro ao último fandangueiro.</p>', '<p class="lineup-text">{{t:lineup_text}}</p>');
swap('<h2 class="display">Cinema<br><em>de galpão.</em></h2>', '<h2 class="display">{{t:clips_title}}</h2>');
swap('<p class="lead">Quatro produções em 4K, gravadas onde o fandango acontece de verdade.</p>', '<p class="lead">{{t:clips_lead}}</p>');
for (const c of CLIPS) {
  swap(`<h3>${c.title}</h3>`, `<h3>{{t:clip_${c.n}_title}}</h3>`);
  swap(`<p>${c.desc}</p>`, `<p>{{t:clip_${c.n}_desc}}</p>`);
  swap(`data-title="${c.title}"`, `data-title="{{ta:clip_${c.n}_title}}"`);
  swap(`<strong>${c.title}</strong>`, `<strong>{{t:clip_${c.n}_title}}</strong>`);
}
swap('<div class="knockout-mask" id="knockoutMask"><span>VANERA</span></div>', '<div class="knockout-mask" id="knockoutMask"><span>{{t:vanera_word}}</span></div>');
swap('<p class="knockout-title">A pista<br><em>não para.</em></p>', '<p class="knockout-title">{{t:vanera_title}}</p>');
swap('<h2 class="display">Próximos<br><em>bailes.</em></h2>', '<h2 class="display">{{t:agenda_title}}</h2>');
swap('<p class="lead">Onde a cordeona vai abrir o fole nas próximas semanas. Confira a data mais perto de você e chegue cedo.</p>', '<p class="lead">{{t:agenda_lead}}</p>');
swap('<h3>Novas datas em breve.</h3>', '<h3>{{t:agenda_empty_title}}</h3>');
swap('<p>A agenda está sendo atualizada. Acompanhe as divulgações no Instagram ou consulte uma data para o seu evento.</p>', '<p>{{t:agenda_empty_text}}</p>');
swap(/<div class="marquee" aria-hidden="true">\s*<div class="marquee-track">[\s\S]*?<\/div>/.exec(html)![0], '<div class="marquee" aria-hidden="true">\n    <div class="marquee-track">{{block:marquee1}}</div>');
swap(/<div class="marquee marquee--reverse" aria-hidden="true">\s*<div class="marquee-track">[\s\S]*?<\/div>/.exec(html)![0], '<div class="marquee marquee--reverse" aria-hidden="true">\n    <div class="marquee-track">{{block:marquee2}}</div>');
swap('<h2 class="display">O som que<br><em>acende o salão.</em></h2>', '<h2 class="display">{{t:music_title}}</h2>');
swap('<p class="lead">Vaneira, vanerão, bugio e xote. Dá o play na playlist oficial e já vai se preparando pro baile.</p>', '<p class="lead">{{t:music_lead}}</p>');
swap('src="https://open.spotify.com/embed/playlist/2GgI7gHwBuifjeRIqPCsfA?utm_source=generator&amp;theme=0"', 'src="{{spotify_embed}}"');
swap('<h2 class="display">Estrutura<br>própria<br><em>de turnê.</em></h2>', '<h2 class="display">{{t:road_title}}</h2>');
swap('<p class="lead">Ônibus, caminhão e van com a marca da casa. Do Alto Uruguai para onde o baile chamar.</p>', '<p class="lead">{{t:road_lead}}</p>');
swap('<b>01</b> O ônibus <span>leva a banda com conforto de cidade em cidade.</span>', '<b>01</b> {{t:road_1_title}} <span>{{t:road_1_desc}}</span>');
swap('<b>02</b> O caminhão <span>carrega som, luz e palco para cada show.</span>', '<b>02</b> {{t:road_2_title}} <span>{{t:road_2_desc}}</span>');
swap('<b>03</b> A van <span>vai na frente, abrindo caminho para a produção.</span>', '<b>03</b> {{t:road_3_title}} <span>{{t:road_3_desc}}</span>');
swap('<h2 class="display">Artes & fotos<br><em>para divulgar.</em></h2>', '<h2 class="display">{{t:press_title}}</h2>');
swap('<p class="lead">Material oficial em alta resolução para contratantes, CTGs, imprensa e parceiros anunciarem o baile.</p>', '<p class="lead">{{t:press_lead}}</p>');
swap(/<p id="releaseText">[\s\S]*?<\/p>/.exec(html)![0], '<p id="releaseText">{{t:release}}</p>');
swap('<h2 class="display">Siga<br><em>a tropa.</em></h2>', '<h2 class="display">{{t:social_title}}</h2>');
swap('<span>Agenda, bastidores e as artes de cada baile.</span>', '<span>{{t:social_instagram}}</span>');
swap('<span>Clipes oficiais em 4K e shows ao vivo.</span>', '<span>{{t:social_youtube}}</span>');
swap('<span>Novidades, eventos e a comunidade fandangueira.</span>', '<span>{{t:social_facebook}}</span>');
swap('<span>Os melhores momentos do baile em vídeos curtos.</span>', '<span>{{t:social_tiktok}}</span>');
swap('<span>Fale direto com a produção para contratar.</span>', '<span>{{t:social_whatsapp}}</span>');
swap('<h2 class="display contact-title">O próximo fandango<br><em>pode ser na sua cidade.</em></h2>', '<h2 class="display contact-title">{{t:contact_title}}</h2>');
swap('<p class="lead">Bailes, rodeios, festas e eventos. Fale com a produção para consultar datas e condições.</p>', '<p class="lead">{{t:contact_lead}}</p>');

/* ---------- tamanhos no kit de divulgação ---------- */
for (const m of MEDIA.filter(m => m.meta)) {
  if (m.metaFormat === 'zip') swap(m.meta!, `{{mm:${m.slot}}}`);
  else if (m.metaFormat === 'size') swap(`${path.basename(m.default)}" download>↓ ${m.slot.endsWith('vertical') ? 'Vertical 15s' : 'Trecho 30s'} <em>${m.meta}</em>`, `${path.basename(m.default)}" download>↓ ${m.slot.endsWith('vertical') ? 'Vertical 15s' : 'Trecho 30s'} <em>{{mm:${m.slot}}}</em>`);
  else swap(`<span>${m.meta}</span>`, `<span>{{mm:${m.slot}}}</span>`);
}

/* ---------- mídias (caminhos mais longos primeiro) ---------- */
const media = [...MEDIA].sort((a, b) => b.default.length - a.default.length);
for (const m of media) if (m.thumb) swap(m.thumb!, `{{mt:${m.slot}}}`, 'all');
for (const m of media) swap(m.default, `{{m:${m.slot}}}`, 'all');

/* ---------- contatos do perfil ---------- */
swap('Gilberto!', '{{pu:contact_first}}!');
swap('WhatsApp · Gilberto Lima', 'WhatsApp · {{p:contact_name}}');
swap('Alto Uruguai Eventos · Erechim–RS', '{{p:producer}} · {{p:city}}');
swap('>@os4gauderios<span', '>{{p:instagram_handle}}<span');
swap('5554999170670', '{{p:whatsapp}}', 'all');
swap('(54) 99917-0670', '{{p:phone}}', 'all');
swap('altouruguaieventos@gmail.com', '{{p:email}}', 'all');

if (errors.length) {
  console.error('Template NÃO gerado. Trechos que não bateram:\n- ' + errors.join('\n- '));
  process.exit(1);
}
fs.writeFileSync(OUT, html.trim() + '\n');
const tokens = new Set(html.match(/\{\{[^}]+\}\}/g) ?? []);
console.log(`src/lib/content/template.html gerado com ${tokens.size} marcadores.`);
