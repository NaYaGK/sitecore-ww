import React from 'react';
import { CERT_MAP, Cert } from '../data/labs';
import { PHASES } from '../data/phases';
import { UseAppStateReturnType } from '../hooks/useAppState';

interface CertsViewProps {
  appState: UseAppStateReturnType;
}

export const CertsView: React.FC<CertsViewProps> = ({ appState }) => {
  const { dayPct } = appState;

  const hexToRgbStr = (hex: string) => {
    if (!hex || hex.length < 7) return '0,0,0';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };

  const getCertReadiness = (certKey: string) => {
    const cert = CERT_MAP[certKey];
    if (!cert) return 0;
    let totalWeight = 0;
    let coveredWeight = 0;

    cert.domains.forEach(dom => {
      totalWeight += dom.weight;
      const coveredDays = dom.days.filter(dayNum => {
        let found = false;
        PHASES.forEach((ph, pi) => {
          ph.data.forEach((d, di) => {
            const dn = parseInt((d.day || '').replace('Day ', ''));
            if (dn === dayNum && dayPct(pi, di) >= 50) found = true;
          });
        });
        return found;
      });
      coveredWeight += dom.weight * (coveredDays.length / Math.max(dom.days.length, 1));
    });

    return Math.round((coveredWeight / Math.max(totalWeight, 1)) * 100);
  };

  return (
    <div className="wrap">
      <div style={{ marginBottom: '16px' }}>
        <div className="eyebrow">Cert readiness</div>
        <h2 className="page-title">Cert Tracker</h2>
        <p className="page-sub">CKA · Terraform Associate · AWS SAA</p>
      </div>

      {Object.keys(CERT_MAP).map(certKey => {
        const cert = CERT_MAP[certKey];
        const readiness = getCertReadiness(certKey);
        const isReady = readiness >= cert.passmark;

        return (
          <div
            key={certKey}
            style={{
              background: 'var(--s1)',
              border: `1px solid ${isReady ? 'rgba(0,217,160,.4)' : 'var(--border)'}`,
              borderRadius: 'var(--r16)',
              padding: '20px',
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `rgba(${hexToRgbStr(cert.color)},.1)`,
                  border: `1px solid ${cert.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0
                }}
              >
                {cert.logo}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{cert.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)', marginTop: '3px' }}>
                  Pass mark: {cert.passmark}% · Your readiness:{' '}
                  <span style={{ color: isReady ? 'var(--green)' : readiness >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                    {readiness}%
                  </span>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {isReady ? (
                  <div style={{ background: 'rgba(0,217,160,.1)', border: '1px solid var(--green)', color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--r8)', textAlign: 'center' }}>
                    ✓ READY
                    <br />
                    to sit exam
                  </div>
                ) : (
                  <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--sub)', fontFamily: 'var(--mono)', fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--r8)', textAlign: 'center' }}>
                    {cert.passmark - readiness}% gap
                    <br />
                    keep going
                  </div>
                )}
              </div>
            </div>

            {/* Domain bars */}
            <div>
              {cert.domains.map((dom, domIdx) => {
                const coveredDays = dom.days.filter(dayNum => {
                  let found = false;
                  PHASES.forEach((ph, pi) => {
                    ph.data.forEach((d, di) => {
                      const dn = parseInt((d.day || '').replace('Day ', ''));
                      if (dn === dayNum && dayPct(pi, di) >= 50) found = true;
                    });
                  });
                  return found;
                });
                const domPct = dom.days.length ? Math.round((coveredDays.length / dom.days.length) * 100) : 0;

                return (
                  <div key={domIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
                    <span style={{ fontSize: '12px', flex: 1, color: 'var(--sub)' }}>{dom.name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', flexShrink: 0 }}>
                      {dom.weight}%
                    </span>
                    <div style={{ width: '120px', height: '5px', background: 'var(--s3)', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', background: cert.color, borderRadius: '3px', width: `${domPct}%`, transition: 'width .5s' }}></div>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', width: '30px', textAlign: 'right', flexShrink: 0 }}>
                      {domPct}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Big progress bar + register link */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)', marginBottom: '5px' }}>
                  <span>Overall readiness</span>
                  <span style={{ color: cert.color }}>{readiness}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--s3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: cert.color, borderRadius: '4px', width: `${readiness}%`, transition: 'width .6s ease' }}></div>
                </div>
              </div>
              <a
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--mono)', fontSize: '11px', color: cert.color, textDecoration: 'none', padding: '7px 13px', border: `1px solid ${cert.color}`, borderRadius: 'var(--r8)', background: `rgba(${hexToRgbStr(cert.color)},.06)`, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Register →
              </a>
            </div>
          </div>
        );
      })}

      {/* Tips */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r12)', padding: '14px 16px', fontSize: '13px', color: 'var(--sub)', lineHeight: '1.8' }}>
        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}>📋 GK's Cert Strategy</strong>
        Start with <strong style={{ color: 'var(--text)' }}>Terraform Associate</strong> around Day 45 (cheapest, fastest ROI on resume). Then <strong style={{ color: 'var(--text)' }}>CKA</strong> after Day 70 — it's the gold standard for DevOps/Platform roles. AWS SAA if targeting cloud-first companies.
      </div>
    </div>
  );
};
