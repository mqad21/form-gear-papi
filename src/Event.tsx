import { ClientMode } from "./Constant";
import { scrollCenterInput } from "./GlobalFunction";
import { setDataKey } from "./stores/DataKeyStore";

export const handleInputFocus = (e, props: any) => {
    if (props.config.clientMode == ClientMode.PAPI) {
        const elem = props.isNestedInput ? e.target.offsetParent : e.target
        const scrollContainer = props.isNestedInput ? document.querySelector(".nested-container") as HTMLElement : null
        setDataKey('currentDataKey', props.component.dataKey)
        scrollCenterInput(elem, scrollContainer)
    }
}

export const handleInputKeyDown = (e, props) => {
    handleTabPress(e, props)
    handleEnterPress(e, props)
}

export const handleTabPress = (e, props) => {
    if (e.keyCode == 9) {

    }
}

export const handleEnterPress = (e, props) => {
    if (e.keyCode == 13) {
        if (e.shiftKey) {
            e.stopPropagation()
            return;
        }
        e.preventDefault();

        const inputs =
            Array.prototype.slice.call(document.querySelectorAll("input:not(:disabled),textarea:not(.hidden-input):not(:disabled)"))
        const index =
            (inputs.indexOf(document.activeElement) + 1) % inputs.length
        const input = inputs[index]

        input.focus()
        input.select()
    }
}