"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBaseStore = void 0;
const tslib_1 = require("tslib");
const pinia_1 = require("pinia");
const vue_1 = require("vue");
const backend_1 = require("@/assets/plugins/backend");
exports.useBaseStore = (0, pinia_1.defineStore)('base', () => {
    const Rendas = (0, vue_1.ref)([]);
    const Economias = (0, vue_1.ref)([]);
    const Gastos = (0, vue_1.ref)([]);
    function fetchData(table) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            try {
                const response = yield backend_1.backend.get(`/get_data?table=${table}`);
                console.log('[fetchData] response: ', response);
                switch (table) {
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
            }
            catch (error) {
                console.error(`[fetchData] Erro fazendo o fetch na table: ${table} Error:`, error);
            }
        });
    }
    function initializeStore() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            console.group('[initializeStore] Atualizando Storage...');
            try {
                yield Promise.all([
                    fetchData("Rendas"),
                    fetchData("Economias"),
                    fetchData("Gastos"),
                ]);
                console.log(`Rendas: `, Rendas.value);
                console.log(`Economias: `, Economias.value);
                console.log(`Gastos: `, Gastos.value);
            }
            catch (error) {
                console.error('[initializeStore] Erro durante a atualização do Storage:', error);
            }
            finally {
                console.groupEnd();
            }
        });
    }
    return {
        initializeStore,
        fetchData,
        Rendas,
        Economias,
        Gastos
    };
});
//# sourceMappingURL=BaseStore.js.map