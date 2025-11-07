import { useEffect, useState } from "react";
import { api, Store } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, CheckCircle2, XCircle, Store as StoreIcon, Edit, Trash2 } from "lucide-react";
import { StoreForm } from "@/components/StoreForm";

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const { toast } = useToast();

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStores();
      setStores(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los comercios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleStatusUpdate = async (id: number, estado: string) => {
    try {
      await api.updateStoreStatus(id, estado);
      toast({
        title: "Comercio actualizado",
        description: `El comercio ha sido marcado como ${estado}.`,
      });
      fetchStores();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el comercio.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteStore(deleteId);
      toast({
        title: "Comercio eliminado",
        description: "El comercio ha sido eliminado exitosamente.",
      });
      fetchStores();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el comercio.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormFinished = () => {
    setIsFormOpen(false);
    setSelectedStore(null);
    fetchStores();
  };

  const openCreateForm = () => {
    setSelectedStore(null);
    setIsFormOpen(true);
  };

  const openEditForm = (store: Store) => {
    setSelectedStore(store);
    setIsFormOpen(true);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return <Badge className="bg-green-500">Activo</Badge>;
      case 'pendiente': return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'inactivo': return <Badge variant="destructive">Inactivo</Badge>;
      default: return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (isLoading && stores.length === 0) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Card><CardContent className="p-8"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comercios</h1>
          <p className="text-muted-foreground mt-2">Gestión de comercios registrados</p>
        </div>
        <Button onClick={openCreateForm} className="bg-gradient-primary hover:opacity-90">
          <StoreIcon className="mr-2 h-4 w-4" />
          Nuevo Comercio
        </Button>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Lista de Comercios</CardTitle>
          <CardDescription>Total de comercios: {stores.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.nombre}</TableCell>
                  <TableCell>{store.propietario.nombre}</TableCell>
                  <TableCell className="max-w-xs truncate">{store.ubicacion}</TableCell>
                  <TableCell>{getStatusBadge(store.estado)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditForm(store)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {store.estado !== 'activo' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(store.id, 'activo')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Activar
                          </DropdownMenuItem>
                        )}
                        {store.estado !== 'inactivo' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(store.id, 'inactivo')}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" /> Desactivar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteId(store.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedStore ? 'Editar Comercio' : 'Crear Nuevo Comercio'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <StoreForm store={selectedStore} onFinished={handleFormFinished} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El comercio será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
