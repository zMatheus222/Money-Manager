export type MoneyDataType = 'Rendas' | 'Economias' | 'Gastos' | 'Saldo';

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
    usar_saldo: boolean,
    valor: number
    is_recurring: number,
    date_start: Date,
    date_end: Date | null
}

export interface Saldo {
    id: string | undefined,
    nome: string,
    descricao: string,
    valor: number
}

export interface ReceivedData {
    rendas: Renda[];
    economias: Economia[];
    gastos: Gasto[];
    saldos: Saldo[];
    to_remove: ToRemoveItem[];
}

export interface ToRemoveItem {
    key: string;
    value: 'Rendas' | 'Economias' | 'Gastos' | 'Saldo';
}