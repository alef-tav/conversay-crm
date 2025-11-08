import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, FunnelChart, Funnel,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Download, Calendar as CalendarIcon,
  Users, Target, Clock, CheckCircle, ArrowRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, subDays, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Contact = Tables<"contacts">;
type Appointment = Tables<"appointments">;

interface DateRange {
  from: Date;
  to: Date;
}

interface MetricsData {
  totalContacts: number;
  newContacts: number;
  totalAppointments: number;
  completedAppointments: number;
  conversionRate: number;
  avgConversionTime: number;
  contactsByStage: { stage: string; count: number; color: string }[];
  timelineData: { date: string; contatos: number; agendamentos: number; conversoes: number }[];
  funnelData: { name: string; value: number; fill: string }[];
  previousPeriodComparison: {
    contacts: number;
    appointments: number;
    conversions: number;
  };
}

const COLORS = {
  lead: '#3b82f6',
  contact: '#8b5cf6',
  qualified: '#ec4899',
  client: '#10b981',
};

const Metricas = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("30");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [metrics, setMetrics] = useState<MetricsData>({
    totalContacts: 0,
    newContacts: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    conversionRate: 0,
    avgConversionTime: 0,
    contactsByStage: [],
    timelineData: [],
    funnelData: [],
    previousPeriodComparison: { contacts: 0, appointments: 0, conversions: 0 },
  });

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const now = new Date();
    
    switch (value) {
      case "7":
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case "30":
        setDateRange({ from: subDays(now, 30), to: now });
        break;
      case "90":
        setDateRange({ from: subDays(now, 90), to: now });
        break;
      case "today":
        setDateRange({ from: startOfDay(now), to: endOfDay(now) });
        break;
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();

      // Fetch current period data
      const [contactsRes, appointmentsRes, allContactsRes] = await Promise.all([
        supabase
          .from('contacts')
          .select('*')
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
        supabase
          .from('appointments')
          .select('*')
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
        supabase.from('contacts').select('*'),
      ]);

      if (contactsRes.error) throw contactsRes.error;
      if (appointmentsRes.error) throw appointmentsRes.error;
      if (allContactsRes.error) throw allContactsRes.error;

      const contacts = contactsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const allContacts = allContactsRes.data || [];

      // Calculate previous period for comparison
      const daysDiff = differenceInDays(dateRange.to, dateRange.from);
      const prevFrom = subDays(dateRange.from, daysDiff);
      const prevTo = dateRange.from;

      const [prevContactsRes, prevAppointmentsRes] = await Promise.all([
        supabase
          .from('contacts')
          .select('id')
          .gte('created_at', prevFrom.toISOString())
          .lte('created_at', prevTo.toISOString()),
        supabase
          .from('appointments')
          .select('id')
          .gte('created_at', prevFrom.toISOString())
          .lte('created_at', prevTo.toISOString()),
      ]);

      const prevContacts = prevContactsRes.data?.length || 0;
      const prevAppointments = prevAppointmentsRes.data?.length || 0;

      // Calculate metrics
      const totalContacts = allContacts.length;
      const newContacts = contacts.length;
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(a => a.status === 'completed').length;
      const clients = allContacts.filter(c => c.stage === 'client').length;
      const conversionRate = totalContacts > 0 ? (clients / totalContacts) * 100 : 0;

      // Contacts by stage
      const stageCount: Record<string, number> = {};
      allContacts.forEach(contact => {
        stageCount[contact.stage] = (stageCount[contact.stage] || 0) + 1;
      });

      const contactsByStage = Object.entries(stageCount).map(([stage, count]) => ({
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
        color: COLORS[stage as keyof typeof COLORS] || '#6B7280',
      }));

      // Timeline data
      const days = differenceInDays(dateRange.to, dateRange.from);
      const timelineData = Array.from({ length: Math.min(days + 1, 30) }, (_, i) => {
        const date = subDays(dateRange.to, days - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayContacts = contacts.filter(c => c.created_at.startsWith(dateStr)).length;
        const dayAppointments = appointments.filter(a => a.created_at.startsWith(dateStr)).length;
        const dayConversions = contacts.filter(
          c => c.created_at.startsWith(dateStr) && c.stage === 'client'
        ).length;

        return {
          date: format(date, 'dd/MMM', { locale: ptBR }),
          contatos: dayContacts,
          agendamentos: dayAppointments,
          conversoes: dayConversions,
        };
      });

      // Funnel data
      const funnelData = [
        { name: 'Leads', value: stageCount['lead'] || 0, fill: COLORS.lead },
        { name: 'Contatos', value: stageCount['contact'] || 0, fill: COLORS.contact },
        { name: 'Qualificados', value: stageCount['qualified'] || 0, fill: COLORS.qualified },
        { name: 'Clientes', value: stageCount['client'] || 0, fill: COLORS.client },
      ];

      // Previous period comparison
      const contactsGrowth = prevContacts > 0 
        ? ((newContacts - prevContacts) / prevContacts) * 100 
        : 0;
      const appointmentsGrowth = prevAppointments > 0
        ? ((totalAppointments - prevAppointments) / prevAppointments) * 100
        : 0;

      setMetrics({
        totalContacts,
        newContacts,
        totalAppointments,
        completedAppointments,
        conversionRate,
        avgConversionTime: 0, // Placeholder
        contactsByStage,
        timelineData,
        funnelData,
        previousPeriodComparison: {
          contacts: contactsGrowth,
          appointments: appointmentsGrowth,
          conversions: 0,
        },
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar métricas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    toast({
      title: "Exportando dados",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Métricas</h1>
            <p className="text-muted-foreground">Análise detalhada de desempenho e conversão</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Personalizado
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Button variant="secondary" onClick={exportData} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs com Comparativos */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.newContacts}</div>
            <div className="flex items-center text-xs mt-1">
              {metrics.previousPeriodComparison.contacts >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    +{metrics.previousPeriodComparison.contacts.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                  <span className="text-red-600">
                    {metrics.previousPeriodComparison.contacts.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-muted-foreground ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAppointments}</div>
            <div className="flex items-center text-xs mt-1">
              {metrics.previousPeriodComparison.appointments >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    +{metrics.previousPeriodComparison.appointments.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                  <span className="text-red-600">
                    {metrics.previousPeriodComparison.appointments.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-muted-foreground ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalContacts > 0 
                ? `${((metrics.conversionRate / 100) * metrics.totalContacts).toFixed(0)} clientes convertidos`
                : 'Nenhum cliente ainda'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Concluídas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalAppointments > 0
                ? `${((metrics.completedAppointments / metrics.totalAppointments) * 100).toFixed(0)}% taxa de conclusão`
                : 'Nenhuma call ainda'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="funnel">Funil de Vendas</TabsTrigger>
          <TabsTrigger value="stages">Por Estágio</TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência Temporal</CardTitle>
              <CardDescription>
                Evolução de contatos, agendamentos e conversões ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={metrics.timelineData}>
                  <defs>
                    <linearGradient id="colorContatos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAgendamentos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="contatos" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorContatos)"
                    name="Contatos"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="agendamentos" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorAgendamentos)"
                    name="Agendamentos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversoes" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    name="Conversões"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel */}
        <TabsContent value="funnel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>Visualização do processo de vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.funnelData.map((item, index) => {
                    const total = metrics.funnelData[0]?.value || 1;
                    const percentage = (item.value / total) * 100;
                    const prevValue = index > 0 ? metrics.funnelData[index - 1].value : item.value;
                    const dropOff = index > 0 ? ((prevValue - item.value) / prevValue) * 100 : 0;

                    return (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{item.value}</span>
                            <span className="text-xs text-muted-foreground">
                              ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                        <div className="relative h-12 rounded-lg overflow-hidden" style={{ backgroundColor: `${item.fill}20` }}>
                          <div 
                            className="absolute inset-y-0 left-0 rounded-lg transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: item.fill
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-semibold" style={{ color: item.fill }}>
                              {item.value} {item.name}
                            </span>
                          </div>
                        </div>
                        {index > 0 && dropOff > 0 && (
                          <p className="text-xs text-red-600">
                            ↓ {dropOff.toFixed(0)}% de queda vs estágio anterior
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conversão por Estágio</CardTitle>
                <CardDescription>Análise de eficiência de cada etapa</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Quantidade">
                      {metrics.funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stages */}
        <TabsContent value="stages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Estágio</CardTitle>
              <CardDescription>Análise detalhada de cada etapa do funil</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.contactsByStage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Contatos" radius={[8, 8, 0, 0]}>
                    {metrics.contactsByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {metrics.contactsByStage.map((stage) => (
                  <div 
                    key={stage.stage}
                    className="p-4 rounded-lg border"
                    style={{ borderColor: stage.color }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="font-medium text-sm">{stage.stage}</span>
                    </div>
                    <div className="text-2xl font-bold">{stage.count}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics.totalContacts > 0 
                        ? `${((stage.count / metrics.totalContacts) * 100).toFixed(0)}% do total`
                        : '0% do total'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Metricas;
