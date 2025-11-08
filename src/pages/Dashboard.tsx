import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Calendar, TrendingUp, Phone, UserCheck, Clock, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Contact = Tables<"contacts">;
type Appointment = Tables<"appointments">;
type Conversation = Tables<"conversations">;

interface KPI {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  trend: "up" | "down" | "neutral";
}

const Dashboard = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [contactsRes, appointmentsRes, conversationsRes] = await Promise.all([
        supabase.from('contacts').select('*'),
        supabase.from('appointments').select('*'),
        supabase.from('conversations').select('*')
      ]);

      if (contactsRes.error) throw contactsRes.error;
      if (appointmentsRes.error) throw appointmentsRes.error;
      if (conversationsRes.error) throw conversationsRes.error;

      setContacts(contactsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setConversations(conversationsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const totalContacts = contacts.length;
  const totalLeads = contacts.filter(c => c.stage === 'lead').length;
  const totalClients = contacts.filter(c => c.stage === 'client').length;
  const conversionRate = totalContacts > 0 ? ((totalClients / totalContacts) * 100).toFixed(1) : 0;
  const totalConversations = conversations.reduce((sum, conv) => sum + conv.message_count, 0);
  const upcomingAppointments = appointments.filter(a => 
    new Date(a.scheduled_at) > new Date() && a.status === 'scheduled'
  ).length;

  const kpis: KPI[] = [
    {
      title: "Total de Contatos",
      value: totalContacts,
      change: "+12% vs mês anterior",
      icon: Users,
      trend: "up"
    },
    {
      title: "Conversas Ativas",
      value: conversations.length,
      change: "+8% vs mês anterior",
      icon: MessageSquare,
      trend: "up"
    },
    {
      title: "Agendamentos",
      value: upcomingAppointments,
      change: "próximos 7 dias",
      icon: Calendar,
      trend: "neutral"
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      change: "+2.3% vs mês anterior",
      icon: TrendingUp,
      trend: "up"
    }
  ];

  // Dados para gráficos
  const stageData = [
    { name: 'Leads', value: totalLeads, color: '#3b82f6' },
    { name: 'Contatos', value: contacts.filter(c => c.stage === 'contact').length, color: '#8b5cf6' },
    { name: 'Qualificados', value: contacts.filter(c => c.stage === 'qualified').length, color: '#ec4899' },
    { name: 'Clientes', value: totalClients, color: '#10b981' }
  ];

  // Atividades dos últimos 7 dias
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const activityData = last7Days.map(date => {
    const dayContacts = contacts.filter(c => 
      c.created_at.split('T')[0] === date
    ).length;
    const dayAppointments = appointments.filter(a => 
      a.created_at.split('T')[0] === date
    ).length;
    
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      contatos: dayContacts,
      agendamentos: dayAppointments
    };
  });

  // Próximos agendamentos
  const upcomingAppts = appointments
    .filter(a => new Date(a.scheduled_at) > new Date() && a.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  // Contatos recentes
  const recentContacts = [...contacts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das métricas e atividades do CRM</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className={`text-xs ${
                  kpi.trend === 'up' ? 'text-green-600' : 
                  kpi.trend === 'down' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
        {/* Gráfico de Atividades */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividades dos Últimos 7 Dias</CardTitle>
            <CardDescription>Novos contatos e agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="contatos" fill="#3b82f6" name="Contatos" />
                <Bar dataKey="agendamentos" fill="#10b981" name="Agendamentos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Funil */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>Distribuição por estágio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 25;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill="hsl(var(--foreground))"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs"
                      >
                        {`${name}: ${value}`}
                      </text>
                    );
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Próximos Agendamentos */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
            <CardDescription>
              {upcomingAppts.length} agendamento{upcomingAppts.length !== 1 ? 's' : ''} confirmado{upcomingAppts.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum agendamento próximo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppts.map((appt) => (
                  <div key={appt.id} className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{appt.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Agente: {appt.agent_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(appt.scheduled_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contatos Recentes */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Contatos Recentes</CardTitle>
            <CardDescription>Últimos contatos adicionados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum contato recente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.phone}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(contact.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
