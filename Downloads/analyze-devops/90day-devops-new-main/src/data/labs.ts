export interface Exercise {
  id: string;
  prompt: string;
  hint: string;
  check: (output: string, command: string) => boolean;
  ok: string;
  xp: number;
}

export interface Lab {
  day: string;
  title: string;
  intro: string;
  type: 'terminal' | 'docker';
  killercoda?: string;
  playdocker?: string;
  exercises: Exercise[];
}

export const LABS: Record<string, Lab> = {
  'd1': {
    day: 'Day 1', title: 'Linux Basics — Navigation & Files',
    intro: 'Master the Linux filesystem. Every DevOps engineer lives in the terminal.',
    type: 'terminal',
    exercises: [
      { id:'d1e1', prompt:'Print the current working directory', hint:'pwd', check: (o) => o.trim().startsWith('/'), ok:'✓ pwd works — you know where you are.', xp:10 },
      { id:'d1e2', prompt:'List files in /etc showing hidden files and sizes', hint:'ls -lah /etc', check: (o) => o.includes('total') && o.includes('root'), ok:'✓ ls -lah — you can read directory listings.', xp:10 },
      { id:'d1e3', prompt:'Create a directory called devops-lab', hint:'mkdir devops-lab', check: (_o, cmd) => cmd.includes('mkdir') && cmd.includes('devops-lab'), ok:'✓ Directory created.', xp:10 },
      { id:'d1e4', prompt:'Create a file called notes.txt with the text "DevOps is culture"', hint:'echo "DevOps is culture" > notes.txt', check: (_o, cmd) => cmd.includes('echo') && cmd.includes('notes.txt'), ok:'✓ File created with redirect.', xp:15 },
      { id:'d1e5', prompt:'Print the contents of notes.txt', hint:'cat notes.txt', check: (o) => o.toLowerCase().includes('devops'), ok:'✓ cat — reading file contents.', xp:10 },
    ]
  },
  'd2': {
    day: 'Day 2', title: 'File Permissions & Users',
    intro: 'Linux permissions are tested in every DevOps interview. Get them solid.',
    type: 'terminal',
    exercises: [
      { id:'d2e1', prompt:'Show permissions of /etc/passwd', hint:'ls -l /etc/passwd', check: (o) => o.includes('passwd') && !!o.match(/-r.+root/), ok:'✓ You can read permission strings.', xp:10 },
      { id:'d2e2', prompt:'Create a script file deploy.sh and make it executable', hint:'touch deploy.sh && chmod +x deploy.sh', check: (_o, cmd) => cmd.includes('chmod') && cmd.includes('+x'), ok:'✓ chmod +x — essential for scripts.', xp:15 },
      { id:'d2e3', prompt:'Show your current user and groups', hint:'id', check: (o) => o.includes('uid=') && o.includes('gid='), ok:'✓ id — know your identity.', xp:10 },
      { id:'d2e4', prompt:'Set deploy.sh permissions to 755 using numeric mode', hint:'chmod 755 deploy.sh', check: (_o, cmd) => cmd.includes('chmod') && cmd.includes('755'), ok:'✓ Numeric chmod — owner rwx, group rx, world rx.', xp:15 },
      { id:'d2e5', prompt:'Find all files in /etc owned by root, show first 5 results', hint:'find /etc -user root 2>/dev/null | head -5', check: (o) => o.includes('/etc/') && o.split('\n').filter(Boolean).length >= 1, ok:'✓ find with -user flag — powerful for auditing.', xp:20 },
    ]
  },
  'd3': {
    day: 'Day 3', title: 'grep, sed & awk — Text Processing',
    intro: 'grep, sed, awk are the Swiss army knife of DevOps log analysis and config management.',
    type: 'terminal',
    exercises: [
      { id:'d3e1', prompt:'Search for the word "root" in /etc/passwd', hint:'grep "root" /etc/passwd', check: (o) => o.includes('root'), ok:'✓ grep — find patterns in files.', xp:10 },
      { id:'d3e2', prompt:'Count how many lines contain "bash" in /etc/passwd', hint:'grep -c "bash" /etc/passwd', check: (o) => !isNaN(Number(o.trim())) && parseInt(o.trim()) >= 0, ok:'✓ grep -c — count matching lines.', xp:15 },
      { id:'d3e3', prompt:'Print only the username (first field) from /etc/passwd using awk', hint:"awk -F: '{print $1}' /etc/passwd", check: (o) => o.includes('root') && !o.includes(':'), ok:'✓ awk field splitting — extract columns from structured text.', xp:20 },
      { id:'d3e4', prompt:'Replace "bash" with "sh" in /etc/passwd output (do not write to file)', hint:"sed 's/bash/sh/g' /etc/passwd", check: (_o, cmd) => cmd.includes('sed') && cmd.includes('s/bash/sh'), ok:'✓ sed substitution — critical for config templating.', xp:20 },
      { id:'d3e5', prompt:'Print lines 3 to 7 of /etc/passwd using awk', hint:"awk 'NR>=3 && NR<=7' /etc/passwd", check: (o) => o.split('\n').filter(Boolean).length >= 2 && o.split('\n').filter(Boolean).length <= 6, ok:'✓ awk NR — line-range filtering.', xp:25 },
    ]
  },
  'd4': {
    day: 'Day 4', title: 'Bash Scripting Fundamentals',
    intro: 'Bash scripts automate everything. Variables, loops, conditionals — nail these.',
    type: 'terminal',
    exercises: [
      { id:'d4e1', prompt:'Create a variable NAME="GK" and print it with echo', hint:'NAME="GK" && echo $NAME', check: (o) => o.trim() === 'GK', ok:'✓ Variables — no spaces around =.', xp:10 },
      { id:'d4e2', prompt:'Print numbers 1 to 5 using a for loop', hint:'for i in {1..5}; do echo $i; done', check: (o) => o.includes('1') && o.includes('5') && o.split('\n').filter(Boolean).length >= 5, ok:'✓ for loop with brace expansion.', xp:20 },
      { id:'d4e3', prompt:'Check if /etc/passwd exists and print "exists" or "missing"', hint:'[ -f /etc/passwd ] && echo "exists" || echo "missing"', check: (o) => o.trim() === 'exists', ok:'✓ File test operator -f.', xp:20 },
      { id:'d4e4', prompt:'Print the exit code of the last command after running ls /tmp', hint:'ls /tmp; echo $?', check: (o) => o.includes('0'), ok:'✓ $? exit codes — 0=success, non-zero=error.', xp:15 },
      { id:'d4e5', prompt:'Use a while loop to print "tick" 3 times', hint:'i=0; while [ $i -lt 3 ]; do echo "tick"; i=$((i+1)); done', check: (o) => (o.match(/tick/g) || []).length === 3, ok:'✓ while loop with counter.', xp:25 },
    ]
  },
  'd5': {
    day: 'Day 5', title: 'Processes & System Monitoring',
    intro: 'DevOps engineers debug live systems. Process management and monitoring are daily tools.',
    type: 'terminal',
    exercises: [
      { id:'d5e1', prompt:'Show all running processes with full details', hint:'ps aux', check: (o) => o.includes('PID') && o.includes('root'), ok:'✓ ps aux — full process list.', xp:10 },
      { id:'d5e2', prompt:'Show disk usage of the root filesystem in human-readable format', hint:'df -h /', check: (o) => o.includes('G') || o.includes('M') && o.includes('/'), ok:'✓ df -h — disk usage. Check this before deployments.', xp:10 },
      { id:'d5e3', prompt:'Show memory usage in megabytes', hint:'free -m', check: (o) => o.includes('Mem:') && o.includes('total'), ok:'✓ free -m — memory is the #1 cause of OOMKilled pods.', xp:10 },
      { id:'d5e4', prompt:'Find all processes containing "bash" in their name', hint:'pgrep -a bash || ps aux | grep bash', check: (o) => o.toLowerCase().includes('bash'), ok:'✓ pgrep — find processes by name.', xp:15 },
      { id:'d5e5', prompt:'Show the top 5 CPU-consuming processes', hint:'ps aux --sort=-%cpu | head -6', check: (o) => o.includes('PID') || o.includes('%CPU'), ok:'✓ ps sorted by CPU — triage a runaway process fast.', xp:20 },
    ]
  },
  'd6': {
    day: 'Day 6', title: 'Networking Fundamentals',
    intro: 'Kubernetes is 90% networking. Start with the basics before you touch clusters.',
    type: 'terminal',
    exercises: [
      { id:'d6e1', prompt:'Show all network interfaces and their IP addresses', hint:'ip addr show || ifconfig', check: (o) => o.includes('inet') || o.includes('lo'), ok:'✓ ip addr — replaces ifconfig in modern Linux.', xp:10 },
      { id:'d6e2', prompt:'Check if google.com is reachable (3 pings)', hint:'ping -c 3 google.com', check: (_o, cmd) => cmd.includes('ping') && (cmd.includes('-c') || cmd.includes('google')), ok:'✓ ping — basic connectivity test.', xp:10 },
      { id:'d6e3', prompt:'Show the routing table', hint:'ip route show || route -n', check: (o) => o.includes('default') || o.includes('0.0.0.0'), ok:'✓ Routing table — how packets get to their destination.', xp:15 },
      { id:'d6e4', prompt:'Show all listening TCP ports', hint:'ss -tlnp || netstat -tlnp', check: (o) => o.includes('LISTEN') || o.includes('State'), ok:'✓ ss -tlnp — know what ports are open on your system.', xp:20 },
      { id:'d6e5', prompt:'Do a DNS lookup for kubernetes.io', hint:'nslookup kubernetes.io || dig kubernetes.io', check: (o) => o.includes('kubernetes.io') && (o.includes('Address') || o.includes('answer')), ok:'✓ DNS lookup — CoreDNS in K8s works the same way.', xp:15 },
    ]
  },
  'd7': {
    day: 'Day 7', title: 'Git Fundamentals',
    intro: 'Git is the foundation of GitOps. Every command here maps to a real DevOps workflow.',
    type: 'terminal',
    exercises: [
      { id:'d7e1', prompt:'Initialise a new git repo in a folder called myapp', hint:'mkdir myapp && cd myapp && git init', check: (o) => o.includes('Initialized') || o.includes('initialised'), ok:'✓ git init — every project starts here.', xp:10 },
      { id:'d7e2', prompt:'Set your git username to "GK DevOps" globally', hint:'git config --global user.name "GK DevOps"', check: (_o, cmd) => cmd.includes('git config') && cmd.includes('user.name'), ok:'✓ git config — commits need an identity.', xp:10 },
      { id:'d7e3', prompt:'Create README.md with "# My DevOps Journey" and stage it', hint:'echo "# My DevOps Journey" > README.md && git add README.md', check: (_o, cmd) => cmd.includes('git add'), ok:'✓ git add — staging area is the key concept.', xp:15 },
      { id:'d7e4', prompt:'Commit the staged file with message "initial commit"', hint:'git commit -m "initial commit"', check: (o) => o.includes('initial commit') || o.includes('master') || o.includes('main'), ok:'✓ git commit — snapshot saved.', xp:15 },
      { id:'d7e5', prompt:'Show the full git log with one line per commit', hint:'git log --oneline', check: (o) => o.includes('initial commit') || !!o.match(/[a-f0-9]{7}/), ok:'✓ git log --oneline — clean history view.', xp:10 },
    ]
  },
  'd8': {
    day: 'Day 8', title: 'Docker Basics',
    intro: 'Containers are the unit of deployment. Build, run, inspect — do it now.',
    type: 'docker',
    killercoda: 'https://killercoda.com/playgrounds/scenario/ubuntu',
    playdocker: 'https://labs.play-with-docker.com/',
    exercises: [
      { id:'d8e1', prompt:'Pull the nginx:alpine image', hint:'docker pull nginx:alpine', check: (o) => o.includes('Pull complete') || o.includes('alpine') || o.includes('Status'), ok:'✓ docker pull — image downloaded.', xp:10 },
      { id:'d8e2', prompt:'Run nginx:alpine in detached mode on port 8080', hint:'docker run -d -p 8080:80 --name my-nginx nginx:alpine', check: (_o, cmd) => cmd.includes('docker run') && cmd.includes('-d') && cmd.includes('nginx'), ok:'✓ docker run -d -p — detached with port mapping.', xp:20 },
      { id:'d8e3', prompt:'List all running containers', hint:'docker ps', check: (o) => o.includes('CONTAINER') || o.includes('nginx'), ok:'✓ docker ps — know what is running.', xp:10 },
      { id:'d8e4', prompt:'Show logs of your nginx container', hint:'docker logs my-nginx', check: (_o, cmd) => cmd.includes('docker logs'), ok:'✓ docker logs — first thing to check when a container fails.', xp:15 },
      { id:'d8e5', prompt:'Stop and remove the nginx container', hint:'docker stop my-nginx && docker rm my-nginx', check: (_o, cmd) => cmd.includes('docker stop') && cmd.includes('docker rm'), ok:'✓ Stop + remove — clean up after yourself.', xp:15 },
    ]
  },
  'd9': {
    day:'Day 9', title:'Dockerfile & Image Building', type:'docker',
    killercoda:'https://killercoda.com/playgrounds/scenario/ubuntu',
    playdocker:'https://labs.play-with-docker.com/',
    intro:'Writing good Dockerfiles is a core DevOps skill. Multi-stage, small images, no secrets.',
    exercises:[
      {id:'d9e1',prompt:'Write a Dockerfile for a Node.js app using node:18-alpine, copy package.json, run npm install, copy source, expose 3000',hint:'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node","index.js"]',check:(_o, cmd)=>cmd.includes('FROM')&&cmd.includes('node'),ok:'✓ Multi-layer Dockerfile structure.',xp:30},
      {id:'d9e2',prompt:'Build the image and tag it as myapp:v1',hint:'docker build -t myapp:v1 .',check:(_o, cmd)=>cmd.includes('docker build')&&cmd.includes('-t'),ok:'✓ docker build -t.',xp:20},
      {id:'d9e3',prompt:'Show all local images',hint:'docker images',check:(o)=>o.includes('REPOSITORY')||o.includes('IMAGE ID'),ok:'✓ docker images.',xp:10},
      {id:'d9e4',prompt:'Inspect the myapp:v1 image layers',hint:'docker history myapp:v1',check:(_o, cmd)=>cmd.includes('docker history'),ok:'✓ docker history — see every layer.',xp:15},
      {id:'d9e5',prompt:'Scan the image for vulnerabilities using trivy (if available) or show image size',hint:'trivy image myapp:v1 || docker images myapp:v1',check:(o)=>o.includes('myapp')||o.includes('Total'),ok:'✓ Always scan images before pushing.',xp:25},
    ]
  },
  'd10': {
    day:'Day 10',title:'Docker Compose',type:'docker',
    killercoda:'https://killercoda.com/playgrounds/scenario/ubuntu',
    playdocker:'https://labs.play-with-docker.com/',
    intro:'docker compose is how you run multi-container apps locally before moving to Kubernetes.',
    exercises:[
      {id:'d10e1',prompt:'Write a docker-compose.yml with nginx and redis services',hint:'version: "3"\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - "8080:80"\n  cache:\n    image: redis:alpine',check:(_o, cmd)=>cmd.includes('nginx')&&cmd.includes('redis'),ok:'✓ Multi-service compose file.',xp:25},
      {id:'d10e2',prompt:'Start both services in detached mode',hint:'docker compose up -d',check:(_o, cmd)=>cmd.includes('docker compose')&&cmd.includes('up'),ok:'✓ docker compose up -d.',xp:15},
      {id:'d10e3',prompt:'Check the status of compose services',hint:'docker compose ps',check:(o)=>o.includes('running')||o.includes('Up')||o.includes('NAME'),ok:'✓ docker compose ps.',xp:10},
      {id:'d10e4',prompt:'View logs of the web service only',hint:'docker compose logs web',check:(_o, cmd)=>cmd.includes('docker compose logs'),ok:'✓ Per-service log filtering.',xp:10},
      {id:'d10e5',prompt:'Stop and remove all containers and volumes',hint:'docker compose down -v',check:(_o, cmd)=>cmd.includes('docker compose down'),ok:'✓ -v removes named volumes too.',xp:10},
    ]
  },
};

export interface CertDomain {
  name: string;
  weight: number;
  days: number[];
}

export interface Cert {
  name: string;
  logo: string;
  color: string;
  link: string;
  passmark: number;
  domains: CertDomain[];
}

export const CERT_MAP: Record<string, Cert> = {
  cka: {
    name: 'CKA — Certified Kubernetes Administrator',
    logo: '☸',
    color: '#326CE5',
    link: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
    passmark: 66,
    domains: [
      { name:'Cluster Architecture, Installation & Configuration', weight:25, days:[4,6,10,25,28,43,44,63] },
      { name:'Workloads & Scheduling', weight:15, days:[10,22,25,47] },
      { name:'Services & Networking', weight:20, days:[6,14,39,43,63,68,69,80] },
      { name:'Storage', weight:10, days:[23,25,53] },
      { name:'Troubleshooting', weight:30, days:[12,17,80,84,86] },
    ]
  },
  terraform: {
    name: 'HashiCorp Terraform Associate',
    logo: '⬛',
    color: '#7B42BC',
    link: 'https://developer.hashicorp.com/certifications/infrastructure-automation',
    passmark: 70,
    domains: [
      { name:'IaC Concepts', weight:8, days:[8,21,24,55,57] },
      { name:'Terraform Purpose', weight:8, days:[8,40,72] },
      { name:'Basics', weight:24, days:[21,26,40,55,59] },
      { name:'Configuration Language', weight:22, days:[21,28,40,64,85] },
      { name:'Modules', weight:10, days:[40,64,85] },
      { name:'Workflows', weight:10, days:[59,73,78] },
      { name:'State Management', weight:18, days:[8,40,54,59] },
    ]
  },
  awssaa: {
    name: 'AWS Solutions Architect Associate',
    logo: '☁',
    color: '#FF9900',
    link: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    passmark: 72,
    domains: [
      { name:'Design Secure Architecture', weight:30, days:[9,12,14,35,42,46] },
      { name:'Design Resilient Architecture', weight:26, days:[17,44,46,60,61] },
      { name:'Design High-Performing Architecture', weight:24, days:[46,54,61,83,87] },
      { name:'Design Cost-Optimised Architecture', weight:20, days:[54,61,83] },
    ]
  }
};
