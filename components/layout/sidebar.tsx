'use client';

'use client';

import React, { useState, useCallback, memo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MessageSquare,
  Code2,
  TrendingUp,
  Cpu,
  Trophy,
  Bot,
  Users,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  BrainCircuit,
  BookOpen,
  FolderGit2,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  isActive?: boolean;
}

interface SidebarProps {
  user?: {
    name: string;
    avatar?: string;
    role: string;
    online: boolean;
  };
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = memo(function Sidebar({ user, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems: NavItem[] = [
    { id: 'home', label: 'Inicio', icon: <Home className="w-5 h-5" />, href: '/' },
    { id: 'forum', label: 'Foro', icon: <MessageSquare className="w-5 h-5" />, href: '/forum', badge: 12 },
    { id: 'sandbox', label: 'AI Sandbox', icon: <Code2 className="w-5 h-5" />, href: '/sandbox' },
    { id: 'trends', label: 'Tendencias IA', icon: <TrendingUp className="w-5 h-5" />, href: '/trends' },
    { id: 'model-zoo', label: 'Model Zoo', icon: <Cpu className="w-5 h-5" />, href: '/model-zoo' },
    { id: 'challenges', label: 'Retos', icon: <Trophy className="w-5 h-5" />, href: '/challenges', badge: 3 },
    { id: 'assistant', label: 'Asistente IA', icon: <Bot className="w-5 h-5" />, href: '/assistant' },
    { id: 'networking', label: 'Networking', icon: <Users className="w-5 h-5" />, href: '/networking' },
    { id: 'dashboard', label: 'Mi Dashboard', icon: <UserCircle className="w-5 h-5" />, href: '/dashboard' },
    { id: 'resources', label: 'Recursos', icon: <BookOpen className="w-5 h-5" />, href: '/resources' },
    { id: 'projects', label: 'Proyectos', icon: <FolderGit2 className="w-5 h-5" />, href: '/projects' }
  ];

  const handleCollapseToggle = useCallback(() => {
    setCollapsed(prev => {
      const newState = !prev;
      onCollapseChange?.(newState);
      return newState;
    });
  }, [onCollapseChange]);

  const handleMobileToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarContent = (
    <>
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b border-gray-800",
        collapsed ? "px-2" : "px-4"
      )}>
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="relative flex-shrink-0">
            <BrainCircuit className="w-8 h-8 text-blue-400" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div>
                  <h1 className="text-lg font-bold text-white truncate">AI-Dev Nexus</h1>
                  <p className="text-xs text-gray-400 truncate">Conectando mentes</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        
        <button
          onClick={handleCollapseToggle}
          className={cn(
            "p-1.5 rounded-lg hover:bg-gray-800 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          )}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      <div className={cn("px-4 py-3", collapsed ? "px-2" : "px-4")}>
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={collapsed ? "Buscar..." : "Buscar temas, código..."}
              className={cn(
                "w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg",
                "text-sm text-white placeholder-gray-500",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                collapsed && "pr-2"
              )}
              aria-label="Buscar en el foro"
            />
          </div>
        </form>
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                "hover:bg-gray-800 hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                isActive 
                  ? "bg-blue-900/20 text-blue-300 border-l-4 border-blue-500" 
                  : "text-gray-300"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between flex-1 min-w-0"
                  >
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px -1.5 py -0.5 text-xs font-medium bg-red -500 text-white rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-4 border-t border-gray-800", collapsed && "p-2")}>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w -10 h -10 rounded-full bg-gradient-to-br from-blue -500 to-purple -600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={cn(
                "absolute bottom -0 right -0 w -3 h -3 rounded-full border -2 border -gray -900",
                user.online ? "bg-green -500" : "bg-gray -500"
              )} />
            </div>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex -1 min-w -0"
                >
                  <div className="flex -1 overflow-hidden">
                    <div>
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray -400 truncate">{user.role}</p>
                    </div>
                    <button
                      onClick={() => {/* Handle logout */}}
                      className="ml -2 p -1 hover:text-red -400 transition-colors"
                      aria-label="Cerrar sesión"
                    >
                      <LogOut className="w -4 h -4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          !collapsed && (
            <div className="space-y -3">
              <Link
                href="/auth/login"
                className="block w-full px -4 py -2 text-sm font-medium text-center text-white bg-gradient-to-r from-blue -600 to-purple -600 rounded-lg hover:opacity -90 transition-opacity"
              >
                Iniciar sesión
              </Link>
              <p className="text-xs text-center text-gray -400">
                Únete a la comunidad de IA
              </p>
            </div>
          )
        )}
      </div>

      {!collapsed && (
        <div className="px -4 py -3 bg-gradient-to-r from-blue -900/20 to-purple -900/20">
          <div className="flex items-center gap -2 text-sm">
            <Zap className="w -4 h -4 text-yellow -400" />
            <span className="text-gray -300">124 devs en línea</span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <button
        onClick={handleMobileToggle}
        className={cn(
          "md:hidden fixed top -4 left -4 z -50 p -2 rounded-lg bg-gray -900 text-white",
          "focus:outline-none focus:ring -2 focus:ring-blue -500"
        )}
        aria-label="Abrir menú"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="w -6 h -6" /> : <Menu className="w -6 h -6" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y -0 left -0 z -40 flex flex-col bg-gray -950/95 backdrop-blur-sm border-r border-gray -800",
          "transition-transform duration -300 ease-in-out",
          collapsed ? "w -16" : "w -64",
          mobileOpen ? "translate-x -0" : "-translate-x-full md:translate-x -0"
        )}
        aria-label="Barra lateral principal"
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset -0 z -30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;