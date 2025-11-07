import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, startOfDay, endOfDay } from "date-fns";
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
  contact: {
    name: string;
    phone: string;
  };
}

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
      .select(
        `
        *,
        contact:contacts(name, phone)
      `
      )
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

  const getDayAppointments = (date: Date) => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.scheduled_at), date)
    );
  };

  const getMonthAppointmentDates = () => {
    return appointments.map((apt) => new Date(apt.scheduled_at));
  };

  const selectedDayAppointments = getDayAppointments(selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-stage-cliente";
      case "completed":
        return "bg-stage-qualificado";
      case "cancelled":
        return "bg-stage-inativo";
      case "rescheduled":
        return "bg-stage-negociacao";
      default:
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendada";
      case "completed":
        return "Concluída";
      case "cancelled":
        return "Cancelada";
      case "rescheduled":
        return "Reagendada";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda de Calls</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus agendamentos com clientes
          </p>
        </div>
        <AddAppointmentDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <Card className="lg:col-span-2 p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            className="rounded-md border-0 pointer-events-auto"
            modifiers={{
              hasAppointment: getMonthAppointmentDates(),
            }}
            modifiersStyles={{
              hasAppointment: {
                fontWeight: "bold",
                textDecoration: "underline",
                color: "hsl(var(--primary))",
              },
            }}
          />
        </Card>

        {/* Appointments List for Selected Day */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedDayAppointments.length} agendamento(s)
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {selectedDayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum agendamento para este dia</p>
              </div>
            ) : (
              selectedDayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{apt.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium text-foreground ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(apt.scheduled_at), "HH:mm")} ({apt.duration} min)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{apt.contact.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{apt.contact.phone}</span>
                    </div>

                    {apt.agent_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Agente: {apt.agent_name}</span>
                      </div>
                    )}

                    {apt.notes && (
                      <p className="text-muted-foreground mt-2 pt-2 border-t border-border">
                        {apt.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming Appointments Section */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Próximos Agendamentos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments
            .filter((apt) => new Date(apt.scheduled_at) >= new Date() && apt.status === "scheduled")
            .slice(0, 6)
            .map((apt) => (
              <div
                key={apt.id}
                className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{apt.title}</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(apt.scheduled_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{apt.contact.name}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default Agenda;
