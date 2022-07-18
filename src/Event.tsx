import { ClientMode } from "./Constant";
import { saveCurrentFocus, scrollCenterInput } from "./GlobalFunction";

export const handleInputFocus = (e, props) => {
    if (props.config.clientMode == ClientMode.PAPI) {
        const elem = e.target
        saveCurrentFocus()
        scrollCenterInput(elem)
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