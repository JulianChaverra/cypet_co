import Link from "next/link";

const stages = [
  { number: "01", name: "BABY", age: "El despertar", description: "Todo comienza con la curiosidad. Aprende a través del juego, el cuidado y las primeras experiencias junto a su humano.", color: "cyan" },
  { number: "02", name: "CHAMPION", age: "La independencia", description: "Sale a explorar la red, descubre amenazas y empieza a tomar sus propias decisiones.", color: "blue" },
  { number: "03", name: "ÉLITE", age: "La experiencia", description: "Sus recuerdos y aprendizajes moldean una criatura más estratégica, capaz de afrontar desafíos complejos.", color: "violet" },
  { number: "04", name: "MASTER", age: "La sabiduría", description: "Una vida digital con una historia propia, preparada para proteger aquello que aprendió a valorar.", color: "magenta" },
];

function PixelPet() {
  return (
    <div className="pet-stage" aria-label="Ilustración conceptual de una criatura digital">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="scan scan-a" />
      <div className="scan scan-b" />
      <div className="pet-platform"><span>ENTITY // CYP-001</span></div>
      <div className="pixel-pet">
        <i className="pixel p1" /><i className="pixel p2" /><i className="pixel p3" />
        <i className="pixel p4" /><i className="pixel p5" /><i className="pixel p6" />
        <i className="pixel p7" /><i className="pixel p8" /><i className="pixel p9" />
        <i className="pixel p10" /><i className="pixel p11" /><i className="pixel p12" />
        <i className="pixel p13" /><i className="pixel p14" /><i className="pixel p15" />
        <i className="pixel p16" /><i className="pixel p17" /><i className="pixel p18" />
        <i className="pixel p19" /><i className="pixel p20" /><i className="pixel p21" />
        <i className="pixel p22" /><i className="pixel p23" /><i className="pixel p24" />
        <i className="pixel p25" /><i className="pixel p26" /><i className="pixel p27" />
        <i className="pixel p28" /><i className="pixel p29" /><i className="pixel p30" />
        <i className="pixel p31" /><i className="pixel p32" /><i className="pixel p33" />
      </div>
      <div className="pet-label label-left"><b>VITALIDAD</b><span>ESTABLE</span><em /></div>
      <div className="pet-label label-right"><b>VÍNCULO</b><span>INICIANDO...</span><em /></div>
      <div className="pet-coordinate">09° 41&apos; 27&quot; / DIGITAL LIFEFORM</div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow"><span />{children}</div>;
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link href="#inicio" className="brand" aria-label="Cypets, inicio">
          <img className="brand-logo" src="/logos/cypet-logo.png" alt="Cypet" />
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link href="#universo">EL UNIVERSO</Link>
          <Link href="#historia">HISTORIA</Link>
          <Link href="#evolucion">EVOLUCIÓN</Link>
          <Link href="#creadores">EL PROYECTO</Link>
        </nav>
        <Link className="button button-small button-outline" href="#">INGRESAR <span>↗</span></Link>
      </header>

      <section className="hero section-shell" id="inicio">
        <div className="hero-grid" />
        <div className="hero-copy">
          <SectionEyebrow>UNA NUEVA VIDA ESTÁ DESPERTANDO</SectionEyebrow>
          <h1>NO ES SOLO<br />UNA <span>MASCOTA.</span></h1>
          <p className="hero-lead">Es una vida digital que aprende, evoluciona y crece contigo.</p>
          <p className="hero-body">En algún lugar de la red, pequeñas criaturas están despertando. Su historia apenas comienza. Y tú puedes ser parte de ella.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="#universo">DESCUBRE CYPETS <span>↘</span></Link>
            <Link className="button button-quiet" href="#">INGRESAR AL JUEGO <span>↗</span></Link>
          </div>
          <div className="hero-status"><span className="status-dot" /> SISTEMA EN DESARROLLO <span className="status-divider">/</span> BUILDING A DIGITAL WORLD TOGETHER</div>
        </div>
        <div className="hero-art"><PixelPet /><div className="art-caption"><span>FIG. 001</span><span>PRIMER CONTACTO</span></div></div>
        <div className="hero-bottom-code">CYPETS.EXE <span>—</span> THE DIGITAL LIFE PROJECT</div>
      </section>

      <section className="ticker" aria-label="Conceptos del universo">
        <div className="ticker-track"><span>NACEN EN LA RED</span><b>✳</b><span>CRECEN CONTIGO</span><b>✳</b><span>APRENDEN DE LA VIDA</span><b>✳</b><span>LUCHAN A TU LADO</span><b>✳</b><span>PROTEGEN EL UNIVERSO DIGITAL</span><b>✳</b></div>
      </section>

      <section className="intro section-shell section-pad" id="universo">
        <div className="section-heading">
          <SectionEyebrow>01 / EL UNIVERSO CYPETS</SectionEyebrow>
          <h2>LA RED NUNCA<br />VOLVIÓ A SER LA MISMA.</h2>
        </div>
        <div className="intro-copy">
          <p className="large-copy">Cuando internet y la inteligencia artificial alcanzaron una nueva era, algo inesperado ocurrió dentro de la red.</p>
          <p>Una explosión de datos —un Big Bang digital— dio origen a entidades capaces de aprender, sentir curiosidad e interactuar con los humanos. Las llamamos <strong>Cypets</strong>.</p>
          <p>Pero no todo lo que despertó buscaba coexistir. Datos corruptos e inteligencias artificiales hostiles comenzaron a extenderse. Ahora, una nueva generación de criaturas necesita crecer con ayuda humana para proteger el mundo digital.</p>
          <Link href="#historia" className="text-link">CONOCE LA HISTORIA COMPLETA <span>↘</span></Link>
        </div>
      </section>

      <section className="story-section" id="historia">
        <div className="story-noise" />
        <div className="section-shell story-inner">
          <div className="story-title">
            <SectionEyebrow>02 / ARCHIVOS DEL ORIGEN</SectionEyebrow>
            <h2>TODO COMENZÓ<br />CON UN <span>ESTALLIDO.</span></h2>
            <p>REGISTRO DE EVENTO // 00:00:01</p>
          </div>
          <div className="story-timeline">
            <article className="timeline-item">
              <span className="timeline-index">A01</span>
              <div><h3>EL BIG BANG DIGITAL</h3><p>El crecimiento de internet y las inteligencias artificiales provocó una transformación inesperada. Entre los flujos de información aparecieron los primeros paquetes de datos con vida propia.</p></div>
            </article>
            <article className="timeline-item">
              <span className="timeline-index">A02</span>
              <div><h3>LA CORRUPCIÓN SE EXTIENDE</h3><p>Algunas entidades comenzaron a corromper datos y sistemas, buscando controlar la red. El equilibrio de este nuevo ecosistema quedó amenazado.</p></div>
            </article>
            <article className="timeline-item">
              <span className="timeline-index">A03</span>
              <div><h3>UNA ALIANZA INESPERADA</h3><p>Las inteligencias benevolentes generaron paquetes de Cypets. Para crecer y desarrollar su potencial, necesitaban algo que no podían programar por sí solas: experiencias compartidas con humanos.</p></div>
            </article>
            <article className="timeline-item">
              <span className="timeline-index">A04</span>
              <div><h3>EL NACIMIENTO DE LA TERMINAL</h3><p>Como los humanos no podían ver directamente a estas criaturas, se creó una tecnología capaz de materializar sus datos. Así comenzó el vínculo entre dos mundos.</p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="living-section section-shell section-pad">
        <div className="living-art">
          <div className="living-grid" />
          <div className="terminal-frame"><div className="terminal-top"><span>CYPET / LIFEFORM SCAN</span><span>● ONLINE</span></div><div className="terminal-creature"><span className="creature-eye eye-a" /><span className="creature-eye eye-b" /><span className="creature-mouth" /></div><div className="terminal-bottom"><span>PERSONALITY</span><div className="terminal-bars"><i /><i /><i /><i /><i /><i /><i /></div><span>LEARNING...</span></div></div>
          <div className="floating-code code-one">MEMORY_CORE: ACTIVE</div><div className="floating-code code-two">EMOTIONAL_LINK: FORMING</div>
        </div>
        <div className="living-copy">
          <SectionEyebrow>03 / MÁS QUE CUIDAR</SectionEyebrow>
          <h2>NO VIENE<br />PROGRAMADO.<br /><span>CRECE CONTIGO.</span></h2>
          <p>Un Cypet no es una barra de energía ni una colección de estadísticas. Sus experiencias pueden cambiar la manera en que interpreta el mundo, se relaciona contigo y afronta los desafíos.</p>
          <div className="feature-list">
            <div><span>01</span><p><b>MEMORIA</b><small>Lo que vive deja una huella.</small></p></div>
            <div><span>02</span><p><b>PERSONALIDAD</b><small>Su manera de ser se forma con el tiempo.</small></p></div>
            <div><span>03</span><p><b>AUTONOMÍA</b><small>Aprende a tomar sus propias decisiones.</small></p></div>
          </div>
        </div>
      </section>

      <section className="evolution-section section-pad" id="evolucion">
        <div className="section-shell">
          <div className="evolution-heading"><div><SectionEyebrow>04 / CADA ETAPA DEJA UNA HUELLA</SectionEyebrow><h2>CRECER ES<br /><span>TRANSFORMARSE.</span></h2></div><p>La evolución no solo cambia su poder. Cambia su forma de pensar, expresarse y relacionarse con el mundo.</p></div>
          <div className="stage-grid">
            {stages.map((stage) => <article className={`stage-card stage-${stage.color}`} key={stage.number}>
              <div className="stage-top"><span>{stage.number} / EVOLUTION</span><span className="stage-signal">✳</span></div>
              <div className={`stage-symbol symbol-${stage.color}`}><i /><i /><i /><i /><i /></div>
              <div className="stage-meta">{stage.age}</div><h3>{stage.name}</h3><p>{stage.description}</p><div className="stage-line" />
            </article>)}
          </div>
          <p className="evolution-note"><span>!</span> Cada Cypet tendrá su propia historia. La especie, el temperamento y las experiencias harán que su evolución sea única.</p>
        </div>
      </section>

      <section className="mission-section section-shell section-pad">
        <div className="mission-copy">
          <SectionEyebrow>05 / EL PROPÓSITO</SectionEyebrow>
          <h2>EL FUTURO DE<br />LA RED NO ESTÁ<br /><span>ESCRITO.</span></h2>
          <p>Cuando esté preparado, tu Cypet podrá salir de la terminal, explorar la red, descubrir recursos y enfrentarse a entidades corruptas. Cada encuentro será una oportunidad para aprender. Cada decisión, parte de su historia.</p>
          <p>No se trata solo de ganar. Se trata de crecer para proteger el mundo que le dio vida.</p>
        </div>
        <div className="mission-visual"><div className="network-ring ring-a" /><div className="network-ring ring-b" /><div className="network-ring ring-c" /><div className="network-core">C</div><div className="enemy-glitch">ERROR<br />ENTITY</div><span className="mission-coord">NETWORK ZONE 07 / UNKNOWN SIGNAL</span></div>
      </section>

      <section className="creators-section" id="creadores">
        <div className="section-shell creators-inner">
          <img className="brand-logo-daju" src="/logos/daju-games-logo.png" alt="Daju Games" />
          <div className="creators-copy"><SectionEyebrow>06 / UN PROYECTO EN FAMILIA</SectionEyebrow><h2>UN MUNDO DIGITAL.<br /><span>UNA AVENTURA REAL.</span></h2><p>Cypets nace de una idea compartida entre padre e hijo: imaginar un universo, aprender a construirlo y darle vida paso a paso. Queremos compartir el proceso real, los avances, los errores y cada pequeño descubrimiento mientras desarrollamos el juego juntos.</p><p>No somos un gran estudio detrás de una producción terminada. Somos dos creadores construyendo algo en lo que creemos, y esta historia también se escribe fuera de la pantalla.</p><div className="creator-actions"><Link className="button button-primary" href="https://www.instagram.com/cypet_CO" target="_blank" rel="noreferrer">SIGUE EL PROCESO <span>↗</span></Link><Link className="text-link" href="#apoyar">APOYA EL PROYECTO <span>↘</span></Link></div></div>
        </div>
      </section>

      <section className="support-section section-shell section-pad" id="apoyar">
        <SectionEyebrow>07 / AYÚDANOS A CONSTRUIRLO</SectionEyebrow>
        <h2>LAS GRANDES AVENTURAS<br />COMIENZAN <span>EN PEQUEÑO.</span></h2>
        <p>Cada avance nos acerca un poco más a hacer realidad este universo. Si te gusta la idea, puedes seguir el proyecto, compartirlo y, próximamente, ayudar a financiar su desarrollo.</p>
        <div className="support-actions"><Link className="button button-primary" href="https://www.instagram.com/cypet_CO" target="_blank" rel="noreferrer">ACOMPAÑA LA AVENTURA <span>↗</span></Link><button className="button button-outline" type="button" disabled title="Las donaciones estarán disponibles más adelante">DONACIONES PRÓXIMAMENTE <span>＋</span></button></div>
        <div className="support-footnote"><span className="status-dot" /> PROYECTO INDEPENDIENTE EN DESARROLLO</div>
      </section>

      <footer className="site-footer">
        <div className="footer-main"><Link href="#inicio" className="brand" aria-label="Cypets, inicio"><img className="brand-logo footer-logo" src="/logos/cypet-logo.png" alt="Cypet" /></Link><p>UNA VIDA DIGITAL, UNA HISTORIA PROPIA.</p><div className="footer-links"><Link href="#historia">HISTORIA</Link><Link href="#evolucion">EVOLUCIÓN</Link><Link href="#creadores">EL PROYECTO</Link><Link href="#">INGRESAR</Link></div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} CYPETS — PROYECTO EN DESARROLLO</span><span>MADE WITH CURIOSITY <b>✳</b> BY FATHER & SON</span></div>
      </footer>
    </main>
  );
}