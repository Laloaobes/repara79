export interface MaterialInput {
  descripcion: string;
  cantidad: number;
  costo_unitario: number;
}

export interface MaterialItem {
  id: number;
  descripcion: string;
  cantidad: number;
  costo_unitario: string;
  subtotal: string;
}

export interface PendingValuationTicketFilters {
  search?: string;
  area_id?: number;
  sort?: 'fecha_desc' | 'fecha_asc';
}

export interface MaterialRowDraft {
  id?: number;
  localId: string;
  descripcion: string;
  cantidad: string;
  costo_unitario: string;
}

export interface MaterialResubmissionInput extends MaterialInput {
  id?: number;
}

export interface ValoracionPendienteFilters {
  search?: string;
  area_id?: number;
  sort?: 'fecha_desc' | 'fecha_asc' | 'costo_desc' | 'costo_asc';
}
