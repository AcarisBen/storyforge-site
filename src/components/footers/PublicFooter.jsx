import { ShieldCheck } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export default function PublicFooter({
  onNavigateToLogin,
  onNavigateToRegister,
  onOpenPrivacy,
  onOpenTerms,
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <a href="#top" className="flex items-center gap-2 text-xl font-bold text-white">
              <img
                src="/StoryForgeLOGO2.png"
                alt="Logo do StoryForge"
                className="h-10 w-10 object-contain"
              />
              <span>StoryForge</span>
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Estruture narrativas, desenvolva seus universos e refine seus textos com revisão
              gramatical inteligente.
            </p>
            
          </div>

          

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Plataforma
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button type="button" onClick={onOpenPrivacy} className="text-inherit transition-colors hover:text-indigo-400">
                  Privacidade
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenTerms} className="text-inherit transition-colors hover:text-indigo-400">
                  Termos de Uso
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/AcarisBen/storyforge-site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-inherit transition-colors hover:text-indigo-400"
                >
                 
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-800/80 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {currentYear} StoryForge. Todos os direitos reservados.</p>
          <p>Feito para escritores e criadores de mundos.</p>
        </div>
      </div>
    </footer>
  );
}
