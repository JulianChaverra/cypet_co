import React from 'react';

export default function Home() {
  return (
    <main>
      <div className="scanlines"></div>

      <div className="container-cypet">
        
        <header className="header-logo">
          <img src="/LogoDaju.png" alt="Daju Games" className="logo-img" />
          <p style={{ letterSpacing: '0.5em', fontSize: '10px', opacity: 0.5, marginTop: '20px' }}>
            DIGITAL ARCHITECTURES & JUVENILE UNIVERSES
          </p>
        </header>

        <div className="grid-layout">
          
          {/* COLUMNA TERMINAL */}
          <section className="terminal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.7, marginBottom: '20px', borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
              <span>NET_ADDRESS: CYPET.CO</span>
              <span>STATUS: BOOTING_OS</span>
            </div>

            <div className="content">
              <p> {'>'} Iniciando Grid Protocol... <span style={{ background: '#00e5ff', color: '#000', padding: '0 5px', fontWeight: 'bold', marginLeft: '10px' }}>OK</span></p>
              <p> {'>'} Rastreando Junior... <span className="text-pink">[DETECTADO]</span></p>

              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <h1 className="text-glow" style={{ fontSize: '3rem', margin: 0, color: '#fff' }}>CYBER-PETS</h1>
                <p style={{ letterSpacing: '0.3em', fontSize: '12px', fontWeight: 'bold' }}>RECOPILANDO DATOS</p>
              </div>

              <div style={{ padding: '15px', borderLeft: '2px solid #00e5ff', background: 'rgba(0,229,255,0.05)', fontStyle: 'italic', fontSize: '14px' }}>
                "El Grid no es solo código. Es un mundo. Y tu Junior es la clave para desbloquearlo."
              </div>

              <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid rgba(0,229,255,0.1)', paddingTop: '20px' }}>
                <p style={{ fontSize: '10px', marginBottom: '15px' }}>¿ENTRAR AL GRID?</p>
                <a href="#" style={{ border: '1px solid #00e5ff', padding: '10px 30px', color: '#00e5ff', textDecoration: 'none', fontSize: '12px' }}>
                  INSTAGRAM_FEED
                </a>
              </div>
            </div>
          </section>

          {/* COLUMNA SIDEBAR */}
          <aside className="sidebar-box">
            <h3 style={{ fontSize: '14px', borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: '10px' }}>ESTADO PROTOCOLO</h3>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '11px', lineHeight: '2.5' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>GEN_IA:</span> <span>STANDBY</span></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>SINC_ASINC:</span> <span>INACTIVE</span></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>CRASH_FATAL:</span> <span className="text-pink font-bold">ACTIVE</span></li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,229,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
                <span>KERNEL:</span> <span>v0.1.0</span>
              </li>
            </ul>
          </aside>

        </div>

        <footer style={{ width: '100%', marginTop: '50px', borderTop: '1px solid rgba(0,229,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', opacity: 0.4 }}>
          <span>user@daju-games:~$ _</span>
          <span>© 2026 DAJU GAMES</span>
        </footer>

      </div>
    </main>
  );
}