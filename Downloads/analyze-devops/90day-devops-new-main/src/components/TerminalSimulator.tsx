import React, { useState, useRef, useEffect } from 'react';
import { Lab } from '../data/labs';
import { showToast } from './Toast';

interface TerminalSimulatorProps {
  dk: string;
  lab: Lab;
  isLabDone: (exId: string) => boolean;
  markLabDone: (exId: string) => void;
  onExercisePassed: () => void;
}

interface TerminalLine {
  text: string;
  isError?: boolean;
  isSuccess?: boolean;
  isCommand?: boolean;
  cmdText?: string;
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  dk,
  lab,
  isLabDone,
  markLabDone,
  onExercisePassed,
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'gk@devops-lab:~$ _  // Type a command below', isCommand: false }
  ]);
  const [inpValue, setInpValue] = useState<string>('');
  
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory(prev => [trimmed, ...prev]);
    setHistIdx(-1);

    const result = simulateCommand(trimmed);
    
    // Add command and output lines
    setLines(prev => [
      ...prev,
      { text: `gk@devops-lab:~$`, cmdText: trimmed, isCommand: true },
      ...(result.output ? [{ text: result.output, isError: result.isError }] : [])
    ]);

    // Check exercises
    lab.exercises.forEach(ex => {
      if (!isLabDone(ex.id)) {
        const passed = ex.check(result.output, trimmed);
        if (passed) {
          markLabDone(ex.id);
          // Show success inside terminal after brief delay
          setTimeout(() => {
            setLines(prev => [
              ...prev,
              { text: ex.ok, isSuccess: true }
            ]);
            showToast(`✓ Exercise passed! +${ex.xp} XP`, 'rgba(0,217,160,.12)');
            onExercisePassed();
          }, 300);
        }
      }
    });

    setInpValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inpValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        const nextIdx = histIdx + 1;
        setHistIdx(nextIdx);
        setInpValue(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        const nextIdx = histIdx - 1;
        setHistIdx(nextIdx);
        setInpValue(history[nextIdx]);
      } else {
        setHistIdx(-1);
        setInpValue('');
      }
    }
  };

  // Mapped Linux command outputs
  const simulateCommand = (cmd: string): { output: string; isError: boolean } => {
    const c = cmd.trim();
    const parts = c.split(/\s+/);
    const base = parts[0];

    if (base === 'pwd') return { output: '/home/gk', isError: false };
    
    if (base === 'ls') {
      if (c.includes('/etc')) {
        return {
          output: 'total 1.2M\ndrwxr-xr-x 1 root root 4096 Jan 1 00:00 .\ndrwxr-xr-x 1 root root 4096 Jan 1 00:00 ..\n-rw-r--r-- 1 root root 2.2K Jan 1 00:00 passwd\n-rw-r--r-- 1 root root 1.5K Jan 1 00:00 hosts\n-rw-r--r-- 1 root root 400  Jan 1 00:00 hostname\n-rw-r----- 1 root shadow 1.2K Jan 1 00:00 shadow',
          isError: false
        };
      }
      return {
        output: 'total 24\ndrwxr-xr-x 1 gk gk 4096 Jan 1 00:00 .\ndrwxr-xr-x 1 root root 4096 Jan 1 00:00 ..\n-rw-r--r-- 1 gk gk   33 Jan 1 00:00 notes.txt\ndrwxr-xr-x 1 gk gk 4096 Jan 1 00:00 devops-lab',
        isError: false
      };
    }

    if (base === 'mkdir') return { output: '', isError: false };
    if (base === 'touch') return { output: '', isError: false };
    
    if (base === 'echo') {
      const match = c.match(/echo\s+"?([^">]+)"?\s*(?:>.*)?$/);
      if (c.includes('>')) return { output: '', isError: false };
      return { output: match ? match[1].replace(/"/g, '') : '', isError: false };
    }

    if (base === 'cat') {
      if (c.includes('/etc/passwd')) {
        return {
          output: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\ngk:x:1000:1000:GK DevOps:/home/gk:/bin/bash',
          isError: false
        };
      }
      if (c.includes('notes.txt')) return { output: 'DevOps is culture', isError: false };
      return { output: 'cat: file not found', isError: true };
    }

    if (base === 'id') return { output: 'uid=1000(gk) gid=1000(gk) groups=1000(gk),4(adm),24(cdrom),27(sudo),46(plugdev)', isError: false };
    if (base === 'chmod') return { output: '', isError: false };
    
    if (base === 'find') {
      if (c.includes('-user root')) {
        return { output: '/etc/passwd\n/etc/shadow\n/etc/hosts\n/etc/hostname\n/etc/resolv.conf', isError: false };
      }
      return { output: '/home/gk/notes.txt\n/home/gk/devops-lab', isError: false };
    }

    if (base === 'grep') {
      if (c.includes('/etc/passwd') && c.includes('root')) {
        return { output: 'root:x:0:0:root:/root:/bin/bash\noperator:x:11:0:operator:/root:/sbin/nologin', isError: false };
      }
      if (c.includes('-c') && c.includes('bash')) return { output: '2', isError: false };
      if (c.includes('bash')) return { output: '/bin/bash\n/usr/bin/bash', isError: false };
      return { output: '', isError: false };
    }

    if (base === 'awk') {
      if (c.includes("'{print $1}'") || c.includes('print $1')) {
        return { output: 'root\ndaemon\nbin\ngk', isError: false };
      }
      if (c.includes('NR>=3') || c.includes('NR>=')) {
        return { output: 'bin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync', isError: false };
      }
      return { output: 'root\ndaemon\nbin\ngk', isError: false };
    }

    if (base === 'sed') {
      return {
        output: 'root:x:0:0:root:/root:/bin/sh\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ngk:x:1000:1000:GK DevOps:/home/gk:/bin/sh',
        isError: false
      };
    }

    if (base === 'ps') {
      return {
        output: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  18508  2844 ?        Ss   00:00   0:01 /sbin/init\nroot       100  0.0  0.0  14432  1524 ?        Ss   00:00   0:00 sshd\ngk        1001  0.1  0.2  23456  4096 pts/0    Ss   00:00   0:00 bash',
        isError: false
      };
    }

    if (base === 'df') return { output: 'Filesystem      Size  Used Avail Use% Mounted on\noverlay          50G  8.2G   39G  18% /\ntmpfs            64M     0   64M   0% /dev\n/dev/sda1        50G  8.2G   39G  18% /', isError: false };
    
    if (base === 'free') {
      return {
        output: '              total        used        free      shared  buff/cache   available\nMem:           3906        1234        1456         128        1215        2340\nSwap:          2048           0        2048',
        isError: false
      };
    }

    if (base === 'pgrep') return { output: '1001 bash\n1042 bash', isError: false };

    if (base === 'ip') {
      if (c.includes('addr')) {
        return {
          output: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0',
          isError: false
        };
      }
      if (c.includes('route')) {
        return { output: 'default via 172.17.0.1 dev eth0\n172.17.0.0/16 dev eth0 proto kernel scope link src 172.17.0.2', isError: false };
      }
    }

    if (base === 'ss' || base === 'netstat') {
      return {
        output: 'State  Recv-Q Send-Q Local Address:Port  Peer Address:Port\nLISTEN 0      128    0.0.0.0:22         0.0.0.0:*\nLISTEN 0      128    0.0.0.0:80         0.0.0.0:*\nLISTEN 0      5      127.0.0.1:5432    0.0.0.0:*',
        isError: false
      };
    }

    if (base === 'ping') {
      return {
        output: 'PING google.com (142.250.182.46) 56(84) bytes of data.\n64 bytes from 142.250.182.46: icmp_seq=1 ttl=116 time=12.3 ms\n64 bytes from 142.250.182.46: icmp_seq=2 ttl=116 time=11.8 ms\n64 bytes from 142.250.182.46: icmp_seq=3 ttl=116 time=12.1 ms\n--- google.com ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss',
        isError: false
      };
    }

    if (base === 'nslookup' || base === 'dig') {
      return { output: 'Server: 8.8.8.8\nAddress: 8.8.8.8#53\nNon-authoritative answer:\nName: kubernetes.io\nAddress: 147.75.40.148', isError: false };
    }

    if (base === 'git') {
      if (c.includes('init')) return { output: 'Initialized empty Git repository in /home/gk/myapp/.git/', isError: false };
      if (c.includes('config')) return { output: '', isError: false };
      if (c.includes('add')) return { output: '', isError: false };
      if (c.includes('commit')) return { output: '[main (root-commit) a1b2c3d] initial commit\n 1 file changed, 1 insertion(+)\n create mode 100644 README.md', isError: false };
      if (c.includes('log')) return { output: 'a1b2c3d initial commit', isError: false };
      if (c.includes('status')) return { output: 'On branch main\nnothing to commit, working tree clean', isError: false };
      return { output: 'usage: git [command]', isError: false };
    }

    if (base === 'docker') {
      if (c.includes('pull')) return { output: 'Using default tag: latest\nlatest: Pulling from library/nginx\nPull complete\nStatus: Downloaded newer image for nginx:alpine', isError: false };
      if (c.includes('run')) return { output: 'a3f2c1d4e5b6c7d8e9f0a1b2c3d4e5f6', isError: false };
      if (c.includes('ps')) return { output: 'CONTAINER ID   IMAGE          COMMAND                  CREATED        STATUS        PORTS                  NAMES\na3f2c1d4e5b6   nginx:alpine   "/docker-entrypoint…"   2 seconds ago  Up 2 seconds  0.0.0.0:8080->80/tcp   my-nginx', isError: false };
      if (c.includes('images')) return { output: 'REPOSITORY   TAG       IMAGE ID       CREATED       SIZE\nnginx        alpine    abc123def456   2 weeks ago   23.4MB\nmyapp        v1        def456abc123   1 minute ago  142MB', isError: false };
      if (c.includes('stop')) return { output: 'my-nginx', isError: false };
      if (c.includes('rm')) return { output: 'my-nginx', isError: false };
      if (c.includes('logs')) return { output: '172.17.0.1 - - [01/Jan/2024:00:00:01 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.68.0"', isError: false };
      if (c.includes('history')) return { output: 'IMAGE          CREATED BY                                      SIZE\nabc123def456   CMD ["nginx" "-g" "daemon off;"]                 0B\n               EXPOSE map[80/tcp:{}]                            0B\n               COPY file:xxx in /                              23.4MB', isError: false };
      if (c.includes('build')) return { output: '[+] Building 12.3s\n => [1/5] FROM node:18-alpine\n => [2/5] WORKDIR /app\n => [3/5] COPY package*.json ./\n => [4/5] RUN npm install\n => [5/5] COPY . .\nSuccessfully built def456abc123\nSuccessfully tagged myapp:v1', isError: false };
      return { output: 'docker: command options', isError: false };
    }

    if (c.startsWith('docker compose') || c.startsWith('docker-compose')) {
      if (c.includes('up')) return { output: '[+] Running 2/2\n ✔ Container devops-lab-web-1    Started\n ✔ Container devops-lab-cache-1  Started', isError: false };
      if (c.includes('ps')) return { output: 'NAME                    IMAGE          STATUS         PORTS\ndevops-lab-web-1        nginx:alpine   Up 2 seconds   0.0.0.0:8080->80/tcp\ndevops-lab-cache-1      redis:alpine   Up 2 seconds   6379/tcp', isError: false };
      if (c.includes('logs')) return { output: 'web  | 172.17.0.1 - - [01/Jan/2024:00:00:01] "GET / HTTP/1.1" 200', isError: false };
      if (c.includes('down')) return { output: '[+] Running 3/3\n ✔ Container devops-lab-web-1    Removed\n ✔ Container devops-lab-cache-1  Removed\n ✔ Network devops-lab_default    Removed', isError: false };
      return { output: '', isError: false };
    }

    if (c.startsWith('for ') || c.startsWith('while ') || c.startsWith('if ')) {
      if (c.includes('{1..5}')) return { output: '1\n2\n3\n4\n5', isError: false };
      if (c.includes('{1..3}')) return { output: '1\n2\n3', isError: false };
      if (c.includes('tick')) return { output: 'tick\ntick\ntick', isError: false };
      return { output: '', isError: false };
    }

    if (c.includes('=') && !c.includes('==') && !c.includes('if')) {
      if (c.includes('echo $')) {
        const varMatch = c.match(/([A-Z_]+)="([^"]+)"/);
        if (varMatch) return { output: varMatch[2], isError: false };
      }
      return { output: '', isError: false };
    }

    if (c.includes('echo $?')) return { output: '0', isError: false };
    if (base === 'echo') return { output: parts.slice(1).join(' ').replace(/['"]/g, ''), isError: false };
    if (c.includes('[') && c.includes('-f') && c.includes('echo')) return { output: 'exists', isError: false };
    
    if (base === 'trivy') {
      return {
        output: '2024-01-01T00:00:00.000Z INFO  Detected OS: alpine 3.18\n2024-01-01T00:00:00.000Z INFO  Number of language-specific files: 1\n\nTotal: 0 (CRITICAL: 0, HIGH: 0, MEDIUM: 0)',
        isError: false
      };
    }

    return {
      output: `${base}: command not found\nHint: try the suggested command above each exercise`,
      isError: true
    };
  };

  return (
    <div className="terminal-wrap" style={{ background: '#0d1117', border: '1px solid #222d42', borderRadius: 'var(--r12)', overflow: 'hidden', marginBottom: '12px', fontFamily: 'var(--mono)' }}>
      <div style={{ background: '#1c2436', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #222d42' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }}></span>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }}></span>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }}></span>
        <span style={{ fontSize: '11px', color: '#7d8fa8', marginLeft: '8px' }}>gk@devops-lab: ~</span>
        <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#4a5568' }}>simulated terminal</span>
      </div>

      <div
        ref={outputRef}
        style={{ padding: '12px 14px', minHeight: '120px', maxHeight: '280px', overflowY: 'auto', fontSize: '12px', lineHeight: '1.8', color: '#e6edf3' }}
      >
        {lines.map((line, idx) => (
          <div key={idx}>
            {line.isCommand ? (
              <div>
                <span style={{ color: '#00d9a0' }}>gk@devops-lab</span>
                <span style={{ color: '#7d8fa8' }}>:~$</span>{' '}
                <span style={{ color: '#e6edf3' }}>{line.cmdText}</span>
              </div>
            ) : line.isSuccess ? (
              <div style={{ color: '#00d9a0', background: 'rgba(0,217,160,.07)', padding: '4px 8px', borderRadius: '4px', margin: '4px 0', fontSize: '11px' }}>
                {line.text}
              </div>
            ) : (
              <div style={{ color: line.isError ? '#ff5f5f' : '#a8b8cc', whiteSpace: 'pre-wrap' }}>
                {line.text}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', borderTop: '1px solid #222d42', background: '#0d1117' }}>
        <span style={{ color: '#00d9a0', fontSize: '12px', marginRight: '8px', whiteSpace: 'nowrap' }}>gk@devops-lab:~$</span>
        <input
          type="text"
          value={inpValue}
          onChange={(e) => setInpValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--mono)', fontSize: '12px', color: '#e6edf3', caretColor: '#00d9a0' }}
          placeholder="type command and press Enter…"
        />
        <button
          onClick={() => executeCommand(inpValue)}
          style={{ background: 'rgba(0,217,160,.1)', border: '1px solid rgba(0,217,160,.3)', color: '#00d9a0', fontFamily: 'var(--mono)', fontSize: '10px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '8px' }}
        >
          Run ↵
        </button>
      </div>
    </div>
  );
};
export default TerminalSimulator;
