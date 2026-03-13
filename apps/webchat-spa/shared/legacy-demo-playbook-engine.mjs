const BOT_ID = 'greentic-playbooks';

export const PLAYBOOK_CATEGORIES = [
  {
    id: 'network-traffic-routing',
    labelKey: 'playbooks.category.networkTrafficRouting',
    defaultLabel: 'Network Traffic & Routing'
  },
  {
    id: 'capacity-port-management',
    labelKey: 'playbooks.category.capacityPortManagement',
    defaultLabel: 'Capacity & Port Management'
  },
  {
    id: 'performance-root-cause',
    labelKey: 'playbooks.category.performanceRootCause',
    defaultLabel: 'Performance & Root Cause'
  },
  {
    id: 'service-assurance',
    labelKey: 'playbooks.category.serviceAssurance',
    defaultLabel: 'Service Assurance'
  }
];

export const PLAYBOOKS = [
  {
    id: 'prefix-traffic-distribution',
    categoryId: 'network-traffic-routing',
    labelKey: 'playbooks.name.prefixTrafficDistribution',
    defaultLabel: 'Prefix traffic distribution',
    keywords: ['prefix', 'traffic', 'distribution', 'routing', 'inbound', 'outbound']
  },
  {
    id: 'bgp-advertisers-session-health',
    categoryId: 'network-traffic-routing',
    labelKey: 'playbooks.name.bgpAdvertisersSessionHealth',
    defaultLabel: 'BGP advertisers and session health',
    keywords: ['bgp', 'advertisers', 'session', 'peer', 'prefix', 'route']
  },
  {
    id: 'top-source-asns',
    categoryId: 'network-traffic-routing',
    labelKey: 'playbooks.name.topSourceAsns',
    defaultLabel: 'Top source ASNs',
    keywords: ['top', 'source', 'asn', 'asns', 'traffic', 'volume']
  },
  {
    id: 'free-gi-ports',
    categoryId: 'capacity-port-management',
    labelKey: 'playbooks.name.freeGiPorts',
    defaultLabel: 'Free Gi ports',
    keywords: ['free', 'gi', 'ports', 'available', 'capacity']
  },
  {
    id: 'overutilised-gi-ports',
    categoryId: 'capacity-port-management',
    labelKey: 'playbooks.name.overutilisedGiPorts',
    defaultLabel: 'Overutilised Gi ports',
    keywords: ['overutilised', 'overutilized', 'gi', 'ports', 'hot', 'utilisation']
  },
  {
    id: 'free-aci-ports',
    categoryId: 'capacity-port-management',
    labelKey: 'playbooks.name.freeAciPorts',
    defaultLabel: 'Free ACI ports',
    keywords: ['free', 'aci', 'ports', 'available', 'fabric']
  },
  {
    id: 'overutilised-aci-ports',
    categoryId: 'capacity-port-management',
    labelKey: 'playbooks.name.overutilisedAciPorts',
    defaultLabel: 'Overutilised ACI ports',
    keywords: ['overutilised', 'overutilized', 'aci', 'ports', 'fabric', 'saturation']
  },
  {
    id: 'vm-performance-rca',
    categoryId: 'performance-root-cause',
    labelKey: 'playbooks.name.vmPerformanceRca',
    defaultLabel: 'VM performance RCA',
    keywords: ['vm', 'performance', 'rca', 'latency', 'cpu', 'memory']
  },
  {
    id: 'noisy-neighbour-investigation',
    categoryId: 'performance-root-cause',
    labelKey: 'playbooks.name.noisyNeighbourInvestigation',
    defaultLabel: 'Noisy neighbour investigation',
    keywords: ['noisy', 'neighbour', 'neighbor', 'shared', 'contention', 'vm']
  },
  {
    id: 'change-correlation',
    categoryId: 'performance-root-cause',
    labelKey: 'playbooks.name.changeCorrelation',
    defaultLabel: 'Change correlation',
    keywords: ['change', 'correlation', 'deployment', 'maintenance', 'incident']
  },
  {
    id: 'service-slo-sla-status',
    categoryId: 'service-assurance',
    labelKey: 'playbooks.name.serviceSloSlaStatus',
    defaultLabel: 'Service SLO / SLA status',
    keywords: ['service', 'slo', 'sla', 'availability', 'status']
  }
];

const FIXTURES = {
  'prefix-traffic-distribution': {
    scopeFacts: [
      ['Prefix', '203.0.113.0/24'],
      ['Direction', 'Inbound'],
      ['Window', 'Last 24 hours']
    ],
    understandingFacts: [
      ['Intent', 'Traffic split by peer, router, and interface'],
      ['Expected output', 'Top contributors and percentage share']
    ],
    dataSourceFacts: [
      ['Primary', 'Flow telemetry'],
      ['Secondary', 'Traffic engineering inventory'],
      ['Resolution', '5-minute bins']
    ],
    retrievalSteps: [
      'Retrieve flow records for the selected prefix and time window.',
      'Group traffic by peer, router, and egress interface.',
      'Compute average, p95, and peak throughput.'
    ],
    analysisFacts: [
      ['Top peer', 'AS15169 Google - 34.2%'],
      ['Peak throughput', '12.3 Gbps at 14:35 UTC'],
      ['Concentration', 'Top 3 peers account for 74.1%']
    ],
    evidenceLines: [
      'PE-LON1 / Te0/0/0/1 carries 4.2 Gbps average inbound traffic.',
      'Cloudflare contributes 22.8% and Amazon contributes 17.1%.',
      'No unexpected routing asymmetry was detected.'
    ],
    summary:
      'Inbound traffic for 203.0.113.0/24 is concentrated on three peers, with Google as the dominant source and no clear routing anomaly.'
  },
  'bgp-advertisers-session-health': {
    scopeFacts: [
      ['Prefix', '203.0.113.0/24'],
      ['Mode', 'Current state'],
      ['Session health', 'Included']
    ],
    understandingFacts: [
      ['Intent', 'Validate advertising routers and peer session state'],
      ['Expected output', 'Healthy peers plus any idle or flapping sessions']
    ],
    dataSourceFacts: [
      ['Primary', 'BGP routes dataset'],
      ['Secondary', 'BGP session telemetry'],
      ['Join key', 'Router + peer']
    ],
    retrievalSteps: [
      'Fetch current route advertisements for the target prefix.',
      'Fetch session state and flap counters for matched peers.',
      'Join route and session datasets by router and remote AS.'
    ],
    analysisFacts: [
      ['Advertising routers', '3'],
      ['Established sessions', '5 of 6'],
      ['Detected anomaly', 'AS9002 on PE-LON1 is idle']
    ],
    evidenceLines: [
      'Five peers are established and advertising the prefix as expected.',
      'One session remains idle and is not contributing to redundancy.',
      'AS path diversity remains acceptable with five distinct paths.'
    ],
    summary:
      'Routing health is slightly degraded because one peer is idle, but the prefix remains broadly advertised across the estate.'
  },
  'top-source-asns': {
    scopeFacts: [
      ['Scope', 'All traffic'],
      ['Ranking', 'Total volume'],
      ['Window', 'Last 24 hours']
    ],
    understandingFacts: [
      ['Intent', 'Rank source ASNs by contribution to traffic volume'],
      ['Expected output', 'Top ASN contributors and share']
    ],
    dataSourceFacts: [
      ['Primary', 'Flow telemetry'],
      ['Enrichment', 'ASN registry and PeeringDB'],
      ['Resolution', '5-minute bins']
    ],
    retrievalSteps: [
      'Aggregate flows by source ASN.',
      'Enrich ASN labels with network names.',
      'Rank ASNs by total contribution.'
    ],
    analysisFacts: [
      ['Top ASN', 'AS15169 Google - 28.3%'],
      ['Runner-up', 'AS13335 Cloudflare - 18.6%'],
      ['Top 3 share', '60.3%']
    ],
    evidenceLines: [
      'Google averages 18.4 Gbps and remains the dominant contributor.',
      'Cloudflare and Amazon together add another 32.0% share.',
      'Long-tail ASN contribution stays below 40%.'
    ],
    summary:
      'Traffic is dominated by a small ASN set, with Google, Cloudflare, and Amazon accounting for most of the observed load.'
  },
  'free-gi-ports': {
    scopeFacts: [
      ['Device', 'PE-LON1'],
      ['Port speed', '10G'],
      ['State filter', 'Administratively up, operationally down']
    ],
    understandingFacts: [
      ['Intent', 'List free Gi capacity that can be assigned quickly'],
      ['Expected output', 'Ports ready for service turn-up']
    ],
    dataSourceFacts: [
      ['Primary', 'Inventory DB'],
      ['Secondary', 'Interface state poller'],
      ['Cross-check', 'Recent alarms']
    ],
    retrievalSteps: [
      'Retrieve candidate Gi interfaces for the device.',
      'Remove ports already reserved by capacity plans.',
      'Validate state and alarm cleanliness.'
    ],
    analysisFacts: [
      ['Available ports', '14'],
      ['Immediate-ready ports', '9'],
      ['Reserved in plan', '5']
    ],
    evidenceLines: [
      'Gi0/1/17, Gi0/1/19, and Gi0/1/23 are clear and immediately assignable.',
      'Five additional ports are physically free but reserved for pending orders.',
      'No outstanding hardware alarms affect the ready subset.'
    ],
    summary:
      'Nine 10G Gi ports are immediately available on PE-LON1, with five more blocked by planned capacity reservations.'
  },
  'overutilised-gi-ports': {
    scopeFacts: [
      ['Device', 'PE-LON1'],
      ['Threshold', '80% utilisation'],
      ['Window', 'Last 7 days']
    ],
    understandingFacts: [
      ['Intent', 'Surface Gi interfaces exceeding sustained utilisation limits'],
      ['Expected output', 'Ports at risk plus hotspot evidence']
    ],
    dataSourceFacts: [
      ['Primary', 'Interface telemetry'],
      ['Secondary', 'Capacity planning dataset'],
      ['Resolution', '15-minute bins']
    ],
    retrievalSteps: [
      'Fetch throughput and error counters for Gi interfaces.',
      'Calculate sustained and peak utilisation bands.',
      'Match against threshold policy.'
    ],
    analysisFacts: [
      ['Ports over threshold', '4'],
      ['Worst offender', 'Gi0/1/11 at 91% p95'],
      ['Associated errors', 'None material']
    ],
    evidenceLines: [
      'Gi0/1/11 has exceeded 80% for six of the last seven days.',
      'Gi0/1/13 and Gi0/1/14 show back-to-back busy-hour peaks above 88%.',
      'Error rates remain low, so the issue is demand rather than interface health.'
    ],
    summary:
      'Four Gi ports are consistently hot and should be candidates for redistribution or upgrade before the next traffic peak.'
  },
  'free-aci-ports': {
    scopeFacts: [
      ['Fabric', 'ACI-PROD-1'],
      ['Leaf pair', '201/202'],
      ['Port policy', 'Tenant allocatable']
    ],
    understandingFacts: [
      ['Intent', 'Find allocatable ACI fabric ports'],
      ['Expected output', 'Ports available for new service attachment']
    ],
    dataSourceFacts: [
      ['Primary', 'ACI fabric inventory'],
      ['Secondary', 'Policy usage map'],
      ['Cross-check', 'Recent provisioning changes']
    ],
    retrievalSteps: [
      'Retrieve leaf port inventory and policy attachment state.',
      'Filter out reserved and recently changed ports.',
      'Validate ports are clean and unallocated.'
    ],
    analysisFacts: [
      ['Available ports', '18'],
      ['Dual-homed pairs', '6'],
      ['Ports excluded', '4 recent changes']
    ],
    evidenceLines: [
      'Eth1/17-18 on both leaves are free and aligned for dual-homed use.',
      'Six dual-homed pairs are currently unallocated.',
      'Recently modified ports were excluded to avoid unstable turn-up windows.'
    ],
    summary:
      'The selected ACI fabric has healthy spare capacity, including six clean dual-homed port pairs ready for allocation.'
  },
  'overutilised-aci-ports': {
    scopeFacts: [
      ['Fabric', 'ACI-PROD-1'],
      ['Threshold', '75% sustained utilisation'],
      ['Window', 'Last 72 hours']
    ],
    understandingFacts: [
      ['Intent', 'Identify ACI ports with sustained saturation risk'],
      ['Expected output', 'Hot ports and likely balancing actions']
    ],
    dataSourceFacts: [
      ['Primary', 'ACI interface telemetry'],
      ['Secondary', 'Tenant attachment map'],
      ['Resolution', '5-minute bins']
    ],
    retrievalSteps: [
      'Retrieve utilisation for fabric-facing and tenant-facing ports.',
      'Apply sustained load threshold over the selected window.',
      'Correlate hot ports to tenant attachments.'
    ],
    analysisFacts: [
      ['Hot ports', '3'],
      ['Worst port', 'Leaf201 Eth1/41 at 84% p95'],
      ['Primary tenant', 'Video analytics cluster']
    ],
    evidenceLines: [
      'Leaf201 Eth1/41 and Leaf202 Eth1/41 peak together during ingest bursts.',
      'One additional port is hot only during backup windows.',
      'The same tenant workload drives most of the excess load.'
    ],
    summary:
      'Three ACI ports show sustained pressure, with one tenant workload creating the clearest balancing opportunity.'
  },
  'vm-performance-rca': {
    scopeFacts: [
      ['VM', 'vm-payments-14'],
      ['Symptom', 'High latency'],
      ['Window', 'Last 4 hours']
    ],
    understandingFacts: [
      ['Intent', 'Explain the recent VM performance degradation'],
      ['Expected output', 'Most likely root-cause chain']
    ],
    dataSourceFacts: [
      ['Primary', 'VM metrics'],
      ['Secondary', 'Hypervisor contention metrics'],
      ['Tertiary', 'Change timeline']
    ],
    retrievalSteps: [
      'Collect CPU, memory, disk, and network metrics for the VM.',
      'Compare against host-level contention on the hypervisor.',
      'Overlay recent changes and incidents.'
    ],
    analysisFacts: [
      ['Likely root cause', 'Storage latency spike on shared datastore'],
      ['CPU ready', 'Within normal range'],
      ['Impact start', '10:12 UTC']
    ],
    evidenceLines: [
      'Disk latency tripled at the same time application latency increased.',
      'Host CPU ready stayed below 3%, reducing the likelihood of compute contention.',
      'A backup job on the same datastore started within two minutes of impact.'
    ],
    summary:
      'The VM slowdown is most consistent with a shared-storage latency event rather than CPU or memory pressure on the guest.'
  },
  'noisy-neighbour-investigation': {
    scopeFacts: [
      ['Cluster', 'prod-vsphere-2'],
      ['Symptom', 'Intermittent latency'],
      ['Window', 'Last 6 hours']
    ],
    understandingFacts: [
      ['Intent', 'Test whether adjacent workloads are creating contention'],
      ['Expected output', 'Correlated neighbour and resource signal']
    ],
    dataSourceFacts: [
      ['Primary', 'Hypervisor scheduling metrics'],
      ['Secondary', 'Tenant workload map'],
      ['Tertiary', 'Disk and network contention']
    ],
    retrievalSteps: [
      'Identify co-located workloads on the same host.',
      'Compare contention spikes across CPU, memory, disk, and network.',
      'Rank neighbours by correlation with the incident timeline.'
    ],
    analysisFacts: [
      ['Top correlated neighbour', 'analytics-batch-03'],
      ['Resource under pressure', 'Shared disk queue depth'],
      ['Confidence', 'High']
    ],
    evidenceLines: [
      'Neighbour workload batch windows overlap exactly with the latency spikes.',
      'Disk queue depth and IOPS surged while guest CPU stayed stable.',
      'Moving the neighbour off-host cleared the issue in the previous incident.'
    ],
    summary:
      'A co-located analytics workload is the strongest noisy-neighbour candidate, with storage contention as the common resource bottleneck.'
  },
  'change-correlation': {
    scopeFacts: [
      ['Service', 'voice-core-east'],
      ['Symptom', 'Increased error rate'],
      ['Window', 'Last 24 hours']
    ],
    understandingFacts: [
      ['Intent', 'Find changes that correlate with the incident timeline'],
      ['Expected output', 'Most likely change candidates']
    ],
    dataSourceFacts: [
      ['Primary', 'Change calendar'],
      ['Secondary', 'Deployment pipeline'],
      ['Tertiary', 'Incident metrics']
    ],
    retrievalSteps: [
      'Collect approved changes and deployments in the impact window.',
      'Overlay error-rate and latency spikes.',
      'Rank changes by temporal proximity and component relevance.'
    ],
    analysisFacts: [
      ['Top candidate', 'Firewall policy rollout at 09:55 UTC'],
      ['Second candidate', 'DNS config deployment at 08:10 UTC'],
      ['Confidence', 'Medium']
    ],
    evidenceLines: [
      'The firewall change occurred 17 minutes before the first error spike.',
      'Affected services depend on the same network segment targeted by the change.',
      'Rollback history shows a similar signature during a previous policy issue.'
    ],
    summary:
      'The firewall rollout is the most plausible change-related trigger and should be reviewed first during triage.'
  },
  'service-slo-sla-status': {
    scopeFacts: [
      ['Service', 'mobile-core-api'],
      ['Measurement', 'Availability and latency SLO'],
      ['Window', 'Current month']
    ],
    understandingFacts: [
      ['Intent', 'Report current SLO/SLA health against target'],
      ['Expected output', 'Burn-rate and remaining error budget']
    ],
    dataSourceFacts: [
      ['Primary', 'Service monitor dataset'],
      ['Secondary', 'SLA policy catalogue'],
      ['Resolution', '1-minute checks']
    ],
    retrievalSteps: [
      'Fetch service availability, latency, and error-rate metrics.',
      'Apply contractual target thresholds.',
      'Calculate current burn rate and remaining budget.'
    ],
    analysisFacts: [
      ['Availability', '99.93% vs 99.90% target'],
      ['Latency SLO', 'Within target'],
      ['Error budget remaining', '42%']
    ],
    evidenceLines: [
      'Two short incidents consumed most of this month’s budget.',
      'Latency remains stable even during high-traffic periods.',
      'Current burn rate is acceptable if no further incidents occur.'
    ],
    summary:
      'The service remains within SLA, but the remaining error budget is no longer generous and should be watched closely.'
  }
};

function isRtlLocale(locale) {
  if (!locale) {
    return false;
  }

  const normalized = String(locale).toLowerCase();
  return ['ar', 'fa', 'ur'].some((rtlPrefix) => normalized === rtlPrefix || normalized.startsWith(`${rtlPrefix}-`));
}

function translateMessage(messages, key, fallback, params) {
  const template = messages?.[key] || fallback;
  if (!params) {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_match, paramKey) => params[paramKey] ?? '');
}

function makeFactSet(facts) {
  if (!facts?.length) {
    return [];
  }
  return [
    {
      type: 'FactSet',
      facts: facts.map(([title, value]) => ({ title: `${title}:`, value }))
    }
  ];
}

function makeBulletList(lines) {
  return (lines || []).map((line) => ({
    type: 'TextBlock',
    text: `• ${line}`,
    wrap: true,
    spacing: 'Small'
  }));
}

function createAdaptiveCard({ title, subtitle, body, facts, bullets, actions = [], locale }) {
  const card = {
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: title,
        weight: 'Bolder',
        size: 'Medium',
        wrap: true
      },
      ...(subtitle
        ? [
            {
              type: 'TextBlock',
              text: subtitle,
              isSubtle: true,
              wrap: true,
              spacing: 'Small'
            }
          ]
        : []),
      ...(body
        ? [
            {
              type: 'TextBlock',
              text: body,
              wrap: true,
              spacing: 'Medium'
            }
          ]
        : []),
      ...makeFactSet(facts),
      ...makeBulletList(bullets)
    ],
    actions
  };

  if (locale) {
    card.lang = locale;
    if (isRtlLocale(locale)) {
      card.rtl = true;
    }
  }

  return card;
}

function createBotActivity({ text, card, sequence }) {
  const activity = {
    type: 'message',
    id: `${BOT_ID}-${Date.now()}-${sequence}`,
    from: { id: BOT_ID, role: 'bot', name: 'Greentic Playbooks' },
    text
  };

  if (card) {
    activity.attachments = [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: card
      }
    ];
  }

  return activity;
}

function findCategory(categoryId) {
  return PLAYBOOK_CATEGORIES.find((category) => category.id === categoryId);
}

function findPlaybook(playbookId) {
  return PLAYBOOKS.find((playbook) => playbook.id === playbookId);
}

function getPlaybookLabel(playbook, messages) {
  return translateMessage(messages, playbook.labelKey, playbook.defaultLabel);
}

function getCategoryLabel(category, messages) {
  return translateMessage(messages, category.labelKey, category.defaultLabel);
}

function scorePlaybook(text, playbook) {
  const normalized = String(text || '').toLowerCase();
  if (!normalized.trim()) {
    return 0;
  }

  return playbook.keywords.reduce((score, keyword) => {
    return score + (normalized.includes(keyword) ? 1 : 0);
  }, 0);
}

export function resolveNaturalLanguagePlaybook(text) {
  let bestMatch;
  let bestScore = 0;

  for (const playbook of PLAYBOOKS) {
    const score = scorePlaybook(text, playbook);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = playbook;
    }
  }

  return bestScore >= 2 ? bestMatch : undefined;
}

export function buildCategoryMenuActivities(messages, locale) {
  const card = createAdaptiveCard({
    locale,
    title: translateMessage(messages, 'playbooks.categories.title', 'Guided telecom playbooks'),
    subtitle: translateMessage(
      messages,
      'playbooks.categories.subtitle',
      'Choose a category to narrow the investigation flow.'
    ),
    actions: PLAYBOOK_CATEGORIES.map((category) => ({
      type: 'Action.Submit',
      title: getCategoryLabel(category, messages),
      data: {
        playbookAction: 'show-category',
        categoryId: category.id
      }
    }))
  });

  return [createBotActivity({ card, sequence: 1 })];
}

export function buildPlaybookListActivities(categoryId, messages, locale) {
  const category = findCategory(categoryId);
  if (!category) {
    return buildCategoryMenuActivities(messages, locale);
  }

  const actions = PLAYBOOKS.filter((playbook) => playbook.categoryId === categoryId).map((playbook) => ({
    type: 'Action.Submit',
    title: getPlaybookLabel(playbook, messages),
    data: {
      playbookAction: 'launch-playbook',
      playbookId: playbook.id
    }
  }));

  const card = createAdaptiveCard({
    locale,
    title: translateMessage(messages, 'playbooks.list.title', 'Playbooks'),
    subtitle: getCategoryLabel(category, messages),
    actions: [
      ...actions,
      {
        type: 'Action.Submit',
        title: translateMessage(messages, 'playbooks.actions.backToCategories', 'Back to categories'),
        data: {
          playbookAction: 'show-categories'
        }
      }
    ]
  });

  return [createBotActivity({ card, sequence: 1 })];
}

export function buildPlaybookFlowActivities(playbookId, messages, locale) {
  const playbook = findPlaybook(playbookId);
  const fixture = FIXTURES[playbookId];
  if (!playbook || !fixture) {
    return buildCategoryMenuActivities(messages, locale);
  }

  const category = findCategory(playbook.categoryId);
  const title = getPlaybookLabel(playbook, messages);

  const cards = [
    createAdaptiveCard({
      locale,
      title: translateMessage(messages, 'playbooks.cards.scope', 'Scope'),
      subtitle: title,
      facts: fixture.scopeFacts
    }),
    createAdaptiveCard({
      locale,
      title: translateMessage(messages, 'playbooks.cards.understanding', 'Understanding'),
      subtitle: title,
      facts: fixture.understandingFacts
    }),
    createAdaptiveCard({
      locale,
      title: translateMessage(messages, 'playbooks.cards.dataSources', 'Data sources'),
      subtitle: title,
      facts: fixture.dataSourceFacts
    }),
    createAdaptiveCard({
      locale,
      title: translateMessage(messages, 'playbooks.cards.retrieval', 'Retrieval'),
      subtitle: title,
      bullets: fixture.retrievalSteps
    }),
    createAdaptiveCard({
      locale,
      title: translateMessage(messages, 'playbooks.cards.analysis', 'Analysis'),
      subtitle: title,
      facts: fixture.analysisFacts
    }),
    createAdaptiveCard({
      locale,
      title: translateMessage(messages, 'playbooks.cards.evidence', 'Evidence'),
      subtitle: title,
      bullets: fixture.evidenceLines
    }),
    createAdaptiveCard({
      locale,
      title: translateMessage(messages, 'playbooks.cards.summary', 'Summary'),
      subtitle: title,
      body: fixture.summary,
      actions: [
        {
          type: 'Action.Submit',
          title: translateMessage(messages, 'playbooks.actions.restart', 'Restart playbook'),
          data: {
            playbookAction: 'launch-playbook',
            playbookId
          }
        },
        {
          type: 'Action.Submit',
          title: translateMessage(messages, 'playbooks.actions.backToCategory', 'Back to category'),
          data: {
            playbookAction: 'show-category',
            categoryId: playbook.categoryId
          }
        },
        {
          type: 'Action.Submit',
          title: translateMessage(messages, 'playbooks.actions.backToCategories', 'Back to categories'),
          data: {
            playbookAction: 'show-categories'
          }
        }
      ]
    })
  ];

  return cards.map((card, index) =>
    createBotActivity({
      text:
        index === 0 && category
          ? translateMessage(messages, 'playbooks.intro', 'Launching {{playbook}}', {
              playbook: `${getCategoryLabel(category, messages)} / ${title}`
            })
          : undefined,
      card,
      sequence: index + 1
    })
  );
}

export function buildNaturalLanguageMatchActivities(text, messages, locale) {
  const playbook = resolveNaturalLanguagePlaybook(text);
  if (!playbook) {
    return [];
  }

  return [
    createBotActivity({
      text: translateMessage(messages, 'playbooks.match', 'Matched your request to {{playbook}}.', {
        playbook: getPlaybookLabel(playbook, messages)
      }),
      sequence: 0
    }),
    ...buildPlaybookFlowActivities(playbook.id, messages, locale)
  ];
}
