/*
  AGENDA DOS 4 GAUDÉRIOS
  ----------------------------------------------------------
  Para atualizar a agenda do site, edite só esta lista.
  Cada show é um bloco entre { }, separado por vírgula.

  Campos:
    data    'AAAA-MM-DD'  (obrigatório)
    hora    '23h'         (opcional)
    cidade  'Erechim'     (obrigatório)
    uf      'RS'          (obrigatório)
    evento  'Baile de Aniversário do CTG ...'   (obrigatório)
    local   'CTG Sentinela do Planalto'         (opcional)
    link    'https://...' link de ingressos ou do evento (opcional)
    status  'confirmado' | 'ultimos' | 'esgotado' | 'fechado'   (opcional)
            'fechado' = evento particular, sem venda ao público

  Datas que já passaram somem sozinhas do site.

  Exemplo:
    {
      data: '2026-11-21', hora: '23h',
      cidade: 'Erechim', uf: 'RS',
      evento: 'Baile de Aniversário', local: 'CTG Exemplo',
      link: 'https://www.instagram.com/os4gauderios/',
      status: 'confirmado'
    },
*/
window.AGENDA = [

  // ---------- Outubro 2026 ----------
  { data: '2026-10-02', hora: '21h30', cidade: 'Garuva', uf: 'PR', evento: 'Impact Hall' },
  { data: '2026-10-02', hora: '02h', cidade: 'Curitiba', uf: 'PR', evento: 'Atenas Palace' },
  { data: '2026-10-03', cidade: 'Arapoti', uf: 'PR', evento: 'Ginásio Esportivo Chapelão' },
  { data: '2026-10-04', cidade: 'Irati', uf: 'PR', evento: 'Park Dance' },
  { data: '2026-10-08', cidade: 'Santa Maria', uf: 'RS', evento: "Valdir's Bar" },
  { data: '2026-10-09', cidade: 'São Pedro do Sul', uf: 'RS', evento: 'CTG Rincão de São Pedro' },
  { data: '2026-10-10', cidade: 'Urubici', uf: 'SC', evento: 'CTG Campestre Catarinense' },
  { data: '2026-10-11', cidade: 'Campo Belo do Sul', uf: 'SC', evento: 'Com. Rincão da Cachoeira' },
  { data: '2026-10-12', cidade: 'Matos Costa', uf: 'SC', evento: 'Salão Paroquial' },
  { data: '2026-10-15', cidade: 'Cascavel', uf: 'PR', evento: 'Asservel' },

];
