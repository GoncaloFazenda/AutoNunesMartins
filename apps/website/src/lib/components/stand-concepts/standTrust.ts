/** Business metrics supplied by the owner for this homepage. */
export const standTrust = {
  metrics: [
    { value: 15, suffix: '', label: 'anos no mercado' },
    { value: 500, suffix: '+', label: 'viaturas vendidas' },
    { value: 2500, suffix: '+', label: 'clientes satisfeitos' },
    { value: 24, suffix: 'h', label: 'resposta garantida' },
  ],
  // Specific commercial terms remain unset; do not infer them from the headline metrics.
  guaranteeDurationMonths: null,
  services: [
    {
      title: 'Financiamento',
      description: 'O próximo carro, ao ritmo dos seus planos.',
      details: 'Conheça as opções de entrada, prazo e mensalidade para a viatura que tem em vista. As condições dependem da análise do pedido e devem ser confirmadas antes de decidir.',
    },
    {
      title: 'Garantia',
      description: 'Para seguir caminho com mais tranquilidade.',
      details: 'Saiba o que está incluído e como pedir apoio quando precisar. A cobertura, a duração e as condições da garantia devem ser confirmadas para cada viatura.',
    },
    {
      title: 'Retoma',
      description: 'O seu carro de hoje pode fazer parte do próximo passo.',
      details: 'Partilhe a marca, o modelo, o ano, os quilómetros e algumas fotografias do seu carro. Estes dados ajudam a preparar a avaliação; o valor final depende da análise da viatura.',
    },
  ],
};
