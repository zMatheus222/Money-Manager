import { defineStore } from "pinia";
import { ref } from 'vue';
import { backend } from "@/assets/plugins/backend";
import { Renda, Economia, Gasto } from "@/assets/plugins/classes"

export const useBaseStore = defineStore('base', () => {

    const Rendas = ref<Renda[]>([]);
    const Economias = ref<Economia[]>([]);
    const Gastos = ref<Gasto[]>([]);

    async function fetchData(table: 'Rendas' | 'Economias' | 'Gastos') {
        try {
            const response = await backend.get(`/get_data?table=${table}`);
            console.log('[fetchData] response: ', response);
            switch(table) {
                case "Rendas":
                    Rendas.value = response.data;
                    break;
                case "Economias":
                    Economias.value = response.data;
                    break;
                case "Gastos":
                    Gastos.value = response.data;
                    break;
                default:
                    console.error(`[fetchData] Erro ao tentar fazer o fetch na tabela: ${table}`);
            }
        } catch (error) {
            console.error(`[fetchData] Erro fazendo o fetch na table: ${table} Error:`, error);
        }
    }

    async function initializeStore() {
        console.group('[initializeStore] Atualizando Storage...');
        try {
            await Promise.all([
                fetchData("Rendas"),
                fetchData("Economias"),
                fetchData("Gastos"),
            ]);

            console.log(`Rendas: `, Rendas.value);
            console.log(`Economias: `, Economias.value);
            console.log(`Gastos: `, Gastos.value);
        } catch (error) {
            console.error('[initializeStore] Erro durante a atualização do Storage:', error);
        } finally {
            console.groupEnd();
        }
    }

    return {
        initializeStore,
        fetchData,
        Rendas,
        Economias,
        Gastos
    }

});