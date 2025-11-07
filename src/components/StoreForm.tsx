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
import { Textarea } from "@/components/ui/textarea";
import { api, Store } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface StoreFormProps {
  store?: Store | null;
  onFinished: () => void;
}

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  ubicacion: z.string().min(5, { message: "La ubicación debe tener al menos 5 caracteres." }),
  propietarioId: z.coerce.number().min(1, { message: "El ID del propietario es obligatorio." }),
});

export function StoreForm({ store, onFinished }: StoreFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!store;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: store?.nombre || "",
      descripcion: store?.descripcion || "",
      ubicacion: store?.ubicacion || "",
      // La API no devuelve el ID del propietario, así que no podemos pre-rellenarlo
      propietarioId: undefined, 
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (isEditing) {
        await api.updateStore(store.id, values);
        toast({ title: "Comercio actualizado", description: "El comercio ha sido actualizado exitosamente." });
      } else {
        await api.createStore(values);
        toast({ title: "Comercio creado", description: "El nuevo comercio ha sido creado exitosamente." });
      }
      onFinished();
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} el comercio.`,
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
              <FormLabel>Nombre del Comercio</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Tienda de Artesanías 'El Sol'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe brevemente el comercio, qué vende o qué servicios ofrece."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ubicacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Calle Principal #123, Cerca de la plaza" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="propietarioId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID del Propietario</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Introduce el ID numérico del usuario propietario" {...field} />
              </FormControl>
              <FormDescription>
                Este es el ID del usuario registrado como 'Comerciante'.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear Comercio")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
