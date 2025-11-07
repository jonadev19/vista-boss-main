import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UserFormProps {
  user?: User | null;
  onFinished: () => void;
}

export function UserForm({ user, onFinished }: UserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!user;

  const formSchema = z.object({
    nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    email: z.string().email({ message: "Por favor, introduce un email válido." }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }).optional().or(z.literal('')),
    rol: z.enum(["Admin", "Comerciante", "Creador de Ruta", "Ciclista"]),
  }).refine(data => isEditing || data.password, {
    message: "La contraseña es obligatoria para crear un usuario.",
    path: ["password"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: user?.nombre || "",
      email: user?.email || "",
      password: "",
      rol: user?.rol as any || "Ciclista",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (isEditing) {
        const updateData: Partial<User> = {
          nombre: values.nombre,
          email: values.email,
          rol: values.rol,
        };
        // Solo incluir la contraseña si se ha introducido una nueva
        if (values.password) {
          (updateData as any).password = values.password;
        }
        await api.updateUser(user.id, updateData);
        toast({ title: "Usuario actualizado", description: "El usuario ha sido actualizado exitosamente." });
      } else {
        await api.createUser(values as any);
        toast({ title: "Usuario creado", description: "El nuevo usuario ha sido creado exitosamente." });
      }
      onFinished();
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} el usuario.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="correo@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder={isEditing ? "Dejar en blanco para no cambiar" : "••••••"} {...field} />
              </FormControl>
              <FormDescription>
                {isEditing ? "Si no quieres cambiar la contraseña, deja este campo vacío." : "Mínimo 6 caracteres."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Comerciante">Comerciante</SelectItem>
                  <SelectItem value="Creador de Ruta">Creador de Ruta</SelectItem>
                  <SelectItem value="Ciclista">Ciclista</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear Usuario")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
