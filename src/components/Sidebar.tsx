import { LayoutDashboard, Users, MessageSquare, LayoutGrid, BarChart3, Calendar, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Sidebar = () => {
  const { profile, signOut } = useAuth();
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Agentes", path: "/agentes" },
    { icon: MessageSquare, label: "Conversas", path: "/conversas" },
    { icon: LayoutGrid, label: "CRM", path: "/" },
    { icon: BarChart3, label: "Métricas", path: "/metricas" },
    { icon: Calendar, label: "Agenda", path: "/agenda" },
  ];

  const adminItems = [
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
  ];

  return (
    <aside className="w-52 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-foreground">Dashboard-CRM</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground",
              "hover:bg-sidebar-accent transition-colors"
            )}
            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-sidebar-border space-y-1">
          {adminItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground",
                "hover:bg-sidebar-accent transition-colors"
              )}
              activeClassName="bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || 'Usuário'}
            </p>
            <button 
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
