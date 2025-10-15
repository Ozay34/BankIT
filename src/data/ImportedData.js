import {create} from "zustand";
import {combine, persist} from "zustand/middleware";
import Papa from "papaparse";
import dayjs from "dayjs";

export const useExtractedData = () => {
    const header = useImportedData((state) => state.header);
    const dateColumn = useImportedData((state) => state.dateColumn);
    const descColumn = useImportedData((state) => state.descColumn);
    const expenseColumn = useImportedData((state) => state.expenseColumn);
    const incomeColumn = useImportedData((state) => state.incomeColumn);
    const dateFormat = useImportedData((state) => state.dateFormat);
    const negativeExpenses = useImportedData((state) => state.negativeExpenses);

    const data = useParsedData((state) => state.data);
    const failedRows = data.errors.map((error) => error.row)
    const parsedData = data.data

    function getColumn(row, i){
        if(!header) return row[i]

        const column = data.meta.fields[i]
        return row[column]
    }

    return parsedData.filter((row, i) => !failedRows.includes(i)).map((row) => ({
        date: dayjs(getColumn(row, dateColumn), dateFormat || undefined),
        description: getColumn(row, descColumn),
        expense: Number(getColumn(row, expenseColumn)) * (negativeExpenses ? -1 : 1),
        income: Number(getColumn(row, incomeColumn))
    }))
}

export const useParsedData = create(combine(
    {
        data: {},
        header: false
    },
    (set, get) => ({
        parseData(importedData){
            set({
                data: Papa.parse(importedData.raw, {header: importedData.header, delimiter: importedData.delim}),
                header: importedData.header
            });
        },
        getColumns(){
            const state = get();
            if(state.header) return state.data.meta.fields;
            return state.data.data.reduce((max, row) => (
                row.length > max ? row.length : max
            ), 0);
        }
    })
));

export const useImportedData = create(persist(combine(
    {
        raw: null,
        persist: false,
        delim: "",
        header: false,
        dateColumn: 0,
        descColumn: 0,
        expenseColumn: 0,
        incomeColumn: 0,
        dateFormat: "",
        negativeExpenses: false
    },
    (set, get) => ({
        setRaw(raw, persist){
            set({raw: raw, persist: persist});
            useParsedData.getState().parseData(get());
        },
        setDelim(delim){
            set({delim: delim});
            useParsedData.getState().parseData(get());
        },
        setHeader(header){
            set({header: header});
            useParsedData.getState().parseData(get());
        },
        setDateColumn(column){
            set({dateColumn: column})
        },
        setDescColumn(column){
            set({descColumn: column})
        },
        setExpenseColumn(column){
            set({expenseColumn: column})
        },
        setIncomeColumn(column){
            set({incomeColumn: column})
        },
        setDateFormat(format){
            set({dateFormat: format})
        },
        setNegativeExpenses(bool){
            set({negativeExpenses: bool})
        },
        isLoaded(){
            return get().raw != null;
        },
        clearData(){
            set({raw: null, persist: false})
        }
    })),
    {
        name: "imported-data",
        partialize: (state) => {
            if(state.persist) return state;
            return {...state, raw: null};
        },
        onRehydrateStorage: (state) => {
            return (state, error) => {
                if(state.isLoaded()) useParsedData.getState().parseData(state)
            }
        }
    }
));