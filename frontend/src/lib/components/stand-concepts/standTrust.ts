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
    { title: 'Financiamento', description: 'O próximo carro, ao ritmo dos seus planos.' },
    { title: 'Garantia', description: 'Para seguir caminho com mais tranquilidade.' },
    { title: 'Retoma', description: 'O seu carro de hoje pode fazer parte do próximo passo.' },
  ],
};
