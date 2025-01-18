//type Month = 'janeiro' | 'fevereiro' | 'marco' | 'abril' | 'maio' | 'junho' | 'julho' | 'agosto' | 'setembro' | 'outubro' | 'novembro' | 'dezembro';
//const meses: Month[] = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export type MoneyDataType = 'Rendas' | 'Economias' | 'Gastos' | 'Saldo';

export class Projecao {
    Rendas: Renda[] = [];
    Economias: Economia[] = [];
    Gastos: Gasto[] = [];
    MesesAno: string[] = [];
    Projecao: Map<string, number> = new Map();

    constructor(rendas: Renda[], econimias: Economia[], gastos: Gasto[]) {
        this.Rendas = rendas;
        this.Economias = econimias;
        this.Gastos = gastos;
        
        // pegar os próximos 12 meses com base na data atual
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {

            // pegar o próximo mes com base na data atual + 1 mes, 1 (1º dia do mes)
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);

            // pegar o nome longo do mes com base na linguagem local, usando long para pegar 'Janeiro' ao em vez de 'jan' ou '1'
            const monthName = nextMonth.toLocaleString('default', { month: 'long' });

            // Esta linha simplesmente extrai o ano do objeto Date nextMonth
            const year = nextMonth.getFullYear();

            this.MesesAno.push(`${monthName.toLowerCase()}-${year}`);
        }
    }

    ValorMensalDisponivel (): number {
        let valorTotal = 0;
        for(const renda of this.Rendas) {
            valorTotal += renda.valor;
        }
        return valorTotal;
    }

    ValorAnualDisponivel (): number  {
        let valorTotal = 0;
        for(const mes of this.MesesAno) {
            for(const renda of this.Rendas) {
                valorTotal += renda.valor;
            }
        }
        return valorTotal;
    }

    ProjecaoMensal () {

        // Mapa que recebe 'mes' 'valor'
        //const projecao: Map<string, number> = new Map();

        for (const mesAnoAtual of this.MesesAno) {

            const [mes, ano] = mesAnoAtual.split('-');

            console.log(`[ProjecaoMensal] Data atual: mes: ${mes} ano: ${ano}`);

            let gastoDoMes = 0;
            for (const gasto of this.Gastos) {

                // pegar data inicial e final do gasto
                const startDate = new Date(gasto.date_start);
                const endDate = gasto.date_end ? new Date(gasto.date_end) : null;

                const startMonth = startDate.toLocaleString('default', { month: 'long' }).toLowerCase();
                const startYear = startDate.getFullYear().toString();

                let isWithinDateRange = false;

                // Verifica se existe uma data de término (endDate)
                if (endDate) {
                    // Se houver uma data de término, verifica se o mês atual está dentro do intervalo de datas
                    const currentMonthDate = new Date(`${ano}-${mes}-01`);

                    // Compara se a data atual está entre a data de início e a data de término
                    if (startDate <= currentMonthDate && currentMonthDate <= endDate) {
                        isWithinDateRange = true;
                    }
                } else {
                    // Se não houver data de término, verifica duas condições
                    // Condição 1: Se o mês e ano de início correspondem exatamente ao mês e ano atuais
                    if (startMonth === mes && startYear === ano) {
                        isWithinDateRange = true;
                    } 
                    // Condição 2: Se a data de início é anterior ou igual ao mês atual
                    // Isso captura despesas recorrentes futuras
                    else if (startDate <= new Date(`${ano}-${mes}-01`)) {
                        isWithinDateRange = true;
                    }
                }

                if (gasto.is_recurring && isWithinDateRange) {
                    gastoDoMes += gasto.valor;
                } else if (!gasto.is_recurring && startMonth === mes && startYear === ano) {
                    gastoDoMes += gasto.valor;
                }

                // 1º se for recorrente 2º se o mes e ano bater
                if (gasto.is_recurring) {
                    gastoDoMes += gasto.valor;
                }
            }
            console.log(`[ProjecaoMensal] Gasto total do mês ${mes}-${ano}: ${gastoDoMes}`);

            this.Projecao.set(mes, gastoDoMes);

        }
        
    }

}

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