import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, Search, TrendingUp, MessageSquare, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

interface UserRole {
  role: string;
}

interface AgentStats {
  contacts: number;
  conversations: number;
  appointments: number;
}

const Agentes = () => {
  const [agents, setAgents] = useState<Profile[]>([]);
  const [agentStats, setAgentStats] = useState<Record<string, AgentStats>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);

      // Fetch all users (admins and regular users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      setAgents(profiles || []);

      // Fetch stats for each agent
      if (profiles) {
        const stats: Record<string, AgentStats> = {};
        
        await Promise.all(
          profiles.map(async (agent) => {
            const [contactsRes, conversationsRes, appointmentsRes] = await Promise.all([
              supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', agent.id),
              supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', agent.id),
              supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('user_id', agent.id)
            ]);

            stats[agent.id] = {
              contacts: contactsRes.count || 0,
              conversations: conversationsRes.count || 0,
              appointments: appointmentsRes.count || 0
            };
          })
        );

        setAgentStats(stats);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agentes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalContacts = Object.values(agentStats).reduce((sum, stats) => sum + stats.contacts, 0);
  const totalConversations = Object.values(agentStats).reduce((sum, stats) => sum + stats.conversations, 0);
  const totalAppointments = Object.values(agentStats).reduce((sum, stats) => sum + stats.appointments, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground">Agentes</h1>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Adicionar Agente
          </Button>
        </div>
        <p className="text-muted-foreground">Gerencie sua equipe de vendas e acompanhe o desempenho</p>
      </div>

      {/* KPIs Gerais */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">Membros ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">Todos os agentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground">Total de conversas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Calls agendadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Agentes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando agentes...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum agente encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => {
            const stats = agentStats[agent.id] || { contacts: 0, conversations: 0, appointments: 0 };
            const initials = agent.full_name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{agent.full_name}</CardTitle>
                      <CardDescription>
                        Membro desde {new Date(agent.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Contatos</span>
                      <Badge variant="secondary">{stats.contacts}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conversas</span>
                      <Badge variant="secondary">{stats.conversations}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Agendamentos</span>
                      <Badge variant="secondary">{stats.appointments}</Badge>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Agentes;
