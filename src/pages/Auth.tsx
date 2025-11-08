import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { LogIn, UserPlus } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, { message: 'Nome deve ter no mínimo 2 caracteres' }).max(100),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<any>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validated = signInSchema.parse(signInForm);
      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Erro ao fazer login',
            description: 'Email ou senha incorretos.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro ao fazer login',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Login realizado!',
          description: 'Bem-vindo de volta.',
        });
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0]] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validated = signUpSchema.parse(signUpForm);
      const { error } = await signUp(validated.email, validated.password, validated.fullName);

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: 'Erro ao criar conta',
            description: 'Este email já está cadastrado.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro ao criar conta',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Verifique seu email para confirmar o cadastro.',
        });
        // Reset form
        setSignUpForm({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: any = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0]] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Dashboard-CRM</CardTitle>
          <CardDescription className="text-center">
            Faça login ou crie sua conta para acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Login</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                    disabled={loading}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    disabled={loading}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <LogIn className="w-4 h-4 mr-2" />
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={signUpForm.fullName}
                    onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                    disabled={loading}
                  />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    disabled={loading}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    disabled={loading}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                    disabled={loading}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
