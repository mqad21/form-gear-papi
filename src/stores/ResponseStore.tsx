import { createStore } from "solid-js/store";
import { Summary } from "./SummaryStore"

type Answer = {
    dataKey: string;
    answer: any;
}

type Detail = {
    description: string
    dataKey: string
    templateDataKey: string
    clientMode: number
    gearVersion: string
    templateVersion: string
    validationVersion: string
    docState?: string
    createdBy: string
    updatedBy: string
    createdAt: any
    updatedAt: any
    createdAtTimezone: string
    createdAtGMT: number
    updatedAtTimezone: string
    updatedAtGMT: number
    answers: Answer[]
    summary: Summary[]
}
  
export interface Response{
    status: number,
    details: Detail
}

export const [response, setResponse] = createStore<Response>({
    status: 1,
    details: {
        description: '',
        dataKey: '',
        templateDataKey: '',
        clientMode: 0,
        gearVersion: '',
        templateVersion: '',
        validationVersion: '',
        createdBy: '',
        updatedBy: '',
        createdAt: '',
        updatedAt: '',
        createdAtTimezone: '',
        createdAtGMT: null,
        updatedAtTimezone: '',
        updatedAtGMT: null,
        answers: [],
        summary: [],
    }
});

