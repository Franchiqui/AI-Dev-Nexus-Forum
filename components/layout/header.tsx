'use client';

'use client';

import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserCircleIcon, BellIcon, ChatBubbleLeftRightIcon, ComputerDesktopIcon, CodeBracketIcon, FireIcon } from '@heroicons/react/24/outline';
import { Bot } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import useOnlineUsersStore from '@/stores/useOnlineUsersStore';

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    avatar?: string;
    role: 'user' | 'admin' | 'moderator';
  };
  notificationsCount?: number;
}

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
});

type SearchFormData = z.infer<typeof searchSchema>;

const Header: React.FC<HeaderProps> = memo(({ user, notificationsCount = 0 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const onlineUsers = useOnlineUsersStore((state) => state.count);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  const searchQuery = watch('query');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const fetchSuggestions = setTimeout(() => {
        const mockSuggestions = [
          'TensorFlow implementation',
          'PyTorch CNN tutorial',
          'Hugging Face models',
          'Machine Learning best practices',
          'Computer Vision projects',
          'NLP transformers',
          'Reinforcement Learning',
          'AI ethics discussion',
        ].filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchSuggestions(mockSuggestions.slice(0, 5));
        setShowSuggestions(true);
      }, 300);
      return () => clearTimeout(fetchSuggestions);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const onSubmit = useCallback(
    async (data: SearchFormData) => {
      router.push(`/search?q=${encodeURIComponent(data.query)}`);
      reset();
      setShowSuggestions(false);
    },
    [router, reset]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      router.push(`/search?q=${encodeURIComponent(suggestion)}`);
      reset();
      setShowSuggestions(false);
    },
    [router, reset]
  );

  const navigationItems = useMemo(
    () => [
      { name: 'Forum', href: '/forum', icon: ChatBubbleLeftRightIcon },
      { name: 'AI Sandbox', href: '/sandbox', icon: CodeBracketIcon },
      { name: 'Model Zoo', href: '/model-zoo', icon: ComputerDesktopIcon },
      { name: 'Challenges', href: '/challenges', icon: FireIcon },
      { name: 'Trends', href: '/trends', icon: FireIcon },
      { name: 'Asistente IA', href: '/asistente-ia', icon: Bot },
    ],
    []
  );

  const userNavigation = useMemo(
    () => [
      { name: 'Your Profile', href: '/profile' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Settings', href: '/settings' },
      { name: 'Sign out', href: '/logout' },
    ],
    []
  );

  const cn = useCallback((...classes: string[]) => twMerge(clsx(...classes)), []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800'
          : 'bg-gray-900'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden mr-3 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <div className="relative px-3 py-1.5 bg-gray-900 rounded-lg ring-1 ring-gray-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      AI-Dev Nexus
                    </span>
                  </div>
                </div>
                <span className="ml-3 text-sm text-gray-400 hidden sm:block">
                </span>
              </Link>
            </div>

            <nav className="hidden lg:ml-10 lg:flex lg:space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group relative px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-white bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {item.name}
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-300">
                <span className="font-semibold text-green-400">{onlineUsers}</span> online
              </span>
            </div>

            <div className="relative hidden md:block w-64 lg:w-80">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative">
                  <input
                    type="text"
                    {...register('query')}
                    placeholder="Search AI topics..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    aria-label="Search forum"
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  <MagnifyingGlassIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                    aria-label="Submit search"
                  >
                    Search
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z -10 mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden"
                  >
                    <ul className="py-1">
                      {searchSuggestions.map((suggestion) => (
                        <li key={suggestion}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py+2 text-sm text-left text-gray-300 hover:text-white hover:bg-gray -800 transition-colors"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {suggestion}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <>
                <button
                  type="button"
                  className="relative p -2 rounded-lg text-gray -400 hover:text-white hover:bg-gray -800 transition"
                  aria-label={`${notificationsCount} notifications`}
                >
                  <BellIcon className="h -5 w -5" aria-hidden="true" />
                  {notificationsCount > 0 && (
                    <span className="absolute -top -1 -right -1 flex h -4 w -4 items-center justify-center rounded-full bg-red -500 text-xs font-bold text-white">
                      {notificationsCount > 9 ? '9+' : notificationsCount}
                    </span>
                  )}
                </button>

                <Menu as="div" className="relative ml -3">
                  <Menu.Button className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring -2 focus:ring-blue -500">
                    <span className="sr-only">Open user menu</span>
                    {user.avatar ? (
                      <img
                        className="h -8 w -8 rounded-full ring -2 ring-gray -800"
                        src={user.avatar}
                        alt={user.name}
                      />
                    ) : (
                      <UserCircleIcon className="h -8 w -8 text-gray -400" aria-hidden="true" />
                    )}
                  </Menu.Button>
                  <Transition
                    as={React.Fragment}
                    enter="transition ease-out duration -100"
                    enterFrom="transform opacity -0 scale -95"
                    enterTo="transform opacity -100 scale -100"
                    leave="transition ease-in duration -75"
                    leaveFrom="transform opacity -100 scale -100"
                    leaveTo="transform opacity -0 scale -95"
                  >
                    <Menu.Items className="absolute right -0 mt -2 w -48 origin-top-right rounded-lg bg-gray -900 border border-gray -800 py -1 shadow-lg ring -1 ring-black ring-opacity -5 focus:outline-none z -10">
                      <div className="px -4 py -3 border-b border-gray -800">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray -400 capitalize">{user.role}</p>
                      </div>
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              className={cn(
                                active ? 'bg-gray -800' : '',
                                'block px -4 py -2 text-sm text-gray -300 hover:text-white transition'
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px -4 py -2 text-sm font-medium text-gray -300 hover:text-white transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px -4 py -2 text-sm font-medium text-white bg-gradient-to-r from-blue -600 to-purple -600 rounded-lg hover:opacity -90 focus:outline-none focus:ring -2 focus:ring-blue -500 transition"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-gray -800 bg-gray -900/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px -4 py -3 space-y -3">
              <form onSubmit={handleSubmit(onSubmit)} className="relative">
                <input
                  type="text"
                  {...register('query')}
                  placeholder="Search AI topics..."
                  className="w-full pl -10 pr -4 py -2 bg-gray -800 border border-gray -700 rounded-lg text-sm text-white placeholder-gray -400 focus:outline-none focus:ring -2 focus:ring-blue -500 focus:border-transparent"
                  aria-label="Search forum"
                />
                <MagnifyingGlassIcon
                  className="absolute left -3 top -1/2 transform -translate-y -1/2 h -4 w -4 text-gray -400"
                  aria-hidden="true"
                />
              </form>

              <div className="flex items-center justify-between px -2 py -1.5">
                <div className="flex items-center space-x -2">
                  <div className="h -2 w -2 rounded-full bg-green -500 animate-pulse" />
                  <span className="text-xs text-gray -300">
                    <span className="font-semibold text-green -400">{onlineUsers}</span> developers online
                  </span>
                </div>
              </div>

              <nav className="space-y -1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center px -3 py -2 rounded-lg text-base font-medium transition-colors',
                        isActive
                          ? 'text-white bg-gray -800'
                          : 'text-gray -300 hover:text-white hover:bg-gray -800/50'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="mr -3 h -5 w -5" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}

                {!user && (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px -3 py -2 rounded-lg text-base font-medium text-gray -300 hover:text-white hover:bg-gray -800/50 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px -3 py -2 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue -600 to-purple -600 hover:opacity -90 transition-colors"
                    >
                      Join Free
                    </Link>
                  </>
                )}
              </nav>

              {user && (
                <div className="pt -3 border-t border-gray -800">
                  <p className="px -3 py -2 text-sm font-medium text-white">{user.name}</p>
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px -3 py -2 rounded-lg text-base font-medium text-gray -300 hover:text-white hover:bg-gray -800/50 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

export default Header;