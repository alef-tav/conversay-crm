import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import AddAppointmentDialog from "@/components/AddAppointmentDialog";

interface Appointment {
  id: string;
  contact_id: string;
  agent_name: string;
  scheduled_at: string;
  duration: number;
  title: string;
  notes: string | null;
  status: string;
  contact?: {
    name: string;
    phone: string;
  };
}

const Agenda = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        contact:contacts(name, phone)
      `)
      .order("scheduled_at", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setAppointments((data as any) || []);
  };

  const getDayAppointments = (day: Date) => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.scheduled_at), day)
    );
  };

  const selectedDayAppointments = getDayAppointments(date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-stage-lead/20 text-stage-lead";
      case "completed":
        return "bg-stage-cliente/20 text-stage-cliente";
      case "cancelled":
        return "bg-stage-inativo/20 text-stage-inativo";
      case "rescheduled":
        return "bg-stage-qualificado/20 text-stage-qualificado";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      case "rescheduled":
        return "Reagendado";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenda de Calls</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus agendamentos com clientes
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Agendar Call
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                locale={ptBR}
                className="rounded-lg border-0"
                modifiers={{
                  hasAppointments: (day) => getDayAppointments(day).length > 0,
                }}
                modifiersStyles={{
                  hasAppointments: {
                    fontWeight: "bold",
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                  },
                }}
              />
            </div>
          </Card>

          {/* Appointments List for Selected Day */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {format(date, "d 'de' MMMM", { locale: ptBR })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedDayAppointments.length} agendamento(s)
              </p>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {selectedDayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento para este dia
                  </p>
                </div>
              ) : (
                selectedDayAppointments.map((apt) => (
                  <Card key={apt.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{apt.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {format(new Date(apt.scheduled_at), "HH:mm")} ({apt.duration} min)
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>

                    {apt.contact && (
                      <div className="space-y-1 mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground">{apt.contact.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{apt.contact.phone}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">Agente:</span> {apt.agent_name}
                    </div>

                    {apt.notes && (
                      <p className="mt-2 text-sm text-muted-foreground italic">
                        {apt.notes}
                      </p>
                    )}
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Próximos Agendamentos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments
              .filter((apt) => new Date(apt.scheduled_at) >= startOfDay(new Date()))
              .slice(0, 6)
              .map((apt) => (
                <Card key={apt.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground flex-1">{apt.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{format(new Date(apt.scheduled_at), "dd/MM/yyyy 'às' HH:mm")}</p>
                    {apt.contact && (
                      <p className="font-medium text-foreground">{apt.contact.name}</p>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </Card>
      </div>

      <AddAppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Agenda;
