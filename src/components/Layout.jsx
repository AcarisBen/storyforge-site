// Adicione o botão no topo do seu componente de menu/sidebar:
<div className="p-4 border-b border-gray-800">
  <button
    onClick={() => navigate('/')}
    className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-4"
  >
    ← Meus Projetos
  </button>
  
  {/* Contexto do Projeto Ativo */}
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-purple-900/50 border border-purple-500/30 rounded-lg flex items-center justify-center">
      <BookOpen size={16} className="text-purple-400" />
    </div>
    <div>
      <h4 className="text-sm font-bold truncate max-w-[140px]">{currentProject?.title}</h4>
      <span className="text-[10px] text-gray-500">{currentProject?.format}</span>
    </div>
  </div>
</div>