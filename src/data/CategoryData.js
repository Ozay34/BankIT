import {create} from "zustand";
import {combine, persist} from "zustand/middleware";

export const useCategoryData = create(persist(combine(
    {
        categories: [],
        caseSensitive: false
    },
    (set, get) => ({
        setCaseSensitive(val){
            set({caseSensitive: val})
        },
        addBlankCategory(){
            set((state) => ({
                categories: [...state.categories, {category: "", keywords: []}]
            }))
        },
        updateCategory(i, category){
            set((state) => {
                const copy = [...state.categories]
                copy[i].category = category
                return {categories: copy}
            })
        },
        removeCategory(i){
            set((state) => ({
                categories: [...state.categories.slice(0, i), ...state.categories.slice(i+1)]
            }))
        },
        addKeyword(i, keyword){
            if(keyword === "") return;
            set((state) => {
                const copy = [...state.categories]
                if(!copy[i].keywords.includes(keyword))
                    copy[i].keywords.push(keyword)
                return {categories: copy}
            })
        },
        removeKeyword(i, keyword){
            set((state) => {
                const copy = [...state.categories]
                copy[i].keywords = copy[i].keywords.filter((word) => word !== keyword)
                return {categories: copy}
            })
        }
    })),
    {
        name: "category-data"
    }
));