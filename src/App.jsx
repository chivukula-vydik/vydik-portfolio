import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, ArrowUpRight, ChevronRight, 
  Github, Linkedin, Mail, Brain, Network, Cpu,
  Sparkles, Code, Zap, Layers, FlaskConical,
  Users, Award, Music, Utensils, Globe
} from 'lucide-react';

// --- Custom Interactive Cursor ---
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (followerRef.current) {
        followerRef.current.animate({
          transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
        }, { duration: 500, fill: "forwards", easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <style jsx global>{`
        .cursor-dot { width: 8px; height: 8px; background: white; position: fixed; top: 0; left: 0; border-radius: 50%; z-index: 9999; pointer-events: none; margin-left: -4px; margin-top: -4px; mix-blend-mode: difference; }
        .cursor-follower { width: 40px; height: 40px; border: 1px solid rgba(255, 255, 255, 0.3); position: fixed; top: 0; left: 0; border-radius: 50%; z-index: 9998; pointer-events: none; margin-left: -20px; margin-top: -20px; mix-blend-mode: difference; }
        @media (min-width: 768px) { body, a, button { cursor: none; } }
      `}</style>
      <div ref={cursorRef} className="cursor-dot hidden md:block" />
      <div ref={followerRef} className="cursor-follower hidden md:block" />
    </>
  );
};

// --- Interactive Text ---
const InteractiveText = ({ text, baseColor = "white", className = "" }) => {
  const containerRef = useRef(null);
  const [spans, setSpans] = useState([]);
  const chars = useMemo(() => text.split(''), [text]);

  useEffect(() => {
    if (containerRef.current) {
      setSpans(Array.from(containerRef.current.children));
    }
  }, []);

  useEffect(() => {
    if (spans.length === 0) return;

    let animationFrameId;
    let mouseX = -10000;
    let mouseY = -10000;
    let charPositions = [];
    
    const updatePositions = () => {
      charPositions = spans.map(span => {
        const rect = span.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      });
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
        mouseX = -10000;
        mouseY = -10000;
        spans.forEach(span => {
            span.style.transform = 'translateY(0) scale(1)';
            span.style.color = baseColor;
            span.style.textShadow = 'none';
        });
    };

    const animate = () => {
      spans.forEach((span, i) => {
        const pos = charPositions[i];
        if (!pos) return;

        const dx = mouseX - pos.x;
        const dy = mouseY - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120; 

        if (dist < maxDist) {
          const intensity = Math.pow(1 - dist / maxDist, 2); 
          const lift = intensity * -25; 
          const scale = 1 + intensity * 0.3;
          
          span.style.transform = `translateY(${lift}px) scale(${scale})`;
          span.style.color = `rgba(192, 132, 252, ${0.6 + intensity * 0.4})`; 
          span.style.textShadow = `0 0 ${20 * intensity}px rgba(168, 85, 247, 0.8)`;
        } else {
          span.style.transform = 'translateY(0) scale(1)';
          span.style.color = baseColor;
          span.style.textShadow = 'none';
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
      cancelAnimationFrame(animationFrameId);
    };
  }, [spans, baseColor]);

  return (
    <div ref={containerRef} className={`inline-block ${className}`} style={{ whiteSpace: 'pre-wrap', cursor: 'default', padding: '10px 0' }}>
      {chars.map((char, i) => (
        <span 
          key={i} 
          className="inline-block will-change-transform relative"
          style={{ 
              transition: 'transform 0.2s ease-out, color 0.2s ease', 
              verticalAlign: 'top',
              color: baseColor 
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

// --- 3D Background ---
const GeometricBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Node {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.2; 
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 1.5 + 1; 
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw(ctx, mouseX, mouseY) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const lightRadius = 400;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (dist < lightRadius) {
          // Flashlight Effect
          const intensity = 1 - dist / lightRadius;
          ctx.fillStyle = `rgba(168, 85, 247, ${0.4 + intensity * 0.6})`; 
          ctx.shadowBlur = 15 * intensity;
          ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        } else {
          // DULL Ambient (Very Faint Grey/Purple - 8% Opacity)
          ctx.fillStyle = 'rgba(100, 100, 110, 0.08)'; 
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      }
    }

    const nodes = Array.from({ length: 90 }, () => new Node());

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // 1. Base Black Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      // 2. Very subtle ambient gradient
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      gradient.addColorStop(0, '#0a0a0a'); 
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 3. Flashlight Overlay
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      
      const flashlight = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 500);
      flashlight.addColorStop(0, 'rgba(88, 28, 135, 0.12)'); 
      flashlight.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = flashlight;
      ctx.fillRect(0, 0, width, height);

      nodes.forEach(node => node.update());

      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const mouseDist = Math.sqrt(
            Math.pow((nodes[i].x + nodes[j].x)/2 - mouseX, 2) + 
            Math.pow((nodes[i].y + nodes[j].y)/2 - mouseY, 2)
          );

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            
            // Very low base opacity (3%)
            let opacity = 0.03;
            let color = '80, 80, 90'; // Dark Grey lines
            
            if (mouseDist < 400) {
               opacity += (1 - mouseDist/400) * 0.6;
               color = '216, 180, 254'; // Bright Purple when touched
            }
            
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.stroke();
          }
        }
      }
      nodes.forEach(node => node.draw(ctx, mouseX, mouseY));
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: 'none' }} 
    />
  );
};

// --- Components ---
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-white/5 border border-white/10 text-purple-300 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default uppercase">
    <Brain size={12} className="text-purple-500" />
    {children}
  </span>
);

// FIXED STAT COMPONENT - Allows Wrapping
const Stat = ({ value, label }) => (
  <div className="flex flex-col items-start p-4 border-l border-white/10 hover:border-purple-500/50 transition-colors group h-full justify-center">
    <span className="text-3xl md:text-3xl lg:text-4xl font-bold text-white font-sans tracking-tight group-hover:text-purple-300 transition-colors leading-tight">
      {value}
    </span>
    <span className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-2 font-bold">{label}</span>
  </div>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-500 backdrop-blur-sm ${className}`}>
    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 group-hover:opacity-100 group-hover:h-[3px] transition-all duration-500 shadow-[0_0_10px_purple]" />
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10 p-8 h-full flex flex-col">{children}</div>
  </div>
);

const Feature = ({ title, desc, tags, icon: Icon = Activity }) => (
  <GlassCard className="h-full">
    <div className="mb-6 flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
          <Icon size={20} />
        </div>
        <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
      </div>
      <ArrowUpRight className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" size={20} />
    </div>
    <div className="text-slate-400 text-sm leading-relaxed mb-8 font-light flex-grow">
      {desc}
    </div>
    <div className="flex flex-wrap gap-2 mt-auto">
      {tags.map(t => (
        <span key={t} className="px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wide text-slate-300 border border-white/10 rounded-full bg-black/40 group-hover:border-purple-500/30 group-hover:text-purple-200 transition-colors">
          {t}
        </span>
      ))}
    </div>
  </GlassCard>
);

const LeadershipCard = ({ role, organization, desc, icon: Icon, status = "active" }) => (
  <GlassCard>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">{role}</h3>
          <p className="text-purple-400 text-xs font-mono uppercase tracking-wider mt-1">{organization}</p>
        </div>
      </div>
      {status === 'active' && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
    </div>
    <p className="text-slate-300 text-sm leading-relaxed font-light mt-2">
      {desc}
    </p>
  </GlassCard>
);

const TopBar = ({ activeSection, scrollToSection, scrolled }) => (
  <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-black/80 backdrop-blur-xl border-white/10 py-3' : 'bg-transparent border-transparent py-5'}`}>
    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <span className="text-xl font-bold tracking-tight flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-colors" onClick={() => scrollToSection('hero')}>
          VYDIK<span className="text-purple-500">.</span>AI
        </span>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
        <div className="relative flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-xl">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-purple-600 rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_20px_rgba(147,51,234,0.4)]`}
            style={{ 
              left: activeSection === 'research' ? '4px' : activeSection === 'projects' ? 'calc(33.33% + 2px)' : 'calc(66.66%)' 
            }}
          />
          
          {['research', 'projects', 'leadership'].map(section => (
            <button 
              key={section}
              onClick={() => scrollToSection(section)}
              className={`relative z-10 px-6 py-2 text-xs font-bold tracking-wide uppercase transition-colors duration-300 w-32 ${activeSection === section ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         <a href="https://github.com/chivukula-vydik" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><Github size={20} /></a>
         <a href="https://in.linkedin.com/in/vydik-chivukula-094135319" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
         <button onClick={() => window.open('mailto:cv23mab0f02@nitw.ac.in')} className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-purple-50 transition-colors flex items-center gap-2">Contact</button>
      </div>
    </div>
    <div className="md:hidden flex justify-center mt-4 pb-2 space-x-4 border-t border-white/5 pt-4">
       {['research', 'projects', 'leadership'].map(sect => (
         <button key={sect} onClick={() => scrollToSection(sect)} className={`text-xs font-bold uppercase tracking-wider ${activeSection === sect ? 'text-purple-400' : 'text-slate-500'}`}>{sect}</button>
       ))}
    </div>
  </nav>
);

export default function VydikPortfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('research');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const research = document.getElementById('research');
      const projects = document.getElementById('projects');
      const leadership = document.getElementById('leadership');
      if (leadership && window.scrollY >= leadership.offsetTop - 300) setActiveSection('leadership');
      else if (projects && window.scrollY >= projects.offsetTop - 300) setActiveSection('projects');
      else if (research && window.scrollY >= research.offsetTop - 300) setActiveSection('research');
      else setActiveSection('research');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      <CustomCursor />
      <GeometricBackground />
      <TopBar activeSection={activeSection} scrollToSection={scrollToSection} scrolled={scrolled} />

      <main className="relative z-10 pt-32 px-6 pb-20">
        
        {/* Hero Section */}
        <div id="hero" className="max-w-7xl mx-auto mb-32 animate-fade-in">
          <div className="max-w-5xl">
            <div className="flex gap-3 mb-6">
              <Badge>Deep Learning</Badge>
              <Badge>Generative AI</Badge>
            </div>
            
            <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight mb-8 cursor-default">
              <div className="text-white">
                <InteractiveText text="Architecting" baseColor="#ffffff" />
              </div>
              <div className="text-purple-400 pt-2"> 
                <div className="block">
                  <InteractiveText text="Scientific" baseColor="#c084fc" />
                </div>
                <div className="block">
                  <InteractiveText text="Intelligence" baseColor="#c084fc" />
                </div>
              </div>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light leading-relaxed mb-12 border-l-2 border-white/20 pl-6">
              <strong className="text-white font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">Vydik Chivukula</strong> is a <strong className="text-white font-bold">Deep Learning Researcher</strong> and <strong className="text-white font-bold">Community Leader</strong> at <strong className="text-white font-bold">NIT Warangal</strong> & <strong className="text-white font-bold">IISc</strong>, specializing in <strong className="text-purple-300 font-bold">Neural Operators</strong>, <strong className="text-purple-300 font-bold">LLMs</strong>, and <strong className="text-purple-300 font-bold">Scalable AI Architectures</strong>.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 border-t border-white/10 pt-12">
              <Stat value="NITW" label="Institution" />
              <Stat value="Deep Learning" label="Focus Area" />
              <Stat value="150+" label="LeetCode Solved" />
              <Stat value="IISc" label="Research Lab" />
              <Stat value="Gen Sec" label="Leadership" /> 
            </div>
          </div>
        </div>

        {/* --- RESEARCH SECTION --- */}
        <div id="research" className="max-w-7xl mx-auto mb-32 pt-10">
          <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
             <h2 className="text-4xl font-bold tracking-tight text-white">Scientific Research</h2>
             <span className="text-purple-400 font-mono text-xs tracking-widest uppercase hidden md:block font-bold">Flagship Works</span>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6 max-w-4xl mx-auto">
            <div className="glass-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-500 backdrop-blur-sm p-8 md:p-10 flex flex-col justify-between min-h-[360px]">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 group-hover:opacity-100 group-hover:h-[3px] transition-all duration-500 shadow-[0_0_10px_purple]" />
              <div className="absolute right-0 top-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-1.5 bg-purple-500/20 rounded text-purple-300"><Network size={20} /></div>
                   <span className="text-purple-300 font-mono text-xs uppercase tracking-wider font-bold">Flagship Research</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Neural Operator Architectures</h3>
                
                <div className="flex flex-wrap gap-3 mb-6">
                    <span 
                        onClick={() => window.open('https://flamelab-iisc.github.io/', '_blank')}
                        className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono uppercase tracking-wide font-bold flex items-center gap-2 cursor-pointer hover:bg-purple-500/20 hover:text-purple-200 transition-all"
                    >
                        <FlaskConical size={12} /> FLAME Lab, IISc
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 text-xs font-mono uppercase tracking-wide">
                        Dept. of CDS
                    </span>
                </div>

                <p className="text-slate-300 text-base md:text-lg font-light max-w-xl leading-relaxed">
                  Conducting research on <strong className="text-white font-bold">Neural Operators</strong> and <strong className="text-white font-bold">Scientific Machine Learning</strong> for CFD applications. 
                  Implementing <strong className="text-white font-bold">Physics-Informed Neural Networks (PINNs)</strong> architectures for PDE-based simulations, collaborating with researchers at the intersection of AI and physics.
                </p>
              </div>
              
              <div className="mt-12 flex flex-wrap gap-3">
                {['Neural Networks', 'Optimization', 'PyTorch', 'AI Research', 'CFD'].map(t => (
                  <span key={t} className="px-4 py-1.5 text-xs font-bold text-white bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- PROJECTS SECTION --- */}
        <div id="projects" className="max-w-7xl mx-auto mb-32 pt-10">
          <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
             <h2 className="text-4xl font-bold tracking-tight text-white">Engineering Projects</h2>
             <span className="text-purple-400 font-mono text-xs tracking-widest uppercase hidden md:block font-bold">Deployed Artifacts</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Feature 
              title="Stockfischer Chess AI"
              desc={<>A neural-network-enhanced chess engine. Implements <strong className="text-white font-bold">Reinforcement Learning</strong> concepts, Alpha-Beta pruning, and custom evaluation heuristics trained on <strong className="text-white font-bold">30k+ grandmaster games</strong>.</>}
              tags={['Reinforcement Learning', 'Neural Networks', 'Python']}
              icon={Cpu}
            />
            <Feature 
              title="Generative Legal Assistant"
              desc={<>An <strong className="text-white font-bold">LLM-powered</strong> application capable of interpreting Indian Penal Code queries. Built using <strong className="text-white font-bold">Transformer architectures</strong> to deliver context-aware natural language responses.</>}
              tags={['GenAI', 'LLMs', 'Transformers', 'NLP']}
              icon={Sparkles}
            />
            <Feature 
              title="Digit Recognition System"
              desc={<>Optimized <strong className="text-white font-bold">Deep CNN architecture</strong> for handwritten digit classification. Achieved state-of-the-art accuracy on MNIST using advanced <strong className="text-white font-bold">regularization</strong> and dropout layers.</>}
              tags={['TensorFlow', 'Computer Vision', 'Pattern Rec']}
              icon={Code}
            />
            <Feature 
                  title="Flow Prediction CNN"
                  desc={<>Leveraging <strong className="text-white font-bold">Convolutional Neural Networks (CNNs)</strong> to predict 2D fluid velocity fields. Implements <strong className="text-white font-bold">custom loss functions</strong> to ensure physical consistency in model output.</>}
                  tags={['Computer Vision', 'CNN', 'Deep Learning', 'SciML']}
                  icon={FlaskConical}
                />
          </div>
        </div>

        {/* --- LEADERSHIP SECTION --- */}
        <div id="leadership" className="max-w-7xl mx-auto mb-24 pt-10">
          <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
             <h2 className="text-4xl font-bold tracking-tight text-white">Community Leadership</h2>
             <span className="text-purple-400 font-mono text-xs tracking-widest uppercase hidden md:block font-bold">Impact</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <LeadershipCard 
               role="General Secretary" 
               organization="Chess Committee"
               desc={<>Spearheaded initiatives leading to a <strong className="text-emerald-400 font-bold">300% boost</strong> in participation. Organized 10+ major tournaments and managed team logistics.</>}
               icon={Award}
               status="active"
             />
             <LeadershipCard 
               role="Coordinator" 
               organization="Alumni Relations"
               desc={<>Hosted networking events connecting <strong className="text-emerald-400 font-bold">200+ participants</strong> with global alumni to foster industry connections.</>}
               icon={Users}
               status="active"
             />
             <LeadershipCard 
               role="Executive Member" 
               organization="Int'l Student Activities Club"
               desc={<>Supported <strong className="text-emerald-400 font-bold">100+ students</strong> and organized 4+ cultural programs to foster diversity and inclusion.</>}
               icon={Globe}
               status="active"
             />
             <LeadershipCard 
               role="Executive Member" 
               organization="Music Club"
               desc={<>Managed logistics for cultural fests attended by <strong className="text-emerald-400 font-bold">500+ students</strong>. Organized weekly jam sessions.</>}
               icon={Music}
               status="active"
             />
             <LeadershipCard 
               role="Class Representative" 
               organization="Mathematics Dept"
               desc={<>Represented <strong className="text-slate-200 font-bold">30+ students</strong>, resolving academic & administrative issues effectively during the 1st year.</>}
               icon={Users}
               status="inactive"
             />
          </div>
        </div>

        {/* Skills Ticker */}
        <div className="max-w-7xl mx-auto mt-24 border-t border-white/10 py-12">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Zap size={18} className="text-purple-400" /> Technical Arsenal
          </h3>
          <div className="flex flex-wrap gap-3 items-center justify-start">
            {['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Transformers', 'Scikit-learn', 'C++', 'SQL', 'Google Cloud', 'Git', 'Pandas', 'NumPy', 'Reinforcement Learning'].map(s => (
              <span key={s} className="px-5 py-2 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:text-purple-300 hover:border-purple-500/30 cursor-default transition-all shadow-lg shadow-black/20">{s}</span>
            ))}
          </div>
        </div>

        <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-sm font-mono">
           <p>© 2025 VYDIK CHIVUKULA. ALL RIGHTS RESERVED.</p>
        </footer>
      </main>
    </div>
  );
}
