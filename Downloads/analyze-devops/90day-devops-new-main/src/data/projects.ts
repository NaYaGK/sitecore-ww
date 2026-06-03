export interface ProjectFile {
  path: string;
  desc: string;
}

export interface Project {
  id: string;
  phase: string;
  phaseIdx: number;
  repoName: string;
  headline: string;
  oneLiner: string;
  NOT: string;
  techStack: string[];
  topics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resumeLine: string;
  interviewTalkingPoints: string[];
  files: ProjectFile[];
  cicdBadge: boolean;
  readmeArchSection: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    phase: 'Foundations & Culture',
    phaseIdx: 0,
    repoName: 'devops-toolkit',
    headline: 'Production server automation toolkit',
    oneLiner: 'A collection of hardened Bash scripts for server provisioning, log analysis, user management, and cron-based monitoring — the kind of toolkit an ops team actually uses.',
    NOT: 'learn-bash or bash-practice or bash-tutorial',
    techStack: ['Bash', 'Linux', 'Cron', 'systemd', 'grep/sed/awk'],
    topics: ['bash', 'linux', 'devops', 'automation', 'sysadmin', 'shell-scripting'],
    difficulty: 'beginner',
    resumeLine: 'Built production server automation toolkit (Bash) covering log rotation, user provisioning, health checks, and alerting — reducing manual ops tasks by ~4 hours/week',
    interviewTalkingPoints: [
      'Why Bash over Python for this? — Bash has zero dependencies on the target server. Python might not be installed or might be the wrong version. For server-level automation Bash is the right tool.',
      'How did you handle errors? — set -euo pipefail at the top of every script. -e exits on error, -u catches undefined variables, -o pipefail catches pipe failures. Most tutorials skip this.',
      'How would you test these? — bats-core (Bash Automated Testing System). Each function has a unit test. CI runs them on every PR.',
      'What would you do differently? — Move the complex logic to Ansible for idempotency. Bash is good for glue scripts, not configuration management at scale.'
    ],
    files: [
      { path: 'README.md', desc: 'Engineering decision log, not a tutorial' },
      { path: 'scripts/provision-server.sh', desc: 'Idempotent server setup' },
      { path: 'scripts/log-analyser.sh', desc: 'grep/awk log parsing pipeline' },
      { path: 'scripts/health-check.sh', desc: 'HTTP + disk + memory checks' },
      { path: 'scripts/user-audit.sh', desc: 'List users with sudo, flag anomalies' },
      { path: '.github/workflows/test.yml', desc: 'bats-core tests in CI' },
      { path: 'tests/test_provision.bats', desc: 'Unit tests for provision script' }
    ],
    cicdBadge: true,
    readmeArchSection: 'A set of POSIX-compliant shell scripts designed to be dropped onto any Linux server. Each script is idempotent — running it twice produces the same result. Scripts use set -euo pipefail and trap ERR for error handling. CI runs bats-core tests against an Ubuntu 22.04 container on every push.'
  },
  {
    id: 'p2',
    phase: 'Security & DevSecOps',
    phaseIdx: 1,
    repoName: 'container-security-pipeline',
    headline: 'Automated container vulnerability scanning pipeline',
    oneLiner: 'A GitHub Actions pipeline that scans Docker images with Trivy on every PR, generates SBOMs with Syft, fails builds on CRITICAL/HIGH CVEs, and only pushes clean images to a registry.',
    NOT: 'docker-security-learning or trivy-tutorial',
    techStack: ['GitHub Actions', 'Docker', 'Trivy', 'Syft', 'AWS ECR', 'OPA'],
    topics: ['devsecops', 'container-security', 'docker', 'trivy', 'sbom', 'github-actions', 'cicd'],
    difficulty: 'intermediate',
    resumeLine: 'Built automated container security pipeline enforcing Trivy vulnerability scanning gates in CI/CD — blocks CRITICAL CVEs from reaching production, generates SBOM on every release',
    interviewTalkingPoints: [
      'What is a CVSS score and how did you decide your threshold? — CVSS is 0–10 severity. We fail on CRITICAL (9.0+) and HIGH (7.0+) but allow MEDIUM with a ticket. This is a business risk decision, not a technical one.',
      'What is an SBOM and why does it matter? — Software Bill of Materials. A machine-readable list of every dependency in the image. When Log4Shell dropped, teams with SBOMs knew in minutes which services were affected. Teams without spent days.',
      'How do you handle false positives? — Trivy supports a .trivyignore file where you document why a CVE is acceptable (e.g. not reachable, vendor patch pending). Every ignore entry requires a comment with a ticket number and expiry date.',
      'What happens when the base image gets a new CVE after deploy? — We run the scanner on a schedule (daily) against images already in the registry, not just at build time. New CVEs trigger a Slack alert and a rebuild.'
    ],
    files: [
      { path: 'README.md', desc: 'Architecture + decision log' },
      { path: '.github/workflows/security-scan.yml', desc: 'Full pipeline: build → scan → SBOM → push' },
      { path: 'Dockerfile', desc: 'Multi-stage, non-root, distroless final stage' },
      { path: '.trivyignore', desc: 'Documented CVE exceptions with expiry' },
      { path: 'policies/require-non-root.rego', desc: 'OPA policy: no privileged containers' },
      { path: 'sbom/', desc: 'Generated SBOM artifacts (CycloneDX format)' },
      { path: 'docs/threat-model.md', desc: 'STRIDE threat model for the pipeline' }
    ],
    cicdBadge: true,
    readmeArchSection: 'On every PR: Docker image is built using a multi-stage Dockerfile (build stage uses full SDK, final stage uses distroless/static). Trivy scans the final image and fails the pipeline on CRITICAL or HIGH CVEs. Syft generates a CycloneDX SBOM and attaches it as a build artifact. On merge to main, the clean image is pushed to ECR with a sha256 digest tag (never :latest in production).'
  },
  {
    id: 'p3',
    phase: 'Testing & QA',
    phaseIdx: 2,
    repoName: 'resilience-testing-lab',
    headline: 'Chaos engineering and production readiness validation',
    oneLiner: 'A Kubernetes-based chaos engineering lab using Litmus that runs automated fault injection experiments — pod failures, network latency, CPU stress — and validates that SLOs hold under failure conditions.',
    NOT: 'chaos-engineering-tutorial or k8s-learning',
    techStack: ['Kubernetes', 'Litmus Chaos', 'Prometheus', 'Grafana', 'GitHub Actions', 'Helm'],
    topics: ['chaos-engineering', 'kubernetes', 'sre', 'resilience', 'litmus', 'prometheus', 'slo'],
    difficulty: 'intermediate',
    resumeLine: 'Designed and executed chaos engineering experiments on Kubernetes using Litmus, validating 99.9% SLO compliance under pod failure, network latency (200ms), and CPU stress conditions',
    interviewTalkingPoints: [
      'What is a chaos hypothesis and how did you write one? — "If we kill 50% of the pods in the payment service, the remaining pods will handle load and the error rate will stay below 0.1% within 30 seconds." You define the steady state first, then the failure, then the expected outcome.',
      'What was the most interesting failure you found? — The database connection pool did not recover automatically after a network partition. Connections stayed in a broken state. Fix was to add a health check that restarted the pool on connectivity failure.',
      'How is this different from load testing? — Load testing asks "does the system handle high traffic?" Chaos testing asks "does the system handle failure?" They test different failure modes. You need both.',
      'How did you prevent experiments from taking down production? — We never ran experiments in production initially. All experiments ran in a dedicated staging namespace with identical configuration. Blast radius was constrained by namespace resource quotas.'
    ],
    files: [
      { path: 'README.md', desc: 'Hypothesis log + results for each experiment' },
      { path: 'experiments/pod-delete.yaml', desc: 'LitmusChaos pod failure experiment' },
      { path: 'experiments/network-latency.yaml', desc: '200ms latency injection' },
      { path: 'experiments/cpu-stress.yaml', desc: '80% CPU stress for 5 minutes' },
      { path: 'k8s/sample-app/', desc: 'Target application with HPA + PDB' },
      { path: 'dashboards/resilience-dashboard.json', desc: 'Grafana dashboard showing SLO burn' },
      { path: '.github/workflows/chaos-schedule.yml', desc: 'Weekly automated chaos runs' }
    ],
    cicdBadge: true,
    readmeArchSection: 'A sample three-tier application (frontend, API, PostgreSQL) is deployed to a local kind cluster. Litmus ChaosEngine runs experiments defined as Kubernetes CRDs. Prometheus scrapes metrics throughout. After each experiment, a Python script checks if the error rate SLO (< 0.1%) was maintained and writes results to experiments/results/. GitHub Actions runs the full suite weekly on a schedule.'
  },
  {
    id: 'p4',
    phase: 'Infrastructure as Code',
    phaseIdx: 3,
    repoName: 'aws-production-infra',
    headline: 'Production AWS infrastructure with Terraform modules',
    oneLiner: 'Modular Terraform code that provisions a production-grade AWS environment: VPC with public/private subnets, ECS Fargate cluster, RDS PostgreSQL, S3 + CloudFront, remote state in S3 with DynamoDB locking, and full tagging strategy.',
    NOT: 'terraform-learning or aws-terraform-tutorial',
    techStack: ['Terraform', 'AWS', 'VPC', 'ECS Fargate', 'RDS', 'S3', 'CloudFront', 'GitHub Actions'],
    topics: ['terraform', 'aws', 'infrastructure-as-code', 'iac', 'ecs', 'fargate', 'devops', 'cloud'],
    difficulty: 'intermediate',
    resumeLine: 'Provisioned production AWS infrastructure using modular Terraform (VPC, ECS Fargate, RDS, CloudFront) with remote state, DynamoDB locking, and automated plan/apply via GitHub Actions',
    interviewTalkingPoints: [
      'Why modules? — Each module (vpc, ecs-cluster, rds) is independently versioned and tested. The root module composes them. This means the VPC module can be used for 10 different environments without copy-pasting.',
      'What is state locking and why does it matter? — If two engineers run terraform apply simultaneously, they can corrupt the state file. DynamoDB locking ensures only one apply runs at a time. Without this, concurrent applies in a team will eventually cause an incident.',
      'How do you manage secrets? — No secrets in code, ever. Database passwords are generated by Terraform and stored in AWS SSM Parameter Store. The application retrieves them at runtime using IAM roles. The Terraform state is encrypted at rest.',
      'What would happen if someone manually changed an AWS resource? — Drift. terraform plan would show it. We run terraform plan on a schedule and alert if drift is detected. The correct response is to either update the code to match the intent, or use terraform apply to restore the declared state.'
    ],
    files: [
      { path: 'README.md', desc: 'Architecture decisions + cost estimate' },
      { path: 'modules/vpc/', desc: 'VPC, subnets, NAT, routing' },
      { path: 'modules/ecs-cluster/', desc: 'Fargate cluster + task definitions' },
      { path: 'modules/rds/', desc: 'PostgreSQL with encryption, backups' },
      { path: 'modules/cdn/', desc: 'S3 + CloudFront distribution' },
      { path: 'environments/staging/main.tf', desc: 'Staging environment root' },
      { path: 'environments/production/main.tf', desc: 'Production environment root' },
      { path: '.github/workflows/terraform.yml', desc: 'Plan on PR, apply on merge' },
      { path: 'tests/vpc_test.go', desc: 'Terratest for VPC module' }
    ],
    cicdBadge: true,
    readmeArchSection: 'Three-layer architecture: modules/ contains reusable, tested building blocks. environments/ composes modules for each environment with environment-specific variables. State is stored in S3 (server-side encrypted) with DynamoDB locking. GitHub Actions runs terraform fmt, terraform validate, and tflint on every PR. terraform plan output is posted as a PR comment. On merge to main, terraform apply runs automatically for staging. Production requires a manual approval gate.'
  },
  {
    id: 'p5',
    phase: 'GitOps & Pipelines',
    phaseIdx: 4,
    repoName: 'platform-gitops',
    headline: 'Production GitOps platform with ArgoCD app-of-apps',
    oneLiner: 'A complete GitOps platform using ArgoCD app-of-apps pattern, Sealed Secrets for encrypted secret management, automated image tag updates, and multi-environment promotion (dev → staging → production) all driven by Git.',
    NOT: 'gitops-learning or argocd-tutorial',
    techStack: ['ArgoCD', 'Kubernetes', 'Helm', 'Sealed Secrets', 'GitHub Actions', 'Kustomize'],
    topics: ['gitops', 'argocd', 'kubernetes', 'helm', 'sealed-secrets', 'platform-engineering', 'devops'],
    difficulty: 'advanced',
    resumeLine: 'Implemented production GitOps platform using ArgoCD app-of-apps pattern with multi-environment promotion, Sealed Secrets, and automated image update pipeline — achieving fully declarative cluster state',
    interviewTalkingPoints: [
      'What is the app-of-apps pattern? — The root ArgoCD Application watches a directory of other Application manifests. When you add a new application YAML to Git, ArgoCD automatically creates it. You never click in the ArgoCD UI to deploy something new.',
      'Why Sealed Secrets over Vault? — Sealed Secrets works entirely within Kubernetes using a cluster-key. The encrypted secret lives in Git — you can review it, version it, and roll it back. For a small team without an existing Vault setup, it is dramatically simpler. For large enterprises, Vault + External Secrets Operator is better.',
      'How do you promote between environments? — Image tag is updated in Git by CI after a successful staging deploy. A PR is opened targeting the production branch. After review, merging the PR triggers ArgoCD to sync production. The merge commit is the audit trail.',
      'What does self-healing mean in ArgoCD? — If someone runs kubectl apply manually and changes something, ArgoCD detects the drift within 3 minutes and reverts to the Git state. This enforces that Git is always the single source of truth — no snowflake configuration.'
    ],
    files: [
      { path: 'README.md', desc: 'Platform architecture + onboarding guide' },
      { path: 'apps/root-app.yaml', desc: 'ArgoCD root Application (app-of-apps)' },
      { path: 'apps/dev/', desc: 'Dev environment Application manifests' },
      { path: 'apps/staging/', desc: 'Staging environment Application manifests' },
      { path: 'apps/production/', desc: 'Production Application manifests' },
      { path: 'base/sealed-secrets/', desc: 'Encrypted secrets committed to Git' },
      { path: 'base/monitoring/', desc: 'Prometheus + Grafana via ArgoCD' },
      { path: '.github/workflows/image-update.yml', desc: 'Auto-bump image tags after CI' }
    ],
    cicdBadge: true,
    readmeArchSection: 'ArgoCD runs inside the cluster and watches this repository. The root Application (apps/root-app.yaml) points to apps/ directories. Any YAML file added there becomes a managed Application. Environments use Kustomize overlays on top of a shared base. Secrets are encrypted with Sealed Secrets (kubeseal) and committed as SealedSecret CRDs — the private key never leaves the cluster. Image updates are automated: CI pushes a new image, updates the tag in a feature branch, opens a PR to the target environment branch.'
  },
  {
    id: 'p6',
    phase: 'Advanced Kubernetes',
    phaseIdx: 5,
    repoName: 'k8s-production-hardening',
    headline: 'Production Kubernetes cluster hardening and security baseline',
    oneLiner: 'A complete Kubernetes security hardening suite: RBAC policies with least-privilege service accounts, OPA Gatekeeper policies blocking privileged containers, NetworkPolicies isolating namespaces, resource quotas, and a CIS benchmark compliance report.',
    NOT: 'kubernetes-learning or k8s-rbac-practice',
    techStack: ['Kubernetes', 'OPA Gatekeeper', 'NetworkPolicy', 'RBAC', 'kube-bench', 'Falco', 'Helm'],
    topics: ['kubernetes', 'security', 'rbac', 'opa', 'gatekeeper', 'network-policy', 'cis-benchmark', 'devsecops'],
    difficulty: 'advanced',
    resumeLine: 'Hardened Kubernetes cluster to CIS benchmark standards: implemented least-privilege RBAC, OPA Gatekeeper policies, namespace isolation with NetworkPolicies, and automated compliance scanning with kube-bench',
    interviewTalkingPoints: [
      'What is the principle of least privilege in Kubernetes? — Every ServiceAccount has only the RBAC permissions it needs and nothing more. The default ServiceAccount gets no permissions. Workloads that do not need API server access have automountServiceAccountToken: false.',
      'What is a NetworkPolicy and what does the default do? — By default, all pods can talk to all other pods. A NetworkPolicy is a firewall rule at the pod level. Our default is deny-all ingress and egress, then we add explicit allow rules for each required path.',
      'What does kube-bench test? — It runs the CIS Kubernetes Benchmark checks: API server flags, etcd security, kubelet configuration, RBAC settings. Our cluster scores 94/100. The 6 failures are documented with mitigation plans.',
      'What is Falco and why do you run it? — Falco is a runtime security tool that detects unexpected behaviour inside containers: a shell spawning inside a container that should not have one, a binary being executed that was not in the original image, unexpected network connections. It catches things that admission controllers miss because those run at deploy time, not runtime.'
    ],
    files: [
      { path: 'README.md', desc: 'Security decisions + CIS benchmark results' },
      { path: 'rbac/base-roles.yaml', desc: 'Minimal ClusterRoles for common patterns' },
      { path: 'rbac/service-accounts.yaml', desc: 'Per-workload ServiceAccounts' },
      { path: 'policies/no-privileged.yaml', desc: 'Gatekeeper: block privileged containers' },
      { path: 'policies/require-limits.yaml', desc: 'Gatekeeper: require resource limits' },
      { path: 'policies/no-latest-tag.yaml', desc: 'Gatekeeper: block :latest image tag' },
      { path: 'network-policies/default-deny.yaml', desc: 'Default deny-all per namespace' },
      { path: 'network-policies/allow-rules.yaml', desc: 'Explicit allow rules per service' },
      { path: 'falco/custom-rules.yaml', desc: 'Falco rules for our workloads' },
      { path: 'compliance/kube-bench-report.md', desc: 'CIS benchmark results + remediation' }
    ],
    cicdBadge: false,
    readmeArchSection: 'Applied in layers: 1) RBAC — every namespace gets a dedicated ServiceAccount with minimal permissions. 2) Admission control — OPA Gatekeeper enforces policies at deploy time (no :latest, no privileged, resource limits required). 3) Network — default-deny NetworkPolicies on every namespace, explicit allow rules for each required communication path. 4) Runtime — Falco monitors for unexpected behaviour and alerts to Slack. 5) Compliance — kube-bench runs weekly and results are committed to compliance/.'
  },
  {
    id: 'p7',
    phase: 'Modernization & Cloud-Native',
    phaseIdx: 6,
    repoName: 'monolith-to-microservices',
    headline: 'E-commerce monolith decomposition using strangler fig pattern',
    oneLiner: 'A documented, incremental migration of a fictional e-commerce monolith to microservices using the strangler fig pattern — with an API gateway routing traffic, independent service deployments, and an event bus for async communication.',
    NOT: 'microservices-tutorial or strangler-fig-learning',
    techStack: ['Docker', 'Kubernetes', 'NGINX', 'RabbitMQ', 'PostgreSQL', 'Node.js', 'Terraform'],
    topics: ['microservices', 'strangler-fig', 'system-design', 'kubernetes', 'event-driven', 'cloud-native', 'architecture'],
    difficulty: 'advanced',
    resumeLine: 'Designed and documented e-commerce monolith decomposition using strangler fig pattern — migrated 3 domains (auth, inventory, orders) to independent microservices with zero downtime using API gateway traffic routing',
    interviewTalkingPoints: [
      'What is the strangler fig pattern? — Named after the strangler fig tree that grows around and eventually replaces a host tree. You route traffic through a facade/gateway. New requests go to microservices. Old requests still hit the monolith. Over time you move more routes to microservices until the monolith handles nothing and you decommission it.',
      'How did you decide what to extract first? — We picked auth. It had clear boundaries, was the most independently scalable, and its failure mode was well-understood (return 401). We avoided extracting the order service first because it touched everything.',
      'How did you handle data consistency between services? — Each service owns its database. For operations that span services we used the Saga pattern with RabbitMQ: each step publishes an event, the next service listens and acts, if a step fails a compensating transaction reverses the previous step.',
      'What was the hardest part? — Distributed transactions. In a monolith, a database transaction is atomic. In microservices, you have to handle partial failures explicitly. The first time the inventory service updated stock but the order service failed, we had inconsistent data. That drove the Saga implementation.'
    ],
    files: [
      { path: 'README.md', desc: 'Migration plan + architecture decision log' },
      { path: 'docs/migration-phases.md', desc: 'Phase-by-phase strangler fig plan' },
      { path: 'gateway/nginx.conf', desc: 'API gateway routing rules' },
      { path: 'services/auth/', desc: 'Extracted auth microservice' },
      { path: 'services/inventory/', desc: 'Extracted inventory microservice' },
      { path: 'services/orders/', desc: 'Extracted orders microservice' },
      { path: 'monolith/', desc: 'Original monolith (being phased out)' },
      { path: 'infra/docker-compose.yml', desc: 'Local development environment' },
      { path: 'infra/k8s/', desc: 'Kubernetes manifests per service' },
      { path: 'docs/adr/', desc: 'Architecture Decision Records' }
    ],
    cicdBadge: true,
    readmeArchSection: 'NGINX acts as the strangler fig facade. Routing rules in nginx.conf determine which requests go to the legacy monolith vs new microservices. Each extracted service has its own PostgreSQL schema (initially a shared database, progressively split). RabbitMQ handles async events between services. ADRs (Architecture Decision Records) in docs/adr/ document every significant decision including the ones we reversed.'
  },
  {
    id: 'p8',
    phase: 'Connectivity & Networking',
    phaseIdx: 7,
    repoName: 'zero-trust-service-mesh',
    headline: 'Zero-trust networking with Istio ambient mode and eBPF',
    oneLiner: 'A production-ready zero-trust network architecture using Istio in ambient mode (no sidecars), enforcing mTLS between all services, traffic policy with circuit breakers, and Hubble for eBPF-powered network observability.',
    NOT: 'istio-tutorial or service-mesh-learning',
    techStack: ['Istio', 'Cilium', 'Hubble', 'eBPF', 'Kubernetes', 'Prometheus', 'Kiali'],
    topics: ['service-mesh', 'istio', 'zero-trust', 'ebpf', 'cilium', 'mtls', 'kubernetes', 'networking'],
    difficulty: 'advanced',
    resumeLine: 'Deployed zero-trust service mesh with Istio ambient mode and Cilium eBPF — enforcing mTLS between all services, traffic circuit breakers, and sub-millisecond network observability without sidecar overhead',
    interviewTalkingPoints: [
      'What is zero trust networking? — Never trust, always verify. Every service-to-service call is authenticated (mTLS — both sides prove identity) and authorised (AuthorizationPolicy — service A is only allowed to call these specific endpoints on service B). Default is deny everything.',
      'Why ambient mode over sidecars? — Sidecars add a proxy container to every pod. In a cluster with 200 pods, that is 200 extra containers consuming CPU and memory, and a sidecar that crashes takes the pod with it. Ambient mode uses a node-level ztunnel proxy — shared across all pods on the node, no injection needed.',
      'What is eBPF and why is it significant? — eBPF lets you run sandboxed programs inside the Linux kernel without modifying kernel source. Cilium uses eBPF to replace iptables for network routing — significantly faster, more observable, and more programmable. Hubble uses the same hooks to give you per-flow visibility without any application changes.',
      'What is a circuit breaker in a service mesh? — If service B is responding slowly, the circuit breaker opens and requests fail fast instead of queuing up and cascading failures. Istio implements this as an OutlierDetection policy. When 5 consecutive calls to a host fail, it is ejected from the load balancer pool for 30 seconds.'
    ],
    files: [
      { path: 'README.md', desc: 'Architecture + zero-trust design decisions' },
      { path: 'istio/ambient-install.sh', desc: 'Istio ambient mode setup script' },
      { path: 'istio/authpolicies/', desc: 'AuthorizationPolicy per service' },
      { path: 'istio/traffic/', desc: 'VirtualService + DestinationRule configs' },
      { path: 'cilium/network-policies/', desc: 'Cilium NetworkPolicy objects' },
      { path: 'hubble/dashboards/', desc: 'Grafana dashboards from Hubble metrics' },
      { path: 'demo-app/', desc: 'Sample app showing mTLS enforcement' },
      { path: 'docs/threat-model.md', desc: 'Network threat model' }
    ],
    cicdBadge: false,
    readmeArchSection: 'L4 security (mTLS, AuthorizationPolicy) is handled by Istio ztunnel running as a DaemonSet. L7 traffic management (retries, circuit breakers, canary) is handled by waypoint proxies deployed per-namespace. Cilium replaces kube-proxy for service routing using eBPF. Hubble UI provides real-time flow visualisation. All inter-service communication is denied by default — explicit AuthorizationPolicy rules allow only required paths.'
  },
  {
    id: 'p9',
    phase: 'Optimization & AI',
    phaseIdx: 8,
    repoName: 'kubernetes-cost-optimiser',
    headline: 'Kubernetes FinOps dashboard with automated right-sizing',
    oneLiner: 'An automated Kubernetes cost optimisation system using OpenCost and Goldilocks — identifies overprovisioned workloads, generates right-sizing recommendations, and shows cost per team/namespace with a Grafana dashboard.',
    NOT: 'kubecost-learning or kubernetes-cost-tutorial',
    techStack: ['OpenCost', 'Goldilocks', 'VPA', 'Prometheus', 'Grafana', 'Kubernetes', 'Python'],
    topics: ['finops', 'kubernetes', 'cost-optimisation', 'prometheus', 'grafana', 'openCost', 'devops'],
    difficulty: 'intermediate',
    resumeLine: 'Built Kubernetes FinOps dashboard using OpenCost and Goldilocks — identified 40% overprovisioned workloads and generated automated right-sizing recommendations, reducing cluster cost by an estimated ₹2.4L/year',
    interviewTalkingPoints: [
      'What is right-sizing? — Most teams set resource requests and limits once and never revisit them. Requests are often set too high (waste money) or too low (cause OOMKilled). Goldilocks runs VPA in recommendation mode — it watches actual usage and tells you what requests/limits should be based on real data.',
      'What is OpenCost and how does it differ from Kubecost? — Both allocate cluster cost to namespaces and workloads. OpenCost is the open-source CNCF project. Kubecost is a commercial product built on top of it. For a single cluster, OpenCost is free and sufficient.',
      'How do you show cost per team? — Kubernetes labels. Every Deployment has team: platform or team: backend labels. OpenCost reads these labels and aggregates cost per label value. This is why a consistent tagging strategy matters — without it, cost allocation is impossible.',
      'What was your biggest finding? — The staging environment was running at production scale 24/7. Nobody had configured it to scale down overnight. Adding a CronJob to scale down non-critical staging Deployments to 0 replicas from 10pm to 7am saved 58% of the staging cost.'
    ],
    files: [
      { path: 'README.md', desc: 'FinOps findings + cost reduction results' },
      { path: 'opencost/values.yaml', desc: 'OpenCost Helm values' },
      { path: 'goldilocks/namespace-labels.yaml', desc: 'Enable Goldilocks per namespace' },
      { path: 'dashboards/cost-by-team.json', desc: 'Grafana: cost per team/namespace' },
      { path: 'dashboards/rightsizing.json', desc: 'Grafana: over/under provisioned pods' },
      { path: 'scripts/scale-down-staging.py', desc: 'Overnight staging scale-down CronJob' },
      { path: 'reports/findings.md', desc: 'Cost analysis report with recommendations' }
    ],
    cicdBadge: false,
    readmeArchSection: 'OpenCost scrapes Prometheus metrics and cloud billing APIs to attribute cost to Kubernetes objects. Goldilocks deploys VPA in recommendation-only mode for each namespace and exposes a dashboard with suggested request/limit values. A Python script runs nightly, scrapes Goldilocks recommendations, and opens GitHub Issues for any workload more than 50% overprovisioned. Grafana dashboards show cost trends over 30/60/90 days per team.'
  }
];

export const ATS_KEYWORDS = [
  'Kubernetes','Docker','Terraform','ArgoCD','GitOps','CI/CD','GitHub Actions',
  'Helm','Prometheus','Grafana','AWS','Azure','GCP','Linux','Bash','Python',
  'Ansible','Jenkins','Istio','Nginx','PostgreSQL','Redis','Microservices',
  'DevSecOps','RBAC','IaC','EKS','ECS','Fargate','VPC','S3','RDS',
  'CloudWatch','Datadog','OpenTelemetry','Kafka','RabbitMQ','Vault','Consul'
];

export function checkATSScore(resumeText: string) {
  const text = resumeText.toUpperCase();
  const found = ATS_KEYWORDS.filter(kw => text.includes(kw.toUpperCase()));
  const missing = ATS_KEYWORDS.filter(kw => !text.includes(kw.toUpperCase()));
  return {
    score: Math.round((found.length / ATS_KEYWORDS.length) * 100),
    found,
    missing: missing.slice(0, 10)
  };
}

export function getCompletedProjects(phases: Record<number, number>) {
  return PROJECTS.filter(p => phases && phases[p.phaseIdx] >= 50);
}

export function generateREADME(project: Project, customDesc?: string) {
  const desc = customDesc || project.oneLiner;
  const badges = project.cicdBadge
    ? `![CI](https://github.com/YOUR-USERNAME/${project.repoName}/actions/workflows/test.yml/badge.svg) `
    : '';
  const topicBadges = project.techStack.map(t => '`' + t + '`').join(' ');

  return `# ${project.repoName}

${badges}![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

> ${desc}

## What This Is

${project.readmeArchSection}

## Tech Stack

${topicBadges}

## Architecture

\`\`\`
${generateAsciiArch(project)}
\`\`\`

## Project Structure

\`\`\`
${project.files.map(f => f.path.padEnd(42) + '# ' + f.desc).join('\n')}
\`\`\`

## Why These Decisions?

${project.interviewTalkingPoints.map(tp => {
  const parts = tp.split(' — ');
  return `### ${parts[0]}\n${parts[1] || tp}`;
}).join('\n\n')}

## Getting Started

\`\`\`bash
git clone https://github.com/YOUR-USERNAME/${project.repoName}
cd ${project.repoName}
# See docs/ for environment-specific setup
\`\`\`

## What I Would Do Differently

- Document what you would change with more time or a larger team
- This section shows engineers think critically about their own work

## Lessons Learned

- The hardest problems were operational, not technical
- Add specific lessons from building this project

---

*Built as part of a structured 90-day DevOps engineering programme. Every decision in this repo is documented because engineering is about choices, not just code.*
`;
}

export function generateAsciiArch(project: Project): string {
  const archs: Record<string, string> = {
    'p1': 'Bash Scripts\n    ├── provision-server.sh  →  Target Server\n    ├── health-check.sh     →  Monitoring Alert\n    ├── log-analyser.sh     →  Log Output\n    └── CI (bats-core)      →  Test Results',
    'p2': 'GitHub PR\n    └── Build Docker Image\n        └── Trivy Scan ──→ CRITICAL/HIGH? ──→ FAIL pipeline\n            └── PASS?\n                ├── Syft SBOM ──→ Build artifacts\n                └── Push to ECR ──→ :sha256-digest tag',
    'p3': 'GitHub Actions (weekly)\n    └── kind cluster\n        └── LitmusChaos ChaosEngine\n            ├── pod-delete experiment\n            ├── network-latency experiment\n            └── cpu-stress experiment\n                └── Prometheus SLO check\n                    └── Results committed to Git',
    'p4': 'GitHub PR  →  terraform fmt + validate + tflint\n               └── terraform plan (posted as PR comment)\n                   └── Merge to main\n                       ├── Staging: auto-apply\n                       └── Production: manual approval gate\n\nState: S3 (encrypted) + DynamoDB (locked)',
    'p5': 'Git Push\n    └── ArgoCD detects diff (every 3 min)\n        └── Sync to cluster\n            ├── dev namespace\n            ├── staging namespace\n            └── production namespace (requires PR approval)\n\nRoot App → watches apps/ → manages child Apps',
    'p6': 'kubectl apply ──→ API Server\n                    ├── Gatekeeper (admission)\n                    │   ├── no :latest tag? REJECT\n                    │   ├── resource limits? REJECT if missing\n                    │   └── privileged? REJECT\n                    └── RBAC check\n                        └── Scheduled: kube-bench + Falco',
    'p7': 'Client Request\n    └── NGINX Gateway (strangler fig)\n        ├── /auth/*      →  auth-service (microservice)\n        ├── /inventory/* →  inventory-service (microservice)\n        ├── /orders/*    →  orders-service (microservice)\n        └── /*           →  legacy-monolith (being phased out)',
    'p8': 'Pod A ──→ ztunnel (L4 mTLS) ──→ ztunnel ──→ Pod B\n              └── AuthorizationPolicy check\n                  └── ALLOW: explicit rules only\n\nCilium eBPF ──→ kernel-level routing (replaces iptables)\nHubble       ──→ per-flow visibility dashboard',
    'p9': 'Prometheus metrics\n    └── OpenCost\n        ├── Cost per namespace/team/pod\n        └── Grafana dashboards\n\nGoldilocks (VPA recommend mode)\n    └── Actual CPU/memory usage\n        └── Right-sizing recommendations\n            └── GitHub Issues for overprovisioned workloads'
  };
  return archs[project.id] || 'See docs/architecture.md for full diagram';
}
