import { createStore } from "solid-js/store";
import { Validations } from "./ReferenceStore";

export type TestFunction = {
    dataKey: string;
    validations?: Validations[]
    componentValidation?: string[]
}

export type Detail = {
    description: string;
    dataKey: string;
    version: string;
    testFunctions: TestFunction[];
}
  
export interface Validation{
    status: number,
    details: Detail,
}

export const [validation, setValidation] = createStore<Validation>({
    status: 1,
    details: {
        description: '',
        dataKey: '',
        version: '',
        testFunctions: []
    },
});
