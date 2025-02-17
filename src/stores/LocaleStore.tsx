import { createStore } from "solid-js/store";
import { joinWords } from "../GlobalFunction";

export type Language = {
    addRow: string,
    componentAdded: string
    componentDeleted: string
    componentEdited: string
    componentEmpty: string
    componentNotAllowed: string
    componentRendered: string
    componentSelected: string
    fetchFailed: string
    fileInvalidFormat: string
    fileUploaded: string
    locationAcquired: string
    remarkAdded: string
    remarkEmpty: string
    submitEmpty: string
    submitInvalid: string
    submitWarning: string
    summaryAnswer: string
    summaryBlank: string
    summaryError: string
    summaryRemark: string
    validationMax: string
    validationMaxLength: string
    validationMin: string
    validationMinLength: string
    validationRequired: string
    verificationInvalid: string
    verificationSubmitted: string
    validationEmail: string
    validationInclude: (options: string[]) => string,
    validationDate: string
}

export type Locale = {
    language: Language[]
}

export interface Questionnaire {
    status: number
    details: Locale
}

export const [locale, setLocale] = createStore<Questionnaire>({
    status: 1,
    details: {
        language: [
            {
                addRow: "Add row",
                componentAdded: "The component was successfully added!",
                componentDeleted: "The component was successfully deleted!",
                componentEdited: "The component was successfully edited!",
                componentEmpty: "The component can not be empty",
                componentNotAllowed: "Only 1 component is allowed to edit",
                componentRendered: "Related components is rendering, please wait.",
                componentSelected: "This component has already being selected",
                fetchFailed: "Failed to fetch the data.",
                fileInvalidFormat: "Please submit the appropriate format!",
                fileUploaded: "File uploaded successfully!",
                locationAcquired: "Location successfully acquired!",
                remarkAdded: "The remark was successfully added!",
                remarkEmpty: "The remark can not be empty!",
                submitEmpty: "Please make sure your submission is fully filled",
                submitInvalid: "Please make sure your submission is valid",
                submitWarning: "The submission you are about to submit still contains a warning",
                summaryAnswer: "Answer",
                summaryBlank: "Blank",
                summaryError: "Error",
                summaryRemark: "Remark",
                validationMax: "The biggest value is",
                validationMaxLength: "The maximum of allowed character is",
                validationMin: "The smallest value is",
                validationMinLength: "The minimum of allowed character is",
                validationRequired: "Required",
                verificationInvalid: "Please provide verification correctly",
                verificationSubmitted: "The data is now being submitted. Thank you!",
                validationEmail: "Email is not correct",
                validationInclude: (options) => `Allowed values are ${joinWords(options, ", ", "or")}`,
                validationDate: "Invalid date format"
            }
        ]
    }
});