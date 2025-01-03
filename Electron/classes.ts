export interface Renda {
    id: string | undefined,
    nome: string,
    valor: number,
    is_recurring: number,
    date_start: Date,
    date_end: Date | null
}

export interface Economia {
    id: string | undefined,
    nome: string,
    valor: number,
    is_recurring: number,
    date_start: Date,
    date_end: Date | null
}

export interface Gasto {
    id: string | undefined,
    nome: string;
    descricao: string,
    economia_id?: number,
    valor: number
    is_recurring: number,
    date_start: Date,
    date_end: Date | null
}

export interface ReceivedData {
    rendas: Renda[];
    economias: Economia[];
    gastos: Gasto[];
    to_remove: ToRemoveItem[];
}

export interface ToRemoveItem {
    key: string;
    value: 'RENDAS' | 'ECONOMIAS' | 'GASTOS';
}