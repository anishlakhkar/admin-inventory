import { useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <div className="flex flex-1 pt-16">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        <div className="w-4"></div>

        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-6`}>
          {children}
        </main>
      </div>
      
      <Footer collapsed={sidebarCollapsed} />
    </div>
  );
}