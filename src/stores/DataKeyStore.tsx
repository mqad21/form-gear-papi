import { createStore } from "solid-js/store";

type DataKey = {
    currentDataKey: string
}

export const [dataKey, setDataKey] = createStore<DataKey>({
    currentDataKey: ""
});