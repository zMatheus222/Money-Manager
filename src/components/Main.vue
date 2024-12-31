<script setup lang="ts">
    import { ref } from 'vue';
    import type { Renda, Economia, Gasto, ReceivedData } from '@/assets/plugins/classes';
    import { backend } from '@/assets/plugins/backend';

    import { useBaseStore } from '@/stores/BaseStore'
    const baseStore = useBaseStore();

    function generateId() {
        // parte inicial
        const prefix = `mm`;

        // Gerar identificador aleatório de 15 caracteres alfanuméricos
        const token = Array.from({ length: 15 }, () => Math.random().toString(36).charAt(2)).join("");

        // obter data e hora atuais
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // formatar a chave final
        return `${prefix}-${token}-${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    }

    const menus = ref<Map<string, boolean>>(new Map([
        ["adicionar_renda", false],
        ["adicionar_economia", false],
        ["adicionar_gasto", false]
    ]));

    const renda = ref<Renda>({
        id: undefined,
        nome: '',
        valor: 0,
        is_recurring: false,
        date_start: new Date(),
        date_end: null,
    });

    const economia = ref<Economia>({
        id: undefined,
        nome: '',
        valor: 0,
        is_recurring: false,
        date_start: new Date(),
        date_end: null,
    });

    const gasto = ref<Gasto>({
        id: undefined,
        nome: '',
        descricao: '',
        economia_id: undefined,
        valor: 0,
        is_recurring: false,
        date_start: new Date(),
        date_end: null,
    });
    
    const rendas = ref<Renda[]>(baseStore.Rendas);
    const economias = ref<Economia[]>(baseStore.Economias);
    const gastos = ref<Gasto[]>(baseStore.Gastos);

    async function SendToDatabase() {

        console.log('[SendToDatabase] Enviando dados ao banco, rendas.value: ', rendas.value);

        try {
   
            const DataToSend: ReceivedData = {
                rendas: rendas.value,
                economias: economias.value,
                gastos: gastos.value
            }

            if (DataToSend.rendas.length === 0 && DataToSend.economias.length === 0 && DataToSend.gastos.length === 0) {
                console.warn('[SendToDatabase] Nenhum dado novo para enviar.');
                return;
            } else {
                console.log(`[SendToDatabase] Dados a enviar: ${DataToSend.rendas.length} ${DataToSend.economias.length} ${DataToSend.gastos.length}`);
            }
            
            const res = await backend.post('/receive_data', DataToSend, { headers: { 'Content-Type': 'application/json' } });
            if (res.status === 200) {
                console.log(`[SendToDatabase] Dados enviados e inseridos com sucesso`);
                await Promise.all([baseStore.fetchData("Rendas"), baseStore.fetchData("Economias"), baseStore.fetchData("Gastos")]);
            } else {
                console.error(`Erro ao receber / inserir os dados`);
            }
            
        } catch (error) {
            console.log(`Excessão ao tentar enviar os dados ao banco: `, error);
        } finally {
            console.log('[SendToDatabase] Processo finalizado.');
        }

    }

    const addRenda = () => {
        const newRenda = { ...renda.value, id: generateId() };
        rendas.value.push(newRenda);
        console.log('Added new renda:', newRenda);
        renda.value = { id: undefined, nome: '', valor: 0, is_recurring: false, date_start: new Date(), date_end: null };
        menus.value.set('adicionar_renda', false);
    };

    const addEconomia = () => {
        const newEconomia = { ...economia.value, id: generateId() };
        economias.value.push(newEconomia);
        console.log('Added new economia:', newEconomia);
        economia.value = { id: undefined, nome: '', valor: 0, is_recurring: false, date_start: new Date(), date_end: null };
        menus.value.set('adicionar_economia', false);
    };

    const addGasto = () => {
        const newGasto = { ...gasto.value, id: generateId() };
        gastos.value.push(newGasto);
        console.log('Added new gasto:', newGasto);
        gasto.value = { id: undefined, nome: '', descricao: '', economia_id: undefined, valor: 0, is_recurring: false, date_start: new Date(), date_end: null };
        menus.value.set('adicionar_gasto', false);
    };
    
    async function PickMesesAno(startDate: Date): Promise<Date[]> {
        let MesesAno: Date[] = [];
        
        for (let i = 1; i <= 12; i++) {
            const nextMonth = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            MesesAno.push(nextMonth);
        }

        console.log('[PickMesesAno] Retornando: ', MesesAno.map(date => date.toISOString()));
        
        return MesesAno;
    }
    
    const Projecao = ref<Map<string, number>>(new Map());


    /*
        Estas funções são úteis para comparar datas ignorando o dia específico, focando apenas no ano e mês. Isso é especialmente importante para lidar com gastos e economias recorrentes e não - recorrentes em cálculos financeiros mensais.
        
    */

    /**
     * Verifica se duas datas têm o mesmo ano e mês.
     * @param date1 Primeira data para comparação
     * @param date2 Segunda data para comparação
     * @returns true se o ano e mês são iguais, false caso contrário
    */
    function isSameYearAndMonth(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
    }

    /**
     * Verifica se o ano e mês da primeira data são anteriores ou iguais ao da segunda data.
     * @param date1 Data a ser verificada
     * @param date2 Data de referência para comparação
     * @returns true se date1 é anterior ou igual a date2 (considerando apenas ano e mês), false caso contrário
    */
    function isYearMonthBeforeOrEqual(date1: Date, date2: Date): boolean {
        if (date1.getFullYear() < date2.getFullYear()) return true;
        if (date1.getFullYear() > date2.getFullYear()) return false;
        return date1.getMonth() <= date2.getMonth();
    }

    function roundToTwo(num: number) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    async function ProjecaoMensal() {

        // Limpar mapa de projeção
        Projecao.value.clear();

        // pegar a data atual
        const currentDate = new Date();
        console.log(`[ProjecaoMensal] currentDate: ${currentDate}`);

        // pegar os próximos 12 meses em relação ao mês atual
        const nextTwelveDates = await PickMesesAno(currentDate);
        console.log('nextTwelveMonths: ', nextTwelveDates);

        let TotalRenda: number = 0;
        for (const renda of rendas.value) {
            TotalRenda += Number(renda.valor);
        }
        
        for (const ActualDate of nextTwelveDates) {

            // nome do mes
            const mes = ActualDate.toLocaleString('default', { month: 'long' }).toLowerCase();

            console.log(`Mês atual: ${mes}`);

            let gastoDoMes: number = 0;
            for (const gasto of gastos.value) {
                const gastoStartDate = new Date(gasto.date_start);
                const gastoEndDate = gasto.date_end ? new Date(gasto.date_end) : null;
                const gastoValor: number = Number(gasto.valor);
                
                if (isYearMonthBeforeOrEqual(gastoStartDate, ActualDate) && 
                    (!gastoEndDate || isYearMonthBeforeOrEqual(ActualDate, gastoEndDate))) {
                    if (gasto.is_recurring) {
                        console.log(`\tSomando gasto recorrente: ${gasto.nome} ao mes: ${mes}`);
                        gastoDoMes = roundToTwo(gastoDoMes + gastoValor);
                    } else if (isSameYearAndMonth(gastoStartDate, ActualDate)) {
                        console.log(`\tSomando gasto não - recorrente: ${gasto.nome} ao mes: ${mes}`);
                        gastoDoMes = roundToTwo(gastoDoMes + gastoValor);
                    }
                } else {
                    console.warn(`\tSkippando gasto: ${gasto.nome} ao mes: ${mes} :: gastoStartDate: ${gastoStartDate.toISOString().substr(0, 7)} || ActualDate: ${ActualDate.toISOString().substr(0, 7)}`);
                }
            }

            let economiaDoMes: number = 0;
            for (const economia of economias.value) {
                // Converte a data de início da economia para um objeto Date.
                const economiaStartDate = new Date(economia.date_start);

                // Se houver uma data de fim, converte para Date; senão, fica null.
                const economiaEndDate = economia.date_end ? new Date(economia.date_end) : null;

                // Converte o valor da economia para número.
                const economiaValor: number = Number(economia.valor);
                
                // Usa isYearMonthBeforeOrEqual para verificar se: a) A economia já começou (sua data de início é anterior ou igual ao mês atual). 
                // b) Se houver data de fim, verifica se o mês atual não - é posterior à data de fim.
                if (isYearMonthBeforeOrEqual(economiaStartDate, ActualDate) && (!economiaEndDate || isYearMonthBeforeOrEqual(ActualDate, economiaEndDate))) {
                    if (economia.is_recurring) {                                    // Se a economia é recorrente e passou na verificação principal, ela é incluída no cálculo.
                        console.log(`\tSomando economia recorrente: ${economia.nome} ao mes: ${mes}`);
                        economiaDoMes = roundToTwo(economiaDoMes + economiaValor);
                    } else if (isSameYearAndMonth(economiaStartDate, ActualDate)) { // Usa isSameYearAndMonth para verificar se a economia não - recorrente ocorre exatamente no mês atual.
                        console.log(`\tSomando economia não - recorrente: ${economia.nome} ao mes: ${mes}`);
                        economiaDoMes = roundToTwo(economiaDoMes + economiaValor);
                    }
                } else {
                    console.warn(`\tSkippando economia: ${economia.nome} ao mes: ${mes} :: economiaStartDate: ${economiaStartDate.toISOString().substr(0, 7)} || ActualDate: ${ActualDate.toISOString().substr(0, 7)}`);
                }
            }

            console.log(`[ProjecaoMensal] Gasto total do mês ${mes}: ${gastoDoMes} | Economia do mes: ${economiaDoMes}`);
            Projecao.value.set(mes, TotalRenda - roundToTwo(gastoDoMes) - economiaDoMes);
            
        }
    }

    // STYLE FUNCTIONS


    function getIndicatorClass(value: number) {
        if (value > 1000) return 'indicator-highest';
        if (value > 300) return 'indicator-high';
        if (value > 0) return 'indicator-medium';
        return 'indicator-low';
    }

    function getValueClass(value: number) {
        if (value > 1000) return 'value-highest';
        if (value > 300) return 'value-high';
        if (value > 0) return 'value-medium';
        return 'value-low';
    }

    function capitalizeFirstLetter(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    //

</script>

<template>
    <div class="money-manager">
        <h1 class="title">🪙 Money Manager</h1>

        <div class="button-group">
            <button class="action-button update" @click="ProjecaoMensal()">Atualizar Projeção 📈</button>
            <button class="action-button save" @click="SendToDatabase()">Salvar Dados 💾</button>
        </div>

        <div class="projection-section">
            <h2>Projeção Mensal</h2>
            <div v-if="Projecao.size > 0" class="projection-grid">
                <div v-for="[mes, value] in Projecao" :key="mes" class="projection-card">
                    <div class="month-indicator" :class="getIndicatorClass(value)"></div>
                    <div class="month-name">{{ capitalizeFirstLetter(mes) }}</div>
                    <div class="projection-value" :class="getValueClass(value)">
                        R$ {{ value.toFixed(2) }}
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2>Rendas</h2>
                <button class="toggle-button" @click="menus.set('adicionar_renda', !menus.get('adicionar_renda'))">
                    {{ menus.get('adicionar_renda') ? 'Fechar ❌' : 'Novo 💵' }}
                </button>
            </div>
            <ul class="item-list">
                <li v-for="(item, index) in rendas" :key="index" class="item">
                    <div class="item-header">
                        <span class="item-name">{{ item.nome }}</span>
                        <span class="item-value">R$ {{ Number(item.valor).toFixed(2) }}</span>
                    </div>
                    <div class="item-details">
                        <span>Recorrente: {{ item.is_recurring ? 'Sim - ' : 'Não - ' }}</span>
                        <span>Início: {{ new Date(item.date_start).toLocaleDateString() }}</span>
                        <span v-if="item.date_end">Fim: {{ new Date(item.date_end).toLocaleDateString() }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <div class="form-section" v-if="menus.get('adicionar_renda')">
            <h3>Adicionar Renda</h3>
            <form @submit.prevent="addRenda" class="add-form">
                <input v-model="renda.nome" placeholder="Nome" required>
                <input v-model.number="renda.valor" type="number" step="0.01" placeholder="Valor" required>
                <div class="checkbox-group">
                    <input v-model="renda.is_recurring" type="checkbox" id="renda-recurring">
                    <label for="renda-recurring">Recorrente</label>
                </div>
                <input v-model="renda.date_start" type="date" required>
                <input v-model="renda.date_end" type="date">
                <button type="submit" class="submit-button">Adicionar Renda</button>
            </form>
        </div>

        <div class="section">
            <div class="section-header">
                <h2>Economias</h2>
                <button class="toggle-button" @click="menus.set('adicionar_economia', !menus.get('adicionar_economia'))">
                    {{ menus.get('adicionar_economia') ? 'Fechar ❌' : 'Novo 📊' }}
                </button>
            </div>
            <ul class="item-list">
                <li v-for="(item, index) in economias" :key="index" class="item">
                    <div class="item-header">
                        <span class="item-name">{{ item.nome }}</span>
                        <span class="item-value economia-value">R$ {{ Number(item.valor).toFixed(2) }}</span>
                    </div>
                    <div class="item-details">
                        <!-- <span v-if="item.id">ID: {{ item.id }}</span> -->
                        <span>Recorrente: {{ item.is_recurring ? 'Sim - ' : 'Não - ' }}</span>
                        <span>Início: {{ new Date(item.date_start).toLocaleDateString() }}</span>
                        <span v-if="item.date_end">Fim: {{ new Date(item.date_end).toLocaleDateString() }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <div class="form-section" v-if="menus.get('adicionar_economia')">
            <h3>Adicionar Economia</h3>
            <form @submit.prevent="addEconomia" class="add-form">
                <input v-model="economia.nome" placeholder="Nome" required>
                <input v-model.number="economia.valor" type="number" step="0.01" placeholder="Valor" required>
                <div class="checkbox-group">
                    <input v-model="economia.is_recurring" type="checkbox" id="economia-recurring">
                    <label for="economia-recurring">Recorrente</label>
                </div>
                <input v-model="economia.date_start" type="date" required>
                <input v-model="economia.date_end" type="date">
                <button type="submit" class="submit-button">Adicionar Economia</button>
            </form>
        </div>

        <div class="section">
            <div class="section-header">
                <h2>Gastos</h2>
                <button class="toggle-button" @click="menus.set('adicionar_gasto', !menus.get('adicionar_gasto'))">
                    {{ menus.get('adicionar_gasto') ? 'Fechar ❌' : 'Novo 📉' }}
                </button>
            </div>
            <ul class="item-list">
                <li v-for="(item, index) in gastos" :key="index" class="item">
                    <div class="item-header">
                        <span class="item-name">{{ item.nome }}</span>
                        <span class="item-value gasto-value">R$ {{ Number(item.valor).toFixed(2) }}</span>
                    </div>
                    <div class="item-details">
                        <span>Recorrente: {{ item.is_recurring ? 'Sim - ' : 'Não - ' }}</span>
                        <span v-if="item.descricao">Descrição: {{ item.descricao }}</span>
                        <span v-if="item.economia_id">Economia ID: {{ item.economia_id }}</span>
                        <span>Início: {{ new Date(item.date_start).toLocaleDateString() }}</span>
                        <span v-if="item.date_end">Fim: {{ new Date(item.date_end).toLocaleDateString() }}</span>
                    </div>
                </li>
            </ul>
        </div>

        <div class="form-section" v-if="menus.get('adicionar_gasto')">
            <h3>Adicionar Gasto</h3>
            <form @submit.prevent="addGasto" class="add-form">
                <input v-model="gasto.nome" placeholder="Nome" required>
                <textarea v-model="gasto.descricao" placeholder="Descrição"></textarea>
                <select v-model="gasto.economia_id">
                    <option :value="undefined">Selecione uma Economia (opcional)</option>
                    <option v-for="economia in economias" :key="economia.id" :value="economia.id">
                        {{ economia.nome }} (ID: {{ economia.id }})
                    </option>
                </select>
                <input v-model.number="gasto.valor" type="number" step="0.01" placeholder="Valor" required>
                <div class="checkbox-group">
                    <input v-model="gasto.is_recurring" type="checkbox" id="gasto-recurring">
                    <label for="gasto-recurring">Recorrente</label>
                </div>
                <input v-model="gasto.date_start" type="date" required>
                <input v-model="gasto.date_end" type="date">
                <button type="submit" class="submit-button">Adicionar Gasto</button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.money-manager {
    font-family: 'Roboto', sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #1e1e1e;
    color: #e0e0e0;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.title {
    color: gold;
    text-align: center;
    font-size: 2.5em;
    margin-bottom: 30px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 30px;
}

.action-button {
    padding: 12px 24px;
    font-size: 1em;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

.update {
    background-color: #4CAF50;
    color: white;
}

.save {
    background-color: #2196F3;
    color: white;
}

.section {
    background-color: #2c2c2c;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.toggle-button {
    background-color: #ff9800;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.toggle-button:hover {
    background-color: #f57c00;
}

.item-list {
    list-style-type: none;
    padding: 0;
}

.item {
    background-color: #333;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    transition: all 0.3s ease;
}

.item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.item-name {
    font-weight: bold;
}

.item-value {
    color: #4CAF50;
}

.item-value.gasto-value {
    color: red;
}

.item-value.economia-value {
    color: #2196F3;
}

.item-details {
    font-size: 0.9em;
    color: #bbb;
}

.form-section {
    background-color: #333;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
}

.add-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

input, textarea, select {
    padding: 10px;
    background-color: #444;
    border: 1px solid #555;
    color: #fff;
    border-radius: 4px;
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.submit-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.submit-button:hover {
    background-color: #45a049;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.section, .form-section {
    animation: fadeIn 0.5s ease-out;
}

.item {
    animation: fadeIn 0.3s ease-out;
}

/* Transitions */
.item, .action-button, .toggle-button, .submit-button {
    transition: all 0.3s ease;
}

.projection-section {
    margin-top: 2rem;
    margin-bottom: 2rem;
}

.projection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.projection-card {
    background-color: #2c2c2c;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.projection-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.month-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-bottom: 0.5rem;
}

.indicator-highest { background-color: #4CAF50; }
.indicator-high { background-color: #ffee07; }
.indicator-medium { background-color: #ff9100; }
.indicator-low { background-color: #F44336; }

.month-name {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.projection-value {
    font-size: 1.2rem;
    font-weight: bold;
}


.value-highest { color: #4CAF50; }
.value-high { color: #ffee07; }
.value-medium { color: #ff9100; }
.value-low { color: #F44336; }

/* Responsive design */
@media (max-width: 600px) {
    .money-manager {
        padding: 10px;
    }

    .button-group {
        flex-direction: column;
    }

    .action-button {
        width: 100%;
    }
}
</style>