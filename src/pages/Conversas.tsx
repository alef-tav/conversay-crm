import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Send, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Contact = Tables<"contacts">;
type Conversation = Tables<"conversations"> & {
  contacts?: Contact;
};
type Message = Tables<"messages">;

const Conversas = () => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    
    // Realtime subscription for new messages
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          if (selectedConversation) {
            fetchMessages(selectedConversation);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('conversations')
        .select(`
          *,
          contacts (*)
        `)
        .order('updated_at', { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq('contacts.stage', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConversations(data as any || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user || !profile) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          content: newMessage,
          sender_type: 'agent',
          sender_name: profile.full_name,
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedConversation);
      fetchConversations();

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUnreadCount = (conversationId: string) => {
    return messages.filter(m => m.conversation_id === conversationId && !m.read && m.sender_type === 'customer').length;
  };

  const filteredConversations = conversations.filter(conv => 
    conv.contacts?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contacts?.phone.includes(searchTerm)
  );

  const selectedConvData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Conversas</h1>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={(value) => {
              setFilterStatus(value);
              fetchConversations();
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="contact">Contatos</SelectItem>
                <SelectItem value="qualified">Qualificados</SelectItem>
                <SelectItem value="client">Clientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lista de conversas */}
        <div className="w-80 border-r border-border flex flex-col">
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma conversa encontrada
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conv) => (
                  <Card
                    key={conv.id}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedConversation === conv.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleConversationSelect(conv.id)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm text-foreground">
                        {conv.contacts?.name || "Cliente sem nome"}
                      </h3>
                      {conv.message_count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {conv.message_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {conv.contacts?.phone}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {conv.contacts?.stage}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updated_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Área de mensagens */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header da conversa */}
              <div className="border-b border-border p-4">
                <h2 className="font-semibold text-foreground">
                  {selectedConvData?.contacts?.name || "Cliente"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedConvData?.contacts?.phone}
                </p>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-md rounded-lg p-3 ${
                          msg.sender_type === 'agent'
                            ? 'bg-primary text-primary-foreground'
                            : msg.sender_type === 'system'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {msg.sender_name && msg.sender_type !== 'agent' && (
                          <p className="text-xs font-semibold mb-1">
                            {msg.sender_name}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDistanceToNow(new Date(msg.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input de mensagem */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg mb-2">Selecione uma conversa</p>
                <p className="text-sm">
                  Escolha uma conversa da lista para visualizar o histórico
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversas;
